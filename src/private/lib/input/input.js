(() => {
  function saveCursorPosition(input) {
    return input.selectionStart;
  }

  function restoreCursorPosition(input, position) {
    input.setSelectionRange(position, position);
  }

  window.autoHeight = function (input) {
    const cursorPos = saveCursorPosition(input);
    input.style.height = 'auto';
    input.style.height = (input.scrollHeight) + "px";
    restoreCursorPosition(input, cursorPos);
  }

  window.inputInt = function (input, limit = Infinity) {
    const cursorPos = saveCursorPosition(input);
    if (input.value.length > limit) return input.value = input.lvp;
    input.value = input.value.replace(/[^0-9]/g, '');
    restoreCursorPosition(input, cursorPos);
  }

  window.inputFloat = function (input, limit = Infinity, fixed = 2) {
    const cursorPos = saveCursorPosition(input);
    input.lvp = input.lvp ?? "";
    let v = input.value;

    let integerLimit = limit - (fixed + 1);

    if (v.length > limit) {
      input.value = input.lvp;
      return restoreCursorPosition(input, cursorPos);
    }

    if (v.length < input.lvp.length) {
      input.value = input.lvp = v;
      return restoreCursorPosition(input, cursorPos);
    }

    v = v.replace(/[^0-9.]/g, '');
    let l = v.split('').filter(s => s == '.').length;
    if (l > 1) {
      input.value = input.lvp;
      return restoreCursorPosition(input, cursorPos);
    }

    let decimalPart = v.split('.')[1];
    if (decimalPart && decimalPart.length > fixed) {
      input.value = input.lvp;
      return restoreCursorPosition(input, cursorPos);
    }

    let integerPart = v.split('.')[0];
    if (integerPart.length > integerLimit) {
      input.value = input.lvp;
      return restoreCursorPosition(input, cursorPos);
    }

    input.value = input.lvp = v;
    restoreCursorPosition(input, cursorPos);
  }

  window.inputNoSpace = function (input, limit = Infinity) {
    const cursorPos = saveCursorPosition(input);
    input.lvp = input.lvp ?? "";
    if (input.value.length > limit) {
      input.value = input.lvp;
      return restoreCursorPosition(input, cursorPos);
    }
    let v = input.value;
    if (v.endsWith(' ')) input.value = input.lvp;
    input.lvp = input.value;
    restoreCursorPosition(input, cursorPos);
  }

  window.inputLimit = function (input, limit = Infinity) {
    const cursorPos = saveCursorPosition(input);
    input.lvp = input.lvp ?? "";
    if (input.value.length > limit) {
      input.value = input.lvp;
      return restoreCursorPosition(input, cursorPos);
    }
    input.lvp = input.value;
    restoreCursorPosition(input, cursorPos);
  }

  window.inputCapitalize = function (input, limit = Infinity) {
    const cursorPos = saveCursorPosition(input);
    input.lvp = input.lvp ?? "";
    if (input.value.length > limit) {
      input.value = input.lvp;
      return restoreCursorPosition(input, cursorPos);
    }
    let v = input.value;
    input.value = v.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()).join(' ');
    input.lvp = input.value;
    restoreCursorPosition(input, cursorPos);
  }

  window.inputUppercase = function (input, limit = Infinity) {
    const cursorPos = saveCursorPosition(input);
    input.lvp = input.lvp ?? "";
    if (input.value.length > limit) {
      input.value = input.lvp;
      return restoreCursorPosition(input, cursorPos);
    }
    input.value = input.value.toUpperCase();
    input.lvp = input.value;
    restoreCursorPosition(input, cursorPos);
  }

  window.inputLowercase = function (input, limit = Infinity) {
    const cursorPos = saveCursorPosition(input);
    input.lvp = input.lvp ?? "";
    if (input.value.length > limit) {
      input.value = input.lvp;
      return restoreCursorPosition(input, cursorPos);
    }
    input.value = input.value.toLowerCase();
    input.lvp = input.value;
    restoreCursorPosition(input, cursorPos);
  }

  window.inputSentenceCase = function (input, limit = Infinity) {
    const cursorPos = saveCursorPosition(input);
    input.lvp = input.lvp ?? "";
    if (input.value.length > limit) {
      input.value = input.lvp;
      return restoreCursorPosition(input, cursorPos);
    }
    let v = input.value.toLowerCase();
    if (v.at(-2) == '.') {
      input.value = input.lvp;
      return restoreCursorPosition(input, cursorPos);
    }
    input.value = v.replace(/(^\s*\w|[.!?]\s*\w)/g, c => c.toUpperCase());
    input.lvp = input.value;
    restoreCursorPosition(input, cursorPos);
  }

  window.inputParagraphCase = function (input, limit = Infinity) {
    const cursorPos = saveCursorPosition(input);
    input.lvp = input.lvp ?? "";
    if (input.value.length > limit) {
      input.value = input.lvp;
      return restoreCursorPosition(input, cursorPos);
    }
    let v = input.value.toLowerCase();
    input.value = v.replace(/(^\s*\w|[.!?]\s*\w)/g, c => c.toUpperCase());
    input.lvp = input.value;
    restoreCursorPosition(input, cursorPos);
  }
})()