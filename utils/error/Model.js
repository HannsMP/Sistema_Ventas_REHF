let errorMessages = {
  COLUMN_UNEXIST_FIELD: 'El campo de columna no existe',
  COLUMN_UNEXPECTED_VALUE: 'Se esperaba un valor para la columna',
  COLUMN_TYPE_FIELD: 'Tipo incorrecto en el campo columna',
  COLUMN_LIMIT_FIELD: 'El campo columna es demasiado largo',
  COLUMN_MIN_LIMIT_FIELD: 'El campo columna esta bajo el minimo',
  COLUMN_MAX_LIMIT_FIELD: 'El campo columna esta sobre el maximo',
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
    return [
      `ModelError:`,
      `  Code: ${this.code}`,
      `  clienteMessage: ${this.clienteMessage}`,
      `  Message: ${this.message}`,
      `  Table: ${this.table}`,
      `  Stack: ${this.stack}`
    ].join('\n');
  }
}

module.exports = ModelError;