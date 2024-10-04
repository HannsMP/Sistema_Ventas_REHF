const { Server } = require('socket.io');
const cookie = require('cookie');
const SocketNode = require('../utils/SocketNode');
const SocketRouter = require('../utils/SocketRoot');

class Socket {

  /** @param {import('./../app')} app  */
  constructor(app) {
    this.io = new Server(app.server);
    this.app = app;

    this.node = new SocketNode;
    this.rootControl = new SocketRouter('/control', this.app);

    this.io.use(async (socketClient, next) => {
      try {
        let cookies = socketClient.handshake.headers.cookie;

        if (!cookies) throw new Error('No se encontraron cookies');

        let referer = socketClient.handshake.headers.referer;

        if (!referer) throw new Error('No Existe la referencia');

        let parsedCookies = cookie.parse(cookies);
        let apikey = parsedCookies.apiKey;

        if (!apikey) throw new Error('ApiKey no encontrada en las cookies');

        socketClient.session = { apikey };

        if (!this.app.cache.apiKey.exist(apikey)) throw new Error('ApiKey no válida');
        socketClient.session.apikey = apikey;

        let route = new URL(referer)
        socketClient.session.route = route.pathname;

        this.node.add(route.pathname, socketClient);

        let { usuario } = this.app.cache.apiKey.read(apikey);

        await socketClient.join([
          `rol:${usuario.rol_id}`,
          `usr:${usuario.id}`,
          `api:${apikey}`
        ]);

        socketClient.on('disconnect', () => {
          this.app.model.tb_asistencias.updateUserId(usuario.id);
        })

        socketClient.on('/err/client', ({ message, stack, urlScript }) => {
          this.app.logError.writeStart(`route: ${urlScript}\nuser: ${usuario.usuario}\nmessage: ${message}\nstack: ${stack}`);
        })

        next();
      } catch (error) {
        next(error);
      }
    })
  }

  emit(eventName, data) {
    this.io.emit(eventName, data);
  }

  emitUser(id, eventName, data) {
    this.io.to(`usr:${id}`).emit(eventName, data);
  }

  emitApikey(apiKey, eventName, data) {
    this.io.to(`api:${apiKey}`).emit(eventName, data);
  }


  /** 
   * @param {number} rol_id 
   * @param {string} eventName 
   * @param {T|Promise<T>|()=>Promise<T>} data 
   * @param {(socketClient:SocketClient, dataSend: T)=>void} [each] 
   */
  emitRolToJunior(rol_id, eventName, data) {
    this.io.sockets.sockets.forEach(socketClient => {
      if (socketClient.rooms.has(`rol:1`))
        return socketClient.emit(eventName, data);

      for (let rol_init = rol_id; rol_init <= 5; rol_init++)
        if (socketClient.rooms.has(`rol:${rol_init}`))
          return socketClient.emit(eventName, data);
    })

  }

  /** 
   * @param {number} rol_id 
   * @param {string} eventName 
   * @param {T|Promise<T>|()=>Promise<T>} data 
   * @param {(socketClient:SocketClient, dataSend: T)=>void} [each] 
   */
  emitRolToSenior(rol_id, eventName, data) {
    this.io.sockets.sockets.forEach(socketClient => {
      if (socketClient.rooms.has(`rol:1`))
        return socketClient.emit(eventName, data);

      for (let rol_init = rol_id; rol_init >= 1; rol_init--)
        if (socketClient.rooms.has(`rol:${rol_init}`));
      return socketClient.emit(eventName, data);
    })
  }
}

module.exports = Socket