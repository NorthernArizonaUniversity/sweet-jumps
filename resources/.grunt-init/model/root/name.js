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
  key: { type: String, 'default': '' },
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