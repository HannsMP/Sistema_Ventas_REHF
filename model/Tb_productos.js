const Table = require('../utils/template/Table');
const Id = require('../utils/Id');

const name = 'tb_productos';
const columns = {
  id: { name: 'id', null: false, type: 'Integer', limit: 11 },
  codigo: { name: 'codigo', null: false, type: 'String', limit: 20, unic: true },
  producto: { name: 'nombre', null: false, type: 'String', limit: 50 },
  descripcion: { name: 'descripcion', null: true, type: 'String', limit: 250 },
  venta: { name: 'venta', null: false, type: 'Number', limit: 10, decimal: 2 },
  stock_disponible: { name: 'stock_disponible', null: false, type: 'Integer', limit: 10 },
  stock_reservado: { name: 'stock_reservado', null: false, type: 'Integer', limit: 10 },
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
 *   venta: number,
 *   stock_disponible: number,
 *   stock_reservado: number,
 *   categoria_id: number,
 *   foto_id: number,
 *   creacion: string,
 *   estado: number,
 * }} COLUMNS_PRODUCTOS
 */

/** @extends {Table<COLUMNS_PRODUCTOS>} */
class Tb_productos extends Table {
  id = new Id('I        ', { letters: { upper: true } });

  /** @param {import('../app')} app */
  constructor(app) {
    super(name);
    this.columns = columns;
    this.app = app;

    this.io = app.socket.node.selectNodes(
      '/control/productos',
      '/control/movimientos/ventas',
      '/control/mantenimiento/inventario',
    )
  }
  /*
    ====================================================================================================
    =============================================== Tabla ===============================================
    ====================================================================================================
  */
  /**
   * @param {import('datatables.net-dt').AjaxData} option
   * @returns {Promise<COLUMNS_PRODUCTOS[]>}
   */
  readInParts(option) {
    return new Promise(async (res, rej) => {
      try {
        let { order, start, length, search } = option;

        let query = `
          SELECT
            p.id,
            p.codigo,
            p.producto,
            p.descripcion,
            p.stock_disponible,
            p.venta,
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
            p.estado in (1, 0)
        `, queryParams = [];

        if (search.value) {
          query += `
            AND p.codigo LIKE ?
            OR p.producto LIKE ?
            OR p.descripcion LIKE ?
            OR c.nombre LIKE ?
            OR p.creacion LIKE ?
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
          'p.codigo',
          'p.producto',
          'p.descripcion',
          'c.nombre',
          'p.creacion'
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
            COUNT(p.id) AS cantidad
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
            p.estado in (1, 0)
        `, queryParams = [];

        if (search.value) {
          query += `
            AND p.codigo LIKE ?
            OR p.producto LIKE ?
            OR p.descripcion LIKE ?
            OR c.nombre LIKE ?
            OR p.creacion LIKE ?
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
   * @param {COLUMNS_PRODUCTOS} data
   * @returns {Promise<import('mysql').OkPacket>}
   */
  insert(data) {
    return new Promise(async (res, rej) => {
      try {
        let {
          codigo,
          producto,
          descripcion,
          foto_id,
          venta,
          categoria_id,
          estado = 1
        } = data;

        this.constraint('codigo', codigo);
        this.constraint('producto', producto);
        this.constraint('descripcion', descripcion);
        this.constraint('venta', venta);
        this.constraint('categoria_id', categoria_id);
        this.constraint('estado', estado);

        let [result] = await this.app.model.pool(`
          INSERT INTO
            tb_productos (
              codigo,
              producto,
              descripcion,
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
          venta.toFixed(2),
          categoria_id,
          estado,
          foto_id || 2
        ]);

        this.io.emitSocket(
          '/productos/data/insert',
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
   * @param {COLUMNS_PRODUCTOS} data
   * @returns {Promise<import('mysql').OkPacket>}
   */
  updateId(id, data) {
    return new Promise(async (res, rej) => {
      try {
        let {
          producto,
          descripcion,
          categoria_id,
          venta,
          foto_id
        } = data;

        this.constraint('id', id);
        this.constraint('producto', producto);
        this.constraint('descripcion', descripcion);
        this.constraint('categoria_id', categoria_id);
        this.constraint('venta', venta);

        let values = [
          producto,
          descripcion,
          categoria_id,
          venta.toFixed(2)
        ]

        if (foto_id) values.push(foto_id);

        values.push(id);

        let [result] = await this.app.model.pool(`
          UPDATE
            tb_productos
          SET
            producto = ?,
            descripcion = ?,
            categoria_id = ?,
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

        this.io.emitSocket(
          '/productos/data/updateId',
          _ => this.readJoinId(id)
        )

        res(result)
      } catch (e) {
        rej(e);
      }
    })
  }
  /**
   * @param {number} id
   * @param {{
   *   stock_disponible?: number,
   *   venta?: number
   * }} data
   * @returns {Promise<import('mysql').OkPacket>}
   */
  updateIdBussines(id, data) {
    return new Promise(async (res, rej) => {
      try {
        let {
          stock_disponible,
          venta
        } = data;

        if (!stock_disponible && !venta) return;
        let query = `
          UPDATE
            tb_productos
          SET
            ${stock_disponible ? `stock_disponible = stock_disponible ${stock_disponible > 0 ? '+' : '-'} ?` : ''}
            ${stock_disponible && venta ? ',' : ''}
            ${venta ? 'venta = ?' : ''}
          WHERE
            id = ?
            AND (
              estado = 1
              OR estado = 0
            )
        `, queryParams = [];

        if (stock_disponible) {
          this.constraint('stock_disponible', stock_disponible);
          queryParams.push(Math.abs(stock_disponible));
        }
        if (venta) {
          this.constraint('venta', venta);
          queryParams.push(venta.toFixed(2));
        }

        queryParams.push(id);

        let [result] = await this.app.model.pool(query, queryParams);

        this.io.emitSocket(
          '/productos/data/updateIdBussines',
          {
            id,
            stock_disponible,
            venta
          }
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

        if (estado)
          this.refreshStockId(id);

        let [result] = await this.app.model.pool(`
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

        this.io.emitSocket(
          '/productos/data/state',
          estado
            ? _ => this.readJoinId(id)
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

        let [result] = await this.app.model.pool(`
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

        this.io.emitSocket(
          '/productos/data/deleteId',
          { id }
        )

        res(result)
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
   *   venta:number,
   *   categoria_id:number,
   *   categoria_nombre:string,
   *   foto_id:number,
   *   foto_src:string,
   *   creacion:string,
   *   estado:number
   * }>}
   */
  readJoinId(id) {
    return new Promise(async (res, rej) => {
      try {

        this.constraint('id', id);

        let [result] = await this.app.model.pool(`
          SELECT
            p.id,
            p.codigo,
            p.producto,
            p.descripcion,
            p.venta,
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
  /*
    ====================================================================================================
    ============================================= Categoria =============================================
    ====================================================================================================
  */
  /**
   * @param {CatalogueRequest} option
   * @returns {Promise<Item[]>}
   */
  catalogueInParts(option) {
    return new Promise(async (res, rej) => {
      try {
        let { order, visibility, start, length, filter } = option;

        let query = `
          SELECT
            p.id,
            p.codigo,
            p.producto,
            p.descripcion,
            p.venta,
            p.stock_disponible,
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
            ${visibility ? '' : 'AND p.stock_disponible !=0'}
        `, queryParams = [];

        if (filter.code) {
          query += `
            AND p.codigo = ?
          `;
          queryParams.push(`${filter.code}%`);
        }
        else {
          if (filter.value) {
            query += `
              AND p.producto LIKE ?
            `;
            queryParams.push(`%${filter.value}%`);
          }
          if (typeof filter.rangeMin == 'number' && 0 <= filter.rangeMin) {
            query += `
              AND p.venta >= ?
            `;
            queryParams.push(filter.rangeMin);
          }
          if (typeof filter.rangeMax == 'number' && 0 <= filter.rangeMax) {
            query += `
              AND p.venta <= ?
            `;
            queryParams.push(filter.rangeMax);
          }
          if (filter.nameTags?.length) {
            query += `
              AND p.categoria_id IN (${filter.nameTags.map(() => '?').join(', ')})
            `;
            queryParams.push(...filter.nameTags);
          }
        }

        query += `
          ORDER BY
            p.producto ${order == 'asc' ? 'ASC' : 'DESC'}
        `;

        // Paginación
        query += `
          LIMIT ? OFFSET ?
        `;
        queryParams.push(length, start);

        let [result] = await this.app.model.pool(query, queryParams);
        res(result);
      } catch (e) {
        rej(e);
      }
    });
  }

  /**
   * @param {CatalogueRequest} option
   * @returns {Promise<number>}
   */
  catalogueInPartsCount(option) {
    return new Promise(async (res, rej) => {
      try {
        let { filter } = option;

        let query = `
          SELECT
            COUNT(p.id) AS cantidad
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
        `, queryParams = [];

        // Condiciones de búsqueda general
        if (filter?.value) {
          query += ` AND p.producto LIKE ? `;
          queryParams.push(`%${filter.value}%`);
        }
        if (filter?.code) {
          query += ` AND p.codigo = ? `;
          queryParams.push(filter.code);
        }
        if (filter?.rangeMin !== undefined) {
          query += ` AND p.venta >= ? `;
          queryParams.push(filter.rangeMin);
        }
        if (filter?.rangeMax !== undefined) {
          query += ` AND p.venta <= ? `;
          queryParams.push(filter.rangeMax);
        }
        if (filter?.nameTags?.length) {
          query += ` AND p.categoria_id IN (${filter.nameTags.map(() => '?').join(', ')}) `;
          queryParams.push(...filter.nameTags);
        }
        if (filter?.order) {
          query += ` ORDER BY p.producto ${filter.order === 'asc' ? 'ASC' : 'DESC'} `;
        }

        let [result] = await this.app.model.pool(query, queryParams);

        res(result[0].cantidad);
      } catch (e) {
        rej(e);
      }
    })
  }
  /**
   * @param {number} categoria_id
   * @returns {Promise<{id:number}[]>}
   */
  readCategoriaId(categoria_id) {
    return new Promise(async (res, rej) => {
      try {

        this.app.model.tb_categorias.constraint('id', categoria_id);

        let [result] = await this.app.model.pool(`
          SELECT
            p.id
          FROM
            tb_productos AS p
          WHERE
            p.categoria_id = ?
        `, [
          categoria_id
        ]);

        res(result);
      } catch (e) {
        rej(e);
      }
    })
  }
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
          ? await this.app.model.pool(`
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
          : await this.app.model.pool(`
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

        this.io.emitSocket(
          '/productos/categorias/state',
          async () => {
            if (estado)
              return { estado }

            let data = await this.readCategoriaId(categoria_id);
            return { estado, data };
          }
        )

        res(result)
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
   * @returns {Promise<{venta:number, compra_prom:number}[]>}
   */
  readSalePriceMax() {
    return new Promise(async (res, rej) => {
      try {

        let [result] = await this.app.model.pool(`
          SELECT
          	AVG(c.compra) AS compra_prom,
            p.venta
          FROM
            tb_productos AS p
          RIGHT
          	JOIN
            	tb_compras AS c
			      ON
            	c.producto_id = p.id
          WHERE
            p.estado = 1
          GROUP BY 
            p.id
          ORDER BY
            compra_prom
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
   *   venta:number,
   *   stock_disponible:number
   * }>}
   */
  readPriceId(id) {
    return new Promise(async (res, rej) => {
      try {
        this.constraint('id', id);

        let [result] = await this.app.model.pool(`
          SELECT
            venta,
            stock_disponible
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
  /*
    ====================================================================================================
    ============================================== Selector ==============================================
    ====================================================================================================
  */
  /**
   * @param {SelectorRequest} option
   * @returns {Promise<COLUMNS_PRODUCTOS[]>}
   */
  SelectorInParts(option) {
    return new Promise(async (res, rej) => {
      try {
        let { order, start, length, search, byId, noInclude } = option;

        let query = `
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
        `, queryParams = [];

        if (search) {
          if (byId) {
            query += `
              AND p.id = ?
            `;

            queryParams.push(search);
          }
          else {
            query += `
              AND p.producto LIKE ?
            `;

            queryParams.push(`%${search}%`);
          }
        }

        if (noInclude.length && noInclude.every(id => typeof id == 'number')) {
          query += `
            AND p.id NOT IN (${noInclude.map(_ => '?').join(',')})
          `
          queryParams.push(...noInclude);
        }

        if (order) {
          query += `
            ORDER BY
              p.producto ${order == 'asc' ? 'ASC' : 'DESC'}
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
  SelectorInPartsCount(option) {
    return new Promise(async (res, rej) => {
      try {
        let { search, noInclude } = option;

        let query = `
          SELECT
            COUNT(id) AS cantidad
          FROM
            tb_productos
          WHERE
            estado = 1
        `, queryParams = [];

        if (typeof search == 'string' && search != '') {
          query += `
            AND producto LIKE ?
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
    ============================================= Bussines =============================================
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
  refreshStock() {
    return new Promise(async (res, rej) => {
      try {
        let [result] = await this.app.model.pool(`
            UPDATE
              tb_productos AS p
            SET
              p.stock_disponible = (
                SELECT
                  COALESCE(SUM(c.cantidad),0)
                FROM
                  tb_compras AS c
                WHERE
                  c.producto_id = p.id
              ) - (
                SELECT
                  COALESCE(SUM(v.cantidad),0)
                FROM
                  tb_ventas AS v
                WHERE
                  v.producto_id = p.id
              )
          `)
      } catch (e) {
        rej(e);
      }
    })
  }
  refreshStockId(id) {
    return new Promise(async (res, rej) => {
      try {
        let [result] = await this.app.model.pool(`
            UPDATE
              tb_productos AS p
            SET
              p.stock_disponible = (
                SELECT
                  COALESCE(SUM(c.cantidad),0)
                FROM
                  tb_compras AS c
                WHERE
                  c.producto_id = p.id
              ) - (
                SELECT
                  COALESCE(SUM(v.cantidad),0)
                FROM
                  tb_ventas AS v
                WHERE
                  v.producto_id = p.id
              )
            WHERE
              p.id = ?
          `, [
          id
        ])
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
   * @returns {Promise<{label:string[], data:number[]}>}
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
}

module.exports = Tb_productos;