const ModelError = require('../error/Model');

/** @typedef {'String' | 'Number' | 'Integer' | 'Float'} TypeColumn */
/** @typedef {{name:string, null:boolean, type:TypeColumn, unic?:boolean, limit?:number, min?:number, max?:number}} DataColumn */
/** @typedef {{[column: string]: DataColumn }} Columns */

/** @template T */
class Table {
  /** @type {import('../../app')} */
  app;
  /** @type {Columns} */
  columns
  /** 
   * @param {string} name 
   */
  constructor(name) {
    this.name = name;
  }
  /**
   * @returns {Promise<T[]>}
   */
  readAll() {
    return new Promise(async (res, rej) => {
      try {
        let [result] = await this.app.model.pool(`
          SELECT
            *
          FROM
            ${this.name}
        `)
        res(result);
      } catch (e) {
        rej(e)
      }
    })
  }
  /** 
   * @param {number} id 
   * @returns {Promise<T>}
   */
  readIdAll(id) {
    return new Promise(async (res, rej) => {
      try {
        this.constraint('id', id);

        let [result] = await this.app.model.poolValues(`
          SELECT
            *
          FROM
            ${this.name}
          WHERE
            id = ?
        `, [
          id
        ]);

        res(result[0]);
      } catch (e) {
        rej(e);
      }
    })
  }
  /** 
   * @template C
   * @param {C & keyof T} column 
   * @param {T[C]} data
   * @param {{unic: boolean}} compute  
   */
  constraint(column, data, compute) {
    const columnInfo = this.columns[column];

    if (!columnInfo)
      throw this.error(
        'COLUMN_UNEXIST_FIELD',
        `La columna ${column} no existe.`
      );

    if (data == undefined) {
      if (!columnInfo.null)
        throw this.error(
          'COLUMN_UNEXPECTED_VALUE',
          `El parámetro de la columna ${column} no existe.`
        );
      return
    }

    if (!this._isTypeMatch(data, columnInfo))
      throw this.error(
        'COLUMN_TYPE_FIELD',
        `El parámetro de la columna ${column} debe ser de tipo ${columnInfo.type}, no de tipo ${typeof data}`
      );

    if (compute?.unic)
      if (columnInfo.unic && !this._computeUnic(data, column, compute.unic))
        throw this.error(
          'VALUE_NOT_UNIC',
          `El parámetro de la columna ${column} no es unico`
        );
  }

  /** @type {{[type:string]:((value:string|number,colum:DataColumn)=>boolean)}} */
  optionType = {
    string: (value, column) => {
      if (column.type !== 'String') return false;
      if (column.limit < value.length)
        throw this.error(
          'COLUMN_LIMIT_FIELD',
          `El parámetro de la columna ${column.name} excede el límite de ${column.limit}`
        );
      return true;
    },
    number: (value, column) => {
      if (Number.isNaN(value) && column.type === 'NaN') return true;

      if (column.min !== undefined && column.min > value)
        throw this.error(
          'COLUMN_MIN_LIMIT_FIELD',
          `El valor de la columna ${column.name} es menor que el mínimo permitido de ${column.min}.`
        );

      if (column.max !== undefined && column.max < value)
        throw this.error(
          'COLUMN_MAX_LIMIT_FIELD',
          `El valor de la columna ${column.name} excede el máximo permitido de ${column.max}.`
        );

      if (column.type === 'Number') {
        let [integer] = value.toString().split('.');

        if (integer && integer.length > column.limit)
          throw this.error(
            'COLUMN_INTEGER_LIMIT_FIELD',
            `La parte entera de ${column.name} excede el límite de ${column.limit}`
          );

        return true;
      }

      if (Number.isInteger(value) && column.type === 'Integer')
        return true;
      return column.type === 'Float';
    }
  };

  /** 
   * @param {any} value 
   * @param {DataColumn} column  
   * @returns {TypeColumn} 
   */
  _isTypeMatch(value, column) {
    let typeFun = this.optionType[typeof value];
    if (!typeFun) return false;
    return typeFun(value, column);
  }

  async _computeUnic(value, column, id) {

    let [result] = typeof id == 'boolean'
      ? await this.app.model.poolValues(`
        SELECT 
          1
        FROM 
          ${this.name}
        WHERE 
          ${column} = ?
      `, [
        value
      ])
      : await this.app.model.poolValues(`
        SELECT 
          1
        FROM 
          ${this.name}
        WHERE 
          ${column} = ?
          AND id != ?
      `, [
        value,
        id
      ])

    return result[0] ? false : true
  }
  /**
   * @param {keyof errorMessages} code 
   * @param {string} message 
   * @param {string} [syntax] 
   */
  error(code, message, syntax) {
    return new ModelError(code, message, this.name, syntax);
  }
}

module.exports = Table;