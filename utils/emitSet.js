class EmitSet extends Set {
  /** @param {import('../app')} app  */
  constructor(routes, app) {
    super(routes)
    this.app = app;
  }

  #filter(callback) {
    let sockets = [];
    this.app.socket.io.sockets.sockets.forEach(socketClient => {
      if (!this.has(socketClient.session.route)) return;
      if (!callback || callback(socketClient)) sockets.push(socketClient);
    });
    return sockets;
  }

  /** @param {string} eventName @param {()=>Promise} data  */
  async emit(eventName, data) {
    let sockets = this.#filter();
    if (!sockets.length) return;

    let dataEmit = typeof data == 'function' ? await data() : data;
    sockets.forEach(socketClient => {
      socketClient.emit(eventName, dataEmit);
    });
  }

  /** @param {string} id @param {string} eventName @param {()=>Promise} data  */
  async emitUser(id, eventName, data) {
    let sockets = this.#filter(socketClient => socketClient.rooms.has(`usr:${id}`));
    if (!sockets.length) return;

    let dataEmit = typeof data == 'function' ? await data() : data;
    sockets.forEach(socketClient => {
      socketClient.emit(eventName, dataEmit);
    });
  }

  /** @param {string} apiKey @param {string} eventName @param {()=>Promise} data  */
  async emitApikey(apiKey, eventName, data) {
    let sockets = this.#filter(socketClient => socketClient.rooms.has(`api:${apiKey}`));
    if (!sockets.length) return;

    let dataEmit = typeof data == 'function' ? await data() : data;
    sockets.forEach(socketClient => {
      socketClient.emit(eventName, dataEmit);
    });
  }
}

module.exports = EmitSet;