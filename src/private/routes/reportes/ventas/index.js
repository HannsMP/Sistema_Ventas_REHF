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

    let $tableTableVentas = $('#card-table-ventas');
    let tableTableVentas = $tableTableVentas[0];
    let cardVentasTittle = tableTableVentas.querySelector('.card-tittle');
    let tblNuevoVentas = tableTableVentas.querySelectorAll('.tbl-nuevo');
    let tblEliminarVentas = tableTableVentas.querySelectorAll('.tbl-eliminar');
    let cardVentasDownload = tableTableVentas.querySelector('.download-other');

    let currentEditarTransaccionId = 0;
    let currentEditarVentaId = 0;

    let $cardNuevoVentas = $('#card-nuevo-ventas');
    let cardNuevoVentas = $cardNuevoVentas[0];
    /** @type {HTMLInputElement} */
    let inputNuevoVentasCantidad = document.getElementById('nuevo-cantidad');
    /** @type {HTMLInputElement} */
    let inputNuevoSelectorProductos = document.getElementById('nuevo-producto');
    /** @type {HTMLAnchorElement} */
    let btnNuevoVentas = cardNuevoVentas?.querySelector('.btn');

    let $cardEditarVentas = $('#card-editar-ventas');
    let cardEditarVentas = $cardEditarVentas[0];
    /** @type {HTMLInputElement} */
    let inputEditarVentasCantidad = document.getElementById('editar-cantidad');
    /** @type {HTMLInputElement} */
    let inputEditarSelectorProductos = document.getElementById('editar-producto');
    /** @type {HTMLAnchorElement} */
    let btnEditarVentas = cardEditarVentas?.querySelector('.btn');

    let $cardEditarMain = $('#card-editar');
    let cardEditarMain = $cardEditarMain[0];
    /** @type {HTMLInputElement} */
    let inputEditarImporteTotal = document.getElementById('editar-importe-total');
    /** @type {HTMLInputElement} */
    let inputEditarSelectorVendedor = document.getElementById('editar-vendedor');
    /** @type {HTMLInputElement} */
    let inputEditarSelectorTipoTransaccion = document.getElementById('editar-tipo-transaccion');
    /** @type {HTMLAnchorElement} */
    let btnEditarMain = cardEditarMain?.querySelector('.btn');

    let calendarioBox = document.querySelector('.calendario');

    let $tableMain = new Tables('#table-main');
    let $tableVentas = new Tables('#table-toggle');

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
          name: 'tv.codigo',
          className: 'dtr-code',
          orderable: false,
          targets: 0
        },
        {
          name: 'u.usuario',
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
          name: 'tv.importe_total',
          className: 'dt-type-numeric',
          targets: 3,
          render: data => data?.toFixed(2)
        },
        {
          name: 'tv.descuento',
          className: 'dt-type-numeric',
          targets: 4,
          render: data => data?.toFixed(2)
        },
        {
          name: 'tv.creacion',
          className: 'dt-type-date',
          targets: 5
        }
      ],
      columns: [
        { data: 'codigo' },
        { data: 'usuario' },
        { data: 'metodo_pago_nombre' },
        { data: 'importe_total' },
        { data: 'descuento' },
        { data: 'creacion' }
      ],
    })

    if (permiso.exportar) $tableMain.buttons();
    else cardMainDownload.innerHTML = '';

    $tableMain.toggleSelect(permiso.editar);

    /*
      ==================================================
      ================ DATATABLE VENTAS ================
      ==================================================
    */

    $tableVentas.init({
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
        },
        {
          className: 'dt-type-numeric',
          targets: 6,
          render: data => data?.toFixed(2)
        }
      ],
      columns: [
        { data: 'producto_codigo' },
        { data: 'producto_nombre' },
        { data: 'categoria_nombre' },
        { data: 'cantidad' },
        { data: 'precio_venta' },
        { data: 'importe' },
        { data: 'descuento' }
      ],
    }, false)

    if (permiso.exportar) $tableVentas.buttons('.download-other');
    else cardVentasDownload.innerHTML = '';

    $tableVentas.toggleSelect(permiso.editar);

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

    let selectorOptionsUsuario = new OptionsServerside(
      (req, end) => socket.emit('/selector/usuario', req, res => end(res)),
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
      inputEditarSelectorVendedor,
      selectorOptionsUsuario,
      { justChange: true }
    );

    /*
      ==================================================
      =================== TOGGLE ===================
      ==================================================
    */

    function toggleTable(state) {
      if (state) {
        $tableTableVentas.show('fast');
      } else {
        $tableTableVentas.hide();
      }
    }

    function toggleTableEditar(state) {
      if (state) {
        sideContent.scrollTop = tableTableVentas.offsetTop - sideContent.offsetTop - 100;
        $cardEditarMain.show('fast');
      } else {
        currentEditarTransaccionId = 0;
        currentEditarVentaId = 0;
        $cardEditarMain.hide();
      }
    }

    function toggleCardNuevo(state) {
      if (state) {
        inputNuevoVentasCantidad.value = 1;
        toggleCardEditar(false);
        $cardNuevoVentas.show('fast');
        $tableVentas.datatable.rows().deselect()
        sideContent.scrollTop = cardNuevoVentas.offsetTop - sideContent.offsetTop - 100;
      }
      else {
        selectorNuevoProducto.empty();
        $cardNuevoVentas.hide('fast');
      }
    }

    function toggleCardEditar(state) {
      if (state) {
        toggleCardNuevo(false);
        $cardEditarVentas.show('fast');
        sideContent.scrollTop = cardEditarVentas.offsetTop - sideContent.offsetTop - 100;
      }
      else {
        currentEditarVentaId = 0;
        selectorEditarProducto.empty();
        $cardEditarVentas.hide('fast');
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
      valid ||= Number(inputEditarImporteTotal.value) != Number(inputEditarImporteTotal.currentValue);
      valid ||= selectorEditarMetodoTransaccion?.selected[0]?.id != selectorEditarMetodoTransaccion.currentValue;
      valid ||= selectorEditarAgente?.selected[0]?.id != selectorEditarAgente.currentValue;

      valid
        ? btnEditarMain.classList.remove('disabled')
        : btnEditarMain.classList.add('disabled');
    }

    inputEditarImporteTotal.addEventListener('input', validChangeTransacciones);
    selectorEditarMetodoTransaccion.on('change', validChangeTransacciones)
    selectorEditarAgente.on('change', validChangeTransacciones)

    /*
      ==================================================
      =============== OPEN TRANSACCIONES ===============
      ==================================================
    */

    let defaultEditarTransaccion = async data => {
      cardVentasTittle.textContent
        = data.codigo;

      inputEditarImporteTotal.currentValue
        = inputEditarImporteTotal.placeholder
        = data.importe_total.toFixed(2);

      let asyncMetodoTransaccion = selectorEditarMetodoTransaccion.select(data.metodo_pago_id);
      selectorEditarMetodoTransaccion.currentValue = data.metodo_pago_id;

      let asyncAgente = selectorEditarAgente.select(data.usuario_id);
      selectorEditarAgente.currentValue = data.usuario_id;

      await asyncMetodoTransaccion;
      await asyncAgente;
    }

    let setterEditarTransaccion = data => {
      currentEditarTransaccionId = data.id;

      cardVentasTittle.textContent
        = data.codigo;

      inputEditarImporteTotal.value
        = data.importe_total.toFixed(2);

      defaultEditarTransaccion(data);
      btnEditarMain.classList.add('disabled');
    }

    $tableMain.datatable.on('select', (e, dt, type, indexes) => {
      let data = $tableMain.datatable.rows(indexes).data().toArray()[0];

      socket.emit('/read/ventas', data.id, dataVentas => {
        $tableVentas.data(dataVentas);
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

      let importeTotalValue = Number(inputEditarImporteTotal.value);
      if (!importeTotalValue) return formError(`Se require el precio del importe total!.`, inputEditarImporteTotal);
      jsonData.importe_total = importeTotalValue;

      let selectMetodo = selectorEditarMetodoTransaccion.selected[0];
      if (!selectMetodo) return formError(`Selecciona un Metodo`, inputEditarSelectorTipoTransaccion);
      jsonData.metodo_pago_id = Number(selectMetodo.id || selectorEditarMetodoTransaccion.currentValue);

      let selectVendedor = selectorEditarAgente.selected[0];
      if (!selectVendedor) return formError(`Selecciona un Vendedor`, inputEditarSelectorVendedor);
      jsonData.usuario_id = Number(selectVendedor.id || selectorEditarAgente.currentValue);

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
      ================== NUEVO VENTAS ==================
      ==================================================
    */

    tblNuevoVentas.forEach(btn => btn.addEventListener('click', () => toggleCardNuevo(true)))

    btnNuevoVentas.addEventListener('click', async () => {
      let jsonData = {};

      jsonData.transaccion_id = currentEditarTransaccionId;

      jsonData.cantidad = Number(inputNuevoVentasCantidad.value);

      let selectProducto = selectorNuevoProducto.selected[0];
      if (!selectProducto) return formError(`Selecciona un Producto`, inputNuevoSelectorProductos);
      jsonData.producto_id = Number(selectProducto.id || selectorNuevoProducto.currentValue);

      socket.emit('/insertId/ventas', jsonData, err => {
        if (err)
          return alarm.error(err);

        $tableMain.datatable.draw();
        $tableVentas.datatable.draw();
        alarm.success(`Venta Agregada.`);
      })
    })

    /*
      ==================================================
      =============== VALID CHANGE VENTAS ===============
      ==================================================
    */

    let validChangeVentas = () => {
      let valid = false;
      valid ||= inputEditarVentasCantidad.value != inputEditarVentasCantidad.currentValue;
      valid ||= selectorEditarProducto?.selected[0]?.id != selectorEditarProducto.currentValue;

      valid
        ? btnEditarVentas.classList.remove('disabled')
        : btnEditarVentas.classList.add('disabled');
    }

    inputEditarVentasCantidad.addEventListener('input', validChangeVentas);
    selectorEditarProducto.on('change', validChangeVentas)

    /*
      ==================================================
      =================== OPEN VENTAS ===================
      ==================================================
    */

    let defaultEditarVentas = async data => {
      inputEditarVentasCantidad.currentValue
        = inputEditarVentasCantidad.placeholder
        = data.cantidad;

      let asyncMetodoProducto = selectorEditarProducto.select(data.producto_id);
      selectorEditarProducto.currentValue = data.producto_id;

      await asyncMetodoProducto;
    }

    let setterEditarVentas = data => {
      currentEditarVentaId = data.id;

      inputEditarVentasCantidad.value
        = data.cantidad;

      defaultEditarVentas(data);
      btnEditarVentas.classList.add('disabled');
    }

    $tableVentas.datatable.on('select', (e, dt, type, indexes) => {
      let data = $tableVentas.datatable.rows(indexes).data().toArray()[0];

      setterEditarVentas(data);
      currentEditarVentaId = data.id;
      toggleCardEditar(true);
    })

    $tableVentas.datatable.on('deselect', _ => {
      toggleCardEditar(false);
    })

    /*
    ==================================================
    ================== EDITAR VENTAS ==================
    ==================================================
    */

    btnEditarVentas.addEventListener('click', async () => {
      let jsonData = {};

      jsonData.id = currentEditarVentaId;
      jsonData.transaccion_id = currentEditarTransaccionId;

      let cantidadValue = Number(inputEditarVentasCantidad.value);
      if (!cantidadValue) return formError(`Se require una cantidad!.`, inputEditarVentasCantidad);
      jsonData.cantidad = cantidadValue;

      let selectProducto = selectorEditarProducto.selected[0];
      if (!selectProducto) return formError(`Selecciona un Producto`, inputEditarSelectorProductos);
      jsonData.producto_id = Number(selectProducto.id || selectorEditarProducto.currentValue);

      socket.emit('/updateId/ventas', jsonData, err => {
        if (err)
          return alarm.error(err);

        alarm.success(`Venta Editada.`);
      })
    })

    /*
      ==================================================
      ================= ELIMINAR VENTAS =================
      ==================================================
    */

    tblEliminarVentas.forEach(btn => btn.addEventListener('click', _ => {
      let id = $tableVentas.selected();

      let transaccion_id = $tableMain.selected();

      if ($tableVentas.datatable.rows().count() == 1)
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
            socket.emit('/deleteId/ventas', id, transaccion_id, err => {
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

    socket.on('/transacciones_ventas/data/insert', () => {
      $tableMain.datatable.draw();
    })

    socket.on('/transacciones_ventas/data/updateId', async data => {
      if (currentEditarTransaccionId == data.id) {
        await defaultEditarTransaccion(data);
        validChangeTransacciones()
      }
      if (!$tableMain.get('#' + data.id)) return;
      $tableMain.datatable.draw();
    })

    socket.on('/transacciones_ventas/data/deleteId', data => {
      if (currentEditarTransaccionId == data.id) {
        toggleTable(false);
        toggleCardEditar(false);
      }
      if (!$tableMain.get('#' + data.id)) return;
      $tableMain.datatable.draw();
    })

    socket.on('/transacciones_ventas/data/refreshId', data => {
      if (!$tableMain.get('#' + data.id)) return;
      $tableMain.datatable.draw();
    })

    socket.on('/ventas/data/deleteId', data => {
      if (!$tableVentas.get('#' + data.id)) return;
      $tableVentas.datatable.draw();

      let id = $tableVentas.selected();
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
      if (data.menu_ruta != '/control/movimientos/ventas') return

      tblNuevoMain.forEach(t => t.style.display = data.permiso_ver ? '' : 'none')

      tblNuevoVentas.forEach(t => t.style.display = data.permiso_agregar ? '' : 'none')

      $tableVentas.toggleSelect(data.permiso_editar)

      tblEliminarVentas.forEach(t => t.style.display = data.permiso_eliminar ? '' : 'none')

      if (data.permiso_exportar) $tableVentas.buttons('.download-other');
      else cardVentasDownload.innerHTML = '';
    })

  } catch ({ message, stack }) {
    socket.emit('/err/client', { message, stack, url: window.location.href })
  }
})