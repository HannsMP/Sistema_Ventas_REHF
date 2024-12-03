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
  route: "/control/mantenimiento/proveedores",
  viewRenderPath: resolve('view', 'control', 'mantenimiento', 'proveedores.ejs'),
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
        let data = this.model.tb_proveedores.readInParts(tableReq);
        let recordsFiltered = this.model.tb_proveedores.readInPartsCount(tableReq);
        let recordsTotal = this.model.tb_proveedores.readCount();

        result.data = await data;
        result.recordsFiltered = await recordsFiltered;
        result.recordsTotal = await recordsTotal;
      } catch (e) {
        return this.logError.writeStart(e.message, e.stack)
      }

      res(result);
    }

    /** @param {number} id @param {()=>void} res */
    let readIdTable = async (id, res) => {
      try {
        let data = await this.model.tb_proveedores.readJoinId(id);
        res(data)
      } catch (e) {
        this.logError.writeStart(e.message, e.stack)
      }
    }

    /** @param {number} myId @param {()=>void} res */
    let insertTable = async (myId, data, res) => {
      try {
        let permiso = await this.model.tb_permisos.userPathAdd(myId, module.exports.route);
        if (!permiso) return res('No tienes Permisos para controlar la creacion de los clientes.');

        let {
          titular,
          telefono,
          direccion,
          tipo_proveedor_id,
          tipo_documento_id,
          num_documento,
          estado
        } = data;

        let result = await this.model.tb_proveedores.insert({
          titular,
          telefono,
          direccion,
          tipo_proveedor_id: Number(tipo_proveedor_id),
          tipo_documento_id: Number(tipo_documento_id),
          num_documento,
          estado: Number(estado)
        });
        if (result.affectedRows) res();
      } catch (e) {
        this.logError.writeStart(e.message, e.stack)
        res('Ocurrio un error, ponte en contacto con el administrador.');
      }
    }

    /** @param {number} myId @param {()=>void} res */
    let updateIdTable = async (myId, data, res) => {
      try {
        let permiso = await this.model.tb_permisos.userPathUpdate(myId, module.exports.route);
        if (!permiso) return res('No tienes Permisos para controlar la edicion de los clientes.');

        let {
          id,
          titular,
          telefono,
          direccion,
          tipo_proveedor_id,
          tipo_documento_id,
          num_documento
        } = data;

        let result = await this.model.tb_proveedores.updateId(Number(id), {
          titular,
          telefono,
          direccion,
          tipo_proveedor_id: Number(tipo_proveedor_id),
          tipo_documento_id: Number(tipo_documento_id),
          num_documento
        });
        if (result.affectedRows) res();
      } catch (e) {
        this.logError.writeStart(e.message, e.stack)
        res('Ocurrio un error, ponte en contacto con el administrador.');
      }
    }

    /** @param {number} myId @param {number} id @param {()=>void} res */
    let stateIdTable = async (myId, id, estado, res) => {
      try {
        let permiso = await this.model.tb_permisos.userPathHide(myId, module.exports.route);
        if (!permiso) return res('No tienes Permisos para controlar el estado de los clientes.');

        let result = await this.model.tb_proveedores.updateIdState(id, estado ? 1 : 0);
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
        if (!permiso) return res('No tienes Permisos para controlar la eliminacion de los clientes.');

        let result = await this.model.tb_proveedores.deleteId(Number(id))
        if (result.affectedRows) res();
      } catch (e) {
        this.logError.writeStart(e.message, e.stack)
        res('Ocurrio un error, ponte en contacto con el administrador.');
      }
    }

    let unicColumns = new Set(['telefono', 'num_documento'])
    /** @param {{column: string, value: any, id?: number}} req @param {(valid: boolean)=>void} res */
    let readUnic = async (req, res) => {
      try {
        let { column, value, id } = req;
        if (!unicColumns.has(column)) return;
        if (!this.model.tb_proveedores.isColumnUnic(column)) return;

        let result = await this.model.tb_proveedores.isUnic(column, value, id);
        res(result);
      } catch (e) {
        this.logError.writeStart(e.message, e.stack)
      }
    }

    /** @param {SelectorRequest} selectorReq @param {SelectorEnd} res */
    let selectorTipoProveedor = async (selectorReq, res) => {
      let result = {
        recordsTotal: 0,
        recordsFiltered: 0,
        data: []
      }

      try {
        let data = this.model.tipo_proveedor.SelectorInParts(selectorReq);
        let recordsFiltered = this.model.tipo_proveedor.SelectorInPartsCount(selectorReq);
        let recordsTotal = this.model.tipo_proveedor.readCount();

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
      let myId = socket.session.usuario_id;

      socket.on('/read/table', readTable)
      socket.on('/readId/table', readIdTable)
      socket.on('/insert/table', insertTable.bind(null, myId))
      socket.on('/updateId/table', updateIdTable.bind(null, myId))
      socket.on('/stateId/table', stateIdTable.bind(null, myId))
      socket.on('/deleteId/table', deleteIdTable.bind(null, myId))
      socket.on('/read/unic', readUnic)
      socket.on('/selector/tipoProveedor', selectorTipoProveedor)
      socket.on('/selector/tipoDocumento', selectorTipoDocumento)
    })
  }
}