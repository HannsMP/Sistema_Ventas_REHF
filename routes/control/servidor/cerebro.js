const { resolve } = require('path');

/** @typedef {import('../../../app')} App */
/** @typedef {import('../../../utils/SocketNode')} SocketNode */
/** @typedef {Array.<(this: App, req: import('express').Request, res: import('express').Response, next: import('express').NextFunction)=>void>} routeArr */

/**
 * @type {{
 *   load:boolean,
 *   route:string,
 *   viewLayoutPath:string,
 *   viewRenderPath:string,
 *   viewErrorPath:string,
 *   use: routeArr,
 *   get: routeArr,
 *   post: routeArr,
 *   nodeRoute: {last:boolean, tagsName:boolean, collector:boolean} | (this: App, node: SocketNode)=>void
 * }}
*/
module.exports = {
  load: true,
  route: "/control/servidor/cerebro",
  viewRenderPath: resolve('view', 'control', 'servidor', 'cerebro.ejs'),
  viewErrorPath: resolve('view', 'error', '403.ejs'),
  get: [
    async function (req, res, next) {
      let session = this.cache.apiKey.read(req.cookies.apiKey);

      let userLayout = await this.model.tb_permisos.userLayoutAll(session.usuario.id);

      let permiso = userLayout[module.exports.route];

      if (!permiso.ver) return res.status(403).render(module.exports.viewErrorPath, { session, userLayout });

      session.permiso = permiso;

      res.render(module.exports.viewRenderPath, { session, userLayout });
    },
  ],
  nodeRoute: function (node) {
    node.setOption({
      last: true
    })

    /** @param {()=>void} res */
    let dataPrecioVenta = async (res) => {
      try {
        let save = this.neuralNetwork.precio_venta.fileJSON.readJSON();
        let ventas = await this.model.tb_productos.readSalePriceMax();
        for (let v of ventas)
          v.predictVenta = await this.neuralNetwork.precio_venta.predict(v.compra_prom)

        res(save, ventas);
      } catch (e) {
        this.logError.writeStart(e.message, e.stack)
      }
    }

    /** @param {number} myId @param {number} iterations @param {number} errorThresh @param {()=>void} res */
    let trainPrecioVenta = async (myId, iterations, errorThresh, res) => {
      try {
        let permiso = await this.model.tb_permisos.userPathUpdate(myId, module.exports.route);
        if (!permiso) return res('No tienes Permisos para controlar el entrenamiento de la red neuronal.');

        iterations = iterations == ''
          ? 0 : Number(iterations);

        errorThresh = errorThresh == '0.' || Number(errorThresh) == NaN
          ? 0 : Number(errorThresh);

        this.neuralNetwork.precio_venta.refresh(iterations, errorThresh);
      } catch (e) {
        this.logError.writeStart(e.message, e.stack)
      }
    }

    /** @param {number} precio_compra @param {()=>void} res */
    let predictPrecioVenta = async (precio_compra, res) => {
      try {
        let precio_venta = await this.neuralNetwork.precio_venta.predict(precio_compra)
        res(precio_venta);
      } catch (e) {
        this.logError.writeStart(e.message, e.stack)
      }
    }

    node.ev.on('connected', socket => {
      let myId = socket.session.usuario_id;
      socket.on('/data/precioVenta', dataPrecioVenta)
      socket.on('/train/precioVenta', trainPrecioVenta.bind(null, myId))
      socket.on('/predict/precioVenta', predictPrecioVenta)
    })
  }
}