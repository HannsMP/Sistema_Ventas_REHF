$('.content-body').ready(async () => {
  try {

    /*
      ==================================================
      ======================= DOM =======================
      ==================================================
    */

    /** @type {HTMLElement} */
    let usuariosCantidad = document.querySelector('#usuarios-cantidad small');
    /** @type {HTMLElement[]} */
    let [usuariosInsercionFecha, usuariosInsercionHora] = document.querySelectorAll('#usuarios-fecha small');

    /** @type {HTMLCanvasElement} */
    let UxR = document.getElementById("chart-usuarios-x-roles").getContext("2d");

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
      ================= CARDS USUARIOS =================
      ==================================================
    */

    let renderCard = (cantidad_usuarios, max_creacion) => {
      usuariosCantidad.textContent = cantidad_usuarios;
      usuariosInsercionFecha.textContent = formatTime('YYYY / MM / DD', new Date(max_creacion));
      usuariosInsercionHora.textContent = formatTime('hh : mm tt', new Date(max_creacion));
    }

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

    socket.emit('/dash/usuarios', (cantidad_usuarios, max_creacion, labels, datasets) => {
      renderCard(cantidad_usuarios, max_creacion);
      renderChart(labels, datasets);
    })


  } catch (e) {
    socket.emit('/err/client', { message, stack, url: window.location.href })
  }
})