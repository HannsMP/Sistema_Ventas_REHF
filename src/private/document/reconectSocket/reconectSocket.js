var socket;
document.addEventListener('DOMContentLoaded', () => {
  function reconectSocket() {
    setTimeout(async _ => {
      try {
        let res = await query.get('/socket.io/socket.io.js')
        if (!res.ok) return reconectSocket();
        window.location.reload();
      } catch {
        reconectSocket();
      }
    }, 1000)
  }

  function initializeSocket() {
    socket = io();

    socket.on('connect', () => {
      alarm.success('Conexión establecida');
    });

    socket.on('disconnect', () => {
      alarm.error('Desconectado. Intentando reconectar...');
      reconectSocket();
    });

    socket.on('reconnect_attempt', () => {
      alarm.info('Intentando reconectar...');
      reconectSocket();
    });

    socket.on('reconnect_error', (error) => {
      alarm.error('Error al reconectar: ' + error.message);
      reconectSocket();
    });

    socket.on('reconnect_failed', () => {
      alarm.error('Fallo al reconectar. Intentando nuevamente...');
      reconectSocket();
    });
  }

  initializeSocket();
})