const Table = require('../utils/template/Table');

const name = 'tb_clientes';
const columns = {
  id: { name: 'id', null: false, type: 'Integer', limit: 11 },
  nombres: { name: 'nombres', null: false, type: 'String', limit: 50 },
  telefono: { name: 'telefono ', null: true, type: 'String', limit: 20, unic: true },
  direccion: { name: 'direccion', null: true, type: 'String', limit: 50 },
  tipo_cliente_id: { name: 'tipo_cliente_id', null: false, type: 'Integer', limit: 11 },
  tipo_documento_id: { name: 'tipo_documento_id', null: false, type: 'Integer', limit: 11 },
  num_documento: { name: 'num_documento ', null: false, type: 'String', limit: 20, unic: true },
  creacion: { name: 'creacion', null: false, type: 'String', limit: 25 },
  estado: { name: 'estado', null: false, type: 'Integer', limit: 1 }
}

/** 
 * @typedef {{
 *   id: number,
 *   nombres: string,
 *   telefono: string,
 *   direccion: string,
 *   tipo_cliente_id: number,
 *   tipo_documento_id: number,
 *   num_documento: string,
 *   estado: number
 * }} COLUMNS
 */

/** @extends {Table<COLUMNS>} */
class Tb_clientes extends Table {
  /** @param {import('../app')} app */  constructor(app) {
    super(name);
    this.columns = columns;
    this.app = app;

    this.io = app.socket.node.selectNodes(
      '/control/movimientos/ventas',
      '/control/mantenimiento/clientes',
    )
  }
  /* 
    ====================================================================================================
    =============================================== Tabla ===============================================
    ====================================================================================================
  */
  /**
   * @param {import('datatables.net-dt').AjaxData} option 
   * @returns {Promise<COLUMNS[]>}
   */
  readInParts(option) {
    return new Promise(async (res, rej) => {
      try {
        let { order, start, length, search } = option;

        let query = `
          SELECT
            c.id,
            c.nombres,
            c.telefono,
            c.direccion,
            c.tipo_cliente_id,
            tc.nombre AS tipo_cliente_nombre,
            c.tipo_documento_id,
            td.nombre AS tipo_documento_nombre,
            c.num_documento,
            c.creacion,
            c.estado
          FROM 
            tb_clientes AS c
          INNER 
            JOIN 
              tipo_cliente AS tc
            ON 
              tc.id = c.tipo_cliente_id
          INNER 
            JOIN 
              tipo_documento AS td
            ON 
              td.id = c.tipo_documento_id
        `, queryParams = [];

        if (search.value) {
          query += `
            WHERE
              c.nombres LIKE ?
              OR c.telefono LIKE ?
              OR c.direccion LIKE ?
              OR c.num_documento LIKE ?
              OR tc.nombre LIKE ?
              OR td.nombre LIKE ?
          `;

          queryParams.push(
            `%${search.value}%`,
            `%${search.value}%`,
            `%${search.value}%`,
            `%${search.value}%`,
            `%${search.value}%`,
            `%${search.value}%`
          );
        }

        let columnsSet = new Set([
          'c.nombres',
          'c.telefono',
          'c.direccion',
          'c.num_documento',
          'tc.nombre',
          'td.nombre',
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

        let [result] = await this.app.model.poolValues(query, queryParams);

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
            tb_clientes AS c
          INNER 
            JOIN 
              tipo_cliente AS tc
            ON 
              tc.id = c.tipo_cliente_id
          INNER 
            JOIN 
              tipo_documento AS td
            ON 
              td.id = c.tipo_documento_id
        `, queryParams = [];

        if (search.value) {
          query += `
            WHERE
              c.nombres LIKE ?
              OR c.telefono LIKE ?
              OR c.direccion LIKE ?
              OR c.num_documento LIKE ?
              OR tc.nombre LIKE ?
              OR td.nombre LIKE ?
          `;

          queryParams.push(
            `%${search.value}%`,
            `%${search.value}%`,
            `%${search.value}%`,
            `%${search.value}%`,
            `%${search.value}%`,
            `%${search.value}%`
          );
        }

        let [result] = await this.app.model.poolValues(query, queryParams);

        res(result[0].cantidad);
      } catch (e) {
        rej(e);
      }
    })
  }
  /** 
   * @param {COLUMNS} data 
   * @returns {Promise<import('mysql').OkPacket>}
   */
  insert(data) {
    return new Promise(async (res, rej) => {
      try {
        let {
          nombres,
          telefono,
          direccion,
          tipo_cliente_id,
          tipo_documento_id,
          num_documento,
          estado = 1
        } = data;

        this.constraint('nombres', nombres);
        this.constraint('telefono', telefono, { unic: true });
        this.constraint('direccion', direccion);
        this.constraint('tipo_cliente_id', tipo_cliente_id);
        this.constraint('tipo_documento_id', tipo_documento_id);
        this.constraint('num_documento', num_documento, { unic: true });

        let [result] = await this.app.model.poolValues(`
          INSERT INTO
            tb_clientes (
              nombres,
              telefono,
              direccion,
              tipo_cliente_id,
              tipo_documento_id,
              num_documento,
              estado
            )
          VALUES (
            ?,
            ?,
            ?,
            ?,
            ?,
            ?,
            ?
          )
        `, [
          nombres,
          telefono,
          direccion,
          tipo_cliente_id,
          tipo_documento_id,
          num_documento,
          estado
        ]);

        this.io.emitSocket(
          '/clientes/data/insert',
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
            c.id,
            c.nombres,
            c.telefono,
            c.direccion,
            c.tipo_cliente_id,
            tc.nombre AS tipo_cliente_nombre,
            c.tipo_documento_id,
            td.nombre AS tipo_documento_nombre,
            c.num_documento,
            c.creacion,
            c.estado
          FROM 
            tb_clientes AS c
          INNER 
            JOIN 
              tipo_cliente AS tc
            ON 
              tc.id = c.tipo_cliente_id
          INNER 
            JOIN 
              tipo_documento AS td
            ON 
              td.id = c.tipo_documento_id
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
 *   nombres:string,
 *   telefono:string,
 *   direccion:string,
 *   tipo_cliente_id:number,
 *   tipo_cliente_nombre:string,
 *   tipo_documento_id:number,
 *   tipo_documento_nombre:string,
 *   num_documento:string,
 *   estado:number
 * }>}
 */
  readIdJoin(id) {
    return new Promise(async (res, rej) => {
      try {

        this.constraint('id', id);

        let [result] = await this.app.model.poolValues(`
          SELECT
            c.id,
            c.nombres,
            c.telefono,
            c.direccion,
            c.tipo_cliente_id,
            tc.nombre AS tipo_cliente_nombre,
            c.tipo_documento_id,
            td.nombre AS tipo_documento_nombre,
            c.num_documento,
            c.creacion,
            c.estado
          FROM 
            tb_clientes AS c
          INNER 
            JOIN 
              tipo_cliente AS tc
            ON 
              tc.id = c.tipo_cliente_id
          INNER 
            JOIN 
              tipo_documento AS td
            ON 
              td.id = c.tipo_documento_id
          WHERE
            c.id = ?
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
          nombres,
          telefono,
          direccion,
          tipo_cliente_id,
          tipo_documento_id,
          num_documento
        } = data;

        this.constraint('id', id);
        this.constraint('nombres', nombres);
        this.constraint('telefono', telefono, { unic: id });
        this.constraint('direccion', direccion);
        this.constraint('tipo_cliente_id', tipo_cliente_id);
        this.constraint('tipo_documento_id', tipo_documento_id);
        this.constraint('num_documento', num_documento, { unic: id });

        let [result] = await this.app.model.poolValues(`
          UPDATE 
            tb_clientes
          SET
            nombres = ?,
            telefono = ?,
            direccion = ?,
            tipo_cliente_id = ?,
            tipo_documento_id = ?,
            num_documento = ?
          WHERE 
            id = ?
        `, [
          nombres,
          telefono,
          direccion,
          tipo_cliente_id,
          tipo_documento_id,
          num_documento,
          id
        ]);

        this.io.emitSocket(
          '/clientes/data/updateId',
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
              tb_clientes
            SET
              estado = ?
            WHERE 
              id = ?
          `, [
          estado,
          id
        ]);

        this.io.emitSocket(
          '/clientes/data/state',
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
            tb_clientes
          WHERE
            id = ?
        `, [
          id
        ]);

        this.io.emit(
          '/clientes/data/deleteId',
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
   * @returns {Promise<COLUMNS[]>}
   */
  SelectorInParts(option) {
    return new Promise(async (res, rej) => {
      try {
        let { order, start, length, search, byId, noInclude } = option;

        let query = `
          SELECT 
            id,
            nombres AS name
          FROM
            tb_clientes
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
              AND nombres LIKE ?
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
              nombres ${order == 'asc' ? 'ASC' : 'DESC'}
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
            tipo_documento
          WHERE
            estado = 1 
        `, queryParams = [];

        if (typeof search == 'string' && search != '') {
          query += `
            AND nombres LIKE ?
          `;

          queryParams.push(`%${search}%`);
        }

        if (noInclude.length && noInclude.every(id => typeof id == 'number')) {
          query += `
            AND id NOT IN (${noInclude.map(_ => '?').join(',')})
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
            tb_clientes
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
              tb_clientes
            WHERE
              estado = 1
          `)

        res(result[0].cantidad_accesos);
      } catch (e) {
        rej(e);
      }
    })
  }
}

module.exports = Tb_clientes;