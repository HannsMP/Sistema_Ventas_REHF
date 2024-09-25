const generateUniqueId = require('generate-unique-id');
const { Table } = require('../utils/UtilsModel');
const EmitSet = require('../utils/emitSet');

const name = 'tb_productos';
const columns = {
  id: { name: 'id', null: false, type: 'Integer', limit: 11 },
  codigo: { name: 'codigo', null: false, type: 'String', limit: 20, unic: true },
  producto: { name: 'nombre', null: false, type: 'String', limit: 50, unic: true },
  descripcion: { name: 'descripcion', null: true, type: 'String', limit: 250 },
  compra: { name: 'compra', null: false, type: 'Number', limit: 10, decimal: 2 },
  venta: { name: 'venta', null: false, type: 'Number', limit: 10, decimal: 2 },
  cantidad: { name: 'cantidad', null: false, type: 'Integer', limit: 10 },
  categoria_id: { name: 'categoria_id', null: false, type: 'Integer', limit: 11 },
  foto_id: { name: 'foto_id', null: true, type: 'Integer', limit: 11 },
  creacion: { name: 'creacion', null: false, type: 'String', limit: 25 },
  estado: { name: 'estado', null: false, type: 'Integer', limit: 1 }
}

/** 
 * @typedef {{
 *   id: number,
 *   codigo: string,
 *   producto: string,
 *   descripcion: string,
 *   compra: number,
 *   venta: number,
 *   cantidad: number,
 *   categoria_id: number,
 *   foto_id: number,
 *   creacion: string,
 *   estado: number,
 * }} COLUMNS
 */

class Tb_productos extends Table {
  /** @param {import('../app')} app */
  constructor(app) {
    super(name);
    this.columns = columns;
    this.app = app;

    this.io = new EmitSet([
      '/control/productos',
      '/control/movimientos/ventas',
      '/control/mantenimiento/inventario',
    ], app)
  }
  /* 
    ====================================================================================================
    =============================================== Tabla ===============================================
    ====================================================================================================
  */
  /** 
   * @param {COLUMNS} data 
   * @returns {Promise<import('mysql').OkPacket>}
   */
  insert(data) {
    return new Promise(async (res, rej) => {
      try {
        let {
          codigo,
          producto,
          descripcion,
          compra,
          foto_id,
          venta,
          categoria_id,
          estado = 1
        } = data;

        this.constraint('codigo', codigo);
        this.constraint('producto', producto, { unic: true });
        this.constraint('descripcion', descripcion);
        this.constraint('compra', compra);
        this.constraint('venta', venta);
        this.constraint('categoria_id', categoria_id);
        this.constraint('estado', estado);

        let [result] = await this.app.model.poolValues(`
          INSERT INTO
            tb_productos (
              codigo,
              producto,
              descripcion,
              compra,
              venta,
              categoria_id,
              estado,
              foto_id
            )
          VALUES (
            ?,
            ?,
            ?,
            ?,
            ?,
            ?,
            ?,
            ?
          )
        `, [
          codigo,
          producto,
          descripcion,
          compra.toFixed(2),
          venta.toFixed(2),
          categoria_id,
          estado,
          foto_id || 2
        ]);

        this.io.emit(
          '/productos/data/insert',
          _ => this.readIdJoin(result.insertId)
        )

        res(result)
      } catch (e) {
        rej(e);
      }
    })
  }
  /**
   * @returns {Promise<COLUMNS[]>}
   */
  readAllJoin() {
    return new Promise(async (res, rej) => {
      try {
        let [result] = await this.app.model.pool(`
          SELECT 
            p.id,
            p.codigo,
            p.producto,
            p.descripcion,
            p.compra,
            p.venta,
            p.cantidad,
            p.categoria_id,
            c.nombre AS categoria_nombre,
            p.foto_id,
            f.src AS foto_src,
            p.creacion,
            p.estado
          FROM
            tb_productos AS p
          LEFT 
            JOIN 
              tb_categorias AS c
            ON 
              c.id = p.categoria_id
          LEFT 
            JOIN 
              tb_fotos AS f
            ON 
              f.id = p.foto_id
          WHERE
            p.estado = 1
            OR p.estado = 0
        `);

        res(result);
      } catch (e) {
        rej(e);
      }
    })
  }
  /** 
   * @param {number} id 
   * @returns {Promise<{
   *   id:number,
   *   codigo:string,
   *   producto:string,
   *   descripcion:string,
   *   compra:number,
   *   venta:number,
   *   cantidad:number,
   *   categoria_id:number,
   *   categoria_nombre:string,
   *   foto_id:number,
   *   foto_src:string,
   *   creacion:string,
   *   estado:number
   * }>}
   */
  readIdJoin(id) {
    return new Promise(async (res, rej) => {
      try {

        this.constraint('id', id);

        let [result] = await this.app.model.poolValues(`
          SELECT 
            p.id,
            p.codigo,
            p.producto,
            p.descripcion,
            p.compra,
            p.venta,
            p.cantidad,
            p.categoria_id,
            c.nombre AS categoria_nombre,
            p.foto_id,
            f.src AS foto_src,
            f.src_small AS foto_src_small,
            p.creacion,
            p.estado
          FROM
            tb_productos AS p
          LEFT 
            JOIN 
              tb_categorias AS c
            ON 
              c.id = p.categoria_id
          LEFT 
            JOIN 
              tb_fotos AS f
            ON 
              f.id = p.foto_id
          WHERE
            p.id = ?
            AND (
              p.estado = 1
              OR p.estado = 0
            )
        `, [
          id
        ]);

        let data = result[0];

        res(data);
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
        let {
          producto,
          descripcion,
          categoria_id,
          compra,
          venta,
          foto_id
        } = data;

        this.constraint('id', id);
        this.constraint('producto', producto, { unic: id });
        this.constraint('descripcion', descripcion);
        this.constraint('categoria_id', categoria_id);
        this.constraint('compra', compra);
        this.constraint('venta', venta);

        let values = [
          producto,
          descripcion,
          categoria_id,
          compra.toFixed(2),
          venta.toFixed(2)
        ]

        if (foto_id) values.push(foto_id);

        values.push(id);

        let [result] = await this.app.model.poolValues(`
          UPDATE 
            tb_productos
          SET
            producto = ?,
            descripcion = ?,
            categoria_id = ?,
            compra = ?,
            venta = ?
            ${foto_id ? ', foto_id = ?' : ''}
          WHERE
            id = ?
            AND (
              estado = 1
              OR estado = 0
            )
        `,
          values
        );

        this.io.emit(
          '/productos/data/updateId',
          _ => this.readIdJoin(id)
        )

        res(result)
      } catch (e) {
        rej(e);
      }
    })
  }
  /** 
   * @param {number} id 
   * @param {number} estado 
   * @returns {Promise<import('mysql').OkPacket>}
   */
  updateIdState(id, estado) {
    return new Promise(async (res, rej) => {
      try {
        this.constraint('id', id);
        this.constraint('estado', estado);

        let [result] = await this.app.model.poolValues(`
          UPDATE
            tb_productos
          SET
            estado = ?
          WHERE 
              id = ?
          AND(
            estado = 1
                OR estado = 0
          )
        `, [
          estado,
          id
        ]);

        this.io.emit(
          '/productos/data/state',
          estado
            ? _ => this.readIdJoin(id)
            : { id, estado }
        )

        res(result)
      } catch (e) {
        rej(e);
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
            tb_productos
          WHERE
            id = ?
            AND(
              estado = 1
              OR estado = 0
            )
        `, [
          id
        ]);

        this.io.emit(
          '/productos/data/deleteId',
          { id }
        )

        res(result)
      } catch (e) {
        rej(e);
      }
    })
  }
  /* 
    ====================================================================================================
    ============================================= Categoria =============================================
    ====================================================================================================
  */
  /** 
   * @param {number} categoria_id 
   * @param {number} estado 
   * @returns {Promise<import('mysql').OkPacket>}
   */
  updateStateCategoriaId(categoria_id, estado) {
    return new Promise(async (res, rej) => {
      try {
        this.app.model.tb_categorias.constraint('id', categoria_id);
        this.constraint('estado', estado);

        let [result] = estado
          ? await this.app.model.poolValues(`
              UPDATE
                tb_productos
              SET
                estado = CASE
                  WHEN
                    estado = -1
                    THEN
                      1
                  WHEN
                    estado = -2
                    THEN
                      0
                  ELSE
                    estado
                END
              WHERE
                categoria_id = ?;
            `, [
            categoria_id
          ])
          : await this.app.model.poolValues(`
              UPDATE
                tb_productos
              SET
                estado = 
                CASE
                  WHEN
                    estado = 1
                    THEN
                      - 1
                  WHEN
                    estado = 0
                    THEN
                      - 2
                  ELSE
                  estado
                END
              WHERE
                categoria_id = ?;
            `, [
            categoria_id
          ]);

        let [data] = estado
          ? await this.app.model.poolValues(`
              SELECT 
                p.id,
                p.codigo,
                p.producto,
                p.descripcion,
                p.compra,
                p.venta,
                p.cantidad,
                p.categoria_id,
                c.nombre AS categoria_nombre,
                p.foto_id,
                f.src AS foto_src,
                p.creacion,
                p.estado
              FROM
                tb_productos AS p
              LEFT 
                JOIN 
                  tb_categorias AS c
                ON 
                  c.id = p.categoria_id
              LEFT 
                JOIN 
                  tb_fotos AS f
                ON 
                  f.id = p.foto_id
              WHERE
                p.categoria_id = ?
            `, [
            categoria_id
          ])
          : await this.app.model.poolValues(`
              SELECT 
                p.id
              FROM
                tb_productos AS p
              WHERE
                p.categoria_id = ?
            `, [
            categoria_id
          ])

        this.io.emit(
          '/productos/categorias/state',
          { estado, data }
        )

        res(result)
      } catch (e) {
        rej(e);
      }
    })
  }
  /* 
    ====================================================================================================
    ============================================== Cliente ==============================================
    ====================================================================================================
  */
  /**
   * @returns {Promise<COLUMNS[]>}
   */
  readAllJoinPaginator() {
    return new Promise(async (res, rej) => {
      try {
        let [result] = await this.app.model.pool(`
          SELECT
            p.id,
            p.codigo,
            p.producto,
            p.descripcion,
            p.venta,
            p.cantidad,
            p.categoria_id,
            c.nombre AS categoria_nombre,
            f.src AS src
          FROM
            tb_productos AS p
          LEFT
            JOIN 
              tb_categorias AS c
            ON
              c.id = p.categoria_id
          LEFT
            JOIN 
              tb_fotos AS f
            ON
              f.id = p.foto_id
          WHERE
            p.estado = 1
        `);

        res(result);
      } catch (e) {
        rej(e);
      }
    })
  }
  /* 
    ====================================================================================================
    ============================================ Transaccion ============================================
    ====================================================================================================
  */
  /** 
   * @param {number} id 
   * @returns {Promise<{compra:number, venta:number}>}
   */
  readPriceId(id) {
    return new Promise(async (res, rej) => {
      try {
        this.constraint('id', id);

        let [result] = await this.app.model.poolValues(`
          SELECT
            compra,
            venta
          FROM
            tb_productos
          WHERE
            id = ?
        `,
          id
        );

        res(result[0]);
      } catch (e) {
        rej(e);
      }
    })
  }
  /** 
   * @param {number[]} ids 
   * @returns {Promise<{compra:number, venta:number}[]>}
   */
  readPriceIds(...ids) {
    return new Promise(async (res, rej) => {
      try {
        ids.forEach(id => this.constraint('id', id));

        let [result] = await this.app.model.poolValues(`
          SELECT
            compra,
            venta
          FROM
            tb_productos
          WHERE
            id IN(${ids.map(_ => '?').join(',')})
        `,
          ids
        );

        res(result);
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
   * @returns {Promise<Array.<{code: string, name: string}>>}
   */
  selectorReadAll() {
    return new Promise(async (res, rej) => {
      try {
        let [result] = await this.app.model.pool(`
          SELECT
            p.id,
            CONCAT(p.codigo, ' - ', p.producto) AS name,
            f.src_small AS src
          FROM
            tb_productos AS p
          LEFT
            JOIN
              tb_fotos AS f
            ON
              f.id = p.foto_id
          WHERE
            p.estado = 1
        `)

        res(result);
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
          uniqueKey = 'I'
            + generateUniqueId({ length: 8, useLetters: true, useNumbers: false })
              .toUpperCase();

          let [result] = await this.app.model.poolValues(`
            SELECT
              1
            FROM
              tb_productos
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
    ============================================== Cards ==============================================
    ====================================================================================================
  */
  /** 
   * @returns {Promise<string>}
   */
  cardLastCreation() {
    return new Promise(async (res, rej) => {
      try {
        let [result] = await this.app.model.pool(`
          SELECT
            MAX(STR_TO_DATE(creacion, '%Y-%m-%d')) AS max_creacion
          FROM
            tb_productos;
        `)

        res(result[0].max_creacion);
      } catch (e) {
        rej(e);
      }
    })
  }
  /** 
   * @returns {Promise<string>}
   */
  cardCount() {
    return new Promise(async (res, rej) => {
      try {
        let [result] = await this.app.model.pool(`
          SELECT
            COALESCE(COUNT(id), 0) AS cantidad_productos
          FROM
            tb_productos
        `)

        res(result[0].cantidad_productos);
      } catch (e) {
        rej(e);
      }
    })
  }
  /* 
    ====================================================================================================
    ============================================== Grafico ==============================================
    ====================================================================================================
  */
  /** 
   * @returns {Promise<COLUMNS[]>}
   */
  chartCountProducs() {
    return new Promise(async (res, rej) => {
      try {
        let [result] = await this.app.model.pool(`
          SELECT
            c.nombre AS categoria_nombre,
            COALESCE(AVG(p.venta), 0) AS promedio_precios
          FROM 
            tb_productos AS p
          LEFT JOIN 
            tb_categorias AS c
            ON
              p.categoria_id = c.id
          WHERE
            c.estado = 1
            AND p.estado = 1
          GROUP BY
            c.nombre;
        `)

        let label = [], data = [];

        result.forEach(({ categoria_nombre, promedio_precios }) => {
          label.push(categoria_nombre);
          data.push(promedio_precios);
        })

        res({ label, data });
      } catch (e) {
        rej(e);
      }
    })
  }
  /* 
    ====================================================================================================
    ============================================== Utiles ==============================================
    ====================================================================================================
  */
  /**
   * @returns {Promise<COLUMNS[]>}
   */
  readAll() {
    return new Promise(async (res, rej) => {
      try {
        let [result] = await this.app.model.pool(`
          SELECT
            *
          FROM
            tb_productos
        `);

        res(result);
      } catch (e) {
        rej(e);
      }
    })
  }
  /** 
   * @param {number} id 
   * @returns {Promise<COLUMNS>}
   */
  readId(id) {
    return new Promise(async (res, rej) => {
      try {

        this.constraint('id', id);

        let [result] = await this.app.model.poolValues(`
          SELECT
            *
          FROM
            tb_productos
          WHERE
            id = ?
        `, [
          id
        ]);

        let data = result[0];

        res(data);
      } catch (e) {
        rej(e);
      }
    })
  }
}

module.exports = Tb_productos;