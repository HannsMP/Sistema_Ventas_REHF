/** @typedef {import('socket.io').Socket<ListenEvents, EmitEvents, ServerSideEvents, SocketData>} SocketClient */
/** @typedef {'rol:'|'usr:'|'api:'} tagsName */
/** @typedef {import('./SocketMap')} SocketMap */

/** @extends {Map<tagsName, SocketMap>} */
class SocketTagMap extends Map {
  constructor() {
    super();
  }

  sizes() {
    let sum = 0;
    this.forEach(s => sum += s.size)
    return sum
  }

  /** 
   * @template T
   * @param {tagsName[]} tags 
   * @param {string} eventName 
   * @param {T | Promise<T> | (() => Promise<T>) | (() => T)} data 
   * @param {(socketClient:SocketClient, dataSend: T)=>void} [each] 
   * @returns {Promise<T>} 
   */
  async emitTag(tags, eventName, data, each) {
    if (!tags.length && !this.size) return null;

    let dataEmit = typeof data == 'function' ? await data() : data;

    if (tags.length == 1) {
      if (each)
        this.get(tags[0])?.forEach(socketClient => {
          socketClient.emit(eventName, dataEmit);
          each(socketClient, dataEmit);
        })
      else
        this.get(tags[0])?.forEach(socketClient => {
          socketClient.emit(eventName, dataEmit);
        })
    } else {

      let socketIdSet = new Set;

      if (each)
        tags.forEach(t => this.get(t)?.forEach((socketClient, socketId) => {
          if (socketIdSet.has(socketId)) return;

          socketClient.emit(eventName, dataEmit);
          each(socketClient, dataEmit);
          socketIdSet.add(socketId);
        }))
      else
        tags.forEach(t => this.get(t)?.forEach((socketClient, socketId) => {
          if (socketIdSet.has(socketId)) return;

          socketClient.emit(eventName, dataEmit);
          socketIdSet.add(socketId);
        }))
    }

    return dataEmit;

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
    let rolIds = [`rol:1`];
    for (let rol_init = rol_id; rol_init <= 5; rol_init++)
      rolIds.push(`rol:${rol_init}`)

    return this.emitTag(
      rolIds,
      eventName,
      data,
      each
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
  emitRolToSenior(rol_id, eventName, data, each) {
    let rolIds = [`rol:1`];
    for (let rol_init = rol_id; rol_init >= 1; rol_init--)
      rolIds.push(`rol:${rol_init}`)

    return this.emitTag(
      rolIds,
      eventName,
      data,
      each
    );
  }
}

module.exports = SocketTagMap;