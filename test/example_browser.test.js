/**
 * See http://zombie.labnotes.org/API for available browser functions.
 * browser is good for standard functional tests, but if you need to test
 * JSON services, request is better suited.
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

