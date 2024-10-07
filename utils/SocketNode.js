/** @typedef {import('socket.io').Socket<ListenEvents, EmitEvents, ServerSideEvents, SocketData>} SocketClient */

const Event = require('./Event');

class SocketNode {
  name = 'main';
  path = '/';

  /** 
   * @type {Event<{
   *   nodeCreate: SocketNode,
   *   nodeEmpty: string,
   *   nodeDestroy: string,
   *   destroy: string,
   * }>} 
   */
  ev = new Event;

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
    let pathRecursive = [''];

    for (const part of parts) {
      pathRecursive.push(part);
      if (!current.children.has(part)) {
        const newNode = new SocketNode();
        newNode.name = part;
        newNode.path = pathRecursive.join('/');

        current.children.set(part, newNode);
        this.ev.emit('nodeCreate', newNode);
      }
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
    let parent = null;
    let partToRemove = null;

    for (const part of parts) {
      if (!current.children.has(part)) return;
      parent = current;
      partToRemove = part;
      current = current.children.get(part);
      current.subrouteSockets.delete(socketId);
    }

    current.sockets.delete(socketId);

    if (current.sockets.size == 0 && current.subrouteSockets.size == 0) {
      this.ev.emit('nodeEmpty', path);

      if (parent && partToRemove) {
        parent.children.delete(partToRemove);
        current.ev.emit('destroy', path);

        this.ev.emit('nodeDestroy', path);
      }
    }
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