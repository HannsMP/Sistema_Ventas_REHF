/** @typedef {import('../app')} App  */
/** @typedef {(this: App, phone: string, msg: import('whatsapp-web.js').Message, arg: string[], complete: (err: Error?)=>void)=>void} Run */

/** @type {{load: boolean, name: string, cooldown: number, onColldown: {}, run: Run}} */
module.exports = {
  load: true,
  name: 'server',
  cooldown: 5 * 1000,
  onColldown: {},
  description: `Permite controlar el estado del servidor. 
  Uso: */server [estado]*
  estado:
    *on*: enciende el servidor.
    *off*: apaga el servidor.`,
  async run(phone, msg, arg, complete) {

    let permiso = await this.model.tb_permisos.phonePathView(phone, module.exports.name);

    if (!permiso) return

    let [estado] = arg;

    let sendMsg = [];

    if (estado) {
      if (estado == 'on') {
        if (this.estado)
          sendMsg.push('👨‍🚀 EL servidor ya fue encendido');
        else {
          try {
            await this.listen();
            sendMsg.push('👨‍🚀 Servidor Encendido Exitosamente!');
          } catch (e) {
            sendMsg.push('👨‍🚀 ⚠ Ocurrio un error al intentar encender el servidor.', e.message, e.stack);
          }
        }
      }
      else if (estado == 'off') {
        if (this.estado) {
          try {
            await this.close();
            sendMsg.push('👨‍🚀 Servidor Apagado Exitosamente!');
          } catch (e) {
            sendMsg.push('👨‍🚀 ⚠ Ocurrio un error al intentar apagar el servidor.', e.message, e.stack);
          }
        }
        else
          sendMsg.push('👨‍🚀 EL servidor ya fue Apagado.');
      }
    }
    else
      sendMsg.push(
        '*Informacion del Servidor*',
        `Usuarios: ${this.socket.io.sockets.sockets.size}`
      )

    msg.reply(sendMsg.join('\n'));

    complete();
  }
}