const { Table } = require('../utils/UtilsModel');

const name = 'tb_permisos';
const columns = {
  id: { name: 'id', null: false, type: 'Integer', limit: 11, min: 0, max: 63 },
  ver: { name: 'ver', null: false, type: 'Integer', limit: 1, min: -1, max: 1 },
  agregar: { name: 'agregar', null: false, type: 'Integer', limit: 1, min: -1, max: 1 },
  editar: { name: 'editar', null: false, type: 'Integer', limit: 1, min: -1, max: 1 },
  eliminar: { name: 'eliminar', null: false, type: 'Integer', limit: 1, min: -1, max: 1 },
  ocultar: { name: 'ocultar', null: false, type: 'Integer', limit: 1, min: -1, max: 1 },
  exportar: { name: 'exportar', null: false, type: 'Integer', limit: 1, min: -1, max: 1 }
}

/** 
 * @typedef {{
 *   id: number,
 *   ver: number,
 *   agregar: number,
 *   editar: number,
 *   eliminar: number,
 *   ocultar: number,
 *   exportar: number 
 * }} COLUMNS
 */

class Tb_permisos extends Table {
  /** @param {import('../app')} app */  constructor(app) {
    super(name);
    this.columns = columns;
    this.app = app;
  }
  /* 
    ====================================================================================================
    ============================================== session ==============================================
    ====================================================================================================
  */
  /** 
    * @param {number} id
    * @returns {Promise<{[ruta:string]:{ver: number}}>}
    */
  userLayout(id) {
    return new Promise(async (res, rej) => {
      try {
        this.app.model.tb_usuarios.constraint('id', id);

        let [result] = await this.app.model.poolValues(`
          SELECT 
            m.ruta,
            p.ver
          FROM 
            tb_usuarios AS u
          INNER JOIN
            tipo_rol AS r
              ON r.id = u.rol_id
          INNER JOIN
            tb_acceso AS a
              ON a.rol_id = r.id
          INNER JOIN
            tb_menus AS m
              ON m.id = a.menu_id
          INNER JOIN
            tb_permisos AS p
              ON p.id = a.permiso_id
          WHERE
            u.id = ?
            AND m.principal = ':control'
        `, [
          id,
        ])

        if (!result.length)
          return rej(this.error(
            'RESPONSE_DATA_EMPTY',
            'Consulta sin coincidencia'
          ));

        let layout = {};

        result.forEach(({ ruta, ver }) => layout[ruta] = { ver });

        res(layout);
      } catch (e) {
        rej(e);
      }
    })
  }
  /** 
    * @param {number} id
    * @returns {Promise<{[ruta:string]:COLUMNS}}>}
    */
  userLayoutAll(id) {
    return new Promise(async (res, rej) => {
      try {
        this.app.model.tb_usuarios.constraint('id', id);

        let [result] = await this.app.model.poolValues(`
          SELECT 
            m.ruta,
            p.ver,
            p.agregar,
            p.editar,
            p.eliminar,
            p.ocultar,
            p.exportar
          FROM 
            tb_usuarios AS u
          INNER JOIN
            tipo_rol AS r
              ON r.id = u.rol_id
          INNER JOIN
            tb_acceso AS a
              ON a.rol_id = r.id
          INNER JOIN
            tb_menus AS m
              ON m.id = a.menu_id
          INNER JOIN
            tb_permisos AS p
              ON p.id = a.permiso_id
          WHERE
            u.id = ?
            AND m.principal = ':control'
        `, [
          id,
        ])

        if (!result.length)
          return rej(this.error(
            'RESPONSE_DATA_EMPTY',
            'Consulta sin coincidencia'
          ));

        let layout = {};

        result.forEach(({ ruta, ver, agregar, editar, eliminar, ocultar, exportar }) => layout[ruta] = {
          ver, agregar, editar, eliminar, ocultar, exportar
        });

        res(layout);
      } catch (e) {
        rej(e);
      }
    })
  }
  /* 
    ====================================================================================================
    ============================================== routes ==============================================
    ====================================================================================================
  */
  /** 
   * @param {number} id
   * @param {string} path 
   * @returns {Promise<COLUMNS>}
   */
  userPath(id, path) {
    return new Promise(async (res, rej) => {
      try {
        this.app.model.tb_usuarios.constraint('id', id);
        this.app.model.tb_menus.constraint('ruta', path);

        let [result] = await this.app.model.poolValues(`
          SELECT 
            u.usuario,
            r.nombre,
            p.*
          FROM 
            tb_usuarios AS u
          INNER JOIN
            tipo_rol AS r
              ON r.id = u.rol_id
          INNER JOIN
            tb_acceso AS a
              ON a.rol_id = r.id
          INNER JOIN
            tb_menus AS m
              ON m.id = a.menu_id
          INNER JOIN
            tb_permisos AS p
              ON p.id = a.permiso_id
          WHERE
            u.id = ?
            AND m.ruta = ?
      `, [
          id,
          path
        ])

        if (!result.length)
          return rej(this.error(
            'RESPONSE_DATA_EMPTY',
            'Consulta sin coincidencia'
          ));

        let data = result[0];

        res(data);
      } catch (e) {
        rej(e);
      }
    })
  }
  /** 
   * @param {number} id
   * @param {string} path 
   * @returns {Promise<COLUMNS>}
   */
  userPathAll(id, path) {
    return new Promise(async (res, rej) => {
      try {
        this.app.model.tb_usuarios.constraint('id', id);
        this.app.model.tb_menus.constraint('ruta', path);

        let [result] = await this.app.model.poolValues(`
          SELECT 
            p.ver,
            p.agregar,
            p.editar,
            p.eliminar,
            p.ocultar,
            p.exportar
          FROM 
            tb_usuarios AS u
          INNER JOIN
            tipo_rol AS r
              ON r.id = u.rol_id
          INNER JOIN
            tb_acceso AS a
              ON a.rol_id = r.id
          INNER JOIN
            tb_menus AS m
              ON m.id = a.menu_id
          INNER JOIN
            tb_permisos AS p
              ON p.id = a.permiso_id
          WHERE
            u.id = ?
            AND m.ruta = ?
        `, [
          id,
          path
        ])

        if (!result.length)
          return rej(this.error(
            'RESPONSE_DATA_EMPTY',
            'Consulta sin coincidencia'
          ));

        res(result[0]);
      } catch (e) {
        rej(e);
      }
    })
  }
  /** 
   * @param {number} id
   * @param {string} path 
   * @returns {Promise<number>}
   */
  userPathView(id, path) {
    return new Promise(async (res, rej) => {
      try {
        this.app.model.tb_usuarios.constraint('id', id);
        this.app.model.tb_menus.constraint('ruta', path);

        let [result] = await this.app.model.poolValues(`
          SELECT 
            p.ver
          FROM 
            tb_usuarios AS u
          INNER JOIN
            tipo_rol AS r
              ON r.id = u.rol_id
          INNER JOIN
            tb_acceso AS a
              ON a.rol_id = r.id
          INNER JOIN
            tb_menus AS m
              ON m.id = a.menu_id
          INNER JOIN
            tb_permisos AS p
              ON p.id = a.permiso_id
          WHERE
            u.id = ?
            AND m.ruta = ?
        `, [
          id,
          path
        ])

        if (!result.length)
          return rej(this.error(
            'RESPONSE_DATA_EMPTY',
            'Consulta sin coincidencia'
          ));

        res(result[0].ver);
      } catch (e) {
        rej(e);
      }
    })
  }
  /** 
   * @param {number} id
   * @param {string} path 
   * @returns {Promise<number>}
   */
  userPathAdd(id, path) {
    return new Promise(async (res, rej) => {
      try {
        this.app.model.tb_usuarios.constraint('id', id);
        this.app.model.tb_menus.constraint('ruta', path);

        let [result] = await this.app.model.poolValues(`
          SELECT 
            p.agregar
          FROM 
            tb_usuarios AS u
          INNER JOIN
            tipo_rol AS r
              ON r.id = u.rol_id
          INNER JOIN
            tb_acceso AS a
              ON a.rol_id = r.id
          INNER JOIN
            tb_menus AS m
              ON m.id = a.menu_id
          INNER JOIN
            tb_permisos AS p
              ON p.id = a.permiso_id
          WHERE
            u.id = ?
            AND m.ruta = ?
        `, [
          id,
          path
        ])

        if (!result.length)
          return rej(this.error(
            'RESPONSE_DATA_EMPTY',
            'Consulta sin coincidencia'
          ));

        res(result[0].agregar);
      } catch (e) {
        rej(e);
      }
    })
  }
  /** 
   * @param {number} id
   * @param {string} path 
   * @returns {Promise<number>}
   */
  userPathUpdate(id, path) {
    return new Promise(async (res, rej) => {
      try {
        this.app.model.tb_usuarios.constraint('id', id);
        this.app.model.tb_menus.constraint('ruta', path);

        let [result] = await this.app.model.poolValues(`
          SELECT 
            p.editar
          FROM 
            tb_usuarios AS u
          INNER JOIN
            tipo_rol AS r
              ON r.id = u.rol_id
          INNER JOIN
            tb_acceso AS a
              ON a.rol_id = r.id
          INNER JOIN
            tb_menus AS m
              ON m.id = a.menu_id
          INNER JOIN
            tb_permisos AS p
              ON p.id = a.permiso_id
          WHERE
            u.id = ?
            AND m.ruta = ?
        `, [
          id,
          path
        ])

        if (!result.length)
          return rej(this.error(
            'RESPONSE_DATA_EMPTY',
            'Consulta sin coincidencia'
          ));

        res(result[0].editar);
      } catch (e) {
        rej(e);
      }
    })
  }
  /** 
   * @param {number} id
   * @param {string} path 
   * @returns {Promise<number>}
   */
  userPathDelete(id, path) {
    return new Promise(async (res, rej) => {
      try {
        this.app.model.tb_usuarios.constraint('id', id);
        this.app.model.tb_menus.constraint('ruta', path);

        let [result] = await this.app.model.poolValues(`
          SELECT 
            p.eliminar
          FROM 
            tb_usuarios AS u
          INNER JOIN
            tipo_rol AS r
              ON r.id = u.rol_id
          INNER JOIN
            tb_acceso AS a
              ON a.rol_id = r.id
          INNER JOIN
            tb_menus AS m
              ON m.id = a.menu_id
          INNER JOIN
            tb_permisos AS p
              ON p.id = a.permiso_id
          WHERE
            u.id = ?
            AND m.ruta = ?
        `, [
          id,
          path
        ])

        if (!result.length)
          return rej(this.error(
            'RESPONSE_DATA_EMPTY',
            'Consulta sin coincidencia'
          ));

        res(result[0].eliminar);
      } catch (e) {
        rej(e);
      }
    })
  }
  /** 
   * @param {number} id
   * @param {string} path 
   * @returns {Promise<number>}
   */
  userPathHide(id, path) {
    return new Promise(async (res, rej) => {
      try {
        this.app.model.tb_usuarios.constraint('id', id);
        this.app.model.tb_menus.constraint('ruta', path);

        let [result] = await this.app.model.poolValues(`
          SELECT 
            p.ocultar
          FROM 
            tb_usuarios AS u
          INNER JOIN
            tipo_rol AS r
              ON r.id = u.rol_id
          INNER JOIN
            tb_acceso AS a
              ON a.rol_id = r.id
          INNER JOIN
            tb_menus AS m
              ON m.id = a.menu_id
          INNER JOIN
            tb_permisos AS p
              ON p.id = a.permiso_id
          WHERE
            u.id = ?
            AND m.ruta = ?
        `, [
          id,
          path
        ])

        if (!result.length)
          return rej(this.error(
            'RESPONSE_DATA_EMPTY',
            'Consulta sin coincidencia'
          ));

        res(result[0].ocultar);
      } catch (e) {
        rej(e);
      }
    })
  }
  /** 
   * @param {number} id
   * @param {string} path 
   * @returns {Promise<number>}
   */
  userPathExport(id, path) {
    return new Promise(async (res, rej) => {
      try {
        this.app.model.tb_usuarios.constraint('id', id);
        this.app.model.tb_menus.constraint('ruta', path);

        let [result] = await this.app.model.poolValues(`
          SELECT 
            p.exportar
          FROM 
            tb_usuarios AS u
          INNER JOIN
            tipo_rol AS r
              ON r.id = u.rol_id
          INNER JOIN
            tb_acceso AS a
              ON a.rol_id = r.id
          INNER JOIN
            tb_menus AS m
              ON m.id = a.menu_id
          INNER JOIN
            tb_permisos AS p
              ON p.id = a.permiso_id
          WHERE
            u.id = ?
            AND m.ruta = ?
        `, [
          id,
          path
        ])

        if (!result.length)
          return rej(this.error(
            'RESPONSE_DATA_EMPTY',
            'Consulta sin coincidencia'
          ));

        res(result[0].exportar);
      } catch (e) {
        rej(e);
      }
    })
  }
  /* 
    ====================================================================================================
    =============================================== phone ===============================================
    ====================================================================================================
  */
  /** 
   * @param {string} telefono
   * @returns {Promise<{
   *   id:string, 
   *   usuario:String, 
   *   telefono:string, 
   *   rol_id:number, 
   *   rol_nombre:string, 
   *   ver:number,
   *   commando: string
   * }[]>}
   */
  phonePathAll(telefono, comando) {
    return new Promise(async (res, rej) => {
      try {
        this.app.model.tb_usuarios.constraint('telefono', telefono);

        let values = [telefono];
        if (comando) values.push(comando);

        let [result] = await this.app.model.poolValues(`
          SELECT 
            u.id,
            u.telefono,
            u.usuario,
          	u.rol_id,
          	r.nombre AS rol_nombre,
            p.ver,
            m.ruta AS commando
          FROM 
            tb_usuarios AS u
          INNER JOIN
            tipo_rol AS r
              ON r.id = u.rol_id
          INNER JOIN
            tb_acceso AS a
              ON a.rol_id = r.id
          INNER JOIN
            tb_menus AS m
              ON m.id = a.menu_id
          INNER JOIN
            tb_permisos AS p
              ON p.id = a.permiso_id
          WHERE
            m.principal = ':bot'
            AND u.telefono = ?
            ${comando ? 'AND m.ruta = ?' : ''}
        `,
          values
        )

        res(result);
      } catch (e) {
        rej(e);
      }
    })
  }
  /** 
   * @param {number} telefono
   * @param {string} path 
   * @returns {Promise<number>}
   */
  phonePathView(telefono, path) {
    return new Promise(async (res, rej) => {
      try {
        this.app.model.tb_usuarios.constraint('telefono', telefono);
        this.app.model.tb_menus.constraint('ruta', path);

        let [result] = await this.app.model.poolValues(`
          SELECT 
            p.ver
          FROM 
            tb_usuarios AS u
          INNER JOIN
            tipo_rol AS r
              ON r.id = u.rol_id
          INNER JOIN
            tb_acceso AS a
              ON a.rol_id = r.id
          INNER JOIN
            tb_menus AS m
              ON m.id = a.menu_id
          INNER JOIN
            tb_permisos AS p
              ON p.id = a.permiso_id
          WHERE
            u.telefono = ?
            AND m.ruta = ?
        `, [
          telefono,
          path
        ])

        if (!result.length)
          return rej(this.error(
            'RESPONSE_DATA_EMPTY',
            'Consulta sin coincidencia'
          ));

        res(result[0].ver);
      } catch (e) {
        rej(e);
      }
    })
  }
  /* 
    ====================================================================================================
    =============================================== Socket ===============================================
    ====================================================================================================
  */
  /** 
   * @param {string} path 
   * @returns {Promise<number[]>}
   */
  socketPath(path) {
    return new Promise(async (res, rej) => {
      try {
        this.app.model.tb_menus.constraint('ruta', path);

        let [result] = await this.app.model.poolValues(`
          SELECT 
            a.rol_id
          FROM 
            tb_acceso AS a
          INNER JOIN
            tb_menus AS m
              ON m.id = a.menu_id
          INNER JOIN
            tb_permisos AS p
              ON p.id = a.permiso_id
          WHERE 
            m.ruta = ?
            AND p.ver = 1
        `, [
          path
        ])

        res(result.map(r => r.rol_id));
      } catch (e) {
        rej(e);
      }
    })
  }
  /* 
    ====================================================================================================
    ============================================= COMPUTED =============================================
    ====================================================================================================
  */
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
  computedPermisoId(permisos) {

    let {
      ver,
      agregar,
      editar,
      eliminar,
      ocultar,
      exportar
    } = permisos;

    this.constraint('ver', ver);
    this.constraint('agregar', agregar);
    this.constraint('editar', editar);
    this.constraint('eliminar', eliminar);
    this.constraint('ocultar', ocultar);
    this.constraint('exportar', exportar);

    let value = 0;

    [
      ver,
      agregar,
      editar,
      eliminar,
      ocultar,
      exportar
    ]
      .forEach((c, i) => { if (c == 1) value += (2 ** i) });

    return value;
  }
}

module.exports = Tb_permisos;