class ImagenUnic {
  files = [];
  #now = undefined;
  /** @param {Element} input  */
  constructor(input) {
    this.input = input;
    input.style.display = 'none'

    this.imgBox = document.createElement('section');
    this.imgBox.classList.add('img-box', 'bx', 'bx-image');

    this.isDisabled = input.hasAttribute('disabled')

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
      if (this.#now && key == 'Escape') return this.#now.click();
    })

    let src = this.input.getAttribute('value');
    if (src) this.charge(src);
  }
  state(enabled) {
    if (enabled) {
      this.input.parentNode.append(this.upload);
      this.input.setAttribute('disabled', '');
    }
    else {
      this.upload.remove();
      this.input.removeAttribute('disabled');
    }
    this.isDisabled = !enabled
  }
  #fullScreen(imgDiv, img) {
    let has = imgDiv.classList.contains("full-screen");
    if (has) {
      imgDiv.classList.remove("full-screen");
      return this.#now = undefined;
    } else {
      imgDiv.classList.add("full-screen");
      return this.#now = imgDiv;
    }
  }
  create() {
    let file = this.input.files[0];
    if (file) {
      let reader = new FileReader();
      reader.onload = (e) => {
        this.imgBox.innerHTML = '';

        let imgDiv = document.createElement('div');
        imgDiv.classList.add('img', 'upload');

        let img = document.createElement('img');
        file.src = img.src = e.target.result;
        imgDiv.addEventListener('click', () => this.#fullScreen(imgDiv, img));

        let close = document.createElement('a');
        close.innerHTML = `<i class='bx bx-x'></i>`;
        close.classList.add('close');
        close.addEventListener('click', () => {
          this.files = this.files.filter(f => f != file);
          imgDiv.remove()
        });

        imgDiv.append(img, close);
        this.imgBox.append(imgDiv);
      };
      reader.readAsDataURL(file);

      return this.files[0] = file;
    }
  }
  empty() {
    this.files = [];
    this.imgBox.innerHTML = '';
  }
  charge(imageSrc) {
    this.imgBox.innerHTML = '';

    let imgDiv = document.createElement('div');
    imgDiv.classList.add('img', 'charge');

    let img = document.createElement('img');
    img.src = imageSrc;
    imgDiv.addEventListener('click', () => this.#fullScreen(imgDiv, img));

    if (!this.isDisabled) {
      let close = document.createElement('a');
      close.innerHTML = `<i class='bx bx-x'></i>`;
      close.classList.add('close');
      close.addEventListener('click', () => imgDiv.remove());
      imgDiv.append(img, close);
    }
    else
      imgDiv.append(img);

    this.imgBox.append(imgDiv);
  }
}

class ImagenMulti {
  files = [];
  #before = document.createElement('a');
  #now = undefined;
  #after = document.createElement('a');
  /** @param {Element} input  */
  constructor(input) {
    this.input = input;
    input.style.display = 'none'
    this.imgBox = document.createElement('section');
    this.imgBox.classList.add('img-box', 'bx', 'bx-image');

    this.isDisabled = input.hasAttribute('disabled')

    this.upload = document.createElement('div');
    this.upload.classList.add('upload');
    this.upload.innerHTML = `<span>Subir (${input.accept})</span>`;
    this.upload.addEventListener('click', () => this.input.click());
    this.input.addEventListener('change', () => this.create());

    if (this.isDisabled)
      this.input.parentNode.append(this.imgBox);
    else
      this.input.parentNode.append(this.imgBox, this.upload);

    this.#before.innerHTML = `<i class='bx bx-left-arrow-circle'></i>`;
    this.#before.classList.add('before');
    this.#before.addEventListener('click', (e) => this.#prev(e));
    this.#after.innerHTML = `<i class='bx bx-right-arrow-circle'></i>`;
    this.#after.classList.add('after');
    this.#after.addEventListener('click', (e) => this.#next(e));

    document.addEventListener('keydown', ({ key }) => {
      if (this.#now) {
        if (key == 'ArrowLeft') return this.#prev();
        if (key == 'ArrowRight') return this.#next();
        if (key == 'Escape') return this.#now.click();
      }
    })

    document.addEventListener('keydown', ({ key }) => {
      if (this.#now && key == 'Escape') return this.#now.click();
    })

    let srcs = this.input.getAttribute('value');
    if (srcs) {
      let data = JSON.parse(srcs);
      if (data.constructor.name == 'Array')
        data.forEach(src => this.charge(src))
    }
  }
  state(enabled) {
    if (enabled) {
      this.input.parentNode.append(this.upload);
      this.input.setAttribute('disabled', '');
    }
    else {
      this.upload.remove();
      this.input.removeAttribute('disabled');
    }
    this.isDisabled = !enabled
  }
  #check(elem) {
    this.#after.classList.toggle('dis', !elem.nextElementSibling);
    this.#before.classList.toggle('dis', !elem.previousElementSibling);
  }
  #prev(e) {
    if (this.#now) {
      let sibling = this.#now.previousElementSibling;
      if (sibling) {
        let img = sibling.querySelector('img');
        sibling.classList.add("full-screen");
        this.#now.classList.remove("full-screen");
        img.after(this.#after);
        img.before(this.#before);
        this.#after.style.display = '';
        this.#before.style.display = '';
        this.#now = sibling;
        this.#check(sibling)
      }
    }
    e?.stopPropagation();
  }
  #next(e) {
    if (this.#now) {
      let sibling = this.#now.nextElementSibling;
      if (sibling) {
        let img = sibling.querySelector('img');
        sibling.classList.add("full-screen");
        this.#now.classList.remove("full-screen");
        img.after(this.#after);
        img.before(this.#before);
        this.#after.style.display = '';
        this.#before.style.display = '';
        this.#now = sibling;
        this.#check(sibling)
      }
    }
    e?.stopPropagation();
  }
  #fullScreen(imgDiv, img) {
    let has = imgDiv.classList.contains("full-screen");

    if (has) {
      imgDiv.classList.remove("full-screen");
      this.#after.style.display = 'none';
      this.#before.style.display = 'none';
      this.#now = undefined;
    } else {
      imgDiv.classList.add("full-screen");
      this.#after.style.display = '';
      this.#before.style.display = '';
      img.after(this.#after);
      img.before(this.#before);
      this.#now = imgDiv;
      this.#check(imgDiv)
    }
  }
  create() {
    let file = this.input.files[0];
    if (file) {
      let reader = new FileReader();
      reader.onload = (e) => {
        let imgDiv = document.createElement('div');
        imgDiv.classList.add('img', 'upload');

        let img = document.createElement('img');
        file.src = img.src = e.target.result;
        imgDiv.addEventListener('click', () => this.#fullScreen(imgDiv, img));

        let close = document.createElement('a');
        close.innerHTML = `<i class='bx bx-x'></i>`;
        close.classList.add('close');
        close.addEventListener('click', () => {
          this.files = this.files.filter(f => f != file);
          imgDiv.remove()
        });

        imgDiv.append(img, close);
        this.imgBox.append(imgDiv);
      };
      reader.readAsDataURL(file);

      this.files.push(file);
    }
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
    imgDiv.addEventListener('click', () => this.#fullScreen(imgDiv, img));

    if (!this.isDisabled) {
      let close = document.createElement('a');
      close.innerHTML = `<i class='bx bx-x'></i>`;
      close.classList.add('close');
      close.addEventListener('click', () => imgDiv.remove());
      imgDiv.append(img, close);
    }
    else
      imgDiv.append(img);

    this.imgBox.append(imgDiv);
  }
}