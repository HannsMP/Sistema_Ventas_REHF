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
  nodeRoute: function (node) {
    node.setOption({
      last: true,
      tagsName: true
    })

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

    /** @param {number} id @param {()=>void} res */
    let readIdTable = async (myId, id, res) => {
      try {
        let permiso = await this.model.tb_permisos.userPathUpdate(myId, module.exports.route);
        if (!permiso) return res('No tienes Permisos para controlar la edicion de los usuarios.');

        let data = await this.model.tb_usuarios.readJoinId(id);
        res(data)
      } catch (e) {
        this.logError.writeStart(e.message, e.stack)
      }
    }

    /** @param {number} myId @param {()=>void} res */
    let insertTable = async (myId, data, res) => {
      try {
        let permiso = await this.model.tb_permisos.userPathAdd(myId, module.exports.route);
        if (!permiso) return res('No tienes Permisos para controlar la creacion de los usuarios.');

        let {
          nombres,
          apellidos,
          usuario,
          telefono,
          email,
          rol_id,
          estado
        } = data;

        let result = await this.model.tb_usuarios.register({
          nombres,
          apellidos,
          usuario,
          telefono,
          email,
          estado: Number(estado),
          rol_id: Number(rol_id),
          clave: '12345678'
        });

        if (result.affectedRows) res();
      } catch (e) {
        this.logError.writeStart(e.message, e.stack)
        res('Ocurrio un error, ponte en contacto con el administrador.');
      }
    }

    /** @param {number} myId @param {number} myRolId @param {()=>void} res */
    let updateIdTable = async (myId, myRolId, data, res) => {
      try {
        let permiso = await this.model.tb_permisos.userPathUpdate(myId, module.exports.route);
        if (!permiso) return res('No tienes Permisos para controlar la edicion de los usuarios.');

        let {
          id,
          nombres,
          apellidos,
          usuario,
          telefono,
          email,
          rol_id
        } = data;

        let result = await this.model.tb_usuarios.updateId(Number(id), {
          nombres,
          apellidos,
          usuario,
          telefono,
          email,
          rol_id: Number(rol_id)
        }, myRolId);

        if (result.affectedRows) res();
      } catch (e) {
        this.logError.writeStart(e.message, e.stack)
        res('Ocurrio un error, ponte en contacto con el administrador.');
      }
    }

    /** @param {number} myId @param {number} myRolId @param {number} id @param {()=>void} res */
    let stateIdTable = async (myId, myRolId, id, estado, res) => {
      try {
        let permiso = await this.model.tb_permisos.userPathHide(myId, module.exports.route);
        if (!permiso) return res('No tienes Permisos para controlar el estado de los usuarios.');

        let result = await this.model.tb_usuarios.updateIdState(id, estado ? 1 : 0, myRolId);
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
        if (!permiso) return res('No tienes Permisos para controlar la eliminacion de los usuarios.');

        let result = await this.model.tb_usuarios.deleteId(Number(id));

        if (result.affectedRows) res();
      } catch (e) {
        this.logError.writeStart(e.message, e.stack)
        res('Ocurrio un error, ponte en contacto con el administrador.');
      }
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
        let data = this.model.tipo_roles.SelectorInParts(selectorReq, myRolId);
        let recordsFiltered = this.model.tipo_roles.SelectorInPartsCount(selectorReq, myRolId);
        let recordsTotal = this.model.tipo_roles.readCount();

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
      socket.on('/readId/table', readIdTable.bind(null, myId))
      socket.on('/insert/table', insertTable.bind(null, myId))
      socket.on('/updateId/table', updateIdTable.bind(null, myId, myRolId))
      socket.on('/stateId/table', stateIdTable.bind(null, myId, myRolId))
      socket.on('/deleteId/table', deleteIdTable.bind(null, myId))
      socket.on('/read/unic', readUnic)
      socket.on('/selector/rol', selectorRol.bind(null, myRolId))
    })
  }
}