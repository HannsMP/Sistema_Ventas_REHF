
/*
  ----------------------------------------------------
  ---------------------- Selector --------------------
  ----------------------------------------------------
*/

/** 
 * @typedef {{ 
*   id: string,
*   selectedBox: HTMLDivElement,
*   closeAnchor: HTMLAnchorElement,
*   indexData: IndexData
* }} IndexSeleted
*/

/** 
 * @typedef {{ 
 *   id:number
 *   name:string, 
 *   src:string,
 *   selected:number,
 *   selectorBox: HTMLDivElement
 * }} IndexData
 */

/** 
 * @typedef {{
 *   search: string,
 *   byId: boolean,
 *   start: number,
 *   length: number,
 *   order: 'asc'|'desc',
 *   noInclude: number[]
 * }} SelectorRequest 
 */

/** 
 * @typedef {(SelectorResponse: {
 *   data: IndexData[],
 *   recordsFiltered: number,
 *   recordsTotal: number
 * })=>void} SelectorEnd 
 */

class OptionsServerside {
  #blocked = false;
  /** 
   * @type {EventListener<{
   *   click:IndexSeleted,
   *   select:IndexSeleted,
   *   close:IndexSeleted,
   *   search:string
   * }>} 
   */
  event = new EventListener();

  /** @type {Map<number, IndexSeleted>} */
  #selected = new Map();

  /** @type {Map<number, IndexData>} */
  #data = new Map();

  #chunkSize = 20;
  #chunkCounter = 0;
  #recordsFiltered = 0;
  #recordsTotal = 0;
  #currentSearch = '';
  #callback = _ => _;

  /** 
   * @param {(req:SelectorRequest, end:SelectorEnd)=>void} callback 
   * @param {{showIndex:boolean|'img', noInclude?:boolean, order?:'asc'|'desc', associative?:boolean }} options 
   */
  constructor(callback, options = {}) {
    this.#callback = callback;
    this.options = options;

    this.wrapperBox = document.createElement('div');
    this.wrapperBox.className = 'selector-wrapper';

    this.menuBox = document.createElement('div');
    this.menuBox.className = 'selector-menu scroll-y';
    this.menuBox.innerHTML = `<span class="menu-warn"></span>`;

    this.footerBox = document.createElement('div');
    this.footerBox.className = 'selector-footer';

    this.wrapperBox.append(this.menuBox, this.footerBox);

    this.menuBox.addEventListener('scroll', () => {
      let { scrollTop, clientHeight, scrollHeight } = this.menuBox;
      if (scrollTop + clientHeight < scrollHeight - 1) return;
      this.#loadNextChunk();
    });

    this.menuBox.addEventListener('click', ev => {
      let menuIndex = ev.target.closest('.menu-index');
      if (!menuIndex) return;
      let id = parseInt(menuIndex.dataset.id);
      if (this.options.associative) {
        menuIndex.remove();
      }
      this.#select(id);
    });
  }

  reset() {
    this.#selected.forEach(selectedData => selectedData.closeAnchor.click());
  }

  /** 
   * Realiza una búsqueda en el servidor con el valor proporcionado 
   * @param {string} value 
   */
  search(value = '') {
    this.#chunkCounter = 0;
    this.#currentSearch = value?.trim() || '';
    this.#data.clear();  // Limpia los datos en cada nueva búsqueda
    this.menuBox.innerHTML = '';
    this.#loadNextChunk();
  }

  /**
   * vuelve a pintar todas las opciones y lo seleccionado relativo a la data guardada
   * @param {boolean} reboot verdadero para rememplazar por la data actual
   * @returns 
   */
  draw(reboot) {
    this.menuBox.innerHTML = '';
    if (reboot)
      return this.#loadNextChunk(0, this.#chunkSize * this.#chunkCounter);

    this.#data.forEach(item => this.menuBox.append(
      this.#createSelectorBox(item.id, item.name, item.src)
    ));
  }

  /**
   *  Selecciona un elemento del servidor usando el ID 
   * @param {number} id 
   * @returns {Promise<IndexSeleted>}
   */

  select(id) {
    return new Promise(res => {
      if (typeof id !== 'number') return;
      if (id == NaN) return;

      this.#callback(
        {
          search: id,
          byId: true,
          start: 0,
          length: 1,
          order: 'desc',
          noInclude: []
        },
        ({ data: [indexData] }) => {
          if (!indexData) return;

          let selectedBox = this.#createSelectedBox(indexData.name);
          let closeAnchor = selectedBox.querySelector('a');

          closeAnchor.addEventListener('click', () => {
            this.event.emit('close', data);
            indexData.selected = 0;
            selectedBox.remove();
            this.#selected.delete(id);
            this.#renderFooter();
          }, { once: true });

          let data = { id, indexData, selectedBox, closeAnchor };
          this.#selected.set(id, data);
          this.event.emit('select', data);

          indexData.selected = 1;
          this.#renderFooter();

          res(data);
        }
      );
    })
  }

  /**
   * Actualiza un elemento en #data y en #selected, y actualiza el HTML si está seleccionado 
   * @param {number} id 
   * @param {IndexData} newData 
   */
  set(id, newData) {
    this.#data.set(id, newData);
    if (this.#selected.has(id)) {
      let selectedData = this.#selected.get(id);
      selectedData.indexData = newData;
      selectedData.selectedBox.querySelector('span').textContent = newData.name;
    }
  }

  /** 
   * Elimina un elemento de #data y de #selected si existe en ambos 
   * @param {number} id 
   */
  delete(id) {
    if (this.#selected.has(id)) {
      let selectedData = this.#selected.get(id);
      selectedData.closeAnchor.click();
    }

    if (this.#data.has(id)) {
      let indexData = this.#data.get(id);
      indexData.selectorBox?.remove();
      this.#data.delete(id);
    }

  }

  #loadNextChunk(start = this.#chunkSize * this.#chunkCounter, length = this.#chunkSize) {
    if (this.#blocked) return;
    if (this.#recordsFiltered < start) return;

    this.#blocked = true;
    this.#callback(
      {
        start,
        length,
        byId: false,
        search: this.#currentSearch,
        order: this.options.order || 'desc',
        noInclude: this.options.noInclude ? Array.from(this.#selected.keys()) : []
      },
      response => {
        response.data.forEach(item => {
          item.selectorBox = this.#createSelectorBox(item.id, item.name, item.src)
          this.#data.set(item.id, item);
          this.menuBox.append(item.selectorBox);
        });

        this.#recordsFiltered = response.recordsFiltered;
        this.#recordsTotal = response.recordsTotal;

        this.#chunkCounter++;
        this.#renderFooter();
        this.#blocked = false;
      }
    );
  }

  #select(id) {
    if (!this.#data.has(id)) return;

    let indexData = this.#data.get(id);
    if (indexData.selected === 1) return;

    let selectedBox = this.#createSelectedBox(indexData.name);
    let closeAnchor = selectedBox.querySelector('a');

    closeAnchor.addEventListener('click', () => {
      this.event.emit('close', data);
      indexData.selected = 0;
      selectedBox.remove();
      this.#selected.delete(id);
      this.#renderFooter();
    }, { once: true });

    let data = { id, indexData, selectedBox, closeAnchor };
    this.#selected.set(id, data);
    this.event.emit('click', data);

    indexData.selected = 1;
    this.#renderFooter();

    return data;
  }

  #createSelectedBox(name) {
    let selectedBox = document.createElement('div');
    selectedBox.innerHTML = `<span>${name}</span><a><i class="bx bx-x"></i></a>`;
    return selectedBox;
  }

  #createSelectorBox(id, name, src) {
    let selectorBox = document.createElement('div');
    selectorBox.dataset.id = id;
    selectorBox.className = 'menu-index';
    selectorBox.innerHTML = this.options.showIndex
      ? this.options.showIndex === 'img'
        ? `<img src="${src}"><span>${name}</span>`
        : `<small>${id}</small><span>${name}</span>`
      : `<span>${name}</span>`;
    return selectorBox;
  }

  #renderFooter() {
    this.footerBox.innerHTML = `<small>Mostrando ${Math.min(this.#chunkCounter * this.#chunkSize, this.#recordsFiltered)} de ${this.#recordsFiltered} filtrados</small><br><small>Total: ${this.#recordsTotal}</small>`;
  }
}

class SelectorInput extends EventListener {
  /** @type {IndexSeleted[]} */
  selected = [];

  /** 
   * @param {HTMLInputElement} inputElement 
   * @param {OptionsServerside} selectorClass  
   * @param {{ autohide?: boolean, multi?: boolean }} options 
   */
  constructor(inputElement, selectorClass, options = {}) {
    if (!(inputElement instanceof HTMLInputElement)) throw new TypeError('El elemento no es un input.');
    if (!(selectorClass instanceof OptionsServerside)) throw new TypeError('Se requiere una instancia de SelectorServerside.');

    super();
    this.inputElement = inputElement;
    this.selectorClass = selectorClass;
    this.options = {
      multi: Boolean(options?.multi),
      autoHide: Boolean(options?.autohide)
    };
    this.isDisabled = inputElement.disabled;

    inputElement.insertAdjacentHTML('beforebegin', '<div class="selected-collection"></div>');
    this.collectionBox = inputElement.previousElementSibling;

    if (!this.isDisabled) {
      selectorClass.event.on('click', (data) => this.#handleSelect(data), { persistence: true });
      selectorClass.event.on('close', (data) => this.#handleDeselect(data), { persistence: true });

      let timeoutId;
      this.inputElement.addEventListener('input', e => {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => {
          this.emit('input', inputElement.value);
          selectorClass.search(inputElement.value);
        }, 300);
      });

      this.inputElement.addEventListener('focusin', e => {
        this.emit('focusin', e);
        this.inputElement.parentNode.append(selectorClass.wrapperBox);
        selectorClass.search(inputElement.value);
      });

      this.inputElement.addEventListener('focusout', e => {
        this.emit('focusout', e);
        setTimeout(() => {
          selectorClass.wrapperBox.remove();
        }, 200);
      });
    }
  }

  #handleSelect(data) {
    if (this.selectorClass.wrapperBox.parentNode !== this.inputElement.parentNode) return;

    if (!this.options.multi) {
      let previousSelection = this.selected[0];
      if (previousSelection) {
        previousSelection.closeAnchor.click();
        this.emit('change', previousSelection, data);
      }
      this.selected = [data];
    } else {
      this.selected.push(data);
    }

    this.collectionBox.append(data.selectedBox);
    this.emit('selected', data);

    if (this.options.autoHide) this.inputElement.style.display = 'none';
    this.inputElement.value = '';
  }

  #handleDeselect(data) {
    if (data.selectedBox.closest('.selected-collection') !== this.collectionBox) return;

    if (!this.options.multi) {
      this.selected = [];
      if (this.options.autoHide) this.inputElement.style.display = '';
    } else {
      let index = this.selected.findIndex(item => item === data);
      if (index !== -1) this.selected.splice(index, 1);
    }

    this.emit('deselected', data);
  }

  async select(id) {
    id = Number(id);
    let IndexSeleted = await this.selectorClass.select(id);

    if (!this.options.multi) {
      let previousSelection = this.selected[0];
      if (previousSelection) {
        previousSelection.closeAnchor.click();
        this.emit('change', previousSelection, IndexSeleted);
      }
      this.selected = [IndexSeleted];
    } else {
      this.selected.push(IndexSeleted);
    }

    this.collectionBox.append(IndexSeleted.selectedBox);
    this.emit('selected', IndexSeleted);

    if (this.options.autoHide) this.inputElement.style.display = 'none';
  }

  deselect(id) {
    id = Number(id);
    if (id == NaN) return;

    if (!this.options.multi) {
      if (this.selected[0].id != id && !this.selected[0]?.closeAnchor) return;

      if (this.options.autoHide) this.inputElement.style.display = '';
      this.selected[0].closeAnchor.click();
    } else {
      let selectedIndex = this.selected.findIndex(item => item.id === id);
      if (selectedIndex == -1) return;

      this.selected[selectedIndex]?.closeAnchor.click();
      this.selected.splice(selectedIndex, 1);
    }
  }

  empty() {
    if (!this.selected.length) return;
    this.selected.forEach(data => data.closeAnchor.click());
  }
}