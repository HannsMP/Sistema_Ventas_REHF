$('.content-body').ready(async () => {

  /*
    ==================================================
    ================ CARDS INVENTARIO ================
    ==================================================
  */

  let resTransaccionesVentas = await query.post.cookie("/api/transacciones_ventas/profile/readAll");
  /** @typedef {{agregar:number, editar:number, eliminar:number, exportar:number, ocultar:number, ver:number}} PERMISOS */
  /** @type {{err: string, OkPacket: import('mysql').OkPacket, list: {[column:string]: string|number}[], permisos: PERMISOS}} */
  let { list: dataTransaccionesVentas } = await resTransaccionesVentas.json();

  let ventasCantidad = document.querySelector('#ventas-cantidad small');
  ventasCantidad.textContent = dataTransaccionesVentas.length || 'Sin ventas';

  let [ventasInsercionFecha, ventasInsercionHora] = document.querySelectorAll('#ventas-fecha small');
  ventasInsercionFecha.textContent = formatTime('YYYY / MM / DD');
  ventasInsercionHora.textContent = dataTransaccionesVentas.at(-1)?.hora || 'Sin datos';

})