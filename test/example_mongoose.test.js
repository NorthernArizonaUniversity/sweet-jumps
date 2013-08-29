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

