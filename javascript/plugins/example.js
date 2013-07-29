var plugin = {
  defaultOptions: {
    path: '/example'
  }
}
module.exports = plugin

plugin.init = function () {
  plugin.logger.info('Example plugin: init()')

  plugin.app.get('/', function (req, res) {
    res.send('Example plugin lives!')
  })

  plugin.app.get('/json', function (req, res) {
    res.json({ message: 'Example plugin lives' })
  })
}