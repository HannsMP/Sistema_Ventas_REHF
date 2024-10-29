const Table = require('../utils/template/Table');

const name = 'tipo_documento';
const columns = {
  id: { name: 'id', null: false, type: 'Integer', limit: 11 },
  nombre: { name: 'nombre', null: false, type: 'String', limit: 20 },
  estado: { name: 'estado', null: false, type: 'Integer', limit: 1 }
}

/** 
 * @typedef {{
 *   id: number,
 *   nombre: string,
 *   estado: number
 * }} COLUMNS
 */

/** @extends {Table<COLUMNS>} */
class Tipo_documento extends Table {
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
            tipo_documento
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
  chartCountTypeDocument() {
    return new Promise(async (res, rej) => {
      try {
        let [result] = await this.app.model.pool(`
          SELECT 
            td.nombre AS nombre,
            COALESCE(COUNT(c.id), 0) AS cantidad_tipo_cliente
          FROM 
            tipo_documento AS td
          LEFT JOIN 
            tb_clientes AS c
            ON 
              c.tipo_cliente_id = td.id
          WHERE 
            td.id IN (1, 2, 3)
            AND c.estado = 1
          GROUP BY 
            td.nombre;
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

module.exports = Tipo_documento;