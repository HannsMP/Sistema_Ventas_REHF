const Table = require('../utils/template/Table');
const Id = require('../utils/Id');

const name = 'tb_transacciones_compras';
const columns = {
  id: { name: 'id', null: false, type: 'Integer', limit: 11 },
  codigo: { name: 'codigo ', null: false, type: 'String', limit: 50 },
  proveedor_id: { name: 'proveedor_id', null: false, type: 'Integer', limit: 11 },
  usuario_id: { name: 'usuario_id', null: false, type: 'Integer', limit: 11 },
  importe_total: { name: 'importe_total ', null: false, type: 'Number', limit: 10, decimal: 2 },
  metodo_pago_id: { name: 'metodo_pago_id', null: false, type: 'Integer', limit: 11 },
  serie: { name: 'serie', null: true, type: 'String', limit: 20 },
  creacion: { name: 'creacion', null: false, type: 'String', limit: 25 }
}

/**
 * @typedef {{
 *   id: number,
 *   codigo: string,
 *   proveedor_id: number,
 *   usuario_id: number,
 *   importe_total: number,
 *   metodo_pago_id: number,
 *   serie: string,
 *   creacion: string
 * }} COLUMNS_TRANSACCIONES_COMPRAS
 */

/** @extends {Table<COLUMNS_TRANSACCIONES_COMPRAS>} */
class Tb_transacciones_compras extends Table {
  id = new Id('B        ', { letters: true, numeric: true });

  /** @param {import('../app')} app */
  constructor(app) {
    super(name);
    this.columns = columns;
    this.app = app;

    this.io = app.socket.node.selectNode('/control/reportes/compras', true);
  }
  /*
    ====================================================================================================
    =============================================== Tabla ===============================================
    ====================================================================================================
  */
  /**
   * @param {import('datatables.net-dt').AjaxData} option
   * @returns {Promise<COLUMNS_TRANSACCIONES_COMPRAS[]>}
   */
  readInParts(option) {
    return new Promise(async (res, rej) => {
      try {
        let { order, start, length, search } = option;

        let query = `
          SELECT
            tc.id,
            tc.codigo,
            tc.proveedor_id,
            tc.importe_total,
            tc.serie,
            tc.creacion,
            tc.metodo_pago_id,
            mp.nombre AS metodo_pago_nombre,
            p.titular AS proveedor_titular
          FROM
            tb_transacciones_compras AS tc
          INNER
            JOIN tipo_metodo_pago AS mp
              ON
                tc.metodo_pago_id = mp.id
          INNER
            JOIN tb_proveedores AS p
              ON
                tc.proveedor_id = p.id
        `, queryParams = [];

        if (search.value) {
          query += `
            WHERE
              tc.codigo LIKE ?
              OR p.titular LIKE ?
              OR mp.nombre LIKE ?
              OR tc.importe_total LIKE ?
              OR tc.creacion LIKE ?
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
          'tc.codigo',
          'p.titular',
          'mp.nombre',
          'tc.importe_total',
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
   * @returns {Promise<COLUMNS_TRANSACCIONES_COMPRAS[]>}
   */
  readInPartsCount(option) {
    return new Promise(async (res, rej) => {
      try {
        let { search } = option;

        let query = `
          SELECT
            COUNT(tc.id) AS cantidad
          FROM
            tb_transacciones_compras AS tc
          INNER
            JOIN tipo_metodo_pago AS mp
              ON
                tc.metodo_pago_id = mp.id
          INNER
            JOIN tb_proveedores AS p
              ON
                tc.proveedor_id = p.id
        `, queryParams = [];

        if (search.value) {
          query += `
            WHERE
              'tc.codigo',
              'p.titular',
              'mp.nombre',
              'tc.importe_total',
              'tc.creacion'
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
   * @param {COLUMNS_TRANSACCIONES_COMPRAS} data
   * @returns {Promise<import('mysql').OkPacket>}
   */
  insert(data) {
    return new Promise(async (res, rej) => {
      try {
        let {
          codigo,
          proveedor_id,
          usuario_id,
          importe_total,
          metodo_pago_id,
          serie = ''
        } = data;

        this.constraint('codigo', codigo);
        this.constraint('proveedor_id', proveedor_id);
        this.constraint('usuario_id', usuario_id);
        this.constraint('importe_total', importe_total);
        this.constraint('metodo_pago_id', metodo_pago_id);
        this.constraint('serie', serie);

        let values = [
          codigo,
          proveedor_id,
          usuario_id,
          importe_total,
          metodo_pago_id,
        ]

        if (serie) values.push(serie);

        let [result] = await this.app.model.pool(`
          INSERT INTO
            tb_transacciones_compras (
              codigo,
              proveedor_id,
              usuario_id,
              importe_total,
              metodo_pago_id
              ${serie ? ',serie' : ''}
            )
          VALUES (
            ?,
            ?,
            ?,
            ?,
            ?
            ${serie ? ',?' : ''}
          )
          `,
          values
        );


        this.io.sockets.emit(
          '/transacciones_compras/data/insert',
          _ => this.readJoinId(result.insertId)
        )

        this.app.model.tb_ventas.io.tagsName.get(`usr:${usuario_id}`)?.emit(
          '/transacciones_compras/data/insert',
          _ => this.readJoinId(result.insertId)
        )

        res(result)
      } catch (e) {
        rej(e);
      }
    })
  }
  /**
   * @param {number} id
   * @param {COLUMNS_TRANSACCIONES_COMPRAS} data
   * @returns {Promise<import('mysql').OkPacket>}
   */
  updateId(id, data) {
    return new Promise(async (res, rej) => {
      try {
        this.constraint('id', id);

        let {
          metodo_pago_id,
          proveedor_id,
          serie = ''
        } = data;

        this.constraint('metodo_pago_id', metodo_pago_id);
        this.constraint('proveedor_id', proveedor_id);
        this.constraint('serie', serie);

        let dataEmitBefore = await this.readJoinId(id);

        let [result] = await this.app.model.pool(`
          UPDATE
            tb_transacciones_compras
          SET
            serie = ?,
            proveedor_id = ?,
            metodo_pago_id = ?
          WHERE
            id = ?;
        `, [
          serie,
          proveedor_id,
          metodo_pago_id,
          id
        ]);

        let dataEmitAfter = await this.readJoinId(id);

        this.io.sockets.emit(
          '/transacciones_compras/data/updateId',
          dataEmitAfter
        )

        if (dataEmitBefore.usuario_id == dataEmitAfter.usuario_id) {
          this.app.model.tb_ventas.io.tagsName.get(`usr:${dataEmitBefore.usuario_id}`)?.emit(
            '/transacciones_compras/data/deleteId',
            {
              before: dataEmitBefore,
              after: dataEmitAfter,
              usuario_id: dataEmitBefore.usuario_id
            }
          )
          this.app.model.tb_ventas.io.tagsName.get(`usr:${dataEmitAfter.usuario_id}`)?.emit(
            '/transacciones_compras/data/updateId',
            dataEmitAfter
          )
        }

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
            tb_compras c
          ON
            p.id = c.producto_id
          SET
            p.stock_disponible = p.stock_disponible - c.cantidad
          WHERE c.transaccion_id = ?;
        `, [
          id
        ]);

        await this.app.model.pool(`
          DELETE FROM
            tb_compras
          WHERE
            transaccion_id = ?
        `, [
          id
        ]);

        let [result] = await this.app.model.pool(`
          DELETE FROM
            tb_transacciones_compras
          WHERE
            id = ?
       `, [
          id
        ]);

        this.io.sockets.emit(
          '/transacciones_compras/data/deleteId',
          { id }
        )

        this.app.model.tb_ventas.io.sockets.emit(
          '/transacciones_compras/data/deleteId',
          { id }
        )

        res(result)
      } catch (e) {
        rej(e)
      }
    })
  }
  /**
   * @returns {Promise<{
   *   id: number,
   *   usuario_id: number,
   *   usuario: string,
   *   metodo_pago_id: number,
   *   metodo_pago_nombre: string,
   *   codigo: string,
   *   importe_total: number,
   *   descuento: number,
   *   creacion: string
   * }>}
   */
  readJoinId(id) {
    return new Promise(async (res, rej) => {
      try {
        this.constraint('id', id);

        let [result] = await this.app.model.pool(`
          SELECT
            tc.id,
            tc.usuario_id,
            u.usuario,
            tc.proveedor_id,
            p.titular AS proveedor_nombres,
            tc.metodo_pago_id,
            mp.nombre AS metodo_pago_nombre,
            tc.codigo,
            tc.importe_total,
            tc.creacion
          FROM
            tb_transacciones_compras AS tc
          INNER
            JOIN tb_proveedores AS p
              ON
                tc.proveedor_id = p.id
          INNER
            JOIN tb_usuarios AS u
              ON
                tc.usuario_id = u.id
          INNER
            JOIN tipo_metodo_pago AS mp
              ON
                tc.metodo_pago_id = mp.id
          WHERE
            tc.id = ?
        `, [
          id
        ]);

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
   * @returns {Promise<COLUMNS_PROVEEDORES[]>}
   */
  SelectorInParts(option, usuario_id) {
    return new Promise(async (res, rej) => {
      try {
        let { order, start, length, search, byId, noInclude } = option;

        let query = `
          SELECT
            id,
            CONCAT(codigo, " - ", DATE_FORMAT(creacion, '%H:%i')) AS name
          FROM
            tb_transacciones_compras
          WHERE
            DATE(creacion) = CURDATE()
            AND usuario_id = ?
        `, queryParams = [usuario_id];

        if (search) {
          if (byId) {
            query += `
              AND id = ?
            `;

            queryParams.push(search);
          }
          else {
            query += `
              AND codigo LIKE ?
            `;

            queryParams.push(`%${search}%`);
          }
        }

        if (noInclude.length && noInclude.every(id => typeof id == 'number')) {
          query += `
            AND id NOT IN (${noInclude.map(_ => '?').join(',')})
          `
          queryParams.push(...noInclude);
        }

        if (order) {
          query += `
            ORDER BY
              creacion ${order == 'asc' ? 'ASC' : 'DESC'}
          `
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
   * @param {SelectorRequest} option
   * @returns {Promise<number>}
   */
  SelectorInPartsCount(option, usuario_id) {
    return new Promise(async (res, rej) => {
      try {
        let { search, noInclude } = option;

        let query = `
          SELECT
            COUNT(id) AS cantidad
          FROM
            tb_transacciones_compras
          WHERE
            DATE(creacion) = CURDATE()
            AND usuario_id = ?
        `, queryParams = [usuario_id];

        if (typeof search == 'string' && search != '') {
          query += `
            AND codigo LIKE ?
          `;

          queryParams.push(`%${search}%`);
        }

        if (noInclude.length && noInclude.every(id => typeof id == 'number')) {
          query += `
            AND id NOT IN (${noInclude.map(_ => '?').join(',')})
          `
          queryParams.push(...noInclude);
        }

        let [result] = await this.app.model.pool(query, queryParams);

        res(result[0].cantidad);
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
          uniqueKey = this.id.generate();

          let [result] = await this.app.model.pool(`
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
    ============================================== process ==============================================
    ====================================================================================================
  */
  /**
   * @param {number} id
   * @returns {Promise<{
  *   importeReal: number
  * }>}
  */
  async refreshId(id) {
    return new Promise(async (res, rej) => {
      try {
        let transaccion = await this.readIdAll(id);
        if (!transaccion) return;

        let asyncCompras = this.app.model.tb_compras.readBusinessId(id);
        let asyncMetodoTransaccion = this.app.model.tipo_metodo_pago.readId(transaccion.metodo_pago_id);

        let compras = await asyncCompras;
        let { igv } = await asyncMetodoTransaccion;

        /* ========== CONTROLADORES ========== */

        /** @type {Set<number>} */
        let setProdutoId = new Set();
        /** @type {Map<number, {id: number,producto_id: number,cantidad: number,compra: number}[]>} */
        let mapProductos = new Map;
        /** @type {number[]} */
        let dltCompraId = [];

        /* ========== CALCULADOR ========== */

        let totalCompraReal = 0;

        let comprasFilter = compras.filter(compra => {
          let key = `${compra.producto_id}:${compra.compra}`;

          totalCompraReal += (compra.compra * compra.cantidad);

          let has = setProdutoId.has(key);

          if (!has) {
            setProdutoId.add(key);
            return true;
          }

          if (mapProductos.has(key))
            mapProductos.get(key).push(compra);
          else
            mapProductos.set(key, [compra]);

          dltCompraId.push(compra.id);
          return false;
        });

        let importeReal = totalCompraReal + (totalCompraReal * igv);

        comprasFilter.forEach(compraFilter => {
          let key = `${compraFilter.producto_id}:${compraFilter.compra}`;

          mapProductos.get(key)?.forEach(compraDuplicate => {
            compraFilter.cantidad += compraDuplicate.cantidad;
          });
        });

        let [r1] = await this.app.model.pool(`
          UPDATE
            tb_transacciones_compras
          SET
            importe_total = ?
          WHERE
            id = ?;
        `, [
          importeReal,
          id
        ]);

        if (r1.affectedRows) {
          if (dltCompraId.length) {
            this.app.model.pool(`
              DELETE FROM
                tb_compras
              WHERE
                id IN (${dltCompraId.join(',')});
            `);
          }

          comprasFilter.forEach(p => {
            this.app.model.pool(`
              UPDATE
                tb_compras
              SET
                cantidad = ?
              WHERE
                id = ?;
            `, [
              p.cantidad,
              p.id
            ]);
          });
        }

        this.io.sockets.emit(
          '/transacciones_compras/data/refreshId',
          { id, importeReal }
        );

        return { importeReal };

      } catch (e) {
        throw rej(e);
      }
    })
  }
  /**
   * @param {{producto_id:number, cantidad:number, precio_compra:number, importe:number}[]} productos
   * @param {number} metodo_pago_id
   * @param {number} importe_total
   * @returns {Promise<{
   *   codigo: string,
   *   importeReal: number,
   *   totalCompraReal: number,
   *   listCompras: {
   *     producto_id: number,
   *     cantidad: number,
   *     precio_compra:number,
   *     importe: number
   *   }[]
   * }>}
   */
  computedBusiness(productos, metodo_pago_id) {
    return new Promise(async (res, rej) => {
      try {
        if (productos?.constructor.name != 'Array') return;
        if (!productos.length) return;

        let { igv } = await this.app.model.tipo_metodo_pago.readId(metodo_pago_id);

        let totalCompraReal = 0;

        for (let producto of productos) {
          let { cantidad, precio_compra } = producto;

          let importe = producto.importe = cantidad * precio_compra;

          totalCompraReal += importe;
        }

        let importeReal = totalCompraReal + (totalCompraReal * igv);

        let codigo = await this.getCodigo();

        res({
          codigo,
          importeReal,
          totalCompraReal,
          listCompras: productos,
        })
      } catch (e) {
        rej(e);
      }
    })
  }
}

module.exports = Tb_transacciones_compras;