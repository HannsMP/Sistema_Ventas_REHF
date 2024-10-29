/** @typedef {import('socket.io').Socket<ListenEvents, EmitEvents, ServerSideEvents, SocketData>} SocketClient */

const mergeObjects = require('./function/merge');
const Event = require('./Event');

const SocketMap = require('./SocketMap');
const SocketTagMap = require('./SocketTagMap');
const SocketNodes = require('./SocketNodes');

class SocketNode {
  option = {
    last: false,
    tagsName: false,
    collector: false
  }

  /** 
   * @type {Event<{
   *   nodeCreate: SocketNode,
   *   connected: SocketClient,
   *   remove: SocketClient,
   *   destroy: string,
   * }>} 
   */
  ev = new Event;

  name = 'main';
  path = '/';

  /** @type {SocketNode} */
  parentNode = null;
  /** @type {Map<string, SocketNode>} */
  childNodes = new Map;

  sockets = new SocketMap;
  allSockets = new SocketMap;

  tagsName = new SocketTagMap;
  allTagsName = new SocketTagMap;

  /** @param {string} path @returns {string[]} */
  #decomposePath(path) {
    return path.split('/').filter(route => route.length > 0);
  }

  hasNode(path) {
    let routes = this.#decomposePath(path);
    let currentNode = this;

    for (let i in routes) {
      if (currentNode.option.last) 
        return false;

      let route = routes[i];

      if (!currentNode.childNodes.has(route))
        return false;

      currentNode = currentNode.childNodes.get(route);
    }

    return true;
  }

  /**
   * @param {string} path 
   * @param {{last:boolean, tagsName:boolean, collector:boolean}} [option] 
   * @returns {SocketNode}
   */
  createNode(path, option) {
    let routes = this.#decomposePath(path);
    let currentNode = this;

    for (let i in routes) {
      if (currentNode.option.last) {
        currentNode.childNodes.clear()
        return false;
      }

      let route = routes[i];

      if (!currentNode.childNodes.has(route)) {
        let newNode = new SocketNode;
        newNode.path = '/' + routes.slice(0, i + 1).join('/');
        newNode.parentNode = currentNode;
        newNode.name = route;

        if (i + 1 == routes.length && option)
          newNode.option = mergeObjects(this.option, option);

        currentNode.childNodes.set(route, newNode);
        this.ev.emit('nodeCreate', newNode);
      }

      currentNode = currentNode.childNodes.get(route);
    }

    return true;
  }

  /**
   * @param {string} path 
   * @param {boolean} create 
   * @returns {SocketNode}
   */
  selectNode(path, create = false) {
    let routes = this.#decomposePath(path);
    let currentNode = this;

    for (let i in routes) {
      if (currentNode.option.last){
        currentNode.childNodes.clear()
        return undefined;
      }

      let route = routes[i];

      if (!currentNode.childNodes.has(route)) {
        if (create) {
          let newNode = new SocketNode;
          newNode.path = '/' + routes.slice(0, i + 1).join('/');
          newNode.parentNode = currentNode;
          newNode.name = route;

          currentNode.childNodes.set(route, newNode);
          this.ev.emit('nodeCreate', newNode);
        }
        else
          return undefined
      }

      currentNode = currentNode.childNodes.get(route);
    }

    return currentNode;
  }

  /**
   * @param  {string[]} paths 
   */
  selectNodes(...paths) {
    return new SocketNodes(
      paths,
      paths.map(p => this.selectNode(p, true))
    );
  }

  /**
   * @param {string} path 
   * @returns {Map<string, SocketClient>}
   */
  deleteNode(path) {
    let routes = this.#decomposePath(path);
    let currentNode = this;

    for (let route of routes) {
      if (!currentNode.childNodes.has(route)) return false;
      currentNode = currentNode.childNodes.get(route);
    }
    let successDelete = false;

    let partToRemove = routes.at(-1);
    if (currentNode.parentNode && partToRemove) {
      successDelete = currentNode.parentNode.childNodes.delete(partToRemove);
      currentNode.ev.emit('destroy', path);
    }

    return successDelete;
  }

  /**
   * @param {string} path 
   * @param {SocketClient} socket 
   * @param {string[]} tags 
  */
  async addSocket(path, socket, tags) {
    let routes = this.#decomposePath(path);
    let currentNode = this;

    let addSocket = () => {
      if (currentNode.option.collector)
        currentNode.allSockets.set(socket.id, socket);

      if (tags?.constructor?.name != 'Array' || !tags.length) return;
      if (!currentNode.option.tagsName && !currentNode.option.collector) return;

      tags.forEach(t => {
        if (currentNode.option.tagsName)
          (currentNode.tagsName.has(t)
            ? currentNode.tagsName
            : currentNode.tagsName.set(t, new SocketMap)
          ).get(t).set(socket.id, socket);

        if (currentNode.option.tagsName && currentNode.option.collector)
          (currentNode.allTagsName.has(t)
            ? currentNode.allTagsName
            : currentNode.allTagsName.set(t, new SocketMap)
          ).get(t).set(socket.id, socket);
      })
    }

    for (let route of routes) {
      if (currentNode.option.last)
        return false;

      if (!currentNode.childNodes.has(route))
        return false;

      currentNode = currentNode.childNodes.get(route);
      addSocket();
    }

    currentNode.sockets.set(socket.id, socket);

    socket.on('disconnect', _ => this.removeSocket(path, socket.id));
    socket.on('connected', res => {
      res(); socket.emit('connected');
      currentNode.ev.emit('connected', socket);
    });

    socket.join(tags);
  }

  /**
   * @param {string} path 
   * @param {string} socketId 
   */
  async removeSocket(path, socketId) {
    let routes = this.#decomposePath(path);
    let currentNode = this;

    for (let route of routes) {
      if (!currentNode.childNodes.has(route)) return false;
      currentNode = currentNode.childNodes.get(route);
      currentNode.allSockets.delete(socketId);
      if (currentNode.tagsName.size) currentNode.tagsName.forEach(t => t.delete(socketId));
      if (currentNode.allTagsName.size) currentNode.allTagsName.forEach(t => t.delete(socketId));
    }
    let successDelete = currentNode.sockets.delete(socketId);

    currentNode.ev.emit('remove', currentNode.sockets.get(socketId));
    return successDelete
  }
}

module.exports = SocketNode;