module.exports = {
  /** @type {import('mysql').PoolConfig} */
  MYSQL: {
    connectionLimit: 10,
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'rehf'
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
    port: 3000,
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
  }
}