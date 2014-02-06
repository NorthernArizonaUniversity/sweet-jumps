/*
  Copyright 2013 Northern Arizona University

  This file is part of Sweet Jumps.

  Sweet Jumps is free software: you can redistribute it and/or modify it under the terms of the GNU General Public License as published by the Free Software Foundation, either version 3 of the License, or (at your option) any later version.

  Sweet Jumps is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU General Public License for more details.

  You should have received a copy of the GNU General Public License along with Sweet Jumps. If not, see <http://www.gnu.org/licenses/>.
*/

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