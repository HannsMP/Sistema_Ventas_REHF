const { colors, optionColors } = require('../utils/function/color');
const TimeClass = require('../utils/Time');
const File = require('../utils/File');
const mergeObjects = require('../utils/function/merge');
const EmitSet = require('./emitSet');

/**
 * @type {{
 *   colorTime: keyof optionColors,
 *   colorLog: keyof optionColors,
 *   autoSave: boolean,
 *   emit: boolean,
 *   log: boolean
 * }}
 */
const defaultOption = {
  colorTime: 'reset',
  colorLog: 'reset',
  autoSave: false,
  emit: true,
  log: true
}

class Logger extends File {
  #option;
  /**
   * @param {string} pathFile 
   * @param {TimeClass} Time 
   * @param {defaultOption} option 
   * @param {import('../app')} app 
   */
  constructor(pathFile, Time, option, app) {
    option = mergeObjects(defaultOption, option);
    super(pathFile, { extname: '.log', autoSave: option.autoSave });
    this.#option = option;

    if (!optionColors?.[this.#option.colorTime])
      throw new Error("No existe el color seleccionado");

    if (!optionColors?.[this.#option.colorLog])
      throw new Error("No existe el color seleccionado");

    if (!Time instanceof TimeClass)
      throw new TypeError("El parametro de tiempo debe ser de instancia Time.");

    this.Time = Time;

    this.io = new EmitSet([
      '/control/reportes/registros'
    ], app)
  }
  reset() {
    this.writeFile('');
  }
  /** @param {keyof optionColors} color  */
  changeColor(color) {
    if (optionColors?.[color])
      this.#option.colorLog = color;
  }
  writeStart(...msg) {
    let dataText = this.readFile();
    let time = this.Time.format();

    let log = 1 < msg.length
      ? `${time} ${msg.join(' ')}`
      : `${time} ${msg[0]}`;

    this.#log(time, ...msg);
    if (this.#option.emit)
      this.io.emit(
        `/logger/${this.property.name}/writeStart`,
        { log, stat: this.statFile() }
      )
    dataText = log + "\n" + dataText;
    this.writeFile(dataText);

    return log
  }
  writeEnd(...msg) {
    let dataText = this.readFile();
    let time = this.Time.format();

    let log = `${time} ${msg.join(' ')}`

    this.#log(time, ...msg);
    if (this.#option.emit)
      this.io.emit(
        `/logger/${this.property.name}/writeEnd`,
        { log, stat: this.statFile() }
      )
    dataText = dataText + "\n" + log;
    this.writeFile(dataText);

    return log
  }
  #log(start, ...log) {
    if (this.#option.log)
      console.log(
        colors(this.#option.colorTime, start),
        colors(this.#option.colorLog, ...log)
      );
  }
}

module.exports = Logger;