
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
  load: true,
  route: "/api/acceso/table/deleteId",
  post: [
    async function (req, res, next) {
      try {
        let session = this.cache.apiKey.read(req.cookies.apiKey);

        let permiso = await this.model.tb_permisos.userPathDelete(session.usuario.id, module.exports.route);

        if (!permiso) return res.status(403).json({ err: 'Tu usuario no tiene Permisos para esta peticion.' });

        let { id } = req.body;

        let list = await this.model.tb_acceso.readMenusById(Number(id));

        let menu_id = list[0].menu_id;

        let OkPacket = await this.model.tb_acceso.deleteMenusById(Number(id), list);
        await this.model.tb_menus.deleteId(menu_id);

        this.model.tb_acceso.io.sockets.emit(
          '/accesos/permisos/deleteId',
          _ => list
        )

        return res.status(200).json({ OkPacket })
      } catch (e) {
        this.responseErrorApi(req, res, next, e)
      }
    },
  ]
}