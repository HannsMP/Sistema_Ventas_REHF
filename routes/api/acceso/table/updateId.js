/** @typedef {Array.<(this: import('../../../../app'), req: import('express').Request, res: import('express').Response, next: import('express').NextFunction)=>void>} routeArr */
/** @type {{load:boolean, route:string, use: routeArr, get: routeArr, post: routeArr}} */
module.exports = {
  load: true,
  route: "/api/acceso/table/updateId",
  post: [
    async function (req, res, next) {
      try {
        let session = this.cache.apiKey.read(req.cookies.apiKey);

        let permiso = await this.model.tb_permisos.userPathUpdate(session.usuario.id, module.exports.route);

        if (!permiso) return res.status(403).json({ err: 'Tu usuario no tiene Permisos para esta peticion.' });

        let {
          accesoData,
          menuData
        } = req.body;

        if (accesoData.constructor.name != 'Array') return

        for (let index in accesoData) {
          let { id, menu_id, rol_id, permiso_id, disabled_id } = accesoData[index];

          await this.model.tb_acceso.updateId(Number(id), {
            menu_id: Number(menu_id),
            rol_id: Number(rol_id),
            permiso_id: Number(permiso_id),
            disabled_id: Number(disabled_id)
          });
        }

        let { id, principal, ruta } = menuData;

        let OkPacket = await this.model.tb_menus.updateId(Number(id), {
          principal,
          ruta
        });

        res.status(200).json({ OkPacket })
      } catch (e) {
        this.responseErrorApi(req, res, next, e)
      }
    },
  ]
}