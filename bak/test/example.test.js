describe('Example Test Suite', function() {
  describe('Example Test Group 1', function () {
    it('should succeed synchronously', function () {
      true.should.equal(true)
    })
    it('should succeed asynchronously', function (done) {
      true.should.equal(true)
      done()
    })
  })
})

