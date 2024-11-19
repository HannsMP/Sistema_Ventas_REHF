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
  route: "/control/movimientos/ventas",
  viewRenderPath: resolve('view', 'control', 'movimientos', 'ventas.ejs'),
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
    last: true
  },
  nodeRoute: function (node) {
    node.option.tagsName = true;

    /** @param {import('datatables.net-dt').AjaxData} tableReq @param {(res:import('datatables.net-dt').AjaxResponse)=>void} res */
    let readTable = async (myId, tableReq, res) => {
      let result = {
        draw: tableReq.draw,
        recordsTotal: 0,
        recordsFiltered: 0,
        data: []
      }

      try {
        let data = this.model.tb_ventas.readInParts(tableReq, myId);
        let recordsFiltered = this.model.tb_ventas.readInPartsCount(tableReq, myId);
        let recordsTotal = this.model.tb_ventas.readCount();

        result.data = await data;
        result.recordsFiltered = await recordsFiltered;
        result.recordsTotal = await recordsTotal;
      } catch (e) {
        return this.logError.writeStart(e.message, e.stack)
      }

      res(result);
    }

    /** @param {SelectorRequest} selectorReq @param {SelectorEnd} res */
    let selectorProducto = async (selectorReq, res) => {
      let result = {
        recordsTotal: 0,
        recordsFiltered: 0,
        data: []
      }

      try {
        let data = this.model.tb_productos.SelectorInParts(selectorReq);
        let recordsFiltered = this.model.tb_productos.SelectorInPartsCount(selectorReq);
        let recordsTotal = this.model.tb_productos.readCount(null, true);

        result.data = await data;
        result.recordsFiltered = await recordsFiltered;
        result.recordsTotal = await recordsTotal;
      } catch (e) {
        return this.logError.writeStart(e.message, e.stack)
      }

      res(result)
    }

    /** @param {SelectorRequest} selectorReq @param {SelectorEnd} res */
    let selectorMetodoPago = async (selectorReq, res) => {
      let result = {
        recordsTotal: 0,
        recordsFiltered: 0,
        data: []
      }

      try {
        let data = this.model.tipo_metodo_pago.SelectorInParts(selectorReq);
        let recordsFiltered = this.model.tipo_metodo_pago.SelectorInPartsCount(selectorReq);
        let recordsTotal = this.model.tipo_metodo_pago.readCount();

        result.data = await data;
        result.recordsFiltered = await recordsFiltered;
        result.recordsTotal = await recordsTotal;
      } catch (e) {
        return this.logError.writeStart(e.message, e.stack)
      }

      res(result)
    }

    /** @param {SelectorRequest} selectorReq @param {SelectorEnd} res */
    let selectorCliente = async (selectorReq, res) => {
      let result = {
        recordsTotal: 0,
        recordsFiltered: 0,
        data: []
      }

      try {
        let data = this.model.tb_clientes.SelectorInParts(selectorReq);
        let recordsFiltered = this.model.tb_clientes.SelectorInPartsCount(selectorReq);
        let recordsTotal = this.model.tb_clientes.readCount();

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

      socket.on('/read/table', readTable.bind(null, myId))
      socket.on('/selector/producto', selectorProducto)
      socket.on('/selector/metodoPago', selectorMetodoPago)
      socket.on('/selector/cliente', selectorCliente)
    })
  }
}