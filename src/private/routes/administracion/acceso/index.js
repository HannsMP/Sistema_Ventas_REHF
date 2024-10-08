$('.content-body').ready(async () => {
  try {

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
    let inputNuevoText = tableNuevo?.querySelectorAll('.input-box input[type=text]');
    let inputTableNuevo = tableNuevo?.querySelector('.table-acceso-side');
    let tableCheckNuevo = tableNuevo?.querySelectorAll('tbody tr')
    let btnNuevo = tableNuevo?.querySelector('.btn-success');
    let btnNuevoTodo = tableNuevo?.querySelector('.btn-info');
    let checkDisabledNuevo = tableNuevo?.querySelector('#check-disabled');

    let $tableEditar = $('#table-editar');
    let tableEditar = $tableEditar[0];
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

    /** @type {(this:HTMLInputElement, data:{id:number})=>void} */
    async function updatePermisoId(dataRow) {
      this.disabled = true;

      let resAcceso = await query.post.json.cookie("/api/acceso/table/updatePermisoId", dataRow);

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

    /* 
      ==================================================
      ==================== DATATABLE ====================
      ==================================================
    */

    $table.init({
      data: dataAcceso,
      pageLength: 25,
      select: {
        style: 'single'
      },
      order: [[8, 'asc'], [6, 'asc']],
      columnDefs: [
        {
          className: 'dtr-control',
          orderable: false,
          targets: 0,
          render: (data, _, row) => {
            let i = document.createElement('input');
            i.classList.add('check-checked');
            i.setAttribute('type', 'checkbox');
            if (permiso.ocultar) {
              if (data == -1)
                i.disabled = true;
              else {
                i.addEventListener('change', _ => {
                  row.permiso_ver = i.checked ? 1 : 0;
                  updatePermisoId.call(i, row);
                });
                i.checked = data;
              }
            }
            else {
              i.checked = data == 1;
              i.disabled = true;
            }
            return i;
          }
        },
        {
          className: 'dtr-control',
          orderable: false,
          targets: 1,
          render: (data, _, row) => {
            let i = document.createElement('input');
            i.classList.add('check-checked');
            i.setAttribute('type', 'checkbox');
            if (permiso.ocultar) {
              if (data == -1)
                i.disabled = true;
              else {
                i.addEventListener('change', _ => {
                  row.permiso_agregar = i.checked ? 1 : 0;
                  updatePermisoId.call(i, row);
                });
                i.checked = data;
              }
            }
            else {
              i.checked = data == 1;
              i.disabled = true;
            }
            return i;
          }
        },
        {
          className: 'dtr-control',
          orderable: false,
          targets: 2,
          render: (data, _, row) => {
            let i = document.createElement('input');
            i.classList.add('check-checked');
            i.setAttribute('type', 'checkbox');
            if (permiso.ocultar) {
              if (data == -1)
                i.disabled = true;
              else {
                i.addEventListener('change', _ => {
                  row.permiso_editar = i.checked ? 1 : 0;
                  updatePermisoId.call(i, row);
                });
                i.checked = data;
              }
            }
            else {
              i.checked = data == 1;
              i.disabled = true;
            }
            return i;
          }
        },
        {
          className: 'dtr-control',
          orderable: false,
          targets: 3,
          render: (data, _, row) => {
            let i = document.createElement('input');
            i.classList.add('check-checked');
            i.setAttribute('type', 'checkbox');
            if (permiso.ocultar) {
              if (data == -1)
                i.disabled = true;
              else {
                i.addEventListener('change', _ => {
                  row.permiso_eliminar = i.checked ? 1 : 0;
                  updatePermisoId.call(i, row);
                });
                i.checked = data;
              }
            }
            else {
              i.checked = data == 1;
              i.disabled = true;
            }
            return i;
          }
        },
        {
          className: 'dtr-control',
          orderable: false,
          targets: 4,
          render: (data, _, row) => {
            let i = document.createElement('input');
            i.classList.add('check-checked');
            i.setAttribute('type', 'checkbox');
            if (permiso.ocultar) {
              if (data == -1)
                i.disabled = true;
              else {
                i.addEventListener('change', _ => {
                  row.permiso_ocultar = i.checked ? 1 : 0;
                  updatePermisoId.call(i, row);
                });
                i.checked = data;
              }
            }
            else {
              i.checked = data == 1;
              i.disabled = true;
            }
            return i;
          }
        },
        {
          className: 'dtr-control',
          orderable: false,
          targets: 5,
          render: (data, _, row) => {
            let i = document.createElement('input');
            i.classList.add('check-checked');
            i.setAttribute('type', 'checkbox');
            if (permiso.ocultar) {
              if (data == -1)
                i.disabled = true;
              else {
                i.addEventListener('change', _ => {
                  row.permiso_exportar = i.checked ? 1 : 0;
                  updatePermisoId.call(i, row);
                });
                i.checked = data;
              }
            }
            else {
              i.checked = data == 1;
              i.disabled = true;
            }
            return i;
          }
        },
        {
          className: 'dtr-tag',
          targets: 8,
          render: (data, _, row) => `<div>${row.rol_id} ${data}</div>`
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
        { data: 'rol_nombre' }
      ],
    })
    if (permiso.exportar) $table.buttons();
    else cardMainDownload.innerHTML = '';

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

    tblclose.forEach(btn => btn.addEventListener('click', () => toggleMenu.close()));

    /* 
      ==================================================
      ================= PERMISO AGREGAR =================
      ==================================================
    */

    if (!permiso.agregar) tblNuevo.forEach(t => t.style.display = 'none');

    /* 
      ==================================================
      ================ DRAW ALL CHECKBOX ================
      ==================================================
    */

    btnNuevoTodo.addEventListener('click', () => {
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

      /** @type {{err: string, OkPacket: import('mysql').OkPacket}} */
      let { err } = await resAccesoInsert.json();

      if (err)
        return alarm.warn('No se pudo agregar')

      alarm.success(`Filas Agregadas`);
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
      let { err } = await resAccesoUpdate.json();

      if (err)
        return alarm.warn('No se pudo agregar');

      alarm.success(`Filas actualizadas`);
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
            let { err } = await resUsuarios.json();

            if (err)
              return alarm.error(`Filas no Eliminada`);

            alarm.success(`Fila eliminada`);
          }
        });
    }))

    /* 
      ==================================================
      ===================== SOCKET =====================
      ==================================================
    */

    socket.on('/accesos/permisos/insert', data => {
      let row = $table.get('#' + data.id);
      if (row) return;

      $table.add({
        id: data.id,
        permiso_id: data.permiso_id,
        menu_ruta: data.menu_ruta,
        menu_principal: data.menu_principal,
        rol_id: data.rol_id,
        rol_nombre: data.rol_nombre,
        permiso_id: data.permiso_id,
        permiso_ver: data.permiso_ver,
        permiso_agregar: data.permiso_agregar,
        permiso_editar: data.permiso_editar,
        permiso_eliminar: data.permiso_eliminar,
        permiso_ocultar: data.permiso_ocultar,
        permiso_exportar: data.permiso_exportar
      });

      uniqueMenuRuta.add(data.menu_ruta?.toLowerCase());
    })

    socket.on('/accesos/permisos/updateId', data => {
      let row = $table.get('#' + data.id);
      if (!row) return;

      $table.update('#' + data.id, {
        menu_ruta: data.menu_ruta,
        menu_principal: data.menu_principal,
        permiso_id: data.permiso_id,
        permiso_ver: data.permiso_ver,
        permiso_agregar: data.permiso_agregar,
        permiso_editar: data.permiso_editar,
        permiso_eliminar: data.permiso_eliminar,
        permiso_ocultar: data.permiso_ocultar,
        permiso_exportar: data.permiso_exportar
      });

      if (row.menu_ruta?.toLowerCase() != data.menu_ruta?.toLowerCase()) {
        uniqueMenuRuta.delete(row.menu_ruta?.toLowerCase());
        uniqueMenuRuta.add(data.menu_ruta?.toLowerCase());
      }
    })

    socket.on('/accesos/permisos/deleteId', data => {
      $table.remove(...data.map(({ id }) => '#' + id));

      uniqueMenuRuta.delete(data.menu_ruta?.toLowerCase());
    })

    socket.on('/accesos/permisos/state', data => {
      let row = $table.get('#' + data.id);
      if (!row) return;

      $table.update('#' + data.id, {
        permiso_id: data.permiso_id,
        permiso_ver: data.permiso_ver,
        permiso_agregar: data.permiso_agregar,
        permiso_editar: data.permiso_editar,
        permiso_eliminar: data.permiso_eliminar,
        permiso_ocultar: data.permiso_ocultar,
        permiso_exportar: data.permiso_exportar
      });
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