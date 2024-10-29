const { resolve } = require('path');

const ModelError = require('./../../../utils//error/Model');

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
*   nodeRoute: (this: App, node: SocketNode)=>void
* }} 
*/
module.exports = {
  load: true,
  route: "/auth/recovery",
  viewLayoutPath: resolve('layout', 'default.ejs'),
  viewRenderPath: resolve('view', 'auth', 'recovery.ejs'),
  viewErrorPath: resolve('view', 'error', '503.ejs'),
  use: [
    async function (req, res, next) {
      if (this.bot.state() == 'CONNECTED')
        return next();

      this.app.set('layout', module.exports.viewLayoutPath);
      res.status(503).render(module.exports.viewErrorPath, { url: req.originalUrl });
    }
  ],
  get: [
    async function (req, res, next) {

      let theme = 'purple';

      if (!req.cookies['config-theme'])
        res.cookie('config-theme', theme, {
          maxAge: 30 * 24 * 60 * 60 * 60 * 1000,
          sameSite: 'Strict',
          httpOnly: true
        });
      else
        theme = req.cookies['config-theme'];

      res.status(200).render(module.exports.viewRenderPath, {
        recovery: undefined,
        form: 'user',
        theme
      });
    }
  ],
  post: [
    async function (req, res, next) {
      theme = req.cookies['config-theme'];

      try {
        let {
          usuario,
          codigo,
          clave,
          repetirClave
        } = req.body;

        if (typeof usuario != 'string')
          return res.status(200).render(module.exports.viewRenderPath, {
            recovery: undefined,
            form: 'user',
            theme
          })

        let { id, telefono } = await this.model.tb_usuarios.readPhoneUser(usuario);

        if (typeof codigo != 'string') {
          this.bot.sendMessage(telefono, `Hola ${usuario} 👋, se esta intentando restablecer tu contraseña. Por razones de seguridad enviame solo '/recuperar' para obtener un codigo de recuperacion.`)

          return res.status(200).render(module.exports.viewRenderPath, {
            recovery: { usuario },
            form: 'code',
            theme
          })
        }

        if (!this.cache.codeRecovery.exist(codigo))
          return res.status(200).render(module.exports.viewRenderPath, {
            alert: {
              timer: '1500',
              icon: 'error',
              title: `Error`,
              text: `Codigo de recuperacion no valido.`
            },
            recovery: { usuario },
            form: 'code',
            theme
          })

        if (typeof clave != 'string' || typeof repetirClave != 'string')
          return res.status(200).render(module.exports.viewRenderPath, {
            recovery: { usuario, codigo },
            form: 'pass',
            theme
          })

        if (clave != repetirClave)
          return res.status(200).render(module.exports.viewRenderPath, {
            alert: {
              timer: '1500',
              icon: 'error',
              title: 'Error',
              text: `Las contraseñas son diferentes.`
            },
            recovery: { usuario, codigo, clave, repetirClave },
            form: 'pass',
            theme
          })

        await this.model.tb_usuarios.updateIdPassword(id, clave);
        this.cache.codeRecovery.delete(codigo);

        res.status(200).render(module.exports.viewRenderPath, {
          alert: {
            timer: '1500',
            icon: 'success',
            title: `Contraseña Actualizada ${usuario}`,
            text: `Redirigiendo...`,
            redirect: '/auth/login'
          },
          recovery: { usuario, codigo, clave, repetirClave },
          form: 'pass',
          theme
        })

      } catch (e) {
        if (e instanceof ModelError) {
          let { code, message } = e;

          if (code == 'COLUMN_UNEXIST_FIELD' || code == 'COLUMN_UNEXPECTED_VALUE' || code == 'COLUMN_TYPE_FIELD' || code == 'COLUMN_LIMIT_FIELD')
            return res.status(404).render(module.exports.viewRenderPath, {
              alert: {
                timer: '1500',
                icon: 'error',
                title: 'Error',
                text: message
              },
              recovery: undefined,
              form: 'user',
              theme
            })

          if (code == 'RESPONSE_DATA_EMPTY' || code == 'RESPONSE_DATA_DISABLED' || code == 'RESPONSE_DATA_DIFERENT')
            return res.status(404).render(module.exports.viewRenderPath, {
              alert: {
                timer: '1500',
                icon: 'warning',
                title: 'Advertencia',
                text: message
              },
              recovery: undefined,
              form: 'user',
              theme
            })

        }
      }
    }
  ]
}