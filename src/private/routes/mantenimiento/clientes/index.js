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
    let inputNuevoTelefono = inputNuevoText[1];
    let [inputNuevoSelectorTipoCliente, inputNuevoSelectorTipoDocumento]
      = tableNuevo.querySelectorAll('input.selector');
    let inputNuevoCheckbox = tableNuevo.querySelector('input[type=checkbox]');
    let btnNuevo = tableNuevo.querySelector('.btn');

    let $tableEditar = $('#table-editar');
    let tableEditar = $tableEditar[0];
    let inputEditarHidden = tableEditar.querySelector('input[type=hidden]');
    let inputEditarText = tableEditar.querySelectorAll('input[type=text]');
    let inputEditarNombre = inputEditarText[0];
    let inputEditarTelefono = inputEditarText[1];
    let inputEditarDireccion = inputEditarText[2];
    let inputEditarNumDocumento = inputEditarText[3];
    let [inputEditarSelectorTipoCliente, inputEditarSelectorTipoDocumento]
      = tableEditar.querySelectorAll('input.selector');
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
      let resEstado = await query.post.json.cookie("/api/clientes/table/updateIdState", { id, estado });

      /** @type {{err: string, OkPacket: import('mysql').OkPacket, list: {[column:string]: string|number}[]}} */
      let { err } = await resEstado.json();

      if (estado)
        alarm.success(`${nombres} activado`);
      else
        alarm.success(`${nombres} desactivado`);

      if (err) {
        this.checked = !estado;
        alarm.error(`${nombres} inaccesible`);
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

    let nuevoSelectorUnicTipoCliente = new SelectorInput(
      inputNuevoSelectorTipoCliente,
      selectorOptionsTipoCliente,
      { autohide: true }
    );
    let nuevoSelectorUnicTipoDocumento = new SelectorInput(
      inputNuevoSelectorTipoDocumento,
      selectorOptionsTipoDocumento,
      { autohide: true }
    );
    let editarSelectorUnicTipoCliente = new SelectorInput(
      inputEditarSelectorTipoCliente,
      selectorOptionsTipoCliente
    );
    let editarSelectorUnicTipoDocumento = new SelectorInput(
      inputEditarSelectorTipoDocumento,
      selectorOptionsTipoDocumento
    );

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
        nuevoSelectorUnicTipoCliente.empty();
        nuevoSelectorUnicTipoDocumento.empty();
      },
      emptyEditar() {
        if (this.now != 'editar') return;
        inputEditarText.forEach(i => i.value = '');
        editarSelectorUnicTipoCliente.empty();
        editarSelectorUnicTipoDocumento.empty();
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
          formError(inputNuevoTelefono.except, inputNuevoTelefono.parentNode);
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
        return formError(inputNuevoTelefono.except, inputNuevoTelefono.parentNode);

      let jsonData = {};
      inputNuevoText.forEach(i => {
        let column = i.getAttribute('name');
        let value = i.value;
        if (!value) return formError(`Se requiere un valor para ${column}`, i.parentNode);
        jsonData[column] = value;
      })

      let selectTipoCliente = nuevoSelectorUnicTipoCliente.selected[0];
      if (!selectTipoCliente) return formError(`Selecciona un Rol`, inputNuevoSelectorTipoCliente.parentNode);
      jsonData.tipo_cliente_id = Number(selectTipoCliente.id);


      let selectTipoDocumento = nuevoSelectorUnicTipoDocumento.selected[0];
      if (!selectTipoDocumento) return formError(`Selecciona un Rol`, inputNuevoSelectorTipoDocumento.parentNode);
      jsonData.tipo_documento_id = Number(selectTipoDocumento.id);

      jsonData.estado = inputNuevoCheckbox.checked ? 1 : 0;

      let resCliente = await query.post.json.cookie("/api/clientes/table/insert", jsonData);

      /** @type {{err: string, OkPacket: import('mysql').OkPacket, list: {[column:string]: string|number}[]}} */
      let { err } = await resCliente.json();

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
      let row = $table.get('#' + id);

      inputEditarNombre.placeholder
        = inputEditarNombre.value
        = row.nombre;

      inputEditarTelefono.placeholder
        = inputEditarTelefono.beforeValue
        = inputEditarTelefono.value
        = row.telefono;

      inputEditarDireccion.placeholder
        = inputEditarDireccion.value
        = row.direccion;

      inputEditarNumDocumento.placeholder
        = inputEditarNumDocumento.value
        = row.num_documento;

      editarSelectorUnicTipoCliente.select(row.tipo_cliente_id);
      editarSelectorUnicTipoCliente.beforeValue = row.tipo_cliente_id;

      editarSelectorUnicTipoDocumento.select(row.tipo_documento_id);
      editarSelectorUnicTipoDocumento.beforeValue = row.tipo_documento_id;

      inputEditarHidden.value = id;
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
          formError(inputEditarTelefono.except, inputEditarTelefono.parentNode);
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
        return formError(inputEditarTelefono.except, inputEditarTelefono.parentNode);

      let jsonData = {};

      let id = inputEditarHidden.value;
      jsonData.id = id;

      inputEditarText.forEach(i => {
        let column = i.getAttribute('name');
        let value = i.value;
        if (!value) return formError(`Se requiere un valor para ${column}`, i.parentNode);
        jsonData[column] = value;
      })

      let selectTipoCliente = editarSelectorUnicTipoCliente.selected[0];
      if (!selectTipoCliente) return formError(`Selecciona un Rol`, inputNuevoSelectorTipoCliente.parentNode);
      jsonData.tipo_cliente_id = Number(selectTipoCliente.id);

      let selectTipoDocumento = editarSelectorUnicTipoDocumento.selected[0];
      if (!selectTipoDocumento) return formError(`Selecciona un Rol`, inputNuevoSelectorTipoDocumento.parentNode);
      jsonData.tipo_documento_id = Number(selectTipoDocumento.id);

      let resCliente = await query.post.json.cookie("/api/clientes/table/updateId", jsonData);

      /** @type {{err: string, OkPacket: import('mysql').OkPacket, list: {[column:string]: string|number}[]}} */
      let { err } = await resCliente.json();

      if (err)
        return alarm.warn('No se pudo Editar');

      alarm.success(`Fila actualizada`);
      toggleMenu.close();
      $table.datatable.rows().deselect();
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
          if (result.isConfirmed) {
            let resClientes = await query.post.json.cookie("/api/clientes/table/deleteId", { id });

            /** @type {{err: string, OkPacket: import('mysql').OkPacket, list: {[column:string]: string|number}[]}} */
            let { err } = await resClientes.json();

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

    socket.on('/clientes/data/insert', data => {
      let row = $table.get('#' + data.id);
      if (row) return;

      $table.add({
        id: data.id,
        estado: data.estado,
        nombres: data.nombres,
        telefono: data.telefono,
        direccion: data.direccion,
        tipo_cliente_id: data.tipo_cliente_id,
        tipo_cliente_nombre: data.tipo_cliente_nombre,
        tipo_documento_id: data.tipo_documento_id,
        tipo_documento_nombre: data.tipo_documento_nombre,
        num_documento: data.num_documento,
        creacion: formatTime('YYYY-MM-DD hh:mm:ss')
      });
    })

    socket.on('/clientes/data/updateId', data => {
      let row = $table.get('#' + data.id);
      if (!row) return;

      $table.update('#' + data.id, {
        id: data.id,
        nombres: data.nombres,
        telefono: data.telefono,
        direccion: data.direccion,
        tipo_cliente_id: data.tipo_cliente_id,
        tipo_cliente_nombre: data.tipo_cliente_nombre,
        tipo_documento_id: data.tipo_documento_id,
        tipo_documento_nombre: data.tipo_documento_nombre,
        num_documento: data.num_documento
      });

      let menuEditarid = $table.selected();
      if (menuEditarid && menuEditarid == data.id)
        tblEditar?.[0]?.click();
    })

    socket.on('/clientes/data/state', data => {
      let row = $table.get('#' + data.id);
      if (!row) return;

      $table.update('#' + data.id, {
        estado: data.estado,
      });
    })

    socket.on('/clientes/data/deleteId', data => {
      let row = $table.get('#' + data.id);
      if (!row) return;
      $table.remove('#' + data.id);
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