document.addEventListener('DOMContentLoaded', () => {
  let toggleCambio = document.querySelectorAll('.bx-show');
  toggleCambio.forEach(t => t.addEventListener('click', () => {
    let has = t.classList.contains('bx-show');
    if (has) {
      t.classList.replace('bx-show', 'bx-hide');
      t.previousElementSibling.type = 'text';
    }
    else {
      t.classList.replace('bx-hide', 'bx-show');
      t.previousElementSibling.type = 'password';
    }
  }));
})