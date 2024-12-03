$('.content-body').ready(async () => {
  try {

    function textToHtml(text = '') {
      let div = document.createElement('div')
      div.innerHTML = text;
      return div.children;
    }

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
      =================== WITGETTABLE ===================
      ==================================================
    */

    let witgetTable = new WitgetTable(tableMain, {
      columns: [
        { tittle: 'producto', width: '40%' },
        { tittle: 'cantidad', width: '15%' },
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
      let metodo_pago_id = indexer.id;
      socket.emit('/readId/metodoPago', metodo_pago_id, data => {
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
        importeTotal += (Number(data.total) || 0);
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
          <div class="input-box f-row" style="width: 100%">
            <span>0/</span>
            <input type="text" oninput="inputInt(this, 10);" value="1" placeholder="Cantidad?">
          </div>
        `)[0];
      let inputCount = inputBoxCount.querySelector('input');
      let spanStock = inputBoxCount.querySelector('span');
      inputBoxCount.inputElement = inputCount;
      inputBoxCount.spanElement = spanStock;

      let inputBoxSelect = textToHtml(`
          <div class="input-box" style="width: 100%; padding:0">
            <input class="selector" type="search" placeholder="Buscar producto...">
          </div>
        `)[0];
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

      row.tr.removeAttribute('id');
      row.tr.setAttribute('ignore', true);

      let salePriceValue = 0;
      let stockValue = 0;
      selector.on('selected', async dataSelected => {
        let producto_id = dataSelected.id
        socket.emit('/readSalePriceId/producto', producto_id, data => {
          row.tr.setAttribute('id', producto_id);
          row.tr.removeAttribute('ignore');

          stockValue = data.stock_disponible;
          spanStock.innerText = data.stock_disponible + '/';

          salePriceValue = data.venta;
          row.set.precio(data.venta?.toFixed(2) || 0);

          row.set.total((salePriceValue * (Number(inputCount.value) || 0)).toFixed(2));
          refresh();
        })
      })

      inputCount.addEventListener('change', () => {
        let countValue = Number(inputCount.value) || 0;
        if (countValue == 0)
          return row.tr.setAttribute('ignore', true);
        if (stockValue < countValue) {
          row.tr.setAttribute('ignore', true);
          return formError('Exediste el stock', inputCount);
        }
        row.set.total((salePriceValue * countValue).toFixed(2));
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
      if (!metodoPagoData) return formError('Selecciona un metodo de pago.', inputSelectorMetodoPago);
      jsonData.metodo_pago_id = metodoPagoData.id;

      let clienteData = clientesSelectorUnic.selected[0];
      if (!clienteData) return formError('Selecciona un Ciente o desconicido.', inputSelectorCliente);
      jsonData.cliente_id = clienteData.id;

      jsonData.productos = witgetTable.dataTable.map(({ data, tr }) => {
        if (tr.hasAttribute('ignore')) return;

        let cantidad = Number(data.cantidad.inputElement.value);
        let producto_id = data.producto.Selector.selected[0].id;
        return { producto_id, cantidad }
      })

      let importe_total = Number(inputImporteTotal.value);
      if (importe_total == 0)
        return formError('No hay productos?', inputImporteTotal);

      jsonData.importe_total = importe_total;

      jsonData.serie = inputSerie.value;
      jsonData.comentario = inputComentario.value

      socket.emit('/insert/table', jsonData, err => {
        if (err)
          return alarm.warn(err);

        alarm.success(`Ventas agregadas.`);
        clickClear();
      })
    })

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
      order: [[5, 'desc']],
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
      ===================== SOCKET =====================
      ==================================================
    */

    socket.on('/transacciones_ventas/data/insert', () => {
      $tableHistory.datatable.draw();
    })

    socket.on('/transacciones_ventas/data/updateId', data => {
      if (!$tableHistory.get('#' + data.id)) return;
      $tableHistory.datatable.draw();
    })

    socket.on('/transacciones_ventas/data/deleteId', data => {
      if (!$tableHistory.get('#' + data.id)) return;
      $tableHistory.datatable.draw();
    })

    socket.on('/productos/data/updateIdBussines', () => {
      $tableHistory.datatable.draw();
    })

  } catch ({ message, stack }) {
    socket.emit('/err/client', { message, stack, url: window.location.href })
  }
})