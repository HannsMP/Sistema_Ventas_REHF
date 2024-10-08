/* Servers */
const { createServer } = require('http');
const express = require('express');

const expressLayouts = require('express-ejs-layouts');
const cookieParser = require('cookie-parser');
const session = require('express-session');

/* Utils */
const { resolve, join } = require('path');
const { readdirSync } = require('fs');

/* Controllers */
const Socket = require('./controller/Socket')
const Model = require('./controller/Model');
const Cache = require('./controller/Cache');
const Bot = require('./controller/Bot');
const NeuralNetwork = require('./controller/NeuralNetwork');

/* Utils */
const { ModelError, QueryError, DatabaseError } = require('./utils/UtilsModel');
const ShortUrl = require('./utils/ShortUrl');
const Logger = require('./utils/Logger');
const System = require('./utils/System');
const Time = require('./utils/Time');


class App {
  estado = 0;
  /* Utils */
  time = new Time(0, "[YYYY/MM/DD hh:mm:ss tt]");
  logSuccess = new Logger(
    resolve('log', 'success.log'), this.time,
    { colorTime: 'brightGreen', colorLog: 'brightGreen', autoSave: true, emit: true, log: true },
    this
  );
  logWarning = new Logger(
    resolve('log', 'warn.log'), this.time,
    { colorTime: 'brightYellow', colorLog: 'brightYellow', autoSave: true, emit: true, log: true },
    this
  );
  logError = new Logger(
    resolve('log', 'error.log'), this.time,
    { colorTime: 'brightRed', colorLog: 'brightRed', autoSave: true, emit: true, log: true },
    this
  );

  cache = new Cache;

  /* Imports */
  config = require('./config');

  /* Server */
  app = express();
  server = createServer(this.app);
  socket = new Socket(this);
  model = new Model(this);
  neuralNetwork = new NeuralNetwork(this);

  bot = new Bot(this);

  system = new System;
  shortUrl = new ShortUrl(this.config.SHORTAPI);

  routesMap = new Map;
  constructor() {
    /* SERVER SETTINGS */
    this.app.set('case sensitive routing', true);
    this.app.set('view engine', 'ejs');
    this.app.set('layout', resolve('layout', 'control'));

    /* MIDDLEWARE */
    this.app.use(cookieParser());
    this.app.use(express.json());
    this.app.use(expressLayouts);
    this.app.use(express.urlencoded({ extended: true, limit: '10mb' }));
    this.app.use(session(this.config.SESSION));

    // loads
    this._LoadRoutes();
  }

  /** @typedef {(this: App, req: import('express').Request, res: import('express').Response, next: import('express').NextFunction)=>void} callbackRoute */
  /** @param {{load:boolean, route:string, use:callbackRoute[], get:callbackRoute[], post:callbackRoute[], nodeRoute: (node: import('./utils/SocketNode'))=>void}} data*/
  _Route(data) {
    if (data.constructor.name != 'Object') return;

    let { load, route, use, get, post, nodeRoute } = data;
    this.routesMap.set(route, data);

    if (!load) return;

    if (use?.constructor?.name == 'Array') {
      this.app.use(route, use.map(r => r.bind(this)));
      this.logSuccess.changeColor('brightWhite');
      this.logSuccess.writeStart(`[USE] Middle: http://${this.config.SERVER.ip}:${this.config.SERVER.port}${data.route} (${data.use.length})`);
    }

    if (get?.constructor?.name == 'Array') {
      this.app.get(route, get.map(r => r.bind(this)));
      this.logSuccess.changeColor('brightGreen');
      this.logSuccess.writeStart(`[GET] Routes: http://${this.config.SERVER.ip}:${this.config.SERVER.port}${data.route} (${data.get.length})`);
    }

    if (post?.constructor?.name == 'Array') {
      this.app.post(route, post.map(r => r.bind(this)));
      this.logSuccess.changeColor('brightBlue');
      this.logSuccess.writeStart(`[POST] Routes: http://${this.config.SERVER.ip}:${this.config.SERVER.port}${data.route} (${data.post.length})`);
    }

    if (nodeRoute) {
      this.socket.node.ev.on('nodeCreate', node => node.path == route && nodeRoute.call(this, node))
    }
  }

  _LoadRoutes(routesDir = resolve('routes')) {
    let data = readdirSync(routesDir);

    let fileJs = data.filter(f => f.endsWith('.js'));
    let folder = data.filter(f => !f.includes('.'));

    fileJs.forEach((f) => {
      f = join(routesDir, f);
      this._Route(require(f))
    });
    folder.forEach((f) => {
      f = join(routesDir, f);
      this._LoadRoutes(f)
    });
  }

  async _Run() {
    this.logSuccess.changeColor('brightCyan');
    // ready sql
    await this.model.pool('select "1"');
    this.logSuccess.writeStart(`[Sql] http://localhost/phpmyadmin/`);

    // ready server
    await this.listen();

    // ready bot
    if (this.config.BOT.autoRun)
      this.bot.on()
  }

  responseErrorApi(req, res, next, e) {
    if (e instanceof ModelError || e instanceof QueryError || e instanceof DatabaseError)
      this.logError.writeStart(e.log());
    else
      this.logError.writeStart(e.message, e.stack);

    // Internal Server Error
    if (e?.clienteMessage) res.status(500).json({ err: e.clienteMessage })
  }

  listen() {
    return new Promise((res, rej) => {
      if (this.estado) return res();
      this.listener = this.server.listen(this.config.SERVER.port, e => {
        if (e) return rej(e);
        this.logSuccess.writeStart(`[App] http://${this.config.SERVER.ip}:${this.config.SERVER.port}`);
        this.estado = 1;
        res();
      })
    })
  }
  close() {
    return new Promise(res => {
      if (!this.estado) return res();
      this.socket.io.close();
      this.listener.close();
      this.listener.closeAllConnections();
      this.listener.closeIdleConnections();
      this.logSuccess.writeStart(`[App] close`);
      this.estado = 0;
      res();
    })
  }
}

module.exports = App;