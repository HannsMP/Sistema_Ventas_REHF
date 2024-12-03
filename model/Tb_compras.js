const Table = require('../utils/template/Table');

const name = 'tb_compras';
const columns = {
  id: { name: 'id', null: false, type: 'Integer', limit: 11 },
  transaccion_id: { name: 'transaccion_id', null: false, type: 'Integer', limit: 11 },
  producto_id: { name: 'producto_id', null: false, type: 'Integer', limit: 11 },
  cantidad: { name: 'cantidad', null: false, type: 'Integer', limit: 10 },
  compra: { name: 'compra ', null: false, type: 'Number', limit: 10, decima: 2 }
}

/**
 * @typedef {{
 *   id: number,
 *   transaccion_id: number,
 *   producto_id: number,
 *   cantidad: number,
 *   compra: number
 * }} COLUMNS_COMPRAS
 */

/** @extends {Table<COLUMNS_COMPRAS>} */
class Tb_compras extends Table {
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

        let [result] = await this.app.model.pool(query, queryParams);

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

        let [result] = await this.app.model.pool(query, queryParams);

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
          compra,
          cantidad,
          producto_id,
          transaccion_id
        } = data;

        console.log(data);

        this.constraint('compra', compra);
        this.constraint('cantidad', cantidad);
        this.constraint('producto_id', producto_id);
        this.constraint('transaccion_id', transaccion_id);

        let [result] = await this.app.model.pool(`
          INSERT INTO
            tb_compras (
              compra,
              cantidad,
              producto_id,
              transaccion_id
            )
          VALUES (
            ?,
            ?,
            ?,
            ?
          )
        `, [
          compra,
          cantidad,
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

        let [result] = await this.app.model.pool(`
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
   *   producto_id:number
   * }>}
   */
  readId(id) {
    return new Promise(async (res, rej) => {
      this.constraint('id', id)

      let [result] = await this.app.model.pool(`
        SELECT
        	cantidad,
          producto_id
        FROM
          tb_compras
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
   *   id:number,
   *   producto_id:number,
   *   cantidad:number,
   *   compra:number
   * }[]>}
   */
  readBusinessId(id) {
    return new Promise(async (res, rej) => {
      this.constraint('id', id)

      let [result] = await this.app.model.pool(`
        SELECT
          id,
          producto_id,
          cantidad,
          compra
        FROM
          tb_compras
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
      try {
        this.app.model.tb_transacciones_compras.constraint('id', transaccion_id)

        let [result] = await this.app.model.pool(`
          SELECT
            c.id,
            c.cantidad,
            c.compra,
            p.id AS producto_id,
            p.producto AS producto_nombre,
            p.codigo AS producto_codigo,
            ca.nombre AS categoria_nombre,
            (p.venta - c.compra) AS ganancia
          FROM
            tb_compras AS c
          INNER
            JOIN tb_transacciones_compras AS tc
              ON c.transaccion_id = tc.id
          INNER
            JOIN tb_productos AS p
              ON c.producto_id = p.id
          INNER
            JOIN tb_categorias AS ca
              ON p.categoria_id = ca.id
          WHERE
            tc.id = ?
        `, [
          transaccion_id
        ]);

        res(result)
      } catch (e) {
        rej(e)
      }

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
          producto_id,
          cantidad,
          compra
        } = data;

        this.constraint('producto_id', producto_id);
        this.constraint('cantidad', cantidad);
        this.constraint('compra', compra);

        let currentProductoCompra = await this.readId(id)

        if (currentProductoCompra.producto_id == producto_id) {

          if (currentProductoCompra.cantidad == cantidad)
            this.app.model.tb_productos.updateIdBussines(currentProductoCompra.producto_id, {
              stock_disponible: cantidad - currentProductoCompra.cantidad
            })
        }
        else {
          this.app.model.tb_productos.updateIdBussines(currentProductoCompra.producto_id, {
            stock_disponible: -currentProductoCompra.cantidad
          })

          this.app.model.tb_productos.updateIdBussines(producto_id, {
            stock_disponible: cantidad
          })
        }

        let [result] = await this.app.model.pool(`
          UPDATE
            tb_compras
          SET
            producto_id = ?,
            cantidad = ?,
            compra = ?
          WHERE
            id = ?;
        `, [
          producto_id,
          cantidad,
          compra,
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

        await this.app.model.pool(`
          UPDATE
            tb_productos p
          JOIN
            tb_compras v
          ON
            p.id = v.producto_id
          SET
            p.stock_disponible = p.stock_disponible - v.cantidad
          WHERE
            v.id = ?;
        `, [
          id
        ]);

        let [result] = await this.app.model.pool(`
          DELETE FROM
            tb_compras
          WHERE
            id = ?
        `, [
          id
        ]);

        if (result.affectedRows) this.app.model.tb_productos.io.emitSocket(
          '/productos/data/updateIdBussines',
          { id: false }
        )

        res(result)
      } catch (e) {
        rej(e)
      }
    })
  }
}

module.exports = Tb_compras;