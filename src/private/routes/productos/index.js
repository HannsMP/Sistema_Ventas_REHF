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
    /** @type {HTMLInputElement} */
    let filtroCodigo = document.getElementById('filtro-codigo');
    /** @type {HTMLInputElement} */
    let filtroProducto = document.getElementById('filtro-nombre');
    /** @type {HTMLInputElement} */
    let filtroSelector = document.getElementById('filtro-categorias');
    /** @type {HTMLDivElement} */
    let filtroRange = document.getElementById('range-box');
    /** @type {HTMLAnchorElement} */
    let btnFiltro = tableNuevo.querySelector('.btn');

    /** @type {HTMLDivElement} */
    let catalogoBox = document.getElementById('catalogo');

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

    let catalogo = new Catalogue(
      catalogoBox,
      (req, end) => {
        socket.emit('/read/catalogue', req, res => end(res))
      },
      data => `
        <div class="product ${data.stock_disponible == 0 ? 'out' : ''}">
          <div class="product-imagen">
            <img src="${data.src}" class="imagen">
            <span class="product-counter">${!data.stock_disponible ? 'sin stock' : data.stock_disponible}</span>
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

    let updateUrl = () => {
      let producto = filtroProducto.value.trim();
      let codigo = filtroCodigo.value.trim();
      let selected = filtroSelectorMulti.selected.map(s => Number(s.id));
      let rangeMax = filtroPriceRange.max;
      let rangeMin = filtroPriceRange.min;
      let visibility = catalogo.visibilityGet;
      let order = catalogo.orderGet;

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

      if (selected?.length) {
        if (url.searchParams.has('selected'))
          url.searchParams.set('selected', [...selected].join(','));
        else
          url.searchParams.append('selected', [...selected].join(','));
      }
      else
        url.searchParams.delete('selected');

      if (0 < rangeMin) {
        if (url.searchParams.has('precio_min'))
          url.searchParams.set('precio_min', rangeMin);
        else
          url.searchParams.append('precio_min', rangeMin);
      }
      else
        url.searchParams.delete('precio_min');

      if (rangeMax < 500) {
        if (url.searchParams.has('precio_max'))
          url.searchParams.set('precio_max', rangeMax);
        else
          url.searchParams.append('precio_max', rangeMax);
      }
      else
        url.searchParams.delete('precio_max');

      if (visibility) {
        if (url.searchParams.has('visibility'))
          url.searchParams.set('visibility', visibility);
        else
          url.searchParams.append('visibility', visibility);
      }
      else
        url.searchParams.delete('visibility');

      if (order) {
        if (url.searchParams.has('order'))
          url.searchParams.set('order', order);
        else
          url.searchParams.append('order', order);
      }
      else
        url.searchParams.delete('order');

      history.pushState({}, '', url.toString());
    }

    filtroProducto.addEventListener('input', updateUrl);
    filtroCodigo.addEventListener('input', updateUrl);
    filtroSelectorMulti.on('selected', updateUrl);
    filtroSelectorMulti.on('deselected', updateUrl);
    filtroPriceRange.ev.on('changeMax', updateUrl);
    filtroPriceRange.ev.on('changeMin', updateUrl);
    catalogo.ev.on('visibility', updateUrl);
    catalogo.ev.on('order', updateUrl);

    let filter = () => {
      catalogo.filter({
        code: filtroProducto.value || '',
        value: filtroCodigo.value || '',
        nameTags: filtroSelectorMulti.selected.map(s => Number(s.id)),
        rangeMax: filtroPriceRange.max,
        rangeMin: filtroPriceRange.min
      }).draw();
    }

    btnFiltro.addEventListener('click', filter);
    document.addEventListener('keydown', ({ key }) => key == 'Enter' && catalogo.draw());

    /*
      ==================================================
      ====================== href ======================
      ==================================================
    */

    let initReadUrl = async () => {
      let url = new URL(window.location.href);
      let hasProducto = url.searchParams.has('producto');
      let hasCodigo = url.searchParams.has('codigo');
      let hasSelected = url.searchParams.has('selected');
      let hasPrecio_min = url.searchParams.get('precio_min');
      let hasPrecio_max = url.searchParams.get('precio_max');
      let hasVisibility = url.searchParams.get('visibility');
      let hasOrder = url.searchParams.get('order');

      let Producto = url.searchParams.get('producto') || '';
      if (hasProducto) filtroProducto.value = Producto;

      let Codigo = url.searchParams.get('codigo') || '';
      if (hasCodigo) filtroCodigo.value = Codigo;

      let Selected = url.searchParams.get('selected')?.split(',') || [];
      if (hasSelected)
        for (let id of Selected)
          await filtroSelectorMulti.select(id);

      let rangeMin = url.searchParams.get('precio_min') || '';
      if (hasPrecio_min) filtroPriceRange.min = Number(rangeMin);

      let rangeMax = url.searchParams.get('precio_max') || '';
      if (hasPrecio_max) filtroPriceRange.max = Number(rangeMax);

      let visibility = url.searchParams.get('visibility') || '';
      if (hasVisibility) catalogo.visibility = (visibility == 'true');

      let order = url.searchParams.get('order') || '';
      if (hasOrder) catalogo.order = order;

      filter();
    }

    initReadUrl()

    /* ===================== SOCKET ===================== */

    socket.on('/productos/data/insert', () => {
      catalogo.draw();
    })

    socket.on('/productos/data/updateId', data => {
      catalogo.set(data.id, data);
    })

    socket.on('/productos/data/updateIdBussines', data => {
      if (!data.id)
        return catalogo.draw();

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