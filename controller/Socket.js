const { Server } = require('socket.io');
const cookie = require('cookie');
const SocketNode = require('../utils/SocketNode');

/** @typedef {import('socket.io').Socket<ListenEvents, EmitEvents, ServerSideEvents, SocketData>} SocketClient */

class Socket {

  /** @param {import('./../app')} app  */
  constructor(app) {
    this.io = new Server(app.server);
    this.app = app;

    this.node = new SocketNode;

    this.io.use(async (socketClient, next) => {
      try {
        let cookies = socketClient.handshake.headers.cookie;

        if (!cookies)
          throw new Error('No se encontraron cookies');

        let referer = socketClient.handshake.headers.referer;

        if (!referer)
          throw new Error('No Existe la referencia');

        let parsedCookies = cookie.parse(cookies);
        let apikey = parsedCookies.apiKey;

        if (!apikey)
          throw new Error('ApiKey no encontrada en las cookies');

        socketClient.session = { apikey };

        if (!this.app.cache.apiKey.exist(apikey))
          throw new Error('ApiKey no válida');

        socketClient.session.apikey = apikey;


        let { usuario } = this.app.cache.apiKey.read(apikey);
        let route = new URL(referer)

        let tags = [`rol:${usuario.rol_id}`, `usr:${usuario.id}`, `api:${apikey}`, `url:${route.pathname}`];
        socketClient.session.data = usuario;
        socketClient.session.route = route.pathname;
        socketClient.session.usuario_id = usuario.id;
        socketClient.session.rol_id = usuario.rol_id;
        socketClient.session.tags = tags;

        next();
      } catch (error) {
        next(error);
      }
    })
    this.io.on('connection', socketClient => {
      this.node.addSocket(
        socketClient.session.route,
        socketClient,
        socketClient.session.tags
      );

      socketClient.on('disconnect', () => {
        this.app.model.tb_asistencias.updateUserId(socketClient.session.usuario_id);
      })

      socketClient.on('/err/client', ({ message, stack, urlScript }) => {
        this.app.logError.writeStart(`route: ${urlScript}\nuser: ${socketClient.session.data.usuario}\nmessage: ${message}\nstack: ${stack}`);
      })

    })
  }

  /**
   * @template T
   * @param {string} route
   * @param {(socketClient:SocketClient)=>boolean} callback
   * @param {string} eventName
   * @param {T | Promise<T> | (() => Promise<T>) | (() => T)} data
   * @param {(socketClient:SocketClient, dataSend: T)=>void} [each]
   * @returns {Promise<T>}
   */
  async #filterEmit(route, callback, eventName, data, each) {
    let socketsRoot = this.node.selectNode(route).sockets;

    if (!socketsRoot.size) return null;

    let dataEmit = typeof data == 'function' ? await data() : data;

    socketsRoot.forEach(socketClient => {
      if (!callback || callback(socketClient)) {
        socketClient.emit(eventName, dataEmit);
        each && each(socketClient, dataEmit);
      }
    })
    return dataEmit;
  }

  /**
   * @template T
   * @param {string} route
   * @param {string} eventName
   * @param {T | Promise<T> | (() => Promise<T>) | (() => T)} data
   * @param {(socketClient:SocketClient, dataSend: T)=>void} [each]
   * @returns {Promise<T>}
   */
  emitRoute(route, eventName, data, each) {
    return this.#filterEmit(route, null, eventName, data, each);
  }

  /**
   * @template T
   * @param {string} route
   * @param {number} usuario_id
   * @param {string} eventName
   * @param {T | Promise<T> | (() => Promise<T>) | (() => T)} data
   * @param {(socketClient:SocketClient, dataSend: T)=>void} [each]
   * @returns {Promise<T>}
   */
  emitRouteByUser(route, usuario_id, eventName, data, each) {
    return this.#filterEmit(
      route,
      socketClient => socketClient.rooms.has(`usr:${usuario_id}`),
      eventName, data, each
    );
  }

  /**
   * @template T
   * @param {string} route
   * @param {string} rol_id
   * @param {string} eventName
   * @param {T | Promise<T> | (() => Promise<T>) | (() => T)} data
   * @param {(socketClient:SocketClient, dataSend: T)=>void} [each]
   * @returns {Promise<T>}
   */
  emitRouteByRol(route, rol_id, eventName, data, each) {
    return this.#filterEmit(
      route,
      socketClient => socketClient.rooms.has(`rol:${rol_id}`),
      eventName, data, each
    );
  }

  /**
   * @template T
   * @param {string} route
   * @param {string} apiKey
   * @param {string} eventName
   * @param {T | Promise<T> | (() => Promise<T>) | (() => T)} data
   * @param {(socketClient:SocketClient, dataSend: T)=>void} [each]
   * @returns {Promise<T>}
   */
  emitRouteByApikey(route, apiKey, eventName, data, each) {
    return this.#filterEmit(
      route,
      socketClient => socketClient.rooms.has(`api:${apiKey}`),
      eventName, data, each
    );
  }

  /**
   * @template T
   * @param {string} route
   * @param {number} rol_id
   * @param {string} eventName
   * @param {T | Promise<T> | (() => Promise<T>) | (() => T)} data
   * @param {(socketClient:SocketClient, dataSend: T)=>void} [each]
   * @returns {Promise<T>}
   */
  emitRouteByRolToJunior(route, rol_id, eventName, data, each) {
    return this.#filterEmit(
      route,
      socketClient => {
        if (socketClient.rooms.has(`rol:1`)) return true;
        for (let rol_init = rol_id; rol_init <= 5; rol_init++)
          if (socketClient.rooms.has(`rol:${rol_init}`)) return true;
      },
      eventName, data, each
    );
  }

  /**
   * @template T
   * @param {string} route
   * @param {number} rol_id
   * @param {string} eventName
   * @param {T | Promise<T> | (() => Promise<T>) | (() => T)} data
   * @param {(socketClient:SocketClient, dataSend: T)=>void} [each]
   * @returns {Promise<T>}
   */
  emitRouteByRolToSenior(route, rol_id, eventName, data, each) {
    return this.#filterEmit(
      route,
      socketClient => {
        if (socketClient.rooms.has(`rol:1`)) return true;
        for (let rol_init = rol_id; rol_init >= 1; rol_init--)
          if (socketClient.rooms.has(`rol:${rol_init}`)) return true;
      },
      eventName, data, each
    );
  }
}

module.exports = Socket