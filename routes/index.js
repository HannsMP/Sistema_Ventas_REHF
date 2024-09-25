const { resolve } = require('path');

/** @typedef {Array.<(this: import('../app'), req: import('express').Request, res: import('express').Response, next: import('express').NextFunction)=>void>} routeArr */
/** @type {{load:boolean, route:string, viewRenderPath:string, viewErrorPath:string, use: routeArr, get: routeArr, post: routeArr}} */
module.exports = {
  load: true,
  route: "/",
  viewLayoutPath: resolve('layout', 'default.ejs'),
  viewErrorPath: resolve('view', 'error', '404.ejs'),
  /* use: [
    function (req, res, next) {
      return next();
      this.app.set('layout', module.exports.viewLayoutPath);
      res.status(404).render(module.exports.viewErrorPath, { url: req.path })
    }
  ], */
  get: [
    function (req, res, next) {
      res.redirect('/control/productos');
    },
  ]
}