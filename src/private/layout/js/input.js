window.autoHeight = function (input) {
  input.style.height = 'auto';
  input.style.height = (input.scrollHeight) + "px";
}

window.inputInt = function (input, limit = Infinity) {
  if (input.value.length > limit) return input.value = input.lvp;
  input.value = input.value.replace(/[^0-9]/g, '');
}

window.inputFloat = function (input, limit = Infinity, fixed = 2) {
  input.lvp = input.lvp ?? "";
  let v = input.value;

  // Calcular el límite de la parte entera
  let integerLimit = limit - (fixed + 1);

  // Verificar si la longitud total excede el límite
  if (v.length > limit) return input.value = input.lvp;

  // Verificar si la longitud ha disminuido (borrado de caracteres)
  if (v.length < input.lvp.length) return input.value = input.lvp = v;

  // Eliminar caracteres no numéricos y puntos decimales adicionales
  v = v.replace(/[^0-9.]/g, '');
  let l = v.split('').filter(s => s == '.').length;
  if (l > 1) return input.value = input.lvp;

  // Verificar la longitud de la parte decimal
  let decimalPart = v.split('.')[1];
  if (decimalPart && decimalPart.length > fixed) return input.value = input.lvp;

  // Verificar la longitud de la parte entera
  let integerPart = v.split('.')[0];
  if (integerPart.length > integerLimit) return input.value = input.lvp;

  return input.value = input.lvp = v;
}

window.inputNoSpace = function (input, limit = Infinity) {
  input.lvp = input.lvp ?? "";
  if (input.value.length > limit) return input.value = input.lvp;
  /** @type {string} */
  let v = input.value;
  if (v.endsWith(' ')) input.value = input.lvp;
  input.lvp = input.value;
}

window.inputLimit = function (input, limit = Infinity) {
  input.lvp = input.lvp ?? "";
  if (input.value.length > limit) return input.value = input.lvp;
  input.lvp = input.value;
}

window.inputCapitalize = function (input, limit = Infinity) {
  input.lvp = input.lvp ?? "";
  if (input.value.length > limit) return input.value = input.lvp;

  let v = input.value;
  input.value = v.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()).join(' ');
  input.lvp = input.value;
}

window.inputUppercase = function (input, limit = Infinity) {
  input.lvp = input.lvp ?? "";
  if (input.value.length > limit) return input.value = input.lvp;

  input.value = input.value.toUpperCase();
  input.lvp = input.value;
}

window.inputLowercase = function (input, limit = Infinity) {
  input.lvp = input.lvp ?? "";
  if (input.value.length > limit) return input.value = input.lvp;

  input.value = input.value.toLowerCase();
  input.lvp = input.value;
}

window.inputSentenceCase = function (input, limit = Infinity) {
  input.lvp = input.lvp ?? "";
  if (input.value.length > limit) return input.value = input.lvp;

  let v = input.value.toLowerCase();
  if (v.at(-2) == '.') return input.value = input.lvp;

  input.value = v.replace(/(^\s*\w|[.!?]\s*\w)/g, c => c.toUpperCase());
  input.lvp = input.value;
}

window.inputParagraphCase = function (input, limit = Infinity) {
  input.lvp = input.lvp ?? "";
  if (input.value.length > limit) return input.value = input.lvp;

  let v = input.value.toLowerCase();
  input.value = v.replace(/(^\s*\w|[.!?]\s*\w)/g, c => c.toUpperCase());
  input.lvp = input.value;
}