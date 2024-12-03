/** @typedef {import('socket.io').Socket<ListenEvents, EmitEvents, ServerSideEvents, SocketData>} SocketClient */

/** @extends {Map<string, SocketClient>} */
class SocketMap extends Map {
  constructor() {
    super();
  }

  /**
   * @template T
   * @param {string} eventName
   * @param {T | Promise<T> | (() => Promise<T>) | (() => T)} data
   * @param {(socketClient:SocketClient, dataSend: T)=>void} [each]
   * @returns {Promise<T>}
   */
  async emit(eventName, data, each) {
    if (!this.size) return null;

    let dataEmit = typeof data == 'function' ? await data() : data;

    if (each)
      this.forEach(socketClient => {
        socketClient.emit(eventName, dataEmit);
        each(socketClient, dataEmit);
      })
    else
      this.forEach(socketClient => {
        socketClient.emit(eventName, dataEmit);
      })

    return dataEmit;
  }
}

module.exports = SocketMap;