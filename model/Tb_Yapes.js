const Table = require('../utils/template/Table');

const name = 'tb_yapes'
const columns = {
  id: { name: 'id', null: false, type: 'Integer', limit: 11 },
  hash: { name: 'hash', null: false, type: 'String', limit: 64, unic: true },
  emisor: { name: 'emisor', null: false, type: 'String', limit: 50 },
  receptor: { name: 'receptor', null: false, type: 'String', limit: 50 },
  monto: { name: 'monto', null: false, type: 'Number', limit: 10, decimal: 2 },
  fecha: { name: 'fecha', null: false, type: 'String', limit: 25 },
  mensaje: { name: 'mensaje', null: false, type: 'String', limit: 250 }
}

/**
 * @typedef {{
 *   id: number,
 *   emisor: string,
 *   receptor: string,
 *   monto: number,
 *   fecha: string,
 *   mensaje: string
 * }} COLUMNS_VYAPES
 */

/** @extends {Table<COLUMNS_VYAPES>} */
class Tb_Yapes extends Table {
  /** @param {import('../app')} app */
  constructor(app) {
    super(name);
    this.columns = columns;
    this.app = app;

    this.io = app.socket.node.selectNode('/control/reportes/yapes', true);
  }
  /*
    ====================================================================================================
    =============================================== Tabla ===============================================
    ====================================================================================================
  */
  /**
   * @param {import('datatables.net-dt').AjaxData} option
   * @returns {Promise<COLUMNS_VYAPES[]>}
   */
  readInParts(option) {
    return new Promise(async (res, rej) => {
      try {
        let { order, start, length, search } = option;

        let query = `
          SELECT
            *
          FROM
            tb_yapes AS y
        `, queryParams = [];

        if (search.value) {
          query += `
            WHERE
              y.emisor LIKE ?
              OR y.receptor LIKE ?
              OR y.monto LIKE ?
              OR y.mensaje LIKE ?
              OR y.fecha LIKE ?
          `;

          queryParams.push(
            `%${search.value}%`,
            `%${search.value}%`,
            `%${search.value}%`,
            `%${search.value}%`,
            `%${search.value}%`
          );
        }

        let columnsSet = new Set([
          'y.emisor',
          'y.receptor',
          'y.monto',
          'y.mensaje',
          'y.fecha'
        ]);

        order = order.filter(d => columnsSet.has(d.name));

        if (order?.length) {
          query += `
            ORDER BY
          `
          order.forEach(({ dir, name }, index) => {
            query += `
              ${name} ${dir == 'asc' ? 'ASC' : 'DESC'}`;

            if (index < order.length - 1)
              query += ', ';
          })
        }

        query += `
          LIMIT ? OFFSET ?
        `;
        queryParams.push(length, start);

        let [result] = await this.app.model.pool(query, queryParams);

        res(result);
      } catch (e) {
        rej(e);
      }
    })
  }
  /**
   * @param {import('datatables.net-dt').AjaxData} option
   * @returns {Promise<COLUMNS_VYAPES[]>}
   */
  readInPartsCount(option) {
    return new Promise(async (res, rej) => {
      try {
        let { search } = option;

        let query = `
          SELECT
            COUNT(y.id) AS cantidad
          FROM
            tb_yapes AS y
        `, queryParams = [];

        if (search.value) {
          query += `
            WHERE
              y.emisor LIKE ?
              OR y.receptor LIKE ?
              OR y.monto LIKE ?
              OR y.mensaje LIKE ?
              OR y.fecha LIKE ?
          `;

          queryParams.push(
            `%${search.value}%`,
            `%${search.value}%`,
            `%${search.value}%`,
            `%${search.value}%`,
            `%${search.value}%`
          );
        }

        let [result] = await this.app.model.pool(query, queryParams);

        res(result[0].cantidad);
      } catch (e) {
        rej(e);
      }
    })
  }
}

module.exports = Tb_Yapes;