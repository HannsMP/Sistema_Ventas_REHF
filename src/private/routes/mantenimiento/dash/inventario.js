$('.content-body').ready(async () => {

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