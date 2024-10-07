const { Table } = require('../utils/UtilsModel');
const SocketRouter = require('../utils/SocketRouter');

const name = 'tipo_cliente';
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

class Tipo_cliente extends Table {
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
            tipo_cliente
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
            tc.nombre AS nombre,
            COALESCE(COUNT(c.id), 0) AS cantidad_tipo_cliente
          FROM 
            tipo_cliente AS tc
          LEFT JOIN 
            tb_clientes AS c
            ON 
              c.tipo_cliente_id = tc.id
          WHERE 
            tc.id IN (1, 2, 3)
            AND c.estado = 1
          GROUP BY 
            tc.nombre;
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

module.exports = Tipo_cliente;