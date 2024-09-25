/** @typedef {Array.<(this: import('../../../../app'), req: import('express').Request, res: import('express').Response, next: import('express').NextFunction)=>void>} routeArr */
/** @type {{load:boolean, route:string, use: routeArr, get: routeArr, post: routeArr}} */
module.exports = {
  load: true,
  route: "/api/ventas/table/insert",
  post: [
    async function (req, res, next) {
      try {
        let session = this.cache.apiKey.read(req.cookies.apiKey);

        let permiso = await this.model.tb_permisos.userPathAdd(session.usuario.id, module.exports.route);

        if (!permiso) return res.status(403).json({ err: 'Tu usuario no tiene Permisos para esta peticion.' });

        let {
          transaccion_id,
          cantidad,
          producto_id
        } = req.body;

        let productoPrecios = await this.model.tb_productos.readPriceId(Number(producto_id));

        let OkPacket = await this.model.tb_ventas.insert({
          importe: cantidad * productoPrecios.venta,
          cantidad,
          descuento: 0,
          producto_id,
          transaccion_id,
        });

        let { descuento } = await this.model.tb_transacciones_ventas.refreshId(Number(transaccion_id));

        return res.status(200).json({ OkPacket, data: { descuento } })
      } catch (e) {
        this.responseErrorApi(req, res, next, e)
      }
    },
  ]
}