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
    let inputNuevoText = tableNuevo.querySelectorAll('input[type=text]');
    /** @type {HTMLInputElement} */
    let inputNuevoNombre = document.getElementById('nuevo-nombre');
    /** @type {HTMLInputElement} */
    let inputNuevoSelectorTipoCliente = document.getElementById('nuevo-tipo-cliente');
    /** @type {HTMLInputElement & {except?: string}} */
    let inputNuevoTelefono = document.getElementById('nuevo-telefono');
    /** @type {HTMLInputElement} */
    let inputNuevoDireccion = document.getElementById('nuevo-direccion');
    /** @type {HTMLInputElement} */
    let inputNuevoSelectorTipoDocumento = document.getElementById('nuevo-tipo-documento');
    /** @type {HTMLInputElement & {except?: string}} */
    let inputNuevoNumDocumento = document.getElementById('nuevo-num-documento');
    /** @type {HTMLInputElement} */
    let checkboxNuevoEstado = document.getElementById('nuevo-estado');
    /** @type {HTMLAnchorElement} */
    let btnNuevo = tableNuevo.querySelector('.btn');

    let currentEditarId = 0;
    let $tableEditar = $('#table-editar');
    let tableEditar = $tableEditar[0];
    let inputEditarText = tableEditar.querySelectorAll('input[type=text]');
    /** @type {HTMLInputElement} */
    let inputEditarNombre = document.getElementById('editar-nombre');
    /** @type {HTMLInputElement} */
    let inputEditarSelectorTipoCliente = document.getElementById('editar-tipo-cliente');
    /** @type {HTMLInputElement & {except?: string}} */
    let inputEditarTelefono = document.getElementById('editar-telefono');
    /** @type {HTMLInputElement} */
    let inputEditarDireccion = document.getElementById('editar-direccion');
    /** @type {HTMLInputElement} */
    let inputEditarSelectorTipoDocumento = document.getElementById('editar-tipo-documento');
    /** @type {HTMLInputElement & {except?: string}} */
    let inputEditarNumDocumento = document.getElementById('editar-num-documento');
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
    async function updateIdState({ id, nombres }) {
      this.disabled = true;
      let estado = this.checked;
      socket.emit('/stateId/table', id, estado, err => {
        if (err) {
          this.checked = !estado;
          return alarm.error(err);
        }

        if (estado)
          alarm.success(`${nombres} activado`);
        else
          alarm.success(`${nombres} desactivado`);

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
      order: [[1, 'asc']],
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
          name: 'c.nombres',
          targets: 1
        },
        {
          name: 'tc.nombre',
          className: 'dtr-tag',
          targets: 2,
          render: data => '<div>' + data + '</div>'
        },
        {
          name: 'c.telefono',
          className: 'dt-type-numeric',
          targets: 3
        },
        {
          name: 'c.direccion',
          targets: 4
        },
        {
          name: 'td.nombre',
          className: 'dtr-tag',
          targets: 5,
          render: data => '<div>' + data + '</div>'
        },
        {
          name: 'c.num_documento',
          className: 'dt-type-numeric',
          targets: 6
        },
        {
          name: 'c.creacion',
          className: 'dt-type-date',
          targets: 7
        }
      ],
      columns: [
        { data: 'estado' },
        { data: 'nombres' },
        { data: 'tipo_cliente_nombre' },
        { data: 'telefono' },
        { data: 'direccion' },
        { data: 'tipo_documento_nombre' },
        { data: 'num_documento' },
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

    let selectorOptionsTipoCliente = new OptionsServerside(
      (req, end) => socket.emit('/selector/tipoCliente', req, res => end(res)),
      { showIndex: false, order: 'asc', noInclude: true }
    );

    let selectorOptionsTipoDocumento = new OptionsServerside(
      (req, end) => socket.emit('/selector/tipoDocumento', req, res => end(res)),
      { showIndex: false, order: 'asc', noInclude: true }
    );

    /*
      ==================================================
      ================== SELECTOR UNIC ==================
      ==================================================
    */

    let selectorNuevoTipoCliente = new SelectorInput(
      inputNuevoSelectorTipoCliente,
      selectorOptionsTipoCliente,
      { autohide: true }
    );
    let selectorNuevoTipoDocumento = new SelectorInput(
      inputNuevoSelectorTipoDocumento,
      selectorOptionsTipoDocumento,
      { autohide: true }
    );
    let selectorEditarTipoCliente = new SelectorInput(
      inputEditarSelectorTipoCliente,
      selectorOptionsTipoCliente,
      { justChange: true }
    );
    let selectorEditarTipoDocumento = new SelectorInput(
      inputEditarSelectorTipoDocumento,
      selectorOptionsTipoDocumento,
      { justChange: true }
    );

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
        selectorNuevoTipoCliente.empty();
        selectorNuevoTipoDocumento.empty();
      },
      emptyEditar() {
        if (this.now != 'editar') return;
        inputEditarText.forEach(i => i.value = '');
        selectorEditarTipoCliente.empty();
        selectorEditarTipoDocumento.empty();
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

    inputNuevoTelefono.addEventListener('input', () => {
      let value = inputNuevoTelefono.value;
      socket.emit(
        '/read/unic',
        { column: 'telefono', value },
        res => {
          if (res)
            return inputNuevoTelefono.except = null;
          inputNuevoTelefono.except = `El Telefono '${value}' ya existe.`;
          formError(inputNuevoTelefono.except, inputNuevoTelefono);
        }
      )
    })

    inputNuevoNumDocumento.addEventListener('input', () => {
      let value = inputNuevoNumDocumento.value;
      socket.emit(
        '/read/unic',
        { column: 'num_documento', value },
        res => {
          if (res)
            return inputNuevoNumDocumento.except = null;
          inputNuevoNumDocumento.except = `El numero de documento '${value}' ya existe.`;
          formError(inputNuevoNumDocumento.except, inputNuevoNumDocumento);
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
      if (inputNuevoTelefono.except)
        return formError(inputNuevoTelefono.except, inputNuevoTelefono);
      if (inputNuevoNumDocumento.except)
        return formError(inputNuevoNumDocumento.except, inputNuevoNumDocumento);

      let jsonData = {};

      let nombresValue = inputNuevoNombre.value;
      if (!nombresValue) return formError(`Se require un nombre!.`, inputNuevoNombre);
      jsonData.nombres = nombresValue;

      let selectTipoCliente = selectorNuevoTipoCliente.selected[0];
      if (!selectTipoCliente) return formError(`Selecciona un tipo de cliente`, inputNuevoSelectorTipoCliente);
      jsonData.tipo_cliente_id = Number(selectTipoCliente.id);

      let telefonoValue = inputNuevoTelefono.value;
      if (!telefonoValue) return formError(`Se require un telefono!.`, inputNuevoTelefono);
      jsonData.telefono = telefonoValue;

      let direccionValue = inputNuevoDireccion.value;
      if (!direccionValue) return formError(`Se require una direccion!.`, inputNuevoDireccion);
      jsonData.direccion = direccionValue;

      let selectTipoDocumento = selectorNuevoTipoDocumento.selected[0];
      if (!selectTipoDocumento) return formError(`Selecciona un tipo de documento`, inputNuevoSelectorTipoDocumento);
      jsonData.tipo_documento_id = Number(selectTipoDocumento.id);

      let numDocumentoValue = inputNuevoNumDocumento.value;
      if (!numDocumentoValue) return formError(`Se require un num de documento!.`, inputNuevoNumDocumento);
      jsonData.num_documento = numDocumentoValue;

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
      valid ||= selectorEditarTipoCliente?.selected[0]?.id != selectorEditarTipoCliente.currentValue;
      valid ||= inputEditarTelefono.value != inputEditarTelefono.currentValue;
      valid ||= inputEditarDireccion.value != inputEditarDireccion.currentValue;
      valid ||= selectorEditarTipoDocumento?.selected[0]?.id != selectorEditarTipoDocumento.currentValue;
      valid ||= inputEditarNumDocumento.value != inputEditarNumDocumento.currentValue;

      valid
        ? btnEditar.classList.remove('disabled')
        : btnEditar.classList.add('disabled');
    }

    inputEditarNombre.addEventListener('input', validChangeData);
    selectorEditarTipoCliente.on('change', validChangeData)
    inputEditarTelefono.addEventListener('input', validChangeData);
    inputEditarDireccion.addEventListener('input', validChangeData);
    selectorEditarTipoDocumento.on('change', validChangeData)
    inputEditarNumDocumento.addEventListener('input', validChangeData);

    /*
      ==================================================
      =================== OPEN EDITAR ===================
      ==================================================
    */

    let defaultEditar = async data => {
      inputEditarNombre.currentValue
        = inputEditarNombre.placeholder
        = data.nombres;

      let asyncTipoCliente = selectorEditarTipoCliente.select(data.tipo_cliente_id);
      selectorEditarTipoCliente.currentValue = data.tipo_cliente_id;

      inputEditarTelefono.currentValue
        = inputEditarTelefono.placeholder
        = data.telefono;

      inputEditarDireccion.currentValue
        = inputEditarDireccion.placeholder
        = data.direccion;

      let asyncTipoDocumento = selectorEditarTipoDocumento.select(data.tipo_documento_id);
      selectorEditarTipoDocumento.currentValue = data.tipo_documento_id;

      inputEditarNumDocumento.currentValue
        = inputEditarNumDocumento.placeholder
        = data.num_documento;

      await asyncTipoCliente;
      await asyncTipoDocumento;
    }

    let setterEditar = data => {
      currentEditarId = data.id;

      inputEditarNombre.value
        = data.nombres;

      inputEditarTelefono.value
        = data.telefono;

      inputEditarDireccion.value
        = data.direccion;

      inputEditarNumDocumento.value
        = data.num_documento;

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

    inputEditarTelefono.addEventListener('input', () => {
      let value = inputEditarTelefono.value;
      socket.emit(
        '/read/unic',
        { column: 'telefono', value },
        res => {
          if (res)
            return inputEditarTelefono.except = null;
          inputEditarTelefono.except = `El Telefono '${value}' ya existe.`;
          formError(inputEditarTelefono.except, inputEditarTelefono);
        }
      )
    })

    inputEditarNumDocumento.addEventListener('input', () => {
      let value = inputEditarNumDocumento.value;
      socket.emit(
        '/read/unic',
        { column: 'num_documento', value },
        res => {
          if (res)
            return inputEditarNumDocumento.except = null;
          inputEditarNumDocumento.except = `El numero de documento '${value}' ya existe.`;
          formError(inputEditarNumDocumento.except, inputEditarNumDocumento);
        }
      )
    })

    /*
      ==================================================
      =================== EDITAR DATA ===================
      ==================================================
    */

    btnEditar.addEventListener('click', async () => {
      if (inputEditarTelefono.except)
        return formError(inputEditarTelefono.except, inputEditarTelefono);
      if (inputEditarNumDocumento.except)
        return formError(inputEditarNumDocumento.except, inputEditarNumDocumento);

      let jsonData = {};

      jsonData.id = currentEditarId;

      let nombresValue = inputEditarNombre.value;
      if (!nombresValue) return formError(`Se require un nombre!.`, inputEditarNombre);
      jsonData.nombres = nombresValue;

      let selectTipoCliente = selectorEditarTipoCliente.selected[0];
      if (!selectTipoCliente) return formError(`Selecciona un tipo de cliente`, inputNuevoSelectorTipoCliente);
      jsonData.tipo_cliente_id = Number(selectTipoCliente.id || selectorEditarTipoCliente.currentValue);

      let telefonoValue = inputEditarTelefono.value;
      if (!telefonoValue) return formError(`Se require un telefono!.`, inputEditarTelefono);
      jsonData.telefono = telefonoValue;

      let direccionValue = inputEditarDireccion.value;
      if (!direccionValue) return formError(`Se require una direccion!.`, inputEditarDireccion);
      jsonData.direccion = direccionValue;

      let selectTipoDocumento = selectorEditarTipoDocumento.selected[0];
      if (!selectTipoDocumento) return formError(`Selecciona un tipo documento`, inputNuevoSelectorTipoDocumento);
      jsonData.tipo_documento_id = Number(selectTipoDocumento.id || selectorEditarTipoDocumento.currentValue);

      let numDocumentoValue = inputEditarNumDocumento.value;
      if (!numDocumentoValue) return formError(`Se require un num de documento!.`, inputEditarNumDocumento);
      jsonData.num_documento = numDocumentoValue;

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

    socket.on('/clientes/data/insert', () => {
      $table.datatable.draw();
    })

    socket.on('/clientes/data/updateId', async data => {
      if (currentEditarId == data.id) {
        await defaultEditar(data);
        validChangeData()
      }
      if (!$table.get('#' + data.id)) return;
      $table.datatable.draw();
    })

    socket.on('/clientes/data/state', data => {
      if (!$table.get('#' + data.id)) return;
      $table.datatable.draw();
    })

    socket.on('/clientes/data/deleteId', data => {
      if (currentEditarId == data.id)
        toggleMenu.close()
      if (!$table.get('#' + data.id)) return;
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