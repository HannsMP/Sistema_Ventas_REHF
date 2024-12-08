$('.content-body').ready(async () => {
  try {

    let bytesToKb = (bit) => (bit / (1024 ** 2)).toFixed(2);

    /*
      ==================================================
      ======================= DOM =======================
      ==================================================
    */

    let cardSuccess = document.getElementById('logguer-success');

    let boxSuccess = cardSuccess.querySelector('.code');

    let downloadSuccess = cardSuccess.querySelector('#download');

    let sizeSuccess = cardSuccess.querySelector('#size');

    let clearSuccess = cardSuccess.querySelector('#clear');

    /*
      ==================================================
      =============== QUERY DATA SUCCESS ===============
      ==================================================
    */

    socket.emit('/read/success', (text, stat) => {
      let code = new Code('.log', boxSuccess, text);
      downloadSuccess.addEventListener('click', () => code.download());
      sizeSuccess.textContent = bytesToKb(stat.size);

      /*
        ==================================================
        ===================== SOCKET =====================
        ==================================================
      */

      clearSuccess.addEventListener('click', async _ => {
        socket.emit('/clear/success', (err) => {
          if (err)
            return alarm.error(err);

          code.empty();
          alarm.success(`Registro eliminada`);
        })
      })

      socket.on('/logger/success/writeStart', data => {
        code.addStart(data.log);
        sizeSuccess.textContent = bytesToKb(data.stat.size);
      })
    })
    
  } catch ({ message, stack }) {
    socket.emit('/err/client', { message, stack, url: window.location.href })
  }
})