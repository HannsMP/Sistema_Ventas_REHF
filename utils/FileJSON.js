const File = require('./File');

/** @typedef {{[key:string]:json}} Obj */
/** @typedef {string | Obj[] | Obj} json */

/** @template T */
class FileJSON extends File {
  /**
   * @param {string} pathFile
   * @param {boolean} autoSave 
   * @param {T} template
   */
  constructor(pathFile, autoSave = true, template = {}) {
    super(pathFile, { autoSave, extname: '.json', default: JSON.stringify(template) })
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