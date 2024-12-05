$('.content-body').ready(async () => {
  try {

    /*
      ==================================================
      ======================= DOM =======================
      ==================================================
    */

    /** @type {HTMLElement} */
    let menusCantidad = document.querySelector('#acceso-menus small');
    /** @type {HTMLElement} */
    let accesoCantidad = document.querySelector('#acceso-cantidad small');

    /** @type {HTMLCanvasElement} */
    let AxP = document.getElementById("chart-acceso-x-permisos").getContext("2d");

    let chart = new Chart(AxP, {
      type: "line",
      data: {
        labels: [],
        datasets: [{
          label: "Salse",
          fill: false,
          backgroundColor: "rgba(255, 140, 0, .7)",
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
      ================== CARDS ACCESO ==================
      ==================================================
    */

    let renderCard = (cantidad_menus, cantidad_accesos) => {
      menusCantidad.textContent = cantidad_menus;
      accesoCantidad.textContent = cantidad_accesos;
    }

    /*
      ==================================================
      ================ GRAFICOS ACCESO  ================
      ==================================================
    */

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

    socket.emit('/dash/accesos', (cantidad_menus, cantidad_accesos, labels, datasets) => {
      renderCard(cantidad_menus, cantidad_accesos);
      renderChart(labels, datasets);
    })

  } catch (e) {
    socket.emit('/err/client', { message, stack, url: window.location.href })
  }

})