const { Table } = require('../utils/UtilsModel');
const SocketRouter = require('../utils/SocketRouter');

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
 * }} COLUMNS
 */

class Tb_usuarios extends Table {
  /** @param {import('../app')} app */
  constructor(app) {
    super(name);
    this.columns = columns;
    this.app = app;

    this.io = new SocketRouter([
      '/control/administracion/usuarios',
    ], app)
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

        /** @type {COLUMNS} */
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
   * @returns {Promise<COLUMNS>}
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

        /** @type {COLUMNS} */
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
   * @param {COLUMNS} data 
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

        this.io.emitRolToJunior(
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

        /** @type {COLUMNS} */
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

        this.app.socket.rootControl.emitUser(
          id,
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
   * @param {number} id 
   * @returns {Promise<COLUMNS[]>}
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

        this.app.socket.rootControl.emitUser(
          id,
          '/session/usuario/reload',
          null,
          (socketClient) => {
            let apikey = socketClient.session.apikey;
            this.app.cache.apiKey.delete(apikey);
          });

        this.io.emitRolToSenior(
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

        if (!estado) this.app.socket.rootControl.emitUser(
          id,
          '/session/usuario/reload',
          null,
          socketClient => {
            let apikey = socketClient.session.apikey;
            this.app.cache.apiKey.delete(apikey);
          });

        this.io.emit(
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

        this.app.socket.rootControl.emitUser(
          id,
          '/session/usuario/avatar',
          _ => dataEmit || this.app.model.tb_fotos.readId(foto_id),
          (socketClient, dataSend) => {
            let apikey = socketClient.session.apikey;
            let apiData = this.app.cache.apiKey.read(apikey);

            apiData.usuario.foto_id = dataSend.id;
            apiData.usuario.foto_src = dataSend.src;
            apiData.usuario.foto_src_small = dataSend.src_small;

            this.app.cache.apiKey.update(apikey, apiData);
          }
        )

        this.io.emit(
          '/usuarios/data/deleteId',
          dataEmit || this.app.model.tb_fotos.readId(foto_id)
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

        this.io.emit(
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
   * @returns {Promise<Array.<{code: string, name: string}>>}
   */
  selectorReadAll() {
    return new Promise(async (res, rej) => {
      try {
        let [result] = await this.app.model.pool(`
          SELECT 
            id,
            usuario AS name
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
    ============================================== Unicos ==============================================
    ====================================================================================================
  */
  /** 
   * @returns {Promise<COLUMNS[]>}
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
  /* 
    ====================================================================================================
    ============================================== Utiles ==============================================
    ====================================================================================================
  */
  /** 
   * @returns {Promise<COLUMNS[]>}
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
  /** 
    * @returns {Promise<COLUMNS[]>}
    */
  readAll() {
    return new Promise(async (res, rej) => {
      try {
        let [result] = await this.app.model.pool(`
          SELECT 
            *
          FROM
            tb_usuarios
        `)

        res(result);
      } catch (e) {
        rej(e);
      }
    })
  }
  /** 
   * @param {number} id
   * @returns {Promise<COLUMNS>}
   */
  readId(id) {
    return new Promise(async (res, rej) => {
      try {
        this.constraint('id', id);

        let [result] = await this.app.model.poolValues(`
          SELECT
            *
          FROM
            tb_usuarios
          WHERE
            id = ?
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
}

module.exports = Tb_usuarios;