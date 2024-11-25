const Table = require('../utils/template/Table');

const { hashSync, compareSync } = require('bcryptjs');

const name = 'tb_usuarios';
const columns = {
  id: { name: 'id', null: false, type: 'Integer', limit: 11 },
  nombres: { name: 'nombres', null: false, type: 'String', limit: 50 },
  apellidos: { name: 'apellidos', null: false, type: 'String', limit: 50 },
  usuario: { name: 'usuario', null: false, type: 'String', limit: 50, unic: true },
  clave: { name: 'clave', null: false, type: 'String', limit: 255 },
  telefono: { name: 'telefono', null: false, type: 'String', limit: 20, unic: true },
  email: { name: 'email', null: false, type: 'String', limit: 50, unic: true },
  rol_id: { name: 'rol_id', null: false, type: 'Integer', limit: 11 },
  foto_id: { name: 'foto_id', null: true, type: 'Integer', limit: 11 },
  creacion: { name: 'creacion', null: false, type: 'String', limit: 25 },
  estado: { name: 'estado', null: false, type: 'Integer', limit: 1 },
  tema: { name: 'tema', null: false, type: 'String', limit: 10 }
}

/** 
 * @typedef {{
 *   id: number,
 *   nombres: string,
 *   apellidos: string,
 *   usuario: string,
 *   clave: string,
 *   telefono: string,
 *   email: string,
 *   rol_id: number,
 *   foto_id: number,
 *   creacion: string,
 *   estado: number,
 * }} COLUMNS_USUARIOS
 */

/** @extends {Table<COLUMNS_USUARIOS>} */
class Tb_usuarios extends Table {
  /** @param {import('../app')} app */
  constructor(app) {
    super(name);
    this.columns = columns;
    this.app = app;

    this.io = app.socket.node.selectNode('/control/administracion/usuarios', true);
  }
  /* 
    ====================================================================================================
    ============================================= Recovery =============================================
    ====================================================================================================
  */
  /**
   * @param {string} usuario 
   * @returns {Promise<{id:number, telefono:string, estado:number}>}
   */
  readPhoneUser(usuario) {
    return new Promise(async (res, rej) => {
      try {
        this.constraint('usuario', usuario);

        let [result] = await this.app.model.poolValues(`
          SELECT
            id,
            telefono,
            estado
          FROM
            tb_usuarios
          WHERE
            usuario = ?
        `, [
          usuario
        ])
        if (!result.length)
          return rej(this.error(
            'RESPONSE_DATA_EMPTY',
            `No existe el Usuario ${usuario}`
          ));

        /** @type {COLUMNS_USUARIOS} */
        let data = result[0];

        if (!data.estado)
          return rej(this.error(
            'RESPONSE_DATA_DISABLED',
            'Usuario deshabilitado'
          ));

        res(data);
      } catch (e) {
        rej(e);
      }
    })
  }
  /* 
    ====================================================================================================
    ============================================== Session ==============================================
    ====================================================================================================
  */
  /** 
   * @param {string} usuario 
   * @param {string} clave 
   * @returns {Promise<COLUMNS_USUARIOS>}
   */
  login(usuario, clave) {
    return new Promise(async (res, rej) => {
      try {
        this.constraint('usuario', usuario);
        this.constraint('clave', clave);

        let [result] = await this.app.model.poolValues(`
          SELECT 
            u.id,
            u.nombres,
            u.apellidos,
            u.usuario,
            u.clave,
            u.telefono,
            u.email,
            r.id AS rol_id,
            r.nombre AS rol_nombre,
            f.src AS foto_src,
            f.src_small AS foto_src_small,
            u.estado,
            u.tema
          FROM
            tb_usuarios AS u
          LEFT 
            JOIN 
              tipo_rol AS r
            ON 
              r.id = u.rol_id
          LEFT 
            JOIN 
              tb_fotos AS f
            ON 
              f.id = u.foto_id
          WHERE
            LOWER(u.usuario) = LOWER(?)
        `, [
          usuario
        ])

        if (!result.length)
          return rej(this.error(
            'RESPONSE_DATA_EMPTY',
            'No existe el Usuario'
          ));

        /** @type {COLUMNS_USUARIOS} */
        let data = result[0];

        if (!data.estado)
          return rej(this.error(
            'RESPONSE_DATA_DISABLED',
            'Usuario deshabilitado'
          ));

        if (!compareSync(clave, data.clave))
          return rej(this.error(
            'RESPONSE_DATA_DIFERENT',
            'Contraseña Incorrecta'
          ));

        res(data);
      } catch (e) {
        rej(e);
      }
    })
  }
  /** 
   * @param {COLUMNS_USUARIOS} data 
   * @returns {Promise<import('mysql').OkPacket>}
   */
  register(data) {
    return new Promise(async (res, rej) => {
      try {
        let {
          nombres,
          apellidos,
          usuario,
          clave,
          telefono,
          email,
          rol_id,
          estado = 1
        } = data;

        this.constraint('nombres', nombres);
        this.constraint('apellidos', apellidos);
        this.constraint('usuario', usuario, { unic: true });
        this.constraint('clave', clave);
        this.constraint('telefono', telefono, { unic: true });
        this.constraint('email', email, { unic: true });
        this.constraint('rol_id', rol_id);
        this.constraint('estado', estado);

        let [result] = await this.app.model.poolValues(`
          INSERT INTO 
            tb_usuarios (
              nombres,
              apellidos,
              usuario,
              clave,
              telefono,
              email,
              rol_id,
              estado,
              foto_id
            )
          VALUES (
            ?,
            ?,
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
          apellidos,
          usuario,
          hashSync(clave, Math.floor(Math.random() * 10)),
          telefono,
          email,
          rol_id,
          estado,
          1
        ])

        this.io.tagsName.emitRolToJunior(
          rol_id,
          '/usuarios/data/insert',
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
   * @param {string} clave 
   * @returns {Promise<{clave:string, estado:number}>}
   */
  hasIdPassword(id, clave) {
    return new Promise(async (res, rej) => {
      try {
        this.constraint('id', id);
        this.constraint('clave', clave);

        let [result] = await this.app.model.poolValues(`
          SELECT 
            clave,
            estado
          FROM
            tb_usuarios
          WHERE
            id = ?
       `, [
          id
        ]);

        if (!result.length)
          return rej(this.error(
            'RESPONSE_DATA_EMPTY',
            'No existe el Usuario'
          ));

        /** @type {COLUMNS_USUARIOS} */
        let data = result[0];

        if (!data.estado)
          return rej(this.error(
            'RESPONSE_DATA_DISABLED',
            'Usuario deshabilitado'
          ));

        if (!compareSync(clave, data.clave))
          return rej(this.error(
            'RESPONSE_DATA_DIFERENT',
            'Contraseña Diferente'
          ));

        res(data);
      } catch (e) {
        rej(e)
      }
    })
  }
  /**
   * @param {number} id 
   * @param {string} clave 
   * @returns {Promise<import('mysql').OkPacket>}
   */
  updateIdPassword(id, clave) {
    return new Promise(async (res, rej) => {
      try {
        this.constraint('id', id);
        this.constraint('clave', clave);

        let [result] = await this.app.model.poolValues(`
          UPDATE
            tb_usuarios
          SET
            clave = ?
          WHERE
            id = ?
        `, [
          hashSync(clave, Math.floor(Math.random() * 10)),
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
   * @param {string} tema 
   * @returns {Promise<import('mysql').OkPacket>}
   */
  updateIdTheme(id, tema) {
    return new Promise(async (res, rej) => {
      try {
        this.constraint('id', id);
        this.constraint('tema', tema);

        let [result] = await this.app.model.poolValues(`
          UPDATE
            tb_usuarios
          SET
            tema = ?
          WHERE
            id = ?
        `, [
          tema,
          id
        ]);

        this.app.nodeControl.allTagsName.get(`usr:${id}`)?.emit(
          '/session/usuario/theme',
          tema
        );

        res(result);
      } catch (e) {
        rej(e)
      }
    })
  }
  /* 
    ====================================================================================================
    =============================================== Tabla ===============================================
    ====================================================================================================
  */
  /**
   * @param {import('datatables.net-dt').AjaxData} option 
   * @param {number} noId 
   * @returns {Promise<COLUMNS_USUARIOS[]>}
   */
  readInParts(option, noId) {
    return new Promise(async (res, rej) => {
      try {

        this.constraint('id', noId);

        let { order, start, length, search } = option;

        let query = `
          SELECT 
            u.id,
            u.nombres,
            u.apellidos,
            u.usuario,
            u.clave,
            u.telefono,
            u.email,
            u.rol_id,
            r.nombre AS rol_nombre,
            u.foto_id,
            f.src AS foto_src,
            u.creacion,
            u.estado
          FROM
            tb_usuarios AS u
          LEFT 
            JOIN 
              tipo_rol AS r 
            ON 
              r.id = u.rol_id
          LEFT 
            JOIN 
              tb_fotos AS f 
            ON 
              f.id = u.foto_id
          WHERE
            u.id != ?
            AND u.rol_id > (
              SELECT 
                rol_id 
              FROM 
                tb_usuarios 
              WHERE 
                id = ?
            )
        `, queryParams = [
            noId,
            noId
          ];

        if (search.value) {
          query += `
            AND u.nombres LIKE ?
            OR u.apellidos LIKE ?
            OR u.usuario LIKE ?
            OR u.telefono LIKE ?
            OR u.email LIKE ?
            OR r.nombre LIKE ?
            OR u.creacion LIKE ?
          `;

          queryParams.push(
            `%${search.value}%`,
            `%${search.value}%`,
            `%${search.value}%`,
            `%${search.value}%`,
            `%${search.value}%`,
            `%${search.value}%`,
            `%${search.value}%`
          );
        }

        let columnsSet = new Set([
          'u.nombres',
          'u.apellidos',
          'u.usuario',
          'u.telefono',
          'u.email',
          'r.nombre',
          'u.creacion'
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
   * @param {number} noId 
   * @returns {Promise<number>}
   */
  readInPartsCount(option, noId) {
    return new Promise(async (res, rej) => {
      try {

        this.constraint('id', noId);

        let { search } = option;

        let query = `
          SELECT 
            COUNT(u.id) AS cantidad
          FROM
            tb_usuarios AS u
          LEFT 
            JOIN 
              tipo_rol AS r 
            ON 
              r.id = u.rol_id
          LEFT 
            JOIN 
              tb_fotos AS f 
            ON 
              f.id = u.foto_id
          WHERE
            u.id != ?
            AND u.rol_id > (
              SELECT 
                rol_id 
              FROM 
                tb_usuarios 
              WHERE 
                id = ?
            )
        `, queryParams = [
            noId,
            noId
          ];

        if (search.value) {
          query += `
            AND u.nombres LIKE ?
            OR u.apellidos LIKE ?
            OR u.usuario LIKE ?
            OR u.telefono LIKE ?
            OR u.email LIKE ?
            OR r.nombre LIKE ?
            OR u.creacion LIKE ?
          `;

          queryParams.push(
            `%${search.value}%`,
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
   * @param {number} id 
   * @returns {Promise<COLUMNS_USUARIOS[]>}
   */
  readAllJoinNoId(id) {
    return new Promise(async (res, rej) => {
      try {
        this.constraint('id', id);

        let [result] = await this.app.model.poolValues(`
          SELECT 
            u.id,
            u.nombres,
            u.apellidos,
            u.usuario,
            u.clave,
            u.telefono,
            u.email,
            u.rol_id,
            r.nombre AS rol_nombre,
            u.foto_id,
            f.src AS foto_src,
            u.creacion,
            u.estado
          FROM
            tb_usuarios AS u
          LEFT 
            JOIN 
              tipo_rol AS r 
            ON 
              r.id = u.rol_id
          LEFT 
            JOIN 
              tb_fotos AS f 
            ON 
              f.id = u.foto_id
          WHERE
            u.id != ?
            AND u.rol_id > (
              SELECT 
                rol_id 
              FROM 
                tb_usuarios 
              WHERE 
                id = ?
            );
        `, [
          id,
          id
        ])

        res(result);
      } catch (e) {
        rej(e);
      }
    })
  }
  /** 
   * @param {number} id
   * @returns {Promise<{
   *   id: number,
   *   nombres: string,
   *   apellidos: string,
   *   usuario: string,
   *   clave: string,
   *   telefono: string,
   *   email: string,
   *   rol_id: number,
   *   rol_nombre: string,
   *   foto_id: string,
   *   foto_src: string,
   *   creacion: string,
   *   estado: number
   * }>}
   */
  readIdJoin(id) {
    return new Promise(async (res, rej) => {
      try {
        this.constraint('id', id);

        let [result] = await this.app.model.poolValues(`
          SELECT
            u.id,
            u.nombres,
            u.apellidos,
            u.usuario,
            u.clave,
            u.telefono,
            u.email,
            u.rol_id,
            r.nombre AS rol_nombre,
            u.foto_id,
            f.src AS foto_src,
            u.creacion,
            u.estado
          FROM
            tb_usuarios AS u
          LEFT 
            JOIN 
              tipo_rol AS r
            ON 
              r.id = u.rol_id
          LEFT 
            JOIN 
              tb_fotos AS f
            ON 
              f.id = u.foto_id
          WHERE
            u.id = ?
        `, [
          id
        ])

        let data = result[0];

        res(data);
      } catch (e) {
        rej(e);
      }
    })
  }
  /**
   * @param {number} id 
   * @param {{
  *   nombres: string,
  *   apellidos: string,
  *   usuario: string,
  *   clave: string,
  *   telefono: string,
  *   email: string,
  *   rol_id: number,
  *   foto_id: number
  * }} data 
  * @param {number} user_rol_id 
  * @returns {Promise<import('mysql').OkPacket>}
  */
  updateId(id, data, user_rol_id) {
    return new Promise(async (res, rej) => {
      try {

        this.constraint('id', id);

        let {
          nombres,
          apellidos,
          usuario,
          telefono,
          email,
          rol_id
        } = data;

        this.constraint('nombres', nombres);
        this.constraint('apellidos', apellidos);
        this.constraint('usuario', usuario, { unic: id });
        this.constraint('telefono', telefono, { unic: id });
        this.constraint('email', email, { unic: id });
        this.constraint('rol_id', rol_id);

        let [result] = await this.app.model.poolValues(`
         UPDATE 
           tb_usuarios
         SET
           nombres = ?,
           apellidos = ?,
           usuario = ?,
           telefono = ?,
           email = ?,
           rol_id = ?
         WHERE 
           id = ?
           AND (1 = ? OR rol_id < ?)
       `, [
          nombres,
          apellidos,
          usuario,
          telefono,
          email,
          rol_id,
          id,
          user_rol_id,
          user_rol_id
        ]);

        this.app.nodeControl.allTagsName.get(`usr:${id}`)?.emit(
          '/session/usuario/reload',
          null,
          (socketClient) => {
            let apikey = socketClient.session.apikey;
            this.app.cache.apiKey.delete(apikey);
            socketClient.disconnect()
          }
        );

        this.io.tagsName.emitRolToSenior(
          rol_id,
          '/usuarios/data/updateId',
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
   * @param {number} estado 
   * @param {number} user_rol_id 
   * @returns {Promise<import('mysql').OkPacket>}
   */
  updateIdState(id, estado, user_rol_id) {
    return new Promise(async (res, rej) => {
      try {
        this.constraint('id', id);
        this.constraint('estado', estado);

        let [result] = await this.app.model.poolValues(`
         UPDATE 
           tb_usuarios
         SET
           estado = ?
         WHERE 
           id = ?
           AND (1 = ? OR rol_id < ?)
       `, [
          estado,
          id,
          user_rol_id,
          user_rol_id
        ]);

        if (!estado)
          this.app.nodeControl.allTagsName.get(`usr:${id}`)?.emit(
            '/session/usuario/reload',
            null,
            socketClient => {
              let apikey = socketClient.session.apikey;
              this.app.cache.apiKey.delete(apikey);
            }
          );

        this.io.sockets.emit(
          '/usuarios/data/state',
          estado
            ? _ => this.readIdJoin(id)
            : { id, estado }
        )

        res(result)
      } catch (e) {
        rej(e)
      }
    })
  }
  /**
   * @param {number} id 
   * @param {string} foto_id 
   * @param {{id:number, src:string, src_small:string}} [dataEmit] 
   * @returns {Promise<import('mysql').OkPacket>}
   */
  updateIdFotoId(id, foto_id, dataEmit) {
    return new Promise(async (res, rej) => {
      try {
        this.constraint('id', id);
        this.constraint('foto_id', foto_id);

        let [result] = await this.app.model.poolValues(`
         UPDATE 
           tb_usuarios
         SET
           foto_id = ?
         WHERE 
           id = ?;
       `, [
          foto_id,
          id
        ]);

        this.app.nodeControl.allTagsName.get(`usr:${id}`)?.emit(
          '/session/usuario/avatar',
          _ => dataEmit || this.app.model.tb_fotos.readIdAll(foto_id),
          (socketClient, dataSend) => {
            let apikey = socketClient.session.apikey;
            let apiData = this.app.cache.apiKey.read(apikey);

            apiData.usuario.foto_id = dataSend.id;
            apiData.usuario.foto_src = dataSend.src;
            apiData.usuario.foto_src_small = dataSend.src_small;

            this.app.cache.apiKey.update(apikey, apiData);
          }
        )

        this.io.sockets.emit(
          '/usuarios/data/deleteId',
          dataEmit
            ? dataEmit
            : _ => this.app.model.tb_fotos.readIdAll(foto_id)
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
  deleteId(id) {
    return new Promise(async (res, rej) => {
      try {
        this.constraint('id', id);

        let [result] = await this.app.model.poolValues(`
         DELETE FROM 
           tb_usuarios 
         WHERE 
           id = ?
       `, [
          id
        ]);

        this.io.sockets.emit(
          '/usuarios/data/deleteId',
          { id }
        )

        res(result)
      } catch (e) {
        rej(e)
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
   * @returns {Promise<COLUMNS_USUARIOS[]>}
   */
  SelectorInParts(option) {
    return new Promise(async (res, rej) => {
      try {
        let { order, start, length, search, byId, noInclude } = option;

        let query = `
          SELECT 
            u.id,
            u.usuario AS name,
            f.src_small AS src
          FROM
            tb_usuarios AS u
          LEFT
            JOIN
              tb_fotos AS f
            ON
              f.id = u.foto_id
          WHERE
            u.estado = 1 
        `, queryParams = [];

        if (search) {
          if (byId) {
            query += `
              AND u.id = ?
            `;

            queryParams.push(search);
          }
          else {
            query += `
              AND u.usuario LIKE ?
            `;

            queryParams.push(`%${search}%`);
          }
        }

        if (noInclude.length && noInclude.every(id => typeof id == 'number')) {
          query += `
            AND u.id NOT IN (${noInclude.map(_ => '?').join(',')})
          `
          queryParams.push(...noInclude);
        }

        if (order) {
          query += `
            ORDER BY
              u.usuario ${order == 'asc' ? 'ASC' : 'DESC'}
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
            tb_usuarios
          WHERE
            estado = 1 
        `, queryParams = [];

        if (typeof search == 'string' && search != '') {
          query += `
            AND nombre LIKE ?
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
    ============================================== Unicos ==============================================
    ====================================================================================================
  */
  /** 
   * @returns {Promise<COLUMNS_USUARIOS[]>}
   */
  readAllUnique() {
    return new Promise(async (res, rej) => {
      try {
        let [result] = await this.app.model.pool(`
          SELECT 
            usuario,
            telefono,
            email
          FROM
            tb_usuarios
        `)

        res(result);
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
            tb_usuarios;
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
            COALESCE(COUNT(id), 0) AS cantidad_usuarios
          FROM 
            tb_usuarios
          WHERE
            estado = 1;
        `)

        res(result[0].cantidad_usuarios);
      } catch (e) {
        rej(e);
      }
    })
  }
  /** 
   * @returns {Promise<COLUMNS_USUARIOS[]>}
   */
  readAllJoin() {
    return new Promise(async (res, rej) => {
      try {
        let [result] = await this.app.model.pool(`
          SELECT 
            u.id,
            u.nombres,
            u.apellidos,
            u.usuario,
            u.clave,
            u.telefono,
            u.email,
            u.rol_id,
            r.nombre AS rol_nombre,
            u.foto_id,
            f.src AS foto_src,
            u.creacion,
            u.estado
          FROM
            tb_usuarios AS u
          LEFT 
            JOIN 
              tipo_rol AS r
            ON 
              r.id = u.rol_id
          LEFT 
            JOIN 
              tb_fotos AS f
            ON 
              f.id = u.foto_id
        `)

        res(result);
      } catch (e) {
        rej(e);
      }
    })
  }
}

module.exports = Tb_usuarios;