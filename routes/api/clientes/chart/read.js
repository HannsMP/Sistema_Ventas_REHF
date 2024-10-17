
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
  route: "/api/clientes/chart/read",
  post: [
    async function (req, res, next) {
      try {
        let session = this.cache.apiKey.read(req.cookies.apiKey);

        let permiso = await this.model.tb_permisos.userPathView(session.usuario.id, module.exports.route);

        if (!permiso) return res.status(403).json({ err: 'Tu usuario no tiene Permisos para esta peticion.' });

        let max_creacion = await this.model.tb_clientes.cardLastCreation();
        let cantidad_clientes = await this.model.tb_clientes.cardCount();
        let tipo_cliente = await this.model.tipo_cliente.chartCountTypeClient();
        let tipo_documento = await this.model.tipo_documento.chartCountTypeDocument();

        return res.status(200).json({ card: { max_creacion, cantidad_clientes }, charts: { tipo_cliente, tipo_documento } })
      } catch (e) {
        this.responseErrorApi(req, res, next, e)
      }
    },
  ]
}