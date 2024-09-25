$('.content-body').ready(async () => {

  /* 
    ==================================================
    =================== QUERY DATA ===================
    ==================================================
  */

  let resAccesoTbl = await query.post.cookie("/api/acceso/table/readAll");
  /** @typedef {{agregar:number, editar:number, eliminar:number, exportar:number, ocultar:number, ver:number}} PERMISOS */
  /** @type {{err: string, OkPacket: import('mysql').OkPacket, list: {[column:string]: string|number}[], permisos: PERMISOS}} */
  let { list: dataAcceso, uniques: uniquesAcceso, permisos: permisosAcceso } = await resAccesoTbl.json();

  let uniqueMenuRuta = new Set(uniquesAcceso.map(({ ruta }) => ruta?.toLowerCase()));

  /* 
    ==================================================
    ================== VARIABLES DOM ==================
    ==================================================
  */

  let menuSide = document.querySelector('.menu-side');

  let tableNuevo = document.getElementById('table-nuevo');
  let inputNuevoText = tableNuevo?.querySelectorAll('.input-box input[type=text]');
  let inputTableNuevo = tableNuevo?.querySelector('.table-acceso-side');
  let tableCheckNuevo = tableNuevo?.querySelectorAll('tbody tr')
  let btnNuevo = tableNuevo?.querySelector('.btn-success');
  let btnNuevoTodo = tableNuevo?.querySelector('.btn-info');
  let checkDisabledNuevo = tableNuevo?.querySelector('#check-disabled');

  let tableEditar = document.getElementById('table-editar');
  let inputEditarText = tableEditar?.querySelectorAll('.input-box input[type=text]');
  let inputTableEditar = tableEditar?.querySelector('.table-acceso-side');
  let tableCheckEditar = tableEditar?.querySelectorAll('tbody tr')
  let btnEditar = tableEditar?.querySelector('.btn-success');
  let btnEditarTodo = tableEditar?.querySelector('.btn-info');
  let checkDisabledEditar = tableEditar?.querySelector('#check-disabled');

  let $table = new Tables('#table-main');

  /* 
    ==================================================
    ===================== ESTADO =====================
    ==================================================
  */

  /** @type {(this:HTMLInputElement, id: number,inputs: HTMLInputElement[])=>void} */
  async function updatePermisoId(id, inputs) {
    let value = 0;

    inputs.forEach(c => { if (!c.disabled && c.checked) value += c.increment })

    this.disabled = true;

    let resAcceso = await query.post.json.cookie("/api/acceso/table/updatePermisoId", { id, value });

    /** @type {{err: string, OkPacket: import('mysql').OkPacket, list:{[column:string]: string|number}[]}} */
    let { err } = await resAcceso.json();

    if (err) {
      this.checked = !this.checked;
      alarm.error(`${id} inaccesible`);
      return
    }

    if (this.checked)
      alarm.success(`${id} activado`);
    else
      alarm.success(`${id} desactivado`);

    this.disabled = false;
  }

  let constructorCheckBox = d => {
    let iVer = document.createElement('input');
    let iAgregar = document.createElement('input');
    let iEditar = document.createElement('input');
    let iEliminar = document.createElement('input');
    let iOcultar = document.createElement('input');
    let iExportar = document.createElement('input');

    iVer.classList.add('check-checked');
    iAgregar.classList.add('check-checked');
    iEditar.classList.add('check-checked');
    iEliminar.classList.add('check-checked');
    iOcultar.classList.add('check-checked');
    iExportar.classList.add('check-checked');

    iVer.setAttribute('type', 'checkbox');
    iAgregar.setAttribute('type', 'checkbox');
    iEditar.setAttribute('type', 'checkbox');
    iEliminar.setAttribute('type', 'checkbox');
    iOcultar.setAttribute('type', 'checkbox');
    iExportar.setAttribute('type', 'checkbox');

    iVer.increment = 1;
    iAgregar.increment = 2;
    iEditar.increment = 4;
    iEliminar.increment = 8;
    iOcultar.increment = 16;
    iExportar.increment = 32;

    if (permisosAcceso.editar) {
      let inputs = [iVer, iAgregar, iEditar, iEliminar, iOcultar, iExportar];

      if (d.permiso_ver != -1)
        iVer.addEventListener('change', updatePermisoId.bind(iVer, d.id, inputs)),
          iVer.checked = d.permiso_ver;
      else
        iVer.disabled = true;

      if (d.permiso_agregar != -1)
        iAgregar.addEventListener('change', updatePermisoId.bind(iAgregar, d.id, inputs)),
          iAgregar.checked = d.permiso_agregar;
      else
        iAgregar.disabled = true;

      if (d.permiso_editar != -1)
        iEditar.addEventListener('change', updatePermisoId.bind(iEditar, d.id, inputs)),
          iEditar.checked = d.permiso_editar;
      else
        iEditar.disabled = true;

      if (d.permiso_eliminar != -1)
        iEliminar.addEventListener('change', updatePermisoId.bind(iEliminar, d.id, inputs)),
          iEliminar.checked = d.permiso_eliminar;
      else
        iEliminar.disabled = true;

      if (d.permiso_ocultar != -1)
        iOcultar.addEventListener('change', updatePermisoId.bind(iOcultar, d.id, inputs)),
          iOcultar.checked = d.permiso_ocultar;
      else
        iOcultar.disabled = true;

      if (d.permiso_exportar != -1)
        iExportar.addEventListener('change', updatePermisoId.bind(iExportar, d.id, inputs)),
          iExportar.checked = d.permiso_exportar;
      else
        iExportar.disabled = true;

    }
    else {
      iVer.disabled = true;
      iAgregar.disabled = true;
      iEditar.disabled = true;
      iEliminar.disabled = true;
      iOcultar.disabled = true;
      iExportar.disabled = true;

      iVer.checked = d.permiso_ver;
      iAgregar.checked = d.permiso_agregar;
      iEditar.checked = d.permiso_editar;
      iEliminar.checked = d.permiso_eliminar;
      iOcultar.checked = d.permiso_ocultar;
      iExportar.checked = d.permiso_exportar;
    }


    d.permiso_ver = iVer;
    d.permiso_agregar = iAgregar;
    d.permiso_editar = iEditar;
    d.permiso_eliminar = iEliminar;
    d.permiso_ocultar = iOcultar;
    d.permiso_exportar = iExportar;
  }
  dataAcceso.forEach(constructorCheckBox);

  /* 
    ==================================================
    ==================== DATATABLE ====================
    ==================================================
  */

  $table.init({
    data: dataAcceso,
    pageLength: 100,
    select: {
      style: 'single'
    },
    order: [[6, 'asc']],
    columnDefs: [
      {
        className: 'dtr-control',
        orderable: false,
        targets: 0,
      },
      {
        className: 'dtr-control',
        orderable: false,
        targets: 1,
      },
      {
        className: 'dtr-control',
        orderable: false,
        targets: 2,
      },
      {
        className: 'dtr-control',
        orderable: false,
        targets: 3,
      },
      {
        className: 'dtr-control',
        orderable: false,
        targets: 4,
      }
      ,
      {
        className: 'dtr-control',
        orderable: false,
        targets: 5,
      }
    ],
    columns: [
      { data: 'permiso_ver' },
      { data: 'permiso_agregar' },
      { data: 'permiso_editar' },
      { data: 'permiso_eliminar' },
      { data: 'permiso_ocultar' },
      { data: 'permiso_exportar' },
      { data: 'menu_ruta' },
      { data: 'menu_principal' },
      { data: 'rol_nombre' },
    ],
  })
  $table.buttons();

  /* 
    ==================================================
    ================ EXISTET MENU SIDE ================
    ==================================================
  */

  if (menuSide) {

    /* 
      ==================================================
      ================= DISABLED INPUT =================
      ==================================================
    */

    /** @type {(([HTMLInputElement, HTMLInputElement, number, string])[])[]} */
    let checkTableNuevo = [];
    tableCheckNuevo?.forEach(tr => {
      let row = [];
      tr.querySelectorAll('.checked').forEach((td, b) => {
        let [d, p] = td.children;
        d.addEventListener('change', () => {
          if (!d.checked)
            return p.disabled = false;
          p.checked = false;
          p.disabled = true;
        })

        row.push([p, d, 2 ** b, td.getAttribute('column')]);
      })
      row.rol_id = Number(tr.getAttribute('rol_id'));
      row.rol_nombre = tr.getAttribute('rol_nombre');
      checkTableNuevo.push(row);
    })

    /** @type {{rol_id:number, rol_nombre:string, permiso:([HTMLInputElement, HTMLInputElement, number, string])[]}[]} */
    let checkTableEditar = [];
    tableCheckEditar?.forEach(tr => {
      let row = { permiso: [] };
      tr.querySelectorAll('.checked').forEach((td, b) => {
        let [d, p] = td.children;
        d.addEventListener('change', _ => {
          if (!d.checked)
            return p.disabled = false;
          p.checked = false;
          p.disabled = true;
        })

        row.permiso.push([p, d, 2 ** b, td.getAttribute('column')]);
      })
      row.rol_nombre = tr.getAttribute('rol_nombre');

      let rol_id = row.rol_id = Number(tr.getAttribute('rol_id'));
      checkTableEditar[rol_id] = row;
    })

    /* 
      ==================================================
      ====================== MENU ======================
      ==================================================
    */

    let toggleMenu = {
      now: 'table',
      nuevo() {
        this.emptyNuevo();
        menuSide.style.display = '';
        tableNuevo && (tableNuevo.style.display = '');
        tableEditar && (tableEditar.style.display = 'none');
        this.now = 'nuevo';
      },
      editar() {
        this.emptyEditar();
        menuSide.style.display = '';
        tableNuevo && (tableNuevo.style.display = 'none');
        tableEditar && (tableEditar.style.display = '');
        this.now = 'editar';
      },
      close() {
        menuSide.style.display = 'none';
        tableNuevo && (tableNuevo.style.display = 'none') && this.emptyNuevo();;
        tableEditar && (tableEditar.style.display = 'none') && this.emptyEditar();;
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
        inputNuevoText && (inputNuevoText[0].value = '') && (inputNuevoText[1].value = '');
        checkTableNuevo.forEach(tr => tr.forEach(([p, d]) => p.disabled = p.checked = d.checked = false));
      },
      emptyEditar() {
        if (this.now != 'editar') return;
        inputEditarText && (inputEditarText[0].value = '') && (inputEditarText[1].value = '');
        checkTableEditar.forEach(tr => tr.permiso.forEach(([p, d]) => p.disabled = p.checked = d.checked = false));
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

    if (permisosAcceso.agregar) {

      btnNuevoTodo && btnNuevoTodo
        .addEventListener('click', () => {
          if (inputTableNuevo.getAttribute('option') == 'permiso')
            checkTableNuevo.forEach(tr => tr.forEach(([p, d]) => {
              p.checked = true
              p.disabled = d.checked = false;
            }));
          else
            checkTableNuevo.forEach(tr => tr.forEach(([p, d]) => {
              p.checked = false
              p.disabled = d.checked = true;
            }));
        });

      let [inputNuevoPrincipal, inputNuevoRuta] = inputNuevoText;

      checkDisabledNuevo.addEventListener(
        'change',
        () => checkDisabledNuevo.checked
          ? inputTableNuevo.setAttribute('option', 'disabled')
          : inputTableNuevo.setAttribute('option', 'permiso')
      )

      /* 
        ==================================================
        ================= UNIQUE AGREGAR =================
        ==================================================
      */

      inputNuevoRuta.addEventListener('input', () => {
        let val = inputNuevoRuta.value;
        if (!uniqueMenuRuta.has(val?.toLowerCase()))
          return inputNuevoRuta.except = null;
        inputNuevoRuta.except = `El usuario '${val}' ya existe.`;
        formError(inputNuevoRuta.except, inputNuevoRuta.parentNode);
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
        let jsonData = { accesoData: [] };
        let principal = jsonData.principal = inputNuevoPrincipal.value;
        if (!principal) return formError(`Se requiere un valor para Principal`, inputNuevoPrincipal.parentNode);

        if (inputNuevoRuta.except) return formError(inputNuevoRuta.except, inputNuevoRuta.parentNode);
        let ruta = jsonData.ruta = inputNuevoRuta.value;
        if (!ruta) return formError(`Se requiere un valor para la Ruta`, inputNuevoRuta.parentNode);

        checkTableNuevo.forEach(tr => {
          let rol_id = tr.rol_id
          let data = {
            rol_id: rol_id,
            permiso_id: 0,
            disabled_id: 0,
            menu_principal: principal,
            menu_ruta: ruta,
            rol_nombre: rol_id + tr.rol_nombre,
          };

          tr.forEach(([p, d, increment, column]) => {
            if (d.checked) return data[column] = -1, data.disabled_id += increment;
            if (p.checked) return data[column] = 1, data.permiso_id += increment;
            data[column] = 0;
          })

          jsonData.accesoData.push(data);
        })

        let resAccesoInsert = await query.post.json.cookie("/api/acceso/table/insert", jsonData);

        /** @type {{err: string, OkPacket: import('mysql').OkPacket, modifiedData:{[column:string]: string|number}[]}} */
        let { err, modifiedData } = await resAccesoInsert.json();

        if (err)
          return alarm.warn('No se pudo agregar')

        modifiedData.forEach(constructorCheckBox);

        $table.add(...modifiedData);

        uniqueMenuRuta.add(ruta?.toLowerCase());

        alarm.success(`Filas Agregadas`);
      })
    };

    /* 
      ==================================================
      ================= PERMISO EDITAR =================
      ==================================================
    */

    if (permisosAcceso.editar) {

      btnEditarTodo && btnEditarTodo
        .addEventListener('click', () => {
          if (inputTableEditar.getAttribute('option') == 'permiso')
            checkTableEditar.forEach(tr => tr.permiso.forEach(([p, d]) => {
              p.checked = true
              p.disabled = d.checked = false;
            }));
          else
            checkTableEditar.forEach(tr => tr.permiso.forEach(([p, d]) => {
              p.checked = false
              p.disabled = d.checked = true;
            }));
        });

      let [inputEditarPrincipal, inputEditarRuta] = inputEditarText;

      checkDisabledEditar.addEventListener(
        'change',
        () => checkDisabledEditar.checked
          ? inputTableEditar.setAttribute('option', 'disabled')
          : inputTableEditar.setAttribute('option', 'permiso')
      )

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

        let resUsuarios = await query.post.json.cookie("/api/acceso/table/readId", { id });

        /** @type {{err: string, OkPacket: import('mysql').OkPacket, list: {[column:string]: string|number}[]}} */
        let { list } = await resUsuarios.json();

        inputEditarPrincipal.value = list[0].menu_principal;

        inputEditarRuta.value = list[0].menu_ruta;
        inputEditarRuta.beforeValue = list[0].menu_ruta;

        list.forEach(column => {
          /** @type {number} */
          let rol_id = column.rol_id;
          let row = checkTableEditar[rol_id];

          row.permiso.forEach(([p, d, i, c]) => {
            let permiso = column[c]
            if (permiso == -1)
              return d.checked = 1, d.dispatchEvent(new Event('change'));
            d.checked = 0, d.dispatchEvent(new Event('change'));
            if (permiso == 1)
              return p.checked = 1;
            p.checked = 0;
          })
        })

        let menu_id = list[0].menu_id;
        let accesoRol = {};
        list.forEach(({ rol_id, id }) => accesoRol[rol_id] = id)
        btnEditar.memory = { menu_id, accesoRol };
      }))

      /* 
        ==================================================
        ================== UNIQUE EDITAR ==================
        ==================================================
      */

      inputEditarRuta.addEventListener('input', () => {
        let val = inputEditarRuta.value;
        if (inputEditarRuta.beforeValue == val || !uniqueMenuRuta.has(val?.toLowerCase()))
          return inputEditarRuta.except = null;
        inputEditarRuta.except = `El usuario '${val}' ya existe.`;
        formError(inputEditarRuta.except, inputEditarRuta.parentNode);
      })

      /* 
        ==================================================
        =================== EDITAR DATA ===================
        ==================================================
      */

      btnEditar.addEventListener('click', async () => {
        let jsonData = { accesoData: [], menuData: {} };

        let { menu_id, accesoRol } = btnEditar.memory;
        jsonData.menuData.id = menu_id;

        let principal = jsonData.menuData.principal = inputEditarPrincipal.value;
        if (!principal) return formError(`Se requiere un valor para Principal`, inputEditarPrincipal.parentNode);

        if (inputEditarRuta.except) return formError(inputEditarRuta.except, inputEditarRuta.parentNode);
        let ruta = jsonData.menuData.ruta = inputEditarRuta.value;
        if (!ruta) return formError(`Se requiere un valor para la Ruta`, inputEditarRuta.parentNode);

        checkTableEditar.forEach(tr => {
          let rol_id = tr.rol_id
          let data = {
            id: accesoRol[rol_id],
            rol_id: rol_id,
            permiso_id: 0,
            disabled_id: 0,
            menu_id,
            menu_principal: principal,
            menu_ruta: ruta,
            rol_nombre: rol_id + tr.rol_nombre,
          };

          tr.permiso.forEach(([p, d, increment, column]) => {
            if (d.checked) return data[column] = -1, data.disabled_id += increment;
            if (p.checked) return data[column] = 1, data.permiso_id += increment;
            data[column] = 0;
          })

          jsonData.accesoData.push(data);
        })

        let resAccesoUpdate = await query.post.json.cookie("/api/acceso/table/updateId", jsonData);

        /** @type {{err: string, OkPacket: import('mysql').OkPacket, list:{[column:string]: string|number}[]}} */
        let { err, OkPacket } = await resAccesoUpdate.json();

        if (err)
          return alarm.warn('No se pudo agregar')

        jsonData.accesoData.forEach(data => {
          constructorCheckBox(data);

          $table.update('#' + data.id, data)
        });

        if (inputEditarRuta.beforeValue?.toLowerCase() != ruta?.toLowerCase()) {
          uniqueMenuRuta.delete(inputEditarRuta.beforeValue?.toLowerCase());
          uniqueMenuRuta.add(ruta?.toLowerCase());
        }

        alarm.success(`Filas actualizadas`);
      })
    }
  }

  /* 
    ==================================================
    ================ PERMISO ELIMINAR ================
    ==================================================
  */

  if (permisosAcceso.eliminar) {

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
            let resUsuarios = await query.post.json.cookie("/api/acceso/table/deleteId", { id });

            /** @type {{err: string, OkPacket: import('mysql').OkPacket, list: {[column:string]: string|number}[]}} */
            let { err, list } = await resUsuarios.json();

            if (err)
              return alarm.error(`Filas no Eliminada`);

            let dataBefore = $table.get('#' + id)

            uniqueMenuRuta.delete(dataBefore.menu_ruta?.toLowerCase());

            $table.remove(...list.map(({ id }) => '#' + id));
            alarm.success(`Fila eliminada`);
          }
        });
    }))
  }
})