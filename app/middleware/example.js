// To get a logger instance, use the following (preferred)
var logger = require('log4js').getLogger('[mdlwr] example')
// Or use the getLogger statement on line 13 (inside the controller init)

/**
 * Example middleware initialization function.
 * @param  {express} app    The global express app.
 * @param  {object} options Configuration if it exists
 * @param  {[type]} context The instance of the App class. Preferably you would not use this unless necessary (to getModule for instance).
 */
module.exports = function (app, options, context) {
  'use strict';
  //var logger = context.getLogger('[ctrl] example')
  logger.info('Example middleware init')

  app.use(function (req, res, next) {
    logger.info('Example middleware reporting in...')
    next()
  });
}