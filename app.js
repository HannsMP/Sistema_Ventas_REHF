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
const Socket = require('./controller/Socket');
const Model = require('./controller/Model');
const Cache = require('./controller/Cache');
const Bot = require('./controller/Bot');
const NeuralNetwork = require('./controller/NeuralNetwork');

/* Utils */
const Logger = require('./utils/Logger');
const System = require('./utils/System');
const Time = require('./utils/Time');
const File = require('./utils/File');

/* Error */
const DatabaseError = require('./utils/error/DataBase');
const QueryError = require('./utils/error/Query');
const ModelError = require('./utils/error/Model');

/** @typedef {(this: App, req: import('express').Request, res: import('express').Response, next: import('express').NextFunction)=>void} callbackRoute */
/** @typedef {{load:boolean, route:string, use:callbackRoute[], get:callbackRoute[], post:callbackRoute[], nodeRoute: (node: import('./utils/SocketNode'))=>void}} dataRoute */

class App {
  estado = false;
  cache = new Cache;

  /* Imports */
  system = new System;

  /** @type {Map<string, dataRoute>} */
  routesMap = new Map;

  /* Server */
  app = express();
  server = createServer(this.app);

  constructor() {
    this.socket = new Socket(this);
    this.model = new Model(this);

    this.nodeControl = this.socket.node.selectNode('/control', {
      collector: true,
      tagsName: true
    });

    this.neuralNetwork = new NeuralNetwork(this);

    /* Utils */
    this.time = new Time(0, "[YYYY/MM/DD hh:mm:ss tt]");
    this.logSuccess = new Logger(
      resolve('log', 'success.log'), this.time,
      { colorTime: 'brightGreen', colorLog: 'brightGreen', autoSave: true, emit: true, log: true },
      this
    );
    this.logWarning = new Logger(
      resolve('log', 'warn.log'), this.time,
      { colorTime: 'brightYellow', colorLog: 'brightYellow', autoSave: true, emit: true, log: true },
      this
    );
    this.logError = new Logger(
      resolve('log', 'error.log'), this.time,
      { colorTime: 'brightRed', colorLog: 'brightRed', autoSave: true, emit: true, log: true },
      this
    );

    this.bot = new Bot(this);

    this.logSystem = new File(
      this.cache.configJSON.readJSON().SYSTEM.loggerFile,
      { autoSave: true, extname: '.log', default: '' }
    )

    let net = this.system.getIPAddress();
    this.ip = net.ipv4;

    /* SERVER SETTINGS */
    this.app.set('case sensitive routing', true);
    this.app.set('view engine', 'ejs');
    this.app.set('layout', resolve('layout', 'control'));

    /* MIDDLEWARE */
    this.app.use(cookieParser());
    this.app.use(express.json());
    this.app.use(expressLayouts);
    this.app.use(express.urlencoded({ extended: true, limit: '10mb' }));
    this.app.use(session(this.cache.configJSON.readJSON().SESSION));

    // loads
    this._LoadRoutes();
  }

  /** @param {dataRoute} data */
  _Route(data) {
    if (data.constructor.name != 'Object') return;

    let { load, route, use, get, post, nodeRoute } = data;
    this.routesMap.set(route, data);

    if (!load) return;

    if (use?.constructor?.name == 'Array') {
      this.app.use(route, use.map(r => r.bind(this)));
      this.logSuccess.changeColor('brightWhite');
      this.logSuccess.writeStart(`[USE] Middle: http://${this.ip}:${this.cache.configJSON.readJSON().SERVER.port}${data.route} (${data.use.length})`);
    }

    if (get?.constructor?.name == 'Array') {
      this.app.get(route, get.map(r => r.bind(this)));
      this.logSuccess.changeColor('brightGreen');
      this.logSuccess.writeStart(`[GET] Routes: http://${this.ip}:${this.cache.configJSON.readJSON().SERVER.port}${data.route} (${data.get.length})`);
    }

    if (post?.constructor?.name == 'Array') {
      this.app.post(route, post.map(r => r.bind(this)));
      this.logSuccess.changeColor('brightBlue');
      this.logSuccess.writeStart(`[POST] Routes: http://${this.ip}:${this.cache.configJSON.readJSON().SERVER.port}${data.route} (${data.post.length})`);
    }

    if (typeof nodeRoute == 'object' || typeof nodeRoute == 'function') {
      let node = this.socket.node.selectNode(route, true);

      if (typeof nodeRoute == 'object')
        node?.setOption(nodeRoute);
      else
        nodeRoute.call(this, node);

      this.logSuccess.changeColor('brightYellow');
      this.logSuccess.writeStart(`[SKT] Routes: http://${this.ip}:${this.cache.configJSON.readJSON().SERVER.port}${data.route}`);
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
    let cnfg = this.cache.configJSON.readJSON();
    this.logSuccess.changeColor('brightCyan');

    let intervalId = setInterval(async () => {
      if (!this.model.estado && !await this.model._run()) return;

      // ready server
      if (cnfg.SERVER.autoRun)
        this.listen();

      // ready bot
      if (cnfg.BOT.autoRun)
        this.bot.on()

      clearInterval(intervalId);
    }, 1000)
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
      this.listener = this.server.listen(this.cache.configJSON.readJSON().SERVER.port, e => {
        if (e) return rej(e);
        this.logSuccess.writeStart(`[App] Listo: http://${this.ip}:${this.cache.configJSON.readJSON().SERVER.port}`);
        this.estado = true;
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
      this.estado = false;
      res();
    })
  }
}

module.exports = App;