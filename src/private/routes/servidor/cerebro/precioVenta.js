$('.content-body').ready(async () => {
  try {

    function generarColorPastel() {
      let
        r = Math.floor((Math.random() * 127) + 127), // 127-254
        g = Math.floor((Math.random() * 127) + 127), // 127-254
        b = Math.floor((Math.random() * 127) + 127); // 127-254
      return `rgb(${r}, ${g}, ${b})`;
    }

    /* 
      ==================================================
      =============== QUERY DATA SUCCESS ===============
      ==================================================
    */

    let resPrecioVenta = await query.post.cookie("/api/cerebro/precio_venta/readJson");

    /** @type {{err: string, OkPacket: import('mysql').OkPacket, list: {[column:string]: string|number}[]}} */
    let { data, option, prediccion } = await resPrecioVenta.json();

    let resPrecios = await query.post.cookie('/api/productos/chart/readPrice');

    let { data: dataPrecios } = await resPrecios.json()

    /* 
      ==================================================
      ======================= DOM =======================
      ==================================================
    */

    let prediccionFun = new Function('return ' + prediccion)();

    let Ecard = document.querySelector('#precio_venta');
    let EiterationsTrain = Ecard.querySelector('#iterations_train');
    let EerrorThreshTrain = Ecard.querySelector('#errorThresh_train');

    let EdataPoinTrain = Ecard.querySelector('#data_point');
    let EpredictedTrain = Ecard.querySelector('#predicted');
    let EcompraMinmaxTrain = Ecard.querySelector('#train #compra');
    let EventaMinmaxTrain = Ecard.querySelector('#train #venta');
    let EteracionesTrain = Ecard.querySelector('#train #iteraciones');
    let EerrorTrain = Ecard.querySelector('#train #error');
    let ETamañoTrain = Ecard.querySelector('#train #tamaño');

    let EcompraMinmaxResult = Ecard.querySelector('#result #compra');
    let EventaMinmaxResult = Ecard.querySelector('#result #venta');
    let EteracionesResult = Ecard.querySelector('#result #iteraciones');
    let EerrorResult = Ecard.querySelector('#result #error');
    let EcreacionResult = Ecard.querySelector('#result #creacion');

    let Enet = Ecard.querySelector('#net');
    let Etest = Ecard.querySelector('#test');

    let EbtnRecargar = Ecard.querySelector('#recargar');

    EbtnRecargar.addEventListener('click', () => {
      query.post.json.cookie("/api/cerebro/precio_venta/refresh", {
        iterations: EiterationsTrain.value,
        errorThresh: EerrorThreshTrain.value
      })
        .then(r => r.ok && Ecard.classList.add('load-spinner'))
    })

    EdataPoinTrain.addEventListener('input', () => {
      EpredictedTrain.value = prediccionFun(EdataPoinTrain.value).toFixed(3);
    })

    /* 
      ==================================================
      =================== CHART TEST ===================
      ==================================================
    */

    let graficoNet = new Chart(Enet.getContext("2d"), {
      type: 'line',
      data: {
        labels: ['Capa 1', 'Capa 2', 'Capa 3'],
        datasets: [
          {
            label: 'Pesos',
            data: [],
            borderColor: generarColorPastel(),
            borderWidth: 1
          },
          {
            label: 'Sesgos',
            data: [],
            borderColor: generarColorPastel(),
            borderWidth: 1
          }
        ]
      },
      options: {
        responsive: true,
        scales: {
          y: {
            beginAtZero: true
          }
        }
      }
    });

    /* 
      ==================================================
      =============== CHART NEURAL RESULT ===============
      ==================================================
    */

    let graficoTest = new Chart(Etest.getContext("2d"), {
      type: "line",
      data: {
        labels: [],
        datasets: [
          {
            label: 'Venta Predecida',
            data: [],
            borderColor: generarColorPastel(),
            fill: 'start'
          },
          {
            label: 'Venta Real',
            data: [],
            borderColor: generarColorPastel(),
            fill: 'start'
          }
        ]
      },
      options: {
        responsive: true
      }
    })

    /* 
      ==================================================
      ===================== Render =====================
      ==================================================
    */

    let render = async () => {
      EiterationsTrain.value = data.iterations;
      EerrorThreshTrain.value = data.errorThresh;
      EiterationsTrain.placeholder = data.iterations;
      EerrorThreshTrain.placeholder = data.errorThresh;


      /** -------------------- -------------------- */

      EdataPoinTrain.value = data.limit.min_compra;
      EpredictedTrain.value = prediccionFun(data.limit.min_compra).toFixed(3);

      EcompraMinmaxTrain.textContent = `Min: ${data.limit.min_compra} - Max: ${data.limit.max_compra}`;
      EventaMinmaxTrain.textContent = `Min: ${data.limit.min_venta} - Max: ${data.limit.max_venta}`;
      EteracionesTrain.textContent = `Iteraciones: ${data.iterations}`;
      EerrorTrain.textContent = `Umbral de Error: ${data.errorThresh.toFixed(7)}`;
      ETamañoTrain.textContent = `Cantidad de Muestras: ${data.size}`;

      EcompraMinmaxResult.textContent = `Min: ${data.limit.min_compra} - Max: ${data.limit.max_compra}`;
      EventaMinmaxResult.textContent = `Min: ${prediccionFun(data.limit.min_compra).toFixed(2)} - Max: ${prediccionFun(data.limit.max_compra).toFixed(2)}`;
      EteracionesResult.textContent = `Iteraciones: ${data.trainResult.iterations}`;
      EerrorResult.textContent = `Umbral de Error: ${data.trainResult.error.toFixed(7)}`;
      EcreacionResult.textContent = formatTime('YYYY/MM/DD hh:mm:ss tt', new Date(data.create))

      /** -------------------- -------------------- */

      let netJson = data.netJson;

      graficoNet.data.datasets[0].data = [
        netJson.layers[1].weights.flat(),
        netJson.layers[2].weights.flat(),
        netJson.layers[3].weights.flat()
      ];

      graficoNet.data.datasets[1].data = [
        netJson.layers[1].biases,
        netJson.layers[2].biases,
        netJson.layers[3].biases
      ];

      graficoNet.update();

      /** -------------------- -------------------- */

      graficoTest.data.labels = [];
      graficoTest.data.datasets[0].data = [];
      graficoTest.data.datasets[1].data = [];
      graficoTest.options.scales.y = { min: data.limit.min_venta, max: data.limit.max_venta };

      let index = 0;
      let intervalId = setInterval(() => {
        let { compra, venta } = dataPrecios[index];
        graficoTest.data.labels.push(compra);
        graficoTest.data.datasets[0].data.push(prediccionFun(compra));
        graficoTest.data.datasets[1].data.push(venta);

        graficoTest.update();
        index++;

        if (dataPrecios.length - 1 < index)
          clearInterval(intervalId);

      }, 1000 / dataPrecios.length);


    }

    render();

    /* 
      ==================================================
      ===================== SOCKET =====================
      ==================================================
    */

    socket.on('/cerebro/data/precioVenta', d => {
      prediccionFun = new Function('return ' + d.prediccion)();
      option = d.optionNeural;
      data = d.data;
      render();
      Ecard.classList.remove('load-spinner')
    })

  } catch ({ message, stack }) {
    socket.emit('/err/client', { message, stack, url: window.location.href })
  }
})