$('.content-body').ready(async () => {

  /* 
    ==================================================
    ================= CARD CATEGORIAS =================
    ==================================================
  */

  let resCategorias = await query.post.cookie("/api/categorias/chart/read");

  /** @type {{err: string, OkPacket: import('mysql').OkPacket, list: {[column:string]: string|number}[]}} */
  let { card: cardCategorias, chart: chartCategorias } = await resCategorias.json();

  let { max_creacion: max_creacion_categorias, cantidad_categorias } = cardCategorias;

  let categoriasCantidad = document.querySelector('#categorias-cantidad small');
  categoriasCantidad.textContent = cantidad_categorias;

  let [categoriasInsercionFecha, categoriasInsercionHora] = document.querySelectorAll('#categorias-fecha small');
  categoriasInsercionFecha.textContent = formatTime('YYYY / MM / DD', new Date(max_creacion_categorias));
  categoriasInsercionHora.textContent = formatTime('hh : mm tt', new Date(max_creacion_categorias));

  /* 
    ==================================================
    =============== GRAFICO CATEGORIAS  ===============
    ==================================================
  */

  /** @type {HTMLCanvasElement} */
  let canvasCategorias = document.getElementById("chart-categorias")
    .getContext("2d");

  let { label: labesCategorias, data: dataCategorias } = chartCategorias

  let categoriasChart = new Chart(canvasCategorias, {
    type: "line",
    data: {
      labels: labesCategorias,
      datasets: [{
        label: "Cantidad",
        fill: false,
        backgroundColor: "rgba(255, 140, 0, .7)",
        data: dataCategorias
      }]
    },
    options: {
      responsive: true,
      scales: { y: { min: 0 } }
    }
  });

  /* 
    ==================================================
    ================= CARDS CLIENTES =================
    ==================================================
  */

  let resClientes = await query.post.cookie("/api/clientes/chart/read");

  /** @type {{err: string, OkPacket: import('mysql').OkPacket, usuarios_chart: {[column:string]: string|number}[]}} */
  let { card: cardClientes, charts: chartClientes } = await resClientes.json();

  let { max_creacion: max_creacion_clientes, cantidad_clientes } = cardClientes;

  let clientesCantidad = document.querySelector('#clientes-cantidad small');
  clientesCantidad.textContent = cantidad_clientes;

  let [clientesInsercionFecha, clientesInsercionHora] = document.querySelectorAll('#clientes-fecha small');
  clientesInsercionFecha.textContent = formatTime('YYYY / MM / DD', new Date(max_creacion_clientes));
  clientesInsercionHora.textContent = formatTime('hh : mm tt', new Date(max_creacion_clientes));

  /* 
    ==================================================
    =============== GRAFICOS CLIENTES  ===============
    ==================================================
  */

  /** @type {HTMLCanvasElement} */
  let canvasClientes = document.getElementById("chart-clientes")
    .getContext("2d");

  let { label: labelTipoClientes, data: dataTipoClientes } = chartClientes.tipo_cliente;
  let { label: labelTipoDocumento, data: dataTipoDocumento } = chartClientes.tipo_documento;

  let clientesChart = new Chart(canvasClientes, {
    type: "line",
    data: {
      labels: [...labelTipoClientes, ...labelTipoDocumento],
      datasets: [{
        label: "Cantidad",
        backgroundColor: [
          "rgba(255, 140, 0, .7)",
          "rgba(255, 140, 0, .6)",
          "rgba(255, 140, 0, .5)",
          "rgba(255, 140, 0, .4)",
          "rgba(255, 140, 0, .3)"
        ],
        data: [...dataTipoClientes, ...dataTipoDocumento]
      }]
    },
    options: {
      responsive: true,
      scales: { y: { min: 0 } }
    }
  });

  /* 
    ==================================================
    ================ CARDS INVENTARIO ================
    ==================================================
  */

  let resProductos = await query.post.cookie("/api/productos/chart/read");

  /** @type {{err: string, OkPacket: import('mysql').OkPacket, usuarios_chart: {[column:string]: string|number}[]}} */
  let { card: cardProductos, chart: chartProductos } = await resProductos.json();

  let { max_creacion: max_creacion_productos, cantidad_productos } = cardProductos;

  let productosCantidad = document.querySelector('#inventario-cantidad small');
  productosCantidad.textContent = cantidad_productos;

  let [productosInsercionFecha, productosInsercionHora] = document.querySelectorAll('#inventario-fecha small');
  productosInsercionFecha.textContent = formatTime('YYYY / MM / DD', new Date(max_creacion_productos));
  productosInsercionHora.textContent = formatTime('hh : mm tt', new Date(max_creacion_productos));

  /* 
    ==================================================
    ============== GRAFICOS INVENTARIO  ==============
    ==================================================
  */

  /** @type {HTMLCanvasElement} */
  let canvasInventario = document.getElementById("chart-inventario")
    .getContext("2d");

  let { label: labelUxR, data: dataUxR } = chartProductos;

  let inventarioChart = new Chart(canvasInventario, {
    type: "line",
    data: {
      labels: labelUxR,
      datasets: [{
        label: "Promedio",
        backgroundColor: [
          "rgba(255, 140, 0, .7)",
          "rgba(255, 140, 0, .6)",
          "rgba(255, 140, 0, .5)",
          "rgba(255, 140, 0, .4)",
          "rgba(255, 140, 0, .3)"
        ],
        data: dataUxR
      }]
    },
    options: {
      responsive: true,
      scales: { y: { min: 0 } }
    }
  });
})