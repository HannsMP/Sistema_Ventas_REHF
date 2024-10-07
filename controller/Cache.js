const Generador = require('../utils/Generator');
const { resolve } = require('path');

class Cache {
  /** 
   * @type {Generador<{
   *   usuario: {
   *     id: Number,
   *     nombres: String,
   *     apellidos: String,
   *     usuario: String,
   *     clave: String,
   *     telefono: String,
   *     email: String,
   *     rol_id: Number,
   *     rol_nombre: string,
   *     foto_id: Number,
   *     foto_src: string,
   *     foto_src_small: string,
   *     creacion: String,
   *     estado: Number
   *   }
   * }>} 
   */
  apiKey = new Generador(
    '    -    -    -    ', // formato
    { letters: true, numeric: true, symbol: false }, // opciones
    {
      pathFile: resolve('.cache', 'memory', 'apikey.json'),
      expire: 24 * 60 * 60 * 1000,
      autoResetRun: true,
      autoSave: true
    }
  );
  /** 
   * @type {Generador<{
   *   phone: string
   * }>} 
   */
  codeRecovery = new Generador(
    '      ', // formato
    { letters: false, numeric: true, symbol: false }, // opciones
    {
      pathFile: resolve('.cache', 'memory', 'codeRecovery.json'),
      expire: 5 * 60 * 1000,
      autoResetRun: false,
      autoSave: true
    }
  );
}

module.exports = Cache;