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
            tc.usuario_id,
            u.usuario,
            tc.proveedor_id,
            p.titular,
            tc.codigo,
            tc.importe_total,
            tc.creacion
          FROM 
            tb_transacciones_compras AS tc
          INNER 
            JOIN tb_usuarios AS u
              ON 
                tc.usuario_id = u.id
          INNER 
            JOIN tb_proveedores AS p
              ON
                tc.proveedor_id = p.id
        `, queryParams = [];

        if (search.value) {
          query += `
            WHERE
              tc.codigo LIKE ?
              OR u.usuario LIKE ?
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
          'u.usuario',
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

        let [result] = await this.app.model.poolValues(query, queryParams);

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
            JOIN tb_usuarios AS u
              ON 
                tc.usuario_id = u.id
          INNER 
            JOIN tb_proveedores AS p
              ON
                tc.proveedor_id = p.id
        `, queryParams = [];

        if (search.value) {
          query += `
            WHERE
              tc.codigo LIKE ?
              OR u.usuario LIKE ?
              OR mp.nombre LIKE ?
              OR tc.descuento LIKE ?
              OR tc.importe_total LIKE ?
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

        let [result] = await this.app.model.poolValues(`
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
   * }[]>}
   */
  readAllJoin() {
    return new Promise(async (res, rej) => {
      try {
        let [result] = await this.app.model.pool(`
          SELECT 
            tc.id,
            tc.usuario_id,
            u.usuario,
            tc.metodo_pago_id, 
            mp.nombre AS metodo_pago_nombre,
            tc.proveedor_id,
            p.titular,
            tc.codigo,
            tc.importe_total,
            tc.descuento,
            tc.creacion
          FROM 
            tb_transacciones_compras AS tc
          INNER 
            JOIN tb_usuarios AS u
              ON 
                tc.usuario_id = u.id
          INNER 
            JOIN tipo_metodo_pago AS mp
              ON
                tc.metodo_pago_id = mp.id
          INNER 
            JOIN tb_proveedores AS p
              ON
                tc.proveedor_id = p.id
         `);

        res(result);
      } catch (e) {
        rej(e);
      }
    })
  }
  /**
   * @param {number} usuario_id 
   * @returns {Promise<{
   *   id: number, 
   *   usuario_id: number,   
   *   metodo_pago_id: number,   
   *   metodo_pago_nombre: string,
   *   codigo: string, 
   *   importe_total: number, 
   *   descuento: number, 
   *   hora: string 
   * }[]>}
   */
  readAllJoinUser(usuario_id) {
    return new Promise(async (res, rej) => {
      try {
        let [result] = await this.app.model.poolValues(`
          SELECT 
            tc.id,
            tc.metodo_pago_id, 
            mp.nombre AS metodo_pago_nombre,
            tc.proveedor_id,
            p.titular AS proveedor_nombres,
            tc.codigo,
            tc.importe_total,
            tc.descuento,
            DATE_FORMAT(tc.creacion, '%r') AS hora
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
          WHERE 
            DATE(tc.creacion) = CURDATE()
            AND tc.usuario_id = ?;
         `, [
          usuario_id
        ]);

        res(result);
      } catch (e) {
        rej(e);
      }
    })
  }
  /**
   * @param {Date | string | number} date 
   * @returns {Promise<{
   *   id: number, 
   *   usuario: string,   
   *   nombre: string, 
   *   codigo: string, 
   *   importe_total: number, 
   *   descuento: number, 
   *   creacion: string 
   * }[]>}
   */
  readDate(date) {
    return new Promise(async (res, rej) => {
      try {
        date = date instanceof Date
          ? date
          : new Date(date);

        let [result] = await this.app.model.poolValues(`
          SELECT 
            u.usuario,
            mp.nombre,
            tc.id,
            tc.codigo,
            tc.importe_total,
            tc.descuento,
            tc.creacion
          FROM 
            tb_transacciones_compras AS tc
          INNER 
            JOIN tb_usuarios AS u
              ON 
                tc.usuario_id = u.id
          INNER 
            JOIN tipo_metodo_pago AS mp
              ON 
                tc.metodo_pago_id = mp.id
          WHERE 
            DATE(tc.creacion) = ?;
        `, [
          this.app.time.format('YYYY-MM-DD', date)
        ])

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
          usuario_id,
          importe_total,
          metodo_pago_id
        } = data;

        this.constraint('usuario_id', usuario_id);
        this.constraint('importe_total', importe_total);
        this.constraint('metodo_pago_id', metodo_pago_id);

        let dataEmitBefore = await this.readJoinId(id);

        let [result] = await this.app.model.poolValues(`
          UPDATE
            tb_transacciones_compras
          SET
            usuario_id = ?,
            importe_total = ?,
            metodo_pago_id = ?
          WHERE 
            id = ?;
        `, [
          usuario_id,
          importe_total,
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

        let [resultVentas] = await this.app.model.poolValues(`
          DELETE FROM 
            tb_ventas 
          WHERE 
            transaccion_id = ?
        `, [
          id
        ]);

        let [result] = await this.app.model.poolValues(`
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

        let dataEmit = await this.readJoinId(id);

        this.app.model.tb_ventas.io.tagsName.get(`usr:${dataEmit.usuario_id}`)?.emit(
          '/transacciones_compras/data/deleteId',
          dataEmit
        )

        res(result)
      } catch (e) {
        rej(e)
      }
    })
  }
  /**
   * @returns {Promise<{
   *   codigo: string, 
   *   importe_total: number, 
   *   descuento: number, 
   *   creacion: string 
   * }>}
   */
  readId(id) {
    return new Promise(async (res, rej) => {
      try {
        this.constraint('id', id);

        let [result] = await this.app.model.poolValues(`
          SELECT 
            codigo,
            importe_total,
            descuento,
            creacion
          FROM 
            tb_transacciones_compras
          WHERE
            id = ?
        `, [
          id
        ]);

        res(result[0]);
      } catch (e) {
        rej(e);
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

        let [result] = await this.app.model.poolValues(`
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
            tc.descuento,
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

          let [result] = await this.app.model.poolValues(`
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
   *   descuento: number
   * }>}
   */
  refreshId(id) {
    return new Promise(async (res, rej) => {
      try {

        let transaccion = await this.readJoinId(id);

        if (!transaccion) return;

        let productos = await this.app.model.tb_ventas.readBusinessId(id);

        let { igv } = await this.app.model.tipo_metodo_pago.readId(transaccion.metodo_pago_id);

        let idUniq = new Set();
        /** @type {{[producto_id:string]: {id: number,producto_id: number,cantidad: number,descuento: number,importe: number}[]}} */
        let dataDupli = {};

        let productosUnicos = productos.filter(d => {
          let has = idUniq.has(d.producto_id)

          if (!has)
            idUniq.add(d.producto_id);
          else if (dataDupli[d.producto_id])
            dataDupli[d.producto_id].push(d);
          else
            dataDupli[d.producto_id] = [d];

          return !has;
        })

        let totalVentaReal = 0;
        let idDlt = [];

        productosUnicos.forEach(u => {
          dataDupli[u.producto_id]?.forEach(d => {
            u.importe += d.importe;
            u.cantidad += d.cantidad;
            idDlt.push(d.id)
          })
          totalVentaReal += u.importe;
        })

        let importeReal = totalVentaReal + (totalVentaReal * igv);

        let descuento = importeReal - transaccion.importe_total;

        let descuentoUnitario = descuento / productos.length;

        productosUnicos.forEach(p => {
          this.app.model.poolValues(`
            UPDATE
              tb_ventas
            SET
              cantidad = ?,
              importe = ?,
              descuento = ?
            WHERE 
              id = ?;
          `, [
            p.cantidad,
            p.importe,
            descuentoUnitario,
            p.id
          ])
        })

        if (idDlt.length)
          this.app.model.pool(`
            DELETE FROM 
              tb_ventas 
            WHERE 
              id IN (${idDlt.join(',')})
          `)

        let [result] = await this.app.model.poolValues(`
          UPDATE
            tb_transacciones_compras
          SET
            descuento = ?
          WHERE 
            id = ?;
        `, [
          descuento,
          id
        ]);

        this.io.sockets.emit(
          '/transacciones_compras/data/refreshId',
          { id, descuento }
        )

        res({ descuento })
      } catch (e) {
        rej(e)
      }
    })
  }
  /**
   * @param {{producto_id:number, cantidad:number, precio_compra:number, precio_venta:number}[]} productos 
   * @param {number} metodo_pago_id 
   * @param {number} importe_total 
   * @returns {Promise<{
   *   codigo: string, 
   *   importeReal: number,
   *   totalCompraReal: number,
   *   listCompras: {
   *     producto_id: number,
   *     precio_venta:number,
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