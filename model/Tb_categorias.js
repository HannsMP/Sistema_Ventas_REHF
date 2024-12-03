const Table = require('../utils/template/Table');
const Id = require('../utils/Id');

const name = 'tb_categorias';
const columns = {
  id: { name: 'id', null: false, type: 'Integer', limit: 11 },
  nombre: { name: 'nombre', null: false, type: 'String', limit: 50, unic: true },
  codigo: { name: 'codigo', null: false, type: 'String', limit: 10 },
  descripcion: { name: 'descripcion', null: true, type: 'String', limit: 250 },
  creacion: { name: 'creacion', null: false, type: 'String', limit: 25 },
  estado: { name: 'estado', null: false, type: 'Integer', limit: 1 }
}

/**
 * @typedef {{
 *   id: number,
 *   nombre: string,
 *   codigo: string,
 *   descripcion: string,
 *   creacion: string,
 *   estado: number
 * }} COLUMNS_CATEGORIAS
 */

/** @extends {Table<COLUMNS_CATEGORIAS>} */
class Tb_categorias extends Table {
  id = new Id('T    ', { letters: true, numeric: true });

  /** @param {import('../app')} app */
  constructor(app) {
    super(name);
    this.columns = columns;
    this.app = app;

    this.io = app.socket.node.selectNodes(
      '/control/productos',
      '/control/mantenimiento/categorias',
      '/control/mantenimiento/inventario',
    );
  }
  /*
    ====================================================================================================
    =============================================== Tabla ===============================================
    ====================================================================================================
  */
  /**
   * @param {import('datatables.net-dt').AjaxData} option
   * @returns {Promise<COLUMNS_CATEGORIAS[]>}
   */
  readInParts(option) {
    return new Promise(async (res, rej) => {
      try {
        let { order, start, length, search } = option;

        let query = `
          SELECT
            c.id,
            c.nombre,
            c.codigo,
            c.descripcion,
            c.creacion,
            c.estado,
            COALESCE(COUNT(p.id), 0) AS producto_cantidad
          FROM
            tb_categorias AS c
          LEFT JOIN
            tb_productos AS p
            ON p.categoria_id = c.id
        `, queryParams = [];

        if (search.value) {
          query += `
            WHERE
              c.nombre LIKE ?
              OR c.codigo LIKE ?
              OR c.descripcion LIKE ?
              OR c.creacion LIKE ?
          `;

          queryParams.push(
            `%${search.value}%`,
            `%${search.value}%`,
            `%${search.value}%`,
            `%${search.value}%`
          );
        }

        query += `
          GROUP BY
            c.id
        `;

        let columnsSet = new Set([
          'c.nombre',
          'c.codigo',
          'c.descripcion',
          'c.creacion'
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
            COUNT(c.id) AS cantidad
          FROM
            tb_categorias AS c
        `, queryParams = [];

        if (search.value) {
          query += `
            WHERE
              c.nombre LIKE ?
              OR c.codigo LIKE ?
              OR c.descripcion LIKE ?
              OR c.creacion LIKE ?
          `;

          queryParams.push(
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
   * @param {COLUMNS_CATEGORIAS} data
   * @returns {Promise<import('mysql').OkPacket>}
   */
  insert(data) {
    return new Promise(async (res, rej) => {
      try {
        let {
          nombre,
          codigo,
          descripcion,
          estado = 1
        } = data;

        this.constraint('nombre', nombre, { unic: true });
        this.constraint('codigo', codigo);
        this.constraint('descripcion', descripcion);
        this.constraint('estado', estado);

        let [result] = await this.app.model.pool(`
          INSERT INTO
            tb_categorias (
              nombre,
              codigo,
              descripcion,
              estado
            )
          VALUES (
            ?,
            ?,
            ?,
            ?
          )
        `, [
          nombre,
          codigo,
          descripcion,
          estado
        ]);

        this.io.emitSocket(
          '/categorias/data/insert',
          {
            id: result.insertId,
            codigo,
            descripcion,
            estado,
            nombre
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
   * @returns {Promise<{
   *   id: number,
   *   nombre: string,
   *   codigo: string,
   *   descripcion: string,
   *   creacion: string,
   *   estado: string,
   *   producto_cantidad: number,
   * }>}
   */
  readIdCount(id) {
    return new Promise(async (res, rej) => {
      try {

        this.constraint('id', id);

        let [result] = await this.app.model.pool(`
          SELECT
            c.id,
            c.nombre,
            c.codigo,
            c.descripcion,
            c.creacion,
            c.estado,
            COALESCE(COUNT(p.id), 0) AS producto_cantidad
          FROM
            tb_categorias AS c
          LEFT JOIN
            tb_productos AS p
            ON p.categoria_id = c.id
          WHERE
            c.id = ?
          GROUP BY
            c.id;
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
   * @param {number} id
   * @param {COLUMNS_CATEGORIAS} data
   * @returns {Promise<import('mysql').OkPacket>}
   */
  updateId(id, data) {
    return new Promise(async (res, rej) => {
      try {
        let {
          nombre,
          descripcion
        } = data;

        this.constraint('id', id);
        this.constraint('nombre', nombre, { unic: id });
        this.constraint('descripcion', descripcion);

        let [result] = await this.app.model.pool(`
          UPDATE
            tb_categorias
          SET
            nombre = ?,
            descripcion = ?
          WHERE
            id = ?
        `, [
          nombre,
          descripcion,
          id
        ]);

        this.io.emitSocket(
          '/categorias/data/updateId',
          {
            id,
            nombre,
            descripcion
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

        let [result] = await this.app.model.pool(`
          UPDATE
            tb_categorias
          SET
            estado = ?
          WHERE
            id = ?;
        `, [
          estado,
          id
        ]);

        this.io.emitSocket(
          '/categorias/data/state',
          { id, estado }
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

        let [result] = await this.app.model.pool(`
          DELETE FROM
            tb_categorias
          WHERE
            id = ?
        `, [
          id
        ]);

        this.io.emitSocket(
          '/categorias/data/deleteId',
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
   * @returns {Promise<import('mysql').OkPacket>}
   */
  deleteAllId(id) {
    return new Promise(async (res, rej) => {
      try {
        this.constraint('id', id);

        await this.app.model.pool(`
          DELETE FROM
            tb_productos
          WHERE
            categoria_id = ?
        `, [
          id
        ]);

        let [result] = await this.app.model.pool(`
          DELETE FROM
            tb_categorias
          WHERE
            id = ?
        `, [
          id
        ]);

        this.app.model.tb_productos.io.emitSocket(
          '/productos/categorias/deleteId',
          { id }
        )
        this.io.emitSocket(
          '/categorias/data/deleteId',
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
    ============================================== Selector ==============================================
    ====================================================================================================
  */
  /**
   * @param {SelectorRequest} option
   * @returns {Promise<COLUMNS_CATEGORIAS[]>}
   */
  SelectorInParts(option) {
    return new Promise(async (res, rej) => {
      try {
        let { order, start, length, search, byId, noInclude } = option;

        let query = `
          SELECT
            id,
            nombre AS name
          FROM
            tb_categorias
          WHERE
            estado = 1
        `, queryParams = [];

        if (search) {
          if (byId) {
            query += `
              AND id = ?
            `;

            queryParams.push(search);
          }
          else {
            query += `
              AND nombre LIKE ?
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
              nombre ${order == 'asc' ? 'ASC' : 'DESC'}
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
            tb_categorias
          WHERE
            estado = 1
        `, queryParams = [];

        if (typeof search == 'string' && search != '') {
          query += `
            AND nombre LIKE ?
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
            tb_categorias
          WHERE
            estado = 1
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
              COALESCE(COUNT(id), 0) AS cantidad_accesos
            FROM
              tb_categorias
            WHERE
              estado = 1
          `)

        res(result[0].cantidad_accesos);
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
  chartCountCategory() {
    return new Promise(async (res, rej) => {
      try {
        let [result] = await this.app.model.pool(`
          SELECT
            c.nombre AS categoria_nombre,
            COALESCE(COUNT(p.id), 0) AS cantidad_productos
          FROM
            tb_categorias AS c
          LEFT JOIN
            tb_productos AS p
            ON
              p.categoria_id = c.id
          WHERE
            c.estado = 1
            AND p.estado = 1
          GROUP BY
            c.nombre;
          `)

        let label = [], data = [];

        result.forEach(({ categoria_nombre, cantidad_productos }) => {
          label.push(categoria_nombre);
          data.push(cantidad_productos);
        })

        res({ label, data });
      } catch (e) {
        rej(e);
      }
    })
  }
}

module.exports = Tb_categorias;