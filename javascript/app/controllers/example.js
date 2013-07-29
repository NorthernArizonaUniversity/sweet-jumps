module.exports =  function (app, context) {
  context.logger.info("Using example controller")

  app.get('/', function (req, res) {
    res.send('I live!')
  });
}

