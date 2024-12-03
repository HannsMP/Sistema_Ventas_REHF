/** @typedef {import('../../app')} App */
/** @typedef {import('../../utils/SocketNode')} SocketNode */
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
  route: "/api",
  use: [
    function (req, res, next) {
      let { apiKey } = req.cookies;

      let existApikey = this.cache.apiKey.exist(apiKey);

      if (existApikey)
        return next();

      res.status(401).json({ autorization: 'acceso denegado' });
    }
  ],
  // post: [
  //   async function (req, res, next) {
  //     try {
  //       let { query, values } = req.body

  //       let [result] = values
  //         ? await this.model.pool(query, values)
  //         : await this.model.pool(query);

  //       res.status(200).json({
  //         result: result
  //       })
  //     } catch (e) {
  //       res.status(200).json({
  //         error: e
  //       })
  //     }
  //   }
  // ]
}