'use strict';
require('coffee-script')

var util = require('util')
  , events = require('events')
  , express = require('express')
  , path = require('path')
  , nconf = require('nconf')
  , log4js = require('log4js')
  , swig = require('swig')
  , common = require('./common')
  , PluginManager = require('plugin-manager').PluginManager
  , xmlBodyParser = require('../xml-body-parser').xmlBodyParser
  , MongoStore = require('connect-mongo')(express)


/**
 * Application Class
 * @param  {object} config Application config overrides
 * @return {function}      App class function
 */
var App = function (options) {
  events.EventEmitter.call(this)

  options = this.normalizeOptions(options)

  // Create the express app, configuration, and logger
  this.app = express()
  this.initializeConfig(options)
  this.initializeLogger()

  // Ready to initialize and run
  if (this.config.get('auto-start')) {
    this.start()
  }
}
// App extends EventEmitter
util.inherits(App, events.EventEmitter)


/**
 * Normalizes environment variables and passed in option overrides.
 */
App.prototype.normalizeOptions = function (options) {
  // Normalize option overrides (Prioritize env over passed in options)
  options = options || {}

  ;['node-env', 'access-log', 'auto-start', 'logger', 'parse-xml', 'port', 'secret', 'session', 'view-engine'].forEach(function (prop) {
    var envProp = prop.toUpperCase().replace('-', '_')
    if ({}.hasOwnProperty.call(process.env, envProp)) {
      options[prop] = process.env[envProp]
    }
  }.bind(this))

  return options
}


/**
 * Normalizes the environment name (ie. prod -> production)
 * @param {string} env optional
 */
App.prototype.normalizeEnv = function (env) {
  env = env || (this.config && this.config.get('node-env')) || 'production'

  if (env.match(/^prod/i)) {
    env = 'production'
  } else if (env.match(/^dev/i)) {
    env = 'development'
  }

  if (env !== process.env.NODE_ENV) {
    process.env.NODE_ENV = env
    this.app.set('env', env)
    this.config.overrides({
      'node-env': env, // does nothing if node-env came in on argv
      'env': env
    })
  }

  return env
}


/**
 * Initializes all app components and starts listening for connections
 */
App.prototype.start = function () {
  if (!this.ready) {
    this.initializePlugins()  // load plugins first so that they can hook events
    this.initializeModels()
    this.initializeViews()
    this.initializeApp()
    this.initializeMiddleware()
    this.initializeControllers()

    this.logger.info('Application ready to start.')
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
  port = port || this.config.get('port') || 80
  this.app.listen(port)

  this.logger.info('Listening for connections on port ' + port)
  this.emit('listen')
}


/**
 * Initializes app configuration with optional overrides.
 * @param  {object} overrides overrides config values that may be set in config files
 */
App.prototype.initializeConfig = function (overrides, root) {
  root = root || path.resolve(__dirname + '/../../')
  // Initialize nconf
  // Option priority: Command line, Environment, constructor options, config file, defaults
  this.config = nconf
  this.config.argv()
             .env()
             .overrides(overrides)

  // Normalize the environment name before loading the config file
  this.normalizeEnv()

  // Load environment config
  this.config.file({ file: root + '/config/' + process.env.NODE_ENV + '.json' })

  // If the environment config extends a different config file, load that as well
  if (this.config.get('config-extends')) {
    this.config.file('config-extends', { file: root + '/config/' + this.config.get('config-extends') + '.json' })
  }

  // Path defaults can be overridden in config
  this.config.defaults({ 'path': {
    'root': '',
    'app': 'app',
    'modules': 'modules',
    'resources': 'resources',
    'static': 'static',
    'plugins': 'plugins'
  }})

  // Normalize path names to absolute
  Object.keys(this.config.get('path')).forEach(function (name) {
    this.config.set('path:' + name, path.resolve(__dirname + '/../../' + this.config.get('path:' + name)))
  }.bind(this))

  this.emit('config-initialized', this.config)
}


/**
 * Initilizes the application logger (loads log4js by default, but will use console if necessary)
 * Available levels (assuming log4js):
 *   ALL, TRACE, DEBUG, INFO, WARN, ERROR, FATAL, OFF
 * Use either logger.trace(msg), logger.info(msg)...
 * or logger.log('INFO', msg)
 */
App.prototype.initializeLogger = function () {
  if (log4js) {
    log4js.configure(this.config.get('logger'))

    this.logger = log4js.getLogger('App')
    this.setLoggerLevel(this.config.get('logger:level'))
  } else {
    // Simulate the log4js interface with console
    this.logger = {
      log: function (lvl, msg) { console.log('[' + lvl + '] ' + msg) },
      error: function (msg) { console.error('[ERROR] ' + msg) },
      fatal: function (msg) { console.error('[FATAL] ' + msg) }
    }
    ;['trace', 'debug', 'info', 'warn'].forEach(function (lvl) {
      this.logger[lvl] = function (msg) { this.logger.log(lvl, msg) }.bind(this)
    })
  }
  // Add the dumper
  this.logger.dump = common
    ? common.dump
    : require('util').inspect

  this.logger.info('Logger initialized')
  this.emit('logger-initialized', this.logger);
}

/**
 * Gets a named logger from Log4js if available, otherwise the app logger.
 * @param  {[type]} category [description]
 * @return {[type]}          [description]
 */
App.prototype.getLogger = function (category) {
  if (log4js) {
    return log4js.getLogger(category)
  } else {
    return this.logger
  }
}

/**
 * Changes logger level if available.
 */
App.prototype.setLoggerLevel = function (level) {
  level = level || 'ALL'
  if (log4js) {
    log4js.setGlobalLogLevel(level)
  }
  else if (this.logger && this.logger.setLevel) {
    this.logger.setLevel(level)
  }
}


/**
 * Configures the main express app based on configuration
 */
App.prototype.initializeApp = function (app) {
  // Initialize Express
  app = app || this.app

  // all environments
  app.set('title', this.config.get('app:title') || '[EWT Node.js Project]')
  app.use(express.compress())
  app.use(express.favicon())
  app.use(express.static(this.config.get('path:static')))
  if (this.config.get('access-log')) {
    app.use(log4js
      ? log4js.connectLogger(this.getLogger('express'), { level: 'auto' })
      : express.logger()
    )
  }
  if (this.config.get('parse-xml')) {
    app.use(xmlBodyParser)
  }
  app.use(express.bodyParser())
  app.use(express.methodOverride());

  // Add the app config to locals
  app.locals(this.config.get('app') || {})

  // Development or test only
  if (app.get('env') === 'development' || app.get('env') === 'test') {
    this.logger.warn('Using ' + app.get('env') + ' environment')
    app.use(express.errorHandler({ dumpExceptions: true, showStack: true }))
  }

  // Production only
  if (app.get('env') === 'production') {
    app.use(express.errorHandler({ dumpExceptions: true }))
  }

  // Init Session (optional)
  if (this.config.get('session') !== false) {
    var sessionOpts = { secret: this.config.get('secret') || null }
    if (this.config.get('mongodb')) {
      // Mongo session
      this.logger.info('Using session (MongoDB store)')
      sessionOpts.store = new MongoStore(this.config.get('mongodb'))
    } else {
      // Default session
      this.logger.info('Using session (default store)')
    }
    app.use(express.cookieParser(sessionOpts.secret || null))
    app.use(express.session(sessionOpts))
  }

  // Init Router
  app.use(app.router)

  this.emit('app-initialized', app);
}


App.prototype.initializeViews = function (app) {
  app = app || this.app
  var settings = this.config.get('app') || {}

  // Global view rendering
  swig.setDefaults({
    autoescape: true,
    cache: false, // let express handle caching
    locals: { config: this.config.get() || {} }
  })

  app.engine('html', swig.renderFile)
  app.set('view engine', this.config.get('view-engine') || 'html')
  app.set('views', this.config.get('path:app') + '/views')

  for (var key in settings) {
    if (settings.hasOwnProperty(key)) {
      app.set(key, settings[key])
    }
  }

  // Development or test only (do not cache views)
  if (app.get('env') === 'development' || app.get('env') === 'test') {
    app.set('view cache', false)
  }

  // Production only (cache views)
  if (app.get('env') === 'production') {
    app.enable('cache views')
    app.set('view cache', true)
  }

  this.emit('views-initialized', app);
}


/**
 * Loads express components (middleware, controllers, etc) of the given type
 * based on directory name in /app and configuration
 * @param  {string} type
 */
App.prototype.initializeComponentsByType = function (type) {
  if (typeof type !== 'string') {
    return;
  }

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
    // Open the mongoose connection
    this.mongoose = require('mongoose')
    this.mongoose.connect(this.config.get('mongodb:url') || 'localhost', function (err) {
      if (err) {
        this.logger.error(err)
        this.emit('error', err)
      } else {
        this.logger.info('Mongoose connected')
        this.emit('mongoose-connected');
      }
    }.bind(this))

    // load modules into mongoose
    var models = this.config.get('models')
      , modelNames = models ? Object.keys(models) : null

    this.models = common.requirePath(this.config.get('path:app') + '/models', modelNames)
    this.logger.info('Models loaded: ' + Object.keys(this.models).join(', '))
    this.emit('models-loaded', modelNames);
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
      pl.logger = this.getLogger('[plgn] ' + name)
    }.bind(this))

    this.on('plugin-load', function (name, pl) {
      // Fires after plugin is completely loaded and init'd
      // If plugin routes were defined, mount the plugin app to its path
      if (pl.app && pl.app.routes && Object.keys(pl.app.routes).length) {
        if (!pl.options.path.match(/^\//)) {
          pl.options.path = '/' + pl.options.path
        }

        this.app.use(pl.options.path || name, pl.app)
        this.logger.info('Plugin loaded: ' + name + ', mounted at ' + (pl.options.path || name))
      } else {
        this.logger.info('Plugin loaded: ' + name)
      }
    }.bind(this))

    this.plugins = new PluginManager(this, this.config.get('path:plugins'), plugins)

    // Local plugin management (could also do loadPlugin, etc)
    this.getPlugin = this.plugins.getPlugin
    this.getPlugins = this.plugins.plugins
    this.invoke = this.plugins.invoke
  }
  this.emit('plugins-initialized');
}


/**
 * Loads and returns a global level module (handy shortcut)
 */
App.prototype.getModule = function (module) {
  if (module && module.length) {
    return require(this.config.get('path:modules') + '/' + module)
  }
  return null
}


/**
 * Loads and returns a global level model (handy shortcut)
 */
App.prototype.getModel = function (model) {
  if (model && model.length) {
    return require(this.config.get('path:app') + '/models/' + model.toLowerCase())
  }
  return null
}


module.exports.App = App
module.exports.common = common