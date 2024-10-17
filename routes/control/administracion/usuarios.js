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
  route: "/control/administracion/usuarios",
  viewRenderPath: resolve('view', 'control', 'administracion', 'usuarios.ejs'),
  viewErrorPath: resolve('view', 'error', '403.ejs'),
  get: [
    async function (req, res, next) {
      let { usuario } = this.cache.apiKey.read(req.cookies.apiKey);

      let userLayout = await this.model.tb_permisos.userLayoutAll(usuario.id);

      let permiso = userLayout[module.exports.route];

      if (!permiso.ver)
        return res.status(403).render(module.exports.viewErrorPath, { session: { usuario }, userLayout });

      res.render(module.exports.viewRenderPath, { session: { usuario, permiso }, userLayout });
    },
  ]
}