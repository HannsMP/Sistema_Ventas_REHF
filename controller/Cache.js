const Generador = require('../utils/Generator');
const FileJSON = require('../utils/FileJSON');
const { resolve } = require('path');

class Cache {
  config = new FileJSON(resolve('.cache', 'config', 'config.json'), true, {
    DATABASE: {
      autoRun: true,
      /** @type {import('mysql').PoolConfig} */
      owner: {
        connectionLimit: 2,
        host: 'localhost',
        user: 'root',
        password: '',
        database: 'rehf'
      },
      /** @type {import('mysql').PoolConfig} */
      production: {
        connectionLimit: 25,
        host: 'localhost',
        user: 'root',
        password: '',
        database: 'rehf'
      }
    },
    /** @type {import('express-session').SessionOptions} */
    SESSION: {
      secret: 'kassbduaciancuanca',
      resave: false,
      saveUninitialized: true,
      cookie: {
        maxAge: 60 * 60 * 1000
      }
    },
    SERVER: {
      autoRun: true,
      port: 80
    },
    APIKEY: {
      length: 7,
      option: {
        numeric: true,
        letters: true,
        symbol: false
      }
    },
    BOT: {
      autoRun: true
    },
    SHORTAPI: {
      host: 'https://shortlink-62uq.onrender.com/',
      token: 'js96HRPSHw8oBsxrO9zZhCUy8W8StFfMJxbCezDNDpDrMFCmWVtOdVRm4VEGSv6UvIWdBeRu8Nrjw40jqBN0a3BMxPeZAkjVrY3'
    },
    SYSTEM: {
      loggerFile: '/home/eliux/logs/server_cron_log.log'
    }
  });
  /** 
   * @type {Generador<{
   *   usuario: {
   *     id: Number,
   *     nombres: String,
   *     apellidos: String,
   *     usuario: String,
   *     clave: String,
   *     telefono: String,
   *     email: String,
   *     rol_id: Number,
   *     rol_nombre: string,
   *     foto_id: Number,
   *     foto_src: string,
   *     foto_src_small: string,
   *     creacion: String,
   *     estado: Number
   *   }
   * }>} 
   */
  apiKey = new Generador(
    '    -    -    -    ', // formato
    { letters: true, numeric: true, symbol: false }, // opciones
    {
      pathFile: resolve('.cache', 'memory', 'apikey.json'),
      expire: 24 * 60 * 60 * 1000,
      autoResetRun: true,
      autoSave: true
    }
  );
  /** 
   * @type {Generador<{
   *   phone: string
   * }>} 
   */
  codeRecovery = new Generador(
    '      ', // formato
    { letters: false, numeric: true, symbol: false }, // opciones
    {
      pathFile: resolve('.cache', 'memory', 'codeRecovery.json'),
      expire: 5 * 60 * 1000,
      autoResetRun: false,
      autoSave: true
    }
  );
}

module.exports = Cache;