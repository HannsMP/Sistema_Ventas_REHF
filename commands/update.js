/** @typedef {import('../app')} App  */
/** @typedef {(this: App, phone: string, msg: import('whatsapp-web.js').Message, arg: string[], complete: (err: Error?)=>void)=>void} Run */

/** @type {{load: boolean, name: string, cooldown: number, onColldown: {}, run: Run}} */
module.exports = {
  load: true,
  name: 'update',
  cooldown: 5 * 60 * 1000,
  onColldown: {},
  description: `Actualiza el sistema git a la ultima version del git remoto.
  Uso: */update *`,
  async run(phone, msg, arg, complete) {
    let permiso = await this.model.tb_permisos.phonePathView(phone, module.exports.name);
    if (!permiso) return

    let msgCurrent = await msg.reply('Iniciando actualizacion remota...');
    complete();

    await this.system.cmd('(cd /home/eliux/servidor && ping -c 1 google.com && git fetch origin && git reset --hard origin/main) >> /home/eliux/logs/server_cron_log.log 2>&1');
    await this.system.reboot();

    setTimeout(() => {
      msgCurrent.edit('⚠ El proceso fallo.');
    }, 60 * 1000);
  }
}