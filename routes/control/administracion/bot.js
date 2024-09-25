const { resolve } = require('path');

/** @typedef {Array.<(this: import('../../../app'), req: import('express').Request, res: import('express').Response, next: import('express').NextFunction)=>void>} routeArr */
/** @type {{load:boolean, route:string, viewRenderPath:string, viewErrorPath:string, use: routeArr, get: routeArr, post: routeArr}} */
module.exports = {
  load: true,
  route: "/control/administracion/bot",
  viewRenderPath: resolve('view', 'control', 'administracion', 'bot.ejs'),
  viewErrorPath: resolve('view', 'error', '403.ejs'),
  get: [
    async function (req, res, next) {
      let { usuario } = this.cache.apiKey.read(req.cookies.apiKey);

      let userLayout = await this.model.tb_permisos.userLayoutAll(usuario.id);

      let permiso = userLayout[module.exports.route];

      res.render(module.exports.viewRenderPath, { session: { usuario, permiso }, userLayout });
    },
  ],
  post: [
    async function (req, res, next) {
      let { usuario } = this.cache.apiKey.read(req.cookies.apiKey);

      let userLayout = await this.model.tb_permisos.userLayoutAll(usuario.id);

      let permiso = userLayout[module.exports.route];

      res.render(module.exports.viewRenderPath, { layout: false, session: { usuario, permiso }, userLayout });
    },
  ]
}