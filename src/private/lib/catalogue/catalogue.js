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

  /** 
   * @typedef {{
   *   data:item, 
   *   catalogueProduct: HTMLDivElement, 
   *   imagen: HTMLImageElement,
   *   productCounter: HTMLSpanElement,
   *   detailName: HTMLSpanElement,
   *   detailCategory: HTMLSpanElement,
   *   detailDescription: HTMLParagraphElement,
   *   detailCode: HTMLSpanElement,
   *   detailPrice: HTMLSpanElement,
   *   isShow:boolean
   * }} dataCollection 
   */

  class Catalogue {
    /** @type {dataCollection[]} */
    collection = {};
    idsFilter = [];
    /** @param {HTMLDivElement} catalogoBox  */
    constructor(catalogoBox, length = 20) {
      catalogoBox.classList.add('catalogue-content');
      catalogoBox.innerHTML = `<div class="catalogue-footer"><div class="catalogue-details"><span class="paginator-length"></span><span class="paginator-show"></span></div><div class="catalogue-paginator"></div></div><div class="catalogue-grid"></div>`;
      this.catalogoBox = catalogoBox;
      this.catalogoGrid = catalogoBox.querySelector('.catalogue-grid');
      this.paginatorLength = catalogoBox.querySelector('.paginator-length');
      this.paginatorShow = catalogoBox.querySelector('.paginator-show');
      this.catalogoPaginator = catalogoBox.querySelector('.catalogue-paginator');
      this.length = length;
    }
    #factory({ id, producto, descripcion, cantidad, codigo, src, venta, categoria_id, categoria_nombre }) {
      let catalogueProduct = document.createElement('div');
      catalogueProduct.classList.add('product-box');
      catalogueProduct.dataset.id = id;
      catalogueProduct.innerHTML = `<div class="product"><div class="product-imagen"><img src="${src}" class="imagen"><span class="product-counter">${cantidad}</span></div><div class="product-details"><span class="detail-name">${producto}</span><span class="detail-category">${categoria_nombre}</span><p class="detail-description scroll-y">${descripcion}</p><div class="details-data"><span class="detail-code">${codigo}</span><span class="detail-price">s/ ${venta}</span> </div></div></div>`;
      this.collection[id] = {
        data: {
          id,
          producto,
          descripcion,
          codigo,
          src,
          venta,
          categoria_id,
          categoria_nombre
        },
        catalogueProduct,
        imagen: catalogueProduct.querySelector('.imagen'),
        productCounter: catalogueProduct.querySelector('.product-counter'),
        detailName: catalogueProduct.querySelector('.detail-name'),
        detailCategory: catalogueProduct.querySelector('.detail-category'),
        detailDescription: catalogueProduct.querySelector('.detail-description'),
        detailCode: catalogueProduct.querySelector('.detail-code'),
        detailPrice: catalogueProduct.querySelector('.detail-price'),
        isShow: true
      };
    }
    /** @param {item[]} datas  */
    charge(datas) {
      datas.forEach(data => this.#factory(data));
      this.filter();
    }
    insert(data) {
      this.#factory(data);
    }
    /** @param {number} id @param {item} data  */
    update(id, data) {
      if (!this.collection.hasOwnProperty(id)) return;
      let collection = this.collection[id];
      data = { ...collection.data, ...data };
      collection.data = data;

      collection.imagen.src = data.src;
      collection.productCounter.textContent = data.cantidad;
      collection.detailName.textContent = data.producto;
      collection.detailCategory.textContent = data.categoria_nombre;
      collection.detailDescription.textContent = data.descripcion;
      collection.detailCode.textContent = data.codigo;
      collection.detailPrice.textContent = data.venta;
    }
    delete(id) {
      if (!this.collection.hasOwnProperty(id)) return;
      let { catalogueProduct } = this.collection[id];
      catalogueProduct.remove()
      delete this.collection[id];
    }
    /** @param {(this:HTMLDivElement, data:item, index:number)=>boolean} callback  */
    filter(callback) {
      if (!callback) {
        this.idsFilter = Object.keys(this.collection);
      }
      else {
        this.idsFilter = [];
        for (let id in this.collection)
          if (callback(this.collection[id].data, id)) this.idsFilter.push(id);
      }
      this.draw();
    }

    draw() {
      const totalLength = this.idsFilter.length;
      if (totalLength === 0) {
        this.catalogoGrid.innerHTML = '';
        this.paginatorLength.innerText = 'No hay productos disponibles';
        this.paginatorShow.innerText = '0';
        return;
      }
      const pagLength = Math.ceil(totalLength / this.length);
      let paginator = [];
      let anchorNow;

      this.catalogoPaginator.innerHTML = '';

      for (let b = 0; b < pagLength; b++) {
        let anchor = document.createElement('a');
        anchor.classList.add('pag');
        anchor.innerText = b + 1;

        let start = b * this.length;
        let end = Math.min(start + this.length, totalLength);

        let click = () => {
          anchorNow?.classList?.remove('active');
          this.#show(this.idsFilter.slice(start, end));
          this.paginatorLength.innerText = `Mostrando de ${start + 1} a ${end}, de ${this.idsFilter.length} entradas`;
          this.paginatorShow.innerText = `Visibles ${end - start}`;
          anchor.classList.add('active');
          anchorNow = anchor;
        };

        anchor.addEventListener('click', click);
        paginator.push({ anchor, click });

        this.catalogoPaginator.append(anchor);
      }

      anchorNow = paginator[0].anchor;
      paginator[0].click();
    }
    #show(data) {
      this.catalogoGrid.innerHTML = '';
      data.forEach(id => {
        let { isShow, catalogueProduct } = this.collection[id];
        if (isShow) this.catalogoGrid.append(catalogueProduct);
      });
    }
  }

  window.Catalogue = Catalogue;
})();