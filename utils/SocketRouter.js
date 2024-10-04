/** @typedef {import('socket.io').Socket<ListenEvents, EmitEvents, ServerSideEvents, SocketData>} SocketClient */

/** @template T */
class SocketRouter {
  /** @param {string[]} routes @param {import('../app')} app  */
  constructor(routes, app) {
    this.routes = routes;
    this.app = app;
  }

  /** 
   * @param {(socketClient:SocketClient)=>boolean} callback 
   * @param {string} eventName 
   * @param {T|Promise<T>|()=>Promise<T>} data 
   * @param {(socketClient:SocketClient, dataSend: T)=>void} [each] 
   * @returns {Promise<SocketClient[]>} 
   */
  async #filterEmit(callback, eventName, data, each) {
    let socketsRoute = this.routes
      .map(r => this.app.socket.node.selector(r));

    /** @type {SocketClient[]} */
    let sockets = [];
    socketsRoute.forEach(s => s.forEach(socketClient => (!callback || callback(socketClient)) && sockets.push(socketClient)))

    if (!sockets.length) return false;

    let dataEmit = typeof data == 'function' ? await data() : data;
    sockets.forEach(socketClient => {
      socketClient.emit(eventName, dataEmit);
      each && each(socketClient, dataEmit);
    })
    return true;
  }

  /** 
   * @param {string} eventName 
   * @param {T|Promise<T>|()=>Promise<T>} data 
   * @param {(socketClient:SocketClient, dataSend: T)=>void} [each] 
   */
  emit(eventName, data, each) {
    return this.#filterEmit(null, eventName, data, each);
  }

  /** 
   * @param {string} id 
   * @param {string} eventName 
   * @param {T|Promise<T>|()=>Promise<T>} data 
   * @param {(socketClient:SocketClient, dataSend: T)=>void} [each] 
   */
  emitUser(usuario_id, eventName, data, each) {
    return this.#filterEmit(
      socketClient => socketClient.rooms.has(`usr:${usuario_id}`),
      eventName, data, each
    );
  }

  /** 
   * @param {string} rol_id 
   * @param {string} eventName 
   * @param {T|Promise<T>|()=>Promise<T>} data 
   * @param {(socketClient:SocketClient, dataSend: T)=>void} [each] 
   */
  emitRol(rol_id, eventName, data, each) {
    return this.#filterEmit(
      socketClient => socketClient.rooms.has(`rol:${rol_id}`),
      eventName, data, each
    );
  }

  /** 
   * @param {string} apiKey 
   * @param {string} eventName 
   * @param {T|Promise<T>|()=>Promise<T>} data 
   * @param {(socketClient:SocketClient, dataSend: T)=>void} [each] 
   */
  emitApikey(apiKey, eventName, data, each) {
    return this.#filterEmit(
      socketClient => socketClient.rooms.has(`api:${apiKey}`),
      eventName, data, each
    );
  }

  /** 
   * @param {number} rol_id 
   * @param {string} eventName 
   * @param {T|Promise<T>|()=>Promise<T>} data 
   * @param {(socketClient:SocketClient, dataSend: T)=>void} [each] 
   */
  emitRolToJunior(rol_id, eventName, data, each) {
    return this.#filterEmit(socketClient => {
      if (socketClient.rooms.has(`rol:1`)) return true;
      for (let rol_init = rol_id; rol_init <= 5; rol_init++)
        if (socketClient.rooms.has(`rol:${rol_init}`)) return true;
    }, eventName, data, each);
  }

  /** 
   * @param {number} rol_id 
   * @param {string} eventName 
   * @param {T|Promise<T>|()=>Promise<T>} data 
   * @param {(socketClient:SocketClient, dataSend: T)=>void} [each] 
   */
  emitRolToSenior(rol_id, eventName, data, each) {
    return this.#filterEmit(socketClient => {
      if (socketClient.rooms.has(`rol:1`)) return true;
      for (let rol_init = rol_id; rol_init >= 1; rol_init--)
        if (socketClient.rooms.has(`rol:${rol_init}`)) return true;
    }, eventName, data, each);
  }
}

module.exports = SocketRouter;