const App = require('./app');

let app = new App()
app._Run()
  .catch(e => {
    app.logError.writeStart(e.stack);
  });