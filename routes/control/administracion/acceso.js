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
  route: "/control/administracion/acceso",
  viewRenderPath: resolve('view', 'control', 'administracion', 'acceso.ejs'),
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
        let data = this.model.tb_menus.readInParts(tableReq);
        let recordsFiltered = this.model.tb_menus.readInPartsCount(tableReq);
        let recordsTotal = this.model.tb_menus.readCount();

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
        if (!permiso) return res('No tienes Permisos para controlar la edicion de los menus.');

        let data = await this.model.tb_menus.readIdAll(id);
        res(data)
      } catch (e) {
        this.logError.writeStart(e.message, e.stack)
      }
    }

    /** @param {number} myId @param {()=>void} res */
    let insertTable = async (myId, data, res) => {
      try {
        let permiso = await this.model.tb_permisos.userPathAdd(myId, module.exports.route);
        if (!permiso) return res('No tienes Permisos para controlar la creacion de los menus.');

        /**
         * @type {{
         *   principal: string,
         *   ruta: string
         * }}
         */
        let {
          principal,
          ruta
        } = data;

        let { insertId: menu_id, affectedRows } = await this.model.tb_menus.insert({
          principal,
          ruta
        });

        for (let rol_id = 1; rol_id <= 5; rol_id++)
          await this.model.tb_acceso.insert({
            menu_id,
            rol_id,
            ...(rol_id == 1
              ? {
                disabled_id: 0,
                permiso_ver: 1,
                permiso_agregar: 1,
                permiso_editar: 1,
                permiso_eliminar: 1,
                permiso_ocultar: 1,
                permiso_exportar: 1
              }
              : {
                disabled_id: 63,
                permiso_ver: 0,
                permiso_agregar: 0,
                permiso_editar: 0,
                permiso_eliminar: 0,
                permiso_ocultar: 0,
                permiso_exportar: 0
              }
            )
          })

        if (affectedRows) res();
      } catch (e) {
        this.logError.writeStart(e.message, e.stack)
        res('Ocurrio un error, ponte en contacto con el administrador.');
      }
    }

    /** @param {number} myId @param {()=>void} res */
    let updateIdTable = async (myId, data, res) => {
      try {
        let permiso = await this.model.tb_permisos.userPathUpdate(myId, module.exports.route);
        if (!permiso) return res('No tienes Permisos para controlar la edicion de los menus.');

        /**
         * @type {{
        *   id: number,
        *   principal: string,
        *   ruta: string
        * }}
        */
        let {
          id,
          principal,
          ruta
        } = data;

        let result = await this.model.tb_menus.updateId(id, { principal, ruta });

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
        if (!permiso) return res('No tienes Permisos para controlar la eliminacion de los menus.');

        await this.model.tb_acceso.deleteMenusId(id);
        let result = await this.model.tb_menus.deleteId(id);

        this.model.tb_acceso.io.sockets.emit(
          '/menu/data/deleteId',
          { id }
        )

        if (result.affectedRows) res();
      } catch (e) {
        this.logError.writeStart(e.message, e.stack)
        res('Ocurrio un error, ponte en contacto con el administrador.');
      }
    }

    /** @param {import('datatables.net-dt').AjaxData} tableReq @param {(res:import('datatables.net-dt').AjaxResponse)=>void} res */
    let readAccesos = async (menu_id, res) => {
      try {
        let data = await this.model.tb_acceso.readJoinMenuId(menu_id);
        res(data);
      } catch (e) {
        return this.logError.writeStart(e.message, e.stack)
      }

    }

    /** @param {number} myId @param {()=>void} res */
    let updateIdAcceso = async (myId, data, res) => {

      try {
        let permiso = await this.model.tb_permisos.userPathHide(myId, module.exports.route);
        if (!permiso) return res('No tienes Permisos para controlar el estado de los menus.');

        /**
         * @type {{
         *   id: number,
         *   permiso_ver: number,
         *   permiso_agregar: number,
         *   permiso_editar: number,
         *   permiso_eliminar: number,
         *   permiso_ocultar: number,
         *   permiso_exportar: number,
         *   menu_id: number,
         *   rol_id: number
         * }}
         */
        let {
          id,
          permiso_ver,
          permiso_agregar,
          permiso_editar,
          permiso_eliminar,
          permiso_ocultar,
          permiso_exportar,
          menu_id,
          rol_id
        } = data;

        let result = await this.model.tb_acceso.updateIdState(id, {
          permiso_ver: permiso_ver,
          permiso_agregar: permiso_agregar,
          permiso_editar: permiso_editar,
          permiso_eliminar: permiso_eliminar,
          permiso_ocultar: permiso_ocultar,
          permiso_exportar: permiso_exportar
        });

        if (rol_id) {
          let { ruta, principal } = await this.model.tb_menus.readIdAll(menu_id);
          if (principal == ':control') {
            this.socket.io.to(`rol:${rol_id}`).emit(
              '/session/acceso/updateId',
              {
                menu_ruta: ruta,
                permiso_ver: Number(permiso_ver),
                permiso_agregar: Number(permiso_agregar),
                permiso_editar: Number(permiso_editar),
                permiso_eliminar: Number(permiso_eliminar),
                permiso_ocultar: Number(permiso_ocultar),
                permiso_exportar: Number(permiso_exportar)
              }
            )

            this.socket.io.to(`url:${ruta}`, `rol:${rol_id}`).emit(
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
        }

        if (result.affectedRows) res();
      } catch (e) {
        this.logError.writeStart(e.message, e.stack)
        res('Ocurrio un error, ponte en contacto con el administrador.');
      }
    }

    /** @param {{column: string, value: any, id?: number}} req @param {()=>void} res */
    let readUnic = async (req, res) => {
      try {
        let { column, value, id } = req;
        if (!this.model.tb_menus.isColumnUnic(column)) return;

        let result = await this.model.tb_menus.isUnic(column, value, id);
        res(result);
      } catch (e) {
        this.logError.writeStart(e.message, e.stack)
      }
    }

    node.ev.on('connected', socket => {
      let myId = socket.session.usuario_id;

      socket.on('/read/table', readTable)
      socket.on('/readId/table', readIdTable.bind(null, myId))
      socket.on('/insert/table', insertTable.bind(null, myId))
      socket.on('/updateId/table', updateIdTable.bind(null, myId))
      socket.on('/deleteId/table', deleteIdTable.bind(null, myId))
      socket.on('/read/accesos', readAccesos)
      socket.on('/updateId/accesos', updateIdAcceso.bind(null, myId))
      socket.on('/read/unic', readUnic)
    })
  }
}