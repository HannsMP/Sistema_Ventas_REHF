const { resolve } = require('path');

/** @typedef {Array.<(this: import('../../app'), req: import('express').Request, res: import('express').Response, next: import('express').NextFunction)=>void>} routeArr */
/** @type {{load:boolean, viewLayoutPath:string, route:string, viewRenderPath:string, viewErrorPath:string, use: routeArr, get: routeArr, post: routeArr}} */
module.exports = {
  load: true,
  route: "/control",
  viewLayoutPath: resolve('layout', 'control.ejs'),
  viewErrorPath: resolve('view', 'error', '403.ejs'),
  use: [
    function (req, res, next) {
      let { apiKey } = req.cookies;

      let existApikey = this.cache.apiKey.exist(apiKey);

      if (!existApikey) {
        req.session.returnLoad = req.originalUrl;
        return res.redirect('/auth/login');
      }

      this.app.set('layout', module.exports.viewLayoutPath);
      return next();
    }
  ],
  get: [
    function (req, res, next) {
      res.redirect("/control/productos");
    },
  ]
}