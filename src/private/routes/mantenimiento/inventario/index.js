$('.content-body').ready(async () => {
  try {

    /*
      ==================================================
      ================== VARIABLES DOM ==================
      ==================================================
    */

    let sideContent = document.querySelector('.side-content');

    let $cardMain = $('#card-main');
    let cardMain = $cardMain[0];

    let tblclose = document.querySelectorAll('#table-nuevo .card-close ,#table-editar .card-close');
    let tblNuevo = cardMain.querySelectorAll('.tbl-nuevo');
    let tblEditar = cardMain.querySelectorAll('.tbl-editar');
    let tblEliminar = cardMain.querySelectorAll('.tbl-eliminar');
    let cardMainDownload = cardMain.querySelector('.download');

    let $tableNuevo = $('#table-nuevo');
    let tableNuevo = $tableNuevo[0];
    let inputNuevoText = tableNuevo.querySelectorAll('input[type=text], textarea');
    /** @type {HTMLInputElement} */
    let inputNuevoProducto = document.getElementById('nuevo-producto');
    /** @type {HTMLInputElement} */
    let inputNuevoPrecioVenta = document.getElementById('nuevo-precio-venta');
    /** @type {HTMLInputElement} */
    let inputNuevoDescripcion = document.getElementById('nuevo-descripcion');
    /** @type {HTMLInputElement} */
    let inputNuevoSelectorCategoria = document.getElementById('nuevo-categoria');
    /** @type {HTMLInputElement} */
    let inputNuevoImagen = document.getElementById('nuevo-imagen');
    /** @type {HTMLInputElement} */
    let checkboxNuevoAvanzado = document.getElementById('nuevo-avanzado');
    /** @type {HTMLInputElement} */
    let inputNuevoCantidad = document.getElementById('nuevo-cantidad');
    /** @type {HTMLInputElement} */
    let inputNuevoPrecioCompra = document.getElementById('nuevo-precio-compra');
    /** @type {HTMLInputElement} */
    let inputNuevoSelectorProveedor = document.getElementById('nuevo-proveedor');
    /** @type {HTMLInputElement} */
    let checkboxNuevoEstado = document.getElementById('nuevo-estado');
    /** @type {HTMLAnchorElement} */
    let btnNuevo = tableNuevo.querySelector('.btn');

    let currentEditarId = 0;
    let $tableEditar = $('#table-editar');
    let tableEditar = $tableEditar[0];
    let inputEditarText = tableEditar.querySelectorAll('input[type=text], textarea');
    /** @type {HTMLInputElement} */
    let inputEditarProducto = document.getElementById('editar-producto');
    /** @type {HTMLInputElement} */
    let inputEditarPrecioVenta = document.getElementById('editar-precio-venta');
    /** @type {HTMLInputElement} */
    let inputEditarDescripcion = document.getElementById('editar-descripcion');
    /** @type {HTMLInputElement} */
    let inputEditarSelectorCategoria = document.getElementById('editar-categoria');
    /** @type {HTMLInputElement} */
    let inputEditarImagen = document.getElementById('editar-imagen');
    /** @type {HTMLAnchorElement} */
    let btnEditar = tableEditar.querySelector('.btn');

    let calendarioBox = document.querySelector('.calendario');

    let $table = new Tables('#table-main');

    /*
      ==================================================
      ===================== ESTADO =====================
      ==================================================
    */

    /** @type {(this:HTMLInputElement, data: {id: number, usuario: string})=>void} */
    async function updateIdState({ id, producto }) {
      this.disabled = true;
      let estado = this.checked;
      socket.emit('/stateId/table', id, estado, err => {
        if (err) {
          this.checked = !estado;
          return alarm.error(err);
        }

        if (estado)
          alarm.success(`${producto} activado`);
        else
          alarm.success(`${producto} desactivado`);

        this.disabled = false;
      })
    }

    /*
      ==================================================
      ==================== DATATABLE ====================
      ==================================================
    */

    $table.init({
      serverSide: true,
      ajax: (data, end) => {
        socket.emit('/read/table', data, res => end(res))
      },
      pageLength: 10,
      select: {
        style: 'single'
      },
      order: [[2, 'asc']],
      columnDefs: [
        {
          name: 'p.estado',
          className: 'dtr-control',
          orderable: false,
          targets: 0,
          render: (data, _, row) => {
            let i = document.createElement('input');
            i.classList.add('check-switch');
            i.setAttribute('type', 'checkbox');
            i.addEventListener('change', updateIdState.bind(i, row));
            i.checked = data;
            return i;
          }
        },
        {
          name: 'p.codigo',
          className: 'dtr-code',
          orderable: false,
          targets: 1
        },
        {
          name: 'p.producto',
          targets: 2
        },
        {
          name: 'p.descripcion',
          className: 'dtr-description',
          orderable: false,
          targets: 3,
          render: data => '<div class="scroll-y">' + (data || '-') + '</div>'
        },
        {
          name: 'c.nombre',
          className: 'dtr-tag',
          targets: 4,
          render: data => '<div>' + data + '</div>'
        },
        {
          name: 'p.stock_disponible',
          className: 'dt-type-numeric',
          targets: 5
        },
        {
          name: 'p.venta',
          className: 'dt-type-numeric',
          targets: 6,
          render: data => data?.toFixed(2)
        }, {
          name: 'p.creacion',
          className: 'dt-type-date',
          targets: 7
        }
      ],
      columns: [
        { data: 'estado' },
        { data: 'codigo' },
        { data: 'producto' },
        { data: 'descripcion' },
        { data: 'categoria_nombre' },
        { data: 'stock_disponible' },
        { data: 'venta' },
        { data: 'creacion' }
      ],
    })

    if (permiso.exportar) $table.buttons();
    else cardMainDownload.innerHTML = '';

    $table.toggleColumn(0, permiso.ocultar);

    /*
      ==================================================
      ==================== SELECTOR ====================
      ==================================================
    */

    let selectorOptionsCategorias = new OptionsServerside(
      (req, end) => socket.emit('/selector/categorias', req, res => end(res)),
      { showIndex: false, order: 'asc', noInclude: true }
    );
    let selectorOptionsProveedor = new OptionsServerside(
      (req, end) => socket.emit('/selector/proveedor', req, res => end(res)),
      { showIndex: false, order: 'asc', noInclude: true }
    );

    /* ===================== SOCKET ===================== */

    socket.on('/categorias/data/insert', data => {
      selectorOptionsCategorias.set(data.id, data.nombre);
    })

    socket.on('/categorias/data/updateId', data => {
      selectorOptionsCategorias.set(data.id, { name: data.nombre });
    })

    socket.on('/categorias/data/state', data => {
      if (data.estado)
        selectorOptionsCategorias.draw(true);
      else
        selectorOptionsCategorias.delete(data.id);
    })

    socket.on('/categorias/data/deleteId', data => {
      selectorOptionsCategorias.delete(data.id);
    })

    /*
      ==================================================
      ================== SELECTOR UNIC ==================
      ==================================================
    */

    let selectorNuevoProveedor = new SelectorInput(
      inputNuevoSelectorProveedor,
      selectorOptionsProveedor,
      { autohide: true }
    );
    let selectorNuevoCategoria = new SelectorInput(
      inputNuevoSelectorCategoria,
      selectorOptionsCategorias,
      { autohide: true }
    );
    let selectorEditarCategoria = new SelectorInput(
      inputEditarSelectorCategoria,
      selectorOptionsCategorias,
      { justChange: true }
    );

    /*
      ==================================================
      ===================== IMAGEN =====================
      ==================================================
    */

    let imagenNuevoUnic = new ImageManager(inputNuevoImagen, {
      autohide: true
    });
    let imagenEditarUnic = new ImageManager(inputEditarImagen, {
      justChange: true
    });

    /*
      ==================================================
      ====================== MENU ======================
      ==================================================
    */

    let toggleMenu = {
      now: 'table',
      nuevo() {
        this.now = 'nuevo';
        this.emptyNuevo();
        $tableNuevo.show('fast');
        tableEditar.style.display = 'none';
        sideContent.scrollTop = tableNuevo.offsetTop - sideContent.offsetTop - 100;
      },
      editar() {
        this.now = 'editar';
        this.emptyEditar();
        $tableEditar.show('fast');
        tableNuevo.style.display = 'none';
        sideContent.scrollTop = tableEditar.offsetTop - sideContent.offsetTop - 100;
      },
      close() {
        currentEditarId = 0;
        this.emptyNuevo();
        this.emptyEditar();
        this.now = 'table';
        tableNuevo.style.display = 'none';
        tableEditar.style.display = 'none';
      },
      toggleNuevo(state = tableNuevo?.style?.display == 'none') {
        tableNuevo.style.display = state ? '' : 'none';
      },
      toggleEditar(state = tableEditar?.style?.display == 'none') {
        tableEditar.style.display = state ? '' : 'none';
      },
      emptyNuevo() {
        if (this.now != 'nuevo') return;
        inputNuevoText.forEach(i => i.value = '');
        selectorNuevoCategoria.empty();
        selectorNuevoProveedor.empty();
        imagenNuevoUnic.empty();
      },
      emptyEditar() {
        if (this.now != 'editar') return;
        inputEditarText.forEach(i => i.value = '');
        selectorEditarCategoria.empty();
        imagenEditarUnic.empty();
      },
    }

    /*
      ==================================================
      =================== CALENDARIO ===================
      ==================================================
    */

    let calendar = new Calendar(calendarioBox);

    calendar.on('click', ({ date }) => {
      $table.search(formatTime('YYYY-MM-DD', date));
      toggleMenu.close();
      $table.datatable.rows().deselect();

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
      =================== CLOSE MENU ===================
      ==================================================
    */

    tblclose.forEach(btn => btn.addEventListener('click', () => toggleMenu.close()));

    /*
      ==================================================
      ================= PERMISO AGREGAR =================
      ==================================================
    */

    if (!permiso.agregar) tblNuevo.forEach(t => t.style.display = 'none');

    /*
      ==================================================
      ================== PREDICCIONES ==================
      ==================================================
    */

    inputNuevoPrecioCompra.addEventListener('input', () => {
      if (inputNuevoPrecioVenta.noPredict) {
        if (Number(inputNuevoPrecioVenta.value) < Number(inputNuevoPrecioCompra.value))
          formError(`El precio de compra es mayor al de venta.`, inputNuevoPrecioCompra);
        return;
      }

      let value = Number(inputNuevoPrecioCompra.value) || 0;
      if (!value) return inputNuevoPrecioVenta.value = value;
      socket.emit('/predict/precio_venta', value, res => {
        inputNuevoPrecioVenta.value = res?.toFixed(2);
        inputNuevoPrecioVenta.noPredict = false;
      })
    });

    inputNuevoPrecioVenta.addEventListener('input', () => {
      inputNuevoPrecioVenta.noPredict = inputNuevoPrecioVenta.value != '';
      if (Number(inputNuevoPrecioVenta.value) < Number(inputNuevoPrecioCompra.value))
        formError(`El precio de venta es menor al de compra.`, inputNuevoPrecioVenta);
    })

    /*
      ==================================================
      =================== OPEN NUEVO ===================
      ==================================================
    */

    tblNuevo.forEach(btn => btn.addEventListener('click', () => toggleMenu.nuevo()));

    /*
      ==================================================
      =================== NUEVA DATA ===================
      ==================================================
    */

    btnNuevo.addEventListener('click', async () => {
      let jsonData = {};

      let productoValue = inputNuevoProducto.value;
      if (!productoValue) return formError(`Se require un nombre!.`, inputNuevoProducto);
      jsonData.producto = productoValue;

      let precioVentaValue = inputNuevoPrecioVenta.value;
      if (!precioVentaValue) return formError(`Se require un precio de venta!.`, inputNuevoPrecioVenta);
      jsonData.venta = Number(precioVentaValue);

      let descripcionValue = inputNuevoDescripcion.value;
      jsonData.descripcion = descripcionValue;

      let selectCategoria = selectorNuevoCategoria.selected[0];
      if (!selectCategoria) return formError(`Selecciona una categoria`, inputNuevoSelectorCategoria);
      jsonData.categoria_id = Number(selectCategoria.id);

      let estado = checkboxNuevoEstado.checked ? 1 : 0;
      jsonData.estado = estado;

      let avanzadoChecked = checkboxNuevoAvanzado.checked
      jsonData.avanzado = !!avanzadoChecked;

      if (avanzadoChecked) {
        let cantidadVentaValue = inputNuevoCantidad.value;
        if (!cantidadVentaValue) return formError(`Se require una cantidad!.`, inputNuevoCantidad);
        jsonData.cantidad = Number(cantidadVentaValue);

        let precioCompraValue = inputNuevoPrecioCompra.value;
        if (!precioCompraValue) return formError(`Se require un precio de compra!.`, inputNuevoPrecioCompra);
        jsonData.compra = Number(precioCompraValue);

        let selectProveedor = selectorNuevoProveedor.selected[0];
        if (!selectProveedor) return formError(`Selecciona un proveedor`, inputNuevoSelectorProveedor);
        jsonData.proveedor_id = Number(selectProveedor.id);
      }

      let file = imagenNuevoUnic.files[0];

      if (!file)
        return socket.emit('/insert/table', jsonData, null, (err) => {
          if (err)
            return alarm.error(err);

          alarm.success(`Fila Agregada`);
          toggleMenu.close();
        })

      let { data, chunkSize, chunks } = await file.toBuffer();

      let upload = (prod, data) =>
        socket.emit('/insert/table', prod, data, (err, info) => {
          if (err)
            return alarm.error(err);

          if (info?.complete == false)
            return upload(null, { id: file.id, chunk: chunks[info?.index] });

          alarm.success(`Fila Agregada`);
          toggleMenu.close();
        })

      upload(jsonData, { data, chunkSize, chunkLength: chunks.length, id: file.id });
    })

    /*
      ==================================================
      ================= PERMISO EDITAR =================
      ==================================================
    */

    if (!permiso.editar) tblEditar.forEach(t => t.style.display = 'none');

    /*
      ==================================================
      ================ VALID CHANGE DATA ================
      ==================================================
    */

    let validChangeData = () => {
      let valid = false;
      valid ||= inputEditarProducto.value != inputEditarProducto.currentValue;
      valid ||= Number(inputEditarPrecioVenta.value) != Number(inputEditarPrecioVenta.currentValue);
      valid ||= inputEditarDescripcion.value != inputEditarDescripcion.currentValue;
      valid ||= selectorEditarCategoria?.selected[0]?.id != selectorEditarCategoria.currentValue;
      valid ||= imagenEditarUnic.files[0];

      valid
        ? btnEditar.classList.remove('disabled')
        : btnEditar.classList.add('disabled');
    }

    inputEditarProducto.addEventListener('input', validChangeData);
    inputEditarPrecioVenta.addEventListener('input', validChangeData);
    inputEditarDescripcion.addEventListener('input', validChangeData);
    selectorEditarCategoria.on('change', validChangeData)
    imagenEditarUnic.ev.on('insert', validChangeData)
    /*
      ==================================================
      =================== OPEN EDITAR ===================
      ==================================================
    */

    let defaultEditar = async data => {
      inputEditarProducto.currentValue
        = inputEditarProducto.placeholder
        = data.producto;

      inputEditarPrecioVenta.currentValue
        = inputEditarPrecioVenta.placeholder
        = data.venta.toFixed(2);

      inputEditarDescripcion.currentValue
        = inputEditarDescripcion.placeholder
        = data.descripcion;

      let asyncCategoria = selectorEditarCategoria.select(data.categoria_id);
      selectorEditarCategoria.currentValue = data.categoria_id;

      imagenEditarUnic.charge(data.foto_src);
      imagenEditarUnic.currentValue = data.foto_src

      await asyncCategoria;
    }

    let setterEditar = data => {
      currentEditarId = data.id;

      inputEditarProducto.value
        = data.producto;

      inputEditarPrecioVenta.value
        = data.venta.toFixed(2);

      inputEditarDescripcion.value
        = data.descripcion;

      defaultEditar(data);
      btnEditar.classList.add('disabled');
    }

    tblEditar.forEach(btn => btn.addEventListener('click', async () => {
      let id = $table.selected();
      if (!id) return alarm.warn('Selecciona una fila');

      toggleMenu.editar();
      socket.emit('/readId/table', id, setterEditar);
    }))

    /*
      ==================================================
      =================== EDITAR DATA ===================
      ==================================================
    */

    btnEditar.addEventListener('click', async () => {
      let jsonData = {};

      jsonData.id = currentEditarId;

      let productoValue = inputEditarProducto.value;
      if (!productoValue) return formError(`Se require un nombre!.`, inputEditarProducto);
      jsonData.producto = productoValue;

      let precioVentaValue = inputEditarPrecioVenta.value;
      if (!precioVentaValue) return formError(`Se require un precio de venta!.`, inputEditarPrecioVenta);
      jsonData.venta = Number(precioVentaValue);

      let descripcionValue = inputEditarDescripcion.value;
      jsonData.descripcion = descripcionValue;

      let selectCategoria = selectorEditarCategoria.selected[0];
      if (!selectCategoria) return formError(`Selecciona una categoria`, inputNuevoSelectorCategoria);
      jsonData.categoria_id = Number(selectCategoria.id) || selectorEditarCategoria.currentValue;

      let file = imagenEditarUnic.files[0];

      if (!file)
        return socket.emit('/updateId/table', jsonData, null, (err) => {
          if (err)
            return alarm.error(err);

          alarm.success(`Fila Actulizada`);
          toggleMenu.close();
        })

      let { data, chunkSize, chunks } = await file.toBuffer();

      let upload = (prod, data) =>
        socket.emit('/updateId/table', prod, data, (err, info) => {
          if (err)
            return alarm.error(err);

          if (info?.complete == false)
            return upload(null, { id: file.id, chunk: chunks[info?.index] });

          alarm.success(`Fila Actulizada`);
          toggleMenu.close();
        })

      upload(jsonData, { data, chunkSize, chunkLength: chunks.length, id: file.id });
    })

    /*
      ==================================================
      ================ PERMISO ELIMINAR ================
      ==================================================
    */

    if (!permiso.eliminar) tblEliminar.forEach(t => t.style.display = 'none');

    /*
    ==================================================
    ================== ELIMINAR DATA ==================
    ==================================================
    */

    tblEliminar.forEach(btn => btn.addEventListener('click', async () => {
      let id = $table.selected();
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
            socket.emit('/deleteId/table', id, err => {
              if (err) return alarm.error(err);
              alarm.success(`Fila eliminada`);
            })
        });
    }))

    /*
      ==================================================
      ===================== SOCKET =====================
      ==================================================
    */

    socket.on('/productos/data/insert', () => {
      $table.datatable.draw();
    })

    socket.on('/productos/data/updateId', async data => {
      if (currentEditarId == data.id) {
        await defaultEditar(data);
        validChangeData()
      }
      if (!$table.get('#' + data.id)) return;
      $table.datatable.draw();
    })

    socket.on('/productos/data/updateIdBussines', data => {
      if (!$table.get('#' + data.id)) return;
      $table.datatable.draw();
    })

    socket.on('/productos/data/state', data => {
      if (!$table.get('#' + data.id)) return;
      $table.datatable.draw();
    })

    socket.on('/productos/data/deleteId', data => {
      if (currentEditarId == data.id)
        toggleMenu.close()
      if (!$table.get('#' + data.id)) return;
      $table.datatable.draw();
    })

    socket.on('/productos/categorias/state', () => {
      $table.datatable.draw();
    })

    socket.on('/session/acceso/state', data => {
      if (permiso?.agregar != data.permiso_agregar) {
        tblNuevo.forEach(t => t.style.display = data.permiso_agregar ? '' : 'none')
        permiso.agregar = data.permiso_agregar;
      }
      if (permiso?.editar != data.permiso_editar) {
        tblEditar.forEach(t => t.style.display = data.permiso_editar ? '' : 'none')
        permiso.editar = data.permiso_editar;
      }
      if (permiso?.eliminar != data.permiso_eliminar) {
        tblEliminar.forEach(t => t.style.display = data.permiso_eliminar ? '' : 'none')
        permiso.eliminar = data.permiso_eliminar;
      }
      if (permiso?.ocultar != data.permiso_ocultar) {
        $table.toggleColumn(0, data.permiso_ocultar);
        permiso.ocultar = data.permiso_ocultar;
      }
      if (permiso?.exportar != data.permiso_exportar) {
        if (data.permiso_exportar) $table.buttons();
        else cardMainDownload.innerHTML = '';
        permiso.exportar = data.permiso_exportar;
      }
    })

  } catch ({ message, stack }) {
    socket.emit('/err/client', { message, stack, url: window.location.href })
  }
})