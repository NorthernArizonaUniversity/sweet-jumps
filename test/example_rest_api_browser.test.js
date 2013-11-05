/*
  Copyright 2013 Northern Arizona University

  This file is part of Sweet Jumps.

  Sweet Jumps is free software: you can redistribute it and/or modify it under the terms of the GNU General Public License as published by the Free Software Foundation, either version 3 of the License, or (at your option) any later version.

  Sweet Jumps is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU General Public License for more details.

  You should have received a copy of the GNU General Public License along with Sweet Jumps. If not, see <http://www.gnu.org/licenses/>.
*/

/**
 * JSON APIs are best tested using browser.json. The following methods are available and all have the same signature (as in the examples):
 *  - browser.json.get(path, callback(err, data, body))
 *  - browser.json.post...
 *  - browser.json.put...
 *  - browser.json.delete...
 */
var browser = test.browser()

describe('Example JSON API Suite', function() {
  this.timeout(5000)

  it('/api should return 200 with list of services', function (done) {
    browser.json.get('/api', function (err, data, body) {
      should.exist(data)
      data.statusCode.should.equal(200)

      should.exist(body)
      body.should.have.property('addone')

      done()
    })
  })
  it('/api/addone/2 should return 200 with a result of 3', function (done) {
    browser.json.get('/api/addone/2', function (err, data, body) {
      should.exist(data)
      data.statusCode.should.equal(200)

      should.exist(body)
      body.should.have.property('result')
      body.result.should.equal(3)

      done()
    })
  })

  it('/api/addone/bad should return 400', function (done) {
    browser.json.get('/api/addone/bad', function (err, data, body) {
      should.exist(data)
      data.statusCode.should.equal(400)

      should.exist(body)
      body.should.have.property('error')

      done()
    })
  })
})

