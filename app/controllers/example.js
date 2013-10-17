'use strict';
var logger = require('log4js').getLogger('[ctrl] example')

/**
 * Example controller initialization function.
 * @param  {express} app    The global express app. Preferably mount a subapp or router for all of this controller's routes.
 * @param  {object} options Configuration if it exists
 * @param  {[type]} context The instance of the SweetJumps class. Preferably you would not use this unless necessary (to getModule for instance).
 */
module.exports = function (app, options, context) {
  logger.info('Example controller init')

  app.get('/', function (req, res) {
    res.render('example/index', {
      'message': 'Hi! It works!'
    })
  })
}

