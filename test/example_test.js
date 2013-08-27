module.exports = {
  setUp: function (callback) {
    // Set up anything needed for unit tests (database, etc)
    callback()
  },
  tearDown: function (callback) {
    // Do anything needed to clean up after the unit tests
    callback()
  },
  test1: function (test) {
    test.ok(true, 'Test 1 succeeded')
    test.done()
  },
  group: {
    test2: function (test) {
      test.ok(true, 'Test 2 succeeded')
      test.done()
    },
    test3: function (test) {
      test.ok(true, 'Test 3 succeeded')
      test.done()
    }
  }
}