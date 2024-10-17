const File = require('./File');
const mergeObjects = require('./function/merge');

/** @typedef {{[key:string]:json}} Obj */
/** @typedef {string | Obj[] | Obj} json */

/** @template T */
class FileJSON extends File {
  #template;
  /**
   * @param {string} pathFile
   * @param {boolean} autoSave 
   * @param {T} template
   */
  constructor(pathFile, autoSave = true, template = {}) {
    super(pathFile, { autoSave, extname: '.json', default: JSON.stringify(template) })
    this.#template = template;
  }
  /** @param {keyof T} property?  */
  resetJSON(property) {
    let dataBefore = this.readJSON();
    let dataAfter = dataBefore;

    if (!property)
      dataAfter = mergeObjects(this.#template, dataBefore);

    else if (dataBefore.hasOwnProperty(property))
      dataAfter[property] = mergeObjects(this.#template[property], dataBefore[property]);

    else
      return false;

    this.writeJSON(dataBefore);
    return true;
  }
  /** @param {T} data  */
  writeJSON(data) {
    this.writeFile(JSON.stringify(data));
  }
  /** @returns {T} */
  readJSON() {
    return JSON.parse(this.readFile());
  }
}

module.exports = FileJSON;