document.addEventListener('DOMContentLoaded', () => {
  /*
    ----------------------------------------------------
    ----------------------- Drop -----------------------
    ----------------------------------------------------

    - .drop-unic, .drop-multi
      - .drop
        - .toggle
          - .caret
          - .close
        - .menu
  */

  class Drop {
    /** @param {HTMLElement} drop */
    constructor(drop, container) {
      this.drop = drop;
      this.container = container;
      this.toggle = drop.querySelector('.toggle');
      this.menu = drop.querySelector('.menu');
      this.close = drop.querySelectorAll('.close');

      this.isShow = drop.classList.contains('show')
        || this.toggle.classList.contains('show')
        || this.menu.classList.contains('show');

      this.toggle.addEventListener('click', () => {
        if (!this.isShow) return this.show();
        this.hide();
        this.container.classList.remove('show');
      });

      this.close.forEach(c => this.closeMenu(c))
    }

    closeMenu(element) {
      element.addEventListener('click', () => {
        this.hide();
      })
    }

    toggleShow(state = this.isShow) {
      if (!state) return this.show();
      this.hide();
      this.container.classList.remove('show');
    }

    show() {
      this.drop.classList.add('show');
      this.container.classList.add('show');
      this.toggle.classList.add('show');
      this.menu.classList.add('show');
      this.isShow = true;
    }

    hide() {
      this.drop.classList.remove('show');
      this.toggle.classList.remove('show');
      this.menu.classList.remove('show');
      this.isShow = false;
    }
  }

  /*
    -----------------------------------------------------
    ---------------------- Dropper ----------------------
    -----------------------------------------------------
  */

  class Dropper {
    /** @type {Array<Drop>} */
    collection = [];
    /** @param {HTMLElement} container  */
    constructor(container) {
      this.container = container;
      this.isUnic = container.classList.contains('drop-unic');

      container
        .querySelectorAll('.drop')
        .forEach(drop => {
          this.collection.push(drop.Drop = new Drop(drop, container));
        });

      document.addEventListener('click', (event) => {
        if (!event.target.closest('.drop')) this.closeAll();
      });

      if (this.isUnic)
        this.collection
          .forEach(drop => {
            drop.toggle.addEventListener('click', () => {
              this.collection.forEach(d => {
                if (d.toggle != drop.toggle) d.hide();
              })
            })
          })
    }
    closeAll() {
      this.collection.forEach(d => d.hide());
      this.container.classList.remove('show');
    }
  }

  /* Init */

  document
    .querySelectorAll('.drop-unic, .drop-multi')
    .forEach(container => {
      container.Dropper = new Dropper(container);
    })
})