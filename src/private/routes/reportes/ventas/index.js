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
    let tblEliminarMain = tableTableMain.querySelectorAll('.tbl-eliminar');
    let cardMainDownload = tableTableMain.querySelector('.download');

    let $tableTableVentas = $('#card-table-ventas');
    let tableTableVentas = $tableTableVentas[0];
    let cardVentasTittle = tableTableVentas.querySelector('.card-tittle');
    let tblNuevoVentas = tableTableVentas.querySelectorAll('.tbl-nuevo');
    let tblEliminarVentas = tableTableVentas.querySelectorAll('.tbl-eliminar');
    let cardVentasDownload = tableTableVentas.querySelector('.download-other');

    let $cardEditarMain = $('#card-editar');
    let cardEditarMain = $cardEditarMain[0];
    let inputEditarMainId = cardEditarMain?.querySelector('input[name=id]');
    let inputEditarMainImporteTotal = cardEditarMain?.querySelector('input[type=text]');
    let inputSelectorVendedor = cardEditarMain?.querySelector('input.selector#vendedor');
    let inputSelectorMetodoPago = cardEditarMain?.querySelector('input.selector#metodo-transaccion');
    let btnEditarMain = cardEditarMain?.querySelector('.btn');

    let $cardNuevoVentas = $('#card-nuevo-ventas');
    let cardNuevoVentas = $cardNuevoVentas[0];
    let inputNuevoIdTrasaccionVenta = cardNuevoVentas?.querySelector('input[name=transaccion_id]');
    let inputNuevoCantidadVentas = cardNuevoVentas?.querySelector('input[type=text]');
    let inputNuevoSelectorProductos = cardNuevoVentas?.querySelector('input.selector#productos');
    let btnNuevoVentas = cardNuevoVentas?.querySelector('.btn');

    let $cardEditarVentas = $('#card-editar-ventas');
    let cardEditarVentas = $cardEditarVentas[0];
    let inputEditarIdVentas = cardEditarVentas?.querySelector('input[name=id]');
    let inputEditarIdTrasaccionVenta = cardEditarVentas?.querySelector('input[name=transaccion_id]');
    let inputEditarCantidadVentas = cardEditarVentas?.querySelector('input[type=text]');
    let inputEditarSelectorProductos = cardEditarVentas?.querySelector('input.selector#productos');
    let btnEditarVentas = cardEditarVentas?.querySelector('.btn');

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
          name: 'tv.descuento',
          className: 'dt-type-numeric',
          targets: 3,
          render: data => data?.toFixed(2)
        },
        {
          name: 'tv.importe_total',
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
        { data: 'descuento' },
        { data: 'importe_total' },
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
      select: true,
      pageLength: 10,
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
          targets: 3,
          render: data => data?.toFixed(2)
        },
        {
          targets: 4,
          render: data => data?.toFixed(2)
        },
        {
          targets: 6,
          render: data => data?.toFixed(2)
        },
        {
          targets: 7,
          render: data => data?.toFixed(2)
        }
      ],
      columns: [
        { data: 'producto_codigo' },
        { data: 'producto_nombre' },
        { data: 'categoria_nombre' },
        { data: 'precio_compra' },
        { data: 'precio_venta' },
        { data: 'cantidad' },
        { data: 'descuento' },
        { data: 'importe' },
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

    let dataSelectorProductos = new OptionsServerside(
      (req, end) => socket.emit('/selector/producto', req, res => end(res)),
      { showIndex: 'img', order: 'asc', noInclude: true }
    );

    let dataSelectorMetodoPago = new OptionsServerside(
      (req, end) => socket.emit('/selector/metodoPago', req, res => end(res)),
      { showIndex: false, order: 'asc', noInclude: true }
    );

    let dataSelectorUsuario = new OptionsServerside(
      (req, end) => socket.emit('/selector/usuario', req, res => end(res)),
      { showIndex: 'img', order: 'asc', noInclude: true }
    );

    /* 
      ==================================================
      ================== SELECTOR UNIC ==================
      ==================================================
    */

    let productosNuevoSelectorUnic = new SelectorInput(
      inputNuevoSelectorProductos,
      dataSelectorProductos
    );
    let productosEditarSelectorUnic = new SelectorInput(
      inputEditarSelectorProductos,
      dataSelectorProductos
    );
    let metodoTransaccionSelectorUnic = new SelectorInput(
      inputSelectorMetodoPago,
      dataSelectorMetodoPago,
      { autohide: true }
    );
    let usuarioSelectorUnic = new SelectorInput(
      inputSelectorVendedor,
      dataSelectorUsuario,
      { autohide: true }
    );

    /* 
      ==================================================
      =================== TOGGLE ===================
      ==================================================
    */

    function toggleTable(state) {
      if (state) {
        $tableTableVentas.show('fast');
        sideContent.scrollTop = tableTableVentas.offsetTop - sideContent.offsetTop - 100;
        $cardEditarMain.show('fast');
      } else {
        $tableTableVentas.hide();
        $cardEditarMain.hide();
      }
    }

    function toggleCardEditar(state) {
      if (state) {
        toggleCardNuevo(false);
        $cardEditarVentas.show('fast');
        sideContent.scrollTop = cardEditarVentas.offsetTop - sideContent.offsetTop - 100;
      }
      else
        $cardEditarVentas.hide('fast');
    }

    function toggleCardNuevo(state) {
      if (state) {
        inputNuevoCantidadVentas.value = '1';
        toggleCardEditar(false);
        $cardNuevoVentas.show('fast');
        $tableVentas.datatable.rows().deselect()
        sideContent.scrollTop = cardNuevoVentas.offsetTop - sideContent.offsetTop - 100;
      }
      else
        $cardNuevoVentas.hide('fast');
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
      ================== OPEN BUSINESS ==================
      ==================================================
    */

    $tableMain.datatable.on('select', async (e, dt, type, indexes) => {
      $tableTableVentas.addClass('load-spinner');
      toggleTable(true);
      let { id, codigo, metodo_pago_id, usuario_id, importe_total } = $tableMain.datatable
        .rows(indexes).data().toArray()[0];

      let resVentas = await query.post.json.cookie("/api/ventas/table/readBusinessId", { id });

      /** @type {{list: {[column:string]: string|number}[]}} */
      let { list: dataVentas } = await resVentas.json();

      cardVentasTittle.textContent = codigo;

      $tableVentas.data(dataVentas);

      if ($cardEditarMain[0]) {
        inputEditarMainId.value = id;
        inputEditarIdTrasaccionVenta.value = id;
        inputNuevoIdTrasaccionVenta.value = id;
        inputEditarMainImporteTotal.value = importe_total;
        metodoTransaccionSelectorUnic.select(metodo_pago_id);
        usuarioSelectorUnic.select(usuario_id);
      }

      $tableTableVentas.removeClass('load-spinner');
    })

    $tableVentas.datatable.on('select', async (e, dt, type, indexes) => {
      let { id, producto_id, cantidad } = $tableVentas.datatable
        .rows(indexes).data().toArray()[0];
      toggleCardEditar(true);
      inputEditarIdVentas.value = id;
      inputEditarCantidadVentas.value = cantidad;
      productosEditarSelectorUnic.select(producto_id);
    })

    $tableMain.datatable.on('deselect', _ => {
      toggleTable(false);
      toggleCardEditar(false);
      toggleCardNuevo(false);
    })

    $tableVentas.datatable.on('deselect', _ => {
      toggleCardEditar(false);
    })

    /* 
    ==================================================
    =================== EDITAR MAIN ===================
    ==================================================
    */

    if ($cardEditarMain[0]) {
      btnEditarMain.addEventListener('click', async () => {
        let id = Number(inputEditarMainId.value);
        let json = { id };

        json.importe_total = Number(inputEditarMainImporteTotal.value);

        let selectMetodo = metodoTransaccionSelectorUnic.selected[0];
        if (!selectMetodo) return formError(`Selecciona un Metodo`, inputSelectorMetodoPago.parentNode);
        json.metodo_pago_id = selectMetodo.id;

        let selectVendedor = usuarioSelectorUnic.selected[0];
        if (!selectVendedor) return formError(`Selecciona un Vendedor`, inputSelectorVendedor.parentNode);
        json.usuario_id = selectVendedor.id;

        let resTrasaccionUpdate = await query.post.json.cookie("/api/transacciones_ventas/table/updateId", json);

        /** @type {{err: string, OkPacket: import('mysql').OkPacket, list: {[column:string]: string|number}[]}} */
        let { err } = await resTrasaccionUpdate.json();

        if (err)
          return alarm.error(`Transaccion no Editada.`);

        alarm.success(`Transaccion Editada.`);
      })
    }

    /* 
      ==================================================
      ================== NUEVO VENTAS ==================
      ==================================================
    */

    if ($cardNuevoVentas[0]) {
      tblNuevoVentas.forEach(btn => btn.addEventListener('click', () => toggleCardNuevo(true)))

      btnNuevoVentas.addEventListener('click', async () => {
        let transaccion_id = Number(inputNuevoIdTrasaccionVenta.value);
        let json = { transaccion_id };

        json.cantidad = Number(inputNuevoCantidadVentas.value);

        let selectProducto = productosNuevoSelectorUnic.selected[0];
        if (!selectProducto) return formError(`Selecciona un Producto`, inputNuevoSelectorProductos.parentNode);
        json.producto_id = selectProducto.id;

        let resTrasaccionUpdate = await query.post.json.cookie("/api/ventas/table/insert", json);

        /** @type {{err: string, OkPacket: import('mysql').OkPacket, list: {[column:string]: string|number}[]}} */
        let { err, data } = await resTrasaccionUpdate.json();

        if (err)
          return alarm.error(`Venta no Agregada.`);

        $tableMain.update('#' + transaccion_id, {
          descuento: data.descuento?.toFixed(2)
        });

        alarm.success(`Venta Agregada.`);

        $tableMain.datatable.rows().deselect();
        $tableMain.datatable.rows('#' + transaccion_id).select();
        $tableVentas.datatable.rows('#' + id).select();
      })
    }

    /* 
    ==================================================
    ================== EDITAR VENTAS ==================
    ==================================================
    */

    if ($cardEditarVentas[0]) {
      btnEditarVentas.addEventListener('click', async () => {
        let id = Number(inputEditarIdVentas.value);
        let transaccion_id = Number(inputEditarIdTrasaccionVenta.value);
        let json = { id, transaccion_id };

        json.cantidad = Number(inputEditarCantidadVentas.value);

        let selectProducto = productosEditarSelectorUnic.selected[0];
        if (!selectProducto) return formError(`Selecciona un Producto`, inputEditarSelectorProductos.parentNode);
        json.producto_id = selectProducto.id;

        let resTrasaccionUpdate = await query.post.json.cookie("/api/ventas/table/updateId", json);

        /** @type {{err: string, OkPacket: import('mysql').OkPacket, list: {[column:string]: string|number}[]}} */
        let { err } = await resTrasaccionUpdate.json();

        if (err)
          return alarm.error(`Venta no Editada.`);

        alarm.success(`Venta Editada.`);
      })
    }

    /* 
      ==================================================
      ==================== ELIMINAR ====================
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
          if (result.isConfirmed) {
            let resClientes = await query.post.json.cookie("/api/transacciones_ventas/table/deleteId", { id });

            /** @type {{err: string, OkPacket: import('mysql').OkPacket, list: {[column:string]: string|number}[]}} */
            let { err } = await resClientes.json();

            if (err)
              return alarm.error(`Transaccion no Eliminada.`);

            alarm.success(`Transaccion eliminada.`);
          }
        });
    }))

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
            if (result.isConfirmed) {

              let resClientes = await query.post.json.cookie("/api/transacciones_ventas/table/deleteId", { id: transaccion_id });

              /** @type {{err: string, OkPacket: import('mysql').OkPacket, list: {[column:string]: string|number}[]}} */
              let { err } = await resClientes.json();

              if (err)
                return alarm.error(`Transaccion no Eliminada.`);

              alarm.success(`Transaccion eliminada.`);
            }
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
          if (result.isConfirmed) {

            let resClientes = await query.post.json.cookie("/api/ventas/table/deleteId", { id, transaccion_id });

            /** @type {{err: string, OkPacket: import('mysql').OkPacket, list: {[column:string]: string|number}[]}} */
            let { err } = await resClientes.json();

            if (err)
              return alarm.error(`Venta no Eliminada.`);

            alarm.success(`Venta eliminada.`);
          }
        });

    }))

    /* 
      ==================================================
      ===================== SOCKET =====================
      ==================================================
    */

    socket.on('/transacciones_ventas/data/insert', data => {
      $tableMain.add({
        id: data.id,
        codigo: data.codigo,
        usuario_id: data.usuario_id,
        usuario: data.usuario,
        metodo_pago_id: data.metodo_pago_id,
        metodo_pago_nombre: data.metodo_pago_nombre,
        descuento: data.descuento,
        importe_total: data.importe_total,
        creacion: formatTime('YYYY-MM-DD hh:mm:ss')
      });
    })

    socket.on('/transacciones_ventas/data/updateId', data => {
      $tableMain.update('#' + data.id, {
        usuario_id: data.usuario_id,
        usuario: data.usuario,
        metodo_pago_id: data.metodo_pago_id,
        metodo_pago_nombre: data.metodo_pago_nombre,
        importe_total: data.importe_total
      });

      let id = $tableMain.selected();
      if (data.id != id) return;
      $tableMain.datatable.rows().deselect();
      $tableMain.datatable.rows('#' + id).select();
    })

    socket.on('/transacciones_ventas/data/deleteId', data => {
      let row = $tableMain.get('#' + data.id);
      if (!row) return;
      $tableMain.remove('#' + data.id);

      let id = $tableMain.selected();
      if (data.id != id) return;
      toggleTable(false);
      toggleCardEditar(false);
    })

    socket.on('/transacciones_ventas/data/refreshId', data => {
      $tableMain.update('#' + data.id, {
        descuento: data.descuento
      });

      let id = $tableMain.selected();
      if (data.id != id) return;
      $tableMain.datatable.rows().deselect();
      $tableMain.datatable.rows('#' + data.id).select();
    })

    socket.on('/ventas/data/deleteId', data => {
      let row = $tableVentas.get('#' + data.id);
      if (!row) return;
      $tableVentas.remove('#' + data.id);

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