/** @typedef {Array.<(this: import('../../../../app'), req: import('express').Request, res: import('express').Response, next: import('express').NextFunction)=>void>} routeArr */
/** @type {{load:boolean, route:string, use: routeArr, get: routeArr, post: routeArr}} */
module.exports = {
  load: true,
  route: "/api/acceso/table/insert",
  post: [
    async function (req, res, next) {
      try {
        let session = this.cache.apiKey.read(req.cookies.apiKey);

        let permiso = await this.model.tb_permisos.userPathAdd(session.usuario.id, module.exports.route);

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
         *   principal: string,
         *   ruta: string
         * }}
         */
        let {
          accesoData,
          principal,
          ruta
        } = req.body;

        let { insertId: menu_id } = await this.model.tb_menus.insert({
          principal,
          ruta
        });

        let OkPackets = []

        for (let data of accesoData)
          OkPackets.push(
            await this.model.tb_acceso.insert({
              menu_id,
              rol_id: Number(data.rol_id),
              disabled_id: Number(data.disabled_id),
              permiso_ver: Number(data.permiso_ver),
              permiso_agregar: Number(data.permiso_agregar),
              permiso_editar: Number(data.permiso_editar),
              permiso_eliminar: Number(data.permiso_eliminar),
              permiso_ocultar: Number(data.permiso_ocultar),
              permiso_exportar: Number(data.permiso_exportar)
            })
          )

        return res.status(200).json({ OkPackets })
      } catch (e) {
        this.responseErrorApi(req, res, next, e)
      }
    },
  ]
}