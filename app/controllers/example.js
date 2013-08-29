// To get a logger instance, use the following (preferred)
var logger = require('log4js').getLogger('[ctrl] example')
// Or use the getLogger statement on line 13 (inside the controller init)

/**
 * Example controller initialization function.
 * @param  {express} app    The global express app. Preferably mount a subapp or router for all of this controller's routes.
 * @param  {object} options Configuration if it exists
 * @param  {[type]} context The instance of the App class. Preferably you would not use this unless necessary (to getModule for instance).
 */
module.exports = function (app, options, context) {
  'use strict';
  //var logger = context.getLogger('[ctrl] example')
  logger.info('Example controller init: ' + (typeof options) + ': ' + (typeof context))

  app.get('/', function (req, res) {
    res.render('example/index', {
      'message': 'Hi! It works!'
    })
  })
}

