const Table = require('../utils/template/Table');

const name = 'tb_ventas';
const columns = {
  id: { name: 'id', null: false, type: 'Integer', limit: 11 },
  transaccion_id: { name: 'transaccion_id', null: false, type: 'Integer', limit: 11 },
  producto_id: { name: 'producto_id', null: false, type: 'Integer', limit: 11 },
  cantidad: { name: 'cantidad', null: false, type: 'Integer', limit: 10 },
  compra: { name: 'compra ', null: false, type: 'Number', limit: 10, decima: 2 },
  venta: { name: 'venta ', null: false, type: 'Number', limit: 10, decima: 2 },
}

/** 
 * @typedef {{
 *   id: number,
 *   transaccion_id: number,
 *   producto_id: number,
 *   cantidad: number,
 *   compra: number,
 *   venta: number
 * }} COLUMNS_COMPRAS
 */

/** @extends {Table<COLUMNS_COMPRAS>} */
class tb_ventas extends Table {
  /** @param {import('../app')} app */
  constructor(app) {
    super(name);
    this.columns = columns;
    this.app = app;

    this.io = app.socket.node.selectNode('/control/movimientos/compras', true);
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
            c.id,
            tc.id AS transaccion_id,
            tc.codigo AS transaccion_codigo,
            pv.id AS proveedor_id,
            pv.titular AS proveedor_titular,
            p.id AS producto_id,
            p.producto AS producto_nombre,
            c.cantidad,
            c.compra,
            DATE_FORMAT(tc.creacion, '%r') AS transaccion_hora
          FROM
            tb_compras AS c
          INNER 
            JOIN tb_transacciones_compras AS tc
              ON c.transaccion_id = tc.id
          INNER 
            JOIN tb_productos AS p
              ON c.producto_id = p.id
          INNER 
            JOIN tb_proveedores AS pv
              ON tc.proveedor_id = pv.id
          WHERE 
            DATE(tc.creacion) = CURDATE()
            AND tc.usuario_id = ?
        `, queryParams = [usuario_id];

        if (search.value) {
          query += `
            AND tc.codigo LIKE ?
            OR pv.titular LIKE ?
            OR p.producto LIKE ?
            OR c.cantidad LIKE ?
            OR c.compra LIKE ?
            OR tc.creacion LIKE ?
          `;

          queryParams.push(
            `%${search.value}%`,
            `%${search.value}%`,
            `%${search.value}%`,
            `%${search.value}%`,
            `%${search.value}%`,
            `%${search.value}%`
          );
        }

        let columnsSet = new Set([
          'tc.codigo',
          'pv.titular',
          'p.producto',
          'c.cantidad',
          'c.compra',
          'tc.creacion'
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
   * @returns {Promise<COLUMNS_COMPRAS[]>}
   */
  readInPartsCount(option, usuario_id) {
    return new Promise(async (res, rej) => {
      try {
        let { search } = option;

        let query = `
          SELECT 
            COUNT(c.id) AS cantidad
          FROM
            tb_compras AS c
          INNER 
            JOIN tb_transacciones_compras AS tc
              ON c.transaccion_id = tc.id
          INNER 
            JOIN tb_productos AS p
              ON c.producto_id = p.id
          INNER 
            JOIN tb_proveedores AS pv
              ON tc.proveedor_id = pv.id
          WHERE 
            DATE(tc.creacion) = CURDATE()
            AND tc.usuario_id = ?
        `, queryParams = [usuario_id];

        if (search.value) {
          query += `
            AND tc.codigo LIKE ?
            OR pv.titular LIKE ?
            OR p.producto LIKE ?
            OR c.cantidad LIKE ?
            OR c.compra LIKE ?
            OR tc.creacion LIKE ?
          `;

          queryParams.push(
            `%${search.value}%`,
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
   * @param {COLUMNS_COMPRAS} data 
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
   * @param {...COLUMNS_COMPRAS} datas 
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
            precio_compra
          } = data;

          this.constraint('producto_id', producto_id);
          this.constraint('transaccion_id', transaccion_id);
          this.constraint('cantidad', cantidad);
          this.constraint('compra', precio_compra);
        })

        let values = datas
          .map(({ producto_id, transaccion_id, cantidad, precio_compra }) => [
            producto_id, transaccion_id, cantidad, precio_compra
          ])

        let [result] = await this.app.model.poolValues(`
          INSERT INTO
            tb_compras ( 
              producto_id,
              transaccion_id,
              cantidad,
              compra
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
   * @param {COLUMNS_COMPRAS} data 
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