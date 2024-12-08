const Table = require('../utils/template/Table');

const name = 'tb_ventas';
const columns = {
  id: { name: 'id', null: false, type: 'Integer', limit: 11 },
  transaccion_id: { name: 'transaccion_id', null: false, type: 'Integer', limit: 11 },
  producto_id: { name: 'producto_id', null: false, type: 'Integer', limit: 11 },
  cantidad: { name: 'cantidad', null: false, type: 'Integer', limit: 10 },
  importe: { name: 'importe ', null: false, type: 'Number', limit: 10 },
  descuento: { name: 'descuento ', null: false, type: 'Number', limit: 10 }
}

/**
 * @typedef {{
 *   id: number,
 *   transaccion_id: number,
 *   producto_id: number,
 *   cantidad: number,
 *   importe: number,
 *   descuento: number
 * }} COLUMNS_VENTAS
 */

/** @extends {Table<COLUMNS_VENTAS>} */
class Tb_ventas extends Table {
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
   * @returns {Promise<COLUMNS_VENTAS[]>}
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

        let [result] = await this.app.model.pool(query, queryParams);

        res(result[0].cantidad);
      } catch (e) {
        rej(e);
      }
    })
  }
  /**
   * @param {COLUMNS_VENTAS} data
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

        let [result] = await this.app.model.pool(`
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

        if (result.affectedRows)
          this.app.model.tb_productos.updateIdBussines(producto_id, {
            stock_disponible: -cantidad,
          })

        res(result)
      } catch (e) {
        rej(e);
      }
    })
  }
  /**
   * @param {...COLUMNS_VENTAS} datas
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

        let [result] = await this.app.model.pool(`
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

        if (result.affectedRows)
          for (let { producto_id, cantidad } of datas) {
            this.app.model.tb_productos.updateIdBussines(producto_id, {
              stock_disponible: -cantidad,
            })
          }

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

      let [result] = await this.app.model.pool(`
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

      let [result] = await this.app.model.pool(`
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

      let [result] = await this.app.model.pool(`
        SELECT
          v.id,
          tv.id AS transaccion_id,
          tv.codigo AS transaccion_codigo,
          p.id AS producto_id,
          p.producto AS producto_nombre,
          p.codigo AS producto_codigo,
          p.venta AS precio_venta,
          c.nombre AS categoria_nombre,
          v.cantidad,
          v.importe,
          v.descuento,
          DATE_FORMAT(tv.creacion, '%r') AS transaccion_hora
        FROM
          tb_transacciones_ventas AS tv
        INNER
          JOIN
            tb_ventas AS v
          ON
            v.transaccion_id = tv.id
        INNER
          JOIN
            tb_productos AS p
          ON
            v.producto_id = p.id
        INNER
          JOIN
            tb_categorias AS c
          ON
            p.categoria_id = c.id
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
   * @param {{
   *   producto_id: number,
   *   cantidad: number
   * }} data
   * @returns {Promise<import('mysql').OkPacket>}
   */
  updateId(id, data) {
    return new Promise(async (res, rej) => {
      try {
        this.constraint('id', id);

        let {
          producto_id,
          cantidad
        } = data,
          importe = 0;

        this.constraint('producto_id', producto_id);
        this.constraint('cantidad', cantidad);

        let currentProductoVenta = await this.readId(id)

        if (currentProductoVenta.producto_id == producto_id) {
          importe = cantidad * (currentProductoVenta.importe / currentProductoVenta.cantidad);

          if (currentProductoVenta.cantidad != cantidad)
            this.app.model.tb_productos.updateIdBussines(currentProductoVenta.producto_id, {
              stock_disponible: currentProductoVenta.cantidad - cantidad
            })
        }
        else {
          let selectedProduct = await this.app.model.tb_productos.readPriceId(Number(producto_id))
          importe = cantidad * selectedProduct.venta;

          this.app.model.tb_productos.updateIdBussines(currentProductoVenta.producto_id, {
            stock_disponible: currentProductoVenta.cantidad
          })

          this.app.model.tb_productos.updateIdBussines(producto_id, {
            stock_disponible: -cantidad
          })
        }

        let [result] = await this.app.model.pool(`
          UPDATE
            tb_ventas
          SET
            producto_id = ?,
            cantidad = ?,
            importe = ?
          WHERE
            id = ?;
        `, [
          producto_id,
          cantidad,
          importe,
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
            tb_ventas v
          ON
            p.id = v.producto_id
          SET
            p.stock_disponible = p.stock_disponible + v.cantidad
          WHERE
            v.id = ?;
        `, [
          id
        ]);

        let [result] = await this.app.model.pool(`
          DELETE FROM
            tb_ventas
          WHERE
            id = ?;
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

module.exports = Tb_ventas;