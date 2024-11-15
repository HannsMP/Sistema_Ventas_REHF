$('.content-body').ready(async () => {
  try {

    /* 
      ==================================================
      ================== VARIABLES DOM ==================
      ==================================================
    */

    let $cardMain = $('#card-main');
    let cardMain = $cardMain[0];

    let cardMainDownload = cardMain.querySelector('.download');

    let calendarioBox = document.querySelector('.calendario');

    let $table = new Tables('#table-main');

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
      order: [[5, 'des'], [3, 'des']],
      columnDefs: [
        {
          name: 'u.usuario',
          className: 'dtr-tag',
          targets: 0,
          render: data => '<div>' + data + '</div>'
        },
        {
          name: 'u.telefono',
          className: 'dt-type-numeric',
          targets: 1
        },
        {
          name: 'r.nombre',
          className: 'dtr-tag',
          targets: 2,
          render: data => '<div>' + data + '</div>'
        },
        {
          name: 'a.creacion',
          className: 'dt-type-date',
          targets: 3
        },
        {
          name: 'a.desconeccion',
          className: 'dt-type-date',
          targets: 4
        },
        {
          name: 'a.creacion',
          className: 'dt-type-date',
          targets: 5
        }
      ],
      columns: [
        { data: 'usuario' },
        { data: 'telefono' },
        { data: 'rol_nombre' },
        { data: 'hora_coneccion' },
        { data: 'hora_desconeccion' },
        { data: 'fecha_creacion' }
      ],
    })

    if (permiso.exportar) $table.buttons();
    else cardMainDownload.innerHTML = '';

    let calendar = new Calendar(calendarioBox);
    calendar.on('click', ({ date }) => {
      $table.search(formatTime('YYYY-MM-DD', date));

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
      ===================== SOCKET =====================
      ==================================================
    */

    socket.on('/asistencias/data/insert', data => {
      $table.add({
        id: data.id,
        usuario: data.usuario,
        telefono: data.telefono,
        rol_nombre: data.rol_nombre,
        hora_coneccion: data.hora_coneccion,
        hora_desconeccion: data.hora_desconeccion,
        fecha_creacion: data.fecha_creacion,
      });
    })

    socket.on('/asistencias/data/lastDisconnection', data => {
      $table.update('#' + data.id, {
        hora_desconeccion: formatTime('hh:mm:ss TT')
      });
    })

    socket.on('/session/acceso/state', data => {
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