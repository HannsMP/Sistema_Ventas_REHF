$('.content-body').ready(async () => {
  try {

    let bytesToKb = (bit) => (bit / (1024 ** 2)).toFixed(2);

    /* 
      ==================================================
      ================ QUERY DATA SYSTEM ================
      ==================================================
    */
    let resSystem = await query.post.cookie("/api/logguer/system/read");

    /** @type {{err: string, OkPacket: import('mysql').OkPacket, list: {[column:string]: string|number}[]}} */
    let { text: textSystem, stat: statSystem, exist } = await resSystem.json();

    /* 
      ==================================================
      ======================= DOM =======================
      ==================================================
    */

    let cardSystem = document.getElementById('logguer-system');

    if (!exist)
      return cardSystem.remove();


    let boxSystem = cardSystem.querySelector('.code');

    let downloadSystem = cardSystem.querySelector('#download');

    let sizeSystem = cardSystem.querySelector('#size');

    let clearSystem = cardSystem.querySelector('#clear');

    let codeSystem = new Code('.log', boxSystem, textSystem);

    sizeSystem.textContent = bytesToKb(statSystem.size);

    downloadSystem.addEventListener('click', () => codeSystem.download());

    clearSystem.addEventListener('click', async _ => {
      let resClear = await query.post.cookie("/api/logguer/system/clear");

      /** @type {{err: string, OkPacket: import('mysql').OkPacket, list: {[column:string]: string|number}[]}} */
      let { err } = await resClear.json();

      if (err)
        return alarm.error(`Registro no Eliminada`);

      codeSystem.empty();

      alarm.success(`Registro eliminada`);
    })

    /* 
      ==================================================
      ===================== SOCKET =====================
      ==================================================
    */

    socket.on('/logger/success/writeStart', data => {
      codeSystem.addStart(data.log);
      sizeSystem.textContent = bytesToKb(data.stat.size);
    })

  } catch ({ message, stack }) {
    socket.emit('/err/client', { message, stack, url: window.location.href })
  }
})