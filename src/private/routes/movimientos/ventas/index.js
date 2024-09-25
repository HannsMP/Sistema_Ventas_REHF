$('.content-body').ready(async () => {
  try {

    function textToHtml(text) {
      let div = document.createElement('div')
      div.innerHTML = text;
      return div.children;
    }

    /* 
      ==================================================
      =================== QUERY DATA ===================
      ==================================================
    */

    let resTransaccionesVentas = await query.post.cookie("/api/transacciones_ventas/profile/readAll");
    /** @typedef {{agregar:number, editar:number, eliminar:number, exportar:number, ocultar:number, ver:number}} PERMISOS */
    /** @type {{err: string, OkPacket: import('mysql').OkPacket, list: {[column:string]: string|number}[], permisos: PERMISOS}} */
    let { list: dataTransaccionesVentas } = await resTransaccionesVentas.json();

    /* 
      ==================================================
      ================== VARIABLES DOM ==================
      ==================================================
    */

    let menuBody = document.querySelector('.menu-body');

    let tableMain = menuBody.querySelector('#table-main');

    let inputSelectorMetodoPago = menuBody.querySelector('input.selector#selector-metodo-pago');
    let inputIgv = menuBody.querySelector('input#importe-igv');
    let inputSelectorCliente = menuBody.querySelector('input.selector#selector-cliente');
    let inputSerie = menuBody.querySelector('input#numero-serie');
    let inputComentario = menuBody.querySelector('#comentario');

    let inputImporteTotal = menuBody.querySelector('input#importe-total');

    let btnClear = menuBody.querySelector('#clear');
    let btnAddRow = menuBody.querySelector('#add-row');
    let btnGuardar = menuBody.querySelector('#save');

    /* 
      ==================================================
      ==================== DATATABLE ====================
      ==================================================
    */

    let $tableHistory = new Tables('#table-historial');

    dataTransaccionesVentas.forEach(d => {
      d.descuento = d.descuento?.toFixed(2);
      d.importe_total = d.importe_total?.toFixed(2);
      d.cliente_nombres = '<div>' + d.cliente_nombres + '</div>';
      d.metodo_pago_nombre = '<div>' + d.metodo_pago_nombre + '</div>';
    });

    $tableHistory.init({
      data: dataTransaccionesVentas,
      /*  select: true, */
      pageLength: 10,
      order: [[5, 'asc']],
      columnDefs: [
        {
          className: 'dtr-code',
          targets: 0,
        },
        {
          className: 'dtr-tag',
          orderable: false,
          targets: 1,
        },
        {
          className: 'dtr-tag',
          targets: 2,
        },
        {
          className: 'dt-type-date',
          targets: 5
        }
      ],
      columns: [
        { data: 'codigo' },
        { data: 'cliente_nombres' },
        { data: 'metodo_pago_nombre' },
        { data: 'descuento' },
        { data: 'importe_total' },
        { data: 'hora' }
      ],
    })
    $tableHistory.buttons('.tables-utils .download');
    /* 
      $tableHistory.datatable.on('select', async (e, dt, type, indexes) => {
    
        Swal.fire({
          input: "textarea",
          inputPlaceholder: "Escribe tu mensaje aquí...",
          text: "Que problema tiene esta venta?",
          icon: "question",
          showCancelButton: true,
          confirmButtonColor: "rgb(13, 204, 242)",
          cancelButtonColor: "rgb(220, 53, 69)",
          confirmButtonText: "Informar",
          cancelButtonText: "Cancelar",
          background: 'rgb(24, 20, 47)',
          color: 'rgb(255, 255, 255)',
        })
          .then(async (result) => {
    
            let { id } = $tableHistory.datatable.rows(indexes).data().toArray()[0];
          })
    
      })
     */
    /* 
      ==================================================
      =================== WITGETTABLE ===================
      ==================================================
    */

    let witgetTable = new WitgetTable(tableMain, {
      columns: [
        { tittle: 'cantidad', width: '15%' },
        { tittle: 'producto', width: '40%' },
        { tittle: 'precio', width: '20%' },
        { tittle: 'total', width: '25%' },
      ],
      drag: false,
      drop: true
    });

    /* 
      ==================================================
      ==================== SELECTOR ====================
      ==================================================
    */

    let resMetodoPago = await query.post.cookie("/api/tipo_metodo_pago/selector/readAll");

    /** @type {{err: string, OkPacket: import('mysql').OkPacket, list: {[column:string]: string|number}[]}} */
    let { list: dataMetodoPago } = await resMetodoPago.json();

    let dataSelectorMetodoPago = new Selector(dataMetodoPago);

    let resProductos = await query.post.cookie("/api/productos/selector/readAll");

    /** @type {{err: string, OkPacket: import('mysql').OkPacket, list: {[column:string]: string|number}[]}} */
    let { list: dataProductos } = await resProductos.json();

    let dataSelectorProductos = new Selector(dataProductos, 'img');

    /* ===================== SOCKET ===================== */

    socket.on('/productos/data/insert', data => {
      dataSelectorProductos.add(data.id, data.codigo + ' - ' + data.producto, data.foto_src_small);
    })

    socket.on('/productos/data/updateId', data => {
      dataSelectorProductos.upd(data.id, { name: data.codigo + ' - ' + data.producto, src: data.foto_src_small });
    })

    socket.on('/productos/data/state', data => {
      if (data.estado)
        dataSelectorProductos.add(data.id, data.codigo + ' - ' + data.producto, data.foto_src_small);
      else
        dataSelectorProductos.rmv(data.id);
    })

    socket.on('/productos/data/deleteId', data => {
      dataSelectorProductos.rmv(data.id);
    })

    let resClientes = await query.post.cookie("/api/clientes/selector/readAll");

    /** @type {{err: string, OkPacket: import('mysql').OkPacket, list: {[column:string]: string|number}[]}} */
    let { list: dataClientes } = await resClientes.json();

    let dataSelectorClientes = new Selector(dataClientes);

    /* ===================== SOCKET ===================== */

    socket.on('/clientes/data/insert', data => {
      dataSelectorClientes.add(data.id, data.nombres);
    })

    socket.on('/clientes/data/updateId', data => {
      dataSelectorClientes.upd(data.id, { name: data.nombres });
    })

    socket.on('/clientes/data/state', data => {
      if (data.estado)
        dataSelectorClientes.add(data.id, data.nombres);
      else
        dataSelectorClientes.rmv(data.id);
    })

    socket.on('/clientes/data/deleteId', data => {
      dataSelectorClientes.rmv(data.id);
    })

    /* 
      ==================================================
      ================== SELECTOR UNIC ==================
      ==================================================
    */

    let metodoPagoSelectorUnic = new SelectorUnic(inputSelectorMetodoPago, dataSelectorMetodoPago, true);
    let clientesSelectorUnic = new SelectorUnic(inputSelectorCliente, dataSelectorClientes);

    /* 
      ==================================================
      ============== SELECTOR METODO PAGO ==============
      ==================================================
    */

    metodoPagoSelectorUnic.on('selected', async indexer => {

      let resMetodoPago = await query.post.json.cookie("/api/tipo_metodo_pago/code/read", { id: indexer.id });

      /** @type {{data: {nombre:string, contador: number, igv:number}}} */
      let { data } = await resMetodoPago.json();

      if (inputImporteTotal.valueImporte) {
        let importeIgv = inputImporteTotal.valueImporte * data.igv;

        let importeTotal = inputImporteTotal.valueImporte + importeIgv;

        inputImporteTotal.placeholder = inputImporteTotal.value = importeTotal;

        inputIgv.value = `${(data.igv * 100).toFixed(2)} %  -  s/ ${importeIgv.toFixed(2)}`;
      }
      else
        inputIgv.value = `${(data.igv * 100).toFixed(2)} %`;

      inputIgv.valueIgv = data.igv;
    })

    metodoPagoSelectorUnic.on('diselected', () => {
      inputIgv.value = `- %`;
      inputIgv.valueIgv = undefined;
    })

    /* 
      ==================================================
      ================== CLICK ADD ROW ==================
      ==================================================
    */

    let refresh = () => {
      let importeTotal = 0;
      witgetTable.dataTable.forEach(({ data }) => {
        if (data.total != '-') importeTotal += Number(data.total);
      })

      let importeIgv = importeTotal * inputIgv.valueIgv;

      inputIgv.value = `${(inputIgv.valueIgv * 100).toFixed(2)} %  -  s/ ${importeIgv.toFixed(2)}`;

      importeTotal += importeIgv;
      inputImporteTotal.valueImporte
        = inputImporteTotal.placeholder
        = inputImporteTotal.value
        = importeTotal;
    }
    let clickAddRow = _ => {
      let inputBoxCount = textToHtml(`
          <div class="input-box" style="width: 100%;;">
            <input type="text" oninput="inputInt(this, 10);" value="1" placeholder="Cantidad?">
          </div>
        `)[0];

      let inputBoxSelect = textToHtml(`
          <div class="input-box" style="width: 100%; padding:0">
            <input class="selector" type="search" placeholder="Buscar producto...">
          </div>
        `)[0];

      let inputCount = inputBoxCount.querySelector('input');
      let inputSelect = inputBoxSelect.querySelector('input');

      let selector = inputBoxSelect.Selector = new SelectorUnic(inputSelect, dataSelectorProductos, true);

      let row = witgetTable.newRow({
        cantidad: inputBoxCount,
        producto: inputBoxSelect
      })
      row.tr.setAttribute('ignore', true)

      let beforeChage;

      selector.on('selected', async indexer => {
        let resProductos = await query.post.json.cookie("/api/productos/table/readPriceId", { id: indexer.id });

        /** @type {{err: string, OkPacket: import('mysql').OkPacket, list: {[column:string]: string|number}[]}} */
        let { list } = await resProductos.json();

        let cloneCount = inputCount.cloneNode(true);
        inputCount.replaceWith(cloneCount);
        inputBoxCount.inputElement = cloneCount;

        let change = beforeChage = _ => {
          row.set.precio(list.venta);
          row.set.total(list.venta * (Number(cloneCount.value) || 0));
          refresh();
        }

        cloneCount.addEventListener('change', change);
        change();

        row.tr.removeAttribute('ignore')
      })

      selector.on('diselected', _ => {
        row.set.precio();
        row.set.total();

        inputIgv.value = `${(inputIgv.valueIgv * 100).toFixed(2)} %`;
        inputImporteTotal.placeholder = inputImporteTotal.value = 0;

        row.tr.setAttribute('ignore', true)
        refresh();
      })

      witgetTable.on('drop', r => {
        if (row != r) return;

        if (selector.selected[0])
          selector.diselect(selector.selected[0].id)

        delete inputBoxCount
        delete inputBoxSelect
        delete inputCount
        delete inputSelect
        delete selector
        delete row


        refresh();
      })
    }

    btnAddRow.addEventListener('click', clickAddRow)

    /* 
      ==================================================
      =================== CLICK CLEAR ===================
      ==================================================
    */

    let clickClear = _ => {
      witgetTable.dataTable.forEach(({ dragger }) => dragger.click())

      inputImporteTotal.valueImporte
        = inputImporteTotal.placeholder
        = inputImporteTotal.value
        = 0;

      clientesSelectorUnic.select(1);
      metodoPagoSelectorUnic.select(1);
      dataSelectorProductos.reset()

      clickAddRow();
    }

    btnClear.addEventListener('click', clickClear);
    clickClear();

    /* 
      ==================================================
      =================== CLICK CLEAR ===================
      ==================================================
    */

    btnGuardar.addEventListener('click', async () => {
      let jsonData = {};

      let metodoPagoData = metodoPagoSelectorUnic.selected[0];
      if (!metodoPagoData) return formError('Selecciona un metodo de pago.', inputSelectorMetodoPago.parentNode);
      jsonData.metodo_pago_id = metodoPagoData.id;

      let clienteData = clientesSelectorUnic.selected[0];
      if (!clienteData) return formError('Selecciona un Ciente o desconicido.', inputSelectorCliente.parentNode);
      jsonData.cliente_id = clienteData.id;

      jsonData.productos = witgetTable.dataTable.map(({ data, tr }) => {
        if (tr.hasAttribute('ignore')) return;

        let cantidad = Number(data.cantidad.inputElement.value);
        let producto_id = data.producto.Selector.selected[0].id;
        return { cantidad, producto_id }
      })

      let importe_total = Number(inputImporteTotal.value);
      if (importe_total == 0)
        return formError('No hay productos?', inputImporteTotal.parentNode);

      jsonData.importe_total = importe_total;

      jsonData.serie = inputSerie.value;
      jsonData.comentario = inputComentario.value

      let resTransaccionVentas = await query.post.json.cookie("/api/transacciones_ventas/profile/insert", jsonData);

      /** @type {{err: string, OkPacket: import('mysql').OkPacket, list: {[column:string]: string|number}[]}} */
      let { err } = await resTransaccionVentas.json();

      if (err)
        return alarm.warn('No se pudo agregar');

      alarm.success(`Fila Agregada`);
      clickClear();
    })

    /* 
      ==================================================
      ===================== SOCKET =====================
      ==================================================
    */

    socket.on('/transacciones_ventas/data/insert', data => {
      $tableHistory.add({
        id: data.id,
        codigo: data.codigo,
        descuento: data.descuento.toFixed(2),
        cliente_nombres: '<div>' + data.cliente_nombres + '</div>',
        metodo_pago_nombre: '<div>' + data.metodo_pago_nombre + '</div>',
        importe_total: data.importe_total.toFixed(2),
        hora: formatTime('hh:mm:ss TT')
      });
    })

    socket.on('/productos/data/updateId', (data) => {
      let row = $tableHistory.get('#' + data.id);
      if (!row) return;

      $tableHistory.update({
        cliente_id: data.cliente_id,
        cliente_nombres: '<div>' + data.cliente_nombres + '</div>',
        metodo_pago_id: data.metodo_pago_id,
        metodo_pago_nombre: '<div>' + data.metodo_pago_nombre + '</div>',
        descuento: data.descuento.toFixed(2),
        importe_total: data.importe_total.toFixed(2)
      });
    })

    socket.on('/transacciones_ventas/data/deleteId', data => {
      let row = $tableHistory.get('#' + data.id);
      if (!row) return;
      $tableHistory.remove('#' + data.id);
    })

  } catch ({ message, stack }) {
    socket.emit('/err/client', { message, stack, url: window.location.href })
  }
})