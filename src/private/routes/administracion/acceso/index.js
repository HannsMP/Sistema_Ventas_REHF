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

    let $cardAccesos = $('#card-accesos');
    let cardAccesos = $cardAccesos[0];

    let tblclose = document.querySelectorAll('#table-nuevo .card-close ,#table-editar .card-close');
    let tblNuevo = cardMain.querySelectorAll('.tbl-nuevo');
    let tblEditar = cardMain.querySelectorAll('.tbl-editar');
    let tblEliminar = cardMain.querySelectorAll('.tbl-eliminar');
    let cardMainDownload = cardMain.querySelector('.download');

    let $tableNuevo = $('#table-nuevo');
    let tableNuevo = $tableNuevo[0];
    /** @type {HTMLInputElement} */
    let inputNuevoPrincipal = document.getElementById('nuevo-principal');
    /** @type {HTMLInputElement} */
    let inputNuevoRuta = document.getElementById('nuevo-ruta');
    /** @type {HTMLAnchorElement} */
    let btnNuevo = tableNuevo?.querySelector('.btn-success');
    /** @type {HTMLAnchorElement} */

    let $tableEditar = $('#table-editar');
    let tableEditar = $tableEditar[0];
    let checkDisabledPermisos = document.getElementById('check-disabled');

    let currentMenuId = 0;
    /** @type {HTMLInputElement} */
    let inputEditarPrincipal = document.getElementById('editar-principal');
    /** @type {HTMLInputElement} */
    let inputEditarRuta = document.getElementById('editar-ruta');
    /** @type {HTMLAnchorElement} */
    let btnEditar = tableEditar.querySelector('.btn-success');

    let $table = new Tables('#table-main');
    let $tablePermisos = new Tables('#table-accesos');

    /*
      ==================================================
      ===================== ESTADO =====================
      ==================================================
    */

    /** @type {(this:HTMLInputElement, data:{id:number})=>void} */
    async function updatePermisoId(dataRow) {
      this.disabled = true;
      let estado = this.checked;

      socket.emit('/updateId/accesos', dataRow, err => {
        if (err) {
          this.checked = !estado;
          return alarm.error(err);
        }

        if (estado)
          alarm.success(`${dataRow.rol_nombre} activado`);
        else
          alarm.success(`${dataRow.rol_nombre} desactivado`);

        this.disabled = false;
      })
    }

    let createCell = (data, row, name) => {
      let div = document.createElement('div');
      div.innerHTML = `<input name="disabled" class="check-checked check-danger" type="checkbox"><input name="permiso" class="check-checked" type="checkbox">`;
      div.className = 'checked';
      let [inputDisabled, inputState] = div.querySelectorAll('input');
      if (permiso.ocultar) {
        if (data == -1)
          inputDisabled.checked = inputState.disabled = true;
        else
          inputState.checked = data;

        inputDisabled.addEventListener('change', e => {
          row[name] = inputDisabled.checked ? -1 : 0;
          updatePermisoId.call(inputDisabled, row);
          e.stopPropagation();
        });
        inputState.addEventListener('change', e => {
          row[name] = inputState.checked ? 1 : 0;
          updatePermisoId.call(inputState, row);
          e.stopPropagation();
        });
      }
      else {
        inputState.checked = data == 1;
        inputState.disabled = true;
      }
      return div;
    }
    /*
      ==================================================
      ==================== DATATABLE ====================
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
          name: 'principal',
          className: 'dtr-tag',
          targets: 0,
          render: data => `<div>${data}</div>`
        },
        {
          name: 'ruta',
          className: 'dtr-code',
          targets: 1
        }
      ],
      columns: [
        { data: 'principal' },
        { data: 'ruta' }
      ],
    })
    if (permiso.exportar) $table.buttons();
    else cardMainDownload.innerHTML = '';

    $tablePermisos.init({
      pageLength: 10,
      order: [[0, 'asc']],
      columnDefs: [
        {
          className: 'dtr-code',
          targets: 0,
        },
        {
          className: 'dtr-tag',
          targets: 1,
          render: data => `<div>${data}</div>`
        },
        {
          className: 'dtr-control',
          orderable: false,
          targets: 2,
          render: (d, _, r) => createCell(d, r, 'permiso_ver')
        },
        {
          className: 'dtr-control',
          orderable: false,
          targets: 3,
          render: (d, _, r) => createCell(d, r, 'permiso_agregar')
        },
        {
          className: 'dtr-control',
          orderable: false,
          targets: 4,
          render: (d, _, r) => createCell(d, r, 'permiso_editar')
        },
        {
          className: 'dtr-control',
          orderable: false,
          targets: 5,
          render: (d, _, r) => createCell(d, r, 'permiso_eliminar')
        },
        {
          className: 'dtr-control',
          orderable: false,
          targets: 6,
          render: (d, _, r) => createCell(d, r, 'permiso_ocultar')
        },
        {
          className: 'dtr-control',
          orderable: false,
          targets: 7,
          render: (d, _, r) => createCell(d, r, 'permiso_exportar')
        },
      ],
      columns: [
        { data: 'rol_id' },
        { data: 'rol_nombre' },
        { data: 'permiso_ver' },
        { data: 'permiso_agregar' },
        { data: 'permiso_editar' },
        { data: 'permiso_eliminar' },
        { data: 'permiso_ocultar' },
        { data: 'permiso_exportar' },
      ],
    }, false)

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
        this.cardAccesos();
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
        inputNuevoPrincipal.value = '';
        inputNuevoRuta.value = '';
      },
      emptyEditar() {
        if (this.now != 'editar') return;
        inputEditarPrincipal.value = '';
        inputEditarRuta.value = '';
      },

      cardAccesos(state) {
        if (state) {
          this.close();
          $cardAccesos.show('fast');
          sideContent.scrollTop = cardAccesos.offsetTop - sideContent.offsetTop - 100;
        }
        else {
          currentMenuId = 0;
          $cardAccesos.hide('fast');
        }
      }
    }

    $table.datatable.on('select', (e, dt, type, indexes) => {
      let data = $table.datatable.rows(indexes).data().toArray()[0];

      socket.emit('/read/accesos', data.id, dataVentas => {
        $tablePermisos.data(dataVentas);
        toggleMenu.cardAccesos(true);
      })
    })
    $table.datatable.on('deselect', _ => {
      $tablePermisos.data([]);
      toggleMenu.close();
    })

    $table.datatable.on('search', _ => {
      toggleMenu.close();
    })

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

    inputNuevoRuta.addEventListener('input', () => {
      let value = inputNuevoRuta.value;
      socket.emit(
        '/read/unic',
        { column: 'ruta', value },
        res => {
          if (res)
            return inputNuevoRuta.except = null;
          inputNuevoRuta.except = `La ruta '${value}' ya existe.`;
          formError(inputNuevoRuta.except, inputNuevoRuta);
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
      if (inputNuevoRuta.except) return formError(inputNuevoRuta.except, inputNuevoRuta);

      let jsonData = {};

      let principalValue = inputNuevoPrincipal.value;
      if (!principalValue) return formError(`Se requiere un valor para Principal`, inputNuevoPrincipal);
      jsonData.principal = principalValue;

      let rutaValue = inputNuevoRuta.value;
      if (!rutaValue) return formError(`Se requiere un valor para la Ruta`, inputNuevoRuta);
      jsonData.ruta = rutaValue;

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
      ================ DRAW ALL CHECKBOX ================
      ==================================================
    */

    checkDisabledPermisos.addEventListener(
      'change',
      () => checkDisabledPermisos.checked
        ? $tablePermisos.table.setAttribute('option', 'disabled')
        : $tablePermisos.table.setAttribute('option', 'permiso')
    )

    /*
      ==================================================
      ================ VALID CHANGE DATA ================
      ==================================================
    */

    let validChangeData = () => {
      let valid = false;
      valid ||= inputEditarPrincipal.value != inputEditarPrincipal.currentValue;
      valid ||= inputEditarRuta.value != inputEditarRuta.currentValue;

      valid
        ? btnEditar.classList.remove('disabled')
        : btnEditar.classList.add('disabled');
    }

    inputEditarPrincipal.addEventListener('input', validChangeData);
    inputEditarRuta.addEventListener('input', validChangeData);

    /*
      ==================================================
      =================== OPEN EDITAR ===================
      ==================================================
    */

    let defaultEditar = data => {
      inputEditarPrincipal.currentValue
        = inputEditarPrincipal.placeholder
        = data.principal;

      inputEditarRuta.currentValue
        = inputEditarRuta.placeholder
        = data.ruta;
    }

    let setterEditar = data => {
      currentMenuId = data.id;

      inputEditarPrincipal.value
        = data.principal;

      inputEditarRuta.value
        = data.ruta;

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

    inputEditarRuta.addEventListener('input', () => {
      let value = inputEditarRuta.value;
      socket.emit(
        '/read/unic',
        { column: 'ruta', value, currentMenuId },
        res => {
          if (res)
            return inputEditarRuta.except = null;
          inputEditarRuta.except = `La ruta '${value}' ya existe.`;
          formError(inputEditarRuta.except, inputEditarRuta);
        }
      )
    })

    /*
      ==================================================
      =================== EDITAR DATA ===================
      ==================================================
    */

    btnEditar.addEventListener('click', async () => {
      if (inputEditarRuta.except) return formError(inputEditarRuta.except, inputEditarRuta);

      let jsonData = {};

      jsonData.id = currentMenuId;

      let principalValue = inputEditarPrincipal.value;
      if (!principalValue) return formError(`Se requiere un valor para Principal`, inputEditarPrincipal);
      jsonData.principal = principalValue;

      let rutaValue = inputEditarRuta.value;
      if (!rutaValue) return formError(`Se requiere un valor para la Ruta`, inputEditarRuta);
      jsonData.ruta = rutaValue;

      socket.emit('/updateId/table', jsonData, err => {
        if (err)
          return alarm.warn(err)

        alarm.success(`Filas Agregada`);
        toggleMenu.close();
        $table.datatable.rows().deselect();
      })
    });

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

    let deleteMenu = () => {
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
    }

    document.addEventListener('keydown', ({ key }) => key == 'Delete' && deleteMenu());
    tblEliminar.forEach(btn => btn.addEventListener('click', deleteMenu))

    /*
      ==================================================
      ===================== SOCKET =====================
      ==================================================
    */

    socket.on('/menu/data/insert', () => {
      $table.datatable.draw();
    })

    socket.on('/menu/data/updateId', async data => {
      if (currentMenuId == data.id) {
        defaultEditar(data);
        validChangeData();
      }
      if (!$table.get('#' + data.id)) return;
      $table.datatable.draw();
    })

    socket.on('/menu/data/deleteId', data => {
      if (!$table.get('#' + data.id)) return;
      $table.datatable.draw();
    })

    socket.on('/accesos/permisos/state', data => {
      let row = $tablePermisos.get('#' + data.id);
      if (!row) return;

      $tablePermisos.update('#' + data.id, data);
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
        permiso.ocultar = data.permiso_ocultar;
        $table.datatable.rows().invalidate().draw();
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