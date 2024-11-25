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
 * }} Item 
 */

/** 
 * @typedef {{
 *   value?: string,
 *   code?: string,
 *   rangeMin?: number,
 *   rangeMax?: number,
 *   nameTags?: number[]
 * }} CatalogueFilter
 */

/** 
 * @typedef {{
 *   filter: CatalogueFilter,
 *   order: 'asc'|'desc',
 *   start: number,
 *   length: number
 * }} CatalogueRequest
 */

/**
 * @typedef {(CatalogueResponse: {
 *   data: Item[],
 *   recordsFiltered: number,
 *   recordsTotal: number
 * })=>void} CatalogueEnd
 */

class Catalogue {
  /** 
   * @type {EventListener<{
   *   search: CatalogueFilter,
   *   load: CatalogueRequest,
   *   complete: CatalogueRequest
   * }>} 
   */
  ev = new EventListener;
  /** @type {Map<number, {data:Item, productHTML:HTMLDivElement}>} */
  #data = new Map;
  #chunkSize = 0;
  #chunkCurrent = 0;
  #totalItems = 0;
  #order = 'asc';
  #searchParams = {};
  /**
   * @param {HTMLDivElement} catalogoBox - Elemento donde se va a renderizar el catálogo
   * @param {(req: CatalogueRequest, end: CatalogueEnd)=>void} fetchCallback - Callback para solicitar los productos al servidor
   * @param {(item: Item)=>string} factoryCallback - Callback para generar el HTML de los productos
   * @param {number} length - Número de productos por página
   */
  constructor(catalogoBox, fetchCallback, factoryCallback, length = 20) {
    this.fetchCallback = fetchCallback;
    this.factoryCallback = factoryCallback;
    this.#chunkSize = length;

    catalogoBox.classList.add('catalogue-content');
    catalogoBox.innerHTML = `<div class="catalogue-footer"><div class="catalogue-details"><span class="paginator-length"></span><span class="paginator-show"></span></div><div class="catalogue-paginator"></div></div><div class="catalogue-grid"></div>`;

    this.catalogoBox = catalogoBox;
    this.catalogoGrid = catalogoBox.querySelector('.catalogue-grid');
    this.paginatorLength = catalogoBox.querySelector('.paginator-length');
    this.paginatorShow = catalogoBox.querySelector('.paginator-show');
    this.catalogoPaginator = catalogoBox.querySelector('.catalogue-paginator');

    this.draw();
  }

  /** @param {Item | (data:Item)=>void} data */
  set(id, data, about = true) {
    if (!this.#data.has(id)) return;
    let d = this.#data.get(id);
    if (typeof data == 'function')
      data(d.data)
    else if (about)
      d.data = { ...d.data, ...data };
    d.productHTML.innerHTML = this.factoryCallback(d.data);
  }

  delete(id) {
    if (!this.#data.has(id)) return;
    let d = this.#data.get(id);
    d.productHTML.remove();
    this.#data.delete(id)
  }

  /** @param {CatalogueFilter} searchParams */
  filter(searchParams) {
    this.#searchParams = searchParams;
    this.draw();
  }

  /** @param {number} pageIndex */
  draw(pageIndex = 0) {
    this.#chunkCurrent = pageIndex;
    this.catalogoGrid.innerHTML = '';

    this.fetchCallback(
      {
        filter: this.#searchParams,
        order: this.#order,
        start: this.#chunkSize * pageIndex,
        length: this.#chunkSize
      },
      (response) => {
        this.#totalItems = response.recordsTotal || 0;
        this.#renderProducts(response.data);
        this.#renderPaginator();
      }
    );
  }

  /** @param {Item[]} items  */
  #renderProducts(items) {
    let visibles = 0;
    this.#data.clear()
    items?.forEach(data => {
      let productHTML = document.createElement('div');
      productHTML.classList.add('product-box');
      productHTML.dataset.id = data.id;
      productHTML.innerHTML = this.factoryCallback(data);
      this.catalogoGrid.append(productHTML);
      visibles++;
      this.#data.set(data.id, { data, productHTML });
    });

    let start = this.#chunkSize * this.#chunkCurrent;
    this.paginatorLength.innerText = `Mostrando de ${start + 1} a ${start + visibles}, de ${this.#totalItems} entradas`;
    this.paginatorShow.innerText = `Visibles ${visibles}`;
  }

  #renderPaginator() {
    let totalPages = Math.ceil(this.#totalItems / this.#chunkSize);
    this.catalogoPaginator.innerHTML = '';

    this.catalogoPaginator.append(
      this.#createButton('Primero', () => this.draw(0), this.#chunkCurrent === 0)
    );

    this.catalogoPaginator.append(
      this.#createButton('Anterior', () => this.draw(this.#chunkCurrent - 1), this.#chunkCurrent === 0)
    );

    for (let i = Math.max(0, this.#chunkCurrent - 2); i <= Math.min(totalPages - 1, this.#chunkCurrent + 2); i++) {
      let pageBtn = this.#createButton(i + 1, () => this.draw(i), i === this.#chunkCurrent);
      if (i === this.#chunkCurrent) pageBtn.classList.add('active');
      this.catalogoPaginator.append(pageBtn);
    }

    this.catalogoPaginator.append(
      this.#createButton('Siguiente', () => this.draw(this.#chunkCurrent + 1), this.#chunkCurrent === totalPages - 1)
    );

    this.catalogoPaginator.append(
      this.#createButton('Último', () => this.draw(totalPages - 1), this.#chunkCurrent === totalPages - 1)
    );
  }

  #createButton(text, onClick, disabled = false) {
    let button = document.createElement('button');
    button.className = 'pag';
    button.innerText = text;
    button.disabled = disabled;
    button.addEventListener('click', onClick);
    return button;
  }
}