let codeQuery = {
  ER_DUP_ENTRY(sqlMessage) {
    let [_, entry, key] = /Duplicate entry '([\s\S]*)' for key '([\s\S]*)'/.exec(sqlMessage);
    return `Ya existe '${entry}' para el campo '${key}'`;
  },
  ER_BAD_FIELD_ERROR(sqlMessage) {
    let [_, field, table] = /Unknown column '([\s\S]*)' in '([\s\S]*)'/.exec(sqlMessage);
    return `El campo '${field}' no existe en la tabla '${table}'`;
  },
  ER_NO_SUCH_TABLE(sqlMessage) {
    let [_, table] = /Table '([\s\S]*)' doesn't exist/.exec(sqlMessage);
    return `La tabla '${table}' no existe`;
  },
  ER_PARSE_ERROR(sqlMessage) {
    let [_, syntaxError] = /near '([\s\S]*)' at line/.exec(sqlMessage);
    return `Error de sintaxis en la consulta SQL cerca de '${syntaxError}'. Verifica la sintaxis y asegúrate de que sea correcta.`;
  },
  ER_WRONG_FIELD_WITH_GROUP(sqlMessage) {
    return `El campo especificado no es válido con la cláusula GROUP BY: ${sqlMessage}`;
  },
  ER_WRONG_GROUP_FIELD(sqlMessage) {
    return `El campo en la cláusula GROUP BY no es válido: ${sqlMessage}`;
  },
  ER_WRONG_VALUE_COUNT(sqlMessage) {
    return `El número de valores no coincide con el número de columnas: ${sqlMessage}`;
  },
  ER_TOO_MANY_FIELDS(sqlMessage) {
    return `La consulta tiene demasiados campos: ${sqlMessage}`;
  },
  ER_DATA_TOO_LONG(sqlMessage) {
    let [_, value, field] = /Data too long for column '([\s\S]*)' at row ([\s\S]*)/.exec(sqlMessage);
    return `El valor '${value}' es demasiado largo para el campo '${field}'`;
  },
  ER_TRUNCATED_WRONG_VALUE_FOR_FIELD(sqlMessage) {
    let [_, value, field] = /Incorrect (.*) value: '([\s\S]*)' for column '([\s\S]*)'/.exec(sqlMessage);
    return `El valor '${value}' no es válido para el campo '${field}'`;
  },
  ER_FOREIGN_DUPLICATE_KEY(sqlMessage) {
    let [_, key, table] = /Duplicate entry '([\s\S]*)' for key '([\s\S]*)'/.exec(sqlMessage);
    return `Clave duplicada '${key}' en la tabla relacionada '${table}'`;
  },
  ER_NO_REFERENCED_ROW(sqlMessage) {
    let [_, key, table] = /Cannot add or update a child row: a foreign key constraint fails \(`[\s\S]*`\.([\s\S]*)', CONSTRAINT '([\s\S]*)'/.exec(sqlMessage);
    return `No se puede agregar o actualizar la fila porque no existe una clave relacionada en '${table}' para '${key}'`;
  },
  ER_ROW_IS_REFERENCED_2(sqlMessage) {
    let [_, table, constraint, foreignKey, refTable, refField] = /Cannot delete or update a parent row: a foreign key constraint fails \(`([\s\S]*)`\.`([\s\S]*)`, CONSTRAINT `([\s\S]*)` FOREIGN KEY \(`([\s\S]*)`\) REFERENCES `([\s\S]*)` \(`([\s\S]*)`\)/.exec(sqlMessage);
    return `No se puede eliminar o actualizar la fila en '${table}' porque está referenciada por la clave externa '${constraint}' en la tabla '${refTable}', campo '${refField}' con clave '${foreignKey}'`;
  },
  ER_ROW_IS_REFERENCED(sqlMessage) {
    let [_, key, table] = /Cannot delete or update a parent row: a foreign key constraint fails \(`[\s\S]*`\.([\s\S]*)', CONSTRAINT '([\s\S]*)'/.exec(sqlMessage);
    return `No se puede eliminar o actualizar la fila porque está referenciada por una clave externa en '${table}' para '${key}'`;
  },
  ER_CANNOT_ADD_FOREIGN(sqlMessage) {
    let [_, key] = /Cannot add foreign key constraint/.exec(sqlMessage);
    return `No se puede agregar la clave externa: ${sqlMessage}`;
  },
  ER_SYNTAX_ERROR(sqlMessage) {
    return `Error de sintaxis SQL: ${sqlMessage}`;
  }
};

class ClientError extends Error {
  constructor(message) {
    super(message);
    this.name = 'ClientError';
    this.clienteMessage = message;
  }
}

class DatabaseError extends ClientError {
  /** @param {import('mysql').MysqlError} error  */
  constructor(error) {
    super(codeQuery[error.code]?.(error.sqlMessage));
    this.name = 'DatabaseError';
    this.stack = error.stack;
    this.errno = error.errno;
    this.fatal = error.fatal;
    this.fieldCount = error.fieldCount;
    this.code = error.code;
  }
  log() {
    return `DatabaseError:
  Errno: ${this.errno}
  Fatal: ${this.fatal}
  FieldCount: ${this.fieldCount}
  Code: ${this.code}
  Message: ${this.message}
  Client message: ${this.clienteMessage}
  Stack: ${this.stack}`;
  }
}

class QueryError extends ClientError {
  /** @param {import('mysql').MysqlError} error  */
  constructor(error) {
    super(codeQuery[error.code]?.(error.sqlMessage));
    this.name = 'QueryError';
    this.stack = error.stack;
    this.code = error.code;
    this.errno = error.errno;
    this.fatal = error.fatal;
    this.fieldCount = error.fieldCount;
    this.sqlStateMarker = error.sqlStateMarker;
    this.sqlMessage = error.sqlMessage;
    this.sqlState = error.sqlState;
    this.sql = error.sql;
  }
  log() {
    return `QueryError:
  Errno: ${this.errno}
  Fatal: ${this.fatal}
  FieldCount: ${this.fieldCount}
  SQL State Marker: ${this.sqlStateMarker}
  SQL Message: ${this.sqlMessage}
  SQL State: ${this.sqlState}
  SQL: ${this.sql}
  Code: ${this.code}
  Message: ${this.message}
  Client message: ${this.clienteMessage}
  Stack: ${this.stack}`;
  }
}

let errorMessages = {
  COLUMN_UNEXIST_FIELD: 'El campo de columna no existe',
  COLUMN_UNEXPECTED_VALUE: 'Se esperaba un valor para la columna',
  COLUMN_TYPE_FIELD: 'Tipo incorrecto en el campo columna',
  COLUMN_LIMIT_FIELD: 'El campo columna es demasiado largo',
  COLUMN_INTEGER_LIMIT_FIELD: 'El campo columna numerico entera es demasiado largo',
  VALUE_NOT_UNIC: 'Ya existe un valor identico en otro registro',

  RESPONSE_DATA_EMPTY: 'La respuesta es vacia',
  RESPONSE_DATA_DISABLED: 'La respuesta esta en estado deshabilitado',
  RESPONSE_DATA_DIFERENT: 'La respuesta contiene diferencias'
}

class ModelError extends Error {
  /**
   * @param {keyof errorMessages} code 
   * @param {string} message 
   * @param {string} table 
   */
  constructor(code, message, table) {
    super(message);
    this.name = 'ModelError'
    this.code = code;
    this.table = table;
    this.clienteMessage = errorMessages[code];
  }
  log() {
    return `ModelError:
  Code: ${this.code}
  clienteMessage: ${this.clienteMessage}
  Message: ${this.message}
  Table: ${this.table}
  Stack: ${this.stack}`;
  }
}

/** @typedef {'String' | 'Number' | 'Integer' | 'Float' | 'Date'} TypeColumn */
/** @typedef {{ name: string, null: boolean, unic: boolean, type: TypeColumn, limit: number }} DataColumn */
/** @typedef {{ [column: string]: DataColumn }} Columns */

class Table {
  /** @type {import('../app')} */
  app
  /** @type {Columns} */
  columns;
  /** @param {string} name */
  constructor(name) {
    this.name = name;
  }

  /** @param {string} column  */
  /** @param {any} data  */
  /** @param {{unic: boolean}} compute  */
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

    if (!this.isTypeMatch(data, columnInfo))
      throw this.error(
        'COLUMN_TYPE_FIELD',
        `El parámetro de la columna ${column} debe ser de tipo ${columnInfo.type}, no de tipo ${typeComputed}`
      );

    if (compute?.unic)
      if (columnInfo.unic && !this.computeUnic(data, column, compute.unic))
        throw this.error(
          'VALUE_NOT_UNIC',
          `El parámetro de la columna ${column} no es unico`
        );
  }

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
  isTypeMatch(value, column) {
    let typeFun = this.optionType[typeof value];
    if (!typeFun) return false;
    return typeFun(value, column);
  }

  async computeUnic(value, column, id) {

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

module.exports = {
  ClientError,
  DatabaseError,
  QueryError,
  ModelError,
  Table,
}