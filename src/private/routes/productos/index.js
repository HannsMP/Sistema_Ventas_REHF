$('.content-body').ready(async () => {
  try {
    /* 
      ==================================================
      ==================== SELECTOR ====================
      ==================================================
    */

    let dataSelectorCategorias = new OptionsServerside(
      (req, end) => socket.emit('/selector/categorias', req, res => end(res)),
      { showIndex: false, order: 'asc', noInclude: true }
    );

    /* ===================== SOCKET ===================== */

    socket.on('/categorias/data/insert', data => {
      dataSelectorCategorias.set(data.id, data.nombre);
    })

    socket.on('/categorias/data/updateId', data => {
      dataSelectorCategorias.set(data.id, { name: data.nombre });
    })

    socket.on('/categorias/data/state', async data => {
      if (data.estado)
        dataSelectorCategorias.draw(true);
      else
        dataSelectorCategorias.delete(data.id);
    })

    socket.on('/categorias/data/deleteId', data => {
      dataSelectorCategorias.delete(data.id);
    })

    /* 
      ==================================================
      ===================== FILTRO =====================
      ==================================================
    */

    let tableNuevo = document.getElementById('categoria-filtro');
    let cardBody = tableNuevo.querySelector('.card-body')
    let filtroCodigo = tableNuevo.querySelector('input[name=codigo]');
    let filtroProducto = tableNuevo.querySelector('input[name=producto]');
    let filtroSelector = tableNuevo.querySelector('input.selector');
    let filtroRange = tableNuevo.querySelector('#range-box');
    let btnFiltro = tableNuevo.querySelector('.btn');

    /* 
      ==================================================
      =================== RANGE INPUT ===================
      ==================================================
    */

    let filtroPriceRange = new InputRange(
      filtroRange,
      { min: 0, max: 500, step: 5, gap: 10 }
    );

    /* 
      ==================================================
      ================= SELECTOR MULTI =================
      ==================================================
    */

    let filtroSelectorMulti = new SelectorInput(
      filtroSelector,
      dataSelectorCategorias,
      { multi: true }
    );

    /* 
      ==================================================
      ==================== CATALOGUE ====================
      ==================================================
    */

    let catalogoBox = document.getElementById('catalogo');

    let catalogo = new Catalogue(
      catalogoBox,
      (req, end) => socket.emit('/read/catalogue', req, res => end(res)),
      data => `
        <div class="product">
          <div class="product-imagen">
            <img src="${data.src}" class="imagen">
            <span class="product-counter">${data.stock_disponible}</span>
          </div>
          <div class="product-details">
            <span class="detail-name">${data.producto}</span>
            <span class="detail-category">${data.categoria_nombre}</span>
            <p class="detail-description scroll-y">${data.descripcion}</p>
            <div class="details-data">
              <span class="detail-code">${data.codigo}</span>
              <span class="detail-price">s/ ${data.venta?.toFixed(2)}</span>
            </div>
          </div>
        </div>
      `,
      20
    );

    /* 
      ==================================================
      ==================== filtro ====================
      ==================================================
    */


    catalogo.ev.on('load', () => cardBody.classList.add('load-spinner'));
    catalogo.ev.on('complete', () => cardBody.classList.remove('load-spinner'));

    let updUrl = (producto, codigo, selected) => {
      let url = new URL(window.location.href);

      if (producto) {
        if (url.searchParams.has('producto'))
          url.searchParams.set('producto', producto);
        else
          url.searchParams.append('producto', producto);
      }
      else
        url.searchParams.delete('producto');

      if (codigo) {
        if (url.searchParams.has('codigo'))
          url.searchParams.set('codigo', codigo);
        else
          url.searchParams.append('codigo', codigo);
      }
      else
        url.searchParams.delete('codigo');

      if (selected.size) {
        if (url.searchParams.has('selected'))
          url.searchParams.set('selected', [...selected].join(','));
        else
          url.searchParams.append('selected', [...selected].join(','));
      }
      else
        url.searchParams.delete('selected');

      history.pushState({}, '', url.toString());
    }

    let search = (change = true) => {
      /** @type {string} */
      let findProducto = filtroProducto.value;
      /** @type {string} */
      let findCodigo = filtroCodigo.value;
      /** @type {number[]} */
      let findSelected = filtroSelectorMulti.selected.map(s => Number(s.id));

      if (change)
        updUrl(findProducto, findCodigo, findSelected);

      catalogo.filter({
        value: findProducto,
        code: findCodigo,
        nameTags: findSelected,
        rangeMax: filtroPriceRange.max,
        rangeMin: filtroPriceRange.min
      });
    }

    btnFiltro.addEventListener('click', () => search());
    document.addEventListener('keydown', ({ key }) => key == 'Enter' && search());

    /* 
      ==================================================
      ====================== href ======================
      ==================================================
    */

    let url = new URL(window.location.href);
    let hasproducto = url.searchParams.has('producto');
    let hascodigo = url.searchParams.has('codigo');
    let hasselected = url.searchParams.has('selected');

    if (hasproducto || hascodigo || hasselected) {

      let Producto = url.searchParams.get('producto') || '';
      if (hasproducto) filtroProducto.value = Producto;

      let Codigo = url.searchParams.get('codigo') || '';
      if (hascodigo) filtroCodigo.value = Codigo;

      let Selected = url.searchParams.get('selected')?.split(',') || [];
      if (hasselected) Selected.forEach(id => filtroSelectorMulti.select(id));

      search(false);
    }

    /* ===================== SOCKET ===================== */

    socket.on('/productos/data/insert', () => {
      catalogo.draw();
    })

    socket.on('/productos/data/updateId', data => {
      catalogo.set(data.id, {
        codigo: data.codigo,
        producto: data.producto,
        descripcion: data.descripcion,
        venta: data.venta,
        stock_disponible: data.stock_disponible,
        categoria_id: data.categoria_id,
        categoria_nombre: data.categoria_nombre,
        src: data.foto_src
      })
    })

    socket.on('/productos/data/updateIdBussines', data => {
      catalogo.set(data.id, d => {
        if (0 < data.stock_disponible)
          d.venta = data.venta
        d.stock_disponible += data.stock_disponible;
      })
    })

    socket.on('/productos/data/state', data => {
      if (data.estado)
        catalogo.draw();
      else
        catalogo.delete(data.id);
    })

    socket.on('/productos/data/deleteId', data => {
      catalogo.delete(data.id);
    })

    socket.on('/productos/categorias/state', data => {
      if (data.estado)
        catalogo.draw();
      else
        data.data.forEach(d => catalogo.delete(d.id))
    })

  } catch ({ message, stack }) {
    socket.emit('/err/client', { message, stack, url: window.location.href })
  }
})