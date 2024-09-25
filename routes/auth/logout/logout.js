/** @typedef {Array.<(this: import('../../../app'), req: import('express').Request, res: import('express').Response, next: import('express').NextFunction)=>void>} routeArr */
/** @type {{load:boolean, route:string, use: routeArr, get: routeArr, post: routeArr}} */
module.exports = {
  load: true,
  route: "/auth/logout",
  get: [
    function (req, res, next) {
      let apiKey = req.cookies?.apiKey;
      this.cache.apiKey.delete(apiKey);
      res.clearCookie('apiKey');
      res.clearCookie('remember');
      res.status(200).redirect('/auth/login');
      this.socket.emitApikey(apiKey, '/usuarios/perfil/logout');
    },
  ]
}