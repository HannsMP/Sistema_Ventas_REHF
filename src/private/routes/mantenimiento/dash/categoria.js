$('.content-body').ready(async () => {

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

})