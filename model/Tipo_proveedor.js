const Table = require('../utils/template/Table');

const name = 'tipo_proveedor';
const columns = {
  id: { name: 'id', null: false, type: 'Integer', limit: 11 },
  nombre: { name: 'nombre', null: false, type: 'String', limit: 20 },
  descripcion: { name: 'descripcion ', null: false, type: 'String', limit: 50 }
}

/** 
 * @typedef {{
 *   id: number,
 *   nombre: string,
 *   descripcion: string
 * }} COLUMNS
 */

/** @extends {Table<COLUMNS>} */
class Tipo_proveedor extends Table {
  /** @param {import('../app')} app */  constructor(app) {
    super(name);
    this.columns = columns;
    this.app = app;
  }
  /* 
    ====================================================================================================
    ============================================== Selector ==============================================
    ====================================================================================================
  */
  /**
   * @param {SelectorRequest} option 
   * @returns {Promise<COLUMNS[]>}
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
            tipo_proveedor
        `, queryParams = [];

        let includeWhere = false;
        if (search) {
          if (byId) {
            query += `
              WHERE
                id = ?
            `;

            includeWhere = true;
            queryParams.push(search);
          }
          else {
            query += `
              WHERE
                nombre LIKE ?
            `;

            includeWhere = true;
            queryParams.push(`%${search}%`);
          }
        }

        if (noInclude.length && noInclude.every(id => typeof id == 'number')) {
          query += `
            ${includeWhere ? 'AND' : 'WHERE'}
              id NOT IN (${noInclude.map(_ => '?').join(',')})
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

        let [result] = await this.app.model.poolValues(query, queryParams);

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
            tipo_proveedor
        `, queryParams = [];

        if (typeof search == 'string' && search != '') {
          query += `
            WHERE
              nombre LIKE ?
          `;

          queryParams.push(`%${search}%`);
        }

        if (noInclude.length && noInclude.every(id => typeof id == 'number')) {
          query += `
            WHERE
              id NOT IN (${noInclude.map(_ => '?').join(',')})
          `
          queryParams.push(...noInclude);
        }

        let [result] = await this.app.model.poolValues(query, queryParams);

        res(result[0].cantidad);
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
  chartCountTypeProvider() {
    return new Promise(async (res, rej) => {
      try {
        let [result] = await this.app.model.pool(`
          SELECT 
            tp.nombre AS nombre,
            COALESCE(COUNT(p.id), 0) AS cantidad_tipo_proveedor
          FROM 
            tipo_proveedor AS tp
          LEFT JOIN 
            tb_proveedores AS p
            ON 
              p.tipo_proveedor_id = tp.id
          WHERE 
            tp.id IN (1, 2, 3, 4)
            AND p.estado = 1
          GROUP BY 
            tp.nombre;
          `)

        let label = [], data = [];

        result.forEach(({ nombre, cantidad_tipo_proveedor }) => {
          label.push(nombre);
          data.push(cantidad_tipo_proveedor);
        })

        res({ label, data });
      } catch (e) {
        rej(e);
      }
    })
  }
}

module.exports = Tipo_proveedor;