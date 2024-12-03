const mysql = require('mysql2/promise');

const { resolve } = require('path');
const { readFileSync } = require('fs');
const { exec } = require('child_process');

const mergeObjects = require('../utils/function/merge');

const Tb_usuarios = require('../model/Tb_usuarios');
const Tb_fotos = require('../model/Tb_fotos');
const Tb_acceso = require('../model/Tb_acceso');
const Tb_permisos = require('../model/Tb_permisos');
const Tb_menus = require('../model/Tb_menus');
const Tb_asistencias = require('../model/Tb_asistencias');
const Tb_categorias = require('../model/Tb_categorias');
const Tb_productos = require('../model/Tb_productos');
const Tb_clientes = require('../model/Tb_clientes');
const Tb_ventas = require('../model/Tb_ventas');
const Tb_transacciones_ventas = require('../model/Tb_transacciones_ventas');
const Tb_proveedores = require('../model/Tb_proveedores');
const Tb_compras = require('../model/Tb_compras');
const Tb_transacciones_compras = require('../model/Tb_transacciones_compras');
const Tb_Yapes = require('../model/Tb_Yapes');

const Tipo_roles = require('../model/Tipo_roles');
const Tipo_cliente = require('../model/Tipo_cliente');
const Tipo_proveedor = require('../model/Tipo_proveedor');
const Tipo_documento = require('../model/Tipo_documento');
const Tipo_metodo_pago = require('../model/Tipo_metodo_pago');

const DatabaseError = require('../utils/error/DataBase');
const QueryError = require('../utils/error/Query');

let typeConverters = {
  TINY: Number,
  SHORT: Number,
  LONG: Number,
  LONGLONG: Number,
  INT24: Number,

  FLOAT: Number,
  DOUBLE: Number,
  NEWDECIMAL: (val) => (val === null ? null : parseFloat(val)),

  STRING: String,
  VAR_STRING: String,
  BLOB: String,

  DATE: (val) => (val === null ? null : new Date(val)),
  DATETIME: (val) => (val === null ? null : new Date(val)),
  TIMESTAMP: (val) => (val === null ? null : new Date(val)),
  TIME: String,
  YEAR: Number,

  BIT: (val) => (val === null ? null : val === '\0' ? 0 : 1),
  GEOMETRY: (val) => val
};

class Model {
  mysql = mysql;
  estado = false;
  version = '1.0.0';

  /** @param {import('../app')} app */
  constructor(app) {
    this.app = app;
    this.#check();
    let cnfg = app.cache.configJSON.readJSON();

    this.tb_usuarios = new Tb_usuarios(app);
    this.tb_fotos = new Tb_fotos(app);
    this.tb_permisos = new Tb_permisos(app);
    this.tb_menus = new Tb_menus(app);
    this.tb_acceso = new Tb_acceso(app);
    this.tb_asistencias = new Tb_asistencias(app);
    this.tb_categorias = new Tb_categorias(app);
    this.tb_productos = new Tb_productos(app);
    this.tb_clientes = new Tb_clientes(app);
    this.tb_ventas = new Tb_ventas(app);
    this.tb_transacciones_ventas = new Tb_transacciones_ventas(app);
    this.tb_proveedores = new Tb_proveedores(app);
    this.tb_compras = new Tb_compras(app);
    this.tb_transacciones_compras = new Tb_transacciones_compras(app);
    this.tb_Yapes = new Tb_Yapes(app);

    this.tipo_roles = new Tipo_roles(app);
    this.tipo_cliente = new Tipo_cliente(app);
    this.tipo_proveedor = new Tipo_proveedor(app);
    this.tipo_documento = new Tipo_documento(app);
    this.tipo_metodo_pago = new Tipo_metodo_pago(app);


    this.poolQuery = mysql.createPool(
      mergeObjects({
        host: 'localhost',
        user: 'root',
        password: '',
        database: 'local',
        waitForConnections: true,
        connectionLimit: 10,
        queueLimit: 0,
        typeCast: (field, next) => {
          let value = field.string();
          if (value == null) return null;
          let converter = typeConverters[field.type];
          return converter ? converter(value) : next();
        },
      }, cnfg.DATABASE.production
      )
    );
  }

  async #check() {
    let cnfg = this.app.cache.configJSON.readJSON();
    let connection;

    try {
      connection = await mysql.createConnection({
        host: cnfg.DATABASE.owner.host,
        user: cnfg.DATABASE.owner.user,
        password: cnfg.DATABASE.owner.password
      });

      let [result] = await connection.query(`
          SELECT 
            schema_db.version AS version
          FROM 
            INFORMATION_SCHEMA.TABLES 
          LEFT 
            JOIN 
                ${cnfg.DATABASE.owner.database}.schema_db 
              ON 
                INFORMATION_SCHEMA.TABLES.TABLE_SCHEMA = '${cnfg.DATABASE.owner.database}'
          WHERE 
            INFORMATION_SCHEMA.TABLES.TABLE_SCHEMA = '${cnfg.DATABASE.owner.database}'
            AND INFORMATION_SCHEMA.TABLES.TABLE_NAME = 'schema_db'
        `)

      if (!result.length) {
        let sql_db = readFileSync(resolve('sql', 'start.sql'), 'utf-8');
        await connection.beginTransaction();
        await connection.query(`
          CREATE DATABASE rehf
          CHARACTER SET utf8
          COLLATE utf8_general_ci;
        `);
        await connection.query(sql_db);
        await connection.commit();
      }
    } catch (e) {
      await connection?.rollback();
    } finally {
      connection?.end();
    }

  }

  async _run() {
    try {
      await this.pool('SELECT 1');
      this.estado = true;
      this.app.logSuccess.writeStart(`[Sql] Listo: http://localhost/phpmyadmin/`);
    } catch (e) {
      this.estado = false;
      this.app.logError.writeStart(`[Sql] Error: _run`, e.message, e.stack);
    }
    return this.estado;
  }

  /**
   * Ejecuta una consulta con valores opcionales usando una conexión del pool
   * @param {string} query
   * @param {Array<string|number>} [values]
   * @returns {Promise<[import('mysql2').QueryResult, import('mysql2').FieldPacket[]]>}
   */
  async pool(query, values) {
    try {
      let connection = await this.poolQuery.getConnection();
      let res = values
        ? await connection.query(query, values)
        : await connection.query(query);
      connection.release();
      return res;
    } catch (err) {
      if (err.code) throw new QueryError(err);
      throw new DatabaseError(err);
    }
  }

  connection() {
    return this.poolQuery.getConnection();
  }

  /**
   * @returns {Promise<string>}
   */
  backup() {
    return new Promise((res, rej) => {
      let { user, password, database } = this.app.cache.configJSON.readJSON().DATABASE.owner;
      let fileBackup = resolve('.backup', 'sql', Date.now() + '.sql');

      exec(
        `mysqldump -u ${user} -p${password} ${database} > ${fileBackup}`,
        (err, stdout, stderr) => {
          if (err) return rej(`Error al ejecutar el comando: ${err.message}`);
          if (stderr) return rej(`Error en la salida estándar: ${stderr}`);
          res(fileBackup);
        }
      );
    });
  }

  /**
   * @param {string} filePath
   * @returns {Promise<string>}
   */
  restore(filePath) {
    return new Promise((resolve, reject) => {
      let { user, password, database } = this.app.cache.configJSON.readJSON().DATABASE.owner;

      exec(
        `mysql -u ${user} -p${password} ${database} < ${filePath}`,
        (err, stdout, stderr) => {
          if (err) return reject(`Error al ejecutar el comando: ${err.message}`);
          if (stderr) return reject(`Error en la salida estándar: ${stderr}`);
          resolve('Restauración completada.');
        }
      );
    });
  }
}

module.exports = Model;