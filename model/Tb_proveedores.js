const Table = require('../utils/template/Table');

const name = 'tb_proveedores';
const columns = {
  id: { name: 'id', null: false, type: 'Integer', limit: 11 },
  titular: { name: 'titular', null: false, type: 'String', limit: 50 },
  telefono: { name: 'telefono ', null: true, type: 'String', limit: 20, unic: true },
  direccion: { name: 'direccion', null: true, type: 'String', limit: 50 },
  tipo_proveedor_id: { name: 'tipo_proveedor_id', null: false, type: 'Integer', limit: 11 },
  tipo_documento_id: { name: 'tipo_documento_id', null: false, type: 'Integer', limit: 11 },
  num_documento: { name: 'num_documento ', null: false, type: 'String', limit: 20, unic: true },
  creacion: { name: 'creacion', null: false, type: 'String', limit: 25 },
  estado: { name: 'estado', null: false, type: 'Integer', limit: 1 }
}

/** 
 * @typedef {{
 *   id: number,
 *   titular: string,
 *   telefono: string,
 *   direccion: string,
 *   tipo_proveedor_id: number,
 *   tipo_documento_id: number,
 *   num_documento: string,
 *   estado: number
 * }} COLUMNS_PROVEEDORES
 */

/** @extends {Table<COLUMNS_PROVEEDORES>} */
class Tb_proveedores extends Table {
  /** @param {import('../app')} app */  constructor(app) {
    super(name);
    this.columns = columns;
    this.app = app;

    this.io = app.socket.node.selectNodes(
      '/control/movimientos/compras',
      '/control/mantenimiento/proveedores',
    )
  }
  /* 
    ====================================================================================================
    =============================================== Tabla ===============================================
    ====================================================================================================
  */
  /**
   * @param {import('datatables.net-dt').AjaxData} option 
   * @returns {Promise<COLUMNS_PROVEEDORES[]>}
   */
  readInParts(option) {
    return new Promise(async (res, rej) => {
      try {
        let { order, start, length, search } = option;

        let query = `
          SELECT
            p.id,
            p.titular,
            p.telefono,
            p.direccion,
            p.tipo_proveedor_id,
            tp.nombre AS tipo_proveedor_nombre,
            p.tipo_documento_id,
            td.nombre AS tipo_documento_nombre,
            p.num_documento,
            p.creacion,
            p.estado
          FROM 
            tb_proveedores AS p
          INNER 
            JOIN 
              tipo_proveedor AS tp
            ON 
              tp.id = p.tipo_proveedor_id
          INNER 
            JOIN 
              tipo_documento AS td
            ON 
              td.id = p.tipo_documento_id
        `, queryParams = [];

        if (search.value) {
          query += `
            WHERE
              p.titular LIKE ?
              OR p.telefono LIKE ?
              OR p.direccion LIKE ?
              OR p.num_documento LIKE ?
              OR tp.nombre LIKE ?
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
          'p.titular',
          'p.telefono',
          'p.direccion',
          'p.num_documento',
          'tp.nombre',
          'td.nombre',
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
            COUNT(p.id) AS cantidad
          FROM 
            tb_proveedores AS p
          INNER 
            JOIN 
              tipo_proveedor AS tp
            ON 
              tp.id = p.tipo_proveedor_id
          INNER 
            JOIN 
              tipo_documento AS td
            ON 
              td.id = p.tipo_documento_id
        `, queryParams = [];

        if (search.value) {
          query += `
            WHERE
              p.titular LIKE ?
              OR p.telefono LIKE ?
              OR p.direccion LIKE ?
              OR p.num_documento LIKE ?
              OR tp.nombre LIKE ?
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
   * @param {COLUMNS_PROVEEDORES} data 
   * @returns {Promise<import('mysql').OkPacket>}
   */
  insert(data) {
    return new Promise(async (res, rej) => {
      try {
        let {
          titular,
          telefono,
          direccion,
          tipo_proveedor_id,
          tipo_documento_id,
          num_documento,
          estado = 1
        } = data;

        this.constraint('titular', titular);
        this.constraint('telefono', telefono, { unic: true });
        this.constraint('direccion', direccion);
        this.constraint('tipo_proveedor_id', tipo_proveedor_id);
        this.constraint('tipo_documento_id', tipo_documento_id);
        this.constraint('num_documento', num_documento, { unic: true });

        let [result] = await this.app.model.poolValues(`
          INSERT INTO
            tb_proveedores (
              titular,
              telefono,
              direccion,
              tipo_proveedor_id,
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
          titular,
          telefono,
          direccion,
          tipo_proveedor_id,
          tipo_documento_id,
          num_documento,
          estado
        ]);

        this.io.emitSocket(
          '/proveedores/data/insert',
          _ => this.readIdJoin(result.insertId)
        )

        res(result)
      } catch (e) {
        rej(e);
      }
    })
  }
  /**
   * @returns {Promise<COLUMNS_PROVEEDORES[]>}
   */
  readAllJoin() {
    return new Promise(async (res, rej) => {
      try {
        let [result] = await this.app.model.pool(`
          SELECT
            p.id,
            p.nombres,
            p.telefono,
            p.direccion,
            p.tipo_proveedor_id,
            tp.nombre AS tipo_proveedor_nombre,
            p.tipo_documento_id,
            td.nombre AS tipo_documento_nombre,
            p.num_documento,
            p.creacion,
            p.estado
          FROM 
            tb_proveedores AS p
          INNER 
            JOIN 
              tipo_proveedor AS tp
            ON 
              tp.id = p.tipo_proveedor_id
          INNER 
            JOIN 
              tipo_documento AS td
            ON 
              td.id = p.tipo_documento_id
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
 *   titular:string,
 *   telefono:string,
 *   direccion:string,
 *   tipo_proveedor_id:number,
 *   tipo_proveedor_nombre:string,
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
            p.id,
            p.titular,
            p.telefono,
            p.direccion,
            p.tipo_proveedor_id,
            tp.nombre AS tipo_proveedor_nombre,
            p.tipo_documento_id,
            td.nombre AS tipo_documento_nombre,
            p.num_documento,
            p.creacion,
            p.estado
          FROM 
            tb_proveedores AS p
          INNER 
            JOIN 
              tipo_proveedor AS tp
            ON 
              tp.id = p.tipo_proveedor_id
          INNER 
            JOIN 
              tipo_documento AS td
            ON 
              td.id = p.tipo_documento_id
          WHERE
            p.id = ?
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
   * @param {COLUMNS_PROVEEDORES} data 
   * @returns {Promise<import('mysql').OkPacket>}
   */
  updateId(id, data) {
    return new Promise(async (res, rej) => {
      try {
        let {
          titular,
          telefono,
          direccion,
          tipo_proveedor_id,
          tipo_documento_id,
          num_documento
        } = data;

        this.constraint('id', id);
        this.constraint('titular', titular);
        this.constraint('telefono', telefono, { unic: id });
        this.constraint('direccion', direccion);
        this.constraint('tipo_proveedor_id', tipo_proveedor_id);
        this.constraint('tipo_documento_id', tipo_documento_id);
        this.constraint('num_documento', num_documento, { unic: id });

        let [result] = await this.app.model.poolValues(`
          UPDATE 
            tb_proveedores
          SET
            titular = ?,
            telefono = ?,
            direccion = ?,
            tipo_proveedor_id = ?,
            tipo_documento_id = ?,
            num_documento = ?
          WHERE 
            id = ?
        `, [
          titular,
          telefono,
          direccion,
          tipo_proveedor_id,
          tipo_documento_id,
          num_documento,
          id
        ]);

        this.io.emitSocket(
          '/proveedores/data/updateId',
          {
            id,
            titular,
            telefono,
            direccion,
            tipo_proveedor_id,
            tipo_documento_id,
            num_documento
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

        let [result] = await this.app.model.poolValues(`
            UPDATE 
              tb_proveedores
            SET
              estado = ?
            WHERE 
              id = ?
          `, [
          estado,
          id
        ]);

        this.io.emitSocket(
          '/proveedores/data/state',
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
            tb_proveedores
          WHERE
            id = ?
        `, [
          id
        ]);

        this.io.emitSocket(
          '/proveedores/data/deleteId',
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
   * @returns {Promise<COLUMNS_PROVEEDORES[]>}
   */
  SelectorInParts(option) {
    return new Promise(async (res, rej) => {
      try {
        let { order, start, length, search, byId, noInclude } = option;

        let query = `
          SELECT 
            id,
            titular AS name
          FROM
            tb_proveedores
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
              AND titular LIKE ?
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
              titular ${order == 'asc' ? 'ASC' : 'DESC'}
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
            tb_proveedores
          WHERE
            estado = 1 
        `, queryParams = [];

        if (typeof search == 'string' && search != '') {
          query += `
            AND titular LIKE ?
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
            tb_proveedores
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
              tb_proveedores
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

module.exports = Tb_proveedores;