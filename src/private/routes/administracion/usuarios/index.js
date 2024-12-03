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
    let inputNuevoText = tableNuevo?.querySelectorAll('input[type=text]');
    /** @type {HTMLInputElement} */
    let inputNuevoNombres = document.getElementById('nuevo-nombres');
    /** @type {HTMLInputElement} */
    let inputNuevoApellidos = document.getElementById('nuevo-apellidos');
    /** @type {HTMLInputElement & {except?: string}} */
    let inputNuevoUsuario = document.getElementById('nuevo-usuario');
    /** @type {HTMLInputElement & {except?: string}} */
    let inputNuevoTelefono = document.getElementById('nuevo-telefono');
    /** @type {HTMLInputElement & {except?: string}} */
    let inputNuevoEmail = document.getElementById('nuevo-email');
    /** @type {HTMLInputElement} */
    let inputNuevoSelectorRol = document.getElementById('nuevo-rol');
    /** @type {HTMLInputElement} */
    let checkboxNuevoEstado = document.getElementById('nuevo-estado');
    /** @type {HTMLAnchorElement} */
    let btnNuevo = tableNuevo?.querySelector('.btn');

    let currentEditarId = 0;
    let $tableEditar = $('#table-editar');
    let tableEditar = $tableEditar[0];
    let inputEditarText = tableEditar?.querySelectorAll('input[type=text]');
    /** @type {HTMLInputElement} */
    let inputEditarNombres = document.getElementById('editar-nombres');
    /** @type {HTMLInputElement} */
    let inputEditarApellidos = document.getElementById('editar-apellidos');
    /** @type {HTMLInputElement & {except?: string}} */
    let inputEditarUsuario = document.getElementById('editar-usuario');
    /** @type {HTMLInputElement & {except?: string}} */
    let inputEditarTelefono = document.getElementById('editar-telefono');
    /** @type {HTMLInputElement & {except?: string}} */
    let inputEditarEmail = document.getElementById('editar-email');
    /** @type {HTMLInputElement} */
    let inputEditarSelectorRol = document.getElementById('editar-rol');
    /** @type {HTMLInputElement} */
    let inputEditarImagen = document.getElementById('editar-imagen');
    /** @type {HTMLAnchorElement} */
    let btnEditar = tableEditar?.querySelector('.btn');

    let calendarioBox = document.querySelector('.calendario');

    let $table = new Tables('#table-main');

    /*
      ==================================================
      ===================== ESTADO =====================
      ==================================================
    */

    /** @type {(this:HTMLInputElement, data: {id: number, usuario: string})=>void} */
    async function updateIdState({ id, usuario }) {
      this.disabled = true;
      let estado = this.checked;
      socket.emit('/stateId/table', id, estado, err => {
        if (err) {
          this.checked = !estado;
          return alarm.error(err);
        }

        if (estado)
          alarm.success(`${usuario} activado`);
        else
          alarm.success(`${usuario} desactivado`);

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
      order: [[7, 'asc']],
      columnDefs: [
        {
          name: 'u.estado',
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
          name: 'u.nombres',
          targets: 1
        },
        {
          name: 'u.apellidos',
          targets: 2
        },
        {
          name: 'u.usuario',
          targets: 3
        },
        {
          name: 'u.email',
          targets: 4
        },
        {
          name: 'u.telefono',
          className: 'dt-type-numeric',
          targets: 5
        },
        {
          name: 'r.nombre',
          className: 'dtr-tag',
          targets: 6,
          render: data => '<div>' + data + '</div>'
        },
        {
          name: 'u.creacion',
          className: 'dt-type-date',
          targets: 7
        }
      ],
      columns: [
        { data: 'estado' },
        { data: 'nombres' },
        { data: 'apellidos' },
        { data: 'usuario' },
        { data: 'email' },
        { data: 'telefono' },
        { data: 'rol_nombre' },
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

    let selectorOptionsTipoRol = new OptionsServerside(
      (req, end) => socket.emit('/selector/rol', req, res => end(res)),
      { showIndex: true, order: 'asc', noInclude: true }
    );

    /*
      ==================================================
      ================== SELECTOR UNIC ==================
      ==================================================
    */

    let selectorNuevoTipoRol = new SelectorInput(
      inputNuevoSelectorRol,
      selectorOptionsTipoRol,
      { autohide: true }
    );
    let selectorEditarTipoRol = new SelectorInput(
      inputEditarSelectorRol,
      selectorOptionsTipoRol,
      { justChange: true }
    );

    /*
      ==================================================
      ===================== IMAGEN =====================
      ==================================================
    */
    let imagenEditarAvatar = new ImagenUnic(inputEditarImagen);

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
        selectorNuevoTipoRol.empty();
      },
      emptyEditar() {
        if (this.now != 'editar') return;
        inputEditarText.forEach(i => i.value = '');
        selectorEditarTipoRol.empty();
        imagenEditarAvatar.empty();
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

    inputNuevoUsuario.addEventListener('input', () => {
      let value = inputNuevoUsuario.value;
      socket.emit(
        '/read/unic',
        { column: 'usuario', value },
        res => {
          if (res)
            return inputNuevoUsuario.except = null;
          inputNuevoUsuario.except = `El usuario '${value}' ya existe.`;
          formError(inputNuevoUsuario.except, inputNuevoUsuario);
        }
      )
    })

    inputNuevoTelefono.addEventListener('input', () => {
      let value = inputNuevoTelefono.value;
      socket.emit(
        '/read/unic',
        { column: 'telefono', value },
        res => {
          if (res)
            return inputNuevoTelefono.except = null;
          inputNuevoTelefono.except = `El telefono '${value}' ya existe.`;
          formError(inputNuevoTelefono.except, inputNuevoTelefono);
        }
      )
    })

    inputNuevoEmail.addEventListener('input', () => {
      let value = inputNuevoEmail.value;
      socket.emit(
        '/read/unic',
        { column: 'email', value },
        res => {
          if (res)
            return inputNuevoEmail.except = null;
          inputNuevoEmail.except = `El Email '${value}' ya existe.`;
          formError(inputNuevoEmail.except, inputNuevoEmail);
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
      if (inputNuevoUsuario.except)
        return formError(inputNuevoUsuario.except, inputNuevoUsuario);
      if (inputNuevoTelefono.except)
        return formError(inputNuevoTelefono.except, inputNuevoTelefono);
      if (inputNuevoEmail.except)
        return formError(inputNuevoEmail.except, inputNuevoEmail);

      let jsonData = {};

      let nombresValue = inputNuevoNombres.value;
      if (!nombresValue) return formError(`Se require los nombres!.`, inputNuevoNombres);
      jsonData.nombres = nombresValue;

      let apellidosValue = inputNuevoApellidos.value;
      if (!apellidosValue) return formError(`Se require los apellidos!.`, inputNuevoApellidos);
      jsonData.apellidos = apellidosValue;

      let usuarioValue = inputNuevoUsuario.value;
      if (!usuarioValue) return formError(`Se require un nombre usuario.`, inputNuevoUsuario);
      jsonData.usuario = usuarioValue;

      let telefonoValue = inputNuevoTelefono.value;
      if (!telefonoValue) return formError(`Se require un telefono`, inputNuevoTelefono);
      jsonData.telefono = telefonoValue;

      let emailValue = inputNuevoEmail.value;
      if (!emailValue) return formError(`Se require un email!.`, inputNuevoEmail);
      if (!emailValue.includes('@')) return formError(`Email no valido`, inputNuevoEmail);
      jsonData.email = emailValue;


      let selectTipoRol = selectorNuevoTipoRol.selected[0].id;
      if (!selectTipoRol) return formError(`Selecciona un Rol`, inputNuevoSelectorRol);
      jsonData.rol_id = Number(selectTipoRol);

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

    let validChangeData = () => {
      let valid = false;
      valid ||= inputEditarNombres.value != inputEditarNombres.currentValue;
      valid ||= inputEditarApellidos.value != inputEditarApellidos.currentValue;
      valid ||= inputEditarUsuario.value != inputEditarUsuario.currentValue;
      valid ||= inputEditarTelefono.value != inputEditarTelefono.currentValue;
      valid ||= inputEditarEmail.value != inputEditarEmail.currentValue;
      valid ||= selectorEditarTipoRol?.selected[0]?.id != selectorEditarTipoRol.currentValue;

      valid
        ? btnEditar.classList.remove('disabled')
        : btnEditar.classList.add('disabled');
    }

    inputEditarNombres.addEventListener('input', validChangeData);
    inputEditarApellidos.addEventListener('input', validChangeData);
    inputEditarUsuario.addEventListener('input', validChangeData);
    inputEditarTelefono.addEventListener('input', validChangeData);
    inputEditarEmail.addEventListener('input', validChangeData);
    selectorEditarTipoRol.on('change', validChangeData);

    /*
      ==================================================
      =================== OPEN EDITAR ===================
      ==================================================
    */

    let defaultEditar = async data => {
      inputEditarNombres.currentValue
        = inputEditarNombres.placeholder
        = data.nombres;

      inputEditarApellidos.currentValue
        = inputEditarApellidos.placeholder
        = data.apellidos;

      inputEditarUsuario.currentValue
        = inputEditarUsuario.placeholder
        = data.usuario;

      inputEditarTelefono.currentValue
        = inputEditarTelefono.placeholder
        = data.telefono;

      inputEditarEmail.currentValue
        = inputEditarEmail.placeholder
        = data.email;

      let asyncTipoRol = selectorEditarTipoRol.select(data.rol_id);
      selectorEditarTipoRol.currentValue = data.rol_id;

      if (data.foto_src) {
        imagenEditarAvatar.charge(data.foto_src);
        imagenEditarAvatar.currentValue = data.foto_src;
      }

      await asyncTipoRol;
    }

    let setterEditar = data => {
      currentEditarId = data.id;

      inputEditarNombres.value
        = data.nombres;

      inputEditarApellidos.value
        = data.apellidos;

      inputEditarUsuario.value
        = data.usuario;

      inputEditarTelefono.value
        = data.telefono;

      inputEditarEmail.value
        = data.email;

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

    inputEditarUsuario.addEventListener('input', () => {
      let value = inputEditarUsuario.value;
      let id = currentEditarId;
      socket.emit(
        '/read/unic',
        { column: 'usuario', value, id },
        res => {
          if (res)
            return inputEditarUsuario.except = null;
          inputEditarUsuario.except = `El usuario '${value}' ya existe.`;
          formError(inputEditarUsuario.except, inputEditarUsuario);
        }
      )
    })

    inputEditarTelefono.addEventListener('input', () => {
      let value = inputEditarTelefono.value;
      let id = currentEditarId;
      socket.emit(
        '/read/unic',
        { column: 'telefono', value, id },
        res => {
          if (res)
            return inputEditarTelefono.except = null;
          inputEditarTelefono.except = `El telefono '${value}' ya existe.`;
          formError(inputEditarTelefono.except, inputEditarTelefono);
        }
      )
    })

    inputEditarEmail.addEventListener('input', () => {
      let value = inputEditarEmail.value;
      let id = currentEditarId;
      socket.emit(
        '/read/unic',
        { column: 'email', value, id },
        res => {
          if (res)
            return inputEditarEmail.except = null;
          inputEditarEmail.except = `El Email '${value}' ya existe.`;
          formError(inputEditarEmail.except, inputEditarEmail);
        }
      )
    })

    /*
      ==================================================
      =================== EDITAR DATA ===================
      ==================================================
    */

    btnEditar.addEventListener('click', async () => {
      if (inputEditarUsuario.except)
        return formError(inputEditarUsuario.except, inputEditar);
      if (inputEditarTelefono.except)
        return formError(inputEditarTelefono.except, inputEditar);
      if (inputEditarEmail.except)
        return formError(inputEditarEmail.except, inputEditar);

      let jsonData = {};

      jsonData.id = currentEditarId;

      let nombresValue = inputEditarNombres.value;
      if (!nombresValue) return formError(`Se require los nombres!.`, inputEditarNombres);
      jsonData.nombres = nombresValue;

      let apellidosValue = inputEditarApellidos.value;
      if (!apellidosValue) return formError(`Se require los apellidos!.`, inputEditarApellidos);
      jsonData.apellidos = apellidosValue;

      let usuarioValue = inputEditarUsuario.value;
      if (!usuarioValue) return formError(`Se require un nombre usuario.`, inputEditarUsuario);
      jsonData.usuario = usuarioValue;

      let telefonoValue = inputEditarTelefono.value;
      if (!telefonoValue) return formError(`Se require un telefono`, inputEditarTelefono);
      jsonData.telefono = telefonoValue;

      let emailValue = inputEditarEmail.value;
      if (!emailValue) return formError(`Se require un email!.`, inputEditarEmail);
      if (!emailValue.includes('@')) return formError(`Email no valido`, inputEditarEmail);
      jsonData.email = emailValue;

      let selectTipoRol = selectorEditarTipoRol.selected[0].id;
      if (!selectTipoRol) return formError(`Selecciona un Rol`, inputNuevoSelectorRol);
      jsonData.rol_id = Number(selectTipoRol);

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

    tblEliminar.forEach(btn => btn.addEventListener('click', () => {
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

    socket.on('/usuarios/data/insert', () => {
      $table.datatable.draw();
    })

    socket.on('/usuarios/data/updateId', async data => {
      if (currentEditarId == data.id) {
        await defaultEditar(data);
        validChangeData()
      }
      if (!$table.get('#' + data.id)) return;
      $table.datatable.draw();
    })

    socket.on('/usuarios/data/state', data => {
      if (!$table.get('#' + data.id)) return;
      $table.datatable.draw();
    })

    socket.on('/usuarios/data/deleteId', data => {
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