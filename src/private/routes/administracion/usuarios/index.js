$('.content-body').ready(async () => {
  /* 
    ==================================================
    =================== QUERY DATA ===================
    ==================================================
  */

  let resUsuariosTbl = await query.post.cookie("/api/usuarios/table/readAll");
  /** @typedef {{agregar:number, editar:number, eliminar:number, exportar:number, ocultar:number, ver:number}} PERMISOS */
  /** @type {{err: string, OkPacket: import('mysql').OkPacket, list: {[column:string]: string|number}[], uniques: {[column:string]: string|number}[], permisos: PERMISOS}} */
  let { list: dataUsuarios, uniques: uniqueUsuarios, permisos: permisosUsuarios } = await resUsuariosTbl.json();

  let uniqueUsuario = new Set(uniqueUsuarios.map(({ usuario }) => usuario?.toLowerCase()));
  let uniqueEmail = new Set(uniqueUsuarios.map(({ email }) => email?.toLowerCase()));
  let uniqueTelefono = new Set(uniqueUsuarios.map(({ telefono }) => telefono));

  /* 
    ==================================================
    ================== VARIABLES DOM ==================
    ==================================================
  */

  let menuSide = document.querySelector('.menu-side');

  let tableNuevo = document.getElementById('table-nuevo');
  let inputNuevoText = tableNuevo?.querySelectorAll('input[type=text]');
  let inputNuevoEmail = tableNuevo?.querySelector('input[type=email]');
  let inputNuevoSelector = tableNuevo?.querySelector('input.selector');
  let inputNuevoCheckbox = tableNuevo?.querySelector('input[type=checkbox]');
  let btnNuevo = tableNuevo?.querySelector('.btn');

  let tableEditar = document.getElementById('table-editar');
  let inputEditarHidden = tableEditar?.querySelector('input[type=hidden]');
  let inputEditarText = tableEditar?.querySelectorAll('input[type=text]');
  let inputEditarEmail = tableEditar?.querySelector('input[type=email]');
  let inputEditarSelector = tableEditar?.querySelector('input.selector');
  let inputEditarImagen = tableEditar?.querySelector('.imagen-unic');
  let btnEditar = tableEditar?.querySelector('.btn');

  let $table = new Tables('#table-main');

  /* 
    ==================================================
    ===================== ESTADO =====================
    ==================================================
  */

  if (permisosUsuarios.ocultar) {
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

    dataUsuarios.forEach(d => {
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
      data: dataUsuarios,
      select: {
        style: 'single'
      },
      order: [[1, 'asc']],
      columnDefs: [
        {
          className: 'dtr-control',
          orderable: false,
          targets: 0,
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
    $table.buttons();
  }
  else {

    /* 
      ==================================================
      ==================== DATATABLE ====================
      ==================================================
    */

    $table.init({
      data: dataUsuarios,
      select: {
        style: 'single'
      },
      order: [[0, 'asc']],
      columns: [
        { data: 'nombres' },
        { data: 'apellidos' },
        { data: 'usuario' },
        { data: 'email' },
        { data: 'telefono' },
        { data: 'rol_nombre' },
        { data: 'creacion' }
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

    let resRoles = await query.post.cookie("/api/tipo_rol/selector/readAll");

    /** @type {{err: string, OkPacket: import('mysql').OkPacket, list: {[column:string]: string|number}[]}} */
    let { list: dataRoles } = await resRoles.json();

    let dataSelectorRoles = new Selector(dataRoles, true);

    /* 
      ==================================================
      ================== SELECTOR UNIC ==================
      ==================================================
    */

    let nuevoSelectorUnic = inputNuevoSelector
      ? new SelectorUnic(inputNuevoSelector, dataSelectorRoles) : null;
    let editarSelectorUnic = inputEditarSelector
      ? new SelectorUnic(inputEditarSelector, dataSelectorRoles) : null;

    /* 
      ==================================================
      ===================== IMAGEN =====================
      ==================================================
    */
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
        menuSide.style.display = '';
        tableNuevo && (tableNuevo.style.display = '');
        tableEditar && (tableEditar.style.display = 'none');
        this.now = 'nuevo';
      },
      editar() {
        this.emptyNuevo();
        menuSide.style.display = '';
        tableNuevo && (tableNuevo.style.display = 'none');
        tableEditar && (tableEditar.style.display = '');
        this.now = 'editar';
      },
      close() {
        this.emptyNuevo();
        this.emptyEditar();
        menuSide.style.display = 'none';
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

    if (permisosUsuarios.agregar) {

      /* 
        ==================================================
        ================= UNIQUE AGREGAR =================
        ==================================================
      */

      let inputNuevoUsuario = inputNuevoText[2];
      inputNuevoUsuario.addEventListener('input', () => {
        let val = inputNuevoUsuario.value;
        if (!uniqueUsuario.has(val?.toLowerCase()))
          return inputNuevoUsuario.except = null;
        inputNuevoUsuario.except = `El usuario '${val}' ya existe.`;
        formError(inputNuevoUsuario.except, inputNuevoUsuario.parentNode);
      })

      let inputNuevoTelefono = inputNuevoText[3];
      inputNuevoTelefono.addEventListener('input', () => {
        let val = inputNuevoTelefono.value;
        if (!uniqueTelefono.has(val))
          return inputNuevoTelefono.except = null;
        inputNuevoTelefono.except = `El telefono '${val}' ya existe.`;
        formError(inputNuevoTelefono.except, inputNuevoTelefono.parentNode);
      })

      inputNuevoEmail.addEventListener('input', () => {
        let val = inputNuevoEmail.value;
        if (!uniqueEmail.has(val?.toLowerCase()))
          return inputNuevoEmail.except = null;
        inputNuevoEmail.except = `El Email '${val}' ya existe.`;
        formError(inputNuevoEmail.except, inputNuevoEmail.parentNode);
      })

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
        let rol_nombre = select.name;

        jsonData.estado = inputNuevoCheckbox.checked ? 1 : 0;

        let resUsuarios = await query.post.json.cookie("/api/usuarios/table/insert", jsonData);

        /** @type {{err: string, OkPacket: import('mysql').OkPacket, list: {[column:string]: string|number}[]}} */
        let { err, OkPacket } = await resUsuarios.json();

        if (err)
          return alarm.warn('No se pudo agregar')

        let { insertId: id } = OkPacket;

        let i = document.createElement('input');
        i.classList.add('check-switch');
        i.setAttribute('type', 'checkbox');
        i.addEventListener('change', updateIdState.bind(i, { usuario: jsonData['usuario'], id }));
        i.checked = jsonData['estado'];

        $table.add({
          id: id,
          estado: i,
          nombres: jsonData.nombres,
          apellidos: jsonData.apellidos,
          usuario: jsonData.usuario,
          email: jsonData.email,
          telefono: jsonData.telefono,
          rol_nombre: rol_nombre,
          creacion: formatTime('YYYY-MM-DD hh:mm:ss')
        });

        uniqueUsuario.add(jsonData.usuario?.toLowerCase());
        uniqueEmail.add(jsonData.email?.toLowerCase());
        uniqueTelefono.add(jsonData.telefono);

        alarm.success(`Fila Agregada`);
      })
    }

    /* 
      ==================================================
      ================= PERMISO EDITAR =================
      ==================================================
    */

    if (permisosUsuarios.editar) {

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

      let inputEditarUsuario = inputEditarText[2];
      inputEditarUsuario.addEventListener('input', () => {
        let val = inputEditarUsuario.value;
        if (inputEditarUsuario.beforeValue == val || !uniqueUsuario.has(val?.toLowerCase()))
          return inputEditarUsuario.except = null;
        inputEditarUsuario.except = `El usuario '${val}' ya existe.`;
        formError(inputEditarUsuario.except, inputEditarUsuario.parentNode);
      })

      let inputEditarTelefono = inputEditarText[3];
      inputEditarTelefono.addEventListener('input', () => {
        let val = inputEditarTelefono.value;
        if (inputEditarTelefono.beforeValue == val || !uniqueTelefono.has(val))
          return inputEditarTelefono.except = null;
        inputEditarTelefono.except = `El telefono '${val}' ya existe.`;
        formError(inputEditarTelefono.except, inputEditarTelefono.parentNode);
      })

      inputEditarEmail.addEventListener('input', () => {
        let val = inputEditarEmail.value;
        if (inputEditarEmail.beforeValue == val || !uniqueEmail.has(val?.toLowerCase()))
          return inputEditarEmail.except = null;
        inputEditarEmail.except = `El Email '${val}' ya existe.`;
        formError(inputEditarEmail.except, inputEditarEmail.parentNode);
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
        jsonData.rol_nombre = select.name;

        let resUsuarios = await query.post.json.cookie("/api/usuarios/table/updateId", jsonData);

        /** @type {{err: string, OkPacket: import('mysql').OkPacket, list: {[column:string]: string|number}[]}} */
        let { err } = await resUsuarios.json();

        if (err)
          return alarm.warn('No se pudo Editar');

        $table.update('#' + id, {
          nombres: jsonData.nombres,
          apellidos: jsonData.apellidos,
          usuario: jsonData.usuario,
          email: jsonData.email,
          telefono: jsonData.telefono,
          rol_nombre: jsonData.rol_nombre
        });

        if (beforeJsonData.usuario?.toLowerCase() != jsonData.usuario?.toLowerCase()) {
          uniqueUsuario.delete(beforeJsonData.usuario?.toLowerCase());
          uniqueUsuario.add(jsonData.usuario?.toLowerCase());
        }
        if (beforeJsonData.email?.toLowerCase() != jsonData.email?.toLowerCase()) {
          uniqueEmail.delete(beforeJsonData.email?.toLowerCase());
          uniqueEmail.add(jsonData.email?.toLowerCase());
        }
        if (beforeJsonData.telefono?.toLowerCase() != jsonData.telefono?.toLowerCase()) {
          uniqueTelefono.delete(beforeJsonData.telefono);
          uniqueTelefono.add(jsonData.telefono);
        }

        alarm.success(`Fila actualizada`);
      })
    }
  }

  /* 
    ==================================================
    ================ PERMISO ELIMINAR ================
    ==================================================
  */

  if (permisosUsuarios.eliminar) {

    /* 
      ==================================================
      ================== ELIMINAR DATA ==================
      ==================================================
    */

    let tblEliminar = document.querySelectorAll('.tbl-eliminar');
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

            uniqueUsuario.delete(dataBefore.usuario?.toLowerCase());
            uniqueTelefono.delete(dataBefore.telefono?.toLowerCase());
            uniqueEmail.delete(dataBefore.email?.toLowerCase());

            $table.remove('#' + id);
            alarm.success(`Fila eliminada`);
          }
        });
    }))
  }
})