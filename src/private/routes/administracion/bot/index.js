$('.content-body').ready(async () => {
  try {

    /* 
      ==================================================
      ======================= DOM =======================
      ==================================================
    */

    let cardBot = document.getElementById('card-bot');

    let btnLogout = cardBot.querySelector('.card-head .btn-danger');
    let btnQr = cardBot.querySelector('.card-head .btn-info');

    let boxAvatar = cardBot.querySelector('#bot-avatar');
    let botFoto = boxAvatar.querySelector('img');
    let botEstado = cardBot.querySelector('#bot-estado');
    let botUsuario = cardBot.querySelector('#bot-usuario');
    let botId = cardBot.querySelector('#bot-id');

    let botEstadoSmall = botEstado.querySelector('small');
    let botEstadoCheck = botEstado.querySelector('input');
    let botUsuarioSmall = botUsuario.querySelector('small');
    let botIdSmall = botId.querySelector('small');

    let menuSide = document.querySelector('.menu-side');

    let botQr = document.querySelector('#bot-qr');
    let dateQr = botQr.querySelector('#date-qr')
    let boxQr = botQr.querySelector('.code')

    /* 
      ==================================================
      ==================== BOT INFO ====================
      ==================================================
    */

    let botInit = async ({ state, name, phone }) => {

      /* ==================== CARDS BOT ==================== */

      botEstadoSmall.textContent = state;

      if (state == 'CONNECTED') {

        menuSide.style.display = 'none';

        botUsuario.style.display = '';
        botUsuarioSmall.textContent = name?.toUpperCase();

        botEstadoCheck && (botEstadoCheck.checked = true);

        botId.style.display = '';
        botIdSmall.textContent = phone;

      }
      else {
        if (state != 'DISCONNECTED')
          menuSide.style.display = '';

        boxQr.innerText = '';

        botEstadoCheck && (botEstadoCheck.checked = false);

        botUsuario.style.display = 'none';
        botId.style.display = 'none';
      }

      if (state == 'LOGOUT' || state == 'UNDEFINED') {
        btnQr.style.display = '';
        btnLogout.style.display = 'none';
      }
      else {
        btnLogout.style.display = '';
        btnQr.style.display = 'none';
      }


      /* =================== AVATAR BOT =================== */

      boxAvatar.classList.add('load-spinner');

      let resBotAvatar = await query.post.cookie("/api/bot/profile/avatar");

      /** @type {{avatar: string}}  */
      let { avatar } = await resBotAvatar.json();

      if (avatar)
        botFoto.setAttribute('src', avatar);
      else
        botFoto.removeAttribute('src');

      boxAvatar.classList.remove('load-spinner');

    }

    /* 
      ==================================================
      ====================== INIT ======================
      ==================================================
    */

    let resBot = await query.post.cookie("/api/bot/profile/info");

    /** @type {{state: string, name: string, phone: string}}  */
    let { state, name, phone } = await resBot.json();

    botInit({ state, name, phone });

    /* 
      ==================================================
      ==================== STATE BOT ====================
      ==================================================
    */

    if (botEstadoCheck) {
      botEstadoCheck.addEventListener('change', async () => {
        let state = botEstadoCheck.checked;

        if (!state) {
          botEstadoCheck.checked = true;

          let { isConfirmed } = await Swal.fire({
            title: "Está seguro?",
            text: "Apagaras el bot y con el sus funcionalidades",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "rgb(13, 204, 242)",
            cancelButtonColor: "rgb(220, 53, 69)",
            confirmButtonText: "Apagar!",
            cancelButtonText: "Cancelar",
            background: 'rgb(24, 20, 47)',
            color: 'rgb(255, 255, 255)',
          })

          if (!isConfirmed) return;

          await query.post.json.cookie("/api/bot/profile/state");

          botEstadoCheck.checked = false;
          return
        }

        botEstadoCheck.checked = false;
        botEstadoCheck.disabled = true;

        await query.post.json.cookie("/api/bot/profile/state");

        botEstadoCheck.checked = true;
        botEstadoCheck.disabled = false;
      })
    }

    /* 
      ==================================================
      ===================== LOGOUT =====================
      ==================================================
    */

    btnLogout && btnLogout.addEventListener('click', async () => {

      if (btnLogout.style.display == 'none') return;

      let { isConfirmed } = await Swal.fire({
        title: "Está seguro?",
        text: "Se borrara la session",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "rgb(13, 204, 242)",
        cancelButtonColor: "rgb(220, 53, 69)",
        confirmButtonText: "cerrar session!",
        cancelButtonText: "Cancelar",
        background: 'rgb(24, 20, 47)',
        color: 'rgb(255, 255, 255)',
      })

      if (!isConfirmed) return;

      await query.post.cookie("/api/bot/profile/logout");
    })

    /* 
      ==================================================
      ===================== OPEN QR =====================
      ==================================================
    */

    btnQr.addEventListener('click', () => {
      if (menuSide.style.display == 'none')
        menuSide.style.display = '';
      else
        menuSide.style.display = 'none';
    })

    /* 
      ==================================================
      ====================== CHART ======================
      ==================================================
    */

    let resBotChart = await query.post.cookie("/api/bot/chart/mainPath");

    /** @type {{err: string, OkPacket: import('mysql').OkPacket, list: {[column:string]: string|number}[]}} */
    let { chart } = await resBotChart.json();

    /** @type {HTMLCanvasElement} */
    let RxC = document.getElementById('chart-bot-x-comando')
      .getContext("2d");

    let { label: labelRxC, data: dataRxC } = chart;

    let chartRxC = new Chart(RxC, {
      type: "line",
      data: {
        labels: labelRxC,
        datasets: [{
          label: "Usos",
          backgroundColor: "rgba(255, 140, 0, .7)",
          data: dataRxC
        }]
      },
      options: {
        responsive: true,
        scales: { y: { min: 0 } }
      }
    });

    /* 
      ==================================================
      ===================== SOCKET =====================
      ==================================================
    */

    socket.on('/bot/qr', qrString => {
      dateQr.innerText = formatTime('hh:mm:ss')
      boxQr.innerText = qrString;
    })

    socket.on('/bot/initialize', _ => {
      alarm.success(`Bot inicializado`);
    })

    socket.on('/bot/ready', info => {
      botInit(info);
      alarm.success(`Bot encendido`);
    })

    socket.on('/bot/destroy', info => {
      botInit(info);
      alarm.success(`Bot apagado`);
    })

    socket.on('/bot/logout', info => {
      botInit(info);
      alarm.success(`Bot sesion cerrada`);
    })

    socket.on('/bot/authFailure', msg => {
      alarm.success(msg);
    })

    socket.on('/bot/command/use', data => {
      let { datasets, labels } = chartRxC.data;
      let index = labels.findIndex(l => l == data.command)
      if (index == undefined) return;
      datasets[0].data[index] = data.use;
      chartRxC.update();
    })

  } catch ({ message, stack }) {
    socket.emit('/err/client', { message, stack, url: window.location.href })
  }
})