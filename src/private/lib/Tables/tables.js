class Tables {
  constructor(id) {
    this.i = $(id);
    /** @type {HTMLTableElement} */
    this.table = this.i[0];
  }
  /** @param {import('datatables.net-dt').Config} config  */
  init(config, urlSearch = true) {

    /** @type {import('datatables.net-dt').Config}  */
    let tableConfig = {
      data: [],
      pageLength: 50,
      rowId: 'id',
      autoWidth: false,
      ordering: true,
      paging: true,
      searching: true,
      searchDelay: 200,
      deferRender: true,
      processing: true,
      language: {
        decimal: '',
        emptyTable: 'No hay datos disponibles en la tabla',
        info: 'Mostrando _START_ a _END_ de _TOTAL_ entradas',
        infoEmpty: 'Mostrando 0 a 0 de 0 entradas',
        infoFiltered: '(filtrado de _MAX_ entradas totales)',
        infoPostFix: '',
        thousands: ',',
        lengthMenu: 'Mostrar _MENU_ entradas',
        loadingRecords: 'Cargando...',
        processing: 'Cargando datos, por favor espera...',
        search: 'Buscar:',
        zeroRecords: 'No se encontraron registros coincidentes',
        select: {
          rows: {
            0: 'Haga clic en una fila para seleccionarla',
            1: '1 Fila seleccionada',
            _: '%d Filas seleccionadas'
          }
        },
        paginate: {
          first: 'Primero',
          last: 'Último',
          next: 'Siguiente',
          previous: 'Anterior'
        },
        aria: {
          sortAscending: ': activar para ordenar la columna ascendente',
          sortDescending: ': activar para ordenar la columna descendente',
          orderable: 'Ordenar por esta columna',
          orderableReverse: 'Ordenar esta columna en orden inverso'
        },
        searchPanes: {
          title: {
            _: 'Filtros seleccionados - %d',
            0: 'No hay filtros seleccionados',
            1: 'Un filtro seleccionado'
          }
        }
      },
      buttons: [
        {
          extend: 'copy',
          text: 'Copiar'
        },
        {
          extend: 'csv',
          text: 'CSV'
        },
        {
          extend: 'excel',
          text: 'Excel'
        },
        {
          extend: 'pdf',
          text: 'PDF'
        },
        {
          extend: 'print',
          text: 'Imprimir'
        }
      ]
    }

    if (config.data) tableConfig.data = config.data;
    if (config.pageLength) tableConfig.pageLength = config.pageLength;
    if (config.select) tableConfig.select = config.select;
    if (config.order) tableConfig.order = config.order;
    if (config.columns) tableConfig.columns = config.columns;
    if (config.columnDefs) tableConfig.columnDefs = config.columnDefs;
    if (config.serverSide) tableConfig.serverSide = config.serverSide;
    if (config.ajax) tableConfig.ajax = config.ajax;

    this.datatable = this.i.DataTable(tableConfig);

    this.datatable.on('preXhr.dt', () => $('.dt-processing').css('display', 'flex'));

    /** @type {import('datatables.net-dt').Config}  */
    this.config = tableConfig;

    if (urlSearch) {
      let timeoutId;
      this.datatable.on('search', (_, arg) => {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => {
          let url = new URL(window.location.href);
          let value = arg?.oPreviousSearch?.search;

          if (value) {
            if (url.searchParams.has('tb_search'))
              url.searchParams.set('tb_search', value);
            else
              url.searchParams.append('tb_search', value);
          }
          else
            url.searchParams.delete('tb_search')

          history.pushState({}, '', url.toString())
        }, 200)

        return arg?.oPreviousSearch?.search
      })

      let url = new URL(window.location.href);
      if (url.searchParams.has('tb_search')) {
        let search = url.searchParams.get('tb_search');
        this.datatable.search(search).draw();
      }
    }
  }
  selected() {
    return this.datatable.row({ selected: true }).data()?.id;
  }
  selecteds() {
    return this.datatable.rows({ selected: true }).data().toArray().map(row => row.id);
  }
  data(data) {
    this.datatable.clear();
    this.add(...data);
  }
  add(...data) {
    data.forEach(d => this.datatable.row.add(d))
    this.datatable.draw();
  }
  remove(...rowIds) {
    rowIds.forEach(id => this.datatable.row(id).remove())
    this.datatable.draw(false);
  }
  toggle(rowId, className) {
    this.datatable.row(rowId).nodes().to$().toggleClass(className);
  }
  update(rowId, rowData) {
    let getRow = this.datatable.row(rowId);
    let data = getRow.data();
    getRow.data({ ...data, ...rowData })
      .draw(false);
    return data
  }
  get(rowId) {
    return this.datatable.row(rowId).data();
  }
  search(value, ...option) {
    this.datatable.search(value, ...option).draw();
  }
  buttons(here = '.tables-utils .download') {
    this.datatable.buttons().container().appendTo(here);
  }
  toggleColumn(index, state) {
    this.datatable.column(index).visible(state)
  }
  toggleSelect(state, defaultStyle = this.config?.select?.style || 'single') {
    this.datatable.select.style(state ? defaultStyle : 'api');
    if (!state) this.datatable.rows().deselect()
  }
}