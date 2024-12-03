/** @typedef {import('../app')} App  */
/** @typedef {(this: App, phone: string, msg: import('whatsapp-web.js').Message, arg: string[], complete: (err: Error?)=>void)=>void} Run */

/** @type {{load: boolean, name: string, cooldown: number, onColldown: {}, run: Run}} */
module.exports = {
  load: true,
  name: 'recuperar',
  cooldown: 5 * 60 * 1000,
  onColldown: {},
  description: `Envia un codigo de verificacion para recupera tu cuenta, por razones de seguridad para recuperarla se tiene que hacer la solicitud desde el numero registrado,
  ¿cambiaste numero? ponte en contacto con el administrador
  Uso: */recuperar*
  No tiene parametros`,
  async run(phone, msg, arg, complete) {
    let permiso = await this.model.tb_permisos.phonePathView(phone, module.exports.name);

    if (!permiso) return

    let code = this.cache.codeRecovery.create({ phone });

    let msgCurrent = await msg.reply(`Tu codigo de recuperacion es: '${code}'`);

    this.cache.codeRecovery.ev.on('expire', c => {
      if (c != code) return;
      msgCurrent.edit(`El codigo Caduco`);
    }, { once: true });

    complete();
  }
}