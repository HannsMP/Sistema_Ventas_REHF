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
    /** @type {HTMLInputElement & {except?: string}} */
    let inputNuevoNombre = document.getElementById('nuevo-nombre');
    /** @type {HTMLInputElement} */
    let inputNuevoDescripcion = document.getElementById('nuevo-descripcion');
    /** @type {HTMLInputElement} */
    let checkboxNuevoEstado = document.getElementById('nuevo-estado');
    /** @type {HTMLAnchorElement} */
    let btnNuevo = tableNuevo.querySelector('.btn');

    let currentEditarId = 0;
    let $tableEditar = $('#table-editar');
    let tableEditar = $tableEditar[0];
    let inputEditarText = tableEditar.querySelectorAll('input[type=text], textarea');
    /** @type {HTMLInputElement} */
    let inputEditarNombre = document.getElementById('editar-nombre');
    /** @type {HTMLInputElement} */
    let inputEditarDescripcion = document.getElementById('editar-descripcion');
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
    async function updateIdState({ id, nombre }) {
      this.disabled = true;
      let estado = this.checked;
      socket.emit('/stateId/table', id, estado, err => {
        if (err) {
          this.checked = !estado;
          return alarm.error(err);
        }

        if (estado)
          alarm.success(`${nombre} activado`);
        else
          alarm.success(`${nombre} desactivado`);

        this.disabled = false;
      })
    }

    /* 
      ==================================================
      ================= DATATABLE STATE =================
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
          name: 'c.estado',
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
          name: 'c.codigo',
          className: 'dtr-code',
          orderable: false,
          targets: 1,
        },
        {
          name: 'c.nombre',
          targets: 2
        },
        {
          name: 'c.descripcion',
          className: 'dtr-description',
          orderable: false,
          targets: 3,
          render: data => '<div class="scroll-y">' + data + '</div>'
        },
        {
          name: 'c.creacion',
          className: 'dt-type-date',
          targets: 4
        },
        {
          name: 'p.cantidad',
          className: 'dt-type-numeric',
          targets: 5
        }
      ],
      columns: [
        { data: 'estado' },
        { data: 'codigo' },
        { data: 'nombre' },
        { data: 'descripcion' },
        { data: 'creacion' },
        { data: 'producto_cantidad' }
      ],
    })

    if (permiso.exportar) $table.buttons();
    else cardMainDownload.innerHTML = '';

    $table.toggleColumn(0, permiso.ocultar);

    /* 
      ==================================================
      ====================== MENU ======================
      ==================================================
    */

    let toggleMenu = {
      now: 'table',
      nuevo() {
        this.emptyEditar();
        this.now = 'nuevo';
        $tableNuevo.show('fast');
        tableEditar.style.display = 'none';
        sideContent.scrollTop = tableNuevo.offsetTop - sideContent.offsetTop - 100;
      },
      editar() {
        this.emptyNuevo();
        this.now = 'editar';
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
      },
      emptyEditar() {
        if (this.now != 'editar') return;
        inputEditarText.forEach(i => i.value = '');
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
      ================= UNIQUE AGREGAR =================
      ==================================================
    */

    inputNuevoNombre.addEventListener('input', () => {
      let value = inputNuevoNombre.value;
      socket.emit(
        '/read/unic',
        { column: 'nombre', value },
        res => {
          if (res)
            return inputNuevoNombre.except = null;
          inputNuevoNombre.except = `El Nombre '${value}' ya existe.`;
          formError(inputNuevoNombre.except, inputNuevoNombre.parentNode);
        }
      )
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
      if (inputNuevoNombre.except)
        return formError(inputNuevoNombre.except, inputNuevoNombre.parentNode);

      let jsonData = {};

      let nombreValue = inputNuevoNombre.value;
      if (!nombreValue) return formError(`Se require un nombre!.`, inputNuevoProducto.parentNode);
      jsonData.nombre = nombreValue;

      let descripcionValue = inputNuevoDescripcion.value;
      jsonData.descripcion = descripcionValue;

      let estado = checkboxNuevoEstado.checked ? 1 : 0;
      jsonData.estado = estado;

      socket.emit('/insert/table', jsonData, err => {
        if (err)
          return alarm.warn(err)

        alarm.success(`Fila Agregada`);
        toggleMenu.close();
      })
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
      valid ||= inputEditarNombre.value != inputEditarNombre.currentValue;
      valid ||= inputEditarDescripcion.value != inputEditarDescripcion.currentValue;

      valid
        ? btnEditar.classList.remove('disabled')
        : btnEditar.classList.add('disabled');
    }

    inputEditarNombre.addEventListener('input', validChangeData);
    inputEditarDescripcion.addEventListener('input', validChangeData);

    /* 
      ==================================================
      =================== OPEN EDITAR ===================
      ==================================================
    */

    let defaultEditar = data => {
      inputEditarNombre.currentValue
        = inputEditarNombre.placeholder
        = data.nombre;

      inputEditarDescripcion.currentValue
        = inputEditarDescripcion.placeholder
        = data.descripcion;
    }

    let setterEditar = data => {
      currentEditarId = data.id;

      inputEditarNombre.value
        = data.nombre;

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
      ================== UNIQUE EDITAR ==================
      ==================================================
    */

    inputEditarNombre.addEventListener('input', () => {
      let value = inputEditarNombre.value;
      socket.emit(
        '/read/unic',
        { column: 'nombre', value, currentEditarId },
        res => {
          if (res)
            return inputEditarNombre.except = null;
          inputEditarNombre.except = `El Nombre '${value}' ya existe.`;
          formError(inputEditarNombre.except, inputEditarNombre.parentNode);
        }
      )
    })

    /* 
      ==================================================
      =================== EDITAR DATA ===================
      ==================================================
    */

    btnEditar.addEventListener('click', async () => {
      if (inputEditarNombre.except)
        return formError(inputEditarNombre.except, inputEditarNombre.parentNode);

      let jsonData = {};

      jsonData.id = currentEditarId;

      let nombreValue = inputEditarNombre.value;
      if (!nombreValue) return formError(`Se require un nombre!.`, inputEditarProducto.parentNode);
      jsonData.nombre = nombreValue;

      let descripcionValue = inputEditarDescripcion.value;
      jsonData.descripcion = descripcionValue;

      socket.emit('/updateId/table', jsonData, err => {
        if (err)
          return alarm.warn(err)

        alarm.success(`Fila Agregada`);
        toggleMenu.close();
        $table.datatable.rows().deselect();
      })
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

    socket.on('/categorias/data/insert', () => {
      $table.datatable.draw();
    })

    socket.on('/categorias/data/updateId', async data => {
      if (currentEditarId == data.id) {
        defaultEditar(data);
        validChangeData()
      }
      $table.datatable.draw();
    })

    socket.on('/categorias/data/state', () => {
      $table.datatable.draw();
    })

    socket.on('/categorias/data/deleteId', data => {
      if (currentEditarId == data.id)
        toggleMenu.close()
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