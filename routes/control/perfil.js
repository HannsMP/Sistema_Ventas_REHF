const { resolve, relative, join, basename } = require('path');
const Upload = require('../../utils/Upload');

const dirwork = resolve();
const dest = join(dirwork, '.temp', 'img');
const destSrc = join(dirwork, 'src', 'resource', 'usuarios');

let upload = new Upload({
  directory: dest,
  validFormats: /jpeg|jpg|png|webp|tiff|gif|avif/
})

/** @typedef {import('../../app')} App */
/** @typedef {import('../../utils/SocketNode')} SocketNode */
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
  route: "/control/perfil",
  viewRenderPath: resolve('view', 'control', 'perfil.ejs'),
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

    /** @param {number} myId @param {Upload.DataUpdate} file @param {()=>void} res */
    let updateAvatarProfile = async (myId, file, res) => {
      try {
        let permiso = await this.model.tb_permisos.userPathUpdate(myId, module.exports.route);
        if (!permiso) return res('No tienes Permisos para actualizar el avatar de tu usuario.');

        let imagenData = upload.single(file);
        let imagenHash = imagenData.hash();

        let dataFoto = await this.model.tb_fotos.readHash(imagenHash);

        if (!dataFoto) {
          await imagenData.save();

          let baseFile = basename(imagenData.path);
          let ext = imagenData.ext;

          let normalSizePath = join(destSrc, 'normal', baseFile);
          let smallSizePath = join(destSrc, 'small', baseFile);

          let asyncNormal = imagenData.resize(normalSizePath, 500);
          let asyncSmall = imagenData.resize(smallSizePath, 50);

          await asyncNormal;
          await asyncSmall;

          let src = '/' + relative(dirwork, normalSizePath).replaceAll('\\', '/');
          let src_small = '/' + relative(dirwork, smallSizePath).replaceAll('\\', '/');

          let { insertId } = await this.model.tb_fotos.insert({
            hash: imagenHash,
            tipo: ext,
            tabla: this.model.tb_usuarios.name,
            nombre: imagenData.originalname,
            src_small,
            src
          });

          if (insertId)
            dataFoto = { id: insertId, src, src_small }
          else
            return res('Ocurrio un error, al crear la imagen.');
        }

        let result = await this.model.tb_usuarios.updateIdFotoId(myId, dataFoto.id, {
          id: dataFoto.id,
          src: dataFoto.src,
          src_small: dataFoto.src_small
        });

        if (result.affectedRows) res();
      } catch (e) {
        this.logError.writeStart(e.message, e.stack)
        res('Ocurrio un error, ponte en contacto con el administrador.');
      }
    }

    node.ev.on('connected', socket => {
      let myId = socket.session.usuario_id;

      socket.on('/updateAvatar/profile', updateAvatarProfile.bind(null, myId))
    })
  }
}