/** @typedef {import('../app')} App  */
/** @typedef {(this: App, phone: string, msg: import('whatsapp-web.js').Message, arg: string[], complete: (err: Error?)=>void)=>void} Run */

/** @type {{load: boolean, name: string, cooldown: number, onColldown: {}, run: Run}} */
module.exports = {
  load: true,
  name: 'pi',
  cooldown: 5 * 1000,
  onColldown: {},
  description: `Permite controlar el estado del dispositivo.
  Uso: */pi [accion?] [force?]*
  si no se especifica accion: retorna informacion del dispositivo.
  accion:
    *poweroff*: apaga el sistema, ¿lo encenderas manualmente?.
    *reboot*: reinicia el sistema, Es bueno refrescar la memoria!.
  force:
    *-y*: reinicia el dispositivo.`,
  async run(phone, msg, arg, complete) {

    let permiso = await this.model.tb_permisos.phonePathView(phone, module.exports.name);

    if (!permiso) return

    let platform = this.system.platform();

    if (platform == 'linux') {
      /** @type {['poweroff'|'reboot', '-y']} */
      let [accion, force] = arg;

      force = force == '-y';

      if (accion == 'poweroff') {
        let msgCurrent = await msg.reply(
          force
            ? 'Iniciando apagado...'
            : 'Iniciando apagado forzado...'
        );
        complete();

        this.system.powerOff(force);

        setTimeout(() => {
          msgCurrent.edit('⚠ El proceso fallo.');
        }, 5000);
      }
      else if (accion == 'reboot') {
        let msgCurrent = await msg.reply(
          force
            ? 'Iniciando reinicio...'
            : 'Iniciando reinicio Forzado...'
        );
        complete();

        this.system.reboot(force);

        setTimeout(() => {
          msgCurrent.edit('⚠ El proceso fallo.');
        }, 5000);
      }
    }
    else {
      let cpuInfo = this.system.os.cpus();
      let usageInfo = this.system.uptime();
      let totalMemory = (this.system.os.totalmem() / 1024 / 1024 / 1024).toFixed(2); // GB
      let freeMemory = (this.system.os.freemem() / 1024 / 1024 / 1024).toFixed(2);

      let PdiskInfo = this.system.fsSize();
      let PnetStats = this.system.networkStats();
      let PosData = this.system.osinfo();

      let diskInfo = await PdiskInfo;
      let netStats = await PnetStats;
      let osData = await PosData;

      let sendMsg = [];

      sendMsg.push("🖥️ **Información del Equipo** 🖥️",
        "--------------------------------",
        `🔍 **Procesador**: ${cpuInfo[0].model}`,
        `💾 **Número de Núcleos**: ${cpuInfo.length}`,
        `🚀 **Velocidad del Procesador**: ${cpuInfo[0].speed} MHz`,
        `🕒 **Tiempo de Uso**: ${Math.floor(usageInfo / 60)} minutos`,
        `💻 **Uso del Sistema**: ${this.system.os.loadavg().map(load => load.toFixed(2)).join(', ')}`,
        "",
        "🔋 **Memoria RAM**",
        `    - Total: ${totalMemory} GB`,
        `    - Libre: ${freeMemory} GB`,
        "",
        "📀 **Información de Discos**"
      );

      diskInfo
        .map(disk => sendMsg.push(
          `- Total: ${(disk.size / 1024 / 1024 / 1024).toFixed(2)} Gb`,
          `- Libre: ${(disk.available / 1024 / 1024 / 1024).toFixed(2)} Gb`
        ))
      sendMsg.push(
        "",
        "🌐 **Información de Red**"
      );

      netStats.forEach(net => {
        sendMsg.push(`  - Interfaz de Red (${net.iface}):`);
        sendMsg.push(`    - Bytes Recibidos: ${(net.rx_bytes / 1024 / 1024).toFixed(2)} MB`);
        sendMsg.push(`    - Bytes Enviados: ${(net.tx_bytes / 1024 / 1024).toFixed(2)} MB`);
        sendMsg.push(`    - Velocidad de Transmisión: ${net.tx_sec} Bytes/s`);
        sendMsg.push(`    - Velocidad de Recepción: ${net.rx_sec} Bytes/s`);
      });

      sendMsg.push("");
      sendMsg.push("🖥️ **Sistema Operativo**");
      sendMsg.push(`  - Distribución: ${osData.distro}`);
      sendMsg.push(`  - Versión: ${osData.release}`);
      sendMsg.push(`  - Arquitectura: ${osData.arch}`);
      sendMsg.push("--------------------------------");

      msg.reply(sendMsg.join('\n'));
    }
  }
}