
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
  route: "/api/acceso/table/updatePermisoId",
  post: [
    async function (req, res, next) {
      try {
        let session = this.cache.apiKey.read(req.cookies.apiKey);

        let permiso = await this.model.tb_permisos.userPathUpdate(session.usuario.id, module.exports.route);

        if (!permiso) return res.status(403).json({ err: 'Tu usuario no tiene Permisos para esta peticion.' });

        /**
         * @type {{
         *   id: number,
         *   menu_id: number,
         *   menu_ruta: string,
         *   menu_principal: string,
         *   rol_id: number,
         *   rol_nombre: string,
         *   permiso_id: number,
         *   permiso_ver: number,
         *   permiso_agregar: number,
         *   permiso_editar: number,
         *   permiso_eliminar: number,
         *   permiso_ocultar: number,
         *   permiso_exportar: number
         * }}
         */
        let {
          id,
          menu_ruta,
          rol_id,
          permiso_ver,
          permiso_agregar,
          permiso_editar,
          permiso_eliminar,
          permiso_ocultar,
          permiso_exportar
        } = req.body;

        let OkPacket = await this.model.tb_acceso.updateIdState(Number(id), {
          permiso_ver: Number(permiso_ver),
          permiso_agregar: Number(permiso_agregar),
          permiso_editar: Number(permiso_editar),
          permiso_eliminar: Number(permiso_eliminar),
          permiso_ocultar: Number(permiso_ocultar),
          permiso_exportar: Number(permiso_exportar)
        });

        if (rol_id) {
          this.socket.rootControl.emitRol(
            rol_id,
            '/session/acceso/updateId',
            {
              menu_ruta: menu_ruta,
              permiso_ver: Number(permiso_ver),
              permiso_agregar: Number(permiso_agregar),
              permiso_editar: Number(permiso_editar),
              permiso_eliminar: Number(permiso_eliminar),
              permiso_ocultar: Number(permiso_ocultar),
              permiso_exportar: Number(permiso_exportar)
            }
          )

          this.socket.emitRouteByRol(
            menu_ruta,
            rol_id,
            '/session/acceso/state',
            {
              permiso_ver: Number(permiso_ver),
              permiso_agregar: Number(permiso_agregar),
              permiso_editar: Number(permiso_editar),
              permiso_eliminar: Number(permiso_eliminar),
              permiso_ocultar: Number(permiso_ocultar),
              permiso_exportar: Number(permiso_exportar)
            }
          )
        }

        return res.status(200).json({ OkPacket })
      } catch (e) {
        this.responseErrorApi(req, res, next, e)
      }
    },
  ]
}