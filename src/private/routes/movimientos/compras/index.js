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

    /** @type {HTMLInputElement} */
    let inputSelectorMetodoPago = menuBody.querySelector('input.selector#selector-metodo-pago');
    /** @type {HTMLInputElement} */
    let inputIgv = menuBody.querySelector('input#importe-igv');
    /** @type {HTMLInputElement} */
    let inputSelectorProveedores = menuBody.querySelector('input.selector#selector-proveedores');
    /** @type {HTMLInputElement} */
    let inputSerie = menuBody.querySelector('input#numero-serie');

    /** @type {HTMLInputElement} */
    let inputImporteTotal = menuBody.querySelector('input#importe-total');

    /** @type {HTMLAnchorElement} */
    let btnClear = menuBody.querySelector('#clear');
    /** @type {HTMLAnchorElement} */
    let btnAddRow = menuBody.querySelector('#add-row');
    /** @type {HTMLAnchorElement} */
    let btnGuardar = menuBody.querySelector('#save');

    let $tableHistory = new Tables('#table-historial');

    /* 
      ==================================================
      =================== WITGETTABLE ===================
      ==================================================
    */

    let witgetTable = new WitgetTable(tableMain, {
      columns: [
        { tittle: 'producto', width: '30%' },
        { tittle: 'precio_venta', width: '20%' },
        { tittle: 'cantidad', width: '10%' },
        { tittle: 'precio_compra', width: '20%' },
        { tittle: 'total', width: '20%' },
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

    let selectorOptionsProveedores = new OptionsServerside(
      (req, end) => socket.emit('/selector/proveedores', req, res => end(res)),
      { showIndex: false, order: 'asc', noInclude: true }
    );

    /* ===================== SOCKET ===================== */

    socket.on('/proveedores/data/insert', data => {
      selectorOptionsProveedores.set(data.id, data.nombres);
    })

    socket.on('/proveedores/data/updateId', data => {
      selectorOptionsProveedores.set(data.id, { name: data.nombres });
    })

    socket.on('/proveedores/data/state', data => {
      if (data.estado)
        selectorOptionsProveedores.draw(true);
      else
        selectorOptionsProveedores.delete(data.id);
    })

    socket.on('/proveedores/data/deleteId', data => {
      selectorOptionsProveedores.delete(data.id);
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

    let selectorMetodoPago = new SelectorInput(
      inputSelectorMetodoPago,
      dataSelectorMetodoPago,
      { justChange: true }
    );
    let selectorProveedores = new SelectorInput(
      inputSelectorProveedores,
      selectorOptionsProveedores,
      { justChange: true }
    );

    /* 
      ==================================================
      ============== SELECTOR METODO PAGO ==============
      ==================================================
    */

    selectorMetodoPago.on('selected', async indexer => {
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

    selectorMetodoPago.on('deselected', () => {
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
          <div class="input-box" style="width: 100%">
            <input type="text" oninput="inputInt(this, 10);" value="1" placeholder="Cantidad?">
          </div>
        `)[0];
      let inputCount = inputBoxCount.querySelector('input');
      inputBoxCount.inputElement = inputCount;

      let inputBoxSelect = textToHtml(`
          <div class="input-box" style="width: 100%; padding:0">
            <input class="selector" type="search" placeholder="Buscar producto...">
          </div>
        `)[0];
      let inputSelect = inputBoxSelect.querySelector('input');

      let inputBoxBuyPrice = textToHtml(`
          <div class="input-box" style="width: 100%">
            <input type="text" oninput="inputFloat(this, 10, 2);" value="0" placeholder="Precio de compra?">
          </div>
        `)[0];
      let inputBuyPrice = inputBoxBuyPrice.querySelector('input');
      inputBoxBuyPrice.inputElement = inputBuyPrice;

      let inputBoxSalePrice = textToHtml(`
        <div class="input-box" style="width: 100%">
          <input type="text" oninput="inputFloat(this, 10, 2);" value="-" placeholder="Venta Nominal?">
        </div>
      `)[0];

      let inputSalePrice = inputBoxSalePrice.querySelector('input');
      inputBoxSalePrice.inputElement = inputSalePrice;

      let selector = inputBoxSelect.Selector = new SelectorInput(
        inputSelect,
        dataSelectorProductos,
        { autohide: true }
      );

      let row = witgetTable.newRow({
        cantidad: inputBoxCount,
        producto: inputBoxSelect,
        precio_compra: inputBoxBuyPrice,
        precio_venta: inputBoxSalePrice,
      })
      row.tr.setAttribute('ignore', true)
      row.set.total(0);

      let salePriceValue = 0;
      selector.on('selected', async dataSelected => {
        let producto_id = dataSelected.id
        socket.emit('/readSalePriceId/producto', producto_id, res => {
          inputSalePrice.value = res?.toFixed(2) || 0;
          salePriceValue = res;
          row.tr.removeAttribute('ignore')
          row.set.total(0);
          refresh();
        })
      })

      let changeDataRow = () => {
        let countValue = Number(inputCount.value) || 0;
        let buyPriceValue = Number(inputBuyPrice.value) || 0;

        if (salePriceValue < buyPriceValue)
          formError(`El precio de compra es mayor al de venta.`, inputBuyPrice.parentNode);

        if (countValue == 0)
          return row.tr.setAttribute('ignore', true);
        row.set.total((buyPriceValue * countValue).toFixed(2));
        refresh();
      }

      inputCount.addEventListener('change', changeDataRow);
      inputBuyPrice.addEventListener('change', changeDataRow);

      selector.on('deselected', _ => {
        inputSalePrice.value = 0;
        row.set.total(0);

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
        delete inputBoxSalePrice
        delete inputBoxBuyPrice
        delete inputCount
        delete inputSelect
        delete inputSalePrice
        delete inputBuyPrice
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

      selectorProveedores.select(1);
      selectorMetodoPago.select(1);
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

      let metodoPagoData = selectorMetodoPago.selected[0];
      if (!metodoPagoData) return formError('Selecciona un metodo de pago.', inputSelectorMetodoPago.parentNode);
      jsonData.metodo_pago_id = metodoPagoData.id;

      let proveedorData = selectorProveedores.selected[0];
      if (!proveedorData) return formError('Selecciona un proveedor o desconicido.', inputSelectorProveedores.parentNode);
      jsonData.proveedor_id = proveedorData.id;

      let productos = witgetTable.dataTable.map(({ data, tr }) => {
        if (tr.hasAttribute('ignore')) return;

        let producto_id = data.producto.Selector.selected[0].id;
        let cantidad = Number(data.cantidad.inputElement.value);
        let precio_compra = Number(data.precio_compra.inputElement.value);
        let precio_venta = Number(data.precio_venta.inputElement.value);
        return { producto_id, precio_venta, cantidad, precio_compra }
      })
      jsonData.productos = productos;

      let importe_total = Number(inputImporteTotal.value);
      if (importe_total == 0)
        return formError('No hay productos?', inputImporteTotal.parentNode);

      jsonData.importe_total = importe_total;

      jsonData.serie = inputSerie.value;

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
          name: 'tc.codigo',
          className: 'dtr-code',
          targets: 0,
        },
        {
          name: 'pv.titular',
          className: 'dtr-tag',
          orderable: false,
          targets: 1,
          render: data => '<div>' + data + '</div>'
        },
        {
          name: 'p.producto',
          className: 'dtr-tag',
          targets: 2,
          render: data => '<div>' + data + '</div>'
        },
        {
          name: 'c.cantidad',
          className: 'dt-type-numeric',
          targets: 3,
        },
        {
          name: 'c.compra',
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
        { data: 'transaccion_codigo' },
        { data: 'proveedor_titular' },
        { data: 'producto_nombre' },
        { data: 'cantidad' },
        { data: 'compra' },
        { data: 'transaccion_hora' }
      ],
    })
    $tableHistory.buttons('.tables-utils .download');

    /* 
      ==================================================
      ===================== SOCKET =====================
      ==================================================
    */

    socket.on('/transacciones_compras/data/insert', data => {
      $tableHistory.datatable.draw(data);
    })

    socket.on('/transacciones_compras/data/updateId', (data) => {
      $tableHistory.datatable.draw(data);
    })

    socket.on('/transacciones_compras/data/deleteId', data => {
      $tableHistory.datatable.draw(data);
    })

  } catch ({ message, stack }) {
    socket.emit('/err/client', { message, stack, url: window.location.href })
  }
})