/**
 * @param {string} msg 28 caracteres antes del salto de linea 
 * @param {HTMLDivElement} box 
*/
function formError(msg = '', box, delay = 3000) {
  if (!box.ELEMENT_NODE)
    return;

  let divPop = document.createElement('div');
  divPop.classList.add('pop-error');
  divPop.innerHTML = `<i class='bx bxs-error'></i>`;
  let spanMsg = document.createElement('span');
  divPop.append(spanMsg);

  let boxPosNow = box.style.position;
  box.style.position = 'relativa';
  box.append(divPop);
  spanMsg.innerText = msg;

  setTimeout(() => {
    divPop.remove()
    box.style.position = boxPosNow;
  }, delay);

  throw msg;
}