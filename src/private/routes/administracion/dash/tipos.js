$('.content-body').ready(async () => {
  try {

    /*
      ==================================================
      ======================= DOM =======================
      ==================================================
    */

    /** @type {HTMLCanvasElement} */
    let UxR = document.getElementById("chart-tipos-x-cantidad").getContext("2d");

    let chart = new Chart(UxR, {
      type: "line",
      data: {
        labels: [],
        datasets: [{
          label: "Roles",
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
      =============== GRAFICOS USUARIOS  ===============
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

    socket.emit('/dash/tipos', (labels, datasets) => {
      renderChart(labels, datasets);
    })


  } catch (e) {
    socket.emit('/err/client', { message, stack, url: window.location.href })
  }
})