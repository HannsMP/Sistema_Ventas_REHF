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
*   nodeRoute: (this: App, node: SocketNode)=>void
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
  nodeRoute: function (node) {
    let internalId;

    node.ev.on('remove', socket => {
      if (node.sockets.size != 0) return
      clearInterval(internalId);
      internalId = null;
    })

    node.ev.on('add', () => {
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