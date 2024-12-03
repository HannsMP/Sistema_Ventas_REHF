const Table = require('../utils/template/Table');

const name = 'tb_asistencias'
const columns = {
  id: { name: 'id', null: false, type: 'Integer', limit: 11 },
  usuario_id: { name: 'usuario_id', null: false, type: 'Integer', limit: 11 },
  creacion: { name: 'creacion', null: false, type: 'String', limit: 25 },
  desconeccion: { name: 'desconeccion', null: false, type: 'String', limit: 25 }
}

/**
 * @typedef {{
 *   id: number,
 *   usuario_id: number,
 *   creacion: string,
 *   desconeccion: string
 * }} COLUMNS_ASISTENCIAS
 */

/** @extends {Table<COLUMNS_ASISTENCIAS>} */
class Tb_asistencias extends Table {
  /** @param {import('../app')} app */
  constructor(app) {
    super(name);
    this.columns = columns;
    this.app = app;

    this.io = app.socket.node.selectNode('/control/reportes/asistencia', true);
  }
  /*
    ====================================================================================================
    =============================================== Tabla ===============================================
    ====================================================================================================
  */
  /**
   * @param {import('datatables.net-dt').AjaxData} option
   * @returns {Promise<COLUMNS_ASISTENCIAS[]>}
   */
  readInParts(option) {
    return new Promise(async (res, rej) => {
      try {
        let { order, start, length, search } = option;

        let query = `
          SELECT
            a.id,
            u.usuario,
            u.telefono,
            r.nombre AS rol_nombre,
            DATE_FORMAT(a.creacion, '%Y-%m-%d') AS fecha_creacion,
            DATE_FORMAT(a.creacion, '%r') AS hora_coneccion,
            DATE_FORMAT(a.desconeccion, '%r') AS hora_desconeccion
          FROM
            tb_asistencias AS a
          LEFT
            JOIN
              tb_usuarios AS u
            ON
              u.id = a.usuario_id
          LEFT
            JOIN
              tipo_rol AS r
            ON
              r.id = u.rol_id
        `, queryParams = [];

        if (search.value) {
          query += `
            WHERE
              u.usuario LIKE ?
              OR u.telefono LIKE ?
              OR r.nombre LIKE ?
              OR a.creacion LIKE ?
          `;

          queryParams.push(
            `%${search.value}%`,
            `%${search.value}%`,
            `%${search.value}%`,
            `%${search.value}%`
          );
        }

        let columnsSet = new Set([
          'u.usuario',
          'u.telefono',
          'r.nombre',
          'a.creacion',
          'a.desconeccion',
          'a.creacion'
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

        let [result] = await this.app.model.pool(query, queryParams);

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
            tb_asistencias AS a
          LEFT
            JOIN
              tb_usuarios AS u
            ON
              u.id = a.usuario_id
          LEFT
            JOIN
              tipo_rol AS r
            ON
              r.id = u.rol_id
        `, queryParams = [];

        if (search.value) {
          query += `
            WHERE
              u.usuario LIKE ?
              OR u.telefono LIKE ?
              OR r.nombre LIKE ?
              OR a.creacion LIKE ?
          `;

          queryParams.push(
            `%${search.value}%`,
            `%${search.value}%`,
            `%${search.value}%`,
            `%${search.value}%`
          );
        }

        let [result] = await this.app.model.pool(query, queryParams);

        res(result[0].cantidad);
      } catch (e) {
        rej(e);
      }
    })
  }
  /**
   * @param {number} data
   * @returns {Promise<import('mysql').OkPacket>}
   */
  insertUserId(usuario_id) {
    return new Promise(async (res, rej) => {
      try {
        this.constraint('usuario_id', usuario_id);

        let [result] = await this.app.model.pool(`
          INSERT INTO
            tb_asistencias (
              usuario_id,
              creacion
            )
          SELECT ?, CURRENT_TIMESTAMP()
          WHERE NOT EXISTS (
              SELECT
                1
              FROM
                tb_asistencias
              WHERE
                usuario_id = ?
                AND DATE(creacion) = CURDATE()
          );
        `, [
          usuario_id,
          usuario_id
        ])

        if (result.affectedRows)
          this.io.sockets.emit(
            '/asistencias/data/insert',
            _ => this.readJoinId(result.insertId)
          )

        res(result);
      } catch (e) {
        rej(e);
      }
    })
  }
  /**
   * @returns {Promise<{
   *   usuario: string,
   *   telefono: string,
   *   rol_nombre: string,
   *   fecha_creacion: string,
   *   hora_coneccion: string,
   *   hora_desconeccion: string
   * }[]>}
   */
  readAllJoin() {
    return new Promise(async (res, rej) => {
      try {
        let [result] = await this.app.model.pool(`
          SELECT
            a.id,
            u.usuario,
            u.telefono,
            r.nombre AS rol_nombre,
            DATE_FORMAT(a.creacion, '%Y-%m-%d') AS fecha_creacion,
            DATE_FORMAT(a.creacion, '%r') AS hora_coneccion,
            DATE_FORMAT(a.desconeccion, '%r') AS hora_desconeccion
          FROM
            tb_asistencias AS a
          LEFT
            JOIN
              tb_usuarios AS u
            ON
              u.id = a.usuario_id
          LEFT
            JOIN
              tipo_rol AS r
            ON
              r.id = u.rol_id
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
   *   usuario: string,
   *   telefono: string,
   *   fecha_creacion: string,
   *   hora_coneccion: string,
   *   hora_desconeccion: string
   * }>}
   */
  readJoinId(id) {
    return new Promise(async (res, rej) => {
      try {

        this.constraint('id', id);

        let [result] = await this.app.model.pool(`
          SELECT
            a.id,
            u.usuario,
            u.telefono,
            r.nombre AS rol_nombre,
            DATE_FORMAT(a.creacion, '%Y-%m-%d') AS fecha_creacion,
            DATE_FORMAT(a.creacion, '%r') AS hora_coneccion,
            DATE_FORMAT(a.desconeccion, '%r') AS hora_desconeccion
          FROM
            tb_asistencias AS a
          LEFT
            JOIN
              tb_usuarios AS u
            ON
              u.id = a.usuario_id
          LEFT
            JOIN
              tipo_rol AS r
            ON
              r.id = u.rol_id
          WHERE
            a.id = ?
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
   * @param {Date | string | number} date
   * @returns {Promise<{
   *   usuario: string,
   *   telefono: string,
   *   rol_nombre: string,
   *   creacion: string,
   *   desconeccion: string
   * }[]>}
   */
  readDate(date) {
    return new Promise(async (res, rej) => {
      try {
        date = date instanceof Date
          ? date
          : new Date(date);

        let [result] = await this.app.model.pool(`
          SELECT
            u.usuario,
            u.telefono,
            r.nombre AS rol_nombre,
            a.creacion
          FROM
            tb_asistencias AS a
          LEFT
            JOIN
              tb_usuarios AS u
            ON
              u.id = a.usuario_id
          LEFT
            JOIN
              tipo_rol AS r
            ON
              r.id = u.rol_id
          WHERE
            DATE(a.creacion) = ?
        `, [
          this.app.time.format('YYYY-MM-DD', date)
        ]);

        res(result);
      } catch (e) {
        rej(e);
      }
    })
  }
  /**
   * @param {number} usuario_id
   * @returns {Promise<COLUMNS_ASISTENCIAS>}
   */
  readTodayUser(usuario_id) {
    return new Promise(async (res, rej) => {
      try {
        this.app.model.tb_usuarios.constraint('id', usuario_id);

        let [result] = await this.app.model.pool(`
          SELECT
            *
          FROM
            tb_asistencias
          WHERE
            usuario_id = ?
            AND DATE(creacion) = CURDATE();
        `, [
          usuario_id
        ])

        res(result[0])
      } catch (e) {
        rej(e)
      }
    })
  }
  /**
   * @param {number} data
   * @returns {Promise<import('mysql').OkPacket>}
   */
  updateUserId(usuario_id) {
    return new Promise(async (res, rej) => {
      try {
        this.constraint('usuario_id', usuario_id);

        let [result] = await this.app.model.pool(`
          UPDATE
            tb_asistencias
          SET
            desconeccion = CURRENT_TIMESTAMP()
          WHERE
            usuario_id = ?
            AND DATE(creacion) = CURDATE();
        `, [
          usuario_id
        ])

        this.io.sockets.emit(
          '/asistencias/data/lastDisconnection',
          _ => this.readTodayUser(usuario_id)
        )

        res(result);
      } catch (e) {
        rej(e);
      }
    })
  }
}

module.exports = Tb_asistencias;