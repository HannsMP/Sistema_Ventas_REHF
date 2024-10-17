
/** @typedef {import('../../../app')} App */
/** @typedef {import('../../../utils/SocketNode')} SocketNode */
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
  route: "/auth/logout",
  get: [
    function (req, res, next) {
      let apiKey = req.cookies?.apiKey;
      if (apiKey) {
        this.cache.apiKey.delete(apiKey);
        res.clearCookie('apiKey');
        res.clearCookie('remember');
        console.log('acabo de cerrar sesion');

        this.socket.rootControl.emitApikey(apiKey, '/session/usuario/logout');
      }
      res.status(200).redirect('/auth/login');
    },
  ]
}