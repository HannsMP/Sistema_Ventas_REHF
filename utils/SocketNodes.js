/** @typedef {import('socket.io').Socket<ListenEvents, EmitEvents, ServerSideEvents, SocketData>} SocketClient */
/** @typedef {import('./SocketNode')} SocketNode */

class SocketNodes {
  /**
   * @param {string[]} paths 
   * @param {SocketNode[]} nodes 
   */
  constructor(paths, nodes) {
    this.paths = paths;
    this.nodos = nodes;
    this.sockets = nodes.map(n => n.sockets);
    this.tagsName = nodes.map(n => n.tagsName);
  }

  get sizesSocket() {
    return this.sockets.reduce((collector, current) => collector + current.size, 0);
  }

  /**
 * @template T
 * @param {string} eventName 
 * @param {T | Promise<T> | (() => Promise<T>) | (() => T)} data 
 * @param {(socketClient:SocketClient, dataSend: T)=>void} [each] 
 * @returns {Promise<T>} 
 */
  async emitSocket(eventName, data, each) {
    if (!this.sizesSocket) return

    let dataEmit = typeof data == 'function' ? await data() : data;

    if (each)
      this.sockets.forEach(socketClient => {
        socketClient.emit(eventName, dataEmit)
        each(socketClient, dataEmit)
      })
    else
      this.sockets.forEach(socketClient => {
        socketClient.emit(eventName, dataEmit)
      })
  }

  get sizesTag() {
    return this.tagsName.reduce((collector, current) => collector + current.sizes(), 0)
  }

  /**
   * @template T
   * @param {string} eventName 
   * @param {T | Promise<T> | (() => Promise<T>) | (() => T)} data 
   * @param {(socketClient:SocketClient, dataSend: T)=>void} [each] 
   * @returns {Promise<T>} 
   */
  async emitTag(eventName, data, each) {
    if (!this.sizesTag) return

    let dataEmit = typeof data == 'function' ? await data() : data;

    if (each)
      this.tagsName.forEach(
        nt => nt.forEach(
          t => t.forEach(socketClient => {
            socketClient.emit(eventName, dataEmit)
            each(socketClient, dataEmit)
          })
        )
      )
    else
      this.tagsName.forEach(
        nt => nt.forEach(
          t => t.forEach(socketClient => {
            socketClient.emit(eventName, dataEmit)
          })
        )
      )
  }
}

module.exports = SocketNodes;