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
    let cardImport = document.querySelector('#card-import');
    /** @type {HTMLDivElement[]} */
    let [importBodyTable] = cardImport.querySelectorAll('.card-body')
    let btnCharge = document.querySelector('#tbl-charge');

    let $table = new Tables('#table-main');
    let $TableImport = new Tables('#table-import');

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
      order: [[4, 'des']],
      columnDefs: [
        {
          name: 'y.emisor',
          className: 'dtr-tag',
          targets: 0,
          render: data => '<div>' + data + '</div>'
        },
        {
          name: 'y.receptor',
          className: 'dtr-tag',
          targets: 1,
          render: data => '<div>' + data + '</div>'
        },
        {
          name: 'y.monto',
          className: 'dt-type-numeric',
          targets: 2,
          render: data => data.toFixed(2)
        },
        {
          name: 'y.mensaje',
          className: 'dtr-description',
          targets: 3,
          render: data => '<div class="scroll-y">' + (data || '-') + '</div>'
        },
        {
          name: 'y.fecha',
          className: 'dt-type-date',
          targets: 4
        }
      ],
      columns: [
        { data: 'emisor' },
        { data: 'receptor' },
        { data: 'monto' },
        { data: 'mensaje' },
        { data: 'fecha' }
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

    /**
     * @param {HTMLAnchorElement} btn
     */
    window.dropRow = function (btn) {
      let row = $TableImport.datatable.row(btn.closest('tr'));
      row.remove().draw();
    }

    $TableImport.init({
      pageLength: 10,
      order: [[4, 'des']],
      columnDefs: [
        {
          name: 'emisor',
          className: 'dtr-tag',
          targets: 0,
          render: data => '<div>' + data + '</div>'
        },
        {
          name: 'receptor',
          className: 'dtr-tag',
          targets: 1,
          render: data => '<div>' + data + '</div>'
        },
        {
          name: 'monto',
          className: 'dt-type-number',
          targets: 2,
          render: data => data.toFixed(2)
        },
        {
          name: 'mensaje',
          className: 'dtr-description',
          targets: 3,
          render: data => '<div class="scroll-y">' + (data || '-') + '</div>'
        },
        {
          name: 'fecha',
          className: 'dt-type-date',
          targets: 4
        },
        {
          data: undefined,
          targets: 5,
          defaultContent: '<a class="btn btn-danger" onclick="dropRow(this)" ><i class="bx bx-x"></i></a>'
        }
      ],
      columns: [
        { data: 'emisor' },
        { data: 'receptor' },
        { data: 'monto' },
        { data: 'mensaje' },
        { data: 'fecha' }
      ],
    })

    /*
      ==================================================
      ================== UPLOAD TABLE ==================
      ==================================================
    */

    let dtImport = document.querySelector('#datatable-import');
    let fileExec = new FileUnic(dtImport);
    let reader = new FileReader();

    fileExec.ev.on('upload', ({ file }) => {
      reader.readAsArrayBuffer(file);
      importBodyTable.style.display = '';
    });
    fileExec.ev.on('remove', () => {
      importBodyTable.style.display = 'none';
    });

    reader.onload = function (e) {
      let data = new Uint8Array(e.target.result);
      let workbook = XLSX.read(data, { type: 'array' });
      let firstSheetName = workbook.SheetNames[0];
      let worksheet = workbook.Sheets[firstSheetName];

      /**
       * @type {{
       *   id: number,
       *   tipo:'GIRASTE'|'PAGASTE'|'TE PAGO',
       *   emisor: string,
       *   receptor: string,
       *   monto: string,
       *   mensaje: string,
       *   fecha: string
       * }[]}
       */
      let matrix = XLSX.utils.sheet_to_json(worksheet, {
        header: ["tipo", "emisor", "receptor", "monto", "mensaje", "fecha"],
        range: 1,
        defval: ''
      });

      let validType = new Set(['TE YAPEARON', 'TE PAGÓ'])
      matrix = matrix.filter(row => validType.has(row.tipo));

      $TableImport.datatable.rows().remove();

      matrix.forEach((row, index) => {
        console.log(row);
        row.id = index + 1;
        row.monto = Number(row.monto);
        if (typeof row.fecha == 'string')
          return row.fecha = row.fecha.replace(/(\d{2})\/(\d{2})\/(\d{4}) (\d{2}:\d{2}:\d{2})/, '$3/$2/$1 $4');
        if (typeof row.fecha == 'number')
          return row.fecha = formatTime('YYYY/MM/DD HH:mm:ss', new Date(row.fecha))
      })

      $TableImport.add(...matrix);
    }

    btnCharge.addEventListener('click', () => {
      console.log($TableImport.datatable.rows().data().toArray());
    })

    /*
      ==================================================
      ===================== SOCKET =====================
      ==================================================
    */

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