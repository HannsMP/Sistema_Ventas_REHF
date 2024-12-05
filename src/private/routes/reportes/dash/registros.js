$('.content-body').ready(async () => {
  try {

    /*
      ==================================================
      ================== VARIABLES DOM ==================
      ==================================================
    */

    let successUltimaModificacion = document.getElementById('success-ultima-modificacion');
    let warningUltimaModificacion = document.getElementById('warning-ultima-modificacion');
    let errorUltimaModificacion = document.getElementById('error-ultima-modificacion');
    let systemUltimaModificacion = document.getElementById('system-ultima-modificacion');


    /*
      ==================================================
      ====================== CARDS ======================
      ==================================================
    */

    /** @param {HTMLDivElement} div @param {number} time */
    let renderCard = (div, time) => {
      let [small1, small2] = div.querySelectorAll('small')
      small1.textContent = formatTime('YYYY / MM / DD', new Date(time));
      small2.textContent = formatTime('hh : mm tt', new Date(time));
    }

    /*
      ==================================================
      ===================== SOCKET =====================
      ==================================================
    */

    socket.emit('/dash/registros', (lastLog) => {
      renderCard(successUltimaModificacion, lastLog.success);
      renderCard(warningUltimaModificacion, lastLog.warning);
      renderCard(errorUltimaModificacion, lastLog.error);
      if (!lastLog.system)
        systemUltimaModificacion.remove()
      renderCard(systemUltimaModificacion, lastLog.system);
    })

  } catch (e) {
    socket.emit('/err/client', { message, stack, url: window.location.href })
  }
})

