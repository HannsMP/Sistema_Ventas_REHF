$('.content-body').ready(async () => {
  try {
    /* 
      ==================================================
      ==================== SELECTOR ====================
      ==================================================
    */

    let resCategorias = await query.post.cookie("/api/categorias/selector/readAll");

    /** @type {{err: string, OkPacket: import('mysql').OkPacket, list: {[column:string]: string|number}[]}} */
    let { list: dataCategorias } = await resCategorias.json();

    let dataSelectorCategorias = new Selector(dataCategorias);

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
    let btnFiltro = tableNuevo.querySelector('.btn');

    /* 
      ==================================================
      ================== SELECTOR MULTI ==================
      ==================================================
    */

    let filtroSelectorMulti = new SelectorMulti(filtroSelector, dataSelectorCategorias, true);

    /* 
      ==================================================
      ==================== CATALOGUE ====================
      ==================================================
    */

    let resProductosTbl = await query.post.cookie("/api/productos/paginator/readAll");

    /** @type {{err: string, OkPacket: import('mysql').OkPacket, list: {[column:string]: string|number}[]}} */
    let { list: dataProductos } = await resProductosTbl.json();

    let catalogoBox = document.getElementById('catalogo');
    let catalogo = new Catalogue(catalogoBox, 20);

    dataProductos.forEach(d => {
      d.venta = d.venta?.toFixed(2);
    })

    catalogo.charge(dataProductos);

    /* 
      ==================================================
      ==================== filtro ====================
      ==================================================
    */
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

      if (selected.length) {
        if (url.searchParams.has('selected'))
          url.searchParams.set('selected', selected.map(({ id }) => id).join(','));
        else
          url.searchParams.append('selected', selected.map(({ id }) => id).join(','));
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
      /** @type {Set<number>} */
      let findSelected = new Set(filtroSelectorMulti.selected.map(s => s.id));

      if (change)
        updUrl(findProducto, findCodigo, findSelected);

      if (findCodigo || findProducto || findSelected.size) {
        cardBody.classList.add('load-spinner');
        catalogo.filter(data => {
          /** @type {{ producto:string, codigo:string, categoria_id:number }} */
          let { producto, codigo, categoria_id } = data,
            is = false;

          if (findCodigo && findCodigo != '')
            is = is || codigo.startsWith(findCodigo);
          else
            is = true;

          if (findProducto && findProducto != '')
            is = is && producto.includes(findProducto);

          if (findSelected.size)
            is = is && findSelected.has(categoria_id);

          return is;
        });
        cardBody.classList.remove('load-spinner');
      }
      else
        catalogo.filter();
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

    socket.on('/productos/data/insert', data => {
      catalogo.insert({
        id: data.id,
        codigo: data.codigo,
        producto: data.producto,
        descripcion: data.descripcion,
        venta: 's/ ' + data.venta.toFixed(2),
        cantidad: data.cantidad,
        categoria_id: data.categoria_id,
        categoria_nombre: data.categoria_nombre,
        src: data.foto_src
      });
      search(false);
    })

    socket.on('/productos/data/updateId', data => {
      catalogo.update(data.id, {
        codigo: data.codigo,
        producto: data.producto,
        descripcion: data.descripcion,
        venta: 's/ ' + data.venta.toFixed(2),
        cantidad: data.cantidad,
        categoria_id: data.categoria_id,
        categoria_nombre: data.categoria_nombre,
        src: data.foto_src
      });
    })

    socket.on('/productos/data/state', data => {
      if (data.estado) {
        catalogo.insert({
          id: data.id,
          codigo: data.codigo,
          producto: data.producto,
          descripcion: data.descripcion,
          venta: 's/ ' + data.venta.toFixed(2),
          cantidad: data.cantidad,
          categoria_id: data.categoria_id,
          categoria_nombre: data.categoria_nombre,
          src: data.foto_src
        });
        search(false);
      }
      else
        catalogo.delete(data.id);
    })

    socket.on('/productos/data/deleteId', data => {
      catalogo.delete(data.id);
    })

    socket.on('/productos/categorias/state', data => {
      if (data.estado) {
        data.data.forEach(d => catalogo.insert({
          id: d.id,
          codigo: d.codigo,
          producto: d.producto,
          descripcion: d.descripcion,
          venta: 's/ ' + d.venta.toFixed(2),
          cantidad: d.cantidad,
          categoria_id: d.categoria_id,
          categoria_nombre: d.categoria_nombre,
          src: d.foto_src
        }))
        search(false);
      }
      else
        data.data.forEach(d => catalogo.delete(d.id))
    })

    socket.on('/categorias/data/insert', data => {
      dataSelectorCategorias.add(data.id, data.nombre);
    })

    socket.on('/categorias/data/updateId', data => {
      dataSelectorCategorias.upd(data.id, { name: data.nombre });
    })

    socket.on('/categorias/data/state', async data => {
      if (data.estado)
        dataSelectorCategorias.add(data.id, data.nombre);
      else
        dataSelectorCategorias.rmv(data.id);
    })

    socket.on('/categorias/data/deleteId', data => {
      dataSelectorCategorias.rmv(data.id);
    })

  } catch ({ message, stack }) {
    socket.emit('err_client', { message, stack, url: window.location.href })
  }
})