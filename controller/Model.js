const mysql = require('mysql');
const { resolve } = require('path');
const { exec } = require('child_process');

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

const Tipo_rol = require('../model/Tipo_rol');
const Tipo_cliente = require('../model/Tipo_cliente');
const Tipo_proveedor = require('../model/Tipo_proveedor');
const Tipo_documento = require('../model/Tipo_documento');
const Tipo_metodo_pago = require('../model/Tipo_metodo_pago');

const DatabaseError = require('../utils/error/DataBase');
const QueryError = require('../utils/error/Query');

/** @typedef {{affectedRows:number, changedRows:number, fieldCount:number, insertId: number, message:string, protocol41:boolean, serverStatus:number|undefined, warningCount: number|undefined}} okPacket */

/** @typedef {string | number} values */
/** @typedef {{[column: string]: values}} columns */
/** @typedef {columns[] & import('mysql').OkPacket} result */

class Model {
  estado = false;
  /** @param {import('../app')} app */
  constructor(app) {
    this.app = app;
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

    this.tipo_rol = new Tipo_rol(app);
    this.tipo_cliente = new Tipo_cliente(app);
    this.tipo_proveedor = new Tipo_proveedor(app);
    this.tipo_documento = new Tipo_documento(app);
    this.tipo_metodo_pago = new Tipo_metodo_pago(app);

    let cnfg = app.cache.configJSON.readJSON();

    this.poolQuery = mysql.createPool(cnfg.DATABASE.production);
  }
  async _run() {
    try {
      await this.pool('select "1"');
      this.estado = true;
      this.app.logSuccess.writeStart(`[Sql] Listo: http://localhost/phpmyadmin/`);
    } catch (e) {
      this.estado = false;
      this.app.logError.writeStart(`[Sql] Error: _run`, e.message, e.stack);
    }

    return this.estado;
  }
  /** 
   * @param {string} query 
   * @returns {Promise<[result, import('mysql').FieldInfo]>} 
   */
  pool(query) {
    return new Promise((res, rej) => {
      try {
        this.poolQuery.query(query, (err, result, field) => {
          if (err) {
            if (err.code) return rej(new QueryError(err));
            return rej(new DatabaseError(err));
          }
          res([result, field]);
        });
      } catch (e) {
        rej(e);
      }
    });
  }
  /** 
   * @param {string} query 
   * @param {Array<string|number>} values 
   * @returns {Promise<[result, import('mysql').FieldInfo]>} 
   */
  poolValues(query, values) {
    return new Promise((res, rej) => {
      try {
        this.poolQuery.query(query, values, (err, result, field) => {
          if (err) {
            if (err.code) return rej(new QueryError(err));
            return rej(new DatabaseError(err));
          }
          res([result, field]);
        });
      } catch (e) {
        rej(e);
      }
    });
  }

  closePool() {
    return new Promise((res, rej) => {
      this.poolQuery.end(err => {
        if (err) {
          if (err.code) return rej(new QueryError(err));
          return rej(new DatabaseError(err));
        }
        res();
      });
    });
  }
  /**
   * @param {string} query 
   * @param {columns | values[] | (values[])[] | columns[]} [values] 
   * @param {boolean} [stringifyObjects] 
   * @param {string} [timeZone] 
   */
  format(query, values, stringifyObjects, timeZone) {
    return mysql.format(query, values, stringifyObjects, timeZone);
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
      )
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
        });
    });
  }

}

module.exports = Model;