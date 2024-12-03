$('.content-body').ready(async () => {
  try {

    let bytesToKb = (bit) => (bit / (1024 ** 2)).toFixed(2);

    /*
      ==================================================
      ======================= DOM =======================
      ==================================================
    */

    let cardError = document.getElementById('logguer-error');

    let boxError = cardError.querySelector('.code');

    let downloadError = cardError.querySelector('#download');

    let sizeError = cardError.querySelector('#size');

    let clearError = cardError.querySelector('#clear');


    /*
      ==================================================
      ================ QUERY DATA ERROR ================
      ==================================================
    */

    socket.emit('/read/success', (text, stat, exist) => {
      let code = new Code('.log', boxError, text);
      downloadError.addEventListener('click', () => code.download());
      sizeError.textContent = bytesToKb(stat.size);

      /*
        ==================================================
        ===================== SOCKET =====================
        ==================================================
      */

        clearError.addEventListener('click', async _ => {
        socket.emit('/clear/success', (err) => {
          if (err)
            return alarm.error(err);

          code.empty();
          alarm.success(`Registro eliminada`);
        })
      })

      socket.on('/logger/success/writeStart', data => {
        code.addStart(data.log);
        sizeError.textContent = bytesToKb(data.stat.size);
      })
    })
  } catch ({ message, stack }) {
    socket.emit('/err/client', { message, stack, url: window.location.href })
  }
})