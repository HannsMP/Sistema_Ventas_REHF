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
  route: "/control/administracion/bot",
  viewRenderPath: resolve('view', 'control', 'administracion', 'bot.ejs'),
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

    /** @param {()=>void} res */
    let infoBot = async (res) => {
      let state = this.bot.state();

      let data = { state }

      if (state == 'CONNECTED') {
        let { wid, pushname } = this.bot.client.info;
        data.name = pushname;
        data.phone = wid.user;
      }

      res(null, data);
      try {
      } catch (e) {
        this.logError.writeStart(e.message, e.stack)
        res('Ocurrio un error, ponte en contacto con el administrador.');
      }
    }

    /** @param {()=>void} res */
    let imagenBot = async (res) => {
      try {
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

    /** @param {()=>void} res */
    let stateBot = async (res) => {
      try {
        let permiso = await this.model.tb_permisos.userPathHide(myId, module.exports.route);
        if (!permiso) return res('No tienes Permisos para controlar el estado del los bot.');

        let state = this.bot.state();

        if (state == 'CONNECTED')
          await this.bot.off();
        else
          await this.bot.on();

        let stateCurrent = this.bot.state();

        res(null, stateCurrent);
      } catch (e) {
        this.logError.writeStart(e.message, e.stack)
        res('Ocurrio un error, ponte en contacto con el administrador.');
      }
    }

    /** @param {()=>void} res */
    let stopBot = async (res) => {
      try {
        let state = this.bot.state();

        if (state == 'CONNECTED')
          await this.bot.logout();

        let stateCurrent = this.bot.state();

        res(null, stateCurrent);
      } catch (e) {
        this.logError.writeStart(e.message, e.stack)
        res('Ocurrio un error, ponte en contacto con el administrador.');
      }
    }

    /** @param {()=>void} res */
    let commandsBot = async (res) => {
      try {
        let label = [], data = [];

        for (const key in this.bot.collection) {
          const { use, name } = this.bot.collection[key];
          data.push(use);
          label.push(name);
        }

        res(null, label, data);
      } catch (e) {
        this.logError.writeStart(e.message, e.stack)
        res('Ocurrio un error, ponte en contacto con el administrador.');
      }
    }


    node.ev.on('connected', socket => {
      let myId = socket.session.usuario_id;

      socket.on('/info/bot', infoBot)
      socket.on('/imagen/bot', imagenBot)
      socket.on('/state/bot', stateBot.bind(null, myId))
      socket.on('/stop/bot', stopBot.bind(null, myId))
      socket.on('/commands/bot', commandsBot)
    })
  }
}