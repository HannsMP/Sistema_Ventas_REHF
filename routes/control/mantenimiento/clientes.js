const { resolve } = require('path');

/** @typedef {Array.<(this: import('../../../app'), req: import('express').Request, res: import('express').Response, next: import('express').NextFunction)=>void>} routeArr */
/** @type {{load:boolean, route:string, viewRenderPath:string, viewErrorPath:string, use: routeArr, get: routeArr, post: routeArr}} */
module.exports = {
  load: true,
  route: "/control/mantenimiento/clientes",
  viewRenderPath: resolve('view', 'control', 'mantenimiento', 'clientes.ejs'),
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
  post: [
    async function (req, res, next) {
      let session = this.cache.apiKey.read(req.cookies.apiKey);

      let userLayout = await this.model.tb_permisos.userLayoutAll(session.usuario.id);

      let permiso = userLayout[module.exports.route];

      if (!permiso.ver) return res.status(403).render(module.exports.viewErrorPath, { layout: false, session, userLayout });

      session.permiso = permiso;

      res.render(module.exports.viewRenderPath, { layout: false, session, userLayout });
    },
  ]
}