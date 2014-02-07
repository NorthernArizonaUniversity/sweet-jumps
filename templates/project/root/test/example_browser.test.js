/*
  Copyright 2013 Northern Arizona University

  This file is part of Sweet Jumps.

  Sweet Jumps is free software: you can redistribute it and/or modify it under the terms of the GNU General Public License as published by the Free Software Foundation, either version 3 of the License, or (at your option) any later version.

  Sweet Jumps is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU General Public License for more details.

  You should have received a copy of the GNU General Public License along with Sweet Jumps. If not, see <http://www.gnu.org/licenses/>.
*/

/**
 * See http://zombie.labnotes.org/API for available browser functions.
 * browser is good for standard functional tests, but if you need to test
 * JSON services, use browser.json (see example_rest_api_browser.test.js)
 */
var browser = test.browser()

describe('Example Browser Suite', function() {
  this.timeout(5000)

  it('/ should return 200 with data', function (done) {
    browser.visit('/')
      .then(function () {
        expect(browser.success).to.be.ok
        browser.text('#content h1').should.equal('Hi! It works!')
        done()
      })
      .fail(function (e) {
        should.fail(e)
        done()
      })
  })
})

