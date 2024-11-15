const Table = require('../utils/template/Table');

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

/** @extends {Table<COLUMNS>} */
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
   * @param {SelectorRequest} option 
   * @returns {Promise<COLUMNS[]>}
   */
  SelectorInParts(option) {
    return new Promise(async (res, rej) => {
      try {
        let { order, start, length, search, byId, noInclude } = option;

        let query = `
          SELECT 
            id,
            nombre AS name
          FROM
            tipo_metodo_pago
        `, queryParams = [];

        let includeWhere = false;
        if (search) {
          if (byId) {
            query += `
              WHERE
                id = ?
            `;

            includeWhere = true;
            queryParams.push(search);
          }
          else {
            query += `
              WHERE
                nombre LIKE ?
            `;

            includeWhere = true;
            queryParams.push(`%${search}%`);
          }
        }

        if (noInclude.length && noInclude.every(id => typeof id == 'number')) {
          query += `
            ${includeWhere ? 'AND' : 'WHERE'}
              id NOT IN (${noInclude.map(_ => '?').join(',')})
          `
          queryParams.push(...noInclude);
        }

        if (order) {
          query += `
            ORDER BY
              nombre ${order == 'asc' ? 'ASC' : 'DESC'}
          `
        }

        query += `
          LIMIT ? OFFSET ?
        `;

        queryParams.push(length, start);

        let [result] = await this.app.model.poolValues(query, queryParams);

        res(result);
      } catch (e) {
        rej(e);
      }
    })
  }
  /**
   * @param {SelectorRequest} option 
   * @returns {Promise<number>}
   */
  SelectorInPartsCount(option) {
    return new Promise(async (res, rej) => {
      try {
        let { search, noInclude } = option;

        let query = `
          SELECT 
            COUNT(id) AS cantidad
          FROM
            tipo_metodo_pago
        `, queryParams = [];

        if (typeof search == 'string' && search != '') {
          query += `
            WHERE
              nombre LIKE ?
          `;

          queryParams.push(`%${search}%`);
        }

        if (noInclude.length && noInclude.every(id => typeof id == 'number')) {
          query += `
            WHERE
              id NOT IN (${noInclude.map(_ => '?').join(',')})
          `
          queryParams.push(...noInclude);
        }

        let [result] = await this.app.model.poolValues(query, queryParams);

        res(result[0].cantidad);
      } catch (e) {
        rej(e);
      }
    })
  }
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