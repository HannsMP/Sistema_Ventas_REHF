/** @typedef {Array.<(this: import('../../../../app'), req: import('express').Request, res: import('express').Response, next: import('express').NextFunction)=>void>} routeArr */
/** @type {{load:boolean, route:string, use: routeArr, get: routeArr, post: routeArr}} */
module.exports = {
  load: true,
  route: "/api/productos/chart/read",
  post: [
    async function (req, res, next) {
      try {
        let session = this.cache.apiKey.read(req.cookies.apiKey);

        let permiso = await this.model.tb_permisos.userPathView(session.usuario.id, module.exports.route);

        if (!permiso) return res.status(403).json({ err: 'Tu usuario no tiene Permisos para esta peticion.' });

        let max_creacion = await this.model.tb_productos.cardLastCreation();
        let cantidad_productos = await this.model.tb_productos.cardCount();
        let chart = await this.model.tb_productos.chartCountProducs();

        return res.status(200).json({ card: { max_creacion, cantidad_productos }, chart })
      } catch (e) {
        this.responseErrorApi(req, res, next, e)
      }
    },
  ]
}