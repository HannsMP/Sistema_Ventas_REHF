
/** @typedef {import('../../../../app')} App */
/** @typedef {import('../../../../utils/SocketNode')} SocketNode */
/** @typedef {Array.<(this: App, req: import('express').Request, res: import('express').Response, next: import('express').NextFunction)=>void>} routeArr */

/** 
 * @type {{
*   load:boolean, 
*   route:string, 
*   viewLayoutPath:string, 
*   viewRenderPath:string, 
*   viewErrorPath:string, 
*   use: routeArr, 
*   get: routeArr, 
*   post: routeArr,
*   nodeRoute: (this: App, node: SocketNode)=>void
* }} 
*/
module.exports = {
  load: true,
  route: "/api/transacciones_ventas/profile/insert",
  post: [
    async function (req, res, next) {
      try {
        let { usuario } = this.cache.apiKey.read(req.cookies.apiKey);

        let permiso = await this.model.tb_permisos.userPathAdd(usuario.id, module.exports.route);

        if (!permiso) return res.status(403).json({ err: 'Tu usuario no tiene Permisos para esta peticion.' });

        /** @type {{cliente_id:number, metodo_pago_id: number, serie: string, importe_total: number, productos:{cantidad:number, producto_id: number}[]}} */
        let {
          cliente_id,
          metodo_pago_id,
          importe_total,
          productos,
          serie,
          comentario
        } = req.body;

        cliente_id = Number(cliente_id);
        metodo_pago_id = Number(metodo_pago_id);

        let usuario_id = usuario.id;

        let { codigo, descuento, listVentas } = await this.model.tb_transacciones_ventas
          .computerBusiness(productos, metodo_pago_id, importe_total);

        let { insertId: transaccion_id } = await this.model.tb_transacciones_ventas
          .insert({
            codigo,
            cliente_id,
            usuario_id,
            importe_total,
            metodo_pago_id,
            descuento,
            serie,
            comentario
          })

        listVentas.forEach(d => d.transaccion_id = transaccion_id);

        await this.model.tb_ventas.inserts(...listVentas);

        this.model.tb_ventas.io.tagsName.get(`usr:${usuario_id}`)?.emit(
          '/transacciones_ventas/data/insert',
          _ => listVentas
        )

        res.status(200).json({ data: { id: transaccion_id, codigo, descuento } })
      } catch (e) {
        this.responseErrorApi(req, res, next, e)
      }
    },
  ]
}