/** @typedef {import('../app')} App  */
/** @typedef {(this: App, phone: string, msg: import('whatsapp-web.js').Message, arg: string[], complete: (err: Error?)=>void)=>void} Run */

/** @type {{load: boolean, name: string, cooldown: number, onColldown: {}, run: Run}} */
module.exports = {
  load: true,
  name: 'config',
  cooldown: 2 * 1000,
  onColldown: {},
  description: `Permite controlar las configuraciones del servidor.
  Uso: */config [propiedades] =? [asignador] | lectura*
  si no se especifica accion: retorna informacion del servidor.
  accion:
    *start*: enciende el servidor.
    *restart*: reinicia el servidor.
    *stop*: apaga el servidor.`,
  async run(phone, msg, arg, complete) {

    let permiso = await this.model.tb_permisos.phonePathView(phone, module.exports.name);

    if (!permiso) return

    let [instancia, propiedades, asignador] = arg;
    let sendMsg = [];

    let dataConfig = this.cache.configJSON.readJSON();
    try {
      if (!dataConfig.hasOwnProperty(instancia))
        throw `No existe la propiedad principal ${instancia}`;

      let data = dataConfig[instancia];

      if (asignador) {
        propiedades.split('.').forEach((a, i, l) => {
          if (!data.hasOwnProperty(a))
            throw `En ${instancia}: no existe la propiedad ${a}`;

          if (i + 1 == l.length) {
            if (typeof data[a] == 'object')
              throw `No se puede asignar un valor a un objeto, accede a alguna propiedad.`;

            let parsedAsignador;
            if (asignador === 'true' || asignador === 'false')
              parsedAsignador = (asignador === 'true');
            else if (/^\d+$/.test(asignador))
              parsedAsignador = parseInt(asignador, 10);
            else
              parsedAsignador = asignador;

            data[a] = parsedAsignador;
            sendMsg.push(`config: ${instancia}.${propiedades} = ${JSON.stringify(data[a], null, 2)}`, JSON.stringify(data, null, 2))
          }
          else
            data = data[a];
        });

        this.cache.configJSON.writeJSON(dataConfig);
      } else {
        if (propiedades) {
          propiedades.split('.').forEach(a => {
            if (!data.hasOwnProperty(a))
              throw `En ${instancia}: no existe la propiedad ${a}`;
            data = data[a];
          });

          sendMsg.push(`config: ${instancia}.${propiedades}`, JSON.stringify(data, null, 2))
        } else {

          sendMsg.push(`config: ${instancia}`, JSON.stringify(data, null, 2))
        }
      }
    } catch (e) {
      sendMsg.push(e);
    }

    msg.reply(sendMsg.join('\n'));

    complete();
  }
}