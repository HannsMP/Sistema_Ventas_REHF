
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
*   nodeRoute: (this: App, node: SocketNode)=>void
* }} 
*/
module.exports = {
  load: false,
  route: "/api/categorias/chart/read",
  post: [
    async function (req, res, next) {
      try {
        let session = this.cache.apiKey.read(req.cookies.apiKey);

        let permiso = await this.model.tb_permisos.userPathView(session.usuario.id, module.exports.route);

        if (!permiso) return res.status(403).json({ err: 'Tu usuario no tiene Permisos para esta peticion.' });

        let max_creacion = await this.model.tb_categorias.cardLastCreation();
        let cantidad_categorias = await this.model.tb_categorias.cardCount();
        let chart = await this.model.tb_categorias.chartCountCategory();

        return res.status(200).json({ card: { max_creacion, cantidad_categorias }, chart })
      } catch (e) {
        this.responseErrorApi(req, res, next, e)
      }
    },
  ]
}