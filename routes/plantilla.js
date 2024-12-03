const { resolve } = require('path');

/** @typedef {import('../app')} App */
/** @typedef {import('../utils/SocketNode')} SocketNode */
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
  load: false,
  route: "/",
  viewLayoutPath: resolve('layout', 'default.ejs'),
  viewRenderPath: resolve('view', 'control', 'productos.ejs'),
  viewErrorPath: resolve('view', 'error', '403.ejs'),
  use: [
    async function (req, res, next) {
      try {
        let { apiKey } = req.cookies;

        let existApikey = this.cache.apiKey.exist(apiKey);

        if (existApikey)
          return next();

        res.status(401).json({ autorization: 'acceso denegado' });
      } catch (e) {
        this.responseErrorApi(req, res, next, e)
      }
    },
  ],
  get: [
    async function (req, res, next) {
      try {
        let session = this.cache.apiKey.read(req.cookies.apiKey);

        let permisos = await this.model.tb_permisos.userPathAll(session.usuario.id, module.exports.route);

        if (!permisos.ver) return res.status(403).json({ err: 'Tu usuario no tiene Permisos para esta peticion.' });

        res.status(200).json({})
      } catch (e) {
        this.responseErrorApi(req, res, next, e)
      }
    },
  ],
  post: [
    async function (req, res, next) {
      try {
        let session = this.cache.apiKey.read(req.cookies.apiKey);

        let permisos = await this.model.tb_permisos.userPathAll(session.usuario.id, module.exports.route);

        if (!permisos.ver) return res.status(403).json({ err: 'Tu usuario no tiene Permisos para esta peticion.' });

        res.status(200).json({})
      } catch (e) {
        this.responseErrorApi(req, res, next, e)
      }
    },
  ]
}