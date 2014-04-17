/*
  Copyright 2013-2014 Northern Arizona University

  This file is part of Sweet Jumps.

  Sweet Jumps is free software: you can redistribute it and/or modify it under the terms of the GNU General Public License as published by the Free Software Foundation, either version 3 of the License, or (at your option) any later version.

  Sweet Jumps is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU General Public License for more details.

  You should have received a copy of the GNU General Public License along with Sweet Jumps. If not, see <http://www.gnu.org/licenses/>.
*/

'use strict';

var events = require('events')
  , fs = require('fs')
  , path = require('path')
  , util = require('util')

  , handlebars = require('express-hbs')
  , log4js = require('log4js')
  , nconf = require('nconf')

  , express = require('express')
  , bodyParser = require('body-parser')
  , compress = require('compression')
  , cookieParser = require('cookie-parser')
  , csrf = require('csurf')
  , favicon = require('static-favicon')
  , methodOverride = require('method-override')
  , morgan = require('morgan')
  , session = require('express-session')
  // , responseTime = require('response-time')
  // , serveIndex = require('serve-index')
  , xmlBodyParser = require('express-xml-bodyparser')

  , common = require('./common')
  , Plugout = require('plugout').Plugout
  , MongoStore = require('connect-mongo')({ session: session })

/**
 * Application Class
 * @param  {object} config Application config overrides
 * @return {function}      SweetJumps class function
 */
var SweetJumps = function (options) {
  events.EventEmitter.call(this)

  options = this.normalizeOptions(options)

  console.log('SweetJumps - Starting server at ' + (options.cwd || options.root || process.cwd()))

  // Create the express app, configuration, and logger
  this.app = express()
  this.initializeConfig(options)
  this.initializeLogger()
  this.initializeBasePath()

  process.on('uncaughtException', function (err) {
    this.logger.error(err)
    this.logger.error('Fatal error, exiting...')
    process.exit(1)
  }.bind(this))

  // Ready to initialize and run
  // if (this.config.get('auto-start')) {
  //   this.start()
  // }
}
// SweetJumps extends EventEmitter
util.inherits(SweetJumps, events.EventEmitter)


/**
 * Normalizes environment variables and passed in option overrides.
 */
SweetJumps.prototype.normalizeOptions = function (options) {
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
 * @return {string} environment
 */
SweetJumps.prototype.normalizeEnv = function (env) {
  env = env || (this.config && this.config.get('node-env')) || 'production'

  if (env.match(/^prod/i)) {
    env = 'production'
  } else if (env.match(/^dev/i)) {
    env = 'development'
  }

  if (env !== process.env.NODE_ENV) {
    process.env.NODE_ENV = env
    this.app.set('env', env)
    this.config.set('node-env', env)
    this.config.set('env', env)
  }

  return env
}


/**
 * Returns true if the app is in production
 * @return {Boolean} [description]
 */
SweetJumps.prototype.isProduction = function () {
  return /^prod/i.test(this.app.get('env'))
}


/**
 * Initializes all app components and starts listening for connections
 */
SweetJumps.prototype.start = function () {
  if (!this.ready) {
    this.initializePlugins()  // load plugins first so that they can hook events
    this.initializeModels()
    this.initializeApp()
    this.initializeMiddleware()
    this.initializeControllers()
    this.initializeErrorHandler()

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
SweetJumps.prototype.listen = function (port) {
  port = port || this.config.get('port') || 5050

  var app = this.rootApp || this.app
  app.listen(port)

  this.logger.info('Listening for connections on port ' + port)
  this.emit('listen')
}


/**
 * Initializes app configuration with optional overrides.
 * @param  {object} overrides overrides config values that may be set in config files
 */
SweetJumps.prototype.initializeConfig = function (overrides, root) {
  root = root || path.resolve(overrides.root || overrides.cwd || process.cwd())
  // Initialize nconf
  // Option priority: Command line, Environment, constructor options, config file, defaults
  this.config = nconf
  this.config.argv()
             .env()
             .overrides(overrides)

  // Normalize the environment name before loading the config file
  this.normalizeEnv()

  // Load environment config
  var file = root + '/config/' + process.env.NODE_ENV + '.json'
  if (!fs.existsSync(file)) {
    file = root + '/config/production.json'
  }

  this.config.file({ file: file })

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
    'public': 'public',
    'plugins': 'plugins'
  }})

  // Normalize path names to absolute
  Object.keys(this.config.get('path')).forEach(function (name) {
    this.config.set('path:' + name, path.resolve(process.cwd(), this.config.get('path:' + name)))
  }.bind(this))

  this.config.set('root', root)
  this.config.set('cwd', root)

  this.emit('config-initialized', this.config)
}


/**
 * Initilizes the application logger (loads log4js by default, but will use console if necessary)
 * Available levels (assuming log4js):
 *   ALL, TRACE, DEBUG, INFO, WARN, ERROR, FATAL, OFF
 * Use either logger.trace(msg), logger.info(msg)...
 * or logger.log('INFO', msg)
 */
SweetJumps.prototype.initializeLogger = function () {
  if (log4js) {
    log4js.configure(this.config.get('logger'))

    this.logger = log4js.getLogger('SweetJumps')
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
SweetJumps.prototype.getLogger = function (category) {
  if (log4js) {
    return log4js.getLogger(category)
  } else {
    return this.logger
  }
}

/**
 * Changes logger level if available.
 */
SweetJumps.prototype.setLoggerLevel = function (level) {
  level = level || 'ALL'
  if (log4js) {
    log4js.setGlobalLogLevel(level)
  }
  else if (this.logger && this.logger.setLevel) {
    this.logger.setLevel(level)
  }
}

/**
 * If a base-path is set in config, this function creates a subapp which is mounted
 * to that base-path, and essentially hijacks all the functions of the root application.
 */
SweetJumps.prototype.initializeBasePath = function () {
  if (this.config.get('base-path') && /^\//.test(this.config.get('base-path'))) {
    this.rootApp = this.app
    this.app = express()
    this.rootApp.use(this.config.get('base-path'), this.app)

    this.logger.info('Application mounted at base path: ', this.app.path())
  }
}


/**
 * Configures the main express app based on configuration
 */
SweetJumps.prototype.initializeApp = function (app) {
  // Initialize Express
  app = app || this.app

  // Import settings from config / init views
  app.set('title', this.config.get('app:title') || 'Sweet Jumps App')
  this.useViews(app)

  // Access log
  if (this.config.get('access-log')) {
    app.use(log4js
      ? log4js.connectLogger(this.getLogger('express'), { level: 'auto' })
      : morgan()
    )
  }

  // Static resources
  app.use(compress())
  if (fs.existsSync(path.resolve(this.config.get('path:public'), 'favicon.ico'))) {
    app.use(favicon(path.resolve(this.config.get('path:public'), 'favicon.ico')))
  }
  app.use(express.static(this.config.get('path:public')))

  // Body / Request parsing
  app.use(methodOverride())
  app.use(bodyParser())

  if (this.config.get('parse-xml')) {
    app.use(xmlBodyParser())
  }

  // optional
  this.useSession(app)

  // set up a heartbeat route for checking the health of the server
  this.useHeartbeat(app)

  // Development or test only init
  if (app.get('env') === 'development' || app.get('env') === 'test') {
    this.logger.warn('Using ' + app.get('env') + ' environment')

    // Error testing.
    app.get('/__error__/404', function (req, res, next) { next() })
    app.get('/__error__/403', function (req, res, next) {
      var error = new Error('Not Authorized')
      error.status = 403
      next(error)
    })
    app.get('/__error__/500', function (req, res, next) { next(new Error('Sample Error')) })
    app.get('/__error__', function (req, res, next) { next(new Error('Sample Error')) })
    common.proto(app)
  }

  // Production only init
  if (app.get('env') === 'production') {
  }

  this.emit('app-initialized', app)
}


/**
 * Adds a heartbeat route to an application.
 * Normally this only needs to be done for the base app.
 * @param app
 */
SweetJumps.prototype.useHeartbeat = function (app) {
  app.get(/\/__(ok|heartbeat|pulse|ping|status|proofoflife|amialive|vitals|asdfg|wasd)__/i, function (req, res, next) {
    try {
      if (this.isOk()) {
        res.send(200)
      } else {
        next(new Error('Server is down.'))
      }
    } catch (err) {
      next(err)
    }
  }.bind(this))
}


/**
 * Interface method which is used by the heartbeat.
 * By default, it will always return true (the server is running). If you wish to add
 * additional conditions for "OK", override this method and either return true, or
 * throw an error.
 * @throws {Error}
 * @returns {boolean}
 */
SweetJumps.prototype.isOk = function () { return true }


/**
 * Starts an app's session.
 * Normally this only needs to be done for the base app.
 * @param app
 */
SweetJumps.prototype.useSession = function (app) {
  var sessionConfig = this.config.get('session')
  if (sessionConfig) {
    var sessionOpts = (typeof sessionConfig === 'object') ? sessionConfig : {}

    if (typeof sessionConfig === 'string') {
      sessionOpts.store = sessionConfig
    }

    if (!sessionOpts.secret && this.config.get('secret')) {
      sessionOpts.secret = this.config.get('secret')
    }

    if (/^mongo(db)?/.test(sessionOpts.store) && this.config.get('mongodb')) {
      // Mongo session
      this.logger.info('Using session (MongoDB store)')
      sessionOpts.store = new MongoStore(this.config.get('mongodb'))
    } else {
      // Default session
      delete sessionOpts.store
      this.logger.info('Using session (memory store)')
    }

    app.use(cookieParser())
    app.use(session(sessionOpts))
    app.use(csrf())
  }
}


/**
 * Configures an app's (or the base app's) views (Swig by default, in /app/views)
 * @param app
 */
SweetJumps.prototype.useViews = function (app) {
  var settings = this.config.get('app') || {}
    , config = this.config.get() || {}
    , engine = this.config.get('view-engine') || 'handlebars'
    , views = path.resolve(this.config.get('path:app'), 'views')

  config['base-path'] = config['base-path'] || ''

  app.set('base-path', config['base-path'])
  app.set('paths', {
    base: config['base-path'],
    css: config['base-path'] + '/css',
    js: config['base-path'] + '/js'
  })
  app.set('views', views)

  for (var key in settings) {
    if (settings.hasOwnProperty(key)) {
      app.set(key, settings[key])
    }
  }

  app.locals.config = config
  app.locals.settings = app.settings
  app.locals.env = app.get('env')
  app.locals.isProduction = this.isProduction()

  // Global view rendering
  // TODO: make sure all these work in E4
  if (engine === 'jade' && jade) {
    app.set('view engine', 'jade')

  } else if (engine === 'ejs' && ejs) {
    app.set('view engine', 'ejs')

  } else if (engine === 'swig' && swig) {
    app.engine('html', swig.renderFile)
    app.set('view engine', 'html')

    swig.setDefaults({
      autoescape: true,
      cache: false, // let express handle caching
      locals: app.locals
    })

  } else if (typeof this[engine] === 'function') {
    app.set('view engine', this[engine]())

  } else {
    var hbs = handlebars.express3({
      partialsDir: path.join(views, 'partials'),
      layoutsDir: path.join(views, 'layouts'),
      // OPTIONAL settings
      // blockHelperName: "{String} Override 'block' helper name.",
      // contentHelperName: "{String} Override 'contentFor' helper name.",
      // extname: "{String} Extension for templates, defaults to `.hbs`",
      // handlebars: "{Module} Use external handlebars instead of express-hbs dependency",
      // i18n: "{Object} i18n object",
      // templateOptions: "{Object} options to pass to template()",
      // beautify: "{Boolean} whether to pretty print HTML, see github.com/einars/js-beautify .jsbeautifyrc"
    })

    app.engine('hbs', hbs)
    app.set('view engine', 'hbs')
  }

  // Development or test only (do not cache views)
  if (app.get('env') === 'development' || app.get('env') === 'test') {
    app.disable('view cache')
  }

  // Production only (cache views)
  if (app.get('env') === 'production') {
    app.enable('cache views')
    app.enable('view cache')
  }

  this.emit('views-initialized', app);
}


/**
 * Loads express components (middleware, controllers, etc) of the given type
 * based on directory name in /app and configuration
 * @param  {string} type
 */
SweetJumps.prototype.initializeComponentsByType = function (type) {
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
SweetJumps.prototype.initializeMiddleware = function () {
  this.initializeComponentsByType('middleware')
}


/**
 * Initializes express controllers (routes) in /app/controllers
 */
SweetJumps.prototype.initializeControllers = function () {
  this.initializeComponentsByType('controllers')
}


/**
 * Initializes models in /app/models (Mongoose models by default)
 */
SweetJumps.prototype.initializeModels = function () {
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
SweetJumps.prototype.initializePlugins = function () {
  var plugins = this.config.get('plugins')
  if (plugins) {
    this.on('plugin-pre-init', function (name, pl) {
      // Fires after plugin is loaded, but before plugin's init() is called
      // Add a subapp for the plugin to use.
      pl.app = express()
      pl.logger = this.getLogger('[plugin] ' + name)
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

    this.plugins = new Plugout(this, this.config.get('path:plugins'), plugins)

    // Local plugin management (could also do loadPlugin, etc)
    this.getPlugin = this.plugins.getPlugin
    this.getPlugins = this.plugins.plugins
    this.invoke = this.plugins.invoke
  }
  this.emit('plugins-initialized');
}


/**
 * Handles errors / 404s in a sane way.
 * This is called last so that the catchall does not interfere with any other routes.
 */
SweetJumps.prototype.initializeErrorHandler = function () {
  // General errors thrown in routes or called from next(err)
  this.app.use(function (err, req, res, next) {
    this.logger.error('Application Error: ', err)

    res.status(err.status || 500)
    if (req.accepts('html')) {
      var views = req.app.get('views')
      req.app.set('views', this.config.get('path:app') + '/views')

      res.render('500', { error: err })

      req.app.set('views', views)
    } else if (req.accepts('json')) {
      res.json({ error: 'Application error' })
    } else {
      res.type('txt').send('Application error')
    }
  }.bind(this))

  // If we get to this final middleware, it means no route or static responded, generate a 404
  this.app.use(function (req, res, next) {
    this.logger.error('Resource not found, returning 404')

    res.status(404)
    if (req.accepts('html')) {
      var views = req.app.get('views')
      req.app.set('views', this.config.get('path:app') + '/views')

      res.render('404')

      req.app.set('views', views)
    } else if (req.accepts('json')) {
      res.json({ error: 'Not found' })
    } else {
      res.type('txt').send('Not found')
    }
  }.bind(this))
}



/**
 * Loads and returns a global level module (handy shortcut)
 */
SweetJumps.prototype.getModule = function (module) {
  if (module && module.length) {
    return require(this.config.get('path:modules') + '/' + module)
  }
  return null
}


/**
 * Loads and returns a global level model (handy shortcut)
 */
SweetJumps.prototype.getModel = function (model) {
  if (model && model.length) {
    return require(this.config.get('path:app') + '/models/' + model.toLowerCase())
  }
  return null
}


/**
 * Creates an Express sub-app and initializes it for use with views etc.
 * If a mountpoint is specified, the sub-app will be mounted, and the views
 * location will have the mountpoint appended.
 *
 * @param  {express app} parent (optional) Parent app
 * @param  {string} mountpoint (optional)
 * @return {express app}
 */
SweetJumps.prototype.createSubapp = function (parent, mountpoint) {
  var subapp = express()
  this.useViews(subapp)

  if (typeof parent === 'string') {
    mountpoint = parent
    parent = this.app
  }
  if (typeof mountpoint === 'string') {
    subapp.set('views', parent.get('views') + mountpoint)
    parent.use(mountpoint, subapp)
  }

  return subapp
}


module.exports.SweetJumps = SweetJumps
module.exports.App = SweetJumps
module.exports.common = common