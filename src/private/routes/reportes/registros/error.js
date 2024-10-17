$('.content-body').ready(async () => {
  try {

    let bytesToKb = (bit) => (bit / (1024 ** 2)).toFixed(2);

    /* 
      ==================================================
      ================ QUERY DATA ERROR ================
      ==================================================
    */

    let resError = await query.post.cookie("/api/logguer/error/read");

    /** @type {{err: string, OkPacket: import('mysql').OkPacket, list: {[column:string]: string|number}[]}} */
    let { text: textError, stat: statError } = await resError.json();

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

    let codeError = new Code('.log', boxError, textError);

    sizeError.textContent = bytesToKb(statError.size);

    downloadError.addEventListener('click', () => codeError.download());

    clearError.addEventListener('click', async _ => {
      let resClear = await query.post.cookie("/api/logguer/error/clear");

      /** @type {{err: string, OkPacket: import('mysql').OkPacket, list: {[column:string]: string|number}[]}} */
      let { err } = await resClear.json();

      if (err)
        return alarm.error(`Registro no Eliminada`);

      codeError.empty();

      alarm.success(`Registro eliminada`);
    })

    /* 
      ==================================================
      ===================== SOCKET =====================
      ==================================================
    */

    socket.on('/logger/error/writeStart', data => {
      codeError.addStart(data.log);
      sizeError.textContent = bytesToKb(data.stat.size);
    })

  } catch ({ message, stack }) {
    socket.emit('/err/client', { message, stack, url: window.location.href })
  }
})