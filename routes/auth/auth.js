const { resolve } = require('path');

/** @typedef {import('../../app')} App */
/** @typedef {import('../../utils/SocketNode')} SocketNode */
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