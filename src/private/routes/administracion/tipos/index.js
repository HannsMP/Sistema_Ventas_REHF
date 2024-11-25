$('.content-body').ready(async () => {
  try {

    /* 
      ==================================================
      ================== VARIABLES DOM ==================
      ==================================================
    */

    let $tableMetodoPago = new Tables('#table-metodo-pago');
    let $tableCliente = new Tables('#table-cliente');
    let $tableProveedor = new Tables('#table-proveedor');
    let $tableDocumento = new Tables('#table-documento');
    let $tableRoles = new Tables('#table-roles');

    /* 
      ==================================================
      ===================== ESTADO =====================
      ==================================================
    */

    // /** @type {(this:HTMLInputElement, data: {id: number, usuario: string})=>void} */
    // async function updateIdState({ id, producto }) {
    //   this.disabled = true;
    //   let estado = this.checked;
    //   let resEstado = await query.post.json.cookie("/api/productos/table/updateIdState", { id, estado });

    //   /** @type {{err: string, OkPacket: import('mysql').OkPacket, list: {[column:string]: string|number}[]}} */
    //   let { err } = await resEstado.json();

    //   if (estado)
    //     alarm.success(`${producto} activado`);
    //   else
    //     alarm.success(`${producto} desactivado`);

    //   if (err) {
    //     this.checked = !estado;
    //     alarm.error(`${producto} inaccesible`);
    //     return
    //   }

    //   this.disabled = false;
    // }

    /* 
      ==================================================
      ==================== DATATABLE ====================
      ==================================================
    */

    $tableMetodoPago.init({
      serverSide: true,
      ajax: (data, end) => {
        socket.emit('/read/tipoMetodoPago', data, res => end(res))
      },
      pageLength: 10,
      order: [[0, 'asc']],
      columnDefs: [
        {
          name: 'id',
          className: 'dt-type-numeric',
          targets: 0
        },
        {
          name: 'nombre',
          className: 'dtr-tag',
          targets: 1,
          render: data => '<div>' + data + '</div>'
        },
        {
          name: 'igv',
          className: 'dt-type-numeric',
          targets: 2,
          render: data => data?.toFixed(2)
        },
        {
          name: 'estado',
          className: 'dtr-control',
          orderable: false,
          targets: 3,
          render: (data, _, row) => {
            let i = document.createElement('input');
            i.classList.add('check-switch');
            i.setAttribute('type', 'checkbox');
            // i.addEventListener('change', updateIdState.bind(i, row));
            i.disabled = true;
            i.checked = data;
            return i;
          }
        }
      ],
      columns: [
        { data: 'id' },
        { data: 'nombre' },
        { data: 'igv' },
        { data: 'estado' }
      ],
    })

    $tableCliente.init({
      serverSide: true,
      ajax: (data, end) => {
        socket.emit('/read/tipoCliente', data, res => end(res))
      },
      pageLength: 10,
      order: [[0, 'asc']],
      columnDefs: [
        {
          name: 'id',
          className: 'dt-type-numeric',
          targets: 0
        },
        {
          name: 'nombre',
          className: 'dtr-tag',
          targets: 1,
          render: data => '<div>' + data + '</div>'
        },
        {
          name: 'descripcion',
          className: 'dtr-description',
          targets: 2
        },
        {
          name: 'estado',
          className: 'dtr-control',
          orderable: false,
          targets: 3,
          render: (data, _, row) => {
            let i = document.createElement('input');
            i.classList.add('check-switch');
            i.setAttribute('type', 'checkbox');
            // i.addEventListener('change', updateIdState.bind(i, row));
            i.disabled = true;
            i.checked = data;
            return i;
          }
        }
      ],
      columns: [
        { data: 'id' },
        { data: 'nombre' },
        { data: 'descripcion' },
        { data: 'estado' }
      ],
    })

    $tableProveedor.init({
      serverSide: true,
      ajax: (data, end) => {
        socket.emit('/read/tipoProveedor', data, res => end(res))
      },
      pageLength: 10,
      order: [[0, 'asc']],
      columnDefs: [
        {
          name: 'id',
          className: 'dt-type-numeric',
          targets: 0
        },
        {
          name: 'nombre',
          className: 'dtr-tag',
          targets: 1,
          render: data => '<div>' + data + '</div>'
        },
        {
          name: 'descripcion',
          className: 'dtr-description',
          targets: 2
        },
        {
          name: 'estado',
          className: 'dtr-control',
          orderable: false,
          targets: 3,
          render: (data, _, row) => {
            let i = document.createElement('input');
            i.classList.add('check-switch');
            i.setAttribute('type', 'checkbox');
            // i.addEventListener('change', updateIdState.bind(i, row));
            i.disabled = true;
            i.checked = data;
            return i;
          }
        }
      ],
      columns: [
        { data: 'id' },
        { data: 'nombre' },
        { data: 'descripcion' },
        { data: 'estado' }
      ],
    })

    $tableDocumento.init({
      serverSide: true,
      ajax: (data, end) => {
        socket.emit('/read/tipoDocumento', data, res => end(res))
      },
      pageLength: 10,
      order: [[0, 'asc']],
      columnDefs: [
        {
          name: 'id',
          className: 'dt-type-numeric',
          targets: 0
        },
        {
          name: 'nombre',
          className: 'dtr-tag',
          targets: 1,
          render: data => '<div>' + data + '</div>'
        },
        {
          name: 'descripcion',
          className: 'dtr-description',
          targets: 2
        },
        {
          name: 'estado',
          className: 'dtr-control',
          orderable: false,
          targets: 3,
          render: (data, _, row) => {
            let i = document.createElement('input');
            i.classList.add('check-switch');
            i.setAttribute('type', 'checkbox');
            // i.addEventListener('change', updateIdState.bind(i, row));
            i.disabled = true;
            i.checked = data;
            return i;
          }
        }
      ],
      columns: [
        { data: 'id' },
        { data: 'nombre' },
        { data: 'descripcion' },
        { data: 'estado' }
      ],
    })

    $tableRoles.init({
      serverSide: true,
      ajax: (data, end) => {
        socket.emit('/read/tipoRoles', data, res => end(res))
      },
      pageLength: 10,
      order: [[0, 'asc']],
      columnDefs: [
        {
          name: 'id',
          className: 'dt-type-numeric',
          targets: 0
        },
        {
          name: 'nombre',
          className: 'dtr-tag',
          targets: 1,
          render: data => '<div>' + data + '</div>'
        },
        {
          name: 'descripcion',
          className: 'dtr-description',
          targets: 2
        },
        {
          name: 'estado',
          className: 'dtr-control',
          orderable: false,
          targets: 3,
          render: (data, _, row) => {
            let i = document.createElement('input');
            i.classList.add('check-switch');
            i.setAttribute('type', 'checkbox');
            // i.addEventListener('change', updateIdState.bind(i, row));
            i.disabled = true;
            i.checked = data;
            return i;
          }
        }
      ],
      columns: [
        { data: 'id' },
        { data: 'nombre' },
        { data: 'descripcion' },
        { data: 'estado' }
      ],
    })

  } catch ({ message, stack }) {
    socket.emit('/err/client', { message, stack, url: window.location.href })
  }
})
