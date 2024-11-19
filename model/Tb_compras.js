const Table = require('../utils/template/Table');

const name = 'tb_ventas';
const columns = {
  id: { name: 'id', null: false, type: 'Integer', limit: 11 },
  transaccion_id: { name: 'transaccion_id', null: false, type: 'Integer', limit: 11 },
  producto_id: { name: 'producto_id', null: false, type: 'Integer', limit: 11 },
  cantidad: { name: 'cantidad', null: false, type: 'Integer', limit: 10 },
  importe: { name: 'importe ', null: false, type: 'Number', limit: 10 }
}

/** 
 * @typedef {{
 *   id: number,
 *   transaccion_id: number,
 *   producto_id: number,
 *   cantidad: number,
 *   importe: number,
 *   descuento: number
 * }} COLUMNS
 */

/** @extends {Table<COLUMNS>} */
class tb_ventas extends Table {
  /** @param {import('../app')} app */
  constructor(app) {
    super(name);
    this.columns = columns;
    this.app = app;

    this.io = app.socket.node.selectNode('/control/movimientos/ventas', true);
  }
  /* 
    ====================================================================================================
    =============================================== Tabla ===============================================
    ====================================================================================================
  */
  /**
   * @param {import('datatables.net-dt').AjaxData} option 
   * @param {number} usuario_id 
   * @returns {Promise<{
   *   id: number,
   *   transaccion_id: number,
   *   transaccion_codigo: string,
   *   producto_id: number,
   *   producto_nombre: string,
   *   cantidad: number,
   *   importe: number,
   *   descuento: number,
   *   transaccion_hora: string
   * }[]>}
   */
  readInParts(option, usuario_id) {
    return new Promise(async (res, rej) => {
      try {
        let { order, start, length, search } = option;

        let query = `
          SELECT 
            v.id,
            tv.id AS transaccion_id,
            tv.codigo AS transaccion_codigo,
            p.id AS producto_id,
            p.producto AS producto_nombre,
            v.cantidad,
            v.importe,
            v.descuento,
            DATE_FORMAT(tv.creacion, '%r') AS transaccion_hora
          FROM
            tb_ventas AS v
          INNER 
            JOIN tb_transacciones_ventas AS tv
              ON v.transaccion_id = tv.id
          INNER 
            JOIN tb_productos AS p
              ON v.producto_id = p.id
          WHERE 
            DATE(tv.creacion) = CURDATE()
            AND tv.usuario_id = ?
        `, queryParams = [usuario_id];

        if (search.value) {
          query += `
            AND p.producto LIKE ?
            OR v.cantidad LIKE ?
            OR v.importe LIKE ?
            OR v.descuento LIKE ?
            OR tv.creacion LIKE ?
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
          'p.producto',
          'v.cantidad',
          'v.importe',
          'v.descuento',
          'tv.creacion'
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

        let [result] = await this.app.model.poolValues(query, queryParams);

        res(result);
      } catch (e) {
        rej(e);
      }
    })
  }
  /**
   * @param {import('datatables.net-dt').AjaxData} option 
   * @param {number} usuario_id 
   * @returns {Promise<COLUMNS[]>}
   */
  readInPartsCount(option, usuario_id) {
    return new Promise(async (res, rej) => {
      try {
        let { search } = option;

        let query = `
          SELECT 
            COUNT(v.id) AS cantidad
          FROM
            tb_ventas AS v
          INNER 
            JOIN tb_transacciones_ventas AS tv
              ON v.transaccion_id = tv.id
          INNER 
            JOIN tb_clientes AS c
              ON tv.cliente_id = c.id
          INNER 
            JOIN tb_productos AS p
              ON v.producto_id = p.id
          WHERE 
            DATE(tv.creacion) = CURDATE()
            AND tv.usuario_id = ?
        `, queryParams = [usuario_id];

        if (search.value) {
          query += `
            AND p.producto LIKE ?
            OR v.cantidad LIKE ?
            OR v.importe LIKE ?
            OR v.descuento LIKE ?
            OR tv.creacion LIKE ?
          `;

          queryParams.push(
            `%${search.value}%`,
            `%${search.value}%`,
            `%${search.value}%`,
            `%${search.value}%`,
            `%${search.value}%`
          );
        }

        let [result] = await this.app.model.poolValues(query, queryParams);

        res(result[0].cantidad);
      } catch (e) {
        rej(e);
      }
    })
  }
  /** 
   * @param {COLUMNS} data 
   * @returns {Promise<import('mysql').OkPacket>}
   */
  insert(data) {
    return new Promise(async (res, rej) => {
      try {
        let {
          importe,
          cantidad,
          descuento,
          producto_id,
          transaccion_id,
        } = data;

        this.constraint('importe', importe);
        this.constraint('cantidad', cantidad);
        this.constraint('descuento', descuento);
        this.constraint('producto_id', producto_id);
        this.constraint('transaccion_id', transaccion_id);

        let [result] = await this.app.model.poolValues(`
          INSERT INTO
            tb_ventas ( 
              importe,
              cantidad,
              descuento,
              producto_id,
              transaccion_id
            )
          VALUES (
            ?,
            ?,
            ?,
            ?,
            ?
          )
        `, [
          importe,
          cantidad,
          descuento,
          producto_id,
          transaccion_id
        ]);

        res(result)
      } catch (e) {
        rej(e);
      }
    })
  }
  /** 
   * @param {...COLUMNS} datas 
   * @returns {Promise<import('mysql').OkPacket>}
   */
  inserts(...datas) {
    return new Promise(async (res, rej) => {
      try {
        datas.forEach(data => {
          let {
            producto_id,
            transaccion_id,
            cantidad,
            importe,
            descuento
          } = data;

          this.constraint('producto_id', producto_id);
          this.constraint('transaccion_id', transaccion_id);
          this.constraint('cantidad', cantidad);
          this.constraint('importe', importe);
          this.constraint('descuento', descuento);
        })

        let values = datas
          .map(({ producto_id, transaccion_id, cantidad, importe, descuento }) => [
            producto_id, transaccion_id, cantidad, importe, descuento
          ])

        let [result] = await this.app.model.poolValues(`
          INSERT INTO
            tb_ventas ( 
              producto_id,
              transaccion_id,
              cantidad,
              importe,
              descuento
            )
          VALUES ?
        `, [
          values
        ]);

        res(result)
      } catch (e) {
        rej(e);
      }
    })
  }
  /**
   * @param {number} id
   * @returns {Promise<{
   *   cantidad:number,
   *   producto_id:number,
   *   importe:number
   * }>}
   */
  readId(id) {
    return new Promise(async (res, rej) => {
      this.constraint('id', id)

      let [result] = await this.app.model.poolValues(`
        SELECT 
        	cantidad,
          producto_id,
          importe
        FROM 
          tb_ventas
        WHERE
          id = ?
      `, [
        id
      ]);

      res(result[0])
    })
  }
  /**
   * @param {number} id
   * @returns {Promise<{
   *   cantidad:number, 
   *   producto_codigo:string, 
   *   importe:number
   * }>}
   */
  readJoinId(id) {
    return new Promise(async (res, rej) => {
      this.constraint('id', id)

      let [result] = await this.app.model.poolValues(`
        SELECT 
        	v.cantidad,
          p.codigo AS producto_codigo,
          v.importe
        FROM 
          tb_ventas AS v
        INNER 
          JOIN tb_productos AS p
            ON 
              p.id = v.producto_id
        WHERE
          v.id = ?
      `, [
        id
      ]);

      res(result[0])
    })
  }
  /**
   * @param {...number} ids 
   * @returns {Promise<{
   *   cantidad:number, 
   *   importe:number
   * }[]>}
   */
  readIds(...ids) {
    return new Promise(async (res, rej) => {
      ids.forEach(id => this.constraint('id', id));

      let [result] = await this.app.model.poolValues(`
        SELECT 
        	cantidad,
          importe
        FROM 
          tb_ventas
        WHERE
          transaccion_id IN (${ids.map(_ => '?').join(',')})
      `,
        ids
      );

      res(result)
    })
  }
  /**
   * @param {...number} ids 
   * @returns {Promise<{
   *   cantidad:number, 
   *   producto_codigo:string, 
   *   importe:number
   * }[]>}
   */
  readJoinIds(...ids) {
    return new Promise(async (res, rej) => {
      ids.forEach(id => this.constraint('id', id));

      let [result] = await this.app.model.poolValues(`
        SELECT 
        	v.cantidad,
          p.codigo AS producto_codigo,
          v.importe
        FROM 
          tb_ventas AS v
        INNER 
          JOIN tb_productos AS p
            ON 
              p.id = v.producto_id
        WHERE
          v.transaccion_id IN (${ids.map(_ => '?').join(',')})
        `,
        ids
      );

      res(result)
    })
  }
  /**
   * @param {number} id
   * @returns {Promise<{
   *   id:number,
   *   producto_id:number,
   *   cantidad:number, 
   *   descuento:number, 
   *   importe:number
   * }[]>}
   */
  readBusinessId(id) {
    return new Promise(async (res, rej) => {
      this.constraint('id', id)

      let [result] = await this.app.model.poolValues(`
        SELECT 
          id,
          cantidad,
          producto_id,
          descuento,
          importe
        FROM 
          tb_ventas
        WHERE
          transaccion_id = ?
      `, [
        id
      ]);

      res(result)
    })
  }
  /**
   * @param {number} transaccion_id
   * @returns {Promise<{
   *   id: number,
   *   transaccion_id: number,
   *   transaccion_codigo: string,
   *   producto_id: number,
   *   producto_nombre: string,
   *   cantidad: number,
   *   importe: number,
   *   descuento: number,
   *   transaccion_hora: string
   * }[]>}
   */
  readBusinessJoinId(transaccion_id) {
    return new Promise(async (res, rej) => {
      this.app.model.tb_transacciones_ventas.constraint('id', transaccion_id)

      let [result] = await this.app.model.poolValues(`
        SELECT 
          v.id,
          tv.id AS transaccion_id,
          tv.codigo AS transaccion_codigo,
          p.id AS producto_id,
          p.producto AS producto_nombre,
          v.cantidad,
          v.importe,
          v.descuento,
          DATE_FORMAT(tv.creacion, '%r') AS transaccion_hora
        FROM
          tb_ventas AS v
        INNER 
          JOIN tb_transacciones_ventas AS tv
            ON v.transaccion_id = tv.id
        INNER 
          JOIN tb_productos AS p
            ON v.producto_id = p.id
        WHERE
          tv.id = ?
      `, [
        transaccion_id
      ]);

      res(result)
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
        this.constraint('id', id);

        let {
          importe,
          producto_id,
          cantidad
        } = data;

        this.constraint('producto_id', producto_id);
        this.constraint('cantidad', cantidad);

        let [result] = await this.app.model.poolValues(`
          UPDATE
            tb_ventas
          SET
            importe = ?,
            producto_id = ?,
            cantidad = ?
          WHERE 
            id = ?;
        `, [
          importe,
          producto_id,
          cantidad,
          id
        ]);

        res(result)
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
            tb_ventas 
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
}

module.exports = tb_ventas;