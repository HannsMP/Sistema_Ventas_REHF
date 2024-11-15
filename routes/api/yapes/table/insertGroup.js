
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
  route: "/api/yapes/table/import",
  post: [
    async function (req, res, next) {
      try {
        let session = this.cache.apiKey.read(req.cookies.apiKey);

        let permisos = await this.model.tb_permisos.userPathAll(session.usuario.id, module.exports.route);

        if (!permisos.ver) return res.status(403).json({ err: 'Tu usuario no tiene Permisos para esta peticion.' });

        /** @type {import('datatables.net-dt').AjaxData} */
        let {
          draw,
          order,
          start,
          length,
          search
        } = req.body;

        let results = await this.model.tb_Yapes.readAllPage({
          order,
          start,
          length,
          search,
        });

        let recordsTotal = await this.model.tb_Yapes.readCount();

        return res.status(200).json({
          draw,
          recordsTotal,
          recordsFiltered: results.length,
          data: results
        })
      } catch (e) {
        this.responseErrorApi(req, res, next, e)
      }
    },
  ]
}