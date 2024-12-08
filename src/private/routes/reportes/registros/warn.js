$('.content-body').ready(async () => {
  try {

    let bytesToKb = (bit) => (bit / (1024 ** 2)).toFixed(2);

    /*
      ==================================================
      ======================= DOM =======================
      ==================================================
    */

    let cardWarning = document.getElementById('logguer-warning');

    let boxWarning = cardWarning.querySelector('.code');

    let downloadWarning = cardWarning.querySelector('#download');

    let sizeWarning = cardWarning.querySelector('#size');

    let clearWarning = cardWarning.querySelector('#clear');

    /*
      ==================================================
      =============== QUERY DATA WARNING ===============
      ==================================================
    */

    socket.emit('/read/warn', (text, stat) => {
      let code = new Code('.log', boxWarning, text);
      downloadWarning.addEventListener('click', () => code.download());
      sizeWarning.textContent = bytesToKb(stat.size);

      /*
        ==================================================
        ===================== SOCKET =====================
        ==================================================
      */

      clearWarning.addEventListener('click', async _ => {
        socket.emit('/clear/warn', (err) => {
          if (err)
            return alarm.error(err);

          code.empty();
          alarm.success(`Registro eliminada`);
        })
      })

      socket.on('/logger/warn/writeStart', data => {
        code.addStart(data.log);
        sizeWarning.textContent = bytesToKb(data.stat.size);
      })
    })

  } catch ({ message, stack }) {
    socket.emit('/err/client', { message, stack, url: window.location.href })
  }
})