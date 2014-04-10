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
  , logger = require('log4js').getLogger('[model] {%= name %}')

logger.info('{%= name %} model init')

/**
 * {%= name %} Schema
 * See: http://mongoosejs.com/docs/guide.html
 */

// 1. TODO: Edit fields
var {%= name %}Schema = new Schema({
  key: { type: String, 'default': '' }
})

// 2. TODO: Edit indices
{%= name %}Schema.index({ 'key': 1 })


{%= name %}Schema.statics = {
  all: function (cb) {
    this.find({}, cb)
  },

  findByKey: function (key, cb) {
    this.find({ key: key }, cb)
  },

  save: function (fields, cb) {
    if (cb == null) {
      return
    }

    // 3. TODO: Check mandatory fields here
    if (!fields.key) {
      cb(new Error("Missing mandatory key"), null, false);
    }

    // 4. TODO: Find by key fields
    return this.find({ key: fields.key }, function (obj) {
      if (obj) {
        delete fields.key
        obj.set(fields)
        return obj.save(function (err, obj) {
          return typeof cb === "function" ? cb(err, obj, false) : void 0
        })
      } else {
        obj = new Scope(fields)
        return scope.save(function (err, obj) {
          return typeof cb === "function" ? cb(err, obj, true) : void 0
        })
      }
    })
  }
}


{%= name %}Schema.methods = {
  toOutput: function () {
    var data = this.toObject()
    data.id = this.id
    delete(data._id)
    delete(data.__v)
    return data
  }
}


var {%= name %}Model = mongoose.model('{%= name %}', {%= name %}Schema, '{%= collection %}')
exports.Model = exports.{%= name %} = {%= name %}Model
exports.Schema = {%= name %}Schema