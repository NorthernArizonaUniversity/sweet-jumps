/**
 * Dumps a given object to the console.
 */
module.exports.dump = function (obj, depth, log) {
  var log = log || console.log;
  log(require("util").inspect(obj, false, (depth || 1), true));
}


/**
 * Merges object values into the first given object.
 * Object properties are overwritten by each subsequent object with the same property.
 */
module.exports.merge = function (obj) {
  var sources = Array.prototype.slice.call(arguments, 1);
  for (var i = 0; i < sources.length; i++) {
    for (key in (sources[i] || {})) {
      if (sources[i].hasOwnProperty(key))
        obj[key] = sources[i][key];
    }
  }
  return obj;
}


/**
 * Requires all or some of the modules in a path and returns them in a collection.
 * @param  {string} path    The path containing the modules.
 * @param  {array|null} modules Array of module names (string) to load. If null, all modules in the path will be loaded. If an empty array, no modules will be loaded.
 * @return {object}         Loaded modules indexed by name.
 */
module.exports.requirePath = function (path, modules) {
  // If an empty array of modules to load was passed in, do nothing.
  if (modules && !modules.length)
    return {}

  // If no modules were given, load everything.
  if (!modules)
    modules = require('fs').readdirSync(path)

  // Load them.
  var loaded = {}
  modules.forEach(function(module) {
    loaded[module.replace(/\.js$/, '')] = require(path + '/' + module)
  })
  return loaded
}

