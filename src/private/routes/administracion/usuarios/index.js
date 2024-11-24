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
    let inputNuevoUsuario = inputNuevoText[2];
    let inputNuevoTelefono = inputNuevoText[3];
    let inputNuevoEmail = tableNuevo?.querySelector('input[type=email]');
    let inputNuevoSelector = tableNuevo?.querySelector('input.selector');
    let inputNuevoCheckbox = tableNuevo?.querySelector('input[type=checkbox]');
    let btnNuevo = tableNuevo?.querySelector('.btn');

    let $tableEditar = $('#table-editar');
    let tableEditar = $tableEditar[0];
    let inputEditarHidden = tableEditar?.querySelector('input[type=hidden]');
    let inputEditarText = tableEditar?.querySelectorAll('input[type=text]');
    let inputEditarUsuario = inputEditarText[2];
    let inputEditarTelefono = inputEditarText[3];
    let inputEditarEmail = tableEditar?.querySelector('input[type=email]');
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
    async function updateIdState({ id, usuario }) {
      this.disabled = true;
      let estado = this.checked;
      let resEstado = await query.post.json.cookie("/api/usuarios/table/updateIdState", { id, estado });

      /** @type {{err: string, OkPacket: import('mysql').OkPacket, list: {[column:string]: string|number}[]}} */
      let { err } = await resEstado.json();

      if (estado)
        alarm.success(`${usuario} activado`);
      else
        alarm.success(`${usuario} desactivado`);

      if (err) {
        this.checked = !estado;
        alarm.error(`${usuario} inaccesible`);
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
          name: 'u.telefono',
          targets: 4
        },
        {
          name: 'u.email',
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

    let dataSelectorRoles = new OptionsServerside(
      (req, end) => socket.emit('/selector/rol', req, res => end(res)),
      { showIndex: true, order: 'asc', noInclude: true }
    );

    /* 
      ==================================================
      ================== SELECTOR UNIC ==================
      ==================================================
    */

    let nuevoSelectorUnic = new SelectorInput(
      inputNuevoSelector,
      dataSelectorRoles,
      { autohide: true }
    );
    let editarSelectorUnic = new SelectorInput(
      inputEditarSelector,
      dataSelectorRoles,
      { justChange: true }
    );

    /* 
      ==================================================
      ===================== IMAGEN =====================
      ==================================================
    */
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
          formError(inputNuevoUsuario.except, inputNuevoUsuario.parentNode);
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
          formError(inputNuevoTelefono.except, inputNuevoTelefono.parentNode);
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
          formError(inputNuevoEmail.except, inputNuevoEmail.parentNode);
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
      let jsonData = {};

      inputNuevoText.forEach(i => {
        if (i.except) return formError(i.except, i.parentNode);
        let column = i.getAttribute('name');
        let value = i.value;
        if (!value) return formError(`Se requiere un valor para ${column}`, i.parentNode);
        jsonData[column] = value;
      })

      if (inputNuevoEmail.except) return formError(inputNuevoEmail.except, inputNuevoEmail.parentNode);

      let email = inputNuevoEmail.value;
      if (!email) return formError(`Se requiere un valor para email`, inputNuevoEmail.parentNode);
      if (!email.includes('@')) return formError(`Email no valido`, inputNuevoEmail.parentNode);
      jsonData.email = email;

      let select = nuevoSelectorUnic.selected[0];
      if (!select) return formError(`Selecciona un Rol`, inputNuevoSelector.parentNode);
      jsonData.rol_id = Number(select.id);
      jsonData.estado = inputNuevoCheckbox.checked ? 1 : 0;

      let resUsuarios = await query.post.json.cookie("/api/usuarios/table/insert", jsonData);

      /** @type {{err: string, OkPacket: import('mysql').OkPacket, list: {[column:string]: string|number}[]}} */
      let { err, OkPacket } = await resUsuarios.json();

      if (err)
        return alarm.warn('No se pudo agregar')

      alarm.success(`Fila Agregada`);
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

      let resUsuarios = await query.post.json.cookie("/api/usuarios/table/readId", { id });

      /** @type {{err: string, OkPacket: import('mysql').OkPacket, list: {[column:string]: string|number}[]}} */
      let { list } = await resUsuarios.json();

      inputEditarHidden.value = id;

      inputEditarText.forEach(i => {
        let column = i.getAttribute('name');
        let value = list[column];
        i.beforeValue = i.value = value;
      })
      inputEditarEmail.beforeValue = inputEditarEmail.value = list.email;

      editarSelectorUnic.select(list.rol_id);
      editarSelectorUnic.beforeValue = list.rol_id;

      if (list.foto_src)
        editarImagenUnic.charge(list.foto_src),
          editarImagenUnic.beforeValue = list.foto_src;
    }))

    /* 
      ==================================================
      ================== UNIQUE EDITAR ==================
      ==================================================
    */

    inputEditarUsuario.addEventListener('input', () => {
      let value = inputEditarUsuario.value;
      let id = Number(inputEditarHidden.value);
      socket.emit(
        '/read/unic',
        { column: 'usuario', value, id },
        res => {
          if (res)
            return inputEditarUsuario.except = null;
          inputEditarUsuario.except = `El usuario '${value}' ya existe.`;
          formError(inputEditarUsuario.except, inputEditarUsuario.parentNode);
        }
      )
    })

    inputEditarTelefono.addEventListener('input', () => {
      let value = inputEditarTelefono.value;
      let id = Number(inputEditarHidden.value);
      socket.emit(
        '/read/unic',
        { column: 'telefono', value, id },
        res => {
          if (res)
            return inputEditarTelefono.except = null;
          inputEditarTelefono.except = `El telefono '${value}' ya existe.`;
          formError(inputEditarTelefono.except, inputEditarTelefono.parentNode);
        }
      )
    })

    inputEditarEmail.addEventListener('input', () => {
      let value = inputEditarEmail.value;
      let id = Number(inputEditarHidden.value);
      socket.emit(
        '/read/unic',
        { column: 'email', value, id },
        res => {
          if (res)
            return inputEditarEmail.except = null;
          inputEditarEmail.except = `El Email '${value}' ya existe.`;
          formError(inputEditarEmail.except, inputEditarEmail.parentNode);
        }
      )
    })

    /* 
      ==================================================
      =================== EDITAR DATA ===================
      ==================================================
    */

    btnEditar.addEventListener('click', async () => {
      let beforeJsonData = {};

      let jsonData = {};
      let id = inputEditarHidden.value;
      jsonData.id = id;

      inputEditarText.forEach(i => {
        if (i.except) return formError(i.except, i.parentNode);
        let column = i.getAttribute('name');
        beforeJsonData[column] = i.beforeValue;
        let value = i.value;
        if (!value) return formError(`Se requiere un valor para ${column}`, i.parentNode);
        jsonData[column] = value;
      })

      if (inputEditarEmail.except) return formError(inputEditarEmail.except, inputEditarEmail.parentNode);

      let email = inputEditarEmail.value;
      beforeJsonData.email = inputEditarEmail.beforeValue;
      if (!email) return formError(`Se requiere un valor para email`, inputEditarEmail.parentNode);
      if (!email.includes('@')) return formError(`Email no valido`, inputEditarEmail.parentNode);
      jsonData.email = email;

      let select = editarSelectorUnic.selected[0];
      if (!select) return formError(`Selecciona un Rol`, inputEditarSelector.parentNode);
      jsonData.rol_id = Number(select.id);

      let resUsuarios = await query.post.json.cookie("/api/usuarios/table/updateId", jsonData);

      /** @type {{err: string, OkPacket: import('mysql').OkPacket, list: {[column:string]: string|number}[]}} */
      let { err } = await resUsuarios.json();

      if (err)
        return alarm.warn('No se pudo Editar');

      alarm.success(`Fila actualizada`);
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
          if (result.isConfirmed) {
            let resUsuarios = await query.post.json.cookie("/api/usuarios/table/deleteId", { id });

            /** @type {{err: string, OkPacket: import('mysql').OkPacket, list: {[column:string]: string|number}[]}} */
            let { err } = await resUsuarios.json();

            if (err)
              return alarm.error(`Fila no Eliminada`);

            let dataBefore = $table.get('#' + id)

            $table.remove('#' + id);
            alarm.success(`Fila eliminada`);
          }
        });
    }))

    /* 
      ==================================================
      ===================== SOCKET =====================
      ==================================================
    */

    socket.on('/usuarios/data/insert', data => {
      let row = $table.get('#' + data.id);
      if (row) return;

      $table.add({
        id: data.id,
        estado: data.estado,
        nombres: data.nombres,
        apellidos: data.apellidos,
        usuario: data.usuario,
        email: data.email,
        telefono: data.telefono,
        rol_nombre: data.rol_nombre,
        creacion: formatTime('YYYY-MM-DD hh:mm:ss')
      });
    })

    socket.on('/usuarios/data/updateId', data => {
      let row = $table.get('#' + data.id);
      if (!row) return;

      $table.update('#' + data.id, {
        nombres: data.nombres,
        apellidos: data.apellidos,
        usuario: data.usuario,
        email: data.email,
        telefono: data.telefono,
        rol_nombre: data.rol_nombre
      });

      let menuEditarid = $table.selected();
      if (menuEditarid && menuEditarid == data.id)
        tblEditar?.[0]?.click();
    })

    socket.on('/usuarios/data/state', data => {
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