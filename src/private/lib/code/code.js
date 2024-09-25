(()=>{
  const escapeHTML = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  };
  
  /** @type {{[formato:string]:(text:string, type: string, noDraw:boolean)=>{codeLine:HTMLSpanElement, row:HTMLSpanElement}}} */
  const formats = {
    '.log': (text, type, noDraw) => {
      let codeLine = document.createElement('span');
  
      codeLine.classList.add('code-line');
      codeLine.innerHTML = `<span class="code-row"></span>`;
      if (!noDraw)
        codeLine.innerHTML += text
          .replace(
            /[&<>"']/g,
            m => escapeHTML[m]
          )
          .replace(
            /^(\s\s)+/,
            bracket => bracket
              .replace(
                /\s\s/g,
                '<span class="code-bracket">  </span>'
              )
          )
          .replace(
            /\[(\d{4}\/\d{2}\/\d{2} \d{2}:\d{2}:\d{2} (?:am|pm))\](\s)?/,
            datetime => `<span class="bright-green">${datetime}</span>`
          )
          .replace(
            /\[[A-Z|a-z]+\](\s)?/,
            tittle => `<span class="bright-pink">${tittle}</span>`
          )
          .replace(
            /[A-Z|a-z]+\:\s/,
            sub => `<span class="bright-orange weight-bold">${sub}</span>`
          )
          .replace(
            /(http|https):\/\/(\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}|localhost)(:\d{1,5})?(\/\S+)?(\s)?/,
            url => `<a class="bright-ligthblue style-italic" href="${url}">${url}</a>`
          )
          .replace(
            /[A-Z]:\\[^:]+(\s)?/gi,
            url => `<span class="bright-ligthblue style-italic">${url}</span>`
          )
          .replace(
            /\s(\b\w+(\.\w+)+\b)(\s)?/g,
            code => code
              .split('.')
              .map(
                (c, i) => i == 0
                  ? `<span class="bright-yellow">${c}</span>`
                  : `<span class="bright-red">${c}</span>`
              )
              .join(`<span class="bright-grey weight-bold">.</span>`)
          )
          .replace(
            /\(/g,
            _ => `<span class="bright-orange weight-bold">(</span>`
          )
          .replace(
            /\)/g,
            _ => `<span class="bright-orange weight-bold">)</span>`
          );
      else
        codeLine.innerHTML += text;
  
      if (type)
        codeLine.classList.add(type);
  
      let row = codeLine.querySelector('.code-row');
      return { codeLine, row };
    },
    '.bash': (text, type, noDraw) => {
      let codeLine = document.createElement('span');
  
      codeLine.classList.add('code-line');
      codeLine.innerHTML = `<span class="code-row"></span>`;
      if (!noDraw)
        codeLine.innerHTML += text
          .replace(
            /[&<>"']/g,
            m => escapeHTML[m]
          )
          .replace(
            /^(\s\s)+/,
            bracket => bracket
              .replace(
                /\s\s/g,
                '<span class="code-bracket">  </span>'
              )
          )
          .replace(
            /(cd|dir|mkdir|rmdir|rename|move|start|del|mv|xdg-open|rm|ls)(\s|$)/g,
            (_, p1, p2) => `<span class="bright-orange weight-bold">${p1}</span>${p2 === ' ' ? ' ' : ''}`
          )
          .replace(
            /(\d{2}\/\d{2}\/\d{4}  \d{2}:\d{2})(\s)?/,
            datetime => `<span class="bright-green">${datetime}</span>`
          );
      else
        codeLine.innerHTML += text;
  
      if (type)
        codeLine.classList.add(type);
  
      let row = codeLine.querySelector('.code-row');
      return { codeLine, row };
    }
  }
  
  class Code {
    #divConteiner;
    #text = '';
    #lines;
    #format;
    #ext;
    /** @type {HTMLSpanElement[]} */
    #rows = [];
    #chunkSize = 40;
    #currentChunk = 0;
    /** @param {keyof formats} format @param {HTMLDivElement} divConteiner @param {string} text  */
    constructor(format, divConteiner, text) {
      this.#format = formats[format];
      if (!this.#format) return;
      this.#ext = format;
  
      if (divConteiner.nodeName != 'DIV') return;
      this.#divConteiner = divConteiner;
  
      this.#divConteiner.addEventListener('scroll', () => {
        let { scrollTop, clientHeight, scrollHeight } = divConteiner;
        if (scrollTop + clientHeight < scrollHeight) return;
        this.#loadNextChunk();
        this.#renderIndexRow();
      });
  
      if (typeof text != 'string') return;
  
      this.#text = text;
      this.#lines = text.split('\n');
      this.#loadNextChunk();
      this.#renderIndexRow();
  
    }
    addStart(text, type, noDraw) {
      if (typeof text != 'string') return;
      text.split('\n').forEach(lineText => {
        let { codeLine, row } = this.#format(lineText, type, noDraw);
        this.#divConteiner.prepend(codeLine);
        this.#rows.unshift(row);
      });
      this.#renderIndexRow();
      this.#text += text;
    }
    addEnd(text, type, noDraw) {
      if (typeof text != 'string') return;
      text.split('\n').forEach(lineText => {
        let { codeLine, row } = this.#format(lineText, type, noDraw);
        this.#divConteiner.append(codeLine);
        this.#rows.push(row);
      });
      let l = this.#rows.length;
      this.#rows[l - 1].innerText = l;
      this.#divConteiner.scrollTop = this.#divConteiner.scrollHeight;
      
      this.#renderIndexRow();
      this.#text += '\n' + text;
    }
    empty() {
      this.#divConteiner.innerHTML = '';
      this.#rows = [];
    }
    #renderIndexRow() {
      for (let i = 0; i < this.#rows.length; i++) {
        let r = this.#rows[i];
        r.innerText = i + 1
      }
    }
    #loadNextChunk() {
      let start = this.#currentChunk * this.#chunkSize;
      let end = start + this.#chunkSize;
      let chunk = this.#lines?.slice(start, end);
  
      chunk?.forEach(lineText => {
        let { codeLine, row } = this.#format(lineText);
        this.#divConteiner.append(codeLine);
        this.#rows.push(row);
      });
  
      this.#currentChunk++;
    }
    download(filename = `${Date.now()}${this.#ext}`) {
      let blob = new Blob([this.#text], { type: 'text/plain' });
      let url = URL.createObjectURL(blob);
  
      let a = document.createElement('a');
      a.href = url;
      a.download = filename;
  
      document.body.appendChild(a);
      a.click();
  
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  }
  
  window.Code = Code;
  
  /** @typedef {{name:string, lower:string, box:HTMLDivElement}[]} SuggestionData */
  class Suggestion {
    #show = 0;
    #chunk = [20, 0, 0];
    /** @type {SuggestionData} */
    #dataFilter = [];
    /** @type {SuggestionData} */
    #data = [];
    /** @type {[SuggestionData, HTMLDivElement, number, number]} */
    #selected = [];
    /** @param {HTMLInputElement} input @param {RegExp} test  */
    constructor(input, test) {
      if (input.nodeName != 'INPUT') return;
      this.input = input;
      this.test = test;
      this.sug = document.createElement('div');
      this.sug.className = 'input-suggestion';
  
      /* 
        ==================================================
        ================== GLOBAL CLICK ==================
        ==================================================
      */
  
      this.sug.addEventListener('click', ev => {
        /** @type {HTMLDivElement} */
        let option = ev.target;
        console.log(option);
  
        if (!option?.classList?.contains('option')) return;
  
        let value = input.value;
  
        let beforeCursor = value.slice(0, input.selectionStart);
        beforeCursor = beforeCursor.replace(/\S+$/, '');
        let afterCursor = value.slice(input.selectionStart);
        afterCursor = afterCursor.replace(/^\S+/, '');
  
        let name = option.textContent;
  
        beforeCursor = beforeCursor + name;
  
        input.value = beforeCursor + afterCursor;
  
        input.setSelectionRange(beforeCursor.length, beforeCursor.length)
        option.classList.remove('selected');
        this.sug.remove();
        this.#show = 0;
      })
  
      /* 
        ==================================================
        ===================== SCROLL =====================
        ==================================================
      */
  
      this.sug.addEventListener('scroll', () => {
        let { scrollTop, clientHeight, scrollHeight } = this.sug;
        if (scrollTop + clientHeight < scrollHeight) return;
        this.#loadNextChunk();
      });
  
      /* 
        ==================================================
        ===================== KEYDOWN =====================
        ==================================================
      */
  
      input.addEventListener('keydown', ev => {
        let { ctrlKey, key, code } = ev;
        if (ctrlKey && code === 'Space') {
          ev.preventDefault();
          input.after(this.sug);
          this.#show = 1;
        }
  
        if (!this.#show) return;
        ev.stopPropagation()
  
        if (key == 'Escape') {
          this.sug.remove();
          this.#show = 0;
        }
  
        if (key == 'Enter') {
          let [box, index] = this.#selected;
          let value = input.value;
  
          let beforeCursor = value.slice(0, input.selectionStart);
          beforeCursor = beforeCursor.replace(/\S+$/, '');
          let afterCursor = value.slice(input.selectionStart);
          afterCursor = afterCursor.replace(/^\S+/, '');
  
          let name = this.#dataFilter[index].name;
  
          beforeCursor = beforeCursor + name;
  
          input.value = beforeCursor + afterCursor;
  
          input.setSelectionRange(beforeCursor.length, beforeCursor.length)
          box.classList.remove('selected');
          this.sug.remove();
          this.#show = 0;
        }
  
        if (key == 'ArrowDown') {
          let [box, index] = this.#selected;
          index++;
          let next = this.#dataFilter[index]
          if (!next) return;
  
          next.box.classList.add('selected');
          box.classList.remove('selected');
  
          this.#selected[0] = next.box;
          this.#selected[1]++;
  
          this.sug.scrollTop = this.sug.scrollHeight - ((this.#dataFilter.length - index) * 20);
        }
  
        if (key == 'ArrowUp') {
          let [box, index] = this.#selected;
          index--;
          let after = this.#dataFilter[index]
          if (!after) return;
  
          after.box.classList.add('selected');
          box.classList.remove('selected');
  
          this.#selected[0] = after.box;
          this.#selected[1]--;
  
          this.sug.scrollTop = this.sug.scrollHeight - ((this.#dataFilter.length - index) * 20);
        }
      });
  
      /* 
        ==================================================
        ====================== INPUT ======================
        ==================================================
      */
  
      input.addEventListener('input', ev => {
        let value = input.value;
  
        let beforeCursor = value.slice(0, input.selectionStart);
  
        if (this.test?.test(beforeCursor)) {
          input.after(this.sug);
          this.#show = 1;
        } else {
          this.sug.remove();
          this.#show = 0;
        }
  
        let x = 5 + (beforeCursor.length * 6.59);
  
        if (this.#show) this.sug.style.left = x + 'px';
  
        let lastWord = /\S+$/.exec(beforeCursor);
  
        if (lastWord && lastWord[0] != '') {
          this.#filter(lastWord[0]);
  
          if (!this.#dataFilter.length) {
            this.sug.remove();
            return this.#show = 0;
          }
        }
        else
          this.#dataFilter = this.#data;
  
        this.#draw();
      })
  
      /* 
        ==================================================
        ==================== FOCUSOUT ====================
        ==================================================
      */
  
      input.addEventListener('focusout', _ => {
        setTimeout(() => {
          this.sug.remove();
          this.#show = 0;
        }, 100);
      });
  
    }
    /** @param {string[]} data  */
    push(data) {
  
      data = data?.map(name => {
        let box = document.createElement('div');
        box.textContent = name;
        box.className = 'option';
        let lower = name.toLowerCase()
  
        return { name, lower, box };
      })
      this.#data = this.#order(data);
    }
    #filter(value) {
      value = value.toLowerCase();
      this.#dataFilter = this.#data.filter(({ lower }) => lower.includes(value));
    }
    /** @param {SuggestionData} values */
    #order(values) {
      return values.sort(({ name: a }, { name: b }) => a < b ? -1 : a > b ? 1 : 0)
    }
    /** @param {SuggestionData} values */
    #draw() {
      this.sug.innerHTML = '';
  
      this.#chunk[1] = 0;
      this.#chunk[2] = this.#dataFilter.length;
  
      this.#loadNextChunk();
  
      let { box } = this.#dataFilter[0];
      box.classList.add('selected');
      this.#selected = [box, 0];
    }
    #loadNextChunk() {
      let start = this.#chunk[0] * this.#chunk[1];
      let end = start + this.#chunk[0];
      if (this.#chunk[2] < start) return;
  
      let chunk = this.#dataFilter.slice(start, end);
  
      this.sug.append(...chunk.map(v => {
        v.box.classList.remove('selected');
        return v.box;
      }));
  
      this.#chunk[1]++;
    }
  }
  
  window.Suggestion = Suggestion;
  
  /** @type {(input:HTMLInputElement)=>void} */
  window.inputBash = function (inputField) {
    inputField.previousElementSibling.innerHTML
      = inputField.value
        .replace(
          /(cd|dir|mkdir|rmdir|rename|move|start|del|mv|xdg-open|rm|ls)(\s+)/g,
          (_, p1, p2) => `<span class="bright-orange weight-bold">${p1}</span>${'-'.repeat(p2?.length || 0)}`
        )
        .replace(
          /(\|\||&&)(\s+)/g,
          (_, p1, p2) => `<span class="bright-ligthblue weight-bold">${p1}</span>${'-'.repeat(p2?.length || 0)}`
        )
        .replace(
          /(\!)(\s+)/g,
          (_, p1, p2) => `<span class="bright-red weight-bold">${p1}</span>${'-'.repeat(p2?.length || 0)}`
        )
  }
})()