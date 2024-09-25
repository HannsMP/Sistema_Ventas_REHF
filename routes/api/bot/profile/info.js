/** @typedef {Array.<(this: import('../../../../app'), req: import('express').Request, res: import('express').Response, next: import('express').NextFunction)=>void>} routeArr */
/** @type {{load:boolean, route:string, use: routeArr, get: routeArr, post: routeArr}} */
module.exports = {
  load: true,
  route: "/api/bot/profile/info",
  post: [
    async function (req, res, next) {
      try {
        let session = this.cache.apiKey.read(req.cookies.apiKey);

        let permisos = await this.model.tb_permisos.userPathView(session.usuario.id, module.exports.route);

        if (!permisos) return res.status(403).json({ err: 'Tu usuario no tiene Permisos para esta peticion.' });

        let state = this.bot.state();

        let data = { state }

        if (state == 'CONNECTED') {
          let { wid, pushname } = this.bot.client.info;
          data.name = pushname;
          data.phone = wid.user;
        }

        return res.status(200).json(data);

      } catch (e) {
        this.responseErrorApi(req, res, next, e)
      }
    },
  ]
}