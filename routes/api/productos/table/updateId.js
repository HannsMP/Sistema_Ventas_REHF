const { resolve, extname, relative, join, basename } = require('path');
const multer = require('multer');
const sharp = require('sharp');

const fileHash = require('../../../../utils/function/fileHash');

const dirwork = resolve();
const dest = join(dirwork, '.temp', 'img');
const destSrc = join(dirwork, 'src', 'resource', 'productos');
const fileTypes = /jpeg|jpg|png|webp|tiff|gif|avif/;

const upload = multer({
  limits: { fileSize: 10 * 1024 * 1024 },
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, dest);
    },
    filename: (req, file, cb) => {
      cb(null, Date.now() + extname(file.originalname).toLowerCase());
    }
  }),
  fileFilter: (_, file, cb) => {
    const isExtname = fileTypes.test(extname(file.originalname).toLowerCase());
    const isMimetype = fileTypes.test(file.mimetype);

    if (isMimetype && isExtname)
      cb(null, true);
    else
      cb(new Error('Solo imágenes con extensiones JPEG, JPG, PNG, WebP, TIFF, GIF y AVIF son permitidas'));
  }
});


/** @typedef {import('../../../../app')} App */
/** @typedef {import('../../../../utils/SocketNode')} SocketNode */
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
  route: "/api/productos/table/updateId",
  post: [
    async function (req, res, next) {
      try {
        let session = this.cache.apiKey.read(req.cookies.apiKey);

        let permiso = await this.model.tb_permisos.userPathUpdate(session.usuario.id, module.exports.route);

        if (!permiso) return res.status(403).json({ err: 'Tu usuario no tiene Permisos para esta peticion.' });

        upload.single('foto_file')(req, res, next);
      } catch (e) {
        this.responseErrorApi(req, res, next, e)
      }
    },
    async function (req, res, next) {
      try {

        let {
          id,
          producto,
          descripcion,
          categoria_id,
          venta
        } = req.body,
          foto_id,
          src,
          src_small;

        if (req.file) {
          let { path, originalname } = req.file;

          let hash = fileHash(path);

          let dataFoto = await this.model.tb_fotos.readHash(hash);

          if (dataFoto) {
            foto_id = dataFoto.id;
            src = dataFoto.src;
            src_small = dataFoto.src_small;
          }
          else {
            let baseFile = basename(path);
            let ext = extname(path).toLowerCase();

            let normalSizePath = join(destSrc, 'normal', baseFile);
            await sharp(path).resize(500).toFile(normalSizePath);

            let smallSizePath = join(destSrc, 'small', baseFile);
            await sharp(path).resize(50).toFile(smallSizePath);

            src = '/' + relative(dirwork, normalSizePath).replaceAll('\\', '/');
            src_small = '/' + relative(dirwork, smallSizePath).replaceAll('\\', '/');

            let dataFotos = await this.model.tb_fotos.insert({
              hash,
              tipo: ext,
              tabla: this.model.tb_productos.name,
              nombre: originalname,
              src,
              src_small
            });

            foto_id = dataFotos.insertId;
          }
        }

        let OkPacket = await this.model.tb_productos.updateId(Number(id), {
          producto,
          descripcion,
          categoria_id: Number(categoria_id),
          venta: Number(venta),
          foto_id
        });

        res.status(200).json({ OkPacket })
      } catch (e) {
        this.responseErrorApi(req, res, next, e)
      }
    },
  ]
}