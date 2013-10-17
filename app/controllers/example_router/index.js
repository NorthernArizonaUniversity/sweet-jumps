'use strict';
var logger = require('log4js').getLogger('[ctrl] router')

module.exports = function (app, options, context) {
  logger.info("Initializing /example_router subapp")

  var express = require('express')
    , common = context.getModule('sweet-jumps').common
    , config = context.config.get('controllers:example_router')
    , routerApp = context.createSubapp('/example_router')
    , routeOptions = {
      config: context.config.get('app'),
      logger: logger
    }

  // Import routes
  var routes = common.requirePath(__dirname + '/routes')
  for (var route in routes) {
    if (routes.hasOwnProperty(route) && typeof routes[route] === 'function') {
      var routeApp = context.createSubapp(routerApp, '/' + route)
      routes[route](routeApp, routeOptions, context)
    }
  }

}