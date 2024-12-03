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
 *   draw: number,
 *   filter: CatalogueFilter,
 *   order: 'asc'|'desc',
 *   visibility: boolean,
 *   start: number,
 *   length: number
 * }} CatalogueRequest
 */

/**
 * @typedef {{
 *   draw: number,
 *   data: Item[],
 *   recordsFiltered: number,
 *   recordsTotal: number
 * }} CatalogueResponse
 */

/**
 * @typedef {(catalogueResponse: CatalogueResponse)=>void} CatalogueEnd
 */

class Catalogue {



  /**
   * @type {EventListener<{
   *   order: string,
   *   visibility: boolean,
   *   search: CatalogueFilter,
   *   load: CatalogueRequest,
   *   complete: CatalogueResponse
   * }>}
   */
  ev = new EventListener;



  /** @type {Map<number, {data:Item, productHTML:HTMLDivElement}>} */
  #data = new Map;



  /** @type {'desc'|'asc'} */
  #order = 'asc';
  #visibility = false;
  #searchParams = {};



  #draw = 0;
  #chunkSize = 0;
  #chunkCurrent = 0;
  #totalItems = 0;
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
    catalogoBox.innerHTML = `<div class="catalogue-header"><div class="catalogue-details"><span class="paginator-length"></span><span class="paginator-show"></span></div><div class="catalogue-controls"><button class="btn-sort"><i class="bx bx-sort-a-z"></i></button><button class="btn-visibility"><i class="bx bx-show"></i></button></div></div><div class="catalogue-grid"></div><div class="catalogue-footer"><div class="catalogue-paginator"></div></div>`;

    this.catalogoBox = catalogoBox;
    this.catalogoGrid = catalogoBox.querySelector('.catalogue-grid');
    this.paginatorLength = catalogoBox.querySelector('.paginator-length');
    this.paginatorShow = catalogoBox.querySelector('.paginator-show');
    this.catalogoPaginator = catalogoBox.querySelector('.catalogue-paginator');
    this.sortButton = catalogoBox.querySelector('.btn-sort');
    this.visibilityButton = catalogoBox.querySelector('.btn-visibility');

    this.sortButton.addEventListener('click', () => this.#toggleSort().draw());
    this.visibilityButton.addEventListener('click', () => this.#toggleVisibility().draw());
  }

  /** @param {'desc'|'asc'} direction  */
  set order(direction) {
    this.#order = direction == 'asc' ? 'asc' : 'desc';
    this.#toggleSort(this.#order)
  }

  /** @param {boolean} hide  */
  set visibility(hide = true) {
    this.#visibility = !!hide;
    this.#toggleVisibility(this.#visibility)
  }

  get orderGet() {
    return this.#order;
  }

  get visibilityGet() {
    return this.#visibility;
  }

  #toggleSort(order = this.#order === 'asc' ? 'desc' : 'asc') {
    this.#order = order;
    this.ev.emit('order', order);
    const icon = this.#order === 'asc' ? 'bx-sort-a-z' : 'bx-sort-z-a';
    this.sortButton.querySelector('i').className = `bx ${icon}`;
    return this;
  }

  #toggleVisibility(visibility = !this.#visibility) {
    this.#visibility = visibility;
    this.ev.emit('visibility', visibility);
    const icon = this.#visibility ? 'bx-show' : 'bx-hide';
    this.visibilityButton.querySelector('i').className = `bx ${icon}`;
    return this;
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
    this.ev.emit('search', searchParams);
    this.#searchParams = searchParams;
    return this;
  }

  /** @param {number} pageIndex */
  draw(pageIndex = this.#chunkCurrent) {
    this.#draw++;
    let req = {
      draw: this.#draw,
      filter: this.#searchParams,
      order: this.#order,
      visibility: this.#visibility,
      start: this.#chunkSize * pageIndex,
      length: this.#chunkSize
    }

    this.ev.emit('load', req);
    this.fetchCallback(req, res => {
      if (req.draw != res.draw) return;

      this.ev.emit('complete', res);
      this.#chunkCurrent = pageIndex;
      this.#totalItems = res.recordsTotal || 0;
      this.#renderProducts(res);
      this.#renderPaginator();
    });

    return this.#draw
  }

  /** @param {CatalogueResponse} param1  */
  #renderProducts({ data: items = [], draw }) {
    let visibles = 0;

    let setId = new Set(items.map(i => i.id));

    this.#data.forEach((d, k) => {
      d.productHTML.remove();
      if (!setId.has(k)) this.#data.delete(k);
    })

    let everyCreate = items.every(data => {
      if (draw != this.#draw) return false;

      let has = this.#data.has(data.id);

      let productHTML = has
        ? this.#data.get(data.id).productHTML
        : document.createElement('div');

      if (!has) {
        productHTML.classList.add('product-box');
        productHTML.id = data.id;
      }

      productHTML.innerHTML = this.factoryCallback(data);
      this.#data.set(data.id, { data, productHTML });
      this.catalogoGrid.append(productHTML);
      visibles++;
      return true;
    })

    if (!everyCreate) return;

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