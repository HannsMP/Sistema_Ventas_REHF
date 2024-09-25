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
    let { list: dataCategorias, permisos: permisosCategorias } = await resCategoriasTbl.json();

    let uniqueNombre = new Set(dataCategorias.map(({ nombre }) => nombre.toLowerCase()));

    /* 
      ==================================================
      ================== VARIABLES DOM ==================
      ==================================================
    */

    let menuSide = document.querySelector('.menu-side');

    let $tableNuevo = $('#table-nuevo');
    let tableNuevo = $tableNuevo[0];
    let inputNuevoText = tableNuevo.querySelectorAll('input[type=text], textarea');
    let inputNuevoCheckbox = tableNuevo.querySelector('input[type=checkbox]');
    let btnNuevo = tableNuevo.querySelector('.btn');

    let $tableEditar = $('#table-editar');
    let tableEditar = $tableEditar[0];
    let inputEditarHidden = tableEditar.querySelector('input[type=hidden]');
    let inputEditarText = tableEditar.querySelectorAll('input[type=text], textarea');
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

    dataCategorias.forEach(d => {
      d.descripcion = '<div class="scroll-y">' + d.descripcion + '</div>';
    })

    if (permisosCategorias.ocultar) {

      dataCategorias.forEach(d => {
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
      $table.buttons();
    }
    else {

      /* 
        ==================================================
        ==================== DATATABLE ====================
        ==================================================
      */

      $table.init({
        data: dataCategorias,
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
          }
        ],
        columns: [
          { data: 'codigo' },
          { data: 'nombre' },
          { data: 'descripcion' },
          { data: 'creacion' },
          { data: 'producto_cantidad' }
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

      let tblclose = document.querySelectorAll('#table-nuevo .card-close ,#table-editar .card-close');
      tblclose.forEach(btn => btn.addEventListener('click', () => toggleMenu.close()));

      /* 
        ==================================================
        ================= PERMISO AGREGAR =================
        ==================================================
      */

      if (permisosCategorias.agregar) {

        /* 
          ==================================================
          ================= UNIQUE AGREGAR =================
          ==================================================
        */

        let inputNuevoNombre = inputNuevoText[0];
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

        let tblNuevo = document.querySelectorAll('.tbl-nuevo');
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

      }

      /* 
        ==================================================
        ================= PERMISO EDITAR =================
        ==================================================
      */

      if (permisosCategorias.editar) {

        /* 
          ==================================================
          =================== OPEN EDITAR ===================
          ==================================================
        */

        let inputEditarNombre = inputEditarText[0];
        let inputEditarDescripcion = inputEditarText[1];

        let tblEditar = document.querySelectorAll('.tbl-editar');
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
            = row.descripcion.replace(/<div class="scroll-y">([\s\S]*?)<\/div>/, (_, p) => p);

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
        })
      }
    }
    /* 
      ==================================================
      ================ PERMISO ELIMINAR ================
      ==================================================
    */

    if (permisosCategorias.eliminar) {

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
              let resCategorias = await query.post.json.cookie("/api/categorias/table/deleteId", { id });

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

    socket.on('/categorias/data/insert', data => {
      let row = $table.get('#' + data.id);
      if (row) return;
      let i = document.createElement('input');
      i.classList.add('check-switch');
      i.setAttribute('type', 'checkbox');
      i.addEventListener('change', updateIdState.bind(i, { nombre: data.nombre, id: data.id }));
      i.checked = data.estado;

      $table.add({
        id: data.id,
        estado: i,
        nombre: data.nombre,
        codigo: data.codigo,
        descripcion: '<div class="scroll-y">' + data.descripcion + '</div>',
        creacion: formatTime('YYYY-MM-DD hh:mm:ss'),
        producto_cantidad: 0
      });
      uniqueNombre.add(data.nombre?.toLowerCase());
    })

    let tblEditar = document.querySelectorAll('.tbl-editar');
    socket.on('/categorias/data/updateId', data => {
      let row = $table.get('#' + data.id);
      $table.update('#' + data.id, {
        nombre: data.nombre,
        descripcion: '<div class="scroll-y">' + data.descripcion + '</div>'
      });
      uniqueNombre.delete(row.nombre?.toLowerCase());
      uniqueNombre.add(data.nombre?.toLowerCase());

      let menuEditarid = $table.selected();
      if (menuEditarid && menuEditarid == data.id)
        tblEditar?.[0]?.click();
    })

    socket.on('/categorias/data/state', data => {
      let row = $table.get('#' + data.id);
      if (row?.estado) row.estado.checked = data.estado;
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