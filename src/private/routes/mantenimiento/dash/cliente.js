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
})