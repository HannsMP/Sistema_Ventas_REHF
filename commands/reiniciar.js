/** @typedef {import('../app')} App  */
/** @typedef {(this: App, phone: string, msg: import('whatsapp-web.js').Message, arg: string[], complete: (err: Error?)=>void)=>void} Run */

/** @type {{load: boolean, name: string, cooldown: number, onColldown: {}, run: Run}} */
module.exports = {
  load: true,
  name: 'reiniciar',
  cooldown: 5 * 1000,
  onColldown: {},
  description: `Reinicia el sistema, Es bueno refrescar la memoria!
  Uso: */reiniciar*
  No tiene parametros`,
  async run(phone, msg, arg, complete) {
    let permiso = await this.model.tb_permisos.phonePathView(phone, module.exports.name);

    if (!permiso) return

    let msgCurrent = await msg.reply('Iniciando Reinicar...');
    complete();

    this.system.reboot();

    setTimeout(() => {
      msgCurrent.edit('⚠ El proceso fallo.');
    }, 5000);
  }
}