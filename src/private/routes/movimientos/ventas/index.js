$('.content-body').ready(async () => {
  try {

    function textToHtml(text = '') {
      let div = document.createElement('div')
      div.innerHTML = text;
      return div.children;
    }

    /* 
      ==================================================
      =================== QUERY DATA ===================
      ==================================================
    */

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

    let $tableHistory = new Tables('#table-historial');

    /* 
      ==================================================
      ==================== DATATABLE ====================
      ==================================================
    */

    $tableHistory.init({
      serverSide: true,
      ajax: (data, end) => {
        socket.emit('/read/table', data, res => end(res))
      },
      pageLength: 10,
      order: [[5, 'asc']],
      columnDefs: [
        {
          name: 'tv.codigo',
          className: 'dtr-code',
          targets: 0,
        },
        {
          name: 'p.producto',
          className: 'dtr-tag',
          orderable: false,
          targets: 1,
          render: data => '<div>' + data + '</div>'
        },
        {
          name: 'v.cantidad',
          className: 'dt-type-numeric',
          targets: 2,
          render: data => data?.toFixed(0)
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
          name: 'hora',
          className: 'dt-type-date',
          targets: 5
        }
      ],
      columns: [
        { data: 'transaccion_codigo' },
        { data: 'producto_nombre' },
        { data: 'cantidad' },
        { data: 'importe' },
        { data: 'descuento' },
        { data: 'transaccion_hora' }
      ],
    })
    $tableHistory.buttons('.tables-utils .download');

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

    let dataSelectorMetodoPago = new OptionsServerside(
      (req, end) => socket.emit('/selector/metodoPago', req, res => end(res)),
      { showIndex: false, order: 'asc', noInclude: true }
    );

    /* ===================== SOCKET ===================== */


    /* 
      ==================================================
      ==================== SELECTOR ====================
      ==================================================
    */

    let dataSelectorClientes = new OptionsServerside(
      (req, end) => socket.emit('/selector/cliente', req, res => end(res)),
      { showIndex: false, order: 'asc', noInclude: true }
    );

    /* ===================== SOCKET ===================== */

    socket.on('/clientes/data/insert', data => {
      dataSelectorClientes.set(data.id, data.nombres);
    })

    socket.on('/clientes/data/updateId', data => {
      dataSelectorClientes.set(data.id, { name: data.nombres });
    })

    socket.on('/clientes/data/state', data => {
      if (data.estado)
        dataSelectorClientes.draw(true);
      else
        dataSelectorClientes.delete(data.id);
    })

    socket.on('/clientes/data/deleteId', data => {
      dataSelectorClientes.delete(data.id);
    })

    /* 
      ==================================================
      ==================== SELECTOR ====================
      ==================================================
    */

    let dataSelectorProductos = new OptionsServerside(
      (req, end) => socket.emit('/selector/producto', req, res => end(res)),
      { showIndex: 'img', order: 'asc', noInclude: true }
    );

    /* ===================== SOCKET ===================== */

    socket.on('/productos/data/insert', data => {
      dataSelectorProductos.set(data.id, data.codigo + ' - ' + data.producto, data.foto_src_small);
    })

    socket.on('/productos/data/updateId', data => {
      dataSelectorProductos.set(data.id, { name: data.codigo + ' - ' + data.producto, src: data.foto_src_small });
    })

    socket.on('/productos/data/state', data => {
      if (data.estado)
        dataSelectorProductos.draw(true);
      else
        dataSelectorProductos.delete(data.id);
    })

    socket.on('/productos/data/deleteId', data => {
      dataSelectorProductos.delete(data.id);
    })

    /* 
      ==================================================
      ================== SELECTOR UNIC ==================
      ==================================================
    */

    let metodoPagoSelectorUnic = new SelectorInput(
      inputSelectorMetodoPago,
      dataSelectorMetodoPago,
      { justChange: true }
    );
    let clientesSelectorUnic = new SelectorInput(
      inputSelectorCliente,
      dataSelectorClientes,
      { justChange: true }
    );

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

    metodoPagoSelectorUnic.on('deselected', () => {
      inputIgv.value = `- %`;
      inputIgv.valueIgv = undefined;
    })

    /* 
      ==================================================
      ================== REFRESH DATA RESULT ==================
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

    /* 
      ==================================================
      ================== CLICK ADD ROW ==================
      ==================================================
    */

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
      inputBoxCount.inputElement = inputCount;
      let inputSelect = inputBoxSelect.querySelector('input');

      let selector = inputBoxSelect.Selector = new SelectorInput(
        inputSelect,
        dataSelectorProductos,
        { autohide: true }
      );

      let row = witgetTable.newRow({
        cantidad: inputBoxCount,
        producto: inputBoxSelect
      })
      row.tr.setAttribute('ignore', true)

      let precioVenta = 0;
      selector.on('selected', async dataSelected => {
        let resProductos = await query.post.json.cookie("/api/productos/table/readPriceId", { id: dataSelected.id });

        /** @type {{err: string, OkPacket: import('mysql').OkPacket, list: {[column:string]: string|number}[]}} */
        let { list } = await resProductos.json();
        precioVenta = list.venta;

        row.tr.removeAttribute('ignore')
        row.set.precio(precioVenta);
        row.set.total((precioVenta * (Number(inputCount.value) || 0)).toFixed(2));
        refresh();
      })

      inputCount.addEventListener('change', () => {
        if (inputCount.value == 0)
          return row.tr.setAttribute('ignore', true);
        row.set.total((precioVenta * (Number(inputCount.value) || 0)).toFixed(2));
        refresh();
      })

      selector.on('deselected', _ => {
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
          selector.deselect(selector.selected[0].id)

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
      =================== CLICK SAVE ===================
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
      $tableHistory.datatable.draw(data);
    })

    socket.on('/transacciones_ventas/data/updateId', (data) => {
      $tableHistory.datatable.draw(data);
    })

    socket.on('/transacciones_ventas/data/deleteId', data => {
      $tableHistory.datatable.draw(data);
    })

  } catch ({ message, stack }) {
    socket.emit('/err/client', { message, stack, url: window.location.href })
  }
})