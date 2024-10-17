/** @typedef {import('socket.io').Socket<ListenEvents, EmitEvents, ServerSideEvents, SocketData>} SocketClient */

/** @extends {Map<string, SocketClient>} */
class SocketMap extends Map {
  constructor() {
    super()
  }

  /** 
   * @template T
   * @param {(socketClient:SocketClient)=>boolean} callback 
   * @param {string} eventName 
   * @param {T | Promise<T> | (() => Promise<T>) | (() => T)} data 
   * @param {(socketClient:SocketClient, dataSend: T)=>void} [each] 
   * @returns {Promise<T>} 
   */
  async #filterEmit(callback, eventName, data, each) {
    if (!this.size) return null;

    let dataEmit = typeof data == 'function' ? await data() : data;

    this.forEach(socketClient => {
      if (!callback || callback(socketClient)) {
        socketClient.emit(eventName, dataEmit);
        each && each(socketClient, dataEmit);
      }
    })
    
    return dataEmit;
  }

  /** 
   * @template T
   * @param {string} eventName 
   * @param {T | Promise<T> | (() => Promise<T>) | (() => T)} data 
   * @param {(socketClient:SocketClient, dataSend: T)=>void} [each] 
   * @returns {Promise<T>} 
   */
  emit(eventName, data, each) {
    return this.#filterEmit(null, eventName, data, each);
  }

  /** 
   * @template T
   * @param {number} usuario_id 
   * @param {string} eventName 
   * @param {T | Promise<T> | (() => Promise<T>) | (() => T)} data 
   * @param {(socketClient:SocketClient, dataSend: T)=>void} [each] 
   * @returns {Promise<T>} 
   */
  emitUser(usuario_id, eventName, data, each) {
    return this.#filterEmit(
      socketClient => socketClient.rooms.has(`usr:${usuario_id}`),
      eventName, data, each
    );
  }

  /** 
   * @template T
   * @param {number} rol_id 
   * @param {string} eventName 
   * @param {T | Promise<T> | (() => Promise<T>) | (() => T)} data 
   * @param {(socketClient:SocketClient, dataSend: T)=>void} [each] 
   * @returns {Promise<T>} 
   */
  emitRol(rol_id, eventName, data, each) {
    return this.#filterEmit(
      socketClient => socketClient.rooms.has(`rol:${rol_id}`),
      eventName, data, each
    );
  }

  /** 
   * @template T
   * @param {string} apiKey 
   * @param {string} eventName 
   * @param {T | Promise<T> | (() => Promise<T>) | (() => T)} data 
   * @param {(socketClient:SocketClient, dataSend: T)=>void} [each] 
   * @returns {Promise<T>} 
   */
  emitApikey(apiKey, eventName, data, each) {
    return this.#filterEmit(
      socketClient => socketClient.rooms.has(`api:${apiKey}`),
      eventName, data, each
    );
  }

  /** 
   * @template T
   * @param {number} rol_id 
   * @param {string} eventName 
   * @param {T | Promise<T> | (() => Promise<T>) | (() => T)} data 
   * @param {(socketClient:SocketClient, dataSend: T)=>void} [each] 
   * @returns {Promise<T>} 
   */
  emitRolToJunior(rol_id, eventName, data, each) {
    return this.#filterEmit(socketClient => {
      if (socketClient.rooms.has(`rol:1`)) return true;
      for (let rol_init = rol_id; rol_init <= 5; rol_init++)
        if (socketClient.rooms.has(`rol:${rol_init}`)) return true;
    }, eventName, data, each);
  }

  /** 
   * @template T
   * @param {number} rol_id 
   * @param {string} eventName 
   * @param {T | Promise<T> | (() => Promise<T>) | (() => T)} data 
   * @param {(socketClient:SocketClient, dataSend: T)=>void} [each] 
   * @returns {Promise<T>} 
   */
  emitRolToSenior(rol_id, eventName, data, each) {
    return this.#filterEmit(socketClient => {
      if (socketClient.rooms.has(`rol:1`)) return true;
      for (let rol_init = rol_id; rol_init >= 1; rol_init--)
        if (socketClient.rooms.has(`rol:${rol_init}`)) return true;
    }, eventName, data, each);
  }
}

module.exports = SocketMap;