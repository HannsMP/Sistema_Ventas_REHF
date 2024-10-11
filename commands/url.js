/** @typedef {import('../app')} App  */
/** @typedef {(this: App, phone: string, msg: import('whatsapp-web.js').Message, arg: string[], complete: (err: Error?)=>void)=>void} Run */

/** @type {{load: boolean, name: string, cooldown: number, onColldown: {}, run: Run}} */
module.exports = {
  load: true,
  name: 'url',
  cooldown: 30 * 1000,
  onColldown: {},
  description: `Muestra la url en la cual el servidor esta alojado, si esperas un poco puede que te envie un link enriquesido. 
  Uso: */url*
  No tiene parametros`,
  async run(phone, msg, arg, complete) {
    let permiso = await this.model.tb_permisos.phonePathView(phone, module.exports.name);

    if (!permiso) return

    let originalUrl = `http://${this.ip}:${this.cache.config.readJSON().SERVER.port}`;

    let msgCurrent = await msg.reply(originalUrl);

    complete();

    let shortUrl = await this.shortUrl.insert(originalUrl);

    msgCurrent.edit(this.shortUrl.join(shortUrl));
  }
}