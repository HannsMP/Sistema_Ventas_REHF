const Table = require('../utils/template/Table');
const Id = require('../utils/Id');

const name = 'tb_transacciones_ventas';
const columns = {
  id: { name: 'id', null: false, type: 'Integer', limit: 11 },
  codigo: { name: 'codigo ', null: false, type: 'String', limit: 50 },
  cliente_id: { name: 'cliente_id', null: false, type: 'Integer', limit: 11 },
  usuario_id: { name: 'usuario_id', null: false, type: 'Integer', limit: 11 },
  importe_total: { name: 'importe_total ', null: false, type: 'Number', limit: 10, decimal: 2 },
  metodo_pago_id: { name: 'metodo_pago_id', null: false, type: 'Integer', limit: 11 },
  descuento: { name: 'descuento ', null: false, type: 'Number', limit: 10, decimal: 2 },
  serie: { name: 'serie', null: true, type: 'String', limit: 20 },
  comentario: { name: 'comentario', null: true, type: 'String', limit: 250 },
  creacion: { name: 'creacion', null: false, type: 'String', limit: 25 }
}

/** 
 * @typedef {{
 *   id: number,
 *   codigo: string,
 *   cliente_id: number,
 *   usuario_id: number,
 *   importe_total: number,
 *   metodo_pago_id: number,
 *   descuento: number,
 *   serie: string,
 *   comentario: string,
 *   creacion: string
 * }} COLUMNS
 */

/** @extends {Table<COLUMNS>} */
class Tb_transacciones_ventas extends Table {
  id = new Id('S        ', { letters: true, numeric: true });

  /** @param {import('../app')} app */
  constructor(app) {
    super(name);
    this.columns = columns;
    this.app = app;

    this.io = app.socket.node.selectNode('/control/reportes/ventas', true);
  }
  /* 
    ====================================================================================================
    =============================================== Tabla ===============================================
    ====================================================================================================
  */
  /**
   * @param {import('datatables.net-dt').AjaxData} option 
   * @returns {Promise<COLUMNS[]>}
   */
  readInParts(option) {
    return new Promise(async (res, rej) => {
      try {
        let { order, start, length, search } = option;

        let query = `
          SELECT 
            tv.id,
            tv.usuario_id,
            u.usuario,
            tv.metodo_pago_id, 
            mp.nombre AS metodo_pago_nombre,
            tv.cliente_id,
            c.nombres,
            tv.codigo,
            tv.importe_total,
            tv.descuento,
            tv.creacion
          FROM 
            tb_transacciones_ventas AS tv
          INNER 
            JOIN tb_usuarios AS u
              ON 
                tv.usuario_id = u.id
          INNER 
            JOIN tipo_metodo_pago AS mp
              ON
                tv.metodo_pago_id = mp.id
          INNER 
            JOIN tb_clientes AS c
              ON
                tv.cliente_id = c.id
        `, queryParams = [];

        if (search.value) {
          query += `
            WHERE
              tv.codigo LIKE ?
              OR u.usuario LIKE ?
              OR mp.nombre LIKE ?
              OR tv.descuento LIKE ?
              OR tv.importe_total LIKE ?
              OR tv.creacion LIKE ?
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
          'tv.codigo',
          'u.usuario',
          'mp.nombre',
          'tv.descuento',
          'tv.importe_total',
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
   * @returns {Promise<COLUMNS[]>}
   */
  readInPartsCount(option) {
    return new Promise(async (res, rej) => {
      try {
        let { search } = option;

        let query = `
          SELECT 
            COUNT(tv.id) AS cantidad
          FROM 
            tb_transacciones_ventas AS tv
          INNER 
            JOIN tb_usuarios AS u
              ON 
                tv.usuario_id = u.id
          INNER 
            JOIN tipo_metodo_pago AS mp
              ON
                tv.metodo_pago_id = mp.id
          INNER 
            JOIN tb_clientes AS c
              ON
                tv.cliente_id = c.id
        `, queryParams = [];

        if (search.value) {
          query += `
            WHERE
              tv.codigo LIKE ?
              OR u.usuario LIKE ?
              OR mp.nombre LIKE ?
              OR tv.descuento LIKE ?
              OR tv.importe_total LIKE ?
              OR tv.creacion LIKE ?
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
   * @param {COLUMNS} data 
   * @returns {Promise<import('mysql').OkPacket>}
   */
  insert(data) {
    return new Promise(async (res, rej) => {
      try {
        let {
          codigo,
          cliente_id,
          usuario_id,
          importe_total,
          metodo_pago_id,
          descuento,
          serie = '',
          comentario = ''
        } = data;

        this.constraint('codigo', codigo);
        this.constraint('cliente_id', cliente_id);
        this.constraint('usuario_id', usuario_id);
        this.constraint('importe_total', importe_total);
        this.constraint('metodo_pago_id', metodo_pago_id);
        this.constraint('descuento', descuento);
        this.constraint('serie', serie);
        this.constraint('comentario', comentario);

        let values = [
          codigo,
          cliente_id,
          usuario_id,
          importe_total,
          metodo_pago_id,
          descuento,
        ]

        if (serie) values.push(serie);
        if (comentario) values.push(comentario);

        let [result] = await this.app.model.poolValues(`
          INSERT INTO
            tb_transacciones_ventas (
              codigo,
              cliente_id,
              usuario_id,
              importe_total,
              metodo_pago_id,
              descuento
              ${serie ? ',serie' : ''}
              ${comentario ? ',comentario' : ''}
            )
          VALUES (
            ?,
            ?,
            ?,
            ?,
            ?,
            ?
            ${serie ? ',?' : ''}
            ${comentario ? ',?' : ''}
          )
          `,
          values
        );


        this.io.sockets.emit(
          '/transacciones_ventas/data/insert',
          _ => this.readJoinId(result.insertId)
        )

        this.app.model.tb_ventas.io.tagsName.get(`usr:${usuario_id}`)?.emit(
          '/transacciones_ventas/data/insert',
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
            tv.id,
            tv.usuario_id,
            u.usuario,
            tv.metodo_pago_id, 
            mp.nombre AS metodo_pago_nombre,
            tv.cliente_id,
            c.nombres,
            tv.codigo,
            tv.importe_total,
            tv.descuento,
            tv.creacion
          FROM 
            tb_transacciones_ventas AS tv
          INNER 
            JOIN tb_usuarios AS u
              ON 
                tv.usuario_id = u.id
          INNER 
            JOIN tipo_metodo_pago AS mp
              ON
                tv.metodo_pago_id = mp.id
          INNER 
            JOIN tb_clientes AS c
              ON
                tv.cliente_id = c.id
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
            tv.id,
            tv.metodo_pago_id, 
            mp.nombre AS metodo_pago_nombre,
            tv.cliente_id,
            c.nombres AS cliente_nombres,
            tv.codigo,
            tv.importe_total,
            tv.descuento,
            DATE_FORMAT(tv.creacion, '%r') AS hora
          FROM 
            tb_transacciones_ventas AS tv
          INNER 
            JOIN tipo_metodo_pago AS mp
              ON
                tv.metodo_pago_id = mp.id
          INNER 
            JOIN tb_clientes AS c
              ON
                tv.cliente_id = c.id
          WHERE 
            DATE(tv.creacion) = CURDATE()
            AND tv.usuario_id = ?;
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
            tv.id,
            tv.codigo,
            tv.importe_total,
            tv.descuento,
            tv.creacion
          FROM 
            tb_transacciones_ventas AS tv
          INNER 
            JOIN tb_usuarios AS u
              ON 
                tv.usuario_id = u.id
          INNER 
            JOIN tipo_metodo_pago AS mp
              ON 
                tv.metodo_pago_id = mp.id
          WHERE 
            DATE(tv.creacion) = ?;
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
   * @param {COLUMNS} data 
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
            tb_transacciones_ventas
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
          '/transacciones_ventas/data/updateId',
          dataEmitAfter
        )

        if (dataEmitBefore.usuario_id == dataEmitAfter.usuario_id) {
          this.app.model.tb_ventas.io.tagsName.get(`usr:${dataEmitBefore.usuario_id}`)?.emit(
            '/transacciones_ventas/data/deleteId',
            {
              before: dataEmitBefore,
              after: dataEmitAfter,
              usuario_id: dataEmitBefore.usuario_id
            }
          )
          this.app.model.tb_ventas.io.tagsName.get(`usr:${dataEmitAfter.usuario_id}`)?.emit(
            '/transacciones_ventas/data/updateId',
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
            tb_transacciones_ventas 
          WHERE 
            id = ?
       `, [
          id
        ]);

        this.io.sockets.emit(
          '/transacciones_ventas/data/deleteId',
          { id }
        )

        let dataEmit = await this.readJoinId(id);

        this.app.model.tb_ventas.io.tagsName.get(`usr:${dataEmit.usuario_id}`)?.emit(
          '/transacciones_ventas/data/deleteId',
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
            tb_transacciones_ventas
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
            tv.id,
            tv.usuario_id,
            u.usuario,
            tv.cliente_id,
            c.nombres AS cliente_nombres,
            tv.metodo_pago_id, 
            mp.nombre AS metodo_pago_nombre,
            tv.codigo,
            tv.importe_total,
            tv.descuento,
            tv.creacion
          FROM 
            tb_transacciones_ventas AS tv
          INNER 
            JOIN tb_clientes AS c
              ON 
                tv.cliente_id = c.id
          INNER 
            JOIN tb_usuarios AS u
              ON 
                tv.usuario_id = u.id
          INNER 
            JOIN tipo_metodo_pago AS mp
              ON 
                tv.metodo_pago_id = mp.id
          WHERE
            tv.id = ?
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
            tb_transacciones_ventas
          SET
            descuento = ?
          WHERE 
            id = ?;
        `, [
          descuento,
          id
        ]);

        this.io.sockets.emit(
          '/transacciones_ventas/data/refreshId',
          { id, descuento }
        )

        res({ descuento })
      } catch (e) {
        rej(e)
      }
    })
  }
  /**
   * @param {{producto_id:number, cantidad:number}[]} productos 
   * @param {number} metodo_pago_id 
   * @param {number} importe_total 
   * @returns {Promise<{
   *   codigo: string,
   *   descuento: number,  
   *   importe_total: number,
   *   totalVentaReal: number,
   *   totalCompraReal: number,
   *   descuentoUnitario: number,  
   *   listVentas: {
   *     producto_id: number,
   *     descuento: number,
   *     cantidad: number,
   *     importe: number
   *   }[]
   * }>}
   */
  computerBusiness(productos, metodo_pago_id, importe_total) {
    return new Promise(async (res, rej) => {
      try {
        if (productos?.constructor.name != 'Array') return;
        if (!productos.length) return;

        let { igv } = await this.app.model.tipo_metodo_pago.readId(metodo_pago_id);

        let totalCompraReal = 0;
        let totalVentaReal = 0;

        for (let producto of productos) {
          let { cantidad, producto_id } = producto;
          producto_id = producto.producto_id = Number(producto_id);
          let { compra, venta } = await this.app.model.tb_productos.readPriceId(producto_id);

          let importe = producto.importe = cantidad * venta;

          totalCompraReal += (cantidad * compra);
          totalVentaReal += importe;
        }

        let importeReal = totalVentaReal + (totalVentaReal * igv);

        let descuento = importeReal - importe_total;

        let descuentoUnitario = descuento / productos.length;

        productos.forEach(d => d.descuento = descuentoUnitario);

        let codigo = await this.getCodigo();

        res({
          codigo,
          descuento,
          importe_total: importeReal,
          totalVentaReal,
          totalCompraReal,
          descuentoUnitario,
          listVentas: productos,
        })
      } catch (e) {
        rej(e);
      }
    })
  }
}

module.exports = Tb_transacciones_ventas;