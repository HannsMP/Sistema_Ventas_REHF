const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');

const { resolve, join } = require('path');
const { readdirSync } = require('fs');

const deletePath = require('../utils/function/deletePath');
const SocketRouter = require('../utils/SocketRouter');

/** @typedef {import('../app')} App  */
/** @typedef {(this: App, phone: string, msg: import('whatsapp-web.js').Message, arg: string[], complete: (err: Error?)=>void)=>void} Run */
/** @typedef {{use:number, load: boolean, name: string, cooldown: number, onColldown: {}, description:string, run: Run}} CommandFile */
/** @typedef {{[command: string]: CommandFile}} CollectionCommands */

class Bot {
  cacheSession = resolve('.cache', 'session');
  cacheWwebjs = resolve('.cache', 'wwebjs');

  #state = 'UNDEFINED';
  /** @type {CollectionCommands} */
  collection = {};
  /** @param {App} app  */
  constructor(app) {
    this.app = app;

    this.platform = app.system.platform();

    this.io = new SocketRouter([
      '/control/administracion/bot'
    ], app)

    /** @type {import('whatsapp-web.js').ClientOptions} */
    let clientOption = {
      authStrategy: new LocalAuth({ dataPath: resolve('.cache') }),
      webVersionCache: { path: resolve('.cache', 'wwebjs'), type: 'local', strict: false },
    }

    if (this.platform == 'linux')
      clientOption.puppeteer = { executablePath: '/usr/bin/chromium-browser' }

    this.client = new Client(clientOption);

    this._SetupEventHandlers();
  }
  _SetupEventHandlers() {

    this.client.on('auth_failure', async msg => {
      this.#state = 'AUTHENTICATION_FAILURE';
      this.io.emit('/bot/authFailure', msg);
    });

    this.client.on('ready', async () => {
      this.#state = 'CONNECTED';
      this.io.emit('/bot/ready', this.info());
      let log = this.app.logSuccess.writeStart('[Bot] listo');
      this.client.setStatus(log)
    });

    this.client.on('disconnected', async () => {
      this.io.emit('/bot/disconnected', this.info())
    });

    this.client.on('qr', (qr) => {
      qrcode.generate(qr, { small: true }, qrString => {
        console.log(qrString);
        this.io.emit('/bot/qr', qrString);
      });
    });

    this._LoadCommands();

    this.client.on('message', msg => {
      try {
        let { from, body } = msg;

        if (from.includes('@g.us')) return;

        let commandRegex = /^\/(\w+)(?:\s+(.*))?$/;
        /** @type {[string, string, string]} */
        let match = body.match(commandRegex);

        if (!match) return;

        let [, command, args] = match;

        let argumentsArray = args ? args.trim().split(/\s+/) : [];

        let [_, phone] = /^51(\d{9})@c.us$/.exec(from);

        if (!this.collection[command]) return;

        let data = this.collection[command];

        let { run, cooldown, onColldown } = data;

        let complete = err => {
          if (err) return msg.reply(msg);

          if (!cooldown) return;

          data.use++;
          this.io.emit('/bot/command/use', { command, use: data.use });
          onColldown[phone] = { start: Date.now(), intent: 1 };
          setTimeout(() => { delete onColldown[phone] }, cooldown);
        }

        if (onColldown[phone]) {
          if (3 < onColldown[phone].intent) return;
          let away = new Date(cooldown - (Date.now() - onColldown[phone].start));
          let mm = this.app.time.format('mm', away),
            ss = this.app.time.format('ss', away);

          let time = mm == '00' ? `${ss}s` : `${mm}m : ${ss}s`;

          msg.reply(`Esperar este comando se esta enfriando. \n⌛ ${time}`);

          return onColldown[phone].intent++;
        }

        run(phone, msg, argumentsArray, complete);
      } catch (e) {
        this.app.logError.writeStart(e.message, e.stack);
      }
    });
  }
  /** @param {CommandFile} data  */
  _Commands(data) {
    if (data.constructor.name != 'Object') return;

    let { load, name, cooldown, onColldown, description, run } = data;

    if (!load) return;

    this.collection[name] = { use: 0, load, name, cooldown, onColldown, description, run: run.bind(this.app) }
    this.app.logSuccess.changeColor('brightMagenta');
    this.app.logSuccess.writeStart(`[COMMAND] Command: /${name}`);
  }
  _LoadCommands(commandsDir = resolve('commands')) {
    let data = readdirSync(commandsDir);

    let fileJs = data.filter(f => f.endsWith('.js'));
    let folder = data.filter(f => !f.includes('.'));

    fileJs.forEach((f) => {
      f = join(commandsDir, f);
      this._Commands(require(f))
    });
    folder.forEach((f) => {
      f = join(commandsDir, f);
      this._LoadCommands(f)
    });
  }
  /**
   * @returns {
   * 'UNDEFINED' | 
   * 'READY'| 
   * 'PUPPETTER_ERROR'| 
   * 'CONNECTED'| 
   * 'DISCONNECTED'| 
   * 'LOGOUT'| 
   * 'AUTHENTICATING'| 
   * 'AUTHENTICATION_FAILURE'| 
   * 'UNDEFINED'
   * }
   */
  state() {
    return this.#state
  }
  info() {
    let state = this.state();

    let info = { state };

    if (state == 'CONNECTED') {
      let { wid, pushname } = this.client.info;
      info.name = pushname;
      info.phone = wid.user;
    }

    return info
  }
  async on() {
    await this.client.initialize();
    this.#state = 'AUTHENTICATING';
    this.io.emit('/bot/initialize');
  }
  async off() {
    await this.client.destroy();
    this.app.logSuccess.writeStart('[Bot] apagado');
    this.#state = 'DISCONNECTED';
    this.io.emit('/bot/destroy', this.info());
  }
  async logout() {
    await this.client.logout();
    deletePath(this.cacheSession);
    deletePath(this.cacheWwebjs);
    this.app.logSuccess.writeStart('[Bot] sesion cerrada');
    this.#state = 'LOGOUT';
    this.io.emit('/bot/logout', this.info());
  }
  sendMessage(phone, message) {
    if (!this.ready) return;
    if (!message || !phone || !/^\d{9}$/.test(String(phone))) return;
    this.client.sendMessage(`51${phone}@c.us`, message);
  }
}

module.exports = Bot;