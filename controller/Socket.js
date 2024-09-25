const { Server } = require('socket.io');
const cookie = require('cookie');

class Socket {
  /** @param {import('./../app')} app  */
  constructor(app) {
    this.io = new Server(app.server);
    this.app = app;
    this.io.use((socketClient, next) => {
      try {
        let cookies = socketClient.handshake.headers.cookie;

        if (!cookies) throw new Error('No se encontraron cookies');

        let parsedCookies = cookie.parse(cookies);
        let apikey = parsedCookies.apiKey;

        if (!apikey) throw new Error('ApiKey no encontrada en las cookies');

        socketClient.session = { apikey };

        if (!this.app.cache.apiKey.exist(apikey)) throw new Error('ApiKey no válida');
        socketClient.session.apikey = apikey;

        let route = new URL(socketClient.handshake.headers.referer)
        socketClient.session.route = route.pathname;

        next();
      } catch (error) {
        next(error);
      }
    })

    this.io.on('connection', async socketClient => {
      let apikey = socketClient.session.apikey;
      let { usuario } = this.app.cache.apiKey.read(apikey);

      socketClient.join([
        `rol:${usuario.rol_id}`,
        `usr:${usuario.id}`,
        `api:${apikey}`
      ]);

      socketClient.on('disconnect', () => {
        this.app.model.tb_asistencias.updateUserId(usuario.id);
      })

      socketClient.on('/err/client', ({ message, stack, url }) => {
        this.app.logError.writeStart(`route: ${url}\nuser: ${usuario.usuario}\nmessage: ${message}\nstack: ${stack}`);
      })
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
  /** @param {string} route @param {string} eventName @param {any} data  */
  async emitControl(route, eventName, data, inSite = true) {
    let rolEmit = await this.app.model.tb_permisos.socketPath(route);
    if (!rolEmit.length) return

    this.io.sockets.sockets.forEach(socketClient => {
      if (inSite && route != socketClient.session.route) return;  
      if (!rolEmit.some(id => socketClient.rooms.has(`rol:${id}`))) return;

      socketClient.emit(eventName, data);
    })
  }
}

module.exports = Socket