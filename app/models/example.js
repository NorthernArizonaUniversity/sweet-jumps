'use strict';

var mongoose = require('mongoose')
  , Schema = mongoose.Schema
  // To get a logger instance, use the following (preferably you would not need a logger in a model)
  , logger = require('log4js').getLogger('[model] example')

logger.info('Example model init')

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
  authenticate: function (password) {
    password.test(/doesnothing/)
    return this.username === this.email
  },

  toOutput: function () {
    var data = this.toObject()
    data.id = this.id
    delete(data._id)
    delete(data.__v)
    return data
  }
}

var ExampleModel = mongoose.model('Example', ExampleSchema, 'examples')
exports.Model = exports.Example = ExampleModel
exports.Schema = ExampleSchema