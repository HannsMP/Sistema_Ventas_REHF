const express = require('express');
const { resolve } = require('path')

/** @typedef {Array.<(this: import('../../app'), req: import('express').Request, res: import('express').Response, next: import('express').NextFunction)=>void>} routeArr */
/** @type {{load:boolean, route:string, use: routeArr, get: routeArr, post: routeArr}} */
module.exports = {
  load: true,
  route: "/src/private",
  use: [
    express.static(resolve('src', 'private')),
    function (req, res, next) {
      let { apiKey } = req.cookies;

      let existApikey = this.cache.apiKey.exist(apiKey);

      if (!existApikey)
        return res.status(401).json({ autorization: 'acceso denegado' });

      return next();
    }
  ]
}