
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
  route: "/api/bot/chart/mainPath",
  post: [
    async function (req, res, next) {
      try {
        let session = this.cache.apiKey.read(req.cookies.apiKey);

        let permisos = await this.model.tb_permisos.userPathView(session.usuario.id, module.exports.route);

        if (!permisos) return res.status(403).json({ err: 'Tu usuario no tiene Permisos para esta peticion.' });

        let label = [], data = [];

        for (const key in this.bot.collection) {
          const { use, name } = this.bot.collection[key];
          data.push(use);
          label.push(name);
        }

        res.status(200).json({ chart: { label, data } });
      } catch (e) {
        this.responseErrorApi(req, res, next, e)
      }
    },
  ]
}