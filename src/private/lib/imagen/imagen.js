class DataImage {
  /** @param {File} file  */
  constructor(file) {
    this.file = file;
  }

  async toBuffer() {
    let arrayBuffer = await this.file.arrayBuffer();
    return {
      destination: this.file.webkitRelativePath || null,
      buffer: new Uint8Array(arrayBuffer),
      lastModified: this.file.lastModified,
      originalname: this.file.name,
      mimetype: this.file.type,
      size: this.file.size,
    };
  }
}

class ImageManager {
  /** 
   * @type {EventListener<{
   *   insert: File,
   *   change: HTMLDivElement,
   *   remove: HTMLDivElement,
   *   fullScreen: null,
   *   left: null,
   *   rigth: null
   * }>} 
   */
  ev = new EventListener();
  #options;
  #now = undefined;
  /** @type {DataImage[]} */
  files = [];
  /** @param {HTMLInputElement} input  */
  constructor(input, options = { multi: false, autohide: false, justChange: false }) {
    this.input = input;
    this.#options = options;

    input.style.display = 'none';

    this.imgBox = document.createElement('section');
    this.imgBox.classList.add('img-box', 'bx', 'bx-image');

    this.isDisabled = input.hasAttribute('disabled');

    this.upload = document.createElement('div');
    this.upload.classList.add('upload');
    this.upload.innerHTML = `<span>Subir (${input.accept})</span>`;
    this.upload.addEventListener('click', () => this.input.click());
    this.input.addEventListener('change', () => this.create());

    if (this.isDisabled)
      this.input.parentNode.append(this.imgBox);
    else
      this.input.parentNode.append(this.imgBox, this.upload);

    document.addEventListener('keydown', ({ key }) => {
      if (this.#now) {
        if (key === 'Escape') return this.#closeFullScreen();
        if (key === 'ArrowLeft' && this.#options.multi) this.#emitDirectionalEvent('left');
        if (key === 'ArrowRight' && this.#options.multi) this.#emitDirectionalEvent('right');
      }
    });

    let defaultImg = this.input.getAttribute('default');
    if (defaultImg) return this.imgBox.style.backgroundImage = `url(${defaultImg})`;

    let src = this.input.getAttribute('value');
    if (src) this.charge(src);

    if (this.#options.autohide) this.upload.style.display = 'none';
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

  #emitDirectionalEvent(direction) {
    if (direction === 'left' || direction === 'right') this.ev.emit(direction, null);
  }

  #fullScreen(imgDiv) {
    let has = imgDiv.classList.contains('full-screen');
    if (has)
      return this.#closeFullScreen();

    imgDiv.classList.add('full-screen');
    this.#now = imgDiv;
    this.ev.emit('fullScreen', imgDiv);
  }

  #closeFullScreen() {
    if (!this.#now) return;

    this.#now.classList.remove('full-screen');
    this.#now = undefined;
    this.ev.emit('fullScreen', null);
  }

  create() {
    let file = this.input.files[0];
    if (file) {
      const dataImage = new DataImage(file);
      let reader = new FileReader();
      reader.onload = (e) => {
        let imgDiv = document.createElement('div');
        imgDiv.classList.add('img', 'upload');

        let img = document.createElement('img');
        img.src = e.target.result;

        imgDiv.addEventListener('click', () => this.#fullScreen(imgDiv));
        imgDiv.append(img);

        if (!this.#options.justChange) {
          let close = document.createElement('a');
          close.innerHTML = `<i class='bx bx-x'></i>`;
          close.classList.add('close');
          close.addEventListener('click', () => this.#removeImage(imgDiv, dataImage));
          imgDiv.append(close);
        }

        if (!this.#options.multi) {
          this.empty();
          this.ev.emit('change', imgDiv);
          if (this.#options.autohide)
            this.upload.style.display = 'none';
        }

        this.imgBox.append(imgDiv);

        this.files.push(dataImage);
        this.ev.emit('insert', dataImage);
      };
      reader.readAsDataURL(file);
    }
  }

  #removeImage(imgDiv, dataImage) {
    if (dataImage) this.files = this.files.filter(f => f !== dataImage);

    imgDiv.remove();

    this.ev.emit('remove', imgDiv);

    console.log(this.#options);

    if (!this.#options.multi && this.#options.autohide)
      this.upload.style.display = '';
  }

  empty() {
    this.files = [];
    this.imgBox.innerHTML = '';
  }

  charge(imageSrc) {
    let imgDiv = document.createElement('div');
    imgDiv.classList.add('img', 'charge');

    let img = document.createElement('img');
    img.src = imageSrc;
    imgDiv.addEventListener('click', () => this.#fullScreen(imgDiv));

    imgDiv.append(img);

    if (!this.#options.justChange && !this.isDisabled) {
      let close = document.createElement('a');
      close.innerHTML = `<i class='bx bx-x'></i>`;
      close.classList.add('close');
      close.addEventListener('click', () => this.#removeImage(imgDiv));
      imgDiv.append(close);
    }

    if (!this.#options.multi) {
      this.empty();
      this.ev.emit('change', imgDiv);
      if (this.#options.autohide)
        this.upload.style.display = 'none';
    }

    this.imgBox.append(imgDiv);
  }
}