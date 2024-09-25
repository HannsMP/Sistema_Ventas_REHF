const Precio_venta = require('../guard/Precio_Venta.js');

class NeuralNetwork {
  /** @param {import('../app.js')} app  */
  constructor(app) {
    this.app = app;
    this.precio_venta = new Precio_venta(app);
  }
}

module.exports = NeuralNetwork;