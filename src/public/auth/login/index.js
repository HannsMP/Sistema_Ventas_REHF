document.addEventListener('DOMContentLoaded', () => {
  let toggleCambio = document.querySelector('#show-pass');
  let inputPass = document.querySelector('#pass');
  toggleCambio.addEventListener('click', () => {
    let has = toggleCambio.classList.contains('bx-show');
    if (has) {
      toggleCambio.classList.replace('bx-show', 'bx-hide');
      inputPass.type = 'text';
    }
    else {
      toggleCambio.classList.replace('bx-hide', 'bx-show');
      inputPass.type = 'password';
    }
  });
})