$('.content-body').ready(async () => {
  try {

    let bytesToKb = (bit) => (bit / (1024 ** 2)).toFixed(2);

    /* 
      ==================================================
      =============== QUERY DATA SUCCESS ===============
      ==================================================
    */

    let resSuccess = await query.post.cookie("/api/logguer/success/read");

    /** @type {{err: string, OkPacket: import('mysql').OkPacket, list: {[column:string]: string|number}[]}} */
    let { text: textSuccess, stat: statSuccess } = await resSuccess.json();

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

    let codeSuccess = new Code('.log', boxSuccess, textSuccess);

    sizeSuccess.textContent = bytesToKb(statSuccess.size);

    downloadSuccess.addEventListener('click', () => codeSuccess.download());

    clearSuccess.addEventListener('click', async _ => {
      let resClear = await query.post.cookie("/api/logguer/success/clear");

      /** @type {{err: string, OkPacket: import('mysql').OkPacket, list: {[column:string]: string|number}[]}} */
      let { err } = await resClear.json();

      if (err)
        return alarm.error(`Registro no Eliminada`);

      codeSuccess.empty();

      alarm.success(`Registro eliminada`);
    })

    /* 
      ==================================================
      ===================== SOCKET =====================
      ==================================================
    */

    socket.on('/logger/success/writeStart', data => {
      codeSuccess.addStart(data.log);
      sizeSuccess.textContent = bytesToKb(data.stat.size);
    })

  } catch ({ message, stack }) {
    socket.emit('/err/client', { message, stack, url: window.location.href })
  }
})