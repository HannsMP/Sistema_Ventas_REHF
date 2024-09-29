(() => {

  /*
    ----------------------------------------------------
    ---------------------- Catalogue --------------------
    ----------------------------------------------------
  */

  /** 
   * @typedef {{
  *   id:number,
  *   src:string,
  *   cantidad: number,
  *   producto:string,
  *   categoria_id:number,
  *   categoria_nombre:string,
  *   descripcion: string,
  *   codigo:string,
  *   venta: string
  * }} item 
  */

  /** @extends {Map<string, item>} */
  class Catalogue extends Map {
    /** @type {string[]} */
    #chunks = [];
    #chunkSize = 0;
    #chunkCurrent = 0;

    /**
     * @param {HTMLDivElement} catalogoBox - Elemento donde se va a renderizar el catálogo
     * @param {Function} factoryCallback - Callback para generar el HTML de los productos
     * @param {item[]} datas - Lista de objetos a cargar en el catálogo
     * @param {number} length - Número de productos por página
     */
    constructor(catalogoBox, factoryCallback, datas = [], length = 20) {
      super();
      this.factoryCallback = factoryCallback;
      this.#chunkSize = length;
      catalogoBox.classList.add('catalogue-content');
      catalogoBox.innerHTML = `
        <div class="catalogue-footer">
          <div class="catalogue-details">
            <span class="paginator-length"></span>
            <span class="paginator-show"></span>
          </div>
          <div class="catalogue-paginator"></div>
        </div>
        <div class="catalogue-grid"></div>`;

      this.catalogoBox = catalogoBox;
      this.catalogoGrid = catalogoBox.querySelector('.catalogue-grid');
      this.paginatorLength = catalogoBox.querySelector('.paginator-length');
      this.paginatorShow = catalogoBox.querySelector('.paginator-show');
      this.catalogoPaginator = catalogoBox.querySelector('.catalogue-paginator');

      datas.forEach(data => this.set(data.id, { ...data }));
      if (datas.length) this.reset();
    }

    set(id, item) {
      id = String(id);
      super.set(id, item);
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
      this.#chunks = [...super.keys()]
      this.draw(0);
    }
    /** 
     * @param {(data: item) => boolean} callback 
     */
    filter(callback) {
      this.#chunks = [];
      if (!callback) return;

      this.forEach((item, id) => {
        let is = callback(item);
        if (is) this.#chunks.push(id);
      })

      this.draw(0);
    }

    /** @param {number} pageIndex  */
    draw(pageIndex) {
      let maxIndex = Math.ceil(this.#chunks.length / this.#chunkSize);
      if (pageIndex < 0)
        this.#chunkCurrent = 0;
      else if (maxIndex < pageIndex)
        this.#chunkCurrent = maxIndex;
      else
        this.#chunkCurrent = pageIndex;

      this.catalogoGrid.innerHTML = '';
      this.#loadPage();
      this.#loadPaginator();
    }

    #loadPage() {
      let start = this.#chunkSize * this.#chunkCurrent;
      let end = start + this.#chunkSize;
      if (this.#chunks.length < start) return;

      let chunks = this.#chunks.slice(start, end).filter(chunkId => this.has(chunkId));

      let visibles = 0;
      chunks.forEach(id => {
        let data = this.get(id);
        let productHTML = document.createElement('div');
        productHTML.classList.add('product-box');
        productHTML.dataset.id = id;
        productHTML.innerHTML = this.factoryCallback(data);
        this.catalogoGrid.append(productHTML);
        visibles++
      });

      this.paginatorLength.innerText = `Mostrando de ${start + 1} a ${start + visibles}, de ${this.size} entradas`;
      this.paginatorShow.innerText = `Visibles ${visibles}`;
    }

    #loadPaginator() {
      const totalLength = this.size;
      if (totalLength === 0) {
        this.catalogoGrid.innerHTML = '';
        this.paginatorLength.innerText = 'No hay productos disponibles';
        this.paginatorShow.innerText = '0';
        return;
      }

      const totalPages = Math.ceil(this.#chunks.length / this.#chunkSize);
      this.catalogoPaginator.innerHTML = '';

      this.catalogoPaginator.append(
        this.#createButton(
          'Primero',
          () => this.draw(0), this.#chunkCurrent === 0
        )
      );

      this.catalogoPaginator.append(
        this.#createButton(
          'Anterior',
          () => this.draw(this.#chunkCurrent - 1), this.#chunkCurrent === 0
        )
      );

      for (let i = Math.max(0, this.#chunkCurrent - 2); i <= Math.min(totalPages - 1, this.#chunkCurrent + 2); i++) {
        const pageBtn =
          this.#createButton(
            i + 1,
            () => this.draw(i), i === this.#chunkCurrent
          );
        if (i === this.#chunkCurrent) pageBtn.classList.add('active');
        this.catalogoPaginator.append(pageBtn);
      }

      this.catalogoPaginator.append(
        this.#createButton(
          'Siguiente',
          () => this.draw(this.#chunkCurrent + 1), this.#chunkCurrent === totalPages - 1
        )
      );

      this.catalogoPaginator.append(
        this.#createButton(
          'Último',
          () => this.draw(totalPages - 1), this.#chunkCurrent === totalPages - 1
        )
      );
    }

    #createButton(text, onClick, disabled = false) {
      const button = document.createElement('button');
      button.className = 'pag'
      button.innerText = text;
      button.disabled = disabled;
      button.addEventListener('click', onClick);
      return button;
    };
  }

  window.Catalogue = Catalogue;
})();