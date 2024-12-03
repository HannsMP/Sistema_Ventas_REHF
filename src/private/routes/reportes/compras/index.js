$('.content-body').ready(async () => {
  try {

    /*
      ==================================================
      ================== VARIABLES DOM ==================
      ==================================================
    */

    let sideContent = document.querySelector('.side-content');

    let tableTableMain = document.querySelector('#card-table-main');
    let tblNuevoMain = tableTableMain.querySelectorAll('.tbl-nuevo');
    let tblEditarMain = tableTableMain.querySelectorAll('.tbl-editar');
    let tblEliminarMain = tableTableMain.querySelectorAll('.tbl-eliminar');
    let cardMainDownload = tableTableMain.querySelector('.download');

    let $tableTableCompras = $('#card-table-compras');
    let tableTableCompras = $tableTableCompras[0];
    let cardComprasTittle = tableTableCompras.querySelector('.card-tittle');
    let tblNuevoCompras = tableTableCompras.querySelectorAll('.tbl-nuevo');
    let tblEliminarCompras = tableTableCompras.querySelectorAll('.tbl-eliminar');
    let cardComprasDownload = tableTableCompras.querySelector('.download-other');

    let currentEditarTransaccionId = 0;
    let currentEditarCompraId = 0;

    let $cardNuevoCompras = $('#card-nuevo-compras');
    let cardNuevoCompras = $cardNuevoCompras[0];
    /** @type {HTMLInputElement} */
    let inputNuevoComprasCantidad = document.getElementById('nuevo-cantidad');
    /** @type {HTMLInputElement} */
    let inputNuevoComprasPrecio = document.getElementById('nuevo-precio');
    /** @type {HTMLInputElement} */
    let inputNuevoSelectorProductos = document.getElementById('nuevo-producto');
    /** @type {HTMLAnchorElement} */
    let btnNuevoCompras = cardNuevoCompras?.querySelector('.btn');

    let $cardEditarCompras = $('#card-editar-compras');
    let cardEditarCompras = $cardEditarCompras[0];
    /** @type {HTMLInputElement} */
    let inputEditarComprasCantidad = document.getElementById('editar-cantidad');
    /** @type {HTMLInputElement} */
    let inputEditarComprasPrecio = document.getElementById('editar-precio-compra');
    /** @type {HTMLSpanElement} */
    let smallEditarComprasVenta = document.getElementById('editar-precio-venta');
    /** @type {HTMLInputElement} */
    let inputEditarSelectorProductos = document.getElementById('editar-producto');
    /** @type {HTMLAnchorElement} */
    let btnEditarCompras = cardEditarCompras?.querySelector('.btn');

    let $cardEditarMain = $('#card-editar');
    let cardEditarMain = $cardEditarMain[0];
    /** @type {HTMLInputElement} */
    let inputEditarSerie = document.getElementById('editar-serie');
    /** @type {HTMLInputElement} */
    let inputEditarSelectorProveedor = document.getElementById('editar-proveedor');
    /** @type {HTMLInputElement} */
    let inputEditarSelectorTipoTransaccion = document.getElementById('editar-tipo-transaccion');
    /** @type {HTMLAnchorElement} */
    let btnEditarMain = cardEditarMain?.querySelector('.btn');

    let calendarioBox = document.querySelector('.calendario');

    let $tableMain = new Tables('#table-main');
    let $tableCompras = new Tables('#table-toggle');

    /*
      ==================================================
      ==================== DATATABLE ====================
      ==================================================
    */

    $tableMain.init({
      serverSide: true,
      ajax: (data, end) => {
        socket.emit('/read/table', data, res => end(res))
      },
      pageLength: 10,
      select: true,
      pageLength: 10,
      order: [[5, 'des']],
      columnDefs: [
        {
          name: 'tc.codigo',
          className: 'dtr-code',
          orderable: false,
          targets: 0
        },
        {
          name: 'p.titular',
          className: 'dtr-tag',
          targets: 1,
          render: data => '<div>' + data + '</div>'
        },
        {
          name: 'mp.nombre',
          className: 'dtr-tag',
          targets: 2,
          render: data => '<div>' + data + '</div>'
        },
        {
          name: 'tc.serie',
          targets: 3,
          render: data => data || '-'
        },
        {
          name: 'tc.importe_total',
          className: 'dt-type-numeric',
          targets: 4,
          render: data => data?.toFixed(2)
        },
        {
          name: 'tc.creacion',
          className: 'dt-type-date',
          targets: 5
        }
      ],
      columns: [
        { data: 'codigo' },
        { data: 'proveedor_titular' },
        { data: 'metodo_pago_nombre' },
        { data: 'serie' },
        { data: 'importe_total' },
        { data: 'creacion' }
      ],
    })

    if (permiso.exportar) $tableMain.buttons();
    else cardMainDownload.innerHTML = '';

    $tableMain.toggleSelect(permiso.editar);

    /*
      ==================================================
      ================ DATATABLE COMPRAS ================
      ==================================================
    */

    $tableCompras.init({
      pageLength: 10,
      select: true,
      order: [[7, 'asc']],
      columnDefs: [
        {
          className: 'dtr-code',
          orderable: false,
          targets: 0
        },
        {
          className: 'dtr-tag',
          targets: 1,
          render: data => '<div>' + data + '</div>'
        },
        {
          className: 'dtr-tag',
          targets: 2,
          render: data => '<div>' + data + '</div>'
        },
        {
          className: 'dt-type-numeric',
          targets: 3,
        },
        {
          className: 'dt-type-numeric',
          targets: 4,
          render: data => data?.toFixed(2)
        },
        {
          className: 'dt-type-numeric',
          targets: 5,
          render: data => data?.toFixed(2)
        }
      ],
      columns: [
        { data: 'producto_codigo' },
        { data: 'producto_nombre' },
        { data: 'categoria_nombre' },
        { data: 'cantidad' },
        { data: 'compra' },
        { data: 'ganancia' }
      ],
    }, false)

    if (permiso.exportar) $tableCompras.buttons('.download-other');
    else cardComprasDownload.innerHTML = '';

    $tableCompras.toggleSelect(permiso.editar);

    /*
      ==================================================
      ==================== SELECTOR ====================
      ==================================================
    */

    let selectorOptionsProductos = new OptionsServerside(
      (req, end) => socket.emit('/selector/producto', req, res => end(res)),
      { showIndex: 'img', order: 'asc', noInclude: true }
    );

    let selectorOptionsMetodoPago = new OptionsServerside(
      (req, end) => socket.emit('/selector/metodoPago', req, res => end(res)),
      { showIndex: false, order: 'asc', noInclude: true }
    );

    let selectorOptionsProveedores = new OptionsServerside(
      (req, end) => socket.emit('/selector/proveedores', req, res => end(res)),
      { showIndex: 'img', order: 'asc', noInclude: true }
    );

    /*
      ==================================================
      ================== SELECTOR UNIC ==================
      ==================================================
    */

    let selectorNuevoProducto = new SelectorInput(
      inputNuevoSelectorProductos,
      selectorOptionsProductos,
      { autohide: true }
    );
    let selectorEditarProducto = new SelectorInput(
      inputEditarSelectorProductos,
      selectorOptionsProductos,
      { justChange: true }
    );
    let selectorEditarMetodoTransaccion = new SelectorInput(
      inputEditarSelectorTipoTransaccion,
      selectorOptionsMetodoPago,
      { justChange: true }
    );
    let selectorEditarAgente = new SelectorInput(
      inputEditarSelectorProveedor,
      selectorOptionsProveedores,
      { justChange: true }
    );

    /*
      ==================================================
      =================== TOGGLE ===================
      ==================================================
    */

    function toggleTable(state) {
      if (state) {
        $tableTableCompras.show('fast');
      } else {
        $tableTableCompras.hide();
      }
    }

    function toggleTableEditar(state) {
      if (state) {
        sideContent.scrollTop = tableTableCompras.offsetTop - sideContent.offsetTop - 100;
        $cardEditarMain.show('fast');
      } else {
        currentEditarTransaccionId = 0;
        currentEditarCompraId = 0;
        $cardEditarMain.hide();
      }
    }

    function toggleCardNuevo(state) {
      if (state) {
        inputNuevoComprasCantidad.value = 1;
        toggleCardEditar(false);
        $cardNuevoCompras.show('fast');
        $tableCompras.datatable.rows().deselect()
        sideContent.scrollTop = cardNuevoCompras.offsetTop - sideContent.offsetTop - 100;
      }
      else {
        selectorNuevoProducto.empty();
        $cardNuevoCompras.hide('fast');
      }
    }

    function toggleCardEditar(state) {
      if (state) {
        toggleCardNuevo(false);
        $cardEditarCompras.show('fast');
        sideContent.scrollTop = cardEditarCompras.offsetTop - sideContent.offsetTop - 100;
      }
      else {
        currentEditarCompraId = 0;
        selectorEditarProducto.empty();
        $cardEditarCompras.hide('fast');
      }
    }

    /*
      ==================================================
      =================== CALENDARIO ===================
      ==================================================
    */

    let calendar = new Calendar(calendarioBox);

    calendar.on('click', ({ date }) => {
      $tableMain.search(formatTime('YYYY-MM-DD', date));
      toggleTable(false);
      $tableMain.datatable.rows().deselect();

      let url = new URL(window.location.href);
      let fotmatDate = formatTime('YYYY/MM/DD', date)

      if (url.searchParams.has('calendar_select'))
        url.searchParams.set('calendar_select', fotmatDate);
      else
        url.searchParams.append('calendar_select', fotmatDate);

      history.pushState({}, '', url.toString())
    })

    let url = new URL(window.location.href);
    if (url.searchParams.has('calendar_select')) {
      let fotmatDate = url.searchParams.get('calendar_select');
      calendar.setDate(fotmatDate);
    }

    /*
      ==================================================
      =========== VALID CHANGE TRANSACCIONES ===========
      ==================================================
    */

    let validChangeTransacciones = () => {
      let valid = false;
      valid ||= Number(inputEditarSerie.value) != Number(inputEditarSerie.currentValue);
      valid ||= selectorEditarMetodoTransaccion?.selected[0]?.id != selectorEditarMetodoTransaccion.currentValue;
      valid ||= selectorEditarAgente?.selected[0]?.id != selectorEditarAgente.currentValue;

      valid
        ? btnEditarMain.classList.remove('disabled')
        : btnEditarMain.classList.add('disabled');
    }

    inputEditarSerie.addEventListener('input', validChangeTransacciones);
    selectorEditarMetodoTransaccion.on('change', validChangeTransacciones)
    selectorEditarAgente.on('change', validChangeTransacciones)

    /*
      ==================================================
      =============== OPEN TRANSACCIONES ===============
      ==================================================
    */

    let defaultEditarTransaccion = async data => {
      cardComprasTittle.textContent
        = data.codigo;

      inputEditarSerie.currentValue
        = inputEditarSerie.placeholder
        = data.serie || '';

      let asyncMetodoTransaccion = selectorEditarMetodoTransaccion.select(data.metodo_pago_id);
      selectorEditarMetodoTransaccion.currentValue = data.metodo_pago_id;

      let asyncAgente = selectorEditarAgente.select(data.usuario_id);
      selectorEditarAgente.currentValue = data.usuario_id;

      await asyncMetodoTransaccion;
      await asyncAgente;
    }

    let setterEditarTransaccion = data => {
      currentEditarTransaccionId = data.id;

      cardComprasTittle.textContent
        = data.codigo;

      inputEditarSerie.value
        = data.serie || '';

      defaultEditarTransaccion(data);
      btnEditarMain.classList.add('disabled');
    }

    $tableMain.datatable.on('select', (e, dt, type, indexes) => {
      let data = $tableMain.datatable.rows(indexes).data().toArray()[0];

      socket.emit('/read/compras', data.id, dataCompras => {
        $tableCompras.data(dataCompras);
        currentEditarTransaccionId = data.id;
        toggleTable(true);
      })
    })

    tblEditarMain.forEach(btn => btn.addEventListener('click', () => {
      let id = $tableMain.selected();
      if (!id) return alarm.warn('Selecciona una fila');

      socket.emit('/readId/table', id, data => {
        setterEditarTransaccion(data);
        toggleTableEditar(true)
      })
    }))

    $tableMain.datatable.on('deselect', _ => {
      toggleTable(false);
      toggleTableEditar(false);
      toggleCardEditar(false);
      toggleCardNuevo(false);
    })

    /*
    ==================================================
    =================== EDITAR MAIN ===================
    ==================================================
    */

    btnEditarMain.addEventListener('click', async () => {
      let jsonData = {};

      jsonData.id = currentEditarTransaccionId;

      let serieValue = inputEditarSerie.value;
      jsonData.serie = serieValue;

      let selectMetodo = selectorEditarMetodoTransaccion.selected[0];
      if (!selectMetodo) return formError(`Selecciona un Metodo`, inputEditarSelectorTipoTransaccion);
      jsonData.metodo_pago_id = Number(selectMetodo.id || selectorEditarMetodoTransaccion.currentValue);

      let selectAgente = selectorEditarAgente.selected[0];
      if (!selectAgente) return formError(`Selecciona un Vendedor`, inputEditarSelectorProveedor);
      jsonData.proveedor_id = Number(selectAgente.id || selectorEditarAgente.currentValue);

      socket.emit('/updateId/table', jsonData, err => {
        if (err)
          return alarm.error(err);

        alarm.success(`Transaccion Editada.`);
      })

    })

    /*
      ==================================================
      ================== ELIMINAR MAIN ==================
      ==================================================
    */

    tblEliminarMain.forEach(btn => btn.addEventListener('click', _ => {
      let id = $tableMain.selected();
      if (!id) return alarm.warn('Selecciona una fila');

      Swal.fire({
        title: "Estás seguro?",
        text: "No podrás revertir esto!",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "rgb(13, 204, 242)",
        cancelButtonColor: "rgb(220, 53, 69)",
        confirmButtonText: "Si, borralo!",
        cancelButtonText: "Cancelar",
        background: 'rgb(24, 20, 47)',
        color: 'rgb(255, 255, 255)',
      })
        .then(async (result) => {
          if (result.isConfirmed)
            socket.emit('/deleteId/table', id, err => {
              if (err)
                return alarm.error(err);

              alarm.success(`Transaccion eliminada.`);
            })
        });
    }))

    /*
      ==================================================
      ================== NUEVO COMPRAS ==================
      ==================================================
    */

    tblNuevoCompras.forEach(btn => btn.addEventListener('click', () => toggleCardNuevo(true)))

    btnNuevoCompras.addEventListener('click', async () => {
      let jsonData = {};

      jsonData.transaccion_id = currentEditarTransaccionId;

      jsonData.cantidad = Number(inputNuevoComprasCantidad.value);

      jsonData.compra = Number(inputNuevoComprasPrecio.value);

      let selectProducto = selectorNuevoProducto.selected[0];
      if (!selectProducto) return formError(`Selecciona un Producto`, inputNuevoSelectorProductos);
      jsonData.producto_id = Number(selectProducto.id || selectorNuevoProducto.currentValue);

      socket.emit('/insertId/compras', jsonData, err => {
        if (err)
          return alarm.error(err);

        $tableMain.datatable.draw();
        $tableCompras.datatable.draw();
        alarm.success(`Venta Agregada.`);
      })
    })

    /*
      ==================================================
      =============== VALID CHANGE COMPRAS ===============
      ==================================================
    */

    let validChangeCompras = () => {
      let valid = false;

      valid ||= inputEditarComprasCantidad.value != inputEditarComprasCantidad.currentValue;

      let priceValid = Number(inputEditarComprasPrecio.value) < smallEditarComprasVenta.currentValue
      valid ||= (inputEditarComprasPrecio.value != inputEditarComprasPrecio.currentValue && priceValid);
      valid ||= selectorEditarProducto?.selected[0]?.id != selectorEditarProducto.currentValue;

      valid
        ? btnEditarCompras.classList.remove('disabled')
        : btnEditarCompras.classList.add('disabled');

      if (!priceValid)
        formError(`El precio de compra es mayor al de venta!.`, inputEditarComprasPrecio);
    }

    inputEditarComprasCantidad.addEventListener('input', validChangeCompras);
    inputEditarComprasPrecio.addEventListener('input', validChangeCompras);
    selectorEditarProducto.on('change', validChangeCompras)

    /*
      ==================================================
      =================== OPEN COMPRAS ===================
      ==================================================
    */

    let defaultEditarCompras = async data => {
      inputEditarComprasCantidad.currentValue
        = inputEditarComprasCantidad.placeholder
        = data.cantidad;

      inputEditarComprasPrecio.currentValue
        = inputEditarComprasPrecio.placeholder
        = data.compra;

      smallEditarComprasVenta.textContent = `Precio de venta: s\\ ${data.compra + data.ganancia}`;
      smallEditarComprasVenta.currentValue = data.compra + data.ganancia;

      let asyncMetodoProducto = selectorEditarProducto.select(data.producto_id);
      selectorEditarProducto.currentValue = data.producto_id;

      await asyncMetodoProducto;
    }

    let setterEditarCompras = data => {
      currentEditarCompraId = data.id;

      inputEditarComprasCantidad.value
        = data.cantidad;

      inputEditarComprasPrecio.value
        = data.compra;

      defaultEditarCompras(data);
      btnEditarCompras.classList.add('disabled');
    }

    $tableCompras.datatable.on('select', (e, dt, type, indexes) => {
      let data = $tableCompras.datatable.rows(indexes).data().toArray()[0];

      setterEditarCompras(data);
      currentEditarCompraId = data.id;
      toggleCardEditar(true);
    })

    $tableCompras.datatable.on('deselect', _ => {
      toggleCardEditar(false);
    })

    /*
    ==================================================
    ================== EDITAR COMPRAS ==================
    ==================================================
    */

    btnEditarCompras.addEventListener('click', async () => {
      let jsonData = {};

      jsonData.id = currentEditarCompraId;
      jsonData.transaccion_id = currentEditarTransaccionId;

      let cantidadValue = Number(inputEditarComprasCantidad.value);
      if (!cantidadValue) return formError(`Se require una cantidad!.`, inputEditarComprasCantidad);
      jsonData.cantidad = cantidadValue;

      let compraValue = Number(inputEditarComprasPrecio.value);
      if (!compraValue) return formError(`Se require una cantidad!.`, inputEditarComprasPrecio);
      if (Number(inputEditarComprasPrecio.value) < smallEditarComprasVenta.currentValue)
        return formError(`El precio de compra es mayor al de venta!.`, inputEditarComprasPrecio);
      jsonData.compra = compraValue;

      let selectProducto = selectorEditarProducto.selected[0];
      if (!selectProducto) return formError(`Selecciona un Producto`, inputEditarSelectorProductos);
      jsonData.producto_id = Number(selectProducto.id || selectorEditarProducto.currentValue);

      socket.emit('/updateId/compras', jsonData, err => {
        if (err)
          return alarm.error(err);

        alarm.success(`Venta Editada.`);
      })
    })

    /*
      ==================================================
      ================= ELIMINAR COMPRAS =================
      ==================================================
    */

    tblEliminarCompras.forEach(btn => btn.addEventListener('click', _ => {
      let id = $tableCompras.selected();

      let transaccion_id = $tableMain.selected();

      if ($tableCompras.datatable.rows().count() == 1)
        return Swal.fire({
          title: "Estás seguro?",
          text: "Es el ultimo registro, tambien se borrar la trasaccion",
          icon: "warning",
          showCancelButton: true,
          confirmButtonColor: "rgb(13, 204, 242)",
          cancelButtonColor: "rgb(24, 20, 47)",
          confirmButtonText: "Si, borralo!",
          cancelButtonText: "Cancelar",
          background: 'rgb(220, 53, 69)',
          color: 'rgb(255, 255, 255)',
        })
          .then(async (result) => {
            if (result.isConfirmed)
              socket.emit('/deleteId/table', transaccion_id, err => {
                if (err)
                  return alarm.error(err);

                alarm.success(`Transaccion eliminada.`);
              })
          });

      if (!id) return alarm.warn('Selecciona una fila');

      Swal.fire({
        title: "Está seguro?",
        text: "No podrás revertir esto!",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "rgb(13, 204, 242)",
        cancelButtonColor: "rgb(220, 53, 69)",
        confirmButtonText: "Si, borralo!",
        cancelButtonText: "Cancelar",
        background: 'rgb(24, 20, 47)',
        color: 'rgb(255, 255, 255)',
      })
        .then(async (result) => {
          if (result.isConfirmed)
            socket.emit('/deleteId/compras', id, transaccion_id, err => {
              if (err)
                return alarm.error(err);

              alarm.success(`Venta eliminada.`);
            })
        });

    }))

    /*
      ==================================================
      ===================== SOCKET =====================
      ==================================================
    */

    socket.on('/transacciones_compras/data/insert', () => {
      $tableMain.datatable.draw();
    })

    socket.on('/transacciones_compras/data/updateId', async data => {
      if (currentEditarTransaccionId == data.id) {
        await defaultEditarTransaccion(data);
        validChangeTransacciones()
      }
      if (!$tableMain.get('#' + data.id)) return;
      $tableMain.datatable.draw();
    })

    socket.on('/transacciones_compras/data/deleteId', data => {
      if (currentEditarTransaccionId == data.id) {
        toggleTable(false);
        toggleCardEditar(false);
      }
      if (!$tableMain.get('#' + data.id)) return;
      $tableMain.datatable.draw();
    })

    socket.on('/transacciones_compras/data/refreshId', data => {
      if (!$tableMain.get('#' + data.id)) return;
      $tableMain.datatable.draw();
    })

    socket.on('/compras/data/deleteId', data => {
      if (!$tableCompras.get('#' + data.id)) return;
      $tableCompras.datatable.draw();

      let id = $tableCompras.selected();
      if (data.id != id) return;
      toggleCardEditar(false);
    })

    socket.on('/session/acceso/state', data => {
      if (permiso?.eliminar != data.permiso_eliminar) {
        tblEliminarMain.forEach(t => t.style.display = data.permiso_eliminar ? '' : 'none')
        permiso.eliminar = data.permiso_eliminar;
      }
      if (permiso?.editar != data.permiso_editar) {
        $tableMain.toggleSelect(data.permiso_editar)
        permiso.editar = data.permiso_editar;
      }
      if (permiso?.eliminar != data.permiso_eliminar) {
        tblEliminarMain.forEach(t => t.style.display = data.permiso_eliminar ? '' : 'none')
        permiso.eliminar = data.permiso_eliminar;
      }
      if (permiso?.exportar != data.permiso_exportar) {
        if (data.permiso_exportar) $tableMain.buttons();
        else cardMainDownload.innerHTML = '';
        permiso.exportar = data.permiso_exportar;
      }
    })

    socket.on('/session/acceso/updateId', data => {
      if (data.menu_ruta != '/control/movimientos/compras') return

      tblNuevoMain.forEach(t => t.style.display = data.permiso_ver ? '' : 'none')

      tblNuevoCompras.forEach(t => t.style.display = data.permiso_agregar ? '' : 'none')

      $tableCompras.toggleSelect(data.permiso_editar)

      tblEliminarCompras.forEach(t => t.style.display = data.permiso_eliminar ? '' : 'none')

      if (data.permiso_exportar) $tableCompras.buttons('.download-other');
      else cardComprasDownload.innerHTML = '';
    })

  } catch ({ message, stack }) {
    socket.emit('/err/client', { message, stack, url: window.location.href })
  }
})