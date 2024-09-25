(() => {
  class Event {
    /** @type {{[event: string]: {once:boolean, callback:(...data)=>void}[]}} */
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
            return !event.once;
          });
    }
    /** @param {string} name @param {(...data)=>void} callback @param {boolean} once  */
    on(name, callback, once = false) {
      if (typeof name != 'string')
        throw new TypeError('El nombre del evento debe ser un "string"');
      if (typeof callback != 'function')
        throw new TypeError('El callback del evento debe ser una "funcion"');

      if (!this.#data[name])
        this.#data[name] = [];

      this.#data[name].push({ callback, once });
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
      delete this.#data[name]
    }
  }

  class Calendar extends Event {
    optionMonth = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];
    /** @type {{time:string, day:number, state:number}[][]} */
    data = [];
    /** @type {HTMLTableCellElement[][]} */
    matriz = [];
    #nowDay;
    #nowYear;
    #nowMonth;
    #currentYear;
    #currentMonth;
    /** @type {[HTMLTableCellElement, Date]} */
    #selectCellData = [];
    /** @param {HTMLDivElement} box  */
    constructor(box, head = ['L', 'M', 'X', 'J', 'V', 'S', 'D']) {
      super();

      this.head = head;
      this.box = box;
      box.classList.add('calendar-box')
      this.box.innerHTML = '<div class="calendar-dashboard">'
        + '<sapn class="tittle">'
        + '<span class="month"></span> de'
        + '<span class="year"></span>'
        + '</sapn>'
        + '<div class="select">'
        + '<a class="prev"><i class="bx bx-chevron-left"></i></a>'
        + '<a class="next"><i class="bx bx-chevron-right"</i></a>'
        + '</div>'
        + '</div>'
        + '<table class="calendar-table">'
        + '</table>';

      this.month = box.querySelector('.month');
      this.year = box.querySelector('.year');
      this.prev = box.querySelector('.prev');
      this.next = box.querySelector('.next');
      this.table = box.querySelector('.calendar-table');

      this.table.innerHTML = '<thead></thead><tbody></tbody>';
      this.thead = this.table.querySelector('thead');
      this.tbody = this.table.querySelector('tbody');

      this.today = new Date();

      this.#nowDay = this.today.getDate();
      this.#nowMonth = this.#currentMonth = this.today.getMonth() + 1;
      this.#nowYear = this.#currentYear = this.today.getFullYear();

      this.#render()

      this.#setMonth();

      let prev = ev => {
        this.#currentMonth--;
        if (this.#currentMonth == 0) {
          this.#currentYear--;
          this.#currentMonth = 12;
        }
        if (ev) this.emit('prev', { year: this.#currentYear, mounth: this.#currentMonth });
        this.#setMonth();
      }
      this.prev.addEventListener('click', prev)

      let next = ev => {
        this.#currentMonth++;
        if (this.#currentMonth == 13) {
          this.#currentYear++;
          this.#currentMonth = 1;
        }
        if (ev) this.emit('next', { year: this.#currentYear, mounth: this.#currentMonth });
        this.#setMonth();
      }
      this.next.addEventListener('click', next)
      this.tbody.addEventListener('click', ev => {
        let cell = ev.target;
        if (cell?.nodeName != 'TD') return;
        this.#selectCellData[0]?.classList?.remove('select');
        this.#selectCellData[0] = cell;

        /** @type {Date} */
        let time = cell.dataTime;
        this.#selectCellData[1] = time;
        cell.classList.add('select');

        this.emit('click', { cell, date: cell.dataDate });

        if (cell.dataset?.y == 0 && cell.classList.contains('out')) return prev(false);
        if (cell.dataset?.y == 5 && cell.classList.contains('out')) return next(false);
      })
    }
    setDate(strDate) {
      let date = strDate instanceof Date
        ? strDate
        : new Date(strDate);

      this.#currentMonth = date.getMonth() + 1;
      this.#currentYear = date.getFullYear();
      this.#selectCellData[1] = `${this.#currentYear}/${this.#currentMonth}/${date.getDate()}`
      this.#setMonth();
    }
    #render() {
      let th = '<tr>';
      this.head.forEach((h, i) => { th += `<th>${h}</t>` })
      th += '</tr>'
      this.thead.innerHTML = th

      for (let r = 0; r < 6; r++) {
        let row = document.createElement('tr');
        let dataRow = []
        for (let c = 0; c < 7; c++) {
          let cell = document.createElement('td');
          cell.setAttribute('data-y', r)
          dataRow.push(cell)
        }
        row.append(...dataRow);
        this.matriz.push(dataRow);
        this.tbody.append(row);
      }
    }
    #setMonth() {
      let dayInterval = 24 * 60 * 60 * 1000;

      let month = new Date(`${this.#currentYear}/${this.#currentMonth}/1`);

      let dayWeek = month.getDay();
      dayWeek = dayWeek == 0 ? 7 : dayWeek

      let startDay = new Date(month - (dayInterval * (dayWeek - 1))).getTime();

      this.month.textContent = this.optionMonth[this.#currentMonth - 1];

      this.year.textContent = this.#currentYear;

      for (let r = 0; r < 6; r++) {
        let row = [];
        for (let c = 0; c < 7; c++) {
          let cell = this.matriz[r][c];
          cell.classList.remove('now', 'out', 'select');

          let dayDecrement = (7 * r) + c;
          let date = cell.dataDate = new Date(startDay + (dayDecrement * dayInterval));
          let computerDay = cell.textContent = date.getDate();
          let computerMonth = date.getMonth() + 1;
          let dateFormat = cell.dataTime = `${this.#currentYear}/${computerMonth}/${computerDay}`

          if (dateFormat == `${this.#nowYear}/${this.#nowMonth}/${this.#nowDay}`)
            cell.classList.add('now');
          else if (computerMonth != this.#currentMonth)
            cell.classList.add('out');

          if (this.#selectCellData[1] == dateFormat) {
            this.#selectCellData[0] = cell;
            cell.classList.add('select');
          };

        }
        this.data[r] = row;
      }
    }
  }

  window.Calendar = Calendar;
})()