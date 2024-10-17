/** @template E */
class Event {
  /** @type {{[event: string]: {once:boolean, persistence:boolean, callback:(...data:any[])=>void}[]}} */
  #data = {};

  /** 
   * @template O
   * @param {O | keyof E} name
   * @param {E[O]} data? 
   */
  emit(name, data) {
    if (typeof name != 'string')
      throw new TypeError('El nombre de emit debe ser un "string"');
    let eventList = this.#data[name];
    if (eventList?.length) {
      this.#data[name] = eventList.filter(event => {
        event.callback(data); // Asegúrate de que los datos estén correctamente formateados aquí
        return event.persistence || !event.once;
      });
    }
  }

  /** 
   * @template O
   * @param {O | keyof E} name
   * @param {(data: E[O]) => void} [callback] 
   * @param {{once: boolean, persistence: boolean}} [option]  
   */
  on(name, callback, option = { once: false, persistence: false }) {
    if (typeof name != 'string')
      throw new TypeError('El nombre del evento debe ser un "string"');
    if (typeof callback != 'function')
      throw new TypeError('El callback del evento debe ser una "funcion"');

    if (!this.#data[name])
      this.#data[name] = [];

    this.#data[name].push({ callback, once: option.once, persistence: option.persistence });
  }

  /** 
   * @template O
   * @param {O | keyof E} name
   * @param {(data: E[O]) => void} eventFun 
   */
  off(name, eventFun) {
    if (typeof name != 'string')
      throw new TypeError('El nombre del evento debe ser un "string"');
    if (typeof eventFun != 'function')
      throw new TypeError('El eventFun del evento debe ser una "funcion"');

    let event = this.#data[name];
    if (event?.length) {
      this.#data[name] = event.filter(e => e.callback !== eventFun);
    }
  }

  /** 
   * @param {keyof E} name  
   */
  empty(name) {
    if (typeof name != 'string')
      throw new TypeError('El nombre de remove debe ser un "string"');

    if (!this.#data[name]) return;
    this.#data[name] = this.#data[name].filter(event => event.persistence);
  }
}

module.exports = Event;