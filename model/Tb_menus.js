const { Table } = require('../utils/UtilsModel');

const name = 'tb_menus'
const columns = {
  id: { name: 'id', null: false, type: 'Integer', limit: 11 },
  principal: { name: 'principal', null: false, type: 'String', limit: 20 },
  ruta: { name: 'ruta', null: false, type: 'String', limit: 100, unic: true }
}

/** 
 * @typedef {{
*   id: number,
*   principal: string,
*   ruta: string
* }} COLUMNS
*/

class Tb_menus extends Table {
  /** @param {import('../app')} app */  constructor(app) {
    super(name);
    this.columns = columns;
    this.app = app;
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
          principal,
          ruta
        } = data;

        this.constraint('principal', principal);
        this.constraint('ruta', ruta, { unic: true });

        let [result] = await this.app.model.poolValues(`
          INSERT INTO
            tb_menus (
              principal,
              ruta
            )
          VALUES (
            ?,
            ?
          )
        `, [
          principal,
          ruta
        ]);

        res(result);
      } catch (e) {
        rej(e);
      }
    })
  }
  /**
   * @param {number} id 
   * @param {{
   *   principal: string,
   *   ruta: string
   * }} data 
   * @returns {Promise<import('mysql').OkPacket>}
   */
  updateId(id, data) {
    return new Promise(async (res, rej) => {
      try {

        this.constraint('id', id);

        let {
          principal,
          ruta
        } = data;

        this.constraint('principal', principal);
        this.constraint('ruta', ruta, { unic: id });

        let [result] = await this.app.model.poolValues(`
           UPDATE 
             tb_menus
           SET
             principal = ?,
             ruta = ?
           WHERE 
             id = ?;
         `, [
          principal,
          ruta,
          id
        ]);

        res(result);
      } catch (e) {
        rej(e)
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
        this.constraint('id', id);

        let [result] = await this.app.model.poolValues(`
          DELETE FROM 
            tb_menus
          WHERE 
            id = ?
        `, [
          id
        ]);

        res(result)
      } catch (e) {
        rej(e)
      }
    })
  }
  /* 
    ====================================================================================================
    ============================================== Unicos ==============================================
    ====================================================================================================
  */
  /** 
   * @returns {Promise<COLUMNS[]>}
   */
  readAllUnique() {
    return new Promise(async (res, rej) => {
      try {
        let [result] = await this.app.model.pool(`
          SELECT 
            ruta
          FROM
            tb_menus
        `)

        res(result);
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
   * @returns {Promise<string>} */
  cardCount() {
    return new Promise(async (res, rej) => {
      try {
        let [result] = await this.app.model.pool(`
            SELECT 
              COALESCE(COUNT(id), 0) AS cantidad_menus
            FROM 
              tb_menus
          `)

        res(result[0].cantidad_menus);
      } catch (e) {
        rej(e);
      }
    })
  }
  /** 
   * @returns {Promise<string>} */
  cardCountBot() {
    return new Promise(async (res, rej) => {
      try {
        let [result] = await this.app.model.pool(`
            SELECT 
              COALESCE(COUNT(id), 0) AS cantidad_menus
            FROM 
              tb_menus
            WHERE
              principal = 'bot';
          `)

        res(result[0].cantidad_menus);
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
   * @returns {Promise<{label: string[], data: number[]}>}
   */
  chartMainPath() {
    return new Promise(async (res, rej) => {
      try {
        let [result] = await this.app.model.pool(`
          SELECT 
            principal,
            ruta
          FROM 
            tb_menus
          WHERE
            principal = 'bot';
        `)

        let label = [], data = [];

        result.forEach(({ ruta, principal }) => {
          label.push(ruta);
          data.push(principal);
        })

        res({ label, data });
      } catch (e) {
        rej(e);
      }
    })
  }
}

module.exports = Tb_menus;