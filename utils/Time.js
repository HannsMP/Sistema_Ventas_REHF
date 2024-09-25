class Time {
  #formatoStr = "aaaa/MM/dd hh:mm:ss tt";
  #gmt;
  /**
 * @param {number} gmt
 * @param {string} format - Una cadena de texto que especifica el formato de la fecha y hora. Los siguientes son los formatos que puedes usar:
 * "HH" - La hora en formato de 24 horas, con un cero a la izquierda.
 * "hh" - La hora en formato de 12 horas, con un cero a la izquierda.
 * "mm" - Los minutos, con un cero a la izquierda.
 * "ss" - Los segundos, con un cero a la izquierda.
 * "H" - La hora en formato de 24 horas.
 * "h" - La hora en formato de 12 horas.
 * "m" - Los minutos.
 * "s" - Los segundos.
 * "dddd" - El nombre completo del día de la semana.
 * "ddd" - El nombre abreviado del día de la semana.
 * "dd" - El día del mes, con un cero a la izquierda.
 * "d" - El día del mes.
 * "MMMM" - El nombre completo del mes.
 * "MMM" - El nombre abreviado del mes.
 * "MM" - El número del mes, con un cero a la izquierda.
 * "M" - El número del mes.
 * "aaaa" - El año completo.
 * "aa" - Los últimos dos dígitos del año.
 * "tt" - "am" para las horas antes del mediodía y "pm" para las horas después del mediodía.
 */
  constructor(gmt = 0, format = this.#formatoStr) {
    this.#gmt = gmt;
    this.#formatoStr = format;
  }
  /**
   * @param {string} format - Una cadena de texto que especifica el formato de la fecha y hora. Los siguientes son los formatos que puedes usar:
   * "HH" - La hora en formato de 24 horas, con un cero a la izquierda.
   * "hh" - La hora en formato de 12 horas, con un cero a la izquierda.
   * "mm" - Los minutos, con un cero a la izquierda.
   * "ss" - Los segundos, con un cero a la izquierda.
   * "H" - La hora en formato de 24 horas.
   * "h" - La hora en formato de 12 horas.
   * "m" - Los minutos.
   * "s" - Los segundos.
   * "DDDD" - El nombre completo del día de la semana.
   * "DDD" - El nombre abreviado del día de la semana.
   * "DD" - El día del mes, con un cero a la izquierda.
   * "D" - El día del mes.
   * "MMMM" - El nombre completo del mes.
   * "MMM" - El nombre abreviado del mes.
   * "MM" - El número del mes, con un cero a la izquierda.
   * "M" - El número del mes.
   * "YYYY" - El año completo.
   * "YY" - Los últimos dos dígitos del año.
   * "tt" - "am" para las horas antes del mediodía y "pm" para las horas después del mediodía.
   */
  format(format = this.#formatoStr, time = new Date()) {

    let segundo = time.getSeconds();
    let minuto = time.getMinutes();
    let hora = time.getHours() + this.#gmt;
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
      tt: _ => hora >= 12 ? 'pm' : 'am'
    };

    return format.replace(/hh|mm|ss|h|m|s|DDDD|DDD|DD|D|MMMM|MMM|MM|M|YYYY|YY|tt/g, match => formats[match]());
  }
}

module.exports = Time;