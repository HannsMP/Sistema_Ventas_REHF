$('.content-body').ready(async () => {
  try {
    /* 
      ==================================================
      =================== QUERY DATA ===================
      ==================================================
    */

    let resClientesTbl = await query.post.cookie("/api/clientes/table/readAll");
    /** @typedef {{agregar:number, editar:number, eliminar:number, exportar:number, ocultar:number, ver:number}} PERMISOS */
    /** @type {{err: string, OkPacket: import('mysql').OkPacket, list: {[column:string]: string|number}[], permisos: PERMISOS}} */
    let { list: dataClientes, permisos: permisosClientes } = await resClientesTbl.json();

    let uniqueTelefono = new Set(dataClientes.map(({ telefono }) => telefono));

    /* 
      ==================================================
      ================== VARIABLES DOM ==================
      ==================================================
    */

    let menuSide = document.querySelector('.menu-side');

    let $tableNuevo = $('#table-nuevo');
    let tableNuevo = $tableNuevo[0];
    let inputNuevoText = tableNuevo.querySelectorAll('input[type=text]');
    let inputNuevoSelector = tableNuevo?.querySelectorAll('input.selector');
    let inputNuevoCheckbox = tableNuevo.querySelector('input[type=checkbox]');
    let btnNuevo = tableNuevo.querySelector('.btn');

    let $tableEditar = $('#table-editar');
    let tableEditar = $tableEditar[0];
    let inputEditarHidden = tableEditar.querySelector('input[type=hidden]');
    let inputEditarText = tableEditar.querySelectorAll('input[type=text]');
    let inputEditarSelector = tableEditar?.querySelectorAll('input.selector');
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

    dataClientes.forEach(d => {
      d.tipo_cliente_nombre = '<div>' + d.tipo_cliente_nombre + '</div>';
      d.tipo_documento_nombre = '<div>' + d.tipo_documento_nombre + '</div>';
    })

    if (permisosClientes.ocultar) {

      dataClientes.forEach(d => {
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
        data: dataClientes,
        select: {
          style: 'single'
        },
        order: [[1, 'asc']],
        columnDefs: [
          {
            className: 'dtr-control',
            orderable: false,
            targets: 0,
          },
          {
            className: 'dtr-tag',
            targets: 2,
          },
          {
            className: 'dtr-tag',
            targets: 5,
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
      $table.buttons();
    }
    else {

      /* 
        ==================================================
        ==================== DATATABLE ====================
        ==================================================
      */

      $table.init({
        data: dataClientes,
        select: {
          style: 'single'
        },
        order: [[0, 'asc']],
        columnDefs: [
          {
            className: 'dtr-tag',
            targets: 1,
          },
          {
            className: 'dtr-tag',
            targets: 4,
          }
        ],
        columns: [
          { data: 'nombres' },
          { data: 'tipo_cliente_nombre' },
          { data: 'telefono' },
          { data: 'direccion' },
          { data: 'tipo_documento_nombre' },
          { data: 'num_documento' },
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

      let resTipoCliente = await query.post.cookie("/api/tipo_cliente/selector/readAll");

      /** @type {{err: string, OkPacket: import('mysql').OkPacket, list: {[column:string]: string|number}[]}} */
      let { list: dataTipoCliente } = await resTipoCliente.json();

      let dataSelectorTipoCliente = new Selector(dataTipoCliente);

      let resTipoDocumento = await query.post.cookie("/api/tipo_documento/selector/readAll");

      /** @type {{err: string, OkPacket: import('mysql').OkPacket, list: {[column:string]: string|number}[]}} */
      let { list: dataTipoDocumento } = await resTipoDocumento.json();

      let dataSelectorTipoDocumento = new Selector(dataTipoDocumento);

      /* 
        ==================================================
        ================== SELECTOR UNIC ==================
        ==================================================
      */

      let [inputNuevoSelectorTipoCliente, inputNuevoSelectorTipoDocumento] = inputNuevoSelector || [];
      let [inputEditarSelectorTipoCliente, inputEditarSelectorTipoDocumento] = inputEditarSelector || [];

      let nuevoSelectorUnicTipoCliente = inputNuevoSelectorTipoCliente
        ? new SelectorUnic(inputNuevoSelectorTipoCliente, dataSelectorTipoCliente) : null;
      let nuevoSelectorUnicTipoDocumento = inputNuevoSelectorTipoDocumento
        ? new SelectorUnic(inputNuevoSelectorTipoDocumento, dataSelectorTipoDocumento) : null;
      let editarSelectorUnicTipoCliente = inputEditarSelectorTipoCliente
        ? new SelectorUnic(inputEditarSelectorTipoCliente, dataSelectorTipoCliente) : null;
      let editarSelectorUnicTipoDocumento = inputEditarSelectorTipoDocumento
        ? new SelectorUnic(inputEditarSelectorTipoDocumento, dataSelectorTipoDocumento) : null;

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

      let tblclose = document.querySelectorAll('#table-nuevo .card-close ,#table-editar .card-close');
      tblclose.forEach(btn => btn.addEventListener('click', () => toggleMenu.close()));

      /* 
        ==================================================
        ================= PERMISO AGREGAR =================
        ==================================================
      */

      if (permisosClientes.agregar) {

        /* 
          ==================================================
          ================= UNIQUE AGREGAR =================
          ==================================================
        */

        let inputNuevoTelefono = inputNuevoText[1];
        inputNuevoTelefono.addEventListener('input', () => {
          let val = inputNuevoTelefono.value;
          if (!uniqueTelefono.has(val?.toLowerCase()))
            return inputNuevoTelefono.except = null;
          inputNuevoTelefono.except = `El Telefono '${val}' ya existe.`;
          formError(inputNuevoTelefono.except, inputNuevoTelefono.parentNode);
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
          jsonData.tipo_cliente_nombre = '<div>' + selectTipoCliente.name + '</div>';


          let selectTipoDocumento = nuevoSelectorUnicTipoDocumento.selected[0];
          if (!selectTipoDocumento) return formError(`Selecciona un Rol`, inputNuevoSelectorTipoDocumento.parentNode);
          jsonData.tipo_documento_id = Number(selectTipoDocumento.id);
          jsonData.tipo_documento_nombre = '<div>' + selectTipoDocumento.name + '</div>';

          jsonData.estado = inputNuevoCheckbox.checked ? 1 : 0;

          let resCliente = await query.post.json.cookie("/api/clientes/table/insert", jsonData);

          /** @type {{err: string, OkPacket: import('mysql').OkPacket, list: {[column:string]: string|number}[]}} */
          let { err } = await resCliente.json();

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

      if (permisosClientes.editar) {

        let inputEditarNombre = inputEditarText[0];
        let inputEditarTelefono = inputEditarText[1];
        let inputEditarDireccion = inputEditarText[2];
        let inputEditarNumDocumento = inputEditarText[3];

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
          let val = inputEditarTelefono.value;
          if (inputEditarTelefono.beforeValue == val || !uniqueTelefono.has(val?.toLowerCase()))
            return inputEditarTelefono.except = null;
          inputEditarTelefono.except = `El Telefono '${val}' ya existe.`;
          formError(inputEditarTelefono.except, inputEditarTelefono.parentNode);
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
          jsonData.tipo_cliente_nombre = selectTipoCliente.name;

          let selectTipoDocumento = editarSelectorUnicTipoDocumento.selected[0];
          if (!selectTipoDocumento) return formError(`Selecciona un Rol`, inputNuevoSelectorTipoDocumento.parentNode);
          jsonData.tipo_documento_id = Number(selectTipoDocumento.id);
          jsonData.tipo_documento_nombre = selectTipoDocumento.name;

          let resCliente = await query.post.json.cookie("/api/clientes/table/updateId", jsonData);

          /** @type {{err: string, OkPacket: import('mysql').OkPacket, list: {[column:string]: string|number}[]}} */
          let { err } = await resCliente.json();

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

    if (permisosClientes.eliminar) {

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
              let resClientes = await query.post.json.cookie("/api/clientes/table/deleteId", { id });

              /** @type {{err: string, OkPacket: import('mysql').OkPacket, list: {[column:string]: string|number}[]}} */
              let { err } = await resClientes.json();

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

    socket.on('/clientes/data/insert', data => {
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
        nombres: data.nombres,
        telefono: data.telefono,
        direccion: data.direccion,
        tipo_cliente_id: data.tipo_cliente_id,
        tipo_cliente_nombre: '<div>' + data.tipo_cliente_nombre + '</div>',
        tipo_documento_id: data.tipo_documento_id,
        tipo_documento_nombre: '<div>' + data.tipo_documento_nombre + '</div>',
        num_documento: data.num_documento,
        creacion: formatTime('YYYY-MM-DD hh:mm:ss')
      });
      uniqueTelefono.add(data.telefono?.toLowerCase());
    })

    let tblEditar = document.querySelectorAll('.tbl-editar');
    socket.on('/clientes/data/updateId', data => {

      let row = $table.get('#' + data.id);
      $table.update('#' + data.id, {
        id: data.id,
        nombres: data.nombres,
        telefono: data.telefono,
        direccion: data.direccion,
        tipo_cliente_id: data.tipo_cliente_id,
        tipo_cliente_nombre: '<div>' + data.tipo_cliente_nombre + '</div>',
        tipo_documento_id: data.tipo_documento_id,
        tipo_documento_nombre: '<div>' + data.tipo_documento_nombre + '</div>',
        num_documento: data.num_documento
      });
      uniqueTelefono.delete(row.telefono?.toLowerCase());
      uniqueTelefono.add(data.telefono?.toLowerCase());

      let menuEditarid = $table.selected();
      if (menuEditarid && menuEditarid == data.id)
        tblEditar?.[0]?.click();
    })

    socket.on('/clientes/data/state', data => {
      let row = $table.get('#' + data.id);
      if (row?.estado) row.estado.checked = data.estado;
    })

    socket.on('/clientes/data/deleteId', data => {
      let row = $table.get('#' + data.id);
      if (!row) return;
      uniqueTelefono.delete(row.telefono?.toLowerCase());
      $table.remove('#' + data.id);
    })

  } catch ({ message, stack }) {
    socket.emit('/err/client', { message, stack, url: window.location.href })
  }
})