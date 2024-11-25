/** @type {import('socket.io').Socket} */
var socket = io();

let CONNECT = new Promise(res => {
  socket.on('connect', () => res());
});

(() => {
  function reconectSocket() {
    setTimeout(async _ => {
      try {
        alarm.info('Intentando reconectar...');
        let res = await query.get('/socket.io/socket.io.js')
        if (!res.ok) return reconectSocket();
        window.location.reload();
      } catch {
        reconectSocket();
      }
    }, 1000)
  }

  let CONNECTED = () => new Promise(res => {
    let timeoutId = setTimeout(_ => CONNECTED(), 200);
    socket.emit('ready', _ => {
      alarm.success('Conexión establecida');
      clearTimeout(timeoutId);
      res();
    });
  })

  document.addEventListener('DOMContentLoaded', async () => {
    socket.on('disconnect', () => {
      alarm.error('Desconectado...');
      reconectSocket();
    });

    socket.on('disconnecting', () => {
      alarm.error('Desconectando...');
      reconectSocket();
    });

    socket.on('error', () => {
      alarm.error('Error...');
      reconectSocket();
    });

    socket.on('reconnect_attempt', () => {
      alarm.error('Intento de reconexión...');
      reconectSocket();
    });

    socket.on('reconnect_error', () => {
      alarm.error('Error de reconexión... ');
      reconectSocket();
    });

    socket.on('reconnect_failed', () => {
      alarm.error('Error al volver a conectar...');
      reconectSocket();
    });

    await CONNECT;
    CONNECTED();
  })
})()