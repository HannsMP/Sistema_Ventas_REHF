class FileUnic {
  /**
   * @type {EventListener<{
   *   upload: {file:File},
   *   remove: {file:File},
   *   empty: undefined
   * }>}
   */
  ev = new EventListener
  files = [];
  /** @param {HTMLInputElement} input  */
  constructor(input) {
    this.input = input;
    input.style.display = 'none';

    this.fileBox = document.createElement('section');
    this.fileBox.classList.add('file-box', 'bx', 'bx-file');

    this.isDisabled = input.hasAttribute('disabled');

    this.upload = document.createElement('div');
    this.upload.classList.add('upload');
    this.upload.innerHTML = `<span>Subir archivo</span>`;
    this.upload.addEventListener('click', () => this.input.click());
    this.input.addEventListener('change', () => this.create());

    if (this.isDisabled)
      this.input.parentNode.append(this.fileBox);
    else
      this.input.parentNode.append(this.fileBox, this.upload);
  }

  state(enabled) {
    if (enabled) {
      this.input.parentNode.append(this.upload);
      this.input.setAttribute('disabled', '');
    } else {
      this.upload.remove();
      this.input.removeAttribute('disabled');
    }
    this.isDisabled = !enabled;
  }

  create() {
    let file = this.input.files[0];
    if (file) {
      this.fileBox.innerHTML = '';

      let fileDiv = document.createElement('div');
      fileDiv.classList.add('file', 'upload');

      let icon = document.createElement('i');
      icon.classList.add('bx', 'bx-file');

      let name = document.createElement('span');
      name.textContent = file.name;

      let close = document.createElement('a');
      close.innerHTML = `<i class='bx bx-x'></i>`;
      close.classList.add('close');
      close.addEventListener('click', () => {
        this.files = [];
        this.input.value = ''; // Limpia el input.files
        fileDiv.remove();
        this.ev.emit('remove', { file });
      });

      fileDiv.append(icon, name, close);
      this.fileBox.append(fileDiv);

      this.ev.emit('upload', { file });
      this.files[0] = file;
    }
  }

  empty() {
    this.files = [];
    this.input.value = ''; // Limpia el input.files
    this.fileBox.innerHTML = '';
    this.ev.emit('empty');
  }
}

class FileMulti {
  /**
   * @type {EventListener<{
   *   upload: {file:File},
   *   remove: {file:File},
   *   empty: undefined
   * }>}
   */
  ev = new EventListener
  files = [];
  /** @param {HTMLInputElement} input  */
  constructor(input) {
    this.input = input;
    input.style.display = 'none';

    this.fileBox = document.createElement('section');
    this.fileBox.classList.add('file-box', 'bx', 'bx-file');

    this.isDisabled = input.hasAttribute('disabled');

    this.upload = document.createElement('div');
    this.upload.classList.add('upload');
    this.upload.innerHTML = `<span>Subir archivos</span>`;
    this.upload.addEventListener('click', () => this.input.click());
    this.input.addEventListener('change', () => this.create());

    if (this.isDisabled)
      this.input.parentNode.append(this.fileBox);
    else
      this.input.parentNode.append(this.fileBox, this.upload);
  }

  state(enabled) {
    if (enabled) {
      this.input.parentNode.append(this.upload);
      this.input.setAttribute('disabled', '');
    } else {
      this.upload.remove();
      this.input.removeAttribute('disabled');
    }
    this.isDisabled = !enabled;
  }

  create() {
    Array.from(this.input.files).forEach(file => {
      let fileDiv = document.createElement('div');
      fileDiv.classList.add('file', 'upload');

      let icon = document.createElement('i');
      icon.classList.add('bx', 'bx-file');

      let name = document.createElement('span');
      name.textContent = file.name;

      let close = document.createElement('a');
      close.innerHTML = `<i class='bx bx-x'></i>`;
      close.classList.add('close');
      close.addEventListener('click', () => {
        this.files = this.files.filter(f => f !== file);
        this.updateInputFiles(); // Actualiza el input.files
        fileDiv.remove();
        this.ev.emit('remove', { file });
      });

      fileDiv.append(icon, name, close);
      this.fileBox.append(fileDiv);

      this.ev.emit('upload', { file });
      this.files.push(file);
    });
  }

  updateInputFiles() {
    // Crea un DataTransfer para actualizar input.files con la lista actualizada
    const dataTransfer = new DataTransfer();
    this.files.forEach(file => dataTransfer.items.add(file));
    this.input.files = dataTransfer.files;
  }

  empty() {
    this.files = [];
    this.input.value = ''; // Limpia el input.files
    this.fileBox.innerHTML = '';
    this.ev.emit('empty');
  }
}