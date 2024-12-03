$('.content-body').ready(async () => {
  try {

    /*
      ==================================================
      ================== VARIABLES DOM ==================
      ==================================================
    */

    /** @type {HTMLElement} */
    let cardCantidad = document.querySelector('#proveedores-cantidad small');
    /** @type {HTMLElement[]} */
    let [cardFecha, cardHora] = document.querySelectorAll('#proveedores-fecha small');
    /** @type {HTMLCanvasElement} */
    let canvas = document.getElementById("chart-proveedores").getContext("2d");

    let chart = new Chart(canvas, {
      type: "line",
      data: {
        labels: [],
        datasets: [{
          label: "Promedio",
          backgroundColor: [
            "rgba(255, 140, 0, .7)",
            "rgba(255, 140, 0, .6)",
            "rgba(255, 140, 0, .5)",
            "rgba(255, 140, 0, .4)",
            "rgba(255, 140, 0, .3)"
          ],
          data: []
        }]
      },
      options: {
        responsive: true,
        scales: { y: { min: 0 } }
      }
    });

    /*
      ==================================================
      ====================== CARDS ======================
      ==================================================
    */

    /** @param {number} cantidad_clientes @param {string} max_creacion */
    let renderCard = (cantidad_clientes, max_creacion) => {
      cardCantidad.textContent = cantidad_clientes;
      cardFecha.textContent = formatTime('YYYY / MM / DD', new Date(max_creacion));
      cardHora.textContent = formatTime('hh : mm tt', new Date(max_creacion));
    }

    /*
      ==================================================
      ==================== GRAFICOS ====================
      ==================================================
    */

    /** @param {any[]} labels @param {any[]} datasets */
    let renderChart = (labels, datasets) => {
      chart.data.labels = labels;
      datasets.forEach((data, i) => chart.data.datasets[i].data = data);
      chart.update();
    }

    /*
      ==================================================
      ===================== SOCKET =====================
      ==================================================
    */

    socket.emit('/dash/proveedores', (cantidad, max_creacion, labels, datasets) => {
      renderCard(cantidad, max_creacion);
      renderChart(labels, datasets);
    })

  } catch (e) {
    socket.emit('/err/client', { message, stack, url: window.location.href })
  }
})