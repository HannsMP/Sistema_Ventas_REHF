$('.content-body').ready(async () => {
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

  var ctx5 = $("#pie-chart")[0].getContext("2d");
  var myChart5 = new Chart(ctx5, {
    type: "pie",
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

  // Doughnut Chart
  var ctx6 = $("#doughnut-chart")[0].getContext("2d");
  var myChart6 = new Chart(ctx6, {
    type: "doughnut",
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