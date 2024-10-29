const mergeObjects = require("./function/merge");
const random = num => Math.floor(Math.random() * num);

const CHARACTERS = {
  n: '0123456789',
  l: 'abcdefghijklmnopqrstuvwxyz',
  L: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
  s: '!@#$%^&*()_+-=[]{}|;:,.<>?'
}

/** 
 * @type {{
 *   numeric?: boolean,
 *   letters?: boolean | {upper: boolean, lower:true},
 *   symbol?: boolean,
 *   include?: string,
 *   exclude?: string
 * }} 
 */
let IdOption = {
  numeric: false,
  letters: false,
  symbol: false,
  include: '',
  exclude: ''
}

class Id {
  /** @param {string|number} template @param {IdOption} [option]  */
  constructor(template = 10, option = {}) {
    this.option = mergeObjects(IdOption, option);
    let { numeric, letters, symbol, include, exclude } = this.option;

    this.format = '';
    if (numeric == true)
      this.format += CHARACTERS.n;

    if (letters == true)
      this.format += CHARACTERS.l + CHARACTERS.L;
    else {
      if (letters.lower == true)
        this.format += CHARACTERS.l;
      if (letters.upper == true)
        this.format += CHARACTERS.L;
    }

    if (symbol == true)
      this.format += CHARACTERS.s;

    if (typeof exclude == 'string' && exclude != '')
      this.format = this.format.replace(new RegExp(exclude.split('').join('|'), 'g'), '');

    if (typeof include == 'string' && include != '')
      include.split('').forEach(w => !this.format.includes(w) && (this.format += w));

    if (typeof template == 'string')
      this.template = template;
    else if (typeof template == 'number')
      this.template = ' '.repeat(template);
    else
      throw new TypeError(`El parametro size debe ser un string o con campos ' ' vacios de 1 de lonjitud`);

    this.limit = this.template.length * this.format.length;

    if (this.limit <= 1)
      throw new Error(`Selecciona una opcion, en conbinacion con el template no hay un rango generable.`);
  }
  /** @param {string} [separator]  */
  generate(separator = '') {
    return this.template
      .split('')
      .map(w => {
        let temp = w == ' ' ? this.format : CHARACTERS[w];
        return temp ? temp[random(temp.length)] : w;
      })
      .join(separator);
  }
}

module.exports = Id