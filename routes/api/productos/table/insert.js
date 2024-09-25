const { resolve, basename, extname, relative, join } = require('path');
const multer = require('multer');
const sharp = require('sharp');

const fileHash = require('../../../../utils/function/fileHash');

const dirwork = resolve();
const dest = join(dirwork, '.cache', 'img');
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
  },
});

/** @typedef {Array.<(this: import('../../../../app'), req: import('express').Request, res: import('express').Response, next: import('express').NextFunction)=>void>} routeArr */
/** @type {{load:boolean, route:string, use: routeArr, get: routeArr, post: routeArr}} */
module.exports = {
  load: true,
  route: "/api/productos/table/insert",
  post: [
    async function (req, res, next) {
      try {
        let session = this.cache.apiKey.read(req.cookies.apiKey);

        let permiso = await this.model.tb_permisos.userPathAdd(session.usuario.id, module.exports.route);

        if (!permiso) return res.status(403).json({ err: 'Tu usuario no tiene Permisos para esta peticion.' });

        upload.single('foto_file')(req, res, next);
      } catch (e) {
        this.responseErrorApi(req, res, next, e)
      }
    },
    async function (req, res, next) {
      try {

        let {
          producto,
          descripcion,
          compra,
          venta,
          categoria_id,
          estado
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

            let normalSizePath = join(destSrc, 'normal', baseFile + ext);
            await sharp(path).resize(500).toFile(normalSizePath);

            let smallSizePath = join(destSrc, 'small', baseFile + ext);
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

        categoria_id = Number(categoria_id)

        let codigo = await this.model.tb_productos.getCodigo();

        let OkPacket = await this.model.tb_productos.insert({
          codigo,
          producto,
          descripcion,
          compra: Number(compra),
          venta: Number(venta),
          categoria_id: categoria_id,
          estado: Number(estado),
          foto_id,
        });

        res.status(200).json({ OkPacket, codigo })
      } catch (e) {
        this.responseErrorApi(req, res, next, e)
      }
    },
  ]
}