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

        /**
         * @type {{
         *   accesoData: {
         *     id: number,
         *     rol_id: number,
         *     rol_nombre: string,
         *     menu_id: number,
         *     menu_principal: string,
         *     menu_ruta: string,
         *     disabled_id: number,
         *     permiso_id: number,
         *     permiso_ver: number,
         *     permiso_agregar: number,
         *     permiso_editar: number,
         *     permiso_eliminar: number,
         *     permiso_ocultar: number,
         *     permiso_exportar: number
         *   }[],
         *   menuData: {
         *     id: number,
         *     principal: string,
         *     ruta: string
         *   }
         * }}
         */
        let {
          accesoData,
          menuData
        } = req.body;

        if (accesoData.constructor.name != 'Array') return

        for (let data of accesoData) {
          await this.model.tb_acceso.updateId(Number(data.id), {
            menu_id: Number(data.menu_id),
            rol_id: Number(data.rol_id),
            permiso_id: Number(data.permiso_id),
            disabled_id: Number(data.disabled_id)
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