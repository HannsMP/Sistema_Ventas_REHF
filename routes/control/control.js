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
  route: "/control",
  viewLayoutPath: resolve('layout', 'control.ejs'),
  viewErrorPath: resolve('view', 'error', '403.ejs'),
  use: [
    async function (req, res, next) {
      let { apiKey } = req.cookies;

      if (!this.cache.apiKey.exist(apiKey)) {

        let { apiKey, login, remember } = req.cookies;

        if (!remember)
          return res.redirect('/auth/login');

        let { usuario, clave } = login;

        let data_Usuario = await this.model.tb_usuarios.login(usuario, clave);
        this.model.tb_asistencias.insertUserId(data_Usuario.id);

        let dataPackage = this.cache.packageJSON.readJSON();

        apiKey = this.cache.apiKey.create({
          theme: req.cookies['config-theme'] || 'purple',
          usuario: data_Usuario,
          version: dataPackage.version,
          author: dataPackage.author
        });

        res.cookie('apiKey', apiKey, {
          maxAge: 30 * 24 * 60 * 60 * 60 * 1000,
          sameSite: 'Strict',
          httpOnly: true
        });

        return res.redirect(req.originalUrl);
      }

      this.app.set('layout', module.exports.viewLayoutPath);
      return next();
    }
  ],
  get: [
    function (req, res, next) {
      res.redirect("/control/productos");
    },
  ],
  nodeRoute: {
    collector: true,
    tagsName: true
  }
}