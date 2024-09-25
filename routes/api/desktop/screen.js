/** @typedef {Array.<(this: import('../../../app'), req: import('express').Request, res: import('express').Response, next: import('express').NextFunction)=>void>} routeArr */
/** @type {{load:boolean, route:string, use: routeArr, get: routeArr, post: routeArr}} */
module.exports = {
  load: false,
  route: "/api/desktop/screen",
  post: [
    async function (req, res, next) {
      try {

        if (!req.session.allowedTransmit) {
          let session = this.apiKey.read(req.cookies.apiKey);

          let permiso = await this.model.tb_permisos.userPathView(session.usuario.id, module.exports.route);

          if (!permiso) return res.status(403).json({ err: 'Tu usuario no tiene Permisos para esta peticion.' });

          req.session.allowedTransmit = true;

          console.log(req.session.allowedTransmit);

          req.session.save((err) => {
            if (err)
              return res.status(500).json({ err: 'Error al guardar la sesión.' });
            setTimeout(_ => {
              req.session.allowedTransmit = false;
              req.session.save();
            }, 30 * 1000);
          });
        }

        let screen = await this.system.screen();

        res
          .setHeader('Content-Type', 'image/jpeg')
          .status(200)
          .send(screen)
      } catch (e) {
        this.responseErrorApi(req, res, next, e)
      }
    },
  ]
}