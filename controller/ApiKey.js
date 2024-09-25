let random = (num) => Math.floor(Math.random() * num);

/** 
 * @typedef {{
 *   id: Number,
 *   nombres: String,
 *   apellidos: String,
 *   usuario: String,
 *   clave: String,
 *   telefono: String,
 *   email: String,
 *   rol_id: Number,
 *   rol_nombre: string,
 *   foto_id: Number,
 *   foto_src: string,
 *   creacion: String,
 *   estado: Number
 * }} data_Usuario
 */

/**
 * @typedef {{
 *   usuario: data_Usuario
 * }} Memory
 */

class Apikey {
  #characters = [
    { l: 10, v: '0123456789' },
    { l: 26, v: '!@#$%^&*()_+-=[]{}|;:,.<>?' },
    { l: 52, v: 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz' }
  ];
  #limit = 13520;
  #cache = {};
  #format = "";
  #option = [];
  /**
   * @param { number | string } size
   * @param {{ numeric: boolean, letters: boolean, symbol: boolean }} option 
   */
  constructor(size = 1, option = { numeric: true, letters: true, symbol: true }) {
    if (size.constructor.name == 'Number')
      this.#format = " ".repeat(size);

    else if (size.constructor.name == 'String')
      this.#format = size;
    else
      throw new TypeError(`El parametro size no es ni un number ni un string`);

    let { numeric, symbol, letters } = option;

    this.#option = [numeric, symbol, letters];

    this.#limit
      = this.#format.length
      * (numeric ? this.#characters[0].l : 1)
      * (symbol ? this.#characters[2].l : 1)
      * (letters ? this.#characters[1].l : 1);

    if (this.#limit == 1)
      throw new Error(`Todas las opciones son falsas, seleccion una`);
  }
  #generate() {
    let result = this.#format
      .split("")
      .map((w) => {
        if (w != ' ')
          return w;

        let type;
        do {
          type = random(3);
        } while (!this.#option[type]);

        const { l, v } = this.#characters[type];
        return v[random(l)];
      });

    return result.join("");
  }
  exist(api) {
    return this.#cache.hasOwnProperty(api);
  }
  /** @returns {Memory}  */
  read(api) {
    return this.#cache[api];
  }
  /** @param {Memory} memory  */
  create(memory) {
    if (this.#limit === 0)
      throw new Error(`Limite alcanzado`);

    let exist = true,
      key;
      
    while (exist) {
      key = this.#generate();
      exist = this.exist(key);
    }

    this.#cache[key] = memory;
    this.#limit--;
    return key;
  }
  delete(api) {
    if (!this.exist(api))
      return false;

    delete this.#cache[api];
    this.#limit++;
    return true;
  }
  /** @param {(data: Memory, api: string, global: {[api:string]: Memory})=>void} callback  */
  forEach(callback) {
    for (let api in this.#cache)
      callback(this.#cache[api], api, this.#cache);
  }
  /** @param {(data: Memory, api: string, global: {[api:string]: Memory})=>boolean} callback  */
  find(callback) {
    for (let api in this.#cache) {
      let state = callback(this.#cache[api], api, this.#cache);
      if (state) return this.#cache[api];
    }
  }
  /** @param {(data: Memory, api: string, global: {[api:string]: Memory})=>boolean} callback  */
  findApi(callback) {
    for (let api in this.#cache) {
      let state = callback(this.#cache[api], api, this.#cache);
      if (state) return api;
    }
  }
}

module.exports = Apikey;