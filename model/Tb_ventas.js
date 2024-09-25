const { Table } = require('../utils/UtilsModel');

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
 * }} COLUMNS
 */

class tb_ventas extends Table {
  /** @param {import('../app')} app */
  constructor(app) {
    super(name);
    this.columns = columns;
    this.app = app;
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
   * @param {number} id
   * @returns {Promise<{
   *   id:number, 
   *   producto_id:number, 
   *   producto_codigo:string, 
   *   categoria_nombre:string, 
   *   producto_nombre:string, 
   *   precio_compra:number, 
   *   precio_venta:number, 
   *   cantidad:number, 
   *   descuento:number, 
   *   importe:number
   * }[]>}
   */
  readBusinessJoinId(id) {
    return new Promise(async (res, rej) => {
      this.constraint('id', id)

      let [result] = await this.app.model.poolValues(`
        SELECT 
          v.id,
          p.id AS producto_id,
          p.codigo AS producto_codigo,
          c.nombre AS categoria_nombre,
          p.producto AS producto_nombre,
          p.compra AS precio_compra,
          p.venta AS precio_venta,
          v.cantidad,
          v.descuento,
          v.importe
        FROM 
          tb_ventas AS v
        INNER 
          JOIN tb_productos AS p
            ON 
              p.id = v.producto_id
          JOIN tb_categorias AS c
            ON 
              c.id = p.categoria_id
        WHERE
          v.transaccion_id = ?
      `, [
        id
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