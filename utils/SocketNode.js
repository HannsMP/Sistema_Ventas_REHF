/** @typedef {import('socket.io').Socket<ListenEvents, EmitEvents, ServerSideEvents, SocketData>} SocketClient */

let Event = require('./Event');
const SocketMap = require('./SocketMap');

class SocketNode {
  /** @type {SocketNode} */
  parentNode = null;
  name = 'main';
  path = '/';

  /** 
   * @type {Event<{
   *   nodeCreate: SocketNode,
   *   add: SocketClient,
   *   remove: SocketClient,
   *   destroy: string,
   * }>} 
   */
  ev = new Event;

  /** @type {Map<string, SocketNode>} */
  children = new Map;

  sockets = new SocketMap;
  subrouteSockets = new SocketMap;

  /**
   * @param {string} path 
   */
  #decomposePath(path) {
    return path.split('/').filter(route => route.length > 0);
  }

  /**
   * @param {string} path 
   * @param {SocketClient} [socket] 
   * @returns {SocketNode}
   */
  #nodeCreate(path, socket) {
    let routes = this.#decomposePath(path);
    let currentNode = this;
    let pathRecursive = [''];

    for (let route of routes) {
      pathRecursive.push(route);
      if (!currentNode.children.has(route)) {
        let newNode = new SocketNode();
        newNode.name = route;
        newNode.path = pathRecursive.join('/');
        newNode.parentNode = currentNode;

        currentNode.children.set(route, newNode);
        this.ev.emit('nodeCreate', newNode);
      }

      currentNode = currentNode.children.get(route);

      if (socket)
        currentNode.subrouteSockets.set(socket.id, socket);
    }

    return currentNode;
  }

  /**
   * @param {string} path 
   * @returns {SocketNode}
   */
  selectNode(path) {
    return this.#nodeCreate(path);
  }

  /**
   * @param {string} path 
   * @returns {Map<string, SocketClient>}
   */
  deleteNode(path) {
    let routes = this.#decomposePath(path);
    let currentNode = this;

    for (let route of routes) {
      if (!currentNode.children.has(route)) return false;
      currentNode = currentNode.children.get(route);
    }
    let successDelete = false;

    let partToRemove = routes.at(-1);
    if (currentNode.parentNode && partToRemove) {
      successDelete = currentNode.parentNode.children.delete(partToRemove);
      currentNode.ev.emit('destroy', path);
    }

    return successDelete;
  }

  /**
   * @param {string} path 
   * @param {SocketClient} socket 
   */
  add(path, socket) {
    let node = this.#nodeCreate(path, socket);
    node.sockets.set(socket.id, socket);
    node.ev.emit('add', socket);
    socket.on('disconnect', () => this.remove(path, socket.id));
  }

  /**
   * @param {string} path 
   * @param {string} socketId 
   */
  remove(path, socketId) {
    let routes = this.#decomposePath(path);
    let currentNode = this;

    for (let route of routes) {
      if (!currentNode.children.has(route)) return false;
      currentNode = currentNode.children.get(route);
      currentNode.subrouteSockets.delete(socketId);
    }

    let successDelete = currentNode.sockets.delete(socketId);
    currentNode.ev.emit('remove', currentNode.sockets.get(socketId));
    return successDelete
  }

  /**
   * @param {string} path 
   * @returns {Map<string, SocketClient>}
   */
  selector(path) {
    let routes = this.#decomposePath(path);
    let currentNode = this;
    for (let route of routes) {
      if (!currentNode.children.has(route)) return new Map();
      currentNode = currentNode.children.get(route);
    }
    return currentNode.sockets;
  }

  /**
   * @param {string} path 
   * @returns {Map<string, SocketClient>}
   */
  selectorAll(path) {
    let routes = this.#decomposePath(path);
    let currentNode = this;
    for (let route of routes) {
      if (!currentNode.children.has(route)) return new Map();
      currentNode = currentNode.children.get(route);
    }
    return currentNode.subrouteSockets;
  }
}

module.exports = SocketNode;