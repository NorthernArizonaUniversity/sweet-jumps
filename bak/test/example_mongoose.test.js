/*
  Copyright 2013 Northern Arizona University

  This file is part of Sweet Jumps.

  Sweet Jumps is free software: you can redistribute it and/or modify it under the terms of the GNU General Public License as published by the Free Software Foundation, either version 3 of the License, or (at your option) any later version.

  Sweet Jumps is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU General Public License for more details.

  You should have received a copy of the GNU General Public License along with Sweet Jumps. If not, see <http://www.gnu.org/licenses/>.
*/

Example = test.model('Example')

describe('Example Mongoose Test Suite', function() {
  before(function (done) {
    // Connect to mongo before the tests are run.
    test.db.connect(done)
  })

  after(function (done) {
    // Disconnect when done
    test.db.disconnect(done)
  })

  beforeEach(function (done) {
    // Load some fixtures
    test.db.load(done)
  })

  afterEach(function (done) {
    // clear the test db
    test.db.clear(done)
  })

  describe('Example Mongoose Test Group 1', function () {
    var docs = null

    // syncronous
    it('model should be available', function () {
      Example.should.be.exist
      Example.should.have.property('modelName', 'Example')
    })

    // async
    it('fixtures should have loaded', function (done) {
      Example.find({}, function (err, examples) {
        docs = examples

        expect(err).to.be.null
        examples.should.have.length(4)
        done()
      })
    })
  })
})

