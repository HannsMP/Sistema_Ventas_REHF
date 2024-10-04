/** @typedef {Array.<(this: import('../../../../app'), req: import('express').Request, res: import('express').Response, next: import('express').NextFunction)=>void>} routeArr */
/** @type {{load:boolean, route:string, use: routeArr, get: routeArr, post: routeArr}} */
module.exports = {
  load: true,
  route: "/api/usuarios/table/updateIdState",
  post: [
    async function (req, res, next) {
      try {
        let session = this.cache.apiKey.read(req.cookies.apiKey);

        let permiso = await this.model.tb_permisos.userPathHide(session.usuario.id, module.exports.route);

        if (!permiso) return res.status(403).json({ err: 'Tu usuario no tiene Permisos para esta peticion.' });

        let { id, estado } = req.body;

        let OkPacket = await this.model.tb_usuarios.updateIdState(id, estado ? 1 : 0, session.usuario.rol_id);

        res.status(200).json({ OkPacket })
      } catch (e) {
        this.responseErrorApi(req, res, next, e)
      }
    },
  ]
}