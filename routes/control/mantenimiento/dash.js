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
  route: "/control/mantenimiento",
  viewRenderPath: resolve('view', 'control', 'mantenimiento', 'index.ejs'),
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
    
    /** @param {number} myId @param {()=>void} res */
    let cardProductos = async (myId, res) => {
      try {
        let permiso = await this.model.tb_permisos.userPathView(myId, '/control/mantenimiento/categorias');
        if (!permiso) return;

        let max_creacion = await this.model.tb_productos.cardLastCreation();
        let cantidad = await this.model.tb_productos.cardCount();
        let { label, data } = await this.model.tb_productos.chartCountProducs();

        res(
          cantidad,
          max_creacion,
          label,
          [data]
        )
      } catch (e) {

      }
    }

    /** @param {number} myId @param {()=>void} res */
    let cardCategorias = async (myId, res) => {
      try {
        let permiso = await this.model.tb_permisos.userPathView(myId, '/control/mantenimiento/inventario');
        if (!permiso) return;

        let max_creacion = await this.model.tb_categorias.cardLastCreation();
        let cantidad = await this.model.tb_categorias.cardCount();
        let { label, data } = await this.model.tb_categorias.chartCountCategory();

        res(
          cantidad,
          max_creacion,
          label,
          [data]
        )
      } catch (e) {

      }
    }

    /** @param {number} myId @param {()=>void} res */
    let cardClientes = async (myId, res) => {
      try {
        let permiso = await this.model.tb_permisos.userPathView(myId, '/control/mantenimiento/clientes');
        if (!permiso) return;

        let max_creacion = await this.model.tb_clientes.cardLastCreation();
        let cantidad = await this.model.tb_clientes.cardCount();
        let tipo_cliente = await this.model.tipo_cliente.chartCountTypeClient();
        let tipo_documento = await this.model.tipo_documento.chartCountTypeDocument();

        res(
          cantidad,
          max_creacion,
          [...tipo_cliente.label, ...tipo_documento.label],
          [[...tipo_cliente.data, ...tipo_documento.data]]
        )
      } catch (e) {

      }
    }

    /** @param {number} myId @param {()=>void} res */
    let cardProveedores = async (myId, res) => {
      try {
        let permiso = await this.model.tb_permisos.userPathView(myId, '/control/mantenimiento/proveedores');
        if (!permiso) return;

        let max_creacion = await this.model.tb_proveedores.cardLastCreation();
        let cantidad = await this.model.tb_proveedores.cardCount();
        let tipo_cliente = await this.model.tipo_proveedor.chartCountTypeProvider();
        let tipo_documento = await this.model.tipo_documento.chartCountTypeDocument();

        res(
          cantidad,
          max_creacion,
          [...tipo_cliente.label, ...tipo_documento.label],
          [[...tipo_cliente.data, ...tipo_documento.data]]
        )
      } catch (e) {
        this.logError.writeStart(e.message, e.stack)
      }
    }

    node.ev.on('connected', socket => {
      let myId = socket.session.usuario_id;

      socket.on('/dash/productos', cardProductos.bind(null, myId));
      socket.on('/dash/categorias', cardCategorias.bind(null, myId));
      socket.on('/dash/clientes', cardClientes.bind(null, myId));
      socket.on('/dash/proveedores', cardProveedores.bind(null, myId));
    })
  }
}