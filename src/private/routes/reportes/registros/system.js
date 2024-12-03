$('.content-body').ready(async () => {
  try {

    let bytesToKb = (bit) => (bit / (1024 ** 2)).toFixed(2);

    /*
      ==================================================
      ======================= DOM =======================
      ==================================================
    */

    let cardSystem = document.getElementById('logguer-system');

    let boxSystem = cardSystem.querySelector('.code');

    let downloadSystem = cardSystem.querySelector('#download');

    let sizeSystem = cardSystem.querySelector('#size');

    let clearSystem = cardSystem.querySelector('#clear');

    /*
      ==================================================
      ================ QUERY DATA SYSTEM ================
      ==================================================
    */

    socket.emit('/read/success', (text, stat, exist) => {
      if (!exist)
        return cardSystem.remove();

      let code = new Code('.log', boxSystem, text);
      downloadSystem.addEventListener('click', () => code.download());
      sizeSystem.textContent = bytesToKb(stat.size);

      /*
        ==================================================
        ===================== SOCKET =====================
        ==================================================
      */

      clearSystem.addEventListener('click', async _ => {
        socket.emit('/clear/success', (err) => {
          if (err)
            return alarm.error(err);

          code.empty();
          alarm.success(`Registro eliminada`);
        })
      })

      socket.on('/logger/success/writeStart', data => {
        code.addStart(data.log);
        sizeSystem.textContent = bytesToKb(data.stat.size);
      })
    })

  } catch ({ message, stack }) {
    socket.emit('/err/client', { message, stack, url: window.location.href })
  }
})