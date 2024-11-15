const { resolve } = require('path');

/** @typedef {import('../../../app')} App */
/** @typedef {import('../../../utils/SocketNode')} SocketNode */
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
 *   nodeOption: {last:boolean, tagsName:boolean, collector:boolean},
 *   nodeRoute: (this: App, node: SocketNode)=>void
 * }} 
*/
module.exports = {
  load: true,
  route: "/control/administracion/usuarios",
  viewRenderPath: resolve('view', 'control', 'administracion', 'usuarios.ejs'),
  viewErrorPath: resolve('view', 'error', '403.ejs'),
  get: [
    async function (req, res, next) {
      let { usuario } = this.cache.apiKey.read(req.cookies.apiKey);

      let userLayout = await this.model.tb_permisos.userLayoutAll(usuario.id);

      let permiso = userLayout[module.exports.route];

      if (!permiso.ver)
        return res.status(403).render(module.exports.viewErrorPath, { session: { usuario }, userLayout });

      res.render(module.exports.viewRenderPath, { session: { usuario, permiso }, userLayout });
    },
  ],
  nodeOption: {
    last: true,
  },
  nodeRoute: function (node) {

    /** @param {import('datatables.net-dt').AjaxData} tableReq @param {(res:import('datatables.net-dt').AjaxResponse)=>void} res */
    let readTable = async (myId, tableReq, res) => {
      let result = {
        draw: tableReq.draw,
        recordsTotal: 0,
        recordsFiltered: 0,
        data: []
      }

      try {
        let data = this.model.tb_usuarios.readInParts(tableReq, myId);
        let recordsFiltered = this.model.tb_usuarios.readInPartsCount(tableReq, myId);
        let recordsTotal = this.model.tb_usuarios.readCount([myId]);

        result.data = await data;
        result.recordsFiltered = await recordsFiltered;
        result.recordsTotal = await recordsTotal;
      } catch (e) {
        return this.logError.writeStart(e.message, e.stack)
      }

      res(result);
    }

    /** @param {{column: string, value: any, id?: number}} req @param {(valid: boolean)=>void} res */
    let readUnic = async (req, res) => {
      try {
        let { column, value, id } = req;
        if (!this.model.tb_usuarios.isColumnUnic(column)) return;

        let result = await this.model.tb_usuarios.isUnic(column, value, id);
        res(result);
      } catch (e) {
        this.logError.writeStart(e.message, e.stack)
      }
    }

    /** @param {SelectorRequest} selectorReq @param {SelectorEnd} res */
    let selectorRol = async (myRolId, selectorReq, res) => {
      let result = {
        recordsTotal: 0,
        recordsFiltered: 0,
        data: []
      }

      try {
        let data = this.model.tipo_rol.SelectorInParts(selectorReq, myRolId);
        let recordsFiltered = this.model.tipo_rol.SelectorInPartsCount(selectorReq, myRolId);
        let recordsTotal = this.model.tipo_rol.readCount();

        result.data = await data;
        result.recordsFiltered = await recordsFiltered;
        result.recordsTotal = await recordsTotal;
      } catch (e) {
        return this.logError.writeStart(e.message, e.stack)
      }

      res(result)
    }

    node.ev.on('connected', socket => {
      let myId = socket.session.usuario_id;
      let myRolId = socket.session.rol_id;

      socket.on('/read/table', readTable.bind(null, myId))
      socket.on('/read/unic', readUnic)
      socket.on('/selector/rol', selectorRol.bind(null, myRolId))
    })
  }
}