$('.content-body').ready(async () => {

  let $cardMain = $('#card-main');
  let cardMain = $cardMain[0];

  let inputNuevoSelector = document.querySelector('input.selector');
  let inputNuevoImagen = document.querySelector('.imagen-unic');

  let $table = new Tables('#table-main');

  $table.init({
    data: [
      {
        id: 1,
        estado: 1,
        nombre: 'Hanns',
        descripcion: 'Lorem ipsum dolor, sit amet consectetur adipisicing elit. Ad sint adipisci voluptas accusantium ab voluptatem quas sed totam, doloremque sunt tempore id error eaque harum impedit, cumque asperiores esse fugit aliquid, exercitationem animi enim officiis dignissimos. Inventore fugiat a aliquam ex quam ut error reiciendis, vel ratione, doloribus cupiditate sed?',
        ocupacion: 'programador',
        salario: 1000000,
        fecha: '2002-07-03'
      },
      {
        id: 2,
        estado: 0,
        nombre: 'Alverto',
        descripcion: 'Lorem ipsum dolor, sit amet consectetur adipisicing elit. Ad sint adipisci voluptas accusantium ab voluptatem quas sed totam, doloremque sunt tempore id error eaque harum impedit, cumque asperiores esse fugit aliquid, exercitationem animi enim officiis dignissimos. Inventore fugiat a aliquam ex quam ut error reiciendis, vel ratione, doloribus cupiditate sed?',
        ocupacion: 'programador',
        salario: 100,
        fecha: '2002-07-03'
      },
      {
        id: 3,
        estado: 0,
        nombre: 'Luis',
        descripcion: 'Lorem ipsum dolor, sit amet consectetur adipisicing elit. Ad sint adipisci voluptas accusantium ab voluptatem quas sed totam, doloremque sunt tempore id error eaque harum impedit, cumque asperiores esse fugit aliquid, exercitationem animi enim officiis dignissimos. Inventore fugiat a aliquam ex quam ut error reiciendis, vel ratione, doloribus cupiditate sed?',
        ocupacion: 'programador',
        salario: 1,
        fecha: '2002-07-03'
      }
    ],
    select: {
      style: 'single'
    },
    order: [[2, 'asc']],
    columnDefs: [
      {
        className: 'dtr-control',
        orderable: false,
        targets: 0,
        render: data => {
          let i = document.createElement('input');
          i.classList.add('check-switch');
          i.setAttribute('type', 'checkbox');
          i.checked = data;
          return i;
        }
      },
      {
        className: 'dtr-code',
        orderable: false,
        targets: 1
      },
      {
        className: 'dtr-description',
        targets: 2,
        render: data => '<div class="scroll-y">' + (data || '-') + '</div>'
      },
      {
        className: 'dtr-tag',
        targets: 3,
        render: data => '<div>' + data + '</div>'
      },
      {
        targets: 4,
        render: data => data?.toFixed(2)
      },
      {
        className: 'dr-type-date',
        targets: 5,
      }
    ],
    columns: [
      { data: 'estado' },
      { data: 'nombre' },
      { data: 'descripcion' },
      { data: 'ocupacion' },
      { data: 'salario' },
      { data: 'fecha' }
    ],
  })
  $table.buttons();

  let resCategorias = await query.post.cookie("/api/categorias/selector/readAll");

  /** @type {{err: string, OkPacket: import('mysql').OkPacket, list: {[column:string]: string|number}[]}} */
  let { list: dataCategorias } = await resCategorias.json();

  let dataSelectorCategorias = new SelectorMap(dataCategorias);
  let nuevoSelectorUnic = new SelectorUnic(inputNuevoSelector, dataSelectorCategorias);
  let nuevoImagenUnic = new ImagenUnic(inputNuevoImagen);


  let resize = () => {
    let body = $('body');
    let { width, height } = window.getComputedStyle(body[0], null);
    $(".upd-sz")[0].textContent = `${width} - ${height}`
  }

  resize()
  window.addEventListener("resize", () => resize())

  var ctx1 = $("#worldwide-sales")[0].getContext("2d");
  var myChart1 = new Chart(ctx1, {
    type: "bar",
    data: {
      labels: ["2016", "2017", "2018", "2019", "2020", "2021", "2022"],
      datasets: [{
        label: "USA",
        data: [15, 30, 55, 65, 60, 80, 95],
        backgroundColor: "rgba(255, 140, 0, .7)"
      },
      {
        label: "UK",
        data: [8, 35, 40, 60, 70, 55, 75],
        backgroundColor: "rgba(255, 140, 0, .5)"
      },
      {
        label: "AU",
        data: [12, 25, 45, 55, 65, 70, 60],
        backgroundColor: "rgba(255, 140, 0, .3)"
      }
      ]
    },
    options: {
      responsive: true
    }
  });

  var ctx2 = $("#salse-revenue")[0].getContext("2d");
  var myChart2 = new Chart(ctx2, {
    type: "line",
    data: {
      labels: ["2016", "2017", "2018", "2019", "2020", "2021", "2022"],
      datasets: [{
        label: "Salse",
        data: [15, 30, 55, 45, 70, 65, 85],
        backgroundColor: "rgba(255, 140, 0, .7)",
        fill: true
      }, {
        label: "Revenue",
        data: [99, 135, 170, 130, 190, 180, 270],
        backgroundColor: "rgba(255, 140, 0, .5)",
        fill: true
      }
      ]
    },
    options: {
      responsive: true
    }
  });

  var ctx3 = $("#line-chart")[0].getContext("2d");
  var myChart3 = new Chart(ctx3, {
    type: "line",
    data: {
      labels: [50, 60, 70, 80, 90, 100, 110, 120, 130, 140, 150],
      datasets: [{
        label: "Salse",
        fill: false,
        backgroundColor: "rgba(255, 140, 0, .7)",
        data: [7, 8, 8, 9, 9, 9, 10, 11, 14, 14, 15]
      }]
    },
    options: {
      responsive: true
    }
  });

  var ctx4 = $("#bar-chart")[0].getContext("2d");
  var myChart4 = new Chart(ctx4, {
    type: "bar",
    data: {
      labels: ["Italy", "France", "Spain", "USA", "Argentina"],
      datasets: [{
        backgroundColor: [
          "rgba(255, 140, 0, .7)",
          "rgba(255, 140, 0, .6)",
          "rgba(255, 140, 0, .5)",
          "rgba(255, 140, 0, .4)",
          "rgba(255, 140, 0, .3)"
        ],
        data: [55, 49, 44, 24, 15]
      }]
    },
    options: {
      responsive: true
    }
  });
})