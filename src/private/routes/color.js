$('.content-body').ready(async () => {
  let navTheme = document.querySelector('.nav-theme');

  let inputsColor = document.querySelectorAll('input[type=color]');
  let descargaTheme = document.querySelector('#descarga-theme');
  let restablecerTheme = document.querySelector('#restablecer-theme');

  let updateColor = () => {
    let computed = getComputedStyle(document.documentElement);

    inputsColor.forEach(input => {
      let output = input.nextElementSibling;

      let coloVal = input.rgbVal = computed.getPropertyValue(input.id);

      let [r, g, b] = coloVal.split(',').map(c => Number(c.trim()));

      let rHex = r.toString(16).padStart(2, '0');
      let gHex = g.toString(16).padStart(2, '0');
      let bHex = b.toString(16).padStart(2, '0');

      input.value = `#${rHex}${gHex}${bHex}`;

      output.textContent = `${input.id}: ${input.value}`

      input.addEventListener('input', ev => {
        let hex = input.value;
        output.textContent = `${input.id}: ${hex}`

        let hexR = parseInt(hex.slice(1, 3), 16);
        let hexG = parseInt(hex.slice(3, 5), 16);
        let hexB = parseInt(hex.slice(5, 7), 16);

        let rgbVal = input.rgbVal = `${hexR}, ${hexG}, ${hexB}`

        document.documentElement.style.setProperty(input.id, rgbVal);
      });
    });
  }

  navTheme.addEventListener('click', updateColor);
  updateColor();

  restablecerTheme.addEventListener('click', () => {
    inputsColor.forEach(input => {
      document.documentElement.style.setProperty(input.id, '');
    })
    updateColor();
  })

  descargaTheme.addEventListener('click', () => {
    let textCss = []
    textCss.push(':root[theme=custom] {')
    inputsColor.forEach(input => {
      textCss.push(`/* rgb(${input.rgbVal}) */`)
      textCss.push(`${input.id}: ${input.rgbVal}`)
    })
    textCss.push('}')

    let blob = new Blob([textCss.join('\n')], { type: 'text/plain' });
    let url = URL.createObjectURL(blob);

    let a = document.createElement('a');
    a.href = url;
    a.download = 'theme-color.css';

    document.body.appendChild(a);
    a.click();

    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  })
});
