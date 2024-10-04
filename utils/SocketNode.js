/** @typedef {import('socket.io').Socket<ListenEvents, EmitEvents, ServerSideEvents, SocketData>} SocketClient */

class SocketNode {
  /** @type {Map<string, SocketNode>} */
  children = new Map;
  /** @type {Map<string, SocketClient>} */
  sockets = new Map;
  /** @type {Map<string, SocketClient>} */
  subrouteSockets = new Map;

  /**
   * @param {string} path 
   */
  #decomposePath(path) {
    return path.split('/').filter(part => part.length > 0);
  }

  /**
   * @param {string} path 
   * @param {SocketClient} socket 
   */
  add(path, socket) {
    const parts = this.#decomposePath(path);
    let current = this;
    for (const part of parts) {
      if (!current.children.has(part))
        current.children.set(part, new SocketNode());

      current = current.children.get(part);
      current.subrouteSockets.set(socket.id, socket);
    }
    current.sockets.set(socket.id, socket);
    socket.on('disconnect', () => this.remove(path, socket.id));
  }

  /**
   * @param {string} path 
   * @param {string} socketId 
   */
  remove(path, socketId) {
    const parts = this.#decomposePath(path);
    let current = this;
    for (const part of parts) {
      if (!current.children.has(part)) return;
      current = current.children.get(part);
      current.subrouteSockets.delete(socketId);
    }
    current.sockets.delete(socketId);
  }

  /**
   * @param {string} path 
   * @returns {Map<string, SocketClient>}
   */
  selector(path) {
    const parts = this.#decomposePath(path);
    let current = this;
    for (const part of parts) {
      if (!current.children.has(part)) return new Map();
      current = current.children.get(part);
    }
    return current.sockets;
  }

  /**
   * @param {string} path 
   * @returns {Map<string, SocketClient>}
   */
  selectorAll(path) {
    const parts = this.#decomposePath(path);
    let current = this;
    for (const part of parts) {
      if (!current.children.has(part)) return new Map();
      current = current.children.get(part);
    }
    return current.subrouteSockets;
  }
}

module.exports = SocketNode;