const { resolve } = require('path')
const { NeuralNetwork } = require('../utils/Brain.js');
const FileJSON = require('../utils/FileJSON.js');

/** @typedef {{min_compra:number, max_compra:number, min_venta:number, max_venta:number}} Limits  */
/** @typedef {{iterations:number, time:number, error:Number}} TrainResult  */
/** @type {{netJson:{}, trainResult:TrainResult, create:number, limit:Limits }} */
let template = {};
let complete;

class Precio_venta {
  /** @type {Promise<TrainResult>} */
  chargeTrain = new Promise(res => complete = res)

  fileJSON = new FileJSON(resolve('.cache', 'brain', 'precio_venta.json'), true, template)
  /** @param {import('../app.js')} app  */
  constructor(app) {
    this.app = app;
    this.neural = new NeuralNetwork({ hiddenLayers: [10, 10] });

    let { create, netJson, limit, trainResult } = this.fileJSON.readJSON();

    // si pasaron mas de 6 horas desde el ultimo guardado, refresca el cache.
    if (!create || (create - Date.now()) > 6 * 60 * 60 * 1000) this.refresh();
    // sino pasaron mas de 6 horas, carga el cache guardado.
    else {
      this.neural.fromJSON(netJson);
      this.limit = limit;
      complete(trainResult);
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
  async refresh() {
    let [limitsResult] = await this.app.model.pool(`
      SELECT 
        MIN(compra) AS min_compra,
        MAX(compra) AS max_compra,
        MIN(venta) AS min_venta,
        MAX(venta) AS max_venta
      FROM 
        tb_productos
      WHERE
        estado = 1
    `)

    this.limit = limitsResult[0];

    let [data] = await this.app.model.pool(`
      SELECT 
        compra, 
        venta
      FROM
        tb_productos
      WHERE
        estado = 1
    `)

    let dataTrain = data.map(d => {
      let t = {};
      t.input = [this.normalizeBuys(d.compra)];
      t.output = [this.normalizeSale(d.venta)];
      return t;
    })

    this.chargeTrain = this.neural.trainAsync(dataTrain, {
      iterations: 25000,
      errorThresh: 0.005,
    });

    let trainResult = await this.chargeTrain;

    let netJson = this.neural.toJSON();
    this.fileJSON.writeJSON({ netJson, trainResult, create: Date.now(), limit: limitsResult[0] });
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