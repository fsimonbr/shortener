module.exports = function (app, nus) {
  var opts = app.get('opts')
    , http = require('http')
    , router = require('express').Router();

  router.route('/shorten')
    .post(function (req, res) {
      nus.shorten(req.body['long_url'],req.body['brand'], req.body['start_date'], req.body['end_date'], req.body['c_new'], function (err, reply) {
        if (err) {
          jsonResponse(res, err);
        } else if (reply) {
          reply.short_url = 'http://' + req.body['brand'] +'/'+ reply.hash;
          jsonResponse(res, 200, reply);
        } else {
          jsonResponse(res, 500);
        }
      });
    });


  function jsonResponse (res, code, data) {
    data = data || {};
    data.status_code = (http.STATUS_CODES[code]) ? code : 503,
    data.status_txt = http.STATUS_CODES[code] || http.STATUS_CODES[503]

    res.status(data.status_code).json(data)
  }

  return router;
};
