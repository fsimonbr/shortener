module.exports = function (app, nus) {
  var opts = app.get('opts')
    , http = require('http')
    , api = require('./api.js')(app, nus);

  app.use('/api/v1', api);

  // index route
  app.route('/').all(function (req, res) {
    res.render('index');
  });

  // shorten route
  app.get('/:brand/:hash', function (req, res, next){
    nus.expand(req.params.hash, function (err, reply) {
      if (err) {
        next();
      } else {
	startDate = reply.start_date || 0;
        endDate = reply.end_date || 0;
        toDay = new Date();
        if(!nus.checkDate(startDate,endDate)){
		err = {"error" : "URL Expirada!"};
		res.status('200').json(err)
        }else{
        	res.redirect(301, reply.long_url);
	}
      }
    }, true, req.params.brand);
  });

  // catch 404 and forwarding to error handler
  app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
  });

  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    if (/^\/api\/v1/.test(req.originalUrl)) {
      res.json({
        status_code: err.status || 500,
        status_txt: http.STATUS_CODES[err.status] || ''
      });
    } else {
      res.render('error', {
        code: err.status || 500,
        message: err.message,
        error: false
      });
    }
  });
};
