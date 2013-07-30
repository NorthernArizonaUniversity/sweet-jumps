
var util = require('util')
  , events = require('events')
  , express = require('express')
  , fs = require('fs')
  , path = require('path')
  , nconf = require('nconf')
  , common = require('./common')
  , PluginManager = require('plugin-manager').PluginManager
  , xmlBodyParser = require('../xml-body-parser').xmlBodyParser


// Normalize environtment name
if (!process.env.NODE_ENV || process.env.NODE_ENV.match(/^prod/i))
    process.env.NODE_ENV = 'production'
else if (process.env.NODE_ENV.match(/^dev/i))
    process.env.NODE_ENV = 'development'

/**
 * Application Class
 * @param  {object} config Application config overrides
 * @return {function}      App class function
 */
var App = function (options) {
  events.EventEmitter.call(this)

  // Normalize option overrides
  options = options || {}
  if (options.hasOwnProperty('auto-start')) {
    options.app = options.app || {}
    options.app['auto-start'] = options['auto-start']
    delete options['auto-start']
  }

  // Create the express app, configuration, and logger
  this.app = express()
  this.initializeConfig(options)
  this.initializeLogger()

  // Ready to initialize and run
  if (this.config.get('app:auto-start'))
    this.start()
}
// App extends EventEmitter
util.inherits(App, events.EventEmitter)


/**
 * Initializes all app components and starts listening for connections
 */
App.prototype.start = function () {
  if (!this.ready) {
    this.initializePlugins()  // load plugins first so that they can hook events
    this.initializeApp()
    this.initializeModels()
    this.initializeMiddleware()
    this.initializeControllers()

    this.logger.info('[App] Application ready to start.')
    this.ready = true
    this.emit('ready')

    this.listen()
  }
}


/**
 * Starts listening for connections
 * @param  {int} port Override listening port (defaults to 80 or config)
 */
App.prototype.listen = function (port) {
  port = port || this.config.get('app:port') || 80
  this.app.listen(port)

  this.logger.log('[App] Listening for connections on port ' + port)
  this.emit('listen')
}


/**
 * Initializes app configuration with optional overrides.
 * @param  {object} overrides overrides config values that may be set in config files
 */
App.prototype.initializeConfig = function (overrides) {
  var root = path.resolve(__dirname + '/../..')
  // Initialize nconf
  // Option priority: Command line, Environment, constructor options, config file.
  this.config = nconf
  this.config.argv()
             .env()
             .overrides(overrides)
             .file({ file: root + "/config/" + this.app.get('env') + ".json" })

  this.config.set('path', {
    "root": root,
    "app": root + "/app",
    "resources": root + "/resources",
    "static": root + "/static",
    "plugins": root + "/plugins"
  })

  this.emit('config-initialized', this.config);
}


/**
 * Initilizes the application logger (defaults to console)
 */
App.prototype.initializeLogger = function () {
  // Initialize Logger
  this.logger = console
  try {
    var logger
    if (logger = this.config.get("logger")) {
      this.logger = require(logger.package || logger)
    }
    this.logger.info = this.logger.info || this.logger.log
    this.logger.dump = common
      ? common.dump
      : require('util').inspect
    if (this.logger.restoreDefaults)
      this.logger.restoreDefaults()

    this.logger.info('[App] Logger initialized')

  } catch (err) {
    this.logger.error('[App] Could not initialize logger package "' + this.config.get("logger:package") + '"')
  }
  this.emit('logger-initialized', this.logger);
}


/**
 * Configures the main express app based on configuration
 */
App.prototype.initializeApp = function () {
  // Initialize Express
  var app = this.app

  // all environments
  app.configure(function () {
    app.set('title', this.config.get('app:title') || '[EWT Node.js Project]')
    app.set('views', this.config.get('path:app') + '/views')
    app.set('view engine', this.config.get('views:engine') || 'jade')
    app.use(express.compress())
    app.use(express.favicon())
    app.use(express.static(this.config.get('path:static')))
    if (this.config.get('app:access-log')) app.use(express.logger())
    if (this.config.get('app:parse-xml')) app.use(xmlBodyParser)
    app.use(express.bodyParser())
    app.use(app.router)
  }.bind(this))

  // development only
  app.configure('development', function () {
    this.logger.warn('[App] Using development environment')
    app.use(express.errorHandler({ dumpExceptions: true, showStack: true }))
  }.bind(this))

  // production only
  app.configure('production', function () {
    app.enable('cache views')
    app.use(express.errorHandler({ dumpExceptions: true }))
  }.bind(this))

  this.emit('app-initialized');
}


/**
 * Initializes mounted express apps provided by plugins.
 * @param  {object} app Express app to be initialized
 */
App.prototype.initializeSubapp = function (app) {

  this.emit('subapp-initialized', app);
}


/**
 * Loads express components (middleware, controllers, etc) of the given type
 * based on directory name in /app and configuration
 * @param  {string} type
 */
App.prototype.initializeComponentsByType = function (type) {
  if (typeof type !== 'string') return;

  var modules = this.config.get(type)
    , moduleNames = modules ? Object.keys(modules) : null

  this[type] = common.requirePath(this.config.get('path:app') + '/' + type, moduleNames)

  for (var name in this[type]) {
    if (this[type].hasOwnProperty(name) && typeof this[type][name] === 'function') {
      this[type][name](this.app, modules? modules[name] : {}, this)
    }
  }

  this.emit(type + '-initialized');
  this.emit(type + '-loaded', this[type]);
}


/**
 * Initializes express midddleware in /app/middleware
 */
App.prototype.initializeMiddleware = function () {
  this.initializeComponentsByType('middleware')
}


/**
 * Initializes express controllers (routes) in /app/controllers
 */
App.prototype.initializeControllers = function () {
  this.initializeComponentsByType('controllers')
}


/**
 * Initializes models in /app/models (Mongoose models by default)
 */
App.prototype.initializeModels = function () {
  if (this.config.get('mongodb')) {
    this.mongoose = require('mongoose')
    this.mongoose.connect(this.config.get('mongodb:url') || 'localhost', function (err) {
      if (err) {
        this.logger.error(err)
        this.emit('error', error)
      } else {
        // load modules into mongoose
        var models = this.config.get('models')
          , modelNames = models ? Object.keys(models) : null

        this.models = common.requirePath(this.config.get('path:app') + '/models', modelNames)
        this.logger.log('[App] Models loaded: ' + Object.keys(this.models).join(', '))
        this.emit('models-loaded', modelNames);
      }
    }.bind(this))
  }
  this.emit('models-initialized');
}


/**
 * Initializes plugins based on configuration.
 */
App.prototype.initializePlugins = function () {
  var plugins = this.config.get('plugins')
  if (plugins) {
    this.on('plugin-pre-init', function (name, pl) {
      // Fires after plugin is loaded, but before plugin's init() is called
      // Add a subapp for the plugin to use.
      pl.app = express()
      this.initializeSubapp(pl.app)
    }.bind(this))

    this.on('plugin-load', function (name, pl) {
      // Fires after plugin is completely loaded and init'd
      // If plugin routes were defined, mount the plugin app to its path
      if (pl.app && pl.app.routes && Object.keys(pl.app.routes).length) {
        if (!pl.options.path.match(/^\//))
          pl.options.path = '/' + pl.options.path

        this.app.use(pl.options.path || name, pl.app)
        this.logger.log('[App] Plugin loaded: ' + name + ', mounted at ' + (pl.options.path || name))
      } else {
        this.logger.log('[App] Plugin loaded: ' + name)
      }
    }.bind(this))

    this.plugins = new PluginManager(this, this.config.get('path:plugins'), plugins)
  }
  this.emit('plugins-initialized');
}


module.exports.App = App
module.exports.common = common