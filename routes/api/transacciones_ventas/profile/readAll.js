/** @typedef {Array.<(this: import('../../../../app'), req: import('express').Request, res: import('express').Response, next: import('express').NextFunction)=>void>} routeArr */
/** @type {{load:boolean, route:string, use: routeArr, get: routeArr, post: routeArr}} */
module.exports = {
  load: true,
  route: "/api/transacciones_ventas/profile/readAll",
  post: [
    async function (req, res, next) {
      try {
        let session = this.cache.apiKey.read(req.cookies.apiKey);

        let permisos = await this.model.tb_permisos.userPathAll(session.usuario.id, module.exports.route);

        if (!permisos.ver) return res.status(403).json({ err: 'Tu usuario no tiene Permisos para esta peticion.' });

        let { id } = session.usuario;

        let list = await this.model.tb_transacciones_ventas.readAllJoinUser(id);

        return res.status(200).json({ list, permisos })
      } catch (e) {
        this.responseErrorApi(req, res, next, e)
      }
    },
  ]
}