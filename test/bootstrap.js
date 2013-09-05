// Bootstrap any objects or configuration that needs to be performed for each test.
console.info('\n--== Bootstrapping Tests ==--')

process.env.NODE_ENV = 'test'

var util = require('util')
  , path = require('path')
  , nconf = require('nconf')
  , common = require('../modules/app/common')
  , App = require('../modules/app').App

// Chai assertions
var chai = require('chai')

global.asset = chai.assert
global.expect = chai.expect
global.should = chai.should()
// --

// Zombie browser (global class for custom instances)
var Browser = require('zombie')
global.Browser = Browser
// --

// request
global.request = require('request')
// --


// Helper
var Helper = function () {
  // Helper class can load models and modules if required by the test
  // To do that, we will canabalize parts of the main App class so we
  // can have access to the configuration
  this.initializeConfig({
    'node-env': process.env.NODE_ENV
  }, path.resolve(__dirname + '/../'))

  this.db = {
    connect: function (callback) { callback(new Error('Not implemented')) },
    disconnect: function (callback) { callback(new Error('Not implemented')) },
    load: function (callback) { callback(new Error('Not implemented')) },
    clear: function (callback) { callback(new Error('Not implemented')) }
  }
}

Helper.prototype.emit = function () {} // stub
Helper.prototype.normalizeEnv = App.prototype.normalizeEnv
Helper.prototype.initializeConfig = App.prototype.initializeConfig
Helper.prototype.getModule = App.prototype.getModule
Helper.prototype.dump = common.dump

// Modules
Helper.prototype.module = function (name) {
  var module = this.getModule(name)
  if (module) {
    global[name] = module
  }
  return module
}

// Mongoose Models
Helper.prototype.model = function (name) {
  global.mongoose = require('mongoose')

  var model = null
  if (name && name.length) {
    model = require(this.config.get('path:app') + '/models/' + name.toLowerCase())

    if (!model.Model) {
      throw new Error('Model property not set for model ' + name)
    }

    if (!model[name]) {
      throw new Error(name + ' property not set for model ' + name)
    }

    global[name] = model[name]
    global.Model = model.Model

    this.db = {
      connect: function (callback) {
        global.mongoose.connect(this.config.get('mongodb:url') || 'localhost', callback)
      }.bind(this),

      disconnect: function (callback) {
        global.mongoose.disconnect(callback)
      }.bind(this),

      load: function (docs, callback) {
        if (typeof docs === 'function') {
          callback = docs
          docs = null
        }

        // If docs are not provided, try to load a fixture
        if (!docs) {
          var fixture = require(this.config.get('path:root') + '/test/fixtures/' + name.toLowerCase() + '.json')

          docs = fixture[name.toLowerCase()] || null
        }

        if (!docs) {
          throw new Error('No documents or fixture file available to load.')
        }

        model.Model.create(docs, callback)
      }.bind(this),

      clear: function (callback) {
        model.Model.remove({}, callback)
      }.bind(this)
    }
  }
  return model.Model
}


Helper.prototype.browser = function (options) {
  // configure a Browser object to use for functional / behavior tests
  options = common.merge({
    site: 'http://localhost:' + (this.config.get('port') || 80),
    json: false
  }, options)

  if (options.json) {
    delete options.json
    options.headers = options.headers || {}
    options.headers['Content-Type'] = 'application/json'
  }

  this.browser = new Browser(options)

  // make sure the server is running (autorun?)
  this.browser.visit('/', function (e, browser, status) {
    if (e) {
      console.error('Could not reach local server at ' + options.site + '\nPlease make sure it is running!')
      throw(e)
    }
  }.bind(this))

  return this.browser
}


global.test = new Helper()
// --

console.info('  Available globals:')
console.info('    assert, expect, should,')
console.info('    Browser, request,')
console.info('    test: test.db, test.dump(), test.model(), test.module(), test.browser()')
console.info('--== Done ==--\n')
