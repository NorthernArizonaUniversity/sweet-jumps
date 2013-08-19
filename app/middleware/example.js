module.exports = function (app, options, context) {
  'use strict';
  context.logger.info('Using example middleware')

  app.use(function (req, res, next) {
    context.logger.info('Example middleware reporting in...')
    next()
  });
}