const { Table } = require('../utils/UtilsModel');

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

class Tb_roles extends Table {
  /** @param {import('../../app')} app */
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
   * @returns {Promise<Array.<{code: string, name: string}>>}
   */
  selectorReadAll() {
    return new Promise(async (res, rej) => {
      try {
        let [result] = await this.app.model.pool(`
          SELECT 
            id,
            nombre AS name
          FROM
            tipo_rol
        `)

        res(result);
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