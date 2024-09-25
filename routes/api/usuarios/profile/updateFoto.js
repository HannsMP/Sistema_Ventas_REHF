const { resolve, extname, relative, join, basename } = require('path');
const multer = require('multer');
const sharp = require('sharp');

const fileHash = require('../../../../utils/function/fileHash');

const dirwork = resolve();
const dest = resolve('.cache', 'img');
const destSrc = resolve('src', 'resource', 'usuarios');
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

/** @typedef {Array.<(this: import('../../../../app'), req: import('express').Request, res: import('express').Response, next: import('express').NextFunction)=>void>} routeArr */
/** @type {{load:boolean, route:string, use: routeArr, get: routeArr, post: routeArr}} */
module.exports = {
  load: true,
  route: "/api/usuarios/profile/updateFoto",
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
        if (!req.file)
          return res.status(400).json({ err: 'Sin imagen por actualizar' })

        let { apiKey } = req.cookies;
        let apiData = this.cache.apiKey.read(apiKey);

        let { path, originalname } = req.file;
        let hash = fileHash(path);

        let dataFoto = await this.model.tb_fotos.readHash(hash);

        let OkPacket = {};
        let data = {};

        if (dataFoto) {
          data.id = dataFoto.id;
          data.src = dataFoto.src;
          data.src_small = dataFoto.src_small;
        }
        else {
          let baseFile = basename(path);
          let ext = extname(path).toLowerCase();

          let normalSizePath = join(destSrc, 'normal', baseFile + ext);
          await sharp(path).resize(500).toFile(normalSizePath);

          let smallSizePath = join(destSrc, 'small', baseFile + ext);
          await sharp(path).resize(50).toFile(smallSizePath);

          data.src = '/' + relative(dirwork, normalSizePath).replaceAll('\\', '/');
          data.src_small = '/' + relative(dirwork, smallSizePath).replaceAll('\\', '/');

          let dataFotos = await this.model.tb_fotos.insert({
            hash,
            tipo: ext,
            tabla: this.model.tb_usuarios.name,
            nombre: originalname,
            src: data.src,
            src_small: data.src_small
          });

          if (dataFotos.affectedRows)
            data.id = dataFotos.insertId;

          let { id } = apiData.usuario;
          OkPacket = await this.model.tb_usuarios.updateIdFotoId(Number(id), data.id);

          apiData.usuario.foto_id = data.id;
          apiData.usuario.foto_src = data.src;
          apiData.usuario.foto_src_small = data.src_small;

          this.cache.apiKey.update(apiKey, apiData);
        }

        res.status(200).json({ OkPacket, data })
      } catch (e) {
        this.responseErrorApi(req, res, next, e)
      }
    }
  ]
}