const express = require('express');
const { resolve } = require('path')

/** @typedef {Array.<(this: import('../../app'), req: import('express').Request, res: import('express').Response, next: import('express').NextFunction)=>void>} routeArr */
/** @type {{load:boolean, route:string, use: routeArr, get: routeArr, post: routeArr}} */
module.exports = {
  load: true,
  route: "/src/public",
  use: [
    express.static(resolve('src', 'public'))
  ]
}