logger = require('log4js').getLogger('[ctrl] router/hello')

/**
 * /hello Handler
 */
module.exports = function (app, options, context) {
  logger.info('Initializing /example_router/hello routes')

  app.all('/', function (req, res, next) {
    logger.info('Request /hello')
    res.render('index')
  })

}
