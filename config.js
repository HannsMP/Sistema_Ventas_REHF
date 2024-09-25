let { networkInterfaces } = require('os');
let net = networkInterfaces();

let conecction = net["Ethernet"] || net["Ethernet 3"] || net["Wi-Fi"] || net['Ethernet 5'] || net['wlan0'];
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
    ip: (conecction?.[1] || conecction?.[0])?.address,
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