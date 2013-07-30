#!/usr/bin/env node

// If you do not wish to customize the app core behavior or hook initilization events
// simply create an app instance and start or auto-start it:
var App = require('./modules/app').App
  , app = new App()
// app.start() // if necessary
