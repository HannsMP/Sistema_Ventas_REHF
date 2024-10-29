const ClientError = require('./Client');

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
    return [
      `${this.name}:`,
      `  Errno: ${this.errno}`,
      `  Fatal: ${this.fatal}`,
      `  FieldCount: ${this.fieldCount}`,
      `  Code: ${this.code}`,
      `  Message: ${this.message}`,
      `  Client message: ${this.clienteMessage}`,
      `  Stack: ${this.stack}`
    ].join('\n');
  }
}

module.exports = DatabaseError;