var browser = test.browser({
    debug: false
})

describe('Example Browser Suite', function() {
  it('/ should return 200 with data', function (done) {
    browser.visit('/', function (e, browser, status) {
      should.not.exist(e)
      should.exist(status)

      done()
    })
  })
})

