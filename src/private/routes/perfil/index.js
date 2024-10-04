$('.content-body').ready(() => {

  /* 
    ==================================================
    ===================== IMAGEN =====================
    ==================================================
  */

  let cardFotoActual = document.getElementById('foto-actual');
  let inputFoto = cardFotoActual.querySelector('.imagen-unic');
  let btnFoto = cardFotoActual.querySelector('.btn');

  let editarImagenUnic = new ImagenUnic(inputFoto);

  btnFoto.addEventListener('click', async () => {
    let formData = new FormData();

    let file = editarImagenUnic.files[0];
    if (!file) return formError('cambia de imagen para guardar', inputFoto.parentNode);

    formData.append('foto_file', file);

    let resUsuarios = await query.post.form.cookie("/api/usuarios/profile/updateFoto", formData);

    /** @type {{err: string, OkPacket: import('mysql').OkPacket, list: {[column:string]: string|number}[]}} */
    let { err } = await resUsuarios.json();

    if (err)
      return alarm.warn('No se pudo Editar');

    alarm.success(`Avatar actualizado`);

  })

  /* 
    ==================================================
    ===================== CHANGE =====================
    ==================================================
  */

  let cardCambioContraseña = document.getElementById('cambio-contraseña');
  let toggleCambio = cardCambioContraseña.querySelectorAll('.bx-show');
  let [passwordCurrent, passwordNew, passwordRepite] = cardCambioContraseña.querySelectorAll('input');
  let btnCambio = cardCambioContraseña.querySelector('.btn');

  toggleCambio.forEach(t => t.addEventListener('click', () => {
    let has = t.classList.contains('bx-show');
    if (has) {
      t.classList.replace('bx-show', 'bx-hide');
      t.nextElementSibling.type = 'text';
    }
    else {
      t.classList.replace('bx-hide', 'bx-show');
      t.nextElementSibling.type = 'password';
    }
  }));

  [passwordNew, passwordRepite].forEach(p => p.addEventListener('change', () => {
    let valueNew = passwordNew.value;
    let valueRepite = passwordRepite.value;

    if (!valueRepite) return
    if (valueNew == valueRepite)
      return passwordRepite.except = null;
    passwordRepite.except = 'La nueva contraseña es diferente.';
    formError(passwordRepite.except, passwordRepite.parentNode)
  }))

  btnCambio.addEventListener('click', async () => {
    let jsonData = {};

    let valueCurrent = jsonData.passwordCurrent = passwordCurrent.value;
    if (!valueCurrent) return formError(`Se requiere la actual contraseña.`, passwordCurrent.parentNode);
    let valueRepite = jsonData.passwordNew = passwordRepite.value;
    if (!valueRepite) return formError(`Se requiere la nueva contraseña.`, passwordRepite.parentNode);
    if (valueRepite.except) return formError(valueRepite.except, valueRepite.parentNode);

    let resChangePasword = await query.post.json.cookie("/api/usuarios/profile/updatePassword", jsonData);

    /** @type {{err: string, OkPacket: import('mysql').OkPacket, list: {[column:string]: string|number}[]}} */
    let { err } = await resChangePasword.json();

    if (err)
      return alarm.warn('No se pudo agregar');

    alarm.success(`Contraseña Actualizada`);
  })
})