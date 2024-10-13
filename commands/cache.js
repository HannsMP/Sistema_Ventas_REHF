const deletePath = require('../utils/function/deletePath');
const { resolve } = require('path');

/** @typedef {import('../app')} App  */
/** @typedef {(this: App, phone: string, msg: import('whatsapp-web.js').Message, arg: string[], complete: (err: Error?)=>void)=>void} Run */

/** @type {{load: boolean, name: string, cooldown: number, onColldown: {}, run: Run}} */
module.exports = {
  load: true,
  name: 'cache',
  cooldown: 30 * 1000,
  onColldown: {},
  description: `Permite controlar la cache del backend. 
  Uso: */cache [accion] [carpeta]*
  accion:
    *clear*: limpia el interior de una carpeta cache.
  carpeta:
    *img*`,
  async run(phone, msg, arg, complete) {

    let permiso = await this.model.tb_permisos.phonePathView(phone, module.exports.name);

    if (!permiso) return

    let [accion, carpeta] = arg;

    let sendMsg = [];

    if (accion == 'clear') {
      if (carpeta == 'img') {
        try {
          let countFileDelete = await deletePath(resolve('.temp', 'img'));
          sendMsg.push(`👨‍🚀 Cantidad de contenido eliminado en ${carpeta}: ${countFileDelete}`);
        } catch (e) {
          sendMsg.push(`👨‍🚀 ⚠ Ocurrio un error al intentar limpiar la carpeta ${carpeta}`, e.message, e.stack);
        }
      }
    }

    msg.reply(sendMsg.join('\n'));

    complete();
  }
}