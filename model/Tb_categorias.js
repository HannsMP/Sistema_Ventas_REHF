const generateUniqueId = require('generate-unique-id');
const { Table } = require('../utils/UtilsModel');
const EmitSet = require('../utils/emitSet');

const name = 'tb_categorias';
const columns = {
  id: { name: 'id', null: false, type: 'Integer', limit: 11 },
  nombre: { name: 'nombre', null: false, type: 'String', limit: 50, unic: true },
  codigo: { name: 'codigo', null: false, type: 'String', limit: 10 },
  descripcion: { name: 'descripcion', null: true, type: 'String', limit: 250 },
  creacion: { name: 'creacion', null: false, type: 'String', limit: 25 },
  estado: { name: 'estado', null: false, type: 'Integer', limit: 1 }
}

/** 
 * @typedef {{
 *   id: number,
 *   nombre: string,
 *   codigo: string,
 *   descripcion: string,
 *   creacion: string,
 *   estado: number
 * }} COLUMNS
 */

class Tb_categorias extends Table {
  /** @param {import('../app')} app */
  constructor(app) {
    super(name);
    this.columns = columns;
    this.app = app;

    this.io = new EmitSet([
      '/control/productos',
      '/control/mantenimiento/categorias',
      '/control/mantenimiento/inventario',
    ], app)
  }
  /* 
    ====================================================================================================
    =============================================== Tabla ===============================================
    ====================================================================================================
  */
  /** 
   * @param {COLUMNS} data 
   * @returns {Promise<import('mysql').OkPacket>}
   */
  insert(data) {
    return new Promise(async (res, rej) => {
      try {
        let {
          nombre,
          codigo,
          descripcion,
          estado = 1
        } = data;

        this.constraint('nombre', nombre, { unic: true });
        this.constraint('codigo', codigo);
        this.constraint('descripcion', descripcion);
        this.constraint('estado', estado);

        let [result] = await this.app.model.poolValues(`
          INSERT INTO
            tb_categorias (
              nombre,
              codigo,
              descripcion,
              estado
            )
          VALUES (
            ?,
            ?,
            ?,
            ?
          )
        `, [
          nombre,
          codigo,
          descripcion,
          estado
        ]);

        this.io.emit(
          '/categorias/data/insert',
          {
            id: result.insertId,
            codigo,
            descripcion,
            estado,
            nombre
          }
        )

        res(result)
      } catch (e) {
        rej(e);
      }
    })
  }
  /**
   * @returns {Promise<COLUMNS[]>}
   */
  readAll() {
    return new Promise(async (res, rej) => {
      try {
        let [result] = await this.app.model.pool(`
          SELECT 
            *
          FROM
            tb_categorias
        `);

        res(result);
      } catch (e) {
        rej(e);
      }
    })
  }
  /** 
   * @returns {Promise<COLUMNS[]>}
   */
  readCountAll() {
    return new Promise(async (res, rej) => {
      try {
        let [result] = await this.app.model.pool(`
          SELECT 
            c.id,
            c.nombre,
            c.codigo,
            c.descripcion,
            c.creacion,
            c.estado,
            COALESCE(COUNT(p.id), 0) AS producto_cantidad
          FROM
            tb_categorias AS c
          LEFT JOIN
            tb_productos AS p
            ON p.categoria_id = c.id
          GROUP BY
            c.id;
        `);

        res(result);
      } catch (e) {
        rej(e);
      }
    })
  }
  /**
   * @param {number} id 
   * @returns {Promise<COLUMNS>}
   */
  readCountId(id) {
    return new Promise(async (res, rej) => {
      try {

        this.constraint('id', id);

        let [result] = await this.app.model.poolValues(`
          SELECT 
            c.id,
            c.nombre,
            c.codigo,
            c.descripcion,
            c.creacion,
            c.estado,
            COALESCE(COUNT(p.id), 0) AS producto_cantidad
          FROM
            tb_categorias AS c
          LEFT JOIN
            tb_productos AS p
            ON p.categoria_id = c.id
          WHERE
            c.id = ?
          GROUP BY
            c.id;
        `, [
          id
        ]);

        res(result[0]);
      } catch (e) {
        rej(e);
      }
    })
  }
  /** 
   * @param {number} id 
   * @returns {Promise<COLUMNS>}
   */
  readId(id) {
    return new Promise(async (res, rej) => {
      try {

        this.constraint('id', id);

        let [result] = await this.app.model.poolValues(`
          SELECT
            *
          FROM
            tb_categorias
          WHERE
            id = ?
        `, [
          id
        ]);

        let data = result[0];

        res(data);
      } catch (e) {
        rej(e);
      }
    })
  }
  /** 
   * @param {number} id 
   * @param {COLUMNS} data 
   * @returns {Promise<import('mysql').OkPacket>}
   */
  updateId(id, data) {
    return new Promise(async (res, rej) => {
      try {
        let {
          nombre,
          descripcion
        } = data;

        this.constraint('id', id);
        this.constraint('nombre', nombre, { unic: id });
        this.constraint('descripcion', descripcion);

        let [result] = await this.app.model.poolValues(`
          UPDATE 
            tb_categorias
          SET
            nombre = ?,
            descripcion = ?
          WHERE 
            id = ?
        `, [
          nombre,
          descripcion,
          id
        ]);

        this.io.emit(
          '/categorias/data/updateId',
          {
            id,
            nombre,
            descripcion
          }
        )

        res(result)
      } catch (e) {
        rej(e);
      }
    })
  }
  /** 
   * @param {number} id 
   * @param {number} estado 
   * @returns {Promise<import('mysql').OkPacket>}
   */
  updateIdState(id, estado) {
    return new Promise(async (res, rej) => {
      try {
        this.constraint('id', id);
        this.constraint('estado', estado);

        let [result] = await this.app.model.poolValues(`
          UPDATE 
            tb_categorias
          SET
            estado = ?
          WHERE 
            id = ?;
        `, [
          estado,
          id
        ]);

        this.io.emit(
          '/categorias/data/state',
          estado
            ? _ => this.readId(id)
            : { id, estado }
        )

        res(result)
      } catch (e) {
        rej(e);
      }
    })
  }
  /** 
   * @param {number} id 
   * @returns {Promise<import('mysql').OkPacket>}
   */
  deleteId(id) {
    return new Promise(async (res, rej) => {
      try {

        let [result] = await this.app.model.poolValues(`
          DELETE FROM 
            tb_categorias 
          WHERE 
            id = ?
        `, [
          id
        ]);

        this.io.emit(
          '/categorias/data/deleteId',
          { id }
        )

        res(result)
      } catch (e) {
        rej(e);
      }
    })
  }
  /** 
   * @param {number} id 
   * @returns {Promise<import('mysql').OkPacket>}
   */
  deleteAllId(id) {
    return new Promise(async (res, rej) => {
      try {
        this.constraint('id', id);

        await this.app.model.poolValues(`
          DELETE FROM 
            tb_productos
          WHERE 
            categoria_id = ?
        `, [
          id
        ]);

        let [result] = await this.app.model.poolValues(`
          DELETE FROM 
            tb_categorias 
          WHERE 
            id = ?
        `, [
          id
        ]);

        this.app.socket.routes.productos.emit(
          '/productos/categorias/deleteId',
          { id }
        )
        this.io.emit(
          '/categorias/data/deleteId',
          { id }
        )

        res(result)
      } catch (e) {
        rej(e);
      }
    })
  }
  /* 
    ====================================================================================================
    ============================================== Selector ==============================================
    ====================================================================================================
  */
  /** 
   * @returns {Promise<Array.<{code: string, name: string}>>}
   */
  selectorReadAll() {
    return new Promise(async (res, rej) => {
      try {
        let [result] = await this.app.model.pool(`
          SELECT 
            id,
            nombre AS name
          FROM
            tb_categorias
          WHERE
            estado = 1  
        `)

        res(result);
      } catch (e) {
        rej(e);
      }
    })
  }
  /* 
    ====================================================================================================
    ============================================== codigo ==============================================
    ====================================================================================================
  */
  /** 
   * @returns {Promise<string>}
   */
  getCodigo() {
    return new Promise(async (res, rej) => {
      try {
        let existKey = 1, uniqueKey = '';

        while (existKey) {
          uniqueKey = 'T'
            + generateUniqueId({ length: 4, useLetters: true, useNumbers: false })
              .toUpperCase();

          let [result] = await this.app.model.poolValues(`
          SELECT 
              1
          FROM 
            tb_categorias
          WHERE 
              codigo = ?
          `, [
            uniqueKey
          ])

          existKey = result[0] ? 1 : 0;
        }

        res(uniqueKey)
      } catch (e) {
        rej(e);
      }
    })
  }
  /* 
    ====================================================================================================
    ============================================== Cards ==============================================
    ====================================================================================================
  */
  /** 
   * @returns {Promise<string>}
   */
  cardLastCreation() {
    return new Promise(async (res, rej) => {
      try {
        let [result] = await this.app.model.pool(`
          SELECT 
            MAX(STR_TO_DATE(creacion, '%Y-%m-%d')) AS max_creacion
          FROM 
            tb_categorias
          WHERE
            estado = 1
        `)

        res(result[0].max_creacion);
      } catch (e) {
        rej(e);
      }
    })
  }
  /** 
   * @returns {Promise<string>}
   */
  cardCount() {
    return new Promise(async (res, rej) => {
      try {
        let [result] = await this.app.model.pool(`
            SELECT 
              COALESCE(COUNT(id), 0) AS cantidad_accesos
            FROM 
              tb_categorias
            WHERE
              estado = 1
          `)

        res(result[0].cantidad_accesos);
      } catch (e) {
        rej(e);
      }
    })
  }
  /* 
    ====================================================================================================
    ============================================== Grafico ==============================================
    ====================================================================================================
  */
  /** 
   * @returns {Promise<COLUMNS[]>}
   */
  chartCountCategory() {
    return new Promise(async (res, rej) => {
      try {
        let [result] = await this.app.model.pool(`
          SELECT 
            c.nombre AS categoria_nombre,
            COALESCE(COUNT(p.id), 0) AS cantidad_productos
          FROM 
            tb_categorias AS c
          LEFT JOIN 
            tb_productos AS p
            ON 
              p.categoria_id = c.id
          WHERE
            c.estado = 1
            AND p.estado = 1
          GROUP BY 
            c.nombre;
          `)

        let label = [], data = [];

        result.forEach(({ categoria_nombre, cantidad_productos }) => {
          label.push(categoria_nombre);
          data.push(cantidad_productos);
        })

        res({ label, data });
      } catch (e) {
        rej(e);
      }
    })
  }
}

module.exports = Tb_categorias;