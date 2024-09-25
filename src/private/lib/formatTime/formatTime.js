(() => {
  window.formatTime = (format, time = new Date(), gmt = 0) => {
    let segundo = time.getSeconds();
    let minuto = time.getMinutes();
    let hora = time.getHours() + gmt;
    let diaSemana = time.getDay();
    let dia = time.getDate();
    let mes = time.getMonth() + 1;
    let año = time.getFullYear();

    let formats = {
      hh: _ => hora % 12 >= 10 ? hora % 12 : `0${hora % 12}`,
      HH: _ => hora >= 10 ? hora : `0${hora}`,
      mm: _ => minuto >= 10 ? minuto : `0${minuto}`,
      ss: _ => segundo >= 10 ? segundo : `0${segundo}`,
      h: _ => hora % 12,
      H: _ => hora,
      m: _ => minuto,
      s: _ => segundo,
      DDDD: _ => ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"][diaSemana],
      DDD: _ => ["Dom.", "Lun.", "Mar.", "Mié.", "Jue.", "Vie.", "Sáb."][diaSemana],
      DD: _ => dia >= 10 ? dia : `0${dia}`,
      D: _ => dia,
      MMMM: _ => ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"][mes],
      MMM: _ => ["Ene.", "Feb.", "Mar.", "Abr.", "May.", "Jun.", "Jul.", "Ago.", "Sep.", "Oct.", "Nov.", "Dic."][mes],
      MM: _ => mes >= 10 ? mes : `0${mes}`,
      M: _ => mes,
      YYYY: _ => año,
      YY: _ => año - (parseInt(año / 100) * 100),
      tt: _ => hora >= 12 ? 'pm' : 'am',
      TT: _ => hora >= 12 ? 'PM' : 'AM'
    };

    return format.replace(/hh|mm|ss|h|m|s|DDDD|DDD|DD|D|MMMM|MMM|MM|M|YYYY|YY|tt|TT/g, match => formats[match]());
  }
})()