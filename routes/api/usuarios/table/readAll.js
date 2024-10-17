
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
  route: "/api/usuarios/table/readAll",
  post: [
    async function (req, res, next) {
      try {
        let { usuario } = this.cache.apiKey.read(req.cookies.apiKey);

        let permisos = await this.model.tb_permisos.userPathAll(usuario.id, module.exports.route);

        if (!permisos.ver) return res.status(403).json({ err: 'Tu usuario no tiene Permisos para esta peticion.' });

        let list = await this.model.tb_usuarios.readAllJoinNoId(usuario.id);
        let uniques = permisos.agregar || permisos.editar
          ? await this.model.tb_usuarios.readAllUnique()
          : [];

        res.status(200).json({ list, uniques, permisos })
      } catch (e) {
        this.responseErrorApi(req, res, next, e)
      }
    },
  ]
}