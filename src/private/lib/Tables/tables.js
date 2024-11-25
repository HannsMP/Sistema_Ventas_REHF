class Tables {
  /** @param {keyof HTMLElementTagNameMap | keyof SVGElementTagNameMap | keyof MathMLElementTagNameMap | keyof HTMLElementDeprecatedTagNameMap} id */
  constructor(id) {
    this.i = $(id);
    /** @type {HTMLTableElement} */
    this.table = this.i[0];
  }
  /** @param {import('datatables.net-dt').Config} config @param {string|boolean} searchParam */
  init(config, searchParam = 'tb_search') {

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

    if (config.ajax) {
      if (typeof config.ajax == 'function') {
        let ajax = config.ajax;

        config.ajax = (req, end) => {
          $('.dt-processing').css('display', 'flex')
          ajax(req, res => {
            end(res)
            $('.dt-processing').css('display', 'none')
          })
        }
      }

      tableConfig.ajax = config.ajax;
    }
    this.datatable = this.i.DataTable(tableConfig);

    /** @type {import('datatables.net-dt').Config}  */
    this.config = tableConfig;

    if (searchParam) {
      let timeoutId;
      this.datatable.on('search', (_, arg) => {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => {
          let url = new URL(window.location.href);
          let value = arg?.oPreviousSearch?.search;

          if (value) {
            if (url.searchParams.has(searchParam))
              url.searchParams.set(searchParam, value);
            else
              url.searchParams.append(searchParam, value);
          }
          else
            url.searchParams.delete(searchParam)

          history.pushState({}, '', url.toString())
        }, 200)

        return arg?.oPreviousSearch?.search
      })

      let url = new URL(window.location.href);
      if (url.searchParams.has(searchParam)) {
        let search = url.searchParams.get(searchParam);
        this.datatable.search(search).draw();
      }
    }
  }
  /** @returns {number} */
  selected() {
    return this.datatable.row({ selected: true }).data()?.id;
  }
  /** @returns {number[]} */
  selecteds() {
    return this.datatable.rows({ selected: true }).data().toArray().map(row => row.id);
  }
  /** @param {{[column: string]: any}} data  */
  data(data) {
    this.datatable.clear();
    this.add(...data);
  }
  /** @param {{[column: string]: any}[]} data  */
  add(...data) {
    data.forEach(d => this.datatable.row.add(d))
    this.datatable.draw();
  }
  /** @param {...number} rowIds */
  remove(...rowIds) {
    rowIds.forEach(id => this.datatable.row(id).remove())
    this.datatable.draw(false);
  }
  /** @param {number} rowId @param {string} className  */
  toggle(rowId, className) {
    this.datatable.row(rowId).nodes().to$().toggleClass(className);
  }
  /** @param {number} rowId @param {{[column: string]: any}} rowData  */
  update(rowId, rowData) {
    let getRow = this.datatable.row(rowId);
    let data = getRow.data();
    getRow.data({ ...data, ...rowData })
      .draw(false);
    return data
  }
  /** @param {number} rowId  */
  get(rowId) {
    return this.datatable.row(rowId).data();
  }
  /** @param {string} value @param {[regex?: boolean, smart?: boolean, caseInsen?: boolean]} option  */
  search(value, ...option) {
    this.datatable.search(value, ...option).draw();
  }
  /** @param {keyof HTMLElementTagNameMap | keyof SVGElementTagNameMap | keyof MathMLElementTagNameMap | keyof HTMLElementDeprecatedTagNameMap} here */
  buttons(here = '.tables-utils .download') {
    this.datatable.buttons().container().appendTo(here);
  }
  /** @param {number} index @param {boolean} state  */
  toggleColumn(index, state) {
    this.datatable.column(index).visible(state)
  }
  /** @param {boolean} state @param {string} defaultStyle */
  toggleSelect(state, defaultStyle = this.config?.select?.style || 'single') {
    this.datatable.select.style(state ? defaultStyle : 'api');
    if (!state) this.datatable.rows().deselect()
  }
}