const Table = require('../utils/template/Table');

const name = 'tipo_rol'
const columns = {
  id: { name: 'id', null: false, type: 'Integer', limit: 11 },
  nombre: { name: 'nombre', null: false, type: 'String', limit: 50 },
  descripcion: { name: 'descripcion', null: false, type: 'String', limit: 250 }
}

/** 
 * @typedef {{
*   id: number,
*   nombre: string,
*   descripcion: string
* }} COLUMNS
*/

/** @extends {Table<COLUMNS>} */
class Tb_roles extends Table {
  /** @param {import('../app')} app */
  constructor(app) {
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
   * @param {number} myRolId 
   * @returns {Promise<COLUMNS[]>}
   */
  SelectorInParts(option, myRolId) {
    return new Promise(async (res, rej) => {
      try {
        let { order, start, length, search, byId, noInclude } = option;

        let query = `
          SELECT 
            id,
            nombre AS name
          FROM
            tipo_rol
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

        if (myRolId > 1 && Number.isInteger(myRolId)) {
          query += ` 
            ${includeWhere ? 'AND' : 'WHERE'} 
            ? < id 
          `;
          includeWhere = true;
          queryParams.push(myRolId);
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
              id ${order == 'asc' ? 'ASC' : 'DESC'}
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
   * @param {number} myRolId 
   * @returns {Promise<number>}
   */
  SelectorInPartsCount(option, myRolId) {
    return new Promise(async (res, rej) => {
      try {
        let { search, noInclude } = option;

        let query = `
          SELECT 
            COUNT(id) AS cantidad
          FROM
            tipo_rol
        `, queryParams = [];

        if (typeof search == 'string' && search != '') {
          query += `
            WHERE
              nombre LIKE ?
          `;

          queryParams.push(`%${search}%`);
        }

        if (myRolId > 1 && Number.isInteger(myRolId)) {
          query += ` 
            ${includeWhere ? 'AND' : 'WHERE'} 
            ? < id 
          `;
          includeWhere = true;
          queryParams.push(myRolId);
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
   * @returns {Promise<{rol_nombre:string, cantidad_usuarios:number}[]>}
   */
  chartCountRoles() {
    return new Promise(async (res, rej) => {
      try {
        let [result] = await this.app.model.pool(`
          SELECT 
            r.nombre AS rol_nombre,
            COALESCE(COUNT(u.id), 0) AS cantidad_usuarios
          FROM 
            tipo_rol AS r
          LEFT JOIN 
            tb_usuarios AS u 
            ON 
              u.rol_id = r.id
          WHERE 
            r.id IN (1, 2, 3, 4, 5)
          GROUP BY 
            r.nombre;
        `)

        let label = [], data = [];

        result.forEach(({ rol_nombre, cantidad_usuarios }) => {
          label.push(rol_nombre);
          data.push(cantidad_usuarios);
        })

        res({ label, data });
      } catch (e) {
        rej(e);
      }
    })
  }
}

module.exports = Tb_roles;