const { resolve } = require('path');
const mergeObjects = require("./function/merge");
const FileJSON = require("./FileJSON");
const Event = require("./Event");
const Id = require("./Id");

/** 
 * @type {{
 *   numeric?: boolean,
 *   letters: boolean,
 *   symbol?: boolean,
 *   include?: string,
 *   exclude?: string,
 *   pathFile?: string,
 *   autoResetRun?: boolean,
 *   autoSave?: boolean,
 *   expire?: number,
 *   indexed?: string
 * }} 
 */
const GeneradorOption = {
  numeric: false,
  letters: true,
  symbol: false,
  include: '',
  exclude: '',
  pathFile: resolve('.cache'),
  autoResetRun: true,
  autoSave: true,
  expire: 24 * 60 * 60 * 1000,
  indexed: undefined
}

/** @template T */
class Generator extends Id {
  /** @type {Event<{expire: string}>} */
  ev = new Event();
  /**
   * @param {string} template 
   * @param {GeneradorOption} option 
   */
  constructor(template, option) {
    option = mergeObjects(GeneradorOption, option);
    super(template, option);
    this.option = option;

    /** @type {FileJSON<{[id:string]:{data:T, now:number}}>} */
    this.fs = new FileJSON(option.pathFile, option.autoSave);

    if (option.pathFile)
      if (option.autoResetRun) this.fs.writeJSON({});
      else this.#checkIfExpired();
  }
  #checkIfExpired() {
    let json = this.fs.readJSON();
    let now = Date.now()
    let save = 0;

    for (let key in json)
      if ((this.option.expire < (now - json[key].now))) {
        delete json[key];
        this.limit++;
        save++;
      }

    if (save)
      this.writeJSON(json);
  }
  #expire(key, time = this.option.expire) {
    setTimeout(_ => {
      this.delete(key);
      this.ev.emit('expire', key)
    }, time)
  }
  /** @returns {boolean} */
  exist(key) {
    return Object.hasOwn(this.fs.readJSON(), (key));
  }
  /** @param {T} data  */
  create(data, expire) {
    if (this.limit == 0)
      throw new Error(`Limite alcanzado`);

    let existKey = true, key;

    let json = this.fs.readJSON();

    while (existKey) {
      key = this.generate();
      existKey = Object.hasOwn(json, key);
    }

    json[key] = { data, now: Date.now() };
    this.fs.writeJSON(json);

    this.#expire(key, expire);

    this.limit--;
    return key;
  }
  /** @param {string} key @returns {T}  */
  read(key) {
    return this.fs.readJSON()?.[key]?.data;
  }
  /** @param {string} key @param {T} data  @returns {boolean}  */
  update(key, data) {
    let json = this.fs.readJSON();

    if (!json.hasOwnProperty(key))
      return false;

    json[key].data = data;
    this.fs.writeJSON(json);

    this.limit++;
    return true;
  }
  /** @param {string} key @returns {boolean}  */
  delete(key) {
    let json = this.fs.readJSON();

    if (!json.hasOwnProperty(key))
      return false;

    delete json[key];
    this.fs.writeJSON(json);

    this.limit++;
    return true;
  }
  /** @param {(data:T, key:string, cache: {[key:string]:T})=>void} callback  */
  forEach(callback) {
    let json = this.this.fs.readJSON();

    for (let key in json)
      callback(json[key].data, key, json);
  }
  /** @param {(data:T, key:string, cache: {[key:string]:T})=>boolean} callback @returns {T}  */
  find(callback) {
    let json = this.this.fs.readJSON();

    for (let key in json) {
      let state = callback(json[key].data, key, json);
      if (state) return json[key].data;
    }
  }
  /** @param {(data:T, key:string, cache: {[key:string]:T})=>boolean} callback @returns {string}  */
  findKey(callback) {
    let json = this.fs.readJSON();

    for (let key in json) {
      let state = callback(json[key].data, key, json);
      if (state) return key;
    }
  }
}

module.exports = Generator;