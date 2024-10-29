const DatabaseError = require('./DataBase');

class QueryError extends DatabaseError {
  /** @param {import('mysql').MysqlError} error  */
  constructor(error) {
    super(error);
    this.name = 'QueryError';
    this.sqlStateMarker = error.sqlStateMarker;
    this.sqlMessage = error.sqlMessage;
    this.sqlState = error.sqlState;
    this.sql = error.sql;
  }
  log() {
    return [
      super.log(),
      `SQL State Marker: ${this.sqlStateMarker}`,
      `SQL Message: ${this.sqlMessage}`,
      `SQL State: ${this.sqlState}`,
      `SQL: ${this.sql}`
    ].join('\n');
  }
}

module.exports = QueryError;