$('.content-body').ready(async () => {
  try {

    /* 
      ==================================================
      =================== QUERY DATA ===================
      ==================================================
    */

    let resProductosTbl = await query.post.cookie("/api/productos/table/readAll");
    /** @typedef {{agregar:number, editar:number, eliminar:number, exportar:number, ocultar:number, ver:number}} PERMISOS */
    /** @type {{err: string, OkPacket: import('mysql').OkPacket, list: {[column:string]: string|number}[], permisos: PERMISOS}} */
    let { list: dataProductos, prediccion } = await resProductosTbl.json();

    let prediccionPrecioVenta = new Function('return ' + prediccion.precio_venta)();

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
    let inputNuevoText = tableNuevo?.querySelectorAll('input[type=text], textarea');
    let inputNuevoProducto = inputNuevoText[0];
    let inputNuevoPrecioCompra = inputNuevoText[1];
    let inputNuevoPrecioVenta = inputNuevoText[2];
    let inputNuevoCheckbox = tableNuevo?.querySelector('input[type=checkbox]');
    let inputNuevoSelector = tableNuevo?.querySelector('input.selector');
    let inputNuevoImagen = tableNuevo?.querySelector('.imagen-unic');
    let btnNuevo = tableNuevo?.querySelector('.btn');

    let $tableEditar = $('#table-editar');
    let tableEditar = $tableEditar[0];
    let inputEditarHidden = tableEditar?.querySelector('input[type=hidden]');
    let inputEditarText = tableEditar?.querySelectorAll('input[type=text], textarea');
    let inputEditarProducto = inputEditarText[0];
    let inputEditarPrecioCompra = inputEditarText[1];
    let inputEditarPrecioVenta = inputEditarText[2];
    let inputEditarDescripcion = inputEditarText[3];
    let inputEditarSelector = tableEditar?.querySelector('input.selector');
    let inputEditarImagen = tableEditar?.querySelector('.imagen-unic');
    let btnEditar = tableEditar?.querySelector('.btn');

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
      let resEstado = await query.post.json.cookie("/api/productos/table/updateIdState", { id, estado });

      /** @type {{err: string, OkPacket: import('mysql').OkPacket, list: {[column:string]: string|number}[]}} */
      let { err } = await resEstado.json();

      if (estado)
        alarm.success(`${producto} activado`);
      else
        alarm.success(`${producto} desactivado`);

      if (err) {
        this.checked = !estado;
        alarm.error(`${producto} inaccesible`);
        return
      }

      this.disabled = false;
    }

    /* 
      ==================================================
      ================= DATATABLE STATE =================
      ==================================================
    */

    $table.init({
      data: dataProductos,
      select: {
        style: 'single'
      },
      order: [[2, 'asc']],
      columnDefs: [
        {
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
          className: 'dtr-code',
          orderable: false,
          targets: 1
        },
        {
          className: 'dtr-description',
          orderable: false,
          targets: 3,
          render: data => '<div class="scroll-y">' + data + '</div>'
        },
        {
          className: 'dtr-tag',
          targets: 4,
          render: data => '<div>' + data + '</div>'
        },
        {
          targets: 5,
          render: data => data?.toFixed(2)
        },
        {
          targets: 6,
          render: data => data?.toFixed(2)
        }
      ],
      columns: [
        { data: 'estado' },
        { data: 'codigo' },
        { data: 'producto' },
        { data: 'descripcion' },
        { data: 'categoria_nombre' },
        { data: 'compra' },
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

    let resCategorias = await query.post.cookie("/api/categorias/selector/readAll");

    /** @type {{err: string, OkPacket: import('mysql').OkPacket, list: {[column:string]: string|number}[]}} */
    let { list: dataCategorias } = await resCategorias.json();

    let dataSelectorCategorias = new SelectorMap(dataCategorias);

    /* ===================== SOCKET ===================== */

    socket.on('/categorias/data/insert', data => {
      dataSelectorCategorias.set(data.id, data.nombre);
    })

    socket.on('/categorias/data/updateId', data => {
      dataSelectorCategorias.set(data.id, { name: data.nombre });
    })

    socket.on('/categorias/data/state', data => {
      if (data.estado)
        dataSelectorCategorias.set(data.id, data.nombre);
      else
        dataSelectorCategorias.delete(data.id);
    })

    socket.on('/categorias/data/deleteId', data => {
      dataSelectorCategorias.delete(data.id);
    })

    /* 
      ==================================================
      ================== SELECTOR UNIC ==================
      ==================================================
    */

    let nuevoSelectorUnic = new SelectorUnic(inputNuevoSelector, dataSelectorCategorias);
    let editarSelectorUnic = new SelectorUnic(inputEditarSelector, dataSelectorCategorias);

    /* 
      ==================================================
      ===================== IMAGEN =====================
      ==================================================
    */

    let nuevoImagenUnic = new ImagenUnic(inputNuevoImagen);
    let editarImagenUnic = new ImagenUnic(inputEditarImagen);

    /* 
      ==================================================
      ====================== MENU ======================
      ==================================================
    */

    let toggleMenu = {
      now: 'table',
      nuevo() {
        this.emptyNuevo();
        this.now = 'nuevo';
        $tableNuevo.show('fast');
        tableEditar.style.display = 'none';
        sideContent.scrollTop = tableNuevo.offsetTop - sideContent.offsetTop - 100;
      },
      editar() {
        this.emptyEditar();
        this.now = 'editar';
        $tableEditar.show('fast');
        tableNuevo.style.display = 'none';
        sideContent.scrollTop = tableEditar.offsetTop - sideContent.offsetTop - 100;
      },
      close() {
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
        nuevoSelectorUnic.empty();
        nuevoImagenUnic.empty();
      },
      emptyEditar() {
        if (this.now != 'editar') return;
        inputEditarText.forEach(i => i.value = '');
        editarSelectorUnic.empty();
        editarImagenUnic.empty();
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
      let value = inputNuevoPrecioCompra.value;
      if (value == '') return inputNuevoPrecioVenta.value = value;
      inputNuevoPrecioVenta.value = prediccionPrecioVenta(Number(value)).toFixed(2);
    });

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
      if (inputNuevoProducto.except)
        return formError(inputNuevoProducto.except, inputNuevoProducto.parentNode);

      let formData = new FormData();
      inputNuevoText.forEach(i => {
        let column = i.getAttribute('name');
        let value = i.value;
        if (!value) return formError(`Se requiere un valor para ${column}`, i.parentNode);
        formData.append(column, value);
      })

      let select = nuevoSelectorUnic.selected[0];
      if (!select) return formError(`Selecciona un Rol`, inputNuevoSelector.parentNode);
      formData.append('categoria_id', Number(select.id));

      let file = nuevoImagenUnic.files[0]
      if (file) formData.append('foto_file', file);

      let estado = inputNuevoCheckbox.checked ? 1 : 0
      formData.append('estado', estado);

      let resUsuarios = await query.post.form.cookie("/api/productos/table/insert", formData);

      /** @type {{err: string, OkPacket: import('mysql').OkPacket, list: {[column:string]: string|number}[]}} */
      let { err } = await resUsuarios.json();

      if (err)
        return alarm.warn('No se pudo agregar')

      alarm.success(`Fila Agregada`);
      toggleMenu.close();
    })


    /* 
      ==================================================
      ================= PERMISO EDITAR =================
      ==================================================
    */

    if (!permiso.editar) tblEditar.forEach(t => t.style.display = 'none');

    /* 
      ==================================================
      =================== OPEN EDITAR ===================
      ==================================================
    */

    tblEditar.forEach(btn => btn.addEventListener('click', async () => {
      let id = $table.selected();
      if (!id) return alarm.warn('Selecciona una fila');

      toggleMenu.editar();

      let resProductos = await query.post.json.cookie("/api/productos/table/readId", { id });

      /** @type {{err: string, OkPacket: import('mysql').OkPacket, list: {[column:string]: string|number}[]}} */
      let { list } = await resProductos.json();

      inputEditarProducto.placeholder
        = inputEditarProducto.value
        = list.producto;
      inputEditarPrecioCompra.placeholder
        = inputEditarPrecioCompra.value
        = list.compra.toFixed(2);
      inputEditarPrecioVenta.placeholder
        = inputEditarPrecioVenta.value
        = list.venta.toFixed(2);
      inputEditarDescripcion.placeholder
        = inputEditarDescripcion.value
        = list.descripcion;

      editarSelectorUnic.select(list.categoria_id);
      editarSelectorUnic.beforeValue = list.categoria_id;

      if (list.foto_src)
        editarImagenUnic.charge(list.foto_src),
          editarImagenUnic.beforeValue = list.foto_src;

      inputEditarHidden.value = id;
    }))

    /* 
      ==================================================
      ================== PREDICCIONES ==================
      ==================================================
    */

    inputEditarPrecioCompra.addEventListener('input', () => {
      let value = inputEditarPrecioCompra.value;
      if (value == '') return inputEditarPrecioVenta.value = value;
      inputEditarPrecioVenta.value = prediccionPrecioVenta(Number(value)).toFixed(2);
    });

    /* 
      ==================================================
      =================== EDITAR DATA ===================
      ==================================================
    */

    btnEditar.addEventListener('click', async () => {
      if (inputEditarProducto.except)
        return formError(inputEditarProducto.except, inputEditarProducto.parentNode);

      let formData = new FormData();

      let id = Number(inputEditarHidden.value);
      formData.append('id', id);

      inputEditarText.forEach(i => {
        let column = i.getAttribute('name');
        let value = i.value;
        if (!value) return formError(`Se requiere un valor para ${column}`, i.parentNode);
        formData.append(column, value);
      })

      let select = editarSelectorUnic.selected[0];
      formData.append('categoria_id', select.id);

      let file = editarImagenUnic.files[0];
      if (file) formData.append('foto_file', file);

      let resUsuarios = await query.post.form.cookie("/api/productos/table/updateId", formData);

      /** @type {{err: string, OkPacket: import('mysql').OkPacket, list: {[column:string]: string|number}[]}} */
      let { err } = await resUsuarios.json();

      if (err)
        return alarm.warn('No se pudo Editar');

      alarm.success(`Fila actualizada`);
      toggleMenu.close();
      $table.datatable.rows().deselect();
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
          if (result.isConfirmed) {
            let resCategorias = await query.post.json.cookie("/api/productos/table/deleteId", { id });

            /** @type {{err: string, OkPacket: import('mysql').OkPacket, list: {[column:string]: string|number}[]}} */
            let { err } = await resCategorias.json();

            if (err)
              return alarm.error(`Fila no Eliminada`);

            alarm.success(`Fila eliminada`);
          }
        });
    }))

    /* 
      ==================================================
      ===================== SOCKET =====================
      ==================================================
    */

    socket.on('/productos/data/insert', data => {
      let row = $table.get('#' + data.id);
      if (row) return;

      $table.add({
        id: data.id,
        estado: data.estado,
        codigo: data.codigo,
        producto: data.producto,
        descripcion: data.descripcion,
        venta: data.venta,
        compra: data.compra,
        categoria_nombre: data.categoria_nombre,
        creacion: formatTime('YYYY-MM-DD hh:mm:ss')
      });
    })

    socket.on('/productos/data/updateId', data => {
      let row = $table.get('#' + data.id);
      if (!row) return;

      $table.update('#' + data.id, {
        producto: data.producto,
        categoria_nombre: data.categoria_nombre,
        descripcion: data.descripcion,
        venta: data.venta,
        compra: data.compra,
      });

      let menuEditarid = $table.selected();
      if (menuEditarid && menuEditarid == data.id)
        tblEditar?.[0]?.click();
    })

    socket.on('/productos/data/state', data => {
      let row = $table.get('#' + data.id);
      if (!row) return;

      $table.update('#' + data.id, {
        estado: data.estado,
      });
    })

    socket.on('/productos/data/deleteId', data => {
      let row = $table.get('#' + data.id);
      if (!row) return;
      $table.remove('#' + data.id);
    })

    socket.on('/productos/categorias/state', data => {
      if (data.estado)
        $table.add(...data.data.filter(d => $table.get('#' + d.id) ? false : true));
      else
        $table.remove(...data.data.map(d => '#' + d.id));
    })

  } catch ({ message, stack }) {
    socket.emit('/err/client', { message, stack, url: window.location.href })
  }
})