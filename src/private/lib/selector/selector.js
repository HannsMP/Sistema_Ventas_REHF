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
   *   id:string, 
   *   name:string, 
   *   src:string,
   *   selectorBox:HTMLDivElement, 
   *   seletedBox:HTMLDivElement, 
   *   closeAnchor:HTMLAnchorElement,
   *   selected:number,
   *   close:()=>void,
   *   click:()=>void
   * }} Index 
   */

  class Selector extends Event {
    #showIndex;
    /** @type {string[]} */
    #chunks = [];
    #chunk = [20, 0, 0];
    /** @type {{[id:string]:Index}} */
    invisible = {};
    /** @type {{[id:string]:Index}} */
    indexer = {};
    /** @param {[]} datas */
    constructor(datas, showIndex = false) {
      super();
      this.menuBox = document.createElement('div');
      this.menuBox.className = 'selector-menu scroll-y';
      this.menuBox.innerHTML = `<span class="menu-warn"></span>`
      this.menuWarn = this.menuBox.querySelector('.menu-warn');
      this.#showIndex = showIndex;
      datas.forEach(({ id, name, src }) => this.add(id, name, src));

      /* 
        ==================================================
        ===================== SCROLL =====================
        ==================================================
      */

      this.menuBox.addEventListener('scroll', () => {
        let { scrollTop, clientHeight, scrollHeight } = this.menuBox;
        if (scrollTop + clientHeight < scrollHeight) return;
        this.#loadNextChunk();
      });

      this._selectedId = id => {
        let indexData = this.indexer[id];
        this.emit('click', indexData);
        indexData.selected = 1;
        indexData.selectorBox.remove();
        this.draw();

        indexData.closeAnchor.addEventListener('click', () => {
          this.emit('close', indexData);
          indexData.selected = 0;
          indexData.seletedBox.remove();
          this.draw();
        }, { once: true })
      }

      this.menuBox.addEventListener('click', ev => {
        let menuIndex = ev.target.closest('.menu-index');
        if (!menuIndex) return;
        let id = menuIndex.dataset.id;
        this._selectedId(id);
      })
    }
    #factory(id, name, src) {
      let indexData = { id, name, src };

      /* ========== Selector ========== */
      let selectorBox = indexData.selectorBox = document.createElement('div');
      selectorBox.dataset.id = id;
      selectorBox.className = 'menu-index';
      selectorBox.innerHTML = this.#showIndex
        ? this.#showIndex == 'img'
          ? `<img src="${src}"><span>${name}</span>`
          : `<small>${id}</small><span>${name}</span>`
        : `<span>${name}</span>`

      /* ========== Selected ========== */
      let seletedBox = indexData.seletedBox = document.createElement('div');
      seletedBox.innerHTML = `<span>${name}</span><a><i class="bx bx-x"></i></a>`;

      /* ========== Selected Close ========== */
      indexData.closeAnchor = seletedBox.querySelector('a');

      return indexData;
    }
    add(id, name, src) {
      if (this.indexer.hasOwnProperty(id) || this.invisible.hasOwnProperty(id)) return;
      this.indexer[id] = this.#factory(id, name, src);
    }
    upd(id, data) {
      let colletion;
      if (this.indexer.hasOwnProperty(id))
        colletion = this.indexer;
      else if (this.invisible.hasOwnProperty(id))
        colletion = this.invisible;
      else
        return;

      let { selectorBox, seletedBox, name, src } = colletion[id];

      if (this.#showIndex == 'img')
        selectorBox.querySelector('img').src
          = data.src || src;

      seletedBox.querySelector('span').textContent
        = selectorBox.querySelector('span').textContent
        = data.name || name;
    }
    rmv(id) {
      let colletion;
      if (this.indexer.hasOwnProperty(id))
        colletion = this.indexer;
      else if (this.invisible.hasOwnProperty(id))
        colletion = this.invisible;
      else
        return;

      let { selectorBox, seletedBox } = colletion[id];
      this.emit('close', colletion[id]);
      seletedBox.remove();
      selectorBox.remove();
      delete colletion[id];
    }
    has(id) {
      return this.indexer.hasOwnProperty(id) || this.invisible.hasOwnProperty(id);
    }
    show(id) {
      if (!this.invisible.hasOwnProperty(id)) return
      this.indexer[id] = this.invisible[id];
      delete this.invisible[id];
      this.draw();
    }
    hide(id) {
      if (!this.indexer.hasOwnProperty(id)) return
      let { selectorBox, seletedBox } = this.invisible[id] = this.indexer[id];
      seletedBox.remove();
      selectorBox.remove();
      delete this.indexer[id];
    }
    /** @param {(data:Index, id:string)=>boolean?} call  */
    forEach(call) {
      for (let index in this.indexer)
        call(this.indexer[index], index);
    }
    reset() {
      this.forEach(indexData => {
        indexData.selected = 0;
        indexData.seletedBox.remove();
        indexData.selectorBox.remove();
      })
    }
    search(value = '') {

      if (typeof value != 'string') return;

      this.#chunks = [];
      this.emit('search', value);
      this.menuWarn.style.display = 'none';

      if (value == '') {
        this.forEach((indexData, id) => {
          if (indexData.selected == 1)
            return;
          this.#chunks.push(id);
          indexData.selected = 0;
        });

        if (!this.#chunks.length) {
          this.menuWarn.style.display = '';
          this.menuWarn.textContent = 'Sin datos.';
        }
      }
      else {
        this.forEach((indexData, id) => {
          if (indexData.selected == 1) return;

          if (!indexData.name.toLowerCase().includes(value.toLowerCase()))
            return indexData.selected = -1;

          this.#chunks.push(id);
          indexData.selected = 0;
        })

        if (!this.#chunks.length) {
          this.menuWarn.style.display = '';
          this.menuWarn.textContent = 'Sin coincidencia.';
        }
      }

      this.draw();
    }
    draw(order = 'asc') {
      if (this.#chunks.length) {
        if (order == 'asc')
          this.#chunks.sort((a, b) => {
            a = this.indexer[a]?.name;
            b = this.indexer[b]?.name;
            return a < b ? -1 : a > b ? 1 : 0
          });
        if (order == 'des')
          this.#chunks.sort((a, b) => {
            a = this.indexer[a]?.name;
            b = this.indexer[b]?.name;
            return a < b ? 1 : a > b ? -1 : 0
          });
      }
      this.#chunk[1] = 0;
      this.#chunk[2] = this.#chunks.length;

      this.forEach(({ selectorBox, selected }) => {
        if (selected != 0) selectorBox.remove();
      })

      this.#loadNextChunk();
    }
    #loadNextChunk() {
      let start = this.#chunk[0] * this.#chunk[1];
      let end = start + this.#chunk[0];
      if (this.#chunk[2] < start) return;

      let chunks = this.#chunks
        .slice(start, end)
        .filter(chunk => this.indexer.hasOwnProperty(chunk));

      this.menuBox.append(...chunks
        .map(chunk => {
          let indexData = this.indexer[chunk];
          return indexData.selectorBox;
        })
      );

      this.#chunk[1]++;
    }
  }

  class SelectorUnic extends Event {
    /** @type {Index[]} */
    selected = [];
    /** @param {HTMLInputElement} inputElement @param {Selector} selectorClass  */
    constructor(inputElement, selectorClass, autoHide = false) {
      if (inputElement.tagName != 'INPUT') throw new TypeError('El elemento no es un input.');
      if (!selectorClass instanceof Selector) throw new TypeError('Es necesario el parametro Selector.');

      super();
      this.inputElement = inputElement;
      this.selectorClass = selectorClass;
      this.autoHide = autoHide;

      this.isDisabled = this.inputElement.hasAttribute('disabled');

      inputElement.insertAdjacentHTML('beforebegin', '<div class="selected-colletion"></div>');
      this.colletionBox = inputElement.previousElementSibling;

      if (!this.isDisabled) {

        selectorClass.on('click', indexer => {
          if (selectorClass.menuBox.parentNode != inputElement.parentNode) return;
          let change = this.selected[0]

          if (change) {
            change.closeAnchor.click();
            this.emit('change', change);
          }

          this.colletionBox.append(indexer.seletedBox);
          this.emit('selected', indexer);
          this.selected[0] = indexer;
          if (autoHide) inputElement.style.display = 'none';
        }, { persistence: true })

        selectorClass.on('close', indexer => {
          if (indexer.seletedBox.closest('.selected-colletion') != this.colletionBox) return;

          this.emit('diselected', indexer);
          if (autoHide) inputElement.style.display = '';
        }, { persistence: true })

        let timeoutId;
        this.inputElement.addEventListener('input', e => {
          clearTimeout(timeoutId);
          timeoutId = setTimeout(() => {
            this.emit('input', inputElement.value);
            selectorClass.search(inputElement.value);
          }, 500)
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
      if (!this.selectorClass.indexer.hasOwnProperty(id)) return;
      this.selectorClass._selectedId(id);

      if (this.autoHide) this.inputElement.style.display = 'none';

      if (this.selected[0]) {
        this.emit('diselected', this.selected[0]);
        this.selected[0].closeAnchor.click();
        this.emit('change', this.selected[0]);
      }

      let indexData = this.selectorClass.indexer[id];
      this.colletionBox.append(indexData.seletedBox);
      this.emit('selected', indexData);
      this.selected[0] = indexData;
    }
    diselect(id) {
      if (!this.selectorClass.has(id)) return;
      if (this.selected[0].id != id) return;

      if (this.autoHide) this.inputElement.style.display = '';

      this.emit('diselected', this.selected[0]);
      this.selected[0].closeAnchor.click();
    }
    empty() {
      if (!this.selected.length) return;
      this.emit('diselected', this.selected[0]);
      this.selected[0].closeAnchor.click();
    }
  }

  class SelectorMulti extends Event {
    /** @type {Index[]} */
    selected = [];
    /** @param {HTMLInputElement} inputElement @param {Selector} selectorClass  */
    constructor(inputElement, selectorClass) {
      if (inputElement.tagName != 'INPUT') throw new TypeError('El elemento no es un input.');
      if (!selectorClass instanceof Selector) throw new TypeError('Es necesario el parametro Selector.');

      super();
      this.inputElement = inputElement;
      this.selectorClass = selectorClass;

      this.isDisabled = this.inputElement.hasAttribute('disabled');

      inputElement.insertAdjacentHTML('beforebegin', '<div class="selected-colletion"></div>');
      this.colletionBox = inputElement.previousElementSibling;

      if (!this.isDisabled) {

        selectorClass.on('click', indexer => {
          if (selectorClass.menuBox.parentNode != inputElement.parentNode) return;

          this.colletionBox.append(indexer.seletedBox);
          this.emit('selected', indexer);
          this.selected.push(indexer);
        }, { persistence: true })

        selectorClass.on('close', indexer => {
          if (indexer.seletedBox.closest('.selected-colletion') != this.colletionBox) return;

          let index = this.selected.findIndex(indexData => indexData == indexer);
          this.emit('diselected', indexer);
          this.selected.splice(index, 1);
        }, { persistence: true })

        let timeoutId;
        this.inputElement.addEventListener('input', e => {
          clearTimeout(timeoutId);
          timeoutId = setTimeout(() => {
            this.emit('input', inputElement.value);
            selectorClass.search(inputElement.value)
          }, 500)
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
      if (!this.selectorClass.indexer.hasOwnProperty(id)) return;
      this.selectorClass._selectedId(id);

      let indexData = this.selectorClass.indexer[id];
      this.colletionBox.append(indexData.seletedBox);
      this.emit('selected', indexData);
      this.selected.push(indexData);
    }
    diselect(id) {
      if (!this.selectorClass.has(id)) return;
      let index = this.selected.findIndex(indexData => indexData.id == id);
      let indexData = this.selected[index];
      this.emit('diselected', indexData);
      indexData.closeAnchor.click();

      this.selected.splice(index, 1);
    }
    empty() {
      if (!this.selected.length) return;
      this.selected.forEach(indexData => {
        this.emit('diselected', indexData);
        indexData.closeAnchor.click();
      })
    }
  }

  window.Selector = Selector;
  window.SelectorUnic = SelectorUnic;
  window.SelectorMulti = SelectorMulti;
})()