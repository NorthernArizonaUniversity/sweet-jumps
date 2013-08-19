// Generated by CoffeeScript 1.4.0
(function() {
  var parser, utils, xml2js, xmlBodyParser;

  xml2js = require('xml2js');

  utils = require('../../node_modules/express/node_modules/connect/lib/utils');

  parser = new xml2js.Parser();

  xmlBodyParser = function(req, res, next) {
    var buf, _ref;
    if (req._body) {
      return next();
    }
    if ((_ref = req.body) == null) {
      req.body = {};
    }
    if ('GET' === req.method || 'HEAD' === req.method) {
      return next();
    }
    if (!('application/xml' === req.headers['content-type'] || 'application/xml' === utils.mime(req))) {
      return next();
    }
    req._body = true;
    buf = '';
    req.setEncoding('utf8');
    req.on('data', function(chunk) {
      return buf += chunk;
    });
    return req.on('end', function() {
      try {
        return parser.parseString(buf, function(err, json) {
          if (err) {
            throw err;
          }
          req.body = json;
          return next();
        });
      } catch (err) {
        err.status = 400;
        return next(err);
      }
    });
  };

  exports.xmlBodyParser = xmlBodyParser;

}).call(this);
