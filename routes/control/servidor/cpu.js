const { resolve } = require('path');

/** @typedef {import('../../../app')} App */
/** @typedef {import('../../../utils/SocketNode')} SocketNode */
/** @typedef {Array.<(this: App, req: import('express').Request, res: import('express').Response, next: import('express').NextFunction)=>void>} routeArr */

/**
 * @type {{
 *   load:boolean,
 *   route:string,
 *   viewLayoutPath:string,
 *   viewRenderPath:string,
 *   viewErrorPath:string,
 *   use: routeArr,
 *   get: routeArr,
 *   post: routeArr,
 *   nodeRoute: {last:boolean, tagsName:boolean, collector:boolean} | (this: App, node: SocketNode)=>void
 * }}
*/
module.exports = {
  load: true,
  route: "/control/servidor/cpu",
  viewRenderPath: resolve('view', 'control', 'servidor', 'cpu.ejs'),
  viewErrorPath: resolve('view', 'error', '403.ejs'),
  get: [
    async function (req, res, next) {
      let session = this.cache.apiKey.read(req.cookies.apiKey);

      let userLayout = await this.model.tb_permisos.userLayoutAll(session.usuario.id);

      let permiso = userLayout[module.exports.route];

      if (!permiso.ver) return res.status(403).render(module.exports.viewErrorPath, { session, userLayout });

      session.permiso = permiso;

      res.render(module.exports.viewRenderPath, { session, userLayout });
    },
  ],
  nodeOption: {
    last: true,
  },
  nodeRoute: function (node) {
    let internalId;

    node.ev.on('remove', () => {
      if (node.sockets.size != 0) return
      clearInterval(internalId);
      internalId = null;
    })

    /** @param {()=>void} res */
    let cpuSytem = async (res) => {
      try {
        let data = await this.system.cpu();
        res(data)
      } catch (e) {
        this.logError.writeStart(e.message, e.stack)
      }
    }

    /** @param {()=>void} res */
    let coreSytem = async (res) => {
      try {
        let data = await this.system.currentLoad();
        res(data)
      } catch (e) {
        this.logError.writeStart(e.message, e.stack)
      }
    }

    /** @param {()=>void} res */
    let ramSytem = async (res) => {
      try {
        let data = await this.system.mem();
        res(data)
      } catch (e) {
        this.logError.writeStart(e.message, e.stack)
      }
    }

    /** @param {()=>void} res */
    let diskSytem = async (res) => {
      try {
        let data = await this.system.diskLayout();
        res(data)
      } catch (e) {
        this.logError.writeStart(e.message, e.stack)
      }
    }

    /** @param {()=>void} res */
    let fsSytem = async (res) => {
      try {
        let data = await this.system.fsSize();
        res(data)
      } catch (e) {
        this.logError.writeStart(e.message, e.stack)
      }
    }

    /** @param {number} myId @param {()=>void} res */
    let powerSytem = async (myId, res) => {
      try {
        let permiso = await this.model.tb_permisos.userPathUpdate(myId, module.exports.route);
        if (!permiso) return res('No tienes Permisos para controlar el reinicio del sistema.');

        this.system.reboot();
        res();
      } catch (e) {
        this.logError.writeStart(e.message, e.stack)
        res('Ocurrio un error, ponte en contacto con el administrador.');
      }
    }

    /** @param {number} myId @param {()=>void} res */
    let resetSytem = async (myId, res) => {
      try {
        let permiso = await this.model.tb_permisos.userPathDelete(myId, module.exports.route);
        if (!permiso) return res('No tienes Permisos para controlar el apagado del sistema.');

        this.system.powerOff();
        res();
      } catch (e) {
        this.logError.writeStart(e.message, e.stack)
        res('Ocurrio un error, ponte en contacto con el administrador.');
      }
    }

    node.ev.on('connected', socket => {
      let myId = socket.session.usuario_id;

      socket.on('/cpu/sytem', cpuSytem)
      socket.on('/core/sytem', coreSytem)
      socket.on('/ram/sytem', ramSytem)
      socket.on('/disk/sytem', diskSytem)
      socket.on('/fs/sytem', fsSytem)
      socket.on('/power/sytem', powerSytem.bind(null, myId))
      socket.on('/reset/sytem', resetSytem.bind(null, myId))

      if (!internalId)
        internalId = setInterval(() => {
          let CurrentLoadData = this.system.currentLoad();
          let FsSizeData = this.system.fsSize();
          let MemData = this.system.mem();

          node.sockets.forEach(async s => {
            s.emit(
              '/cpu/data/emit',
              {
                cpu: await CurrentLoadData,
                disk: await FsSizeData,
                mem: await MemData
              }
            )
          })
        }, 1000);
    })
  }
}