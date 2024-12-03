$('.content-body').ready(async () => {

  /*
    ==================================================
    ================== CARDS ACCESO ==================
    ==================================================
  */

  let resAcceso_menu = await query.post.cookie("/api/acceso/chart/read");

  /** @type {{err: string, OkPacket: import('mysql').OkPacket, list: {[column:string]: string|number}[]}} */
  let { card: cardAcceso, chart: chartAcceso } = await resAcceso_menu.json();

  let { cantidad_menus, cantidad_accesos } = cardAcceso;

  let menusCantidad = document.querySelector('#acceso-menus small');
  menusCantidad.textContent = cantidad_menus;

  let accesoCantidad = document.querySelector('#acceso-cantidad small');
  accesoCantidad.textContent = cantidad_accesos;

  /*
    ==================================================
    ================ GRAFICOS ACCESO  ================
    ==================================================
  */

  /** @type {HTMLCanvasElement} */
  let AxP = document.getElementById("chart-acceso-x-permisos")
    .getContext("2d");

  let { label: labesAxP, data: dataAxP } = chartAcceso

  let chartAxP = new Chart(AxP, {
    type: "line",
    data: {
      labels: labesAxP,
      datasets: [{
        label: "Salse",
        fill: false,
        backgroundColor: "rgba(255, 140, 0, .7)",
        data: dataAxP
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

  let resUsuariosChart = await query.post.cookie("/api/usuarios/chart/read");

  /** @type {{err: string, OkPacket: import('mysql').OkPacket, usuarios_chart: {[column:string]: string|number}[]}} */
  let { card: cardUsuarios, chart: chartUsuarios } = await resUsuariosChart.json();

  let { max_creacion, cantidad_usuarios } = cardUsuarios;

  let usuariosCantidad = document.querySelector('#usuarios-cantidad small');
  usuariosCantidad.textContent = cantidad_usuarios;

  let [usuariosInsercionFecha, usuariosInsercionHora] = document.querySelectorAll('#usuarios-fecha small');
  usuariosInsercionFecha.textContent = formatTime('YYYY / MM / DD', new Date(max_creacion));
  usuariosInsercionHora.textContent = formatTime('hh : mm tt', new Date(max_creacion));

  /*
    ==================================================
    =============== GRAFICOS USUARIOS  ===============
    ==================================================
  */

  /** @type {HTMLCanvasElement} */
  let UxR = document.getElementById("chart-usuarios-x-roles")
    .getContext("2d");

  let { label: labelUxR, data: dataUxR } = chartUsuarios;

  let chartUxR = new Chart(UxR, {
    type: "line",
    data: {
      labels: labelUxR,
      datasets: [{
        label: "Roles",
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

  /*
    ==================================================
    ================= CARDS USUARIOS =================
    ==================================================
  */

  let resBot = await query.post.cookie("/api/bot/profile/info");


  /** @type {{state: string, name: string, phone: string, photo: string}}  */
  let { state, name, phone } = await resBot.json();

  let cardBot = document.getElementById('card-bot');

  let botFoto = cardBot.querySelector('#bot-foto');
  let botEstado = cardBot.querySelector('#bot-estado');
  let botUsuario = cardBot.querySelector('#bot-usuario');

  let botEstadoSmall = botEstado.querySelector('small');
  let botUsuarioSmall = botUsuario.querySelector('small');

  botEstadoSmall.textContent = state;

  if (state == 'CONNECTED') {
    query.post.cookie("/api/bot/profile/avatar")
      .then(res => res.json())
      .then(({ avatar }) => {
        if (avatar)
          botFoto.setAttribute('src', avatar);
        else
          botFoto.removeAttribute('src');
        botFoto.parentElement.classList.remove('load-spinner');
      })

    botUsuario.computedStyleMap.display = '';
    botUsuarioSmall.textContent = name?.toUpperCase();
  }
  else
    botUsuario.computedStyleMap.display = 'none';

  cardBot.classList.remove('load-spinner');

  /*
    ==================================================
    ================== GRAFICOS BOT  ==================
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
})