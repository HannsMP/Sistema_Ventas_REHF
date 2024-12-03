
/** @typedef {import('../../../../app')} App */
/** @typedef {import('../../../../utils/SocketNode')} SocketNode */
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
  route: "/api/acceso/chart/read",
  post: [
    async function (req, res, next) {
      try {
        let session = this.cache.apiKey.read(req.cookies.apiKey);

        let permiso = await this.model.tb_permisos.userPathView(session.usuario.id, module.exports.route);

        if (!permiso) return res.status(403).json({ err: 'Tu usuario no tiene Permisos para esta peticion.' });

        let cantidad_menus = await this.model.tb_menus.cardCount();
        let cantidad_accesos = await this.model.tb_acceso.cardCount();
        let chart = await this.model.tb_acceso.chartCountPermits();

        return res.status(200).json({ card: { cantidad_menus, cantidad_accesos }, chart })
      } catch (e) {
        this.responseErrorApi(req, res, next, e)
      }
    },
  ]
}