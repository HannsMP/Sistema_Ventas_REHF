const { resolve } = require('path')
const { NeuralNetwork } = require('../utils/Brain.js');
const FileJSON = require('../utils/FileJSON.js');

/** @typedef {{min_compra:number, max_compra:number, min_venta:number, max_venta:number}} Limits  */
/** @typedef {{iterations:number, time:number, error:Number}} TrainResult  */

class Precio_venta {
  optionNeural = { hiddenLayers: [10, 10] };

  /** @type {FileJSON<{netJson:{}, trainResult:TrainResult, create:number, limit:Limits }>} */
  fileJSON = new FileJSON(resolve('.cache', 'brain', 'precio_venta.json'), true);

  /** @param {import('../app.js')} app  */
  constructor(app) {
    this.app = app;

    this.io = app.socket.node.selectNode('/control/servidor/cerebro');

    let { create, netJson, limit, trainResult, optionNeural = this.optionNeural } = this.fileJSON.readJSON();

    this.neural = new NeuralNetwork(optionNeural);

    // si pasaron mas de 6 horas desde el ultimo guardado, refresca el cache.
    if (!create)
      this.chargeTrain = this.refresh();
    // sino pasaron mas de 6 horas, carga el cache guardado.
    else {
      this.neural.fromJSON(netJson);
      this.limit = limit;
    };
  }
  /** @param {number} value  */
  normalizeBuys(value) {
    return (value - this.limit.min_compra) / (this.limit.max_compra - this.limit.min_compra);
  }
  /** @param {number} value  */
  denormalizeBuys(value) {
    return value * (this.limit.max_compra - this.limit.min_compra) + this.limit.min_compra;
  }
  /** @param {number} value  */
  normalizeSale(value) {
    return (value - this.limit.min_venta) / (this.limit.max_venta - this.limit.min_venta);
  }
  /** @param {number} value  */
  denormalizeSale(value) {
    return value * (this.limit.max_venta - this.limit.min_venta) + this.limit.min_venta;
  }
  async refresh(iterations, errorThresh) {
    if (!this.app.model.estado && !await this.app.model._run()) return;

    let [limitsResult] = await this.app.model.pool(`
      SELECT 
        MIN(compra) AS min_compra,
        MAX(compra) AS max_compra,
        MIN(venta) AS min_venta,
        MAX(venta) AS max_venta
      FROM 
        tb_productos
      WHERE
        estado = 1;
    `)

    this.limit = limitsResult[0];

    let [data] = await this.app.model.pool(`
      SELECT 
        ((p.compra - sub.min_compra) / (sub.max_compra - sub.min_compra)) AS input,
        ((p.venta - sub.min_venta) / (sub.max_venta - sub.min_venta)) AS output
      FROM 
        tb_productos p,
        (
          SELECT 
            MIN(compra) AS min_compra, 
            MAX(compra) AS max_compra,
            MIN(venta) AS min_venta, 
            MAX(venta) AS max_venta
          FROM 
            tb_productos 
          WHERE 
            estado = 1
        ) sub
      WHERE 
        p.estado = 1;
    `)

    data.forEach(d => {
      d.input = [d.input];
      d.output = [d.output];
    })

    iterations ??= 25000;
    errorThresh ??= 0.005;

    let trainResult = this.neural.train(data, {
      iterations,
      errorThresh
    });

    let netJson = this.neural.toJSON();

    let size = data.length;
    let limit = limitsResult[0];
    let create = Date.now();

    let json = { netJson, trainResult, create, size, limit, iterations, errorThresh, optionNeural: this.optionNeural };
    this.fileJSON.writeJSON(json);
    this.io.sockets.emit('/cerebro/data/precioVenta', {
      data: json,
      optionNeural: this.optionNeural,
      prediccion: this.toFunction.toString()
    });
  }
  /** 
   * @param {number} price  
   * @returns {Promise<Number>}
   */
  predict(price) {
    return new Promise(async (res, rej) => {
      try {
        await this.chargeTrain;
        let normalizedInput = this.normalizeBuys(price);
        let [normalizedOutput] = this.neural.run([normalizedInput]);
        let result = this.denormalizeSale(normalizedOutput);
        res(result);
      } catch (e) {
        rej(e);
      }
    })
  }
  /** @returns {(input:number)=>number} */
  get toFunction() {
    let funNet = this.neural.toFunction().toString();
    return new Function('input', `if(input < ${this.limit.min_compra}) return ${this.limit.min_venta}; if(${this.limit.max_compra} < input) return ${this.limit.max_venta}; return ((${funNet}([(input - ${this.limit.min_compra}) / (${this.limit.max_compra} - ${this.limit.min_compra})])[0]) * (${this.limit.max_venta} - ${this.limit.min_venta})) + ${this.limit.min_venta};`)
  }
}

module.exports = Precio_venta;


/* 

return `
  return (
    (
      ${funNet}([
        (input - ${this.limit.min_compra}) 
        / (${this.limit.max_compra} - ${this.limit.min_compra})
      ])[0]
    ) * (
      ${this.limit.max_venta} - ${this.limit.min_venta}
    )
  ) + ${this.limit.min_venta};
`.replace(/\.|\n/, '');

*/