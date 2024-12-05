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
  route: "/control/administracion",
  viewRenderPath: resolve('view', 'control', 'administracion', 'index.ejs'),
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

    /** @param {number} myId @param {()=>void} res */
    let cardAccessos = async (myId, res) => {
      try {
        let permiso = await this.model.tb_permisos.userPathView(myId, '/control/administracion/acceso');
        if (!permiso) return;

        let cantidad_menus = await this.model.tb_menus.cardCount();
        let cantidad_accesos = await this.model.tb_acceso.cardCount();
        let { label, data } = await this.model.tb_acceso.chartCountPermits();

        res(cantidad_menus, cantidad_accesos, label, [data])
      } catch (e) {

      }
    }

    /** @param {number} myId @param {()=>void} res */
    let cardUsuarios = async (myId, res) => {
      try {
        let permiso = await this.model.tb_permisos.userPathView(myId, '/control/administracion/usuarios');
        if (!permiso) return;

        let max_creacion = await this.model.tb_usuarios.cardLastCreation();
        let cantidad = await this.model.tb_usuarios.cardCount();
        let { label, data } = await this.model.tipo_roles.chartCountRoles();

        res(max_creacion, cantidad, label, [data])
      } catch (e) {

      }
    }

    /** @param {number} myId @param {()=>void} res */
    let imagenBot = async (myId, res) => {
      try {
        let permiso = await this.model.tb_permisos.userPathView(myId, '/control/administracion/bot');
        if (!permiso) return;

        let state = this.bot.state();

        let avatar = state == 'CONNECTED'
          ? await this.bot.client.getProfilePicUrl(this.bot.client.info.wid._serialized)
          : undefined;

        res(null, avatar);
      } catch (e) {
        this.logError.writeStart(e.message, e.stack)
        res('Ocurrio un error, ponte en contacto con el administrador.');
      }
    }

    /** @param {number} myId @param {()=>void} res */
    let cardBot = async (myId, res) => {
      try {
        let permiso = await this.model.tb_permisos.userPathView(myId, '/control/administracion/bot');
        if (!permiso) return;

        let state = this.bot.state();

        let info = { state }

        if (state == 'CONNECTED') {
          let { wid, pushname } = this.bot.client.info;
          info.name = pushname;
          info.phone = wid.user;
        }

        let label = [], data = [];

        for (const key in this.bot.collection) {
          const { use, name } = this.bot.collection[key];
          data.push(use);
          label.push(name);
        }

        res(info, label, [data])
      } catch (e) {
        this.logError.writeStart(e.message, e.stack)
      }
    }

    /** @param {number} myId @param {()=>void} res */
    let cardTipos = async (myId, res) => {
      try {
        let permiso = await this.model.tb_permisos.userPathView(myId, '/control/administracion/tipos');
        if (!permiso) return;

        let labels = [
          this.model.tipo_metodo_pago.name,
          this.model.tipo_cliente.name,
          this.model.tipo_proveedor.name,
          this.model.tipo_documento.name,
          this.model.tipo_roles.name
        ]

        let data = await Promise.all([
          this.model.tipo_metodo_pago.readCount(),
          this.model.tipo_cliente.readCount(),
          this.model.tipo_proveedor.readCount(),
          this.model.tipo_documento.readCount(),
          this.model.tipo_roles.readCount()
        ])

        res(
          labels,
          [data]
        )
      } catch (e) {

      }
    }

    node.ev.on('connected', socket => {
      let myId = socket.session.usuario_id;

      socket.on('/dash/accesos', cardAccessos.bind(null, myId));
      socket.on('/dash/usuarios', cardUsuarios.bind(null, myId));
      socket.on('/imagen/bot', imagenBot.bind(null, myId));
      socket.on('/dash/bot', cardBot.bind(null, myId));
      socket.on('/dash/tipos', cardTipos.bind(null, myId));
    })
  }
}