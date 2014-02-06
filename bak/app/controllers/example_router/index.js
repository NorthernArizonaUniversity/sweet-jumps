/*
  Copyright 2013 Northern Arizona University

  This file is part of Sweet Jumps.

  Sweet Jumps is free software: you can redistribute it and/or modify it under the terms of the GNU General Public License as published by the Free Software Foundation, either version 3 of the License, or (at your option) any later version.

  Sweet Jumps is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU General Public License for more details.

  You should have received a copy of the GNU General Public License along with Sweet Jumps. If not, see <http://www.gnu.org/licenses/>.
*/

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