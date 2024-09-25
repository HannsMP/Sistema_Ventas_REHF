$('.content-body').ready(async () => {
  try {

    /* 
      ==================================================
      =================== QUERY DATA ===================
      ==================================================
    */

    let resTransaccionesVentas = await query.post.cookie("/api/transacciones_ventas/table/readAll");
    /** @typedef {{agregar:number, editar:number, eliminar:number, exportar:number, ocultar:number, ver:number}} PERMISOS */
    /** @type {{err: string, OkPacket: import('mysql').OkPacket, list: {[column:string]: string|number}[], permisos: PERMISOS}} */
    let { list: dataTransaccionesVentas, permisos: permisosTransaccionesVentas } = await resTransaccionesVentas.json();

    /* 
      ==================================================
      ================== VARIABLES DOM ==================
      ==================================================
    */

    let tableTableMain = document.querySelector('#card-table-main');
    let mainEliminarTbl = tableTableMain.querySelectorAll('.tbl-eliminar');

    let $tableTableVentas = $('#card-table-ventas');
    let ventasEliminarTbl = $tableTableVentas[0]?.querySelectorAll('.tbl-eliminar');
    let ventasNuevoTbl = $tableTableVentas[0]?.querySelectorAll('.tbl-nuevo');
    let cardVentasTittle = $tableTableVentas[0]?.querySelector('.card-tittle');

    let $cardEditarMain = $('#card-editar');
    let inputEditarMainId = $cardEditarMain[0]?.querySelector('input[name=id]');
    let inputEditarMainImporteTotal = $cardEditarMain[0]?.querySelector('input[type=text]');
    let inputSelectorVendedor = $cardEditarMain[0]?.querySelector('input.selector#vendedor');
    let inputSelectorMetodoPago = $cardEditarMain[0]?.querySelector('input.selector#metodo-transaccion');
    let btnEditarMain = $cardEditarMain[0]?.querySelector('.btn');

    let $cardNuevoVentas = $('#card-nuevo-ventas');
    let inputNuevoIdTrasaccionVenta = $cardNuevoVentas[0]?.querySelector('input[name=transaccion_id]');
    let inputNuevoCantidadVentas = $cardNuevoVentas[0]?.querySelector('input[type=text]');
    let inputNuevoSelectorProductos = $cardNuevoVentas[0]?.querySelector('input.selector#productos');
    let btnNuevoVentas = $cardNuevoVentas[0]?.querySelector('.btn');

    let $cardEditarVentas = $('#card-editar-ventas');
    let inputEditarIdVentas = $cardEditarVentas[0]?.querySelector('input[name=id]');
    let inputEditarIdTrasaccionVenta = $cardEditarVentas[0]?.querySelector('input[name=transaccion_id]');
    let inputEditarCantidadVentas = $cardEditarVentas[0]?.querySelector('input[type=text]');
    let inputEditarSelectorProductos = $cardEditarVentas[0]?.querySelector('input.selector#productos');
    let btnEditarVentas = $cardEditarVentas[0]?.querySelector('.btn');

    let calendarioBox = document.querySelector('.calendario');

    /* 
      ==================================================
      ==================== DATATABLE ====================
      ==================================================
    */

    let $tableMain = new Tables('#table-main');
    let $tableVentas = new Tables('#table-toggle');

    dataTransaccionesVentas.forEach(d => {
      d.descuento = d.descuento?.toFixed(2);
      d.importe_total = d.importe_total?.toFixed(2);
      d.usuario = '<div>' + d.usuario + '</div>';
      d.metodo_pago_nombre = '<div>' + d.metodo_pago_nombre + '</div>';
    });

    $tableMain.init({
      data: dataTransaccionesVentas,
      select: true,
      pageLength: 10,
      order: [[5, 'des']],
      columnDefs: [
        {
          className: 'dtr-code',
          orderable: false,
          targets: 0
        },
        {
          className: 'dtr-tag',
          targets: 1
        },
        {
          className: 'dtr-tag',
          targets: 2
        },
        {
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
    $tableMain.buttons('.tables-utils .download');

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
          targets: 1
        },
        {
          className: 'dtr-tag',
          targets: 2
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
    $tableVentas.buttons('.tables-utils .download-other');

    /* 
      ==================================================
      ==================== SELECTOR ====================
      ==================================================
    */

    let resProductos = await query.post.cookie("/api/productos/selector/readAll");

    /** @type {{err: string, OkPacket: import('mysql').OkPacket, list: {[column:string]: string|number}[]}} */
    let { list: dataProductos } = await resProductos.json();

    let dataSelectorProductos = $cardEditarVentas[0] && new Selector(dataProductos, 'img');

    let resMetodoPago = await query.post.cookie("/api/tipo_metodo_pago/selector/readAll");

    /** @type {{err: string, OkPacket: import('mysql').OkPacket, list: {[column:string]: string|number}[]}} */
    let { list: dataMetodoPago } = await resMetodoPago.json();

    let dataSelectorMetodoPago = $cardEditarMain[0] && new Selector(dataMetodoPago);

    let resUsuarios = await query.post.cookie("/api/usuarios/selector/readAll");

    /** @type {{err: string, OkPacket: import('mysql').OkPacket, list: {[column:string]: string|number}[]}} */
    let { list: dataUsuarios } = await resUsuarios.json();

    let dataSelectorUsuarios = $cardEditarMain[0] && new Selector(dataUsuarios);

    /* 
      ==================================================
      ================== SELECTOR UNIC ==================
      ==================================================
    */

    let productosNuevoSelectorUnic = $cardEditarVentas[0]
      ? new SelectorUnic(inputNuevoSelectorProductos, dataSelectorProductos) : null;
    let productosEditarSelectorUnic = $cardEditarVentas[0]
      ? new SelectorUnic(inputEditarSelectorProductos, dataSelectorProductos) : null;
    let metodoTransaccionSelectorUnic = $cardEditarMain[0]
      ? new SelectorUnic(inputSelectorMetodoPago, dataSelectorMetodoPago) : null;
    let usuarioSelectorUnic = $cardEditarMain[0]
      ? new SelectorUnic(inputSelectorVendedor, dataSelectorUsuarios) : null;

    /* 
      ==================================================
      =================== TOGGLE ===================
      ==================================================
    */

    function toggleTable(state) {
      if (state) {
        $tableTableVentas.show('fast');
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

      cardVentasTittle.textContent = codigo
      dataVentas.forEach(data => {
        data.precio_compra = data.precio_compra?.toFixed(2);
        data.precio_venta = data.precio_venta?.toFixed(2);
        data.descuento = data.descuento?.toFixed(2);
        data.importe = data.importe?.toFixed(2);
        data.producto_nombre = '<div>' + data.producto_nombre + '</div>';
        data.categoria_nombre = '<div>' + data.categoria_nombre + '</div>';
      })

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
      ventasNuevoTbl.forEach(btn => btn.addEventListener('click', () => toggleCardNuevo(true)))

      btnNuevoVentas.addEventListener('click', async () => {
        let transaccion_id = Number(inputNuevoIdTrasaccionVenta.value);
        let json = { transaccion_id };

        json.cantidad = Number(inputNuevoCantidadVentas.value);

        let selectProducto = productosNuevoSelectorUnic.selected[0];
        if (!selectProducto) return formError(`Selecciona un Producto`, inputNuevoSelectorProductos.parentNode);
        json.producto_id = selectProducto.id;

        let resTrasaccionUpdate = await query.post.json.cookie("/api/ventas/table/insert", json);

        /** @type {{err: string, OkPacket: import('mysql').OkPacket, list: {[column:string]: string|number}[]}} */
        let { err, OkPacket, data } = await resTrasaccionUpdate.json();

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

    if (permisosTransaccionesVentas.eliminar) {
      mainEliminarTbl.forEach(btn => btn.addEventListener('click', _ => {
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

      ventasEliminarTbl.forEach(btn => btn.addEventListener('click', _ => {
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
    }

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
        usuario: '<div>' + data.usuario + '</div>',
        metodo_pago_id: data.metodo_pago_id,
        metodo_pago_nombre: '<div>' + data.metodo_pago_nombre + '</div>',
        descuento: data.descuento.toFixed(2),
        importe_total: data.importe_total.toFixed(2),
        creacion: formatTime('YYYY-MM-DD hh:mm:ss')
      });
    })

    socket.on('/transacciones_ventas/data/updateId', data => {
      $tableMain.update('#' + data.id, {
        usuario_id: data.usuario_id,
        usuario: '<div>' + data.usuario + '</div>',
        metodo_pago_id: data.metodo_pago_id,
        metodo_pago_nombre: '<div>' + data.metodo_pago_nombre + '</div>',
        importe_total: data.importe_total.toFixed(2)
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
        descuento: data.descuento?.toFixed(2)
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

  } catch ({ message, stack }) {
    socket.emit('/err/client', { message, stack, url: window.location.href })
  }
})