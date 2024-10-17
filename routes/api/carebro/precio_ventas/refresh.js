
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
  route: "/api/cerebro/precio_venta/refresh",
  post: [
    async function (req, res, next) {
      try {
        let session = this.cache.apiKey.read(req.cookies.apiKey);

        let permisos = await this.model.tb_permisos.userPathAll(session.usuario.id, module.exports.route);

        if (!permisos.ver) return res.status(403).json({ err: 'Tu usuario no tiene Permisos para esta peticion.' });

        let { iterations, errorThresh } = req.body;

        iterations = iterations == ''
          ? 0 : Number(iterations);

        errorThresh = errorThresh == '0.' || Number(errorThresh) == NaN
          ? 0 : Number(errorThresh);

        this.neuralNetwork.precio_venta.refresh(iterations, errorThresh);

        return res.status(200).json({})
      } catch (e) {
        this.responseErrorApi(req, res, next, e)
      }
    },
  ]
}