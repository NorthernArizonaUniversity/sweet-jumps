'use strict';

/**
 * Dumps a given object to the console.
 */
module.exports.dump = function (obj, depth, log) {
  var util = require('util')

  log = log || util.debug
  log(util.inspect(obj, { depth: (depth || 1), colors: true }))
}


/**
 * Merges object values into the first given object.
 * Object properties are overwritten by each subsequent object with the same property.
 */
module.exports.merge = function (obj) {
  var sources = Array.prototype.slice.call(arguments, 1)
  for (var i = 0; i < sources.length; i++) {
    for (var key in (sources[i] || {})) {
      if (sources[i].hasOwnProperty(key)) {
        obj[key] = sources[i][key]
      }
    }
  }
  return obj
}


module.exports.shuffle = function(list) {
  var i, j, _i, _ref, _ref1
  for (i = _i = 0, _ref = list.length; 0 <= _ref ? _i < _ref : _i > _ref; i = 0 <= _ref ? ++_i : --_i) {
    j = Math.floor(Math.random() * list.length)
    _ref1 = [list[j], list[i]], list[i] = _ref1[0], list[j] = _ref1[1]
  }
  return list
}


module.exports.randomChoice = function (list) {
  return list[Math.floor(Math.random() * list.length)]
}



/**
 * Requires all or some of the modules in a path and returns them in a collection.
 * @param  {string} path    The path containing the modules.
 * @param  {array|null} modules Array of module names (string) to load. If null, all modules in the path will be loaded. If an empty array, no modules will be loaded.
 * @return {object}         Loaded modules indexed by name.
 */
module.exports.requirePath = function (path, modules) {
  // If an empty array of modules to load was passed in, do nothing.
  if (modules && !modules.length) {
    return {}
  }

  // If no modules were given, load everything.
  if (!modules) {
    modules = require('fs').readdirSync(path)
  }

  // Load them.
  var loaded = {}
  modules.forEach(function(module) {
    loaded[module.replace(/\.js$/, '')] = require(path + '/' + module)
  })
  return loaded
}



module.exports.proto = function (app) {
  // Ignore this.
  app.all(/\/__(proto|sweet|jumps)__/i, function (req, res) {
    var a = ['OI9BiKK','v7cH2','UhoLW3x','h8wla1G','8g5Q7e4','HOVQ7ds','2p10X2L','AnRBAHR','ucZIb9B','OYCqinj','ueqVmN2']
    res.send(new Buffer('PGltZyBzcmM9Imh0dHA6Ly9pLmltZ3VyLmNvbS97e319LmdpZiI+', 'base64').toString('ascii').replace('{{}}', module.exports.randomChoice(a)))
  })
}

