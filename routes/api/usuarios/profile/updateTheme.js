let themeSet = new Set(['purple', 'blue', 'orange', 'green']);

/** @typedef {Array.<(this: import('../../../../app'), req: import('express').Request, res: import('express').Response, next: import('express').NextFunction)=>void>} routeArr */
/** @type {{load:boolean, route:string, use: routeArr, get: routeArr, post: routeArr}} */
module.exports = {
  load: true,
  route: "/api/usuarios/config/changeTheme",
  post: [
    async function (req, res, next) {
      try {
        let { apiKey } = req.cookies

        let apiData = this.cache.apiKey.read(apiKey);

        let { theme } = req.body;

        if (!themeSet.has(theme))
          return res.status(200).json({ theme: apiData.usuario.tema });

        res.cookie('config-theme', theme, {
          maxAge: 30 * 24 * 60 * 60 * 60 * 1000,
          sameSite: 'Strict',
          httpOnly: true
        });

        apiData.usuario.tema = theme;
        await this.model.tb_usuarios.updateIdTheme(apiData.usuario.id, theme);
        this.cache.apiKey.update(apiKey, apiData);

        res.status(200).json({ theme })
      } catch (e) {
        this.responseErrorApi(req, res, next, e)
      }
    },
  ]
}