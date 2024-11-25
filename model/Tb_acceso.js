const Table = require('../utils/template/Table');

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
 * }} COLUMNS_ACCESOS
 */

/** @extends {Table<COLUMNS_ACCESOS>} */
class Tb_acceso extends Table {
  /** @param {import('../app')} app */
  constructor(app) {
    super(name,);
    this.columns = columns;
    this.app = app;

    this.io = app.socket.node.selectNode('/control/administracion/acceso', true);
  }
  /* 
    ====================================================================================================
    =============================================== Tabla ===============================================
    ====================================================================================================
  */
  /**
   * @param {import('datatables.net-dt').AjaxData} option 
   * @returns {Promise<COLUMNS_ACCESOS[]>}
   */
  readInParts(option) {
    return new Promise(async (res, rej) => {
      try {
        let { order, start, length, search } = option;

        let query = `
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
        `, queryParams = [];

        if (search.value) {
          query += `
            WHERE
              m.ruta LIKE ?
              OR m.principal LIKE ?
              OR r.nombre LIKE ?
          `;

          queryParams.push(
            `%${search.value}%`,
            `%${search.value}%`,
            `%${search.value}%`
          );
        }

        let columnsSet = new Set([
          'm.ruta',
          'm.principal',
          'r.nombre'
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
            COUNT(a.id) AS cantidad
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
        `, queryParams = [];

        if (search.value) {
          query += `
            WHERE
              m.ruta LIKE ?
              OR m.principal LIKE ?
              OR r.nombre LIKE ?
          `;

          queryParams.push(
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
   * @param {{
   *   menu_id: number,
   *   rol_id: number,
   *   disabled_id: number,
   *   permiso_ver: number,
   *   permiso_agregar: number,
   *   permiso_editar: number,
   *   permiso_eliminar: number,
   *   permiso_ocultar: number,
   *   permiso_exportar: number
   * }} data 
   * @returns {Promise<import('mysql').OkPacket>}
   */
  insert(data) {
    return new Promise(async (res, rej) => {
      try {
        let {
          menu_id,
          rol_id,
          disabled_id,
          permiso_ver,
          permiso_agregar,
          permiso_editar,
          permiso_eliminar,
          permiso_ocultar,
          permiso_exportar,
        } = data;

        this.constraint('menu_id', menu_id);
        this.constraint('rol_id', rol_id);
        this.constraint('disabled_id', disabled_id);

        let permiso_id = this.app.model.tb_permisos.computedPermisoId({
          ver: permiso_ver,
          agregar: permiso_agregar,
          editar: permiso_editar,
          eliminar: permiso_eliminar,
          ocultar: permiso_ocultar,
          exportar: permiso_exportar,
        });

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

        this.io.sockets.emit(
          '/accesos/permisos/insert',
          _ => this.readIdJoin(result.insertId)
        )

        res(result);
      } catch (e) {
        rej(e);
      }
    })
  }
  /**
   * @param {number} id 
   * @param {{
   *   disabled_id: number,
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
        let {
          disabled_id,
          permiso_ver,
          permiso_agregar,
          permiso_editar,
          permiso_eliminar,
          permiso_ocultar,
          permiso_exportar,
        } = data

        this.constraint('id', id);
        this.constraint('disabled_id', disabled_id);

        let permiso_id = this.app.model.tb_permisos.computedPermisoId({
          ver: permiso_ver,
          agregar: permiso_agregar,
          editar: permiso_editar,
          eliminar: permiso_eliminar,
          ocultar: permiso_ocultar,
          exportar: permiso_exportar,
        });

        let result = await this.app.model.poolValues(`
          UPDATE 
            tb_acceso
          SET
            permiso_id = ?,
            disabled_id = ?
          WHERE 
            id = ?;
        `, [
          permiso_id,
          disabled_id,
          id
        ]);

        this.io.sockets.emit(
          '/accesos/permisos/updateId',
          _ => this.readIdJoin(id)
        )

        res(result);
      } catch (e) {
        rej(e)
      }
    })
  }
  /**
   * @param {number} id 
   * @param {{
   *   permiso_ver: number,
   *   permiso_agregar: number,
   *   permiso_editar: number,
   *   permiso_eliminar: number,
   *   permiso_ocultar: number,
   *   permiso_exportar: number
   * }} data 
   * @returns {Promise<import('mysql').OkPacket>}
   */
  updateIdState(id, data) {
    return new Promise(async (res, rej) => {
      try {
        this.constraint('id', id);

        let permiso_id = this.app.model.tb_permisos.computedPermisoId({
          ver: data.permiso_ver,
          agregar: data.permiso_agregar,
          editar: data.permiso_editar,
          eliminar: data.permiso_eliminar,
          ocultar: data.permiso_ocultar,
          exportar: data.permiso_exportar
        });

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

        this.io.sockets.emit(
          '/accesos/permisos/state',
          {
            id,
            permiso_id,
            permiso_ver: data.permiso_ver,
            permiso_agregar: data.permiso_agregar,
            permiso_editar: data.permiso_editar,
            permiso_eliminar: data.permiso_eliminar,
            permiso_ocultar: data.permiso_ocultar,
            permiso_exportar: data.permiso_exportar
          }
        )

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
  /** 
   * @param {number} id 
   * @returns {Promise<{
   *   id: number,
   *   menu_id: number,
   *   menu_ruta: string,
   *   menu_principal: string,
   *   rol_id: number,
   *   rol_nombre: string,
   *   permiso_id: number,
   *   permiso_ver: number,
   *   permiso_agregar: number,
   *   permiso_editar: number,
   *   permiso_eliminar: number,
   *   permiso_ocultar: number,
   *   permiso_exportar: number,
   * }>}
   */
  readIdJoin(id) {
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
              a.id = ?
          `, [
          id
        ])

        res(result[0]);
      } catch (e) {
        rej(e);
      }
    })
  }
  /** 
   * @returns {Promise<{
   *   id: number,
   *   menu_id: number,
   *   menu_ruta: string,
   *   menu_principal: string,
   *   rol_id: number,
   *   rol_nombre: string,
   *   permiso_id: number,
   *   permiso_ver: number,
   *   permiso_agregar: number,
   *   permiso_editar: number,
   *   permiso_eliminar: number,
   *   permiso_ocultar: number,
   *   permiso_exportar: number,
   * }[]>}
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
          `)

        res(result);
      } catch (e) {
        rej(e);
      }
    })
  }
  /** 
   * @returns {Promise<COLUMNS_ACCESOS[]>}
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
   * @returns {Promise<COLUMNS_ACCESOS[]>}
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
}
module.exports = Tb_acceso