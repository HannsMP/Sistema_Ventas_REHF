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
 *   nodeRoute: {last:boolean, tagsName:boolean, collector:boolean} | (this: App, node: SocketNode)=>void
 * }}
*/
module.exports = {
  load: true,
  route: "/control/reportes/compras",
  viewRenderPath: resolve('view', 'control', 'reportes', 'compras.ejs'),
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
  nodeRoute: function (node) {
    node.setOption({
      last: true
    })

    /** @param {import('datatables.net-dt').AjaxData} tableReq @param {(res:import('datatables.net-dt').AjaxResponse)=>void} res */
    let readTable = async (tableReq, res) => {
      let result = {
        draw: tableReq.draw,
        recordsTotal: 0,
        recordsFiltered: 0,
        data: []
      }

      try {
        let data = this.model.tb_transacciones_compras.readInParts(tableReq);
        let recordsFiltered = this.model.tb_transacciones_compras.readInPartsCount(tableReq);
        let recordsTotal = this.model.tb_transacciones_compras.readCount();

        result.data = await data;
        result.recordsFiltered = await recordsFiltered;
        result.recordsTotal = await recordsTotal;
      } catch (e) {
        return this.logError.writeStart(e.message, e.stack)
      }

      res(result);
    }

    /** @param {number} myId @param {number} id @param {()=>void} res */
    let readIdTable = async (myId, id, res) => {
      try {
        let permiso = await this.model.tb_permisos.userPathUpdate(myId, module.exports.route);
        if (!permiso) return res('No tienes Permisos para controlar la edicion de las Transacciones.');

        let data = await this.model.tb_transacciones_compras.readIdAll(id);
        res(data)
      } catch (e) {
        this.logError.writeStart(e.message, e.stack)
      }
    }

    /** @param {number} myId @param {()=>void} res */
    let updateIdTable = async (myId, data, res) => {
      try {
        let permiso = await this.model.tb_permisos.userPathUpdate(myId, module.exports.route);
        if (!permiso) return res('No tienes Permisos para controlar la edicion de las Transacciones.');

        let {
          id,
          proveedor_id,
          metodo_pago_id,
          serie
        } = data;

        let result = await this.model.tb_transacciones_compras.updateId(Number(id), {
          metodo_pago_id: Number(metodo_pago_id),
          proveedor_id: Number(proveedor_id),
          serie
        });

        await this.model.tb_transacciones_compras.refreshId(Number(id));

        if (result.affectedRows) res();
      } catch (e) {
        this.logError.writeStart(e.message, e.stack)
        res('Ocurrio un error, ponte en contacto con el administrador.');
      }
    }

    /** @param {number} myId @param {number} id @param {()=>void} res */
    let deleteIdTable = async (myId, id, res) => {
      try {
        let permiso = await this.model.tb_permisos.userPathDelete(myId, module.exports.route);
        if (!permiso) return res('No tienes Permisos para controlar la eliminacion de las Transacciones.');

        let result = await this.model.tb_transacciones_compras.deleteId(Number(id));
        if (result.affectedRows) res();
      } catch (e) {
        this.logError.writeStart(e.message, e.stack)
        res('Ocurrio un error, ponte en contacto con el administrador.');
      }
    }

    /** @param {Number} transaccion_id @param {()=>void} res */
    let readCompras = async (transaccion_id, res) => {
      try {
        let result = await this.model.tb_compras.readBusinessJoinId(transaccion_id);
        res(result);
      } catch (e) {
        return this.logError.writeStart(e.message, e.stack)
      }
    }

    /** @param {number} myId @param {()=>void} res */
    let insertIdCompras = async (myId, data, res) => {
      try {
        let permiso = await this.model.tb_permisos.userPathAdd(myId, "/control/movimientos/compras");
        if (!permiso) return res('No tienes Permisos para controlar la creacion de las categoiras.');

        let {
          transaccion_id,
          producto_id,
          cantidad,
          compra
        } = data;

        let result = await this.model.tb_compras.insert({
          transaccion_id,
          producto_id,
          cantidad,
          compra
        });

        await this.model.tb_transacciones_compras.refreshId(Number(transaccion_id));

        if (result.affectedRows) res();
      } catch (e) {
        this.logError.writeStart(e.message, e.stack)
        res('Ocurrio un error, ponte en contacto con el administrador.');
      }
    }

    /** @param {number} myId @param {()=>void} res */
    let updateIdCompras = async (myId, data, res) => {
      try {
        let permiso = await this.model.tb_permisos.userPathUpdate(myId, "/control/movimientos/compras");
        if (!permiso) return res('No tienes Permisos para controlar la edicion de las categorias.');

        let {
          id,
          transaccion_id,
          producto_id,
          cantidad,
          compra
        } = data;

        let result = await this.model.tb_compras.updateId(Number(id), {
          producto_id,
          cantidad,
          compra
        })

        await this.model.tb_transacciones_compras.refreshId(Number(transaccion_id));
        if (result.affectedRows) res();
      } catch (e) {
        this.logError.writeStart(e.message, e.stack)
        res('Ocurrio un error, ponte en contacto con el administrador.');
      }
    }

    /** @param {number} myId @param {number} id @param {number} transaccion_id @param {()=>void} res */
    let deleteIdCompras = async (myId, id, transaccion_id, res) => {
      try {
        let permiso = await this.model.tb_permisos.userPathDelete(myId, "/control/movimientos/compras");
        if (!permiso) return res('No tienes Permisos para controlar la eliminacion de las compras.');

        let result = await this.model.tb_compras.deleteId(Number(id));
        await this.model.tb_transacciones_compras.refreshId(Number(transaccion_id));
        if (result.affectedRows) res();
      } catch (e) {
        this.logError.writeStart(e.message, e.stack)
        res('Ocurrio un error, ponte en contacto con el administrador.');
      }
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
    let selectorProveedores = async (selectorReq, res) => {
      let result = {
        recordsTotal: 0,
        recordsFiltered: 0,
        data: []
      }

      try {
        let data = this.model.tb_proveedores.SelectorInParts(selectorReq);
        let recordsFiltered = this.model.tb_proveedores.SelectorInPartsCount(selectorReq);
        let recordsTotal = this.model.tb_proveedores.readCount();

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

      socket.on('/read/table', readTable)
      socket.on('/readId/table', readIdTable.bind(null, myId))
      socket.on('/updateId/table', updateIdTable.bind(null, myId))
      socket.on('/deleteId/table', deleteIdTable.bind(null, myId))
      socket.on('/read/compras', readCompras)
      socket.on('/insertId/compras', insertIdCompras.bind(null, myId))
      socket.on('/updateId/compras', updateIdCompras.bind(null, myId))
      socket.on('/deleteId/compras', deleteIdCompras.bind(null, myId))
      socket.on('/selector/producto', selectorProducto)
      socket.on('/selector/metodoPago', selectorMetodoPago)
      socket.on('/selector/proveedores', selectorProveedores)
    })
  }
}