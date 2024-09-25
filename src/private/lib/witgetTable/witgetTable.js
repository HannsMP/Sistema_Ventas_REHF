(() => {
  /*
    ----------------------------------------------------
    ---------------------- Eventos --------------------
    ----------------------------------------------------
  */

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

  /*
    ----------------------------------------------------
    ---------------------- Selector --------------------
    ----------------------------------------------------
  */

  function setTd(td, value) {
    if (value?.nodeType == Node.ELEMENT_NODE)
      td.append(value);
    else
      td.innerHTML = value;
  }

  class WitgetTable extends Event {
    dataTable = [];

    getDragger(row) {
      let td = document.createElement('td');
      td.innerHTML = `<i class="bx bx-x"></i>`
      td.classList.add('dragger');

      td.addEventListener('click', () => {
        this.dataTable = this.dataTable.filter(r => r !== row);
        this.tbody.removeChild(row.tr);
        this.emit('drop', row);
      });

      return td;
    }

    /** @param {HTMLTableElement} table @param {{columns: {tittle:string, width:string, textAlign:string}[], drag:boolean, drop:boolean}} config  */
    constructor(table, config = { drag: true, drop: true, columns: [] }) {
      if (table.nodeName != 'TABLE') throw new TypeError('El parametro table no es un elemento HTMLTableElement.');
      super();
      this.table = table;
      this.config = config;
      table.classList.add('witgetTable');

      let thead = table.querySelector('thead');
      this.thead = thead ? thead : document.createElement('thead');

      let tbody = table.querySelector('tbody');
      this.tbody = tbody ? tbody : document.createElement('tbody');

      let tfoot = table.querySelector('tfoot');
      this.tfoot = tfoot ? tfoot : document.createElement('tfoot');

      table.append(this.thead, this.tbody, this.tfoot);

      let cnfgColumns = config?.columns;
      let th = this.thead.querySelectorAll('th');
      this.columns = [...th].map((th, i) => ({
        tittle: cnfgColumns?.[i]?.tittle || th.textContent,
        width: (
          cnfgColumns?.[i]?.width && (th.style.width = cnfgColumns[i].width)
        ) || th.style.width || (
            th.style.width = 'auto'

          ),
        textAlign: (
          cnfgColumns?.[i]?.textAlign && (th.style.textAlign = cnfgColumns[i].textAlign)
        ) || th.style.textAlign || (
            th.style.textAlign = 'center'
          )
      }));

      if (!config.drop) return;
      let newTd = document.createElement('td');
      newTd.textContent = 'Cerrar';
      thead.querySelector('tr').prepend(newTd);
    }

    newRow(data) {
      let tr = document.createElement('tr');
      let row = { data: {}, td: {}, set: {}, tr };

      if (this.config.drop) {
        let dragger = this.getDragger(row);
        row.dragger = dragger;

        tr.append(dragger);
      }

      if (data?.constructor?.name == 'Object')
        this.columns.forEach(({ tittle, width, textAlign }) => {
          let td = document.createElement('td');
          td.style.width = width;
          td.style.textAlign = textAlign;

          let set = (value = data[tittle] || '-') => {
            setTd(td, value);
            row.data[tittle] = value;
          }

          set();
          row.set[tittle] = set;
          row.td[tittle] = td;
          tr.append(td);
        }), row.data = { ...data };

      else if (data?.constructor?.name == 'Array')
        this.columns.forEach(({ tittle, width, textAlign }, index) => {
          let td = document.createElement('td');
          td.style.width = width;
          td.style.textAlign = textAlign;

          let set = (value = data[index] || '-') => {
            setTd(td, value);
            row.data[tittle] = value;
          }

          set();
          row.set[tittle] = set;
          row.td[tittle] = td;
          tr.append(td);
        });

      else alert(`Hay un error de tipo en la información de la columna`);

      this.dataTable.push(row);
      this.tbody.append(tr);

      if (this.config.drag)
        this.#addDragEvents(tr, row);

      this.emit('add', row);
      return row;
    }

    #addDragEvents(tr = null, dataRow) {
      let rows = tr ? [tr] : this.tbody.querySelectorAll('tr:not(:first-of-type)');
      rows.forEach(row => {
        row.draggable = true;

        row.ondragstart = e => {
          this.emit('drag', dataRow);
          this.draggedRow = row;
          e.dataTransfer.dropEffect = "move";
          e.dataTransfer.effectAllowed = "move";
          e.dataTransfer.setData("text/html", row.innerHTML);
        };

        row.ondragover = e => e.preventDefault();

        row.ondrop = e => {
          e.preventDefault();
          if (this.draggedRow !== row) {
            this.draggedRow.innerHTML = row.innerHTML;
            row.innerHTML = e.dataTransfer.getData("text/html");
            this.#addDragEvents(row); // Reasignar eventos de arrastre
            this.#addDragEvents(this.draggedRow); // Reasignar eventos de arrastre
          }
        };

        row.ondragenter = () => row.classList.add("hover");
        row.ondragleave = () => row.classList.remove("hover");
        row.ondragend = () => {
          for (let r of this.tbody.querySelectorAll('tr:not(:first-of-type)')) {
            r.classList.remove("hover");
          }
        };
      });
    }
  }

  window.WitgetTable = WitgetTable;
})();
