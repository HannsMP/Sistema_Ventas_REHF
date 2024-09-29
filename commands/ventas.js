let Table = require('easy-table')

/** @typedef {import('../app')} App  */
/** @typedef {(this: App, phone: string, msg: import('whatsapp-web.js').Message, arg: string[], complete: (err: Error?)=>void)=>void} Run */

/** @type {{load: boolean, name: string, cooldown: number, onColldown: {}, run: Run}} */
module.exports = {
  load: true,
  name: 'ventas',
  cooldown: 30 * 1000,
  onColldown: {},
  description: `Muestra las ventas hechas en forma de tabla, con calculo de descriptivo. 
  Uso: */ventas [fecha]* 
  fecha: 
    * *: sin especificar muestra las ventas del dia actual.
    *ayer*: muestra las ventas de un dia anterior al actual.

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
    else if (/^(\d{2}|\d{1})$/.test(dia)) {
      let date = new Date();
      date.setDate(dia);
      dia = this.time.format('YYYY/MM/DD', date);
    }
    else if (/^(\d{2}|\d{1})\/(\d{2}|\d{1})$/.test(dia)) {
      let [_, m, d] = /^(\d{2}|\d{1})\/(\d{2}|\d{1})$/.exec(dia);
      let dateCalc = new Date();
      dateCalc.setDate(Number(d));
      dateCalc.setMonth(Number(m));
      dia = this.time.format('YYYY/MM/DD', dateCalc);
    }
    else if (!/^(\d{4}|\d{2})\/(\d{2}|\d{1})\/(\d{2}|\d{1})$/.test(dia))
      return;

    let total = 0;
    let descuento_total = 0;

    let listTransacciones = await this.model.tb_transacciones_ventas.readDate(dia);

    let sendMsg = [];

    if (listTransacciones.length) {
      sendMsg.push(`📅: ${dia}`, '');

      for (let { id, usuario, codigo, creacion, importe_total, descuento, } of listTransacciones) {
        let t = new Table;

        let listVentas = await this.model.tb_ventas.readBusinessJoinId(id);

        listVentas.forEach(venta => {
          t.cell('#', venta.cantidad);
          t.cell('CODIGO', venta.producto_codigo);
          t.cell('PRECIO', venta.importe.toFixed(2));
          t.newRow();
        })

        t.cell('CODIGO', 'TOTAL');
        t.cell('PRECIO', importe_total.toFixed(2));
        t.newRow();

        sendMsg.push(`\t*${codigo}*`)
        sendMsg.push('```' + `⏰ ${this.time.format('hh:mm tt', new Date(creacion))} | 👨‍🚀 ${usuario}` + '```')
        sendMsg.push('```' + t.toString() + '```');

        total += importe_total;
        descuento_total += descuento;
      }

      sendMsg.push(`*TOTAL*: s/ ${total.toFixed(2)}`);
      sendMsg.push(`*DESCUENTO*: s/ ${descuento_total.toFixed(2)}`)
    }
    else
      sendMsg.push('Sin datos')

    msg.reply(sendMsg.join('\n'));

    complete();
  }
}