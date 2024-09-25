/** @typedef {Array.<(this: import('../../../../app'), req: import('express').Request, res: import('express').Response, next: import('express').NextFunction)=>void>} routeArr */
/** @type {{load:boolean, route:string, use: routeArr, get: routeArr, post: routeArr}} */
module.exports = {
  load: true,
  route: "/api/clientes/table/insert",
  post: [
    async function (req, res, next) {
      try {
        let session = this.cache.apiKey.read(req.cookies.apiKey);

        let permiso = await this.model.tb_permisos.userPathAdd(session.usuario.id, module.exports.route);

        if (!permiso) return res.status(403).json({ err: 'Tu usuario no tiene Permisos para esta peticion.' });

        let {
          nombres,
          telefono,
          direccion,
          tipo_cliente_id,
          tipo_documento_id,
          num_documento,
          estado
        } = req.body;

        let OkPacket = await this.model.tb_clientes.insert({
          nombres,
          telefono,
          direccion,
          tipo_cliente_id: Number(tipo_cliente_id),
          tipo_documento_id: Number(tipo_documento_id),
          num_documento,
          estado: Number(estado)
        });

        return res.status(200).json({ OkPacket })
      } catch (e) {
        this.responseErrorApi(req, res, next, e)
      }
    },
  ]
}