const Table = require('../utils/template/Table');

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
* }} COLUMNS_MENUS
*/

/** @extends {Table<COLUMNS_MENUS>} */
class Tb_menus extends Table {
  /** @param {import('../app')} app */  constructor(app) {
    super(name);
    this.columns = columns;
    this.app = app;

    this.io = app.socket.node.selectNode('/control/administracion/acceso', true);
  }
  /*
    ====================================================================================================
    =============================================== Tabla ===============================================
    ====================================================================================================
  */
  /**
   * @param {import('datatables.net-dt').AjaxData} option
   * @returns {Promise<COLUMNS_ACCESOS[]>}
   */
  readInParts(option) {
    return new Promise(async (res, rej) => {
      try {
        let { order, start, length, search } = option;

        let query = `
          SELECT
            *
          FROM
            tb_menus
        `, queryParams = [];

        if (search.value) {
          query += `
            WHERE
              ruta LIKE ?
              OR principal LIKE ?
          `;

          queryParams.push(
            `%${search.value}%`,
            `%${search.value}%`
          );
        }

        let columnsSet = new Set([
          'ruta',
          'principal'
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
   * @returns {Promise<number>}
   */
  readInPartsCount(option) {
    return new Promise(async (res, rej) => {
      try {
        let { search } = option;

        let query = `
          SELECT
            COUNT(id) AS cantidad
          FROM
            tb_menus
        `, queryParams = [];

        if (search.value) {
          query += `
              WHERE
                ruta LIKE ?
                OR principal LIKE ?
            `;

          queryParams.push(
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
  /**
   * @param {COLUMNS_MENUS} data
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

        let [result] = await this.app.model.pool(`
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

        this.io.sockets.emit(
          '/menu/data/insert',
          {
            id: result.insertId,
            principal,
            ruta
          }
        )

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

        let [result] = await this.app.model.pool(`
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

        this.io.sockets.emit(
          '/menu/data/updateId',
          {
            id,
            principal,
            ruta
          }
        )

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

        let [result] = await this.app.model.pool(`
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
}

module.exports = Tb_menus;