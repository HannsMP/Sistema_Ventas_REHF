const { resolve, parse, join, normalize, dirname } = require('path');
const { existsSync, readdirSync } = require('fs');
const root = parse(resolve('/')).root;
const cdRegex = /cd\s+((\.{0,2}\/)?\S*)/;

/** @typedef {Array.<(this: import('../../../app'), req: import('express').Request, res: import('express').Response, next: import('express').NextFunction)=>void>} routeArr */
/** @type {{load:boolean, route:string, use: routeArr, get: routeArr, post: routeArr}} */
module.exports = {
  load: true,
  route: "/api/cmd/query",
  post: [
    async function (req, res, next) {
      try {
        let session = this.cache.apiKey.read(req.cookies.apiKey);

        let permiso = await this.model.tb_permisos.userPathAll(session.usuario.id, module.exports.route);

        if (!permiso.ver)
          return res.status(403).json({ err: 'Tu usuario no tiene Permisos para esta peticion.' });

        let {
          path = '/',
          command
        } = req.body;

        if (typeof path != 'string')
          return res.status(200).json({ path: root });;

        path = path.startsWith(root)
          ? normalize(path)
          : normalize(join(root, path));

        let data = {}

        if (typeof command == 'string' && command != "") {
          if (command.includes('rm') && !permiso.eliminar)
            return res.status(403).json({ errCmd: 'No tienes permisos para eliminar archivos.' });
          if (command.includes('mkdir') && !permiso.agregar)
            return res.status(403).json({ errCmd: 'No tienes permisos para crear directorios.' });
          if (command.includes('touch') && !permiso.editar)
            return res.status(403).json({ errCmd: 'No tienes permisos para modificar archivos.' });
          if (command.includes('cat') && !permiso.ver)
            return res.status(403).json({ errCmd: 'No tienes permisos para ver el contenido de archivos.' });

          let cdPath = path;
          for (const c of command.split(/&&|\|\|/)) {
            let match = cdRegex.exec(c);
            if (match) {
              let [_, cd] = match;

              cd = cd == '' ? root : cd;
              
              cdPath = normalize(join(cdPath, cd));

              if (!cdPath.startsWith(root) || !existsSync(cdPath))
                return res.status(200).json({ errCmd: `No existe el directorio: ${cd}`, path });
            }
          }

          let [result, execException, errCmd] = await this.system.cmd(`cd ${path} && ${command}`);
          data.result = result;
          data.execException = execException;
          data.errCmd = errCmd;

          if (command.includes('cd')) path = cdPath;
        }

        data.path = path;
        try {
          data.dir = readdirSync(path);
        } catch (error) {
          data.dir = readdirSync(dirname(path));
        }

        return res.status(200).json(data)
      } catch (e) {
        this.responseErrorApi(req, res, next, e)
      }
    },
  ]
}