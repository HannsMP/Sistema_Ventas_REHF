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

      socket.emit('/imagen/bot', (err, avatar) => {
        if (err)
          return alarm.error(err);

        if (avatar)
          botFoto.setAttribute('src', avatar);
        else
          botFoto.removeAttribute('src');

        boxAvatar.classList.remove('load-spinner');
      })
    }

    /*
      ==================================================
      ====================== INIT ======================
      ==================================================
    */

    socket.emit('/info/bot', (err, { state, name, phone }) => {
      if (err)
        return alarm.error(err);

      botInit({ state, name, phone });
    })

    /*
      ==================================================
      ==================== STATE BOT ====================
      ==================================================
    */

    botEstadoCheck.addEventListener('change', async () => {
      let state = botEstadoCheck.checked;
      botEstadoCheck.checked = !state;
      botEstadoCheck.disabled = true;

      if (!state)
        return Swal.fire({
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
          .then(result => {
            if (result.isConfirmed)
              socket.emit('/state/bot', (err) => {
                if (err)
                  return alarm.error(err);

                botEstadoCheck.checked = false;
                botEstadoCheck.disabled = false;
              })
          })

      socket.emit('/state/bot', (err) => {
        if (err)
          return alarm.error(err);

        botEstadoCheck.checked = true;
        botEstadoCheck.disabled = false;
      })
    })

    /*
      ==================================================
      ===================== LOGOUT =====================
      ==================================================
    */

    btnLogout.addEventListener('click', async () => {
      if (btnLogout.style.display == 'none') return;

      Swal.fire({
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
        .then(async (result) => {
          if (result.isConfirmed)
            socket.emit('/stop/bot', id, err => {
              if (err)
                return alarm.error(err);
            })
        });
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

    /** @type {HTMLCanvasElement} */
    let RxC = document.getElementById('chart-bot-x-comando')
      .getContext("2d");

    let chartRxC = new Chart(RxC, {
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

    socket.emit('/commands/bot', (err, labelRxC, dataRxC) => {
      if (err)
        return alarm.error(err);

      chartRxC.data.labels = labelRxC;
      chartRxC.data.datasets[0].data = dataRxC;
      chartRxC.update();
    })

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

    socket.on('/session/acceso/state', data => {
      if (permiso?.agregar != data.permiso_agregar) {
        tblNuevo.forEach(t => t.style.display = data.permiso_agregar ? '' : 'none')
        permiso.agregar = data.permiso_agregar;
      }
      if (permiso?.editar != data.permiso_editar) {
        tblEditar.forEach(t => t.style.display = data.permiso_editar ? '' : 'none')
        permiso.editar = data.permiso_editar;
      }
      if (permiso?.eliminar != data.permiso_eliminar) {
        tblEliminar.forEach(t => t.style.display = data.permiso_eliminar ? '' : 'none')
        permiso.eliminar = data.permiso_eliminar;
      }
      if (permiso?.ocultar != data.permiso_ocultar) {
        $table.toggleColumn(0, data.permiso_ocultar);
        permiso.ocultar = data.permiso_ocultar;
      }
      if (permiso?.exportar != data.permiso_exportar) {
        if (data.permiso_exportar) $table.buttons();
        else cardMainDownload.innerHTML = '';
        permiso.exportar = data.permiso_exportar;
      }
    })

  } catch ({ message, stack }) {
    socket.emit('/err/client', { message, stack, url: window.location.href })
  }
})