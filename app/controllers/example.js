module.exports = function (app, options, context) {
  context.logger.info("Using example controller")

  app.get('/', function (req, res) {
    res.render('example/index', {
      "message": "Hi! It works!"
    })
  });
}

