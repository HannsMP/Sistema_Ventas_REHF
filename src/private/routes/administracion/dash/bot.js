$('.content-body').ready(async () => {
  try {

    /*
      ==================================================
      ======================= DOM =======================
      ==================================================
    */

    let cardBot = document.getElementById('card-bot');

    let botFoto = cardBot.querySelector('#bot-foto');
    let botEstado = cardBot.querySelector('#bot-estado');
    let botUsuario = cardBot.querySelector('#bot-usuario');

    /** @type {HTMLElement} */
    let botEstadoSmall = botEstado.querySelector('small');
    /** @type {HTMLElement} */
    let botUsuarioSmall = botUsuario.querySelector('small');

    /** @type {HTMLCanvasElement} */
    let RxC = document.getElementById('chart-bot-x-comando').getContext("2d");

    let chart = new Chart(RxC, {
      type: "line",
      data: {
        labels: [],
        datasets: [{
          label: "Usos",
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
      ================= CARDS BOT =================
      ==================================================
    */

    let renderCard = ({ state, name }) => {
      botEstadoSmall.textContent = state;

      if (state == 'CONNECTED') {
        botUsuarioSmall.textContent = name?.toUpperCase();
        botUsuario.computedStyleMap.display = '';

        socket.emit('/imagen/bot', (err, avatar) => {
          if (err)
            return alarm.error(err);
          
          if (avatar)
            botFoto.setAttribute('src', avatar);
          else
          botFoto.removeAttribute('src');
          
          botFoto.parentElement.classList.remove('load-spinner');
        })
      }
      else{
        botFoto.parentElement.classList.remove('load-spinner');        
        botUsuario.computedStyleMap.display = 'none';
      }

      cardBot.classList.remove('load-spinner');
    }

    /*
      ==================================================
      ================ GRAFICOS BOT  ================
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

    socket.emit('/dash/bot', (info, labels, datasets) => {
      renderCard(info);
      renderChart(labels, datasets);
    })

  } catch (e) {
    socket.emit('/err/client', { message, stack, url: window.location.href })
  }
})