/** 
 * @typedef {{session: {
 *   apikey:string, 
 *   routes:string, 
 *   usuario_id:number, 
 *   rol_id:number, 
 *   tags:string[]
 * }}} Session
 * @typedef {import('socket.io').Socket<ListenEvents, EmitEvents, ServerSideEvents, SocketData>} Cliente 
 * @typedef {Cliente & Session} SocketClient
 * @typedef {{last:boolean, tagsName:boolean, collector:boolean}} OptionNode
 * 
 */

const mergeObjects = require('./function/merge');
const Event = require('./Event');

const SocketMap = require('./SocketMap');
const SocketTagMap = require('./SocketTagMap');
const SocketNodes = require('./SocketNodes');

class SocketNode {
  #option = {
    last: false,
    tagsName: false,
    collector: false
  }

  /**
   * @type {Event<{
   *   connected: SocketClient,
   *   nodeCreate: SocketNode,
   *   remove: SocketClient,
   *   ready: SocketClient,
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

  get option() {
    return {
      ...this.#option
    }
  }

  /** @param {OptionNode} option  */
  setOption(option) {
    this.#option = mergeObjects(this.#option, option);
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
   * @param {boolean | OptionNode} create
   * @returns {SocketNode}
   */
  selectNode(path, create = false) {
    let routes = this.#decomposePath(path);
    let currentNode = this;

    for (let i in routes) {
      if (currentNode.option.last) {
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

    if (create?.constructor?.name == "Object")
      currentNode.setOption(create);
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
  addSocket(path, socket, tags) {
    let routes = this.#decomposePath(path);
    let currentNode = this;

    let ready = () => {
      socket.once('disconnect', _ => this.removeSocket(path, socket.id));
      socket.once('ready', res => res() && currentNode.ev.emit('ready', socket));
    }

    let add = () => {
      let is = 0;
      if (currentNode.option.collector) {
        currentNode.allSockets.set(socket.id, socket);
        ready();
        is++;
      }

      if (tags?.constructor?.name != 'Array' || !tags.length) return;
      if (!currentNode.option.tagsName && !currentNode.option.collector) return;

      if (!is) ready();

      tags.forEach(t => {
        if (currentNode.option.tagsName) (
          currentNode.tagsName.has(t)
            ? currentNode.tagsName
            : currentNode.tagsName.set(t, new SocketMap)
        ).get(t).set(socket.id, socket);

        if (currentNode.option.tagsName && currentNode.option.collector) (
          currentNode.allTagsName.has(t)
            ? currentNode.allTagsName
            : currentNode.allTagsName.set(t, new SocketMap)
        ).get(t).set(socket.id, socket);
      })
    }

    for (let index in routes) {
      let route = routes[index];

      if (!currentNode.childNodes.has(route))
        return false;

      if (currentNode.option.last)
        return false;

      currentNode = currentNode.childNodes.get(route);
      add();
    }

    ready();
    currentNode.sockets.set(socket.id, socket);
    currentNode.ev.emit('connected', socket);

    socket.join(tags);
    return true;
  }

  /**
   * @param {string} path
   * @param {string} socketId
   */
  removeSocket(path, socketId) {
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