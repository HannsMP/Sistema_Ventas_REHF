const { Table } = require('../utils/UtilsModel');
const SocketRouter = require('../utils/SocketRouter');

const name = 'tb_acceso';
const columns = {
  id: { name: 'id', null: false, type: 'Integer', limit: 11 },
  menu_id: { name: 'menu_id', null: false, type: 'Integer', limit: 11 },
  rol_id: { name: 'rol_id', null: false, type: 'Integer', limit: 11 },
  permiso_id: { name: 'permiso_id', null: false, type: 'Integer', limit: 11 },
  disabled_id: { name: 'disabled_id', null: false, type: 'Integer', limit: 11 }
}

/** 
 * @typedef {{
*   id: number,
*   menu_id: number,
*   rol_id: number,
*   permiso_id: number,
*   disabled_id: number
* }} COLUMNS
*/

class Tb_acceso extends Table {
  /** @param {import('../app')} app */
  constructor(app) {
    super(name);
    this.columns = columns;
    this.app = app;

    this.io = new SocketRouter([
      '/control/administracion/acceso'
    ], app)
  }
  /* 
    ====================================================================================================
    =============================================== Tabla ===============================================
    ====================================================================================================
  */
  /** 
   * @param {COLUMNS} data 
   * @returns {Promise<import('mysql').OkPacket>}
   */
  insert(data) {
    return new Promise(async (res, rej) => {
      try {
        let {
          menu_id,
          rol_id,
          permiso_id,
          disabled_id
        } = data;

        this.constraint('menu_id', menu_id);
        this.constraint('rol_id', rol_id);
        this.constraint('permiso_id', permiso_id);
        this.constraint('disabled_id', disabled_id);

        let [result] = await this.app.model.poolValues(`
          INSERT INTO
            tb_acceso (
              menu_id,
              rol_id,
              permiso_id,
              disabled_id
            )
          VALUES (
            ?,
            ?,
            ?,
            ?
          )
        `, [
          menu_id,
          rol_id,
          permiso_id,
          disabled_id
        ]);

        this.io.emit(
          '/productos/data/insert',
          _ => this.app.readIdJoin(result.insertId)
        )

        res(result);
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
              a.id,
              a.menu_id,
              m.ruta AS menu_ruta,
              m.principal AS menu_principal,
              a.rol_id,
              CONCAT(r.id, ' ', r.nombre) AS rol_nombre,
              a.permiso_id,
              CASE
                WHEN d.ver = 1 THEN -1
                ELSE p.ver
              END AS permiso_ver,
              CASE 
                WHEN d.agregar = 1 THEN -1 
                ELSE p.agregar 
              END AS permiso_agregar,
              CASE 
                WHEN d.editar = 1 THEN -1 
                ELSE p.editar 
              END AS permiso_editar,
              CASE 
                WHEN d.eliminar = 1 THEN -1 
                ELSE p.eliminar 
              END AS permiso_eliminar,
              CASE 
                WHEN d.ocultar = 1 THEN -1 
                ELSE p.ocultar 
              END AS permiso_ocultar,
              CASE 
                WHEN d.exportar = 1 THEN -1 
                ELSE p.exportar 
              END AS permiso_exportar
            FROM
              tb_acceso AS a
            INNER 
              JOIN 
                tb_menus AS m
              ON 
                m.id = a.menu_id
            INNER 
              JOIN 
                tipo_rol AS r
              ON 
                r.id = a.rol_id
            INNER 
              JOIN 
                tb_permisos AS p
              ON 
                p.id = a.permiso_id
            INNER 
              JOIN 
                tb_permisos AS d
              ON 
                d.id = a.disabled_id
          `)

        res(result);
      } catch (e) {
        rej(e);
      }
    })
  }
  /**
   * @param {number} id 
   * @param {{
   *   menu_id: number,
   *   rol_id: number,
   *   disabled_id: number,
   *   permiso_id: number,
   *   permiso_ver: number,
   *   permiso_agregar: number,
   *   permiso_editar: number,
   *   permiso_eliminar: number,
   *   permiso_ocultar: number,
   *   permiso_exportar: number
   * }} data 
   * @returns {Promise<import('mysql').OkPacket>}
   */
  updateId(id, data) {
    return new Promise(async (res, rej) => {
      try {
        let { menu_id, rol_id, permiso_id, disabled_id } = data

        this.constraint('id', id);
        this.constraint('menu_id', menu_id);
        this.constraint('rol_id', rol_id);
        this.constraint('permiso_id', permiso_id);
        this.constraint('disabled_id', disabled_id);

        let result = await this.app.model.poolValues(`
          UPDATE 
            tb_acceso
          SET
            menu_id = ?,
            rol_id = ?,
            permiso_id = ?,
            disabled_id = ?
          WHERE 
            id = ?;
        `, [
          menu_id,
          rol_id,
          permiso_id,
          disabled_id,
          id
        ]);

        res(result);
      } catch (e) {
        rej(e)
      }
    })
  }
  /**
   * @param {number} id 
   * @param {{
   *   ver: number,
   *   agregar: number,
   *   editar: number,
   *   eliminar: number,
   *   ocultar: number,
   *   exportar: number
   * }} permiso 
   * @returns {Promise<import('mysql').OkPacket>}
   */
  updateIdState(id, permiso) {
    return new Promise(async (res, rej) => {
      try {
        this.constraint('id', id);
        let permiso_id = this.computedPermisosToId(permiso)

        let [result] = await this.app.model.poolValues(`
          UPDATE 
            tb_acceso
          SET
            permiso_id = ?
          WHERE 
            id = ?;
        `, [
          permiso_id,
          id
        ]);

        this.io.emit(
          '/accesos/permisos/state',
          { id, permiso_id, permiso }
        )

        res(result)
      } catch (e) {
        rej(e)
      }
    })
  }
  /**
   * @param {{
   *   ver: number,
   *   agregar: number,
   *   editar: number,
   *   eliminar: number,
   *   ocultar: number,
   *   exportar: number
   * }} permisos 
   * @returns {number}
   */
  computedPermisosToId(permisos) {
    let value = 0;

    [
      permisos.ver,
      permisos.agregar,
      permisos.editar,
      permisos.eliminar,
      permisos.ocultar,
      permisos.exportar
    ]
      .forEach((c, i) => { if (c != -1 && c) value += (2 ** i) });

    return value;
  }
  /** 
   * @returns {Promise<COLUMNS[]>}
   */
  readJoinMenuById(id) {
    return new Promise(async (res, rej) => {
      try {
        this.constraint('id', id);

        let [result] = await this.app.model.poolValues(`
          SELECT 
            a.id,
            a.menu_id,
            m.ruta AS menu_ruta,
            m.principal AS menu_principal,
            a.rol_id,
            r.nombre AS rol_nombre,
            a.permiso_id,
            CASE 
              WHEN d.ver = 1 THEN -1 
              ELSE p.ver 
            END AS permiso_ver,
            CASE 
              WHEN d.agregar = 1 THEN -1 
              ELSE p.agregar 
            END AS permiso_agregar,
            CASE 
              WHEN d.editar = 1 THEN -1 
              ELSE p.editar 
            END AS permiso_editar,
            CASE 
              WHEN d.eliminar = 1 THEN -1 
              ELSE p.eliminar 
            END AS permiso_eliminar,
            CASE 
              WHEN d.ocultar = 1 THEN -1 
              ELSE p.ocultar 
            END AS permiso_ocultar,
            CASE 
              WHEN d.exportar = 1 THEN -1 
              ELSE p.exportar 
            END AS permiso_exportar
          FROM
            tb_acceso AS a
          INNER 
            JOIN 
              tb_menus AS m
            ON 
              m.id = a.menu_id
          INNER 
            JOIN 
              tipo_rol AS r
            ON 
              r.id = a.rol_id
          INNER 
            JOIN 
              tb_permisos AS p
            ON 
              p.id = a.permiso_id
          INNER 
            JOIN 
              tb_permisos AS d
            ON 
              d.id = a.disabled_id
          WHERE 
            menu_id = (
              SELECT menu_id 
              FROM tb_acceso 
              WHERE id = ?
            )
        `, [
          id
        ]);

        res(result)
      } catch (e) {
        rej(e)
      }
    })
  }
  /** 
   * @returns {Promise<{id:number, menu_id:number}[]>}
   */
  readMenusById(id) {
    return new Promise(async (res, rej) => {
      try {
        this.constraint('id', id);

        let [result] = await this.app.model.poolValues(`
          SELECT 
            id,
            menu_id
          FROM 
            tb_acceso 
          WHERE 
            menu_id = (
              SELECT menu_id 
              FROM tb_acceso 
              WHERE id = ?
            )
        `, [
          id
        ]);

        res(result)
      } catch (e) {
        rej(e)
      }
    })
  }
  /**
   * @param {number} id 
   * @returns {Promise<import('mysql').OkPacket>}
   */
  deleteMenusById(id) {
    return new Promise(async (res, rej) => {
      try {
        this.constraint('id', id);

        let [result] = await this.app.model.poolValues(`
          DELETE FROM 
            tb_acceso
          WHERE 
            menu_id = (
              SELECT 
                menu_id 
              FROM 
                tb_acceso 
              WHERE 
                id = ?
            )
        `, [
          id
        ]);

        res(result)
      } catch (e) {
        rej(e)
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
  cardCount() {
    return new Promise(async (res, rej) => {
      try {
        let [result] = await this.app.model.pool(`
            SELECT 
              COALESCE(COUNT(id), 0) AS cantidad_accesos
            FROM 
              tb_acceso
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
   * @returns {Promise<COLUMNS[]>}
   */
  chartCountPermits() {
    return new Promise(async (res, rej) => {
      try {
        let [result] = await this.app.model.pool(`
            SELECT 
              SUM(p.ver) AS ver,
              SUM(p.agregar) AS agregar,
              SUM(p.editar) AS editar,
              SUM(p.eliminar) AS eliminar,
              SUM(p.ocultar) AS ocultar,
              SUM(p.exportar) AS exportar
            FROM 
              tb_acceso a
            JOIN 
              tb_permisos p 
              ON 
                a.permiso_id = p.id;
          `)


        let { ver, agregar, editar, eliminar, ocultar, exportar } = result[0];

        let label = ['ver', 'agregar', 'editar', 'eliminar', 'ocultar', 'exportar'];
        let data = [ver, agregar, editar, eliminar, ocultar, exportar];

        res({ label, data });
      } catch (e) {
        rej(e);
      }
    })
  }
  /* 
    ====================================================================================================
    ============================================== Utiles ==============================================
    ====================================================================================================
  */
  /** 
   * @returns {Promise<COLUMNS[]>}
   */
  readAll() {
    return new Promise(async (res, rej) => {
      try {
        let [result] = await this.app.model.pool(`
            SELECT 
              id,
              menu_id,
              rol_id,
              permiso_id
            FROM
              tb_acceso
          `)

        res(result);
      } catch (e) {
        rej(e);
      }
    })
  }
}
module.exports = Tb_acceso