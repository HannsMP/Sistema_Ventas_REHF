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
      =============== QUERY DATA WARNING ===============
      ==================================================
    */

    let resWarning = await query.post.cookie("/api/logguer/warning/read");

    /** @type {{err: string, OkPacket: import('mysql').OkPacket, list: {[column:string]: string|number}[]}} */
    let { text: textWarning, stat: statWarning } = await resWarning.json();

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

    let cardSuccess = document.getElementById('logguer-success');
    let cardWarning = document.getElementById('logguer-warning');
    let cardError = document.getElementById('logguer-error');

    let boxSuccess = cardSuccess.querySelector('.code');
    let boxWarning = cardWarning.querySelector('.code');
    let boxError = cardError.querySelector('.code');

    let downloadSuccess = cardSuccess.querySelector('#download');
    let downloadWarning = cardWarning.querySelector('#download');
    let downloadError = cardError.querySelector('#download');

    let sizeSuccess = cardSuccess.querySelector('#size');
    let sizeWarning = cardWarning.querySelector('#size');
    let sizeError = cardError.querySelector('#size');

    let clearSuccess = cardSuccess.querySelector('#clear');
    let clearWarning = cardWarning.querySelector('#clear');
    let clearError = cardError.querySelector('#clear');

    let codeSuccess = new Code('.log', boxSuccess, textSuccess);
    let codeWarning = new Code('.log', boxWarning, textWarning);
    let codeError = new Code('.log', boxError, textError);

    sizeSuccess.textContent = bytesToKb(statSuccess.size);
    sizeWarning.textContent = bytesToKb(statWarning.size);
    sizeError.textContent = bytesToKb(statError.size);

    downloadSuccess.addEventListener('click', () => codeSuccess.download());
    downloadWarning.addEventListener('click', () => codeWarning.download());
    downloadError.addEventListener('click', () => codeError.download());

    clearSuccess.addEventListener('click', async _ => {
      let resClear = await query.post.cookie("/api/logguer/success/clear");

      /** @type {{err: string, OkPacket: import('mysql').OkPacket, list: {[column:string]: string|number}[]}} */
      let { err } = await resClear.json();

      if (err)
        return alarm.error(`Registro no Eliminada`);

      codeSuccess.empty();

      alarm.success(`Registro eliminada`);
    })
    clearWarning.addEventListener('click', async _ => {
      let resClear = await query.post.cookie("/api/logguer/warning/clear");

      /** @type {{err: string, OkPacket: import('mysql').OkPacket, list: {[column:string]: string|number}[]}} */
      let { err } = await resClear.json();

      if (err)
        return alarm.error(`Registro no Eliminada`);

      codeWarning.empty();

      alarm.success(`Registro eliminada`);
    })
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

    socket.on('/logger/success/writeStart', data => {
      codeSuccess.addStart(data.log);
      sizeSuccess.textContent = bytesToKb(data.stat.size);
    })

    socket.on('/logger/warn/writeStart', data => {
      codeWarning.addStart(data.log);
      sizeWarning.textContent = bytesToKb(data.stat.size);
    })

    socket.on('/logger/error/writeStart', data => {
      codeError.addStart(data.log);
      sizeError.textContent = bytesToKb(data.stat.size);
    })

  } catch ({ message, stack }) {
    socket.emit('/err/client', { message, stack, url: window.location.href })
  }
})

/* 
["/logger/success/writeStart", {log: "[2024/09/22 06:41:33 pm] [Bot] listo",…}]
0: "/logger/success/writeStart"
1: {
  log  :   "[2024/09/22 06:41:33 pm] [Bot] listo"
  stat  :   {
    dev: 2455857858, 
    mode: 33206, 
    nlink: 1, 
    uid: 0, 
    gid: 0, 
    rdev: 0, 
    blksize: 4096, 
    ino: 1407374884202720,…
    mode: 33206
    mtime: "2024-08-13T23:32:50.332Z"
    mtimeMs: 1723591970332.3145
    nlink: 1
    rdev: 0
    size: 12061
    uid: 0
  }
}
*/