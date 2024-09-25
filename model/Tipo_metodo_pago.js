const { Table } = require('../utils/UtilsModel');

const name = 'tipo_metodo_pago';
const columns = {
  id: { name: 'id', null: false, type: 'Integer', limit: 11 },
  nombre: { name: 'nombre', null: false, type: 'String', limit: 20 },
  contador: { name: 'contador', null: false, type: 'Integer', limit: 10 },
  igv: { name: 'igv ', null: false, type: 'Number', limit: 10 }
}

/** 
 * @typedef {{
 *   id: number,
 *   nombre: string,
 *   contador: number,
 *   igv: number
 * }} COLUMNS
 */

class Tipo_metodo_pago extends Table {
  /** @param {import('../app')} app */  constructor(app) {
    super(name);
    this.columns = columns;
    this.app = app;
  }
  /** 
   * @returns {Promise<COLUMNS>}
   */
  readId(id) {
    return new Promise(async (res, rej) => {
      try {

        this.constraint('id', id);

        let [result] = await this.app.model.poolValues(`
          SELECT
            nombre,
            contador,
            igv
          FROM
            tipo_metodo_pago
          WHERE
            id = ?;
        `, [
          id
        ]);

        if (!result.length)
          return rej(this.error(
            'RESPONSE_DATA_EMPTY',
            'No existe el metodo de pago.'
          ));

        res(result[0]);
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
            tipo_metodo_pago
        `)

        res(result);
      } catch (e) {
        rej(e);
      }
    })
  }
}

module.exports = Tipo_metodo_pago;