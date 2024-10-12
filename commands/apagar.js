/** @typedef {import('../app')} App  */
/** @typedef {(this: App, phone: string, msg: import('whatsapp-web.js').Message, arg: string[], complete: (err: Error?)=>void)=>void} Run */

/** @type {{load: boolean, name: string, cooldown: number, onColldown: {}, run: Run}} */
module.exports = {
  load: true,
  name: 'apagar',
  cooldown: 5 * 1000,
  onColldown: {},
  description: `Apaga el sistema, ¿lo encenderas manualmente? 
  Uso: */apagar*
  No tiene parametros`,
  async run(phone, msg, arg, complete) {
    let permiso = await this.model.tb_permisos.phonePathView(phone, module.exports.name);

    if (!permiso) return

    let msgCurrent = await msg.reply('Iniciando apagado...');
    complete();
    
    this.system.powerOff();

    setTimeout(() => {
      msgCurrent.edit('⚠ El proceso fallo.');
    }, 5000);
  }
}