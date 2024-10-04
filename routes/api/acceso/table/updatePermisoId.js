/** @typedef {Array.<(this: import('../../../../app'), req: import('express').Request, res: import('express').Response, next: import('express').NextFunction)=>void>} routeArr */
/** @type {{load:boolean, route:string, use: routeArr, get: routeArr, post: routeArr}} */
module.exports = {
  load: true,
  route: "/api/acceso/table/updatePermisoId",
  post: [
    async function (req, res, next) {
      try {
        let session = this.cache.apiKey.read(req.cookies.apiKey);

        let permiso = await this.model.tb_permisos.userPathUpdate(session.usuario.id, module.exports.route);

        if (!permiso) return res.status(403).json({ err: 'Tu usuario no tiene Permisos para esta peticion.' });

        let {
          id,
          permiso_ver,
          permiso_agregar,
          permiso_editar,
          permiso_eliminar,
          permiso_ocultar,
          permiso_exportar
        } = req.body;

        let OkPacket = await this.model.tb_acceso.updateIdState(Number(id), {
          ver: Number(permiso_ver),
          agregar: Number(permiso_agregar),
          editar: Number(permiso_editar),
          eliminar: Number(permiso_eliminar),
          ocultar: Number(permiso_ocultar),
          exportar: Number(permiso_exportar)
        });

        return res.status(200).json({ OkPacket })
      } catch (e) {
        this.responseErrorApi(req, res, next, e)
      }
    },
  ]
}