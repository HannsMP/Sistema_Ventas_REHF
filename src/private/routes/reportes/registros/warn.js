$('.content-body').ready(async () => {
  try {

    let bytesToKb = (bit) => (bit / (1024 ** 2)).toFixed(2);

    /* 
      ==================================================
      =============== QUERY DATA WARNING ===============
      ==================================================
    */

    let resWarning = await query.post.cookie("/api/logguer/warning/read");

    /** @type {{err: string, OkPacket: import('mysql').OkPacket, list: {[column:string]: string|number}[]}} */
    let { text: textWarning, stat: statWarning } = await resWarning.json();

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

    let codeWarning = new Code('.log', boxWarning, textWarning);

    sizeWarning.textContent = bytesToKb(statWarning.size);

    downloadWarning.addEventListener('click', () => codeWarning.download());

    clearWarning.addEventListener('click', async _ => {
      let resClear = await query.post.cookie("/api/logguer/warning/clear");

      /** @type {{err: string, OkPacket: import('mysql').OkPacket, list: {[column:string]: string|number}[]}} */
      let { err } = await resClear.json();

      if (err)
        return alarm.error(`Registro no Eliminada`);

      codeWarning.empty();

      alarm.success(`Registro eliminada`);
    })

    /* 
      ==================================================
      ===================== SOCKET =====================
      ==================================================
    */

    socket.on('/logger/warn/writeStart', data => {
      codeWarning.addStart(data.log);
      sizeWarning.textContent = bytesToKb(data.stat.size);
    })

  } catch ({ message, stack }) {
    socket.emit('/err/client', { message, stack, url: window.location.href })
  }
})