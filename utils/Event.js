class Event {
  /** @type {{[event: string]: {once:boolean, persistence:boolean, callback:(...data)=>void}[]}} */
  #data = {};
  /** @param {string} name  */
  emit(name, ...data) {
    if (typeof name != 'string')
      throw new TypeError('El nombre de emit debe ser un "string"');
    let eventList = this.#data[name];
    if (eventList?.length)
      this.#data[name] = eventList
        .filter(event => {
          event.callback(...data);
          return event.persistence || !event.once;
        });;
  }
  /** @param {string} name @param {(...data)=>void} callback @param {{once:boolean, persistence:boolean}} option  */
  on(name, callback, option) {
    if (typeof name != 'string')
      throw new TypeError('El nombre del evento debe ser un "string"');
    if (typeof callback != 'function')
      throw new TypeError('El callback del evento debe ser una "funcion"');

    if (!this.#data[name])
      this.#data[name] = [];

    this.#data[name].push({ callback, once: option?.once, persistence: option?.persistence });
  }
  /** @param {string} name @param {(...data)=>void} callback  */
  off(name, eventFun) {
    if (typeof name != 'string')
      throw new TypeError('El nombre del evento debe ser un "string"');
    if (typeof eventFun != 'function')
      throw new TypeError('El eventFun del evento debe ser una "funcion"');

    let event = this.#data[name];
    if (event?.length)
      event = event.filter(e => e != eventFun);
  }
  /** @param {string} name  */
  empty(name) {
    if (typeof name != 'string')
      throw new TypeError('El nombre de remove debe ser un "string"');

    if (!this.#data[name]) return;
    this.#data[name] = this.#data[name].filter(event => event.persistence);
  }
}

module.exports = Event;