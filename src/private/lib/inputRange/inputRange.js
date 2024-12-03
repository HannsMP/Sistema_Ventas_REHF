class InputRange {
  /**
   * @type {EventListener<{
   *   changeMin: number,
   *   changeMax: number,
   * }>}
   */
  ev = new EventListener;

  #option;
  #values;
  #isMoving = false;

  /**
   * @param {HTMLDivElement} divBox
   * @param {{ min: number, max: number, step: number, gap?: number }} [option]
   */
  constructor(divBox, option = {}) {
    this.divBox = divBox;
    this.#option = {
      min: option.min ?? 0,
      max: option.max ?? 100,
      step: option.step ?? 1,
      gap: option.gap ?? 0,
    };
    this.#values = {
      min: this.#option.min,
      max: this.#option.max,
    };

    divBox.innerHTML = `<div class="wrapper"><div class="values"><input type="text" id="range1" value="${this.#option.min}" oninput="inputInt(this)"><span>&dash;</span><input type="text" id="range2" value="${this.#option.max}" oninput="inputInt(this)"></div><div class="container-input"><div class="slider-track"></div><div class="circle" id="circle-1"></div><div class="circle" id="circle-2"></div></div></div>`;

    this.displayValOne = divBox.querySelector("#range1");
    this.displayValTwo = divBox.querySelector("#range2");
    this.sliderTrack = divBox.querySelector(".slider-track");
    this.circleOne = divBox.querySelector("#circle-1");
    this.circleTwo = divBox.querySelector("#circle-2");

    this.displayValOne.addEventListener("change", () => this.#handleInputChange(true));
    this.displayValTwo.addEventListener("change", () => this.#handleInputChange());

    this.circleOne.addEventListener("mousedown", () => this.#handleMoveCircle(true));
    this.circleTwo.addEventListener("mousedown", () => this.#handleMoveCircle());

    this.circleOne.addEventListener("touchstart", () => this.#handleMoveCircle(true, true));
    this.circleTwo.addEventListener("touchstart", () => this.#handleMoveCircle(false, true));

    this.#updateCircles();
  }

  get min() {
    return this.#values.min;
  }

  get max() {
    return this.#values.max;
  }

  set min(value) {
    value = Math.max(this.#option.min, Math.min(value, this.#values.max - this.#option.gap));
    if (this.#values.min !== value) {
      this.displayValOne.value = value;
      this.#values.min = value;
      this.#updateCircles();
      if (!this.#isMoving) this.ev.emit("changeMin", value);
    }
  }

  set max(value) {
    value = Math.min(this.#option.max, Math.max(value, this.#values.min + this.#option.gap));
    if (this.#values.max !== value) {
      this.displayValTwo.value = value;
      this.#values.max = value;
      this.#updateCircles();
      if (!this.#isMoving) this.ev.emit("changeMax", value);
    }
  }

  #handleInputChange(isMin) {
    let input = isMin ? this.displayValOne : this.displayValTwo;
    let value = parseInt(input.value, 10);

    if (isNaN(value)) {
      input.value = isMin ? this.#values.min : this.#values.max;
      return;
    }

    value = Math.round(value / this.#option.step) * this.#option.step;

    if (isMin) {
      this.min = value;
    } else {
      this.max = value;
    }

    input.value = value;
  }

  #handleMoveCircle(isMin, isTouch = false) {
    this.#isMoving = true;

    const onMove = (e) => {
      let clientX = isTouch ? e.touches[0].clientX : e.clientX;
      let rect = this.sliderTrack.getBoundingClientRect();
      let percent = Math.min(
        Math.max(0, ((clientX - rect.left) / rect.width) * 100),
        100
      );
      let rawValue = ((percent / 100) * (this.#option.max - this.#option.min)) + this.#option.min;

      let value = Math.round(rawValue / this.#option.step) * this.#option.step;

      if (isMin) {
        this.min = Math.min(value, this.#values.max - this.#option.gap);
      } else {
        this.max = Math.max(value, this.#values.min + this.#option.gap);
      }
    };

    const onEnd = () => {
      this.#isMoving = false;
      if (isMin) {
        this.ev.emit("changeMin", this.#values.min);
      } else {
        this.ev.emit("changeMax", this.#values.max);
      }

      document.removeEventListener(isTouch ? "touchmove" : "mousemove", onMove);
      document.removeEventListener(isTouch ? "touchend" : "mouseup", onEnd);
    };

    document.addEventListener(isTouch ? "touchmove" : "mousemove", onMove);
    document.addEventListener(isTouch ? "touchend" : "mouseup", onEnd);
  }

  #updateCircles() {
    let percent1 = ((this.#values.min - this.#option.min) / (this.#option.max - this.#option.min)) * 100;
    let percent2 = ((this.#values.max - this.#option.min) / (this.#option.max - this.#option.min)) * 100;

    this.circleOne.style.left = `${percent1}%`;
    this.circleTwo.style.left = `${percent2}%`;

    this.sliderTrack.style.background = `linear-gradient(to right, rgb(var(--color-5)) ${percent1}% , rgb(var(--color-6)) ${percent1}% , rgb(var(--color-6)) ${percent2}%, rgb(var(--color-7)) ${percent2}%)`;
  }
}