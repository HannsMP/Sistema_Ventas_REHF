let Table = require('easy-table')

/** @typedef {import('../app')} App  */
/** @typedef {(this: App, phone: string, msg: import('whatsapp-web.js').Message, arg: string[], complete: (err: Error?)=>void)=>void} Run */

/** @type {{load: boolean, name: string, cooldown: number, onColldown: {}, run: Run}} */
module.exports = {
  load: true,
  name: 'asistencia',
  cooldown: 30 * 1000,
  onColldown: {},
  description: `Muestra las asistencias en forma de tabla, de usuario y hora.
  Uso: */asistencia [fecha]*
  fecha:
    * * : sin especificar muestra las asistencias del dia actual.
    *ayer*: muestra las asistencias de un dia anterior al actual.

    Para fecha espefica:
      _YYYY/MM/DD_: formato de fecha larga.
      _YY/MM/DD_: formato de fecha corta.
      _MM/DD_: considera el año como el actual.
      _DD_ considera el mes y año como el actual.`,
  async run(phone, msg, arg, complete) {
    let permiso = await this.model.tb_permisos.phonePathView(phone, module.exports.name);

    if (!permiso) return;

    let [dia] = arg;

    if (!dia)
      dia = this.time.format('YYYY/MM/DD');
    else if (dia == 'ayer')
      dia = this.time.format('YYYY/MM/DD', new Date(Date.now() - 24 * 60 * 60 * 1000));
    else if (/\d{2}/.test(dia)) {
      let date = new Date();
      date.setDate(dia);
      dia = this.time.format('YYYY/MM/DD', date);
    }
    else if (/\d{2}\/\d{2}/.test(dia))
      dia = this.time.format('YYYY/MM/DD', new Date(dia));
    else if (!/\d{4}\/\d{2}\/\d{2}/.test(dia))
      return;

    let listAsistencias = await this.model.tb_asistencias.readDate(dia);

    let msgString = [];

    if (listAsistencias.length) {
      msgString.push(`📅: ${dia}`, '');

      let t = new Table;

      for (let { usuario, creacion } of listAsistencias) {
        t.cell('USUARIO', usuario);
        t.cell('HORA', this.time.format('hh:mm tt', new Date(creacion)));
        t.newRow();
      }

      msgString.push('```' + t.toString() + '```');
    }
    else
      msgString.push('Sin datos')

    msg.reply(msgString.join('\n'));

    complete();
  }
}