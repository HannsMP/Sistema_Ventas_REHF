$('.content-body').ready(async () => {
  try {

    /* 
      ==================================================
      =================== QUERY DATA ===================
      ==================================================
    */

    let resCategoriasTbl = await query.post.cookie("/api/categorias/table/readAll");
    /** @typedef {{agregar:number, editar:number, eliminar:number, exportar:number, ocultar:number, ver:number}} PERMISOS */
    /** @type {{err: string, OkPacket: import('mysql').OkPacket, list: {[column:string]: string|number}[], permisos: PERMISOS}} */
    let { list: dataCategorias } = await resCategoriasTbl.json();

    let uniqueNombre = new Set(dataCategorias.map(({ nombre }) => nombre.toLowerCase()));

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
    let inputNuevoNombre = inputNuevoText[0];
    let inputNuevoCheckbox = tableNuevo.querySelector('input[type=checkbox]');
    let btnNuevo = tableNuevo.querySelector('.btn');

    let $tableEditar = $('#table-editar');
    let tableEditar = $tableEditar[0];
    let inputEditarHidden = tableEditar.querySelector('input[type=hidden]');
    let inputEditarText = tableEditar.querySelectorAll('input[type=text], textarea');
    let inputEditarNombre = inputEditarText[0];
    let inputEditarDescripcion = inputEditarText[1];
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
      let resEstado = await query.post.json.cookie("/api/categorias/table/updateIdState", { id, estado });

      /** @type {{err: string, OkPacket: import('mysql').OkPacket, list: {[column:string]: string|number}[]}} */
      let { err } = await resEstado.json();

      if (estado)
        alarm.success(`${nombre} activado`);
      else
        alarm.success(`${nombre} desactivado`);

      if (err) {
        this.checked = !estado;
        alarm.error(`${nombre} inaccesible`);
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
      data: dataCategorias,
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
          targets: 1,
        },
        {
          className: 'dtr-description',
          orderable: false,
          targets: 3,
          render: data => '<div class="scroll-y">' + data + '</div>'
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
        $$tableNuevo.show('fast');
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
      let val = inputNuevoNombre.value;
      if (!uniqueNombre.has(val?.toLowerCase()))
        return inputNuevoNombre.except = null;
      inputNuevoNombre.except = `El Nombre '${val}' ya existe.`;
      ev && formError(inputNuevoNombre.except, inputNuevoNombre.parentNode);
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

      inputNuevoText.forEach(i => {
        let column = i.getAttribute('name');
        let value = i.value;
        if (!value) return formError(`Se requiere un valor para ${column}`, i.parentNode);
        jsonData[column] = value;
      })

      jsonData.estado = inputNuevoCheckbox.checked ? 1 : 0;

      let resUsuarios = await query.post.json.cookie("/api/categorias/table/insert", jsonData);

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
      let row = $table.get('#' + id);

      inputEditarNombre.placeholder
        = inputEditarNombre.beforeValue
        = inputEditarNombre.value
        = row.nombre;

      inputEditarDescripcion.placeholder
        = inputEditarDescripcion.beforeValue
        = inputEditarDescripcion.value
        = row.descripcion;

      inputEditarHidden.value = row.id;
    }))

    /* 
      ==================================================
      ================== UNIQUE EDITAR ==================
      ==================================================
    */

    inputEditarNombre.addEventListener('input', () => {
      let val = inputEditarNombre.value;
      if (inputEditarNombre.beforeValue == val || !uniqueNombre.has(val?.toLowerCase()))
        return inputEditarNombre.except = null;
      inputEditarNombre.except = `El Nombre '${val}' ya existe.`;
      ev && formError(inputEditarNombre.except, inputEditarNombre.parentNode);
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

      let id = inputEditarHidden.value;
      jsonData.id = id;

      inputEditarText.forEach(i => {
        let column = i.getAttribute('name');
        let value = i.value;
        if (!value) return formError(`Se requiere un valor para ${column}`, i.parentNode);
        jsonData[column] = value;
      })

      let resUsuarios = await query.post.json.cookie("/api/categorias/table/updateId", jsonData);

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
            let resCategorias = await query.post.json.cookie("/api/categorias/table/deleteId", { id });

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

    socket.on('/categorias/data/insert', data => {
      let row = $table.get('#' + data.id);
      if (row) return;

      $table.add({
        id: data.id,
        estado: data.estado,
        nombre: data.nombre,
        codigo: data.codigo,
        descripcion: data.descripcion,
        creacion: formatTime('YYYY-MM-DD hh:mm:ss'),
        producto_cantidad: 0
      });
      uniqueNombre.add(data.nombre?.toLowerCase());
    })

    socket.on('/categorias/data/updateId', data => {
      let row = $table.get('#' + data.id);
      if (!row) return;

      $table.update('#' + data.id, {
        nombre: data.nombre,
        descripcion: data.descripcion
      });
      uniqueNombre.delete(row.nombre?.toLowerCase());
      uniqueNombre.add(data.nombre?.toLowerCase());

      let menuEditarid = $table.selected();
      if (menuEditarid && menuEditarid == data.id)
        tblEditar?.[0]?.click();
    })

    socket.on('/categorias/data/state', data => {
      let row = $table.get('#' + data.id);
      if (!row) return;

      $table.update('#' + data.id, {
        estado: data.estado,
      });
    })

    socket.on('/categorias/data/deleteId', data => {
      let row = $table.get('#' + data.id);
      if (!row) return;
      uniqueNombre.delete(row.nombre?.toLowerCase());
      $table.remove('#' + data.id);
    })

  } catch ({ message, stack }) {
    socket.emit('/err/client', { message, stack, url: window.location.href })
  }
})