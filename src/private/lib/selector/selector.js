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

  /** 
   * @typedef {{ 
   *   name:string, 
   *   src:string,
   *   selected:number
   * }} IndexData
   */

  /** 
   * @typedef {{ 
   *   id: string,
   *   selectedBox: HTMLDivElement,
   *   closeAnchor: HTMLAnchorElement,
   *   indexData: IndexData
   * }} IndexSeleted
   */

  /** @extends {Map<string, IndexData>} */
  class SelectorMap extends Map {
    event = new Event;
    /** @type {Map<string, IndexSeleted>} */
    #seleted = new Map
    /** @type {string[]} */
    #chunks = [];
    #chunkSize = 20;
    #chunkCounter = 0;
    /** @param {IndexData[]} datas @param {boolean} showIndex */
    constructor(datas, showIndex = false) {
      super();
      this.menuBox = document.createElement('div');
      this.menuBox.className = 'selector-menu scroll-y';
      this.menuBox.innerHTML = `<span class="menu-warn"></span>`;
      this.showIndex = showIndex;
      // Asegúrate de que el id sea tratado como string
      datas.forEach(({ id, name, src }) => this.set(String(id), { name, src, selected: 0 }));

      this.menuBox.addEventListener('scroll', () => {
        let { scrollTop, clientHeight, scrollHeight } = this.menuBox;
        if (scrollTop + clientHeight < scrollHeight) return;
        this.#loadNextChunk();
      });

      this.menuBox.addEventListener('click', ev => {
        let menuIndex = ev.target.closest('.menu-index');

        if (!menuIndex) return;
        let id = menuIndex.dataset.id;

        menuIndex.remove();
        this._selected(id);
      })
    }

    // Asegura que los métodos de Map siempre conviertan id a string
    set(id, data) {
      id = String(id);
      return super.set(id, data);
    }

    get(id) {
      id = String(id);
      return super.get(id);
    }

    has(id) {
      id = String(id);
      return super.has(id);
    }

    delete(id) {
      id = String(id);
      return super.delete(id);
    }

    reset() {
      this.#seleted.forEach(IndexSeleted => IndexSeleted.closeAnchor.click());
    }

    /** @param {string} id  */
    _selected(id) {
      id = String(id);
      let indexData = super.get(id);

      if (!indexData) return;

      let data = {};

      data.id = id;
      data.indexData = indexData
      let selectedBox = data.selectedBox = this.#createSeletedBox(indexData.name);
      let closeAnchor = data.closeAnchor = selectedBox.querySelector('a')
      this.#seleted.set(id, data);

      this.event.emit('click', data);
      indexData.selected = 1;
      this.draw();

      closeAnchor.addEventListener('click', () => {
        this.event.emit('close', data);
        indexData.selected = 0;
        selectedBox.remove();
        this.draw();
        this.#seleted.delete(id)
      }, { once: true });

      return data
    }

    #createSeletedBox(name) {
      let seletedBox = document.createElement('div');
      seletedBox.innerHTML = `<span>${name}</span><a><i class="bx bx-x"></i></a>`;
      return seletedBox
    }

    /** @param {string} id  */
    _deselect(id) {
      id = String(id);
      let IndexSeleted = this.#seleted.get(id);
      if (!IndexSeleted) return;

      IndexSeleted.closeAnchor.click();
    }

    search(value = '') {
      if (typeof value != 'string') return;

      this.#chunks = [];
      this.event.emit('search', value);

      if (value == '') {
        this.forEach((indexData, id) => {
          if (indexData.selected != 1) {
            this.#chunks.push(id);
            indexData.selected = 0;
          }
        })
        this.#displayNoDataWarning();
      } else {
        this.forEach((indexData, id) => {
          if (indexData.selected == 1) return;

          if (!indexData.name.toLowerCase().includes(value.toLowerCase()))
            return indexData.selected = -1;

          this.#chunks.push(id);
          indexData.selected = 0;
        })
        this.#displayNoMatchWarning();
      }

      this.draw();
    }

    #displayNoDataWarning() {
      if (!this.#chunks.length)
        this.menuBox.innerHTML = `<span class="menu-warn">Sin datos.</span>`;
    }

    #displayNoMatchWarning() {
      if (!this.#chunks.length)
        this.menuBox.innerHTML = `<span class="menu-warn">Sin coincidencia.</span>`;
    }

    draw(order = 'asc') {
      this.menuBox.innerHTML = '';
      if (this.#chunks.length) {
        if (order == 'asc')
          this.#chunks.sort((a, b) => {
            a = super.get(a)?.name;
            b = super.get(b)?.name;
            return a < b ? -1 : a > b ? 1 : 0;
          });
        if (order == 'des')
          this.#chunks.sort((a, b) => {
            a = super.get(a)?.name;
            b = super.get(b)?.name;
            return a < b ? 1 : a > b ? -1 : 0;
          });
      }
      this.#chunkCounter = 0;
      this.#loadNextChunk();
    }

    #loadNextChunk() {
      let start = this.#chunkSize * this.#chunkCounter;
      let end = start + this.#chunkSize;
      if (this.#chunks.length < start) return;

      let chunks = this.#chunks.slice(start, end).filter(chunkId => super.has(chunkId));

      this.menuBox.append(...chunks.map(chunkId => {
        let indexData = super.get(chunkId);
        return this.#createSelectorBox(chunkId, indexData.name, indexData.src);
      }));

      this.#chunkCounter++;
    }

    #createSelectorBox(id, name, src) {
      let selectorBox = document.createElement('div');
      selectorBox.dataset.id = id;
      selectorBox.className = 'menu-index';
      selectorBox.innerHTML = this.showIndex
        ? this.showIndex == 'img'
          ? `<img src="${src}"><span>${name}</span>`
          : `<small>${id}</small><span>${name}</span>`
        : `<span>${name}</span>`

      return selectorBox;
    }
  }

  class SelectorUnic extends Event {
    /** @type {IndexSeleted[]} */
    selected = [];
    /** @param {HTMLInputElement} inputElement @param {SelectorMap} selectorClass  */
    constructor(inputElement, selectorClass, autoHide = false) {
      if (!(inputElement instanceof HTMLInputElement)) throw new TypeError('El elemento no es un input.');
      if (!(selectorClass instanceof SelectorMap)) throw new TypeError('Es necesario el parametro Selector.');
      super();

      this.inputElement = inputElement;
      this.selectorClass = selectorClass;
      this.autoHide = autoHide;
      this.isDisabled = inputElement.disabled;

      inputElement.insertAdjacentHTML('beforebegin', '<div class="selected-colletion"></div>');
      this.colletionBox = inputElement.previousElementSibling;

      if (!this.isDisabled) {

        selectorClass.event.on('click', IndexSeleted => {
          if (selectorClass.menuBox.parentNode != inputElement.parentNode) return;

          let indexBefore = this.selected[0];

          if (indexBefore) {
            indexBefore.closeAnchor.click();
            this.emit('change', indexBefore, IndexSeleted);
          }

          this.colletionBox.append(IndexSeleted.selectedBox);
          this.emit('selected', IndexSeleted);
          this.selected[0] = IndexSeleted;
          if (autoHide) inputElement.style.display = 'none';
        }, { persistence: true })

        selectorClass.event.on('close', data => {
          if (data.selectedBox.closest('.selected-colletion') != this.colletionBox) return;

          this.emit('deselected', data);
          this.selected.slice(0, 1);
          if (autoHide) inputElement.style.display = '';
        }, { persistence: true })

        let timeoutId;
        this.inputElement.addEventListener('input', e => {
          clearTimeout(timeoutId);
          timeoutId = setTimeout(() => {
            this.emit('input', inputElement.value);
            selectorClass.search(inputElement.value);
          }, 300)
        });

        this.inputElement.addEventListener('focusin', e => {
          this.emit('focusin', e);
          this.inputElement.parentNode.append(selectorClass.menuBox);
          selectorClass.search(inputElement.value);
        });

        this.inputElement.addEventListener('focusout', e => {
          this.emit('focusout', e);
          setTimeout(() => {
            selectorClass.menuBox.remove()
          }, 200);
        });
      }
    }
    select(id) {
      id = String(id);  // Convertimos a string
      if (!this.selectorClass.has(id)) return;

      let indexData = this.selectorClass.get(id);
      if (indexData.selected == 1) return;

      if (this.autoHide) this.inputElement.style.display = 'none';

      let indexBefore = this.selected[0];

      if (indexBefore) {
        this.emit('diselected', indexBefore);
        indexBefore.closeAnchor.click();
        this.emit('change', indexBefore);
      }

      let IndexSeleted = this.selectorClass._selected(id);

      this.colletionBox.append(IndexSeleted.selectedBox);
      this.emit('selected', IndexSeleted);
      this.selected[0] = IndexSeleted;
    }
    deselect(id) {
      id = String(id);  // Convertimos a string
      if (!this.selectorClass.has(id)) return;
      if (this.selected[0].id != id) return;

      if (this.autoHide) this.inputElement.style.display = '';

      this.selected[0].closeAnchor.click();
    }
    empty() {
      if (!this.selected.length) return;
      this.selected[0].closeAnchor.click();
    }
  }

  class SelectorMulti extends Event {
    /** @type {IndexSeleted[]} */
    selected = [];
    /** @param {HTMLInputElement} inputElement @param {SelectorMap} selectorClass  */
    constructor(inputElement, selectorClass) {
      if (inputElement.tagName != 'INPUT') throw new TypeError('El elemento no es un input.');
      if (!(selectorClass instanceof SelectorMap)) throw new TypeError('Es necesario el parametro Selector.');

      super();
      this.inputElement = inputElement;
      this.selectorClass = selectorClass;

      this.isDisabled = this.inputElement.hasAttribute('disabled');

      inputElement.insertAdjacentHTML('beforebegin', '<div class="selected-colletion"></div>');
      this.colletionBox = inputElement.previousElementSibling;

      if (!this.isDisabled) {

        selectorClass.event.on('click', data => {
          if (selectorClass.menuBox.parentNode != inputElement.parentNode) return;

          this.colletionBox.append(data.selectedBox);
          this.emit('selected', data);
          this.selected.push(data);
        }, { persistence: true })

        selectorClass.event.on('close', data => {
          if (data.selectedBox.closest('.selected-colletion') != this.colletionBox) return;

          let index = this.selected.findIndex(IndexSeleted => IndexSeleted == data);
          this.emit('deselected', data);
          this.selected.splice(index, 1);
        }, { persistence: true })

        let timeoutId;
        this.inputElement.addEventListener('input', e => {
          clearTimeout(timeoutId);
          timeoutId = setTimeout(() => {
            this.emit('input', inputElement.value);
            selectorClass.search(inputElement.value)
          }, 300)
        });
        this.inputElement.addEventListener('focusin', e => {
          this.emit('focusin', e);
          this.inputElement.parentNode.append(selectorClass.menuBox);
          selectorClass.search(inputElement.value);
        });

        this.inputElement.addEventListener('focusout', e => {
          this.emit('focusout', e);
          setTimeout(() => {
            selectorClass.menuBox.remove()
          }, 200);
        });
      }
    }
    select(id) {
      id = String(id);  // Convertimos a string
      if (!this.selectorClass.has(id)) return;

      let indexData = this.selectorClass.get(id);
      if (indexData.selected == 1) return;

      let IndexSeleted = this.selectorClass._selected(id);

      this.colletionBox.append(IndexSeleted.selectedBox);
      this.emit('selected', IndexSeleted);
      this.selected.push(IndexSeleted);
    }
    deselect(id) {
      id = String(id);  // Convertimos a string
      if (!this.selectorClass.has(id)) return;
      let index = this.selected.findIndex(indexData => indexData.id == id);
      if (index == -1) return;

      let IndexSeleted = this.selected[index];
      IndexSeleted.closeAnchor.click();
      this.selected.splice(index, 1);
    }
    empty() {
      if (!this.selected.length) return;
      this.selected.forEach(IndexSeleted => IndexSeleted.closeAnchor.click())
    }
  }

  window.SelectorMap = SelectorMap;
  window.SelectorUnic = SelectorUnic;
  window.SelectorMulti = SelectorMulti;
})()