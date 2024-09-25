/** @typedef {Array.<(this: import('../../../../app'), req: import('express').Request, res: import('express').Response, next: import('express').NextFunction)=>void>} routeArr */
/** @type {{load:boolean, route:string, use: routeArr, get: routeArr, post: routeArr}} */
module.exports = {
  load: true,
  route: "/api/ventas/table/updateId",
  post: [
    async function (req, res, next) {
      try {
        let session = this.cache.apiKey.read(req.cookies.apiKey);

        let permiso = await this.model.tb_permisos.userPathUpdate(session.usuario.id, module.exports.route);

        if (!permiso) return res.status(403).json({ err: 'Tu usuario no tiene Permisos para esta peticion.' });

        let {
          id,
          transaccion_id,
          producto_id,
          cantidad
        } = req.body;

        let productoVendido = await this.model.tb_ventas.readId(Number(id));

        let OkPacket = productoVendido.producto_id == producto_id
          ? await this.model.tb_ventas.updateId(Number(id), {
            importe: cantidad * (productoVendido.importe / productoVendido.cantidad),
            producto_id,
            cantidad,
          })
          : await this.model.tb_ventas.updateId(Number(id), {
            importe: cantidad * (
              await this.model.tb_productos.readPriceId(Number(producto_id))
            ).venta,
            producto_id,
            cantidad,
          });

        let { descuento } = await this.model.tb_transacciones_ventas.refreshId(Number(transaccion_id));

        return res.status(200).json({ OkPacket, data: { descuento } })
      } catch (e) {
        this.responseErrorApi(req, res, next, e)
      }
    },
  ]
}