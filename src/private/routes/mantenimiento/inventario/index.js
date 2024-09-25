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
    let { list: dataProductos, permisos: permisosProductos, prediccion } = await resProductosTbl.json();

    let prediccionPrecioVenta = new Function('return ' + prediccion.precio_venta)();

    let uniqueProducto = new Set(dataProductos.map(({ producto }) => producto.toLowerCase()));

    /* 
      ==================================================
      ================== VARIABLES DOM ==================
      ==================================================
    */

    let menuSide = document.querySelector('.menu-side');

    let $tableNuevo = $('#table-nuevo');
    let tableNuevo = $tableNuevo[0];
    let inputNuevoText = tableNuevo?.querySelectorAll('input[type=text], textarea');
    let inputNuevoCheckbox = tableNuevo?.querySelector('input[type=checkbox]');
    let inputNuevoSelector = tableNuevo?.querySelector('input.selector');
    let inputNuevoImagen = tableNuevo?.querySelector('.imagen-unic');
    let btnNuevo = tableNuevo?.querySelector('.btn');

    let $tableEditar = $('#table-editar');
    let tableEditar = $tableEditar[0];
    let inputEditarHidden = tableEditar?.querySelector('input[type=hidden]');
    let inputEditarText = tableEditar?.querySelectorAll('input[type=text], textarea');
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

    dataProductos.forEach(d => {
      d.compra = d.compra?.toFixed(2);
      d.venta = d.venta?.toFixed(2);
      d.descripcion = '<div class="scroll-y">' + d.descripcion + '</div>';
      d.categoria_nombre = '<div>' + d.categoria_nombre + '</div>';
    })

    if (permisosProductos.ocultar) {

      dataProductos.forEach(d => {
        let i = document.createElement('input');
        i.classList.add('check-switch');
        i.setAttribute('type', 'checkbox');
        i.addEventListener('change', updateIdState.bind(i, d));
        i.checked = d.estado;
        d.estado = i;
      });

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
          },
          {
            className: 'dtr-code',
            orderable: false,
            targets: 1,
          },
          {
            className: 'dtr-description',
            orderable: false,
            targets: 3,
          },
          {
            className: 'dtr-tag',
            targets: 7,
          }
        ],
        columns: [
          { data: 'estado' },
          { data: 'codigo' },
          { data: 'producto' },
          { data: 'descripcion' },
          { data: 'compra' },
          { data: 'venta' },
          { data: 'creacion' },
          { data: 'categoria_nombre' }
        ],
      })
      $table.buttons();
    }
    else {

      /* 
        ==================================================
        ==================== DATATABLE ====================
        ==================================================
      */

      $table.init({
        data: dataProductos,
        select: {
          style: 'single'
        },
        order: [[1, 'asc']],
        columnDefs: [
          {
            className: 'dtr-code',
            orderable: false,
            targets: 0,
          },
          {
            className: 'dtr-description',
            orderable: false,
            targets: 2,
          },
          {
            className: 'dtr-tag',
            targets: 6,
          }
        ],
        columns: [
          { data: 'codigo' },
          { data: 'producto' },
          { data: 'descripcion' },
          { data: 'compra' },
          { data: 'venta' },
          { data: 'creacion' },
          { data: 'categoria_nombre' }
        ],
      })
      $table.buttons();
    }

    /* 
      ==================================================
      ================ EXISTET MENU SIDE ================
      ==================================================
    */

    if (menuSide) {

      /* 
        ==================================================
        ==================== SELECTOR ====================
        ==================================================
      */

      let resCategorias = await query.post.cookie("/api/categorias/selector/readAll");

      /** @type {{err: string, OkPacket: import('mysql').OkPacket, list: {[column:string]: string|number}[]}} */
      let { list: dataCategorias } = await resCategorias.json();

      let dataSelectorCategorias = new Selector(dataCategorias);

      /* ===================== SOCKET ===================== */

      socket.on('/categorias/data/insert', data => {
        dataSelectorCategorias.add(data.id, data.nombre);
      })

      socket.on('/categorias/data/updateId', data => {
        dataSelectorCategorias.upd(data.id, { name: data.nombre });
      })

      socket.on('/categorias/data/state', data => {
        if (data.estado)
          dataSelectorCategorias.add(data.id, data.nombre);
        else
          dataSelectorCategorias.rmv(data.id);
      })

      socket.on('/categorias/data/deleteId', data => {
        dataSelectorCategorias.rmv(data.id);
      })

      /* 
        ==================================================
        ================== SELECTOR UNIC ==================
        ==================================================
      */

      let nuevoSelectorUnic = inputNuevoSelector
        ? new SelectorUnic(inputNuevoSelector, dataSelectorCategorias) : null;
      let editarSelectorUnic = inputEditarSelector
        ? new SelectorUnic(inputEditarSelector, dataSelectorCategorias) : null;

      /* 
        ==================================================
        ===================== IMAGEN =====================
        ==================================================
      */

      let nuevoImagenUnic = inputNuevoImagen
        ? new ImagenUnic(inputNuevoImagen) : null;
      let editarImagenUnic = inputEditarImagen
        ? new ImagenUnic(inputEditarImagen) : null;

      /* 
        ==================================================
        ====================== MENU ======================
        ==================================================
      */

      let toggleMenu = {
        now: 'table',
        nuevo() {
          this.emptyEditar();
          tableNuevo && ($tableNuevo.show('fast'));
          tableEditar && (tableEditar.style.display = 'none');
          this.now = 'nuevo';
        },
        editar() {
          this.emptyNuevo();
          tableNuevo && (tableNuevo.style.display = 'none');
          tableEditar && ($tableEditar.show('fast'));
          this.now = 'editar';
        },
        close() {
          this.emptyNuevo();
          this.emptyEditar();
          tableNuevo && (tableNuevo.style.display = 'none');
          tableEditar && (tableEditar.style.display = 'none');
          this.now = 'table';
        },
        toggleNuevo(state = tableNuevo?.style?.display == 'none') {
          tableNuevo && (tableNuevo.style.display = state ? '' : 'none');
        },
        toggleEditar(state = tableEditar?.style?.display == 'none') {
          tableEditar && (tableEditar.style.display = state ? '' : 'none');
        },
        emptyNuevo() {
          if (this.now != 'nuevo') return;
          inputNuevoText.forEach(i => i.value = '');
          nuevoSelectorUnic.diselect();
          nuevoImagenUnic.empty();
        },
        emptyEditar() {
          if (this.now != 'editar') return;
          inputEditarText.forEach(i => i.value = '');
          editarSelectorUnic.diselect();
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

      let tblclose = document.querySelectorAll('#table-nuevo .card-close ,#table-editar .card-close');
      tblclose.forEach(btn => btn.addEventListener('click', () => toggleMenu.close()));

      /* 
        ==================================================
        ================= PERMISO AGREGAR =================
        ==================================================
      */

      if (permisosProductos.agregar) {

        /* 
          ==================================================
          ================= UNIQUE AGREGAR =================
          ==================================================
        */

        let inputNuevoProducto = inputNuevoText[0];
        inputNuevoProducto.addEventListener('input', () => {
          let val = inputNuevoProducto.value;
          if (!uniqueProducto.has(val?.toLowerCase()))
            return inputNuevoProducto.except = null;
          inputNuevoProducto.except = `El Producto '${val}' ya existe.`;
          formError(inputNuevoProducto.except, inputNuevoProducto.parentNode);
        })

        /* 
          ==================================================
          ================== PREDICCIONES ==================
          ==================================================
        */

        let inputNuevoPrecioCompra = inputNuevoText[1];
        let inputNuevoPrecioVenta = inputNuevoText[2];

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

        let tblNuevo = document.querySelectorAll('.tbl-nuevo');
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
      }

      /* 
        ==================================================
        ================= PERMISO EDITAR =================
        ==================================================
      */

      if (permisosProductos.editar) {

        let inputEditarProducto = inputEditarText[0];
        let inputEditarPrecioCompra = inputEditarText[1];
        let inputEditarPrecioVenta = inputEditarText[2];
        let inputEditarDescripcion = inputEditarText[3];

        /* 
          ==================================================
          =================== OPEN EDITAR ===================
          ==================================================
        */

        let tblEditar = document.querySelectorAll('.tbl-editar');
        tblEditar.forEach(btn => btn.addEventListener('click', async () => {
          let id = $table.selected();
          if (!id) return alarm.warn('Selecciona una fila');

          toggleMenu.editar();

          let resProductos = await query.post.json.cookie("/api/productos/table/readId", { id });

          /** @type {{err: string, OkPacket: import('mysql').OkPacket, list: {[column:string]: string|number}[]}} */
          let { list } = await resProductos.json();

          inputEditarProducto.placeholder
            = inputEditarProducto.value = list.producto;
          inputEditarPrecioCompra.placeholder
            = inputEditarPrecioCompra.value = list.compra.toFixed(2);
          inputEditarPrecioVenta.placeholder
            = inputEditarPrecioVenta.value = list.venta.toFixed(2);
          inputEditarDescripcion.placeholder
            = inputEditarDescripcion.value = list.descripcion;

          editarSelectorUnic.select(list.categoria_id);
          editarSelectorUnic.beforeValue = list.categoria_id;

          if (list.foto_src)
            editarImagenUnic.charge(list.foto_src),
              editarImagenUnic.beforeValue = list.foto_src;

          inputEditarHidden.value = id;
        }))

        /* 
          ==================================================
          ================== UNIQUE EDITAR ==================
          ==================================================
        */

        inputEditarProducto.addEventListener('input', () => {
          let val = inputEditarProducto.value;
          if (inputEditarProducto.beforeValue == val || !uniqueProducto.has(val?.toLowerCase()))
            return inputEditarProducto.except = null;
          inputEditarProducto.except = `El Nombre '${val}' ya existe.`;
          formError(inputEditarProducto.except, inputEditarProducto.parentNode);
        })

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
        })
      }
    }

    /* 
      ==================================================
      ================ PERMISO ELIMINAR ================
      ==================================================
    */

    if (permisosProductos.eliminar) {

      /* 
      ==================================================
      ================== ELIMINAR DATA ==================
      ==================================================
      */

      let tblEliminar = document.querySelectorAll('.tbl-eliminar');
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
    }

    /* 
      ==================================================
      ===================== SOCKET =====================
      ==================================================
    */

    socket.on('/productos/data/insert', data => {
      let i = document.createElement('input');
      i.classList.add('check-switch');
      i.setAttribute('type', 'checkbox');
      i.addEventListener('change', updateIdState.bind(i, { nombre: data.nombre, id: data.id }));
      i.checked = data.estado;

      $table.add({
        id: data.id,
        estado: i,
        codigo: data.codigo,
        producto: data.producto,
        descripcion: '<div class="scroll-y">' + data.descripcion + '</div>',
        venta: data.venta.toFixed(2),
        compra: data.compra.toFixed(2),
        categoria_nombre: '<div>' + data.categoria_nombre + '</div>',
        creacion: formatTime('YYYY-MM-DD hh:mm:ss')
      });

      uniqueProducto.add(data.producto?.toLowerCase());
    })

    let tblEditar = document.querySelectorAll('.tbl-editar');
    socket.on('/productos/data/updateId', data => {
      let row = $table.get('#' + data.id);


      $table.update('#' + data.id, {
        producto: data.producto,
        categoria_nombre: '<div>' + data.categoria_nombre + '</div>',
        descripcion: '<div class="scroll-y">' + data.descripcion + '</div>',
        venta: data.venta.toFixed(2),
        compra: data.compra.toFixed(2),
      });
      uniqueProducto.delete(row.producto?.toLowerCase());
      uniqueProducto.add(data.producto?.toLowerCase());

      let menuEditarid = $table.selected();
      if (menuEditarid && menuEditarid == data.id)
        tblEditar?.[0]?.click();
    })

    socket.on('/productos/data/state', data => {
      let row = $table.get('#' + data.id);
      if (row?.estado) row.estado.checked = data.estado;
    })

    socket.on('/productos/data/deleteId', data => {
      let row = $table.get('#' + data.id);
      if (!row) return;
      uniqueProducto.delete(row.producto?.toLowerCase());
      $table.remove('#' + data.id);
    })

    socket.on('/productos/categorias/state', data => {
      if (data.estado) {
        $table.add(...data.data.filter(d => {
          let row = $table.get('#' + d.id);
          if (row) return false;

          let i = document.createElement('input');
          i.classList.add('check-switch');
          i.setAttribute('type', 'checkbox');
          i.addEventListener('change', updateIdState.bind(i, d));
          i.checked = d.estado;
          d.estado = i;

          d.compra = d.compra?.toFixed(2);
          d.venta = d.venta?.toFixed(2);
          d.descripcion = '<div class="scroll-y">' + d.descripcion + '</div>';
          d.categoria_nombre = '<div>' + d.categoria_nombre + '</div>';

          uniqueProducto.add(data.producto?.toLowerCase());

          return true;
        }));
      }
      else {

        $table.remove(...data.data.map(d => '#' + d.id));
      }
    })

  } catch ({ message, stack }) {
    socket.emit('/err/client', { message, stack, url: window.location.href })
  }
})