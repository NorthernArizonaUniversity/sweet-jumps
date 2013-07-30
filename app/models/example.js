var mongoose = require('mongoose')
  , Schema = mongoose.Schema

/**
 * Example Schema
 * See: http://mongoosejs.com/docs/guide.html
 */

var ExampleSchema = new Schema({
  email: { type: String, 'default': '' },
  username: { type: String, 'default': '' }
})

ExampleSchema.index({ 'usename': 1 })


ExampleSchema.statics = {
  all: function (cb) {
    this.find({}, cb)
  },

  findByEmail: function (email, cb) {
    this.find({ email: email }, cb)
  }
}

ExampleSchema.methods = {
  authenticate: function (plainText) {
    return this.username === this.email
  },

  toOutput: function () {
    var data = this.toObject()
    data.id = this.id
    delete(data._id)
    detete(data.__v)
    return data
  }
}

ExampleModel = mongoose.model('Example', ExampleSchema, 'examples')
exports.Model = exports.Example = ExampleModel
exports.Schema = ExampleSchema