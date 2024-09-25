const { resolve } = require('path');

/** @typedef {Array.<(this: import('../../app'), req: import('express').Request, res: import('express').Response, next: import('express').NextFunction)=>void>} routeArr */
/** @type {{load:boolean, viewLayoutPath:string, route:string, viewRenderPath:string, viewErrorPath:string, use: routeArr, get: routeArr, post: routeArr}} */
module.exports = {
  load: true,
  route: "/auth",
  viewLayoutPath: resolve('layout', 'auth.ejs'),
  use: [
    function (req, res, next) {
      this.app.set('layout', module.exports.viewLayoutPath);
      return next();
    }
  ],
  get: [
    function (req, res, next) {
      res.redirect("/auth/login");
    },
  ]
}