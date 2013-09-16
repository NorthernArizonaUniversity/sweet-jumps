var logger = require('log4js').getLogger('[ctrl] example_rest_api')

/**
 * Example controller initialization function.
 * @param  {express} app    The global express app. Preferably mount a subapp or router for all of this controller's routes.
 * @param  {object} options Configuration if it exists
 * @param  {[type]} context The instance of the App class. Preferably you would not use this unless necessary (to getModule for instance).
 */
module.exports = function (app, options, context) {
  'use strict';

  logger.info('Example REST API controller init')

  app.get('/api', function (req, res) {
    res.json({
      addone: {
        path: '/addone/<number>',
        params: {
          number: {
            type: 'integer',
            required: true
          }
        }
      }
    })
  })

  app.get('/api/addone/:number', function (req, res) {
    var number = new Number(req.params.number)
    if (number && number > 0) {
      res.json({ result: number + 1 })
    } else {
      res.json(400, { error: 'Number parameter required (eg /addone/2)' })
    }
  })
}

