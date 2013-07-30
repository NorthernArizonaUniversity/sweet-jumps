module.exports = function (app, options, context) {
  context.logger.info("Using example middleware")

  app.use(function (req, res, next) {
    context.logger.info("Example middleware reporting in...")
    next()
  });
}