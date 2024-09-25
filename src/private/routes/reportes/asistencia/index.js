$('.content-body').ready(async () => {
  try {

    /* 
      ==================================================
      =================== QUERY DATA ===================
      ==================================================
    */

    let resAsistenciaTbl = await query.post.cookie("/api/asistencia/table/readAll");
    /** @typedef {{agregar:number, editar:number, eliminar:number, exportar:number, ocultar:number, ver:number}} PERMISOS */
    /** @type {{err: string, OkPacket: import('mysql').OkPacket, list: {[column:string]: string|number}[], permisos: PERMISOS}} */
    let { list: dataAsistencias, permisos: permisosAsistencias } = await resAsistenciaTbl.json();

    /* 
      ==================================================
      ================== VARIABLES DOM ==================
      ==================================================
    */

    let calendarioBox = document.querySelector('.calendario')
    let $table = new Tables('#table-main');

    /* 
      ==================================================
      ==================== DATATABLE ====================
      ==================================================
    */

    dataAsistencias.forEach(d => {
      d.usuario = '<div>' + d.usuario + '</div>'
      d.rol_nombre = '<div>' + d.rol_nombre + '</div>'
    })

    $table.init({
      data: dataAsistencias,
      pageLength: 10,
      order: [[5, 'des'], [3, 'des']],
      columnDefs: [
        {
          className: 'dtr-tag',
          targets: 0
        },
        {
          className: 'dtr-tag',
          targets: 2
        },
        {
          className: 'dt-type-date',
          targets: 3
        },
        {
          className: 'dt-type-date',
          targets: 4
        },
        {
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
    $table.buttons();


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
        usuario: '<div>' + data.usuario + '</div>',
        telefono: data.telefono,
        rol_nombre: '<div>' + data.rol_nombre + '</div>',
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

  } catch ({ message, stack }) {
    socket.emit('/err/client', { message, stack, url: window.location.href })
  }

})