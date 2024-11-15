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
  route: "/control/mantenimiento/clientes",
  viewRenderPath: resolve('view', 'control', 'mantenimiento', 'clientes.ejs'),
  viewErrorPath: resolve('view', 'error', '403.ejs'),
  get: [
    async function (req, res, next) {
      let session = this.cache.apiKey.read(req.cookies.apiKey);

      let userLayout = await this.model.tb_permisos.userLayoutAll(session.usuario.id);

      let permiso = userLayout[module.exports.route];

      if (!permiso.ver) return res.status(403).render(module.exports.viewErrorPath, { session, userLayout });

      session.permiso = permiso;

      res.render(module.exports.viewRenderPath, { session, userLayout });
    },
  ],
  nodeOption: {
    last: true,
  },
  nodeRoute: function (node) {

    /** @param {import('datatables.net-dt').AjaxData} tableReq @param {(res:import('datatables.net-dt').AjaxResponse)=>void} res */
    let readTable = async (tableReq, res) => {
      let result = {
        draw: tableReq.draw,
        recordsTotal: 0,
        recordsFiltered: 0,
        data: []
      }

      try {
        let data = this.model.tb_clientes.readInParts(tableReq);
        let recordsFiltered = this.model.tb_clientes.readInPartsCount(tableReq);
        let recordsTotal = this.model.tb_clientes.readCount();

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
        if (!this.model.tb_clientes.isColumnUnic(column)) return;

        let result = await this.model.tb_clientes.isUnic(column, value, id);
        res(result);
      } catch (e) {
        this.logError.writeStart(e.message, e.stack)
      }
    }

    /** @param {SelectorRequest} selectorReq @param {SelectorEnd} res */
    let selectorTipoCliente = async (selectorReq, res) => {
      let result = {
        recordsTotal: 0,
        recordsFiltered: 0,
        data: []
      }

      try {
        let data = this.model.tipo_cliente.SelectorInParts(selectorReq);
        let recordsFiltered = this.model.tipo_cliente.SelectorInPartsCount(selectorReq);
        let recordsTotal = this.model.tipo_cliente.readCount();

        result.data = await data;
        result.recordsFiltered = await recordsFiltered;
        result.recordsTotal = await recordsTotal;
      } catch (e) {
        return this.logError.writeStart(e.message, e.stack)
      }

      res(result)
    }

    /** @param {SelectorRequest} selectorReq @param {SelectorEnd} res */
    let selectorTipoDocumento = async (selectorReq, res) => {
      let result = {
        recordsTotal: 0,
        recordsFiltered: 0,
        data: []
      }

      try {
        let data = this.model.tipo_documento.SelectorInParts(selectorReq);
        let recordsFiltered = this.model.tipo_documento.SelectorInPartsCount(selectorReq);
        let recordsTotal = this.model.tipo_documento.readCount(null, true);

        result.data = await data;
        result.recordsFiltered = await recordsFiltered;
        result.recordsTotal = await recordsTotal;
      } catch (e) {
        return this.logError.writeStart(e.message, e.stack)
      }

      res(result)
    }

    node.ev.on('connected', socket => {
      socket.on('/read/table', readTable)
      socket.on('/read/unic', readUnic)
      socket.on('/selector/tipoCliente', selectorTipoCliente)
      socket.on('/selector/tipoDocumento', selectorTipoDocumento)
    })
  }
}