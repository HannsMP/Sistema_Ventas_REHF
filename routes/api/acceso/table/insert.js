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

        let {
          principal,
          ruta,
          accesoData
        } = req.body;

        let { insertId: menu_id } = await this.model.tb_menus.insert({ principal, ruta });

        let OkPackets = []

        for (let index in accesoData) {
          let { rol_id, permiso_id, disabled_id } = accesoData[index];
          let okPacket = await this.model.tb_acceso.insert({ menu_id, rol_id, permiso_id, disabled_id });
          OkPackets.push(okPacket)
          accesoData[index].id = okPacket.insertId;
        }

        return res.status(200).json({ OkPackets, modifiedData: accesoData })
      } catch (e) {
        this.responseErrorApi(req, res, next, e)
      }
    },
  ]
}