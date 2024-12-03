/** @typedef {import('../app')} App  */
/** @typedef {(this: App, phone: string, msg: import('whatsapp-web.js').Message, arg: string[], complete: (err: Error?)=>void)=>void} Run */

/** @type {{[accion:string]: (file:import('../utils/File'), msg:import('whatsapp-web.js').Message, sendMsg:string[])=>void}} */
let accionDic = {
  '-p': (f, m, s) => {
    let t = f.readFile().split('\n').slice(0, 50);
    m.reply(t.join('\n'));
  },
  '-u': (f, m, s) => {
    let t = f.readFile().split('\n').slice(-50);
    m.reply(t.join('\n'));
  },
  '-l': (f, m, s) => {
    f.writeFile('');
    s.push('👨‍🚀 Se limpio correctamente.')
    m.reply(s.join('\n'));
  },
  '-f': (f, m, s) => {
    m.reply(
      s.join('\n'),
      { media: f.readFile(), mimetype: 'application/log', filename: f.property.name }
    );
  }
}

/** @type {{load: boolean, name: string, cooldown: number, onColldown: {}, run: Run}} */
module.exports = {
  load: true,
  name: 'log',
  cooldown: 30 * 1000,
  onColldown: {},
  description: `Permite controlar el los logs del dispositivo.
  Uso: */log [selector] [accion?]*
  selector:
    *success*: registros satisfactorios.
    *warning*: registros de advertencia.
    *error*: registros de errores.
    *system*: registros del sistema.
  accion:
    *-p*: devuelve las 50 primeras linas.
    *-u*: devuelve las 50 ultimas linas.
    *-l*: limpia el registro.`,
  async run(phone, msg, arg, complete) {

    let permiso = await this.model.tb_permisos.phonePathView(phone, module.exports.name);

    if (!permiso) return

    /** @type {['success'|'warning'|'error'|'system','-p'|'-u'|'-l'|'-f']} */
    let [selector, accion = '-f'] = arg;

    let selectorDic = {
      'success': this.logSuccess,
      'warning': this.logWarning,
      'error': this.logError,
      'system': this.logSystem
    }

    let sendMsg = [];

    if (!selectorDic.hasOwnProperty(selector))
      sendMsg.push(`No existe ese archivo Log: ${selector}`);

    else if (!accionDic.hasOwnProperty(accion))
      sendMsg.push(`La sintaxis de accion '${accion}' no existe`);

    else {
      try {
        let file = selectorDic[selector];
        accionDic[accion](file, msg, sendMsg);
        return complete();
      } catch {
        sendMsg.push('Ocurrio un Error al leer o escribir en el log', e.message, e.stack);
      }
    }

    msg.reply(sendMsg.join('\n'));
    complete();
  }
}