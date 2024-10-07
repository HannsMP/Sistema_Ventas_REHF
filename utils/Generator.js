const { resolve } = require('path');
const mergeObjects = require("./function/merge");
const FileJSON = require("./FileJSON");
const Event = require("./Event");

const CHARACTERS = [
  { l: 10, v: '0123456789' },
  { l: 26, v: '!@#$%^&*()_+-=[]{}|;:,.<>?' },
  { l: 52, v: 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz' }
];

const RANDOM = num => Math.floor(Math.random() * num);

const GENERATE = (format, option) => format
  .split("")
  .map((w) => {
    if (w != ' ')
      return w;

    let type;
    do {
      type = RANDOM(3);
    } while (!option[type]);

    const { l, v } = CHARACTERS[type];
    return v[RANDOM(l)];
  })
  .join("");

const defaultOption = {
  numeric: false,
  letters: false,
  symbol: false
}

const defaultPathOption = {
  pathFile: resolve('.cache'),
  autoResetRun: true,
  autoSave: true,
  expire: 24 * 60 * 60 * 1000,
  exist: false
}

/** @template T */
class Generator extends FileJSON {
  /** 
   * @type {Event<{
   *   expire: string
   * }>} 
   */
  ev = new Event();
  /**
   * @param {string} format 
   * @param {defaultOption} option 
   * @param {defaultPathOption} pathOption 
   */
  constructor(format, option, pathOption) {
    defaultPathOption.exist = Boolean(pathOption);
    pathOption = mergeObjects(defaultPathOption, pathOption);
    super(pathOption.pathFile, pathOption.autoSave);
    this.pathOption = pathOption;

    if (pathOption.exist)
      if (this.pathOption.autoResetRun) this.writeJSON({});
      else this.#autoExpire();

    this.option = mergeObjects(defaultOption, option);
    this.format = format;

    if (format.constructor.name != 'String' || format.split(' ').length <= 1)
      throw new TypeError(`El parametro size debe ser un string o con campos ' ' vacios de 1 de lonjitud`);

    this.limit = format.length
      * (this.option.numeric ? CHARACTERS[0].l : 1)
      * (this.option.letters ? CHARACTERS[1].l : 1)
      * (this.option.symbol ? CHARACTERS[2].l : 1);

    if (this.limit <= 1)
      throw new Error(`Todas las opciones son falsas, seleccion una`);

    this.formatOption = [this.option.numeric, this.option.symbol, this.option.letters];
  }
  #autoExpire() {
    let json = this.readJSON();
    let now = Date.now()

    for (let key in json) {
      console.log(json[key]);
      if (this.pathOption.expire < (now - json[key].now))
        this.delete(key);
    }
  }
  #expire(key, time = this.pathOption.expire) {
    setTimeout(_ => {
      this.delete(key);
      this.ev.emit('expire', key)
    }, time)
  }
  /** @returns {boolean} */
  exist(key) {
    return this.readJSON().hasOwnProperty(key);
  }
  /** @param {T} data  */
  create(data, expire) {
    if (this.limit == 0)
      throw new Error(`Limite alcanzado`);

    let existKey = true, key;

    let json = this.readJSON();

    while (existKey) {
      key = GENERATE(this.format, this.formatOption);
      existKey = json.hasOwnProperty(key);
    }

    json[key] = { data, now: Date.now() };
    this.writeJSON(json);

    this.#expire(key, expire);

    this.limit--;
    return key;
  }
  /** @param {string} key @returns {T}  */
  read(key) {
    return this.readJSON()?.[key]?.data;
  }
  /** @param {string} key @param {T} data  @returns {boolean}  */
  update(key, data) {
    let json = this.readJSON();

    if (!json.hasOwnProperty(key))
      return false;

    json[key].data = data;
    this.writeJSON(json);

    this.limit++;
    return true;
  }
  /** @param {string} key @returns {boolean}  */
  delete(key) {
    let json = this.readJSON();

    if (!json.hasOwnProperty(key))
      return false;

    delete json[key];
    this.writeJSON(json);

    this.limit++;
    return true;
  }
  /** @param {(data:T, key:string, cache: {[key:string]:T})=>void} callback  */
  forEach(callback) {
    let json = this.this.readJSON();

    for (let key in json)
      callback(json[key].data, key, json);
  }
  /** @param {(data:T, key:string, cache: {[key:string]:T})=>boolean} callback @returns {T}  */
  find(callback) {
    let json = this.this.readJSON();

    for (let key in json) {
      let state = callback(json[key].data, key, json);
      if (state) return json[key].data;
    }
  }
  /** @param {(data:T, key:string, cache: {[key:string]:T})=>boolean} callback @returns {string}  */
  findKey(callback) {
    let json = this.readJSON();

    for (let key in json) {
      let state = callback(json[key].data, key, json);
      if (state) return key;
    }
  }
}

module.exports = Generator;