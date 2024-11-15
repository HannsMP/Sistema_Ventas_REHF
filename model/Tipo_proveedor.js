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
            tipo_proveedor
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
   * @returns {Promise<COLUMNS[]>}
   */
  chartCountTypeClient() {
    return new Promise(async (res, rej) => {
      try {
        let [result] = await this.app.model.pool(`
          SELECT 
            tp.nombre AS nombre,
            COALESCE(COUNT(p.id), 0) AS cantidad_tipo_cliente
          FROM 
            tipo_proveedor AS tp
          LEFT JOIN 
            tb_proveedores AS p
            ON 
              p.tipo_cliente_id = tp.id
          WHERE 
            tp.id IN (1, 2, 3)
            AND p.estado = 1
          GROUP BY 
            tp.nombre;
          `)

        let label = [], data = [];

        result.forEach(({ nombre, cantidad_tipo_cliente }) => {
          label.push(nombre);
          data.push(cantidad_tipo_cliente);
        })

        res({ label, data });
      } catch (e) {
        rej(e);
      }
    })
  }
}

module.exports = Tipo_proveedor;