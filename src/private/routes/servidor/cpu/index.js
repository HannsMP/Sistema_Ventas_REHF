$('.content-body').ready(async () => {

  /* 
    ==================================================
    ======================= DOM =======================
    ==================================================
  */

  let cardCores = document.getElementById('card-cores');
  let cardCoresBody = cardCores.querySelector('.card-body');
  let cardTittleCpu = cardCores.querySelector('.card-tittle');
  let btnPowerOff = cardCores.querySelector('#btn-power-off');
  let btnPowerReset = cardCores.querySelector('#btn-power-reset');

  let cardRam = document.getElementById('card-ram');
  let cardRamCanvas = cardRam.querySelector('canvas');
  let cardtittleRam = cardRam.querySelector('.card-tittle');

  let cardDisc = document.getElementById('card-disc');
  let cardDiscCanvas = cardDisc.querySelector('canvas');
  let [cardtittleDisc, cardMarkDisc] = cardDisc.querySelectorAll('.card-tittle');

  /* 
    ==================================================
    ====================== CHART ======================
    ==================================================
  */

  function generarColorPastel() {
    let
      r = Math.floor((Math.random() * 127) + 127), // 127-254
      g = Math.floor((Math.random() * 127) + 127), // 127-254
      b = Math.floor((Math.random() * 127) + 127); // 127-254
    return `rgb(${r}, ${g}, ${b})`;
  }

  function chartTime(canva, current, max, label) {
    let x = Array(60)
      , y = Array(59);
    x.fill(undefined);
    y.fill(undefined);

    x = x.map((_, i) => i + 1);
    y.push(current);

    return new Chart(canva.getContext("2d"), {
      type: "line",
      data: {
        labels: x,
        datasets: [{
          label,
          data: y,
          borderColor: generarColorPastel(),
          fill: 'start'
        }]
      },
      options: { scales: { y: { min: 0, max } } }
    });
  }

  /* 
    ==================================================
    ==================== DATA CPU ====================
    ==================================================
  */

  query.post.cookie("/api/cpu/readCpu")
    .then(async resReadCpu => {

      /** @type {{CpuData: import('systeminformation').Systeminformation.CpuData}} */
      let { CpuData } = await resReadCpu.json();

      let { manufacturer, brand } = CpuData;

      cardTittleCpu.textContent = `Procesador: ${manufacturer} - ${brand}`

    });

  /* 
    ==================================================
    =================== DATA CORES ===================
    ==================================================
  */

  query.post.cookie("/api/cpu/readCore")
    .then(async resReadCore => {

      /** @type {{CurrentLoadData: import('systeminformation').Systeminformation.CurrentLoadData}} */
      let { CurrentLoadData } = await resReadCore.json();

      let container = document.createElement('div');
      container.className = 'cards';
      cardCoresBody.append(container);

      let cores = []

      let coresLength = CurrentLoadData.cpus.length;

      for (let c = 0; c < coresLength; c += 2) {
        let col = document.createElement('div');
        col.className = 'f-col';

        for (let r = 0; r < 2; r++) {
          let index = c + r;
          let core = CurrentLoadData.cpus[index];

          if (!core) return;

          let canva = document.createElement("canvas");
          let chart = chartTime(canva, core.load, Math.floor(core.rawLoad), `NUCLEO ${index + 1}`);

          col.append(canva);
          cores.push({ core, canva, chart });

        }

        container.append(col);
      }

      setInterval(async () => {
        let resReadCore = await query.post.cookie("/api/cpu/readCore");

        /** @type {{CurrentLoadData: import('systeminformation').Systeminformation.CurrentLoadData}} */
        let { CurrentLoadData } = await resReadCore.json();

        cores.forEach(({ chart }, i) => {
          if (60 <= chart.data.datasets[0].data.length)
            chart.data.datasets[0].data.shift()

          chart.data.datasets[0].data.push(CurrentLoadData.cpus[i].load);
          chart.options.scales.y.max = CurrentLoadData.cpus[i].rawLoad;
          chart.update();
        })

      }, 1000);

    });

  /* 
    ==================================================
    ==================== DATA RAM ====================
    ==================================================
  */

  let bytesToGb = (bit) => (bit / (1024 ** 3)).toFixed(2);

  query.post.cookie("/api/cpu/readRam")
    .then(async resReadRam => {

      /** @type {{MemData: import('systeminformation').Systeminformation.MemData}} */
      let { MemData } = await resReadRam.json();

      let totalRam = bytesToGb(MemData.total);
      let usedRam = bytesToGb(MemData.used);
      let chartRam = chartTime(cardRamCanvas, usedRam, totalRam, `RAM ${1}`)

      cardtittleRam.textContent = `Ram: ${totalRam} Gb`;

      setInterval(async () => {
        let resReadRam = await query.post.cookie("/api/cpu/readRam");

        /** @type {{MemData: import('systeminformation').Systeminformation.MemData}} */
        let { MemData } = await resReadRam.json();

        if (60 <= chartRam.data.datasets[0].data.length)
          chartRam.data.datasets[0].data.shift()

        chartRam.data.datasets[0].data.push(bytesToGb(MemData.used));

        chartRam.update();

      }, 1000);

    });

  /* 
    ==================================================
    ==================== DATA DISK ====================
    ==================================================
  */

  query.post.cookie("/api/cpu/readDisk")
    .then(async resReadDisk => {

      /** @type {{DiskLayoutData: import('systeminformation').Systeminformation.DiskLayoutData[]}} */
      let { DiskLayoutData } = await resReadDisk.json();

      let { interfaceType, type, name } = DiskLayoutData[0];

      cardMarkDisc.textContent = `${interfaceType} - ${type} : ${name}`;

    });

  /* 
    ==================================================
    ===================== DATA FS =====================
    ==================================================
  */

  query.post.cookie("/api/cpu/readFs")
    .then(async resReadFs => {

      /** @type {{FsSizeData: import('systeminformation').Systeminformation.FsSizeData[]}} */
      let { FsSizeData } = await resReadFs.json();

      let useDisk = FsSizeData[0].use;
      let chartDisk = chartTime(cardDiscCanvas, useDisk, 100, `${FsSizeData[0].fs} ${1} &`)

      let totalDisk = bytesToGb(FsSizeData[0].size);
      cardtittleDisc.textContent = `Disco: ${totalDisk} Gb`;

      setInterval(async () => {
        let resReadRam = await query.post.cookie("/api/cpu/readFs");

        /** @type {{FsSizeData: import('systeminformation').Systeminformation.FsSizeData[]}} */
        let { FsSizeData } = await resReadRam.json();

        if (60 <= chartDisk.data.datasets[0].data.length)
          chartDisk.data.datasets[0].data.shift()

        chartDisk.data.datasets[0].data.push(FsSizeData[0].use);
        let totalDisk = bytesToGb(FsSizeData[0].size);
        cardtittleDisc.textContent = `Disco: ${totalDisk} Gb`;

        chartDisk.update();

      }, 1000);

    });

  /* 
    ==================================================
    ===================== APAGAR =====================
    ==================================================
  */

  if (btnPowerOff) {
    btnPowerOff.addEventListener('click', _ => {
      Swal.fire({
        title: "Está seguro?",
        text: "Vas a apagar el sistema.",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "rgb(13, 204, 242)",
        cancelButtonColor: "rgb(220, 53, 69)",
        confirmButtonText: "Si, Apagalo!",
        cancelButtonText: "Cancelar",
        background: 'rgb(24, 20, 47)',
        color: 'rgb(255, 255, 255)',
      })
        .then(async (result) => {
          if (!result.isConfirmed) return;

          query.post.cookie("/api/cpu/powerOff");
        });
    })
  }

  /* 
    ==================================================
    ==================== REINICIAR ====================
    ==================================================
  */

  if (btnPowerReset) {
    btnPowerReset.addEventListener('click', _ => {
      Swal.fire({
        title: "Está seguro?",
        text: "Vas a reiniciar el sistema.",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "rgb(13, 204, 242)",
        cancelButtonColor: "rgb(220, 53, 69)",
        confirmButtonText: "Si, Reinicialo!",
        cancelButtonText: "Cancelar",
        background: 'rgb(24, 20, 47)',
        color: 'rgb(255, 255, 255)',
      })
        .then(async (result) => {
          if (!result.isConfirmed) return;

          query.post.cookie("/api/cpu/reset");
        });
    })
  }

})