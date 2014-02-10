xml2js = require 'xml2js'
parser = new xml2js.Parser()

xmlBodyParser = (req, res, next) ->
  return next()  if req._body
  req.body ?= {}

  # ignore GET
  return next()  if 'GET' is req.method or 'HEAD' is req.method

  # check Content-Type
  return next()  unless 'application/xml' is req.headers['content-type'] or 'application/xml' is (req.headers['content-type'] || '').split(';')[0]

  # flag as parsed
  req._body = true

  # parse
  buf = ''
  req.setEncoding 'utf8'
  req.on 'data', (chunk) ->
    buf += chunk

  req.on 'end', ->
    try
      parser.parseString buf, (err, json) ->
        throw err if err
        req.body = json
        next()
    catch err
      err.status = 400
      next err


exports.xmlBodyParser = xmlBodyParser
