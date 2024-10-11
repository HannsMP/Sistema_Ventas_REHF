const { readdirSync, readFileSync } = require('fs');
const { basename, resolve } = require('path');

/** @typedef {import('../app')} App  */
/** @typedef {(this: App, phone: string, msg: import('whatsapp-web.js').Message, arg: string[], complete: (err: Error?)=>void)} Run */

/** @type {{load: boolean, name: string, cooldown: number, onColldown: {}, run: Run}} */
module.exports = {
  load: true,
  name: 'db',
  cooldown: 5 * 1000,
  onColldown: {},
  description: `Permite controlar el estado de la base de datos. 
  Uso: */db [accion]*
  si no se especifica accion: calcula el tiempo de respuesta.
  accion:
    *backup*: retorna un archivo [.mysql].
    *restore*: requiere un archivo [.mysql], si no se especifica, se utilizará la última creada.`,
  async run(phone, msg, arg, complete) {

    let permiso = await this.model.tb_permisos.phonePathView(phone, module.exports.name);

    if (!permiso) return complete();

    /** @type {['backup'|'restore'|'ping']} */
    let [opciones] = arg;

    let sendMsg = [];

    if (opciones == 'backup') {
      try {
        let filePath = await this.model.backup();
        let fileName = basename(filePath);
        await msg.reply('👨‍🚀 Backup creado exitosamente!', { media: readFileSync(filePath), mimetype: 'application/sql', filename: fileName });
        sendMsg.push(this.time.format());
      } catch (e) {
        sendMsg.push('⚠ Ocurrió un error al intentar crear el backup.', e.message, e.stack);
      }
    } else if (opciones == 'restore') {
      let archivo = msg.attachments[0];
      if (archivo) {
        if (archivo.name.endsWith('.mysql')) {
          try {
            let filePath = resolve('cache', 'sql', archivo.name);
            await archivo.save(filePath);

            await this.model.restore(filePath);
            sendMsg.push('👨‍🚀 Restauración completada exitosamente!');
          } catch (e) {
            sendMsg.push('⚠ Ocurrió un error al intentar restaurar la base de datos.', e.message, e.stack);
          }
        } else {
          sendMsg.push('⚠ El archivo de restauración debe ser un archivo .mysql.');
        }
      } else {
        let dirBackupSql = resolve('.backup', 'sql');
        let lastBackup = readdirSync(dirBackupSql).sort().at(-1);
        if (lastBackup) {
          try {
            await this.model.restore(lastBackup);
            sendMsg.push('👨‍🚀 Restauración completada exitosamente!');
          } catch (e) {
            sendMsg.push('⚠ Ocurrió un error al intentar restaurar la base de datos.', e.message, e.stack);
          }
        } else {
          sendMsg.push('⚠ No se encontró un archivo de backup para restaurar.');
        }
      }
    } else {
      let timeBefore = process.hrtime();
      await this.model.pool('SELECT "1"');
      let timeAfter = process.hrtime(timeBefore);
      let interval = (timeAfter[0] * 1e9 + timeAfter[1]) / 1e6;
      sendMsg.push(`⏰ Ping: ${interval.toFixed(3)} ms`);
    }

    msg.reply(sendMsg.join('\n'));
    complete();
  }
};