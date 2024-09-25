const { readFileSync, writeFileSync, mkdirSync, existsSync, statSync } = require('fs');
const { isAbsolute, extname, dirname, parse, resolve } = require('path');
const mergeObjects = require('./function/merge');

const defaultOption = {
  autoSave: true,
  extname: 'ext?',
  default: ''
}

class File {
  #pathFile;
  #option;
  /** @param {string} pathFile @param {defaultOption} option  */
  constructor(pathFile, option) {
    this.#option = mergeObjects(defaultOption, option);

    if (isAbsolute(pathFile))
      this.#pathFile = pathFile;
    else
      this.#pathFile = resolve(pathFile);

    if (extname(pathFile).toLowerCase() != this.#option.extname)
      throw new Error(`Formate del archivo válido. Asegúrese de que la extencion sea ${this.#option.extname}`);

    this.property = parse(this.#pathFile)

    this.#ensuringExist();
  }
  #ensuringExist() {
    if (existsSync(this.#pathFile)) return true;
    mkdirSync(dirname(this.#pathFile), { recursive: true });
    this.writeFile(this.#option.default);
  }
  /** @param {boolean} state  */
  saveChanges(state) {
    this.#option.autoSave = state;
  }
  /** @param {string} data  */
  writeFile(data) {
    if (!this.#option.autoSave) return;
    writeFileSync(this.#pathFile, data);
  }
  readFile() {
    return readFileSync(this.#pathFile, 'utf-8');
  }
  statFile() {
    return statSync(this.#pathFile);
  }
}

module.exports = File;