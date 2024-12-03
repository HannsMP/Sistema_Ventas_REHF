/** @typedef {import('../app')} App  */
/** @typedef {(this: App, phone: string, msg: import('whatsapp-web.js').Message, arg: string[], complete: (err: Error?)=>void)=>void} Run */

/** @type {{load: boolean, name: string, cooldown: number, onColldown: {}, run: Run}} */
module.exports = {
  load: true,
  name: 'apache',
  cooldown: 30 * 1000,
  onColldown: {},
  description: `Permite controlar el estado del servidor Apache.
  Uso: */apache [accion]*
  si no se especifica accion: retorna informacion sobre el servidor Apache.
  accion:
    *start*: enciende el servidor Apache.
    *restart*: Reinicia el servidor Apache.
    *stop*: Detiene el servidor Apache.`,
  async run(phone, msg, arg, complete) {

    let permiso = await this.model.tb_permisos.phonePathView(phone, module.exports.name);

    if (!permiso) return

    let [action = 'status'] = arg;

    let sendMsg = [];
    try {
      await this.system.apache(action);
      sendMsg.push(`👨‍🚀 [Apache] ${action} orden ejecutada Exitosamente!`);
    } catch (e) {
      sendMsg.push(`👨‍🚀 ⚠ Ocurrio un error al intentar Ejecutar la orden ${action}.`, e.message, e.stack);
    }

    msg.reply(sendMsg.join('\n'));

    complete();
  }
}