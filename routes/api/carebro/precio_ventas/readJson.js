
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
  route: "/api/cerebro/precio_venta/readJson",
  post: [
    async function (req, res, next) {
      try {
        let session = this.cache.apiKey.read(req.cookies.apiKey);

        let permisos = await this.model.tb_permisos.userPathAll(session.usuario.id, module.exports.route);

        if (!permisos.ver) return res.status(403).json({ err: 'Tu usuario no tiene Permisos para esta peticion.' });

        let data = this.neuralNetwork.precio_venta.fileJSON.readJSON();
        let option = this.neuralNetwork.precio_venta.optionNeural;
        let prediccion = this.neuralNetwork.precio_venta.toFunction.toString();

        return res.status(200).json({ data, option, prediccion })
      } catch (e) {
        this.responseErrorApi(req, res, next, e)
      }
    },
  ]
}