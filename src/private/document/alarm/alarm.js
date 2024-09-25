document.addEventListener("DOMContentLoaded", () => {
  /** @type {{[x: string]:HTMLElement}} */
  let box = {
    menu: document.createElement('div'),
    info: document.createElement('div'),
    warn: document.createElement('div'),
    error: document.createElement('div'),
    success: document.createElement('div'),
  }

  /** @type {{[x: string]:Element}} */
  let span = {
    info: document.createElement('span'),
    warn: document.createElement('span'),
    error: document.createElement('span'),
    success: document.createElement('span'),
  }

  /** @type {{[x: string]:Element}} */
  let p = {
    info: document.createElement('p'),
    warn: document.createElement('p'),
    error: document.createElement('p'),
    success: document.createElement('p'),
  }

  box.menu.classList.add('alarm-menu');

  box.menu.append(box.warn);
  box.menu.append(box.info);
  box.menu.append(box.success);
  box.menu.append(box.error);

  box.info.classList.add('msg-box');
  box.info.innerHTML = "<div class='icon'><i class='bx bx-info-circle'></i></div>";
  box.info.append(span.info, p.info);
  box.warn.classList.add('msg-box');
  box.warn.innerHTML = "<div class='icon'><i class='bx bx-error'></i></div>";
  box.warn.append(span.warn, p.warn);
  box.error.classList.add('msg-box');
  box.error.innerHTML = "<div class='icon'><i class='bx bx-x'></i></div>";
  box.error.append(span.error, p.error);
  box.success.classList.add('msg-box');
  box.success.innerHTML = "<div class='icon'><i class='bx bx-check'></i></div>";
  box.success.append(span.success, p.success);

  let value = {};

  document.body.append(box.menu);

  let hideBox = (w, d = true) => {
    box[w].classList.toggle('hide', d)
  }

  let hideP = (w, d = false) => {
    p[w].classList.toggle('hide', d)
  }

  let increment = (w) => {
    span[w].textContent = value[w] += 1;
    hideBox(w, false);
  }

  let reset = (w) => {
    hideBox(w);
    value[w] = 0;
  }

  let msgs = (w, m, d = 5000) => {
    p[w].textContent = m;
    hideP(w);

    clearTimeout(p[w].timeout);
    p[w].timeout = setTimeout(() => {
      hideP(w, 'none');
    }, d);
  }

  window.alarm = {
    info(msg, delay) {
      increment('info');
      msgs('info', msg, delay);
    },
    warn(msg, delay) {
      increment('warn');
      msgs('warn', msg, delay);
    },
    error(msg, delay) {
      increment('error');
      msgs('error', msg, delay);
    },
    success(msg, delay) {
      increment('success');
      msgs('success', msg, delay);
    },
    reset() {
      reset('info');
      reset('warn');
      reset('error');
      reset('success');
    }
  }

  alarm.reset()
})