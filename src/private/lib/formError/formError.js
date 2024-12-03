/**
 * @param {string} msg 28 caracteres antes del salto de linea
 * @param {HTMLInputElement} input
*/
function formError(msg = '', input, delay = 3000) {
  if (!input.ELEMENT_NODE)
    return;

  let divPop = document.createElement('div');
  divPop.classList.add('pop-error');
  divPop.innerHTML = `<i class='bx bxs-error'></i>`;
  let spanMsg = document.createElement('span');
  divPop.append(spanMsg);

  let inputPosNow = input.style.position;
  input.style.position = 'relativa';
  input.before(divPop);
  spanMsg.innerText = msg;

  let remove = () => {
    divPop.remove()
    input.style.position = inputPosNow;
  }
  setTimeout(remove, delay);

  let label = input?.parentNode?.querySelector('label')
  if (label) {
    label.style.fontWeight = 'bold';
    label.style.color = 'red';
  }

  input.parentElement.style.borderColor = 'red';
  input.style.color = 'red';

  input.addEventListener('input', () => {
    remove();
    if (label) {
      label.style.fontWeight = '';
      label.style.color = '';
    }

    input.parentElement.style.borderColor = '';
    input.style.color = '';
  }, { once: true })
  return divPop;
}