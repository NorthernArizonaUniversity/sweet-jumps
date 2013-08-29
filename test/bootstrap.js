// Bootstrap any objects or configuration that needs to be performed for each test.
console.info('\n--== Bootstrapping Tests ==--')

// Chai assertions
var chai = require('chai')

global.asset = chai.assert
global.expect = chai.expect
global.should = chai.should()
// --