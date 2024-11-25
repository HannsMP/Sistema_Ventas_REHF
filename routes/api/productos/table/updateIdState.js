
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
  route: "/api/productos/table/updateIdState",
  post: [
    async function (req, res, next) {
      try {
        let session = this.cache.apiKey.read(req.cookies.apiKey);

        let permiso = await this.model.tb_permisos.userPathHide(session.usuario.id, module.exports.route);

        if (!permiso) return res.status(403).json({ err: 'Tu usuario no tiene Permisos para esta peticion.' });

        let { id, estado } = req.body;

        let OkPacket = await this.model.tb_productos.updateIdState(id, estado ? 1 : 0);

        res.status(200).json({ OkPacket })
      } catch (e) {
        this.responseErrorApi(req, res, next, e)
      }
    },
  ]
}