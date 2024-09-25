/** @typedef {Array.<(this: import('../../../../app'), req: import('express').Request, res: import('express').Response, next: import('express').NextFunction)=>void>} routeArr */
/** @type {{load:boolean, route:string, use: routeArr, get: routeArr, post: routeArr}} */
module.exports = {
  load: true,
  route: "/api/transacciones_ventas/table/updateId",
  post: [
    async function (req, res, next) {
      try {
        let session = this.cache.apiKey.read(req.cookies.apiKey);

        let permiso = await this.model.tb_permisos.userPathUpdate(session.usuario.id, module.exports.route);

        if (!permiso) return res.status(403).json({ err: 'Tu usuario no tiene Permisos para esta peticion.' });

        let {
          id,
          usuario_id,
          importe_total,
          metodo_pago_id
        } = req.body;

        let OkPacket = await this.model.tb_transacciones_ventas.updateId(Number(id), {
          usuario_id,
          importe_total,
          metodo_pago_id
        });

        let { descuento } = await this.model.tb_transacciones_ventas.refreshId(Number(id));

        return res.status(200).json({ OkPacket, data: { descuento } })
      } catch (e) {
        this.responseErrorApi(req, res, next, e)
      }
    },
  ]
}