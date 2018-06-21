var url = require('url');

module.exports = function (opts) {
  var self = {};

  self.opts = opts || {};
  self.opts.url = self.opts.url || 'http://127.0.0.1:3001';
  self.opts.port = self.opts.port || 3001;
  self.opts['redis-host'] = self.opts['redis-host'] || 'localhost';
  self.opts['redis-port'] = self.opts['redis-port'] || 6379;
  self.opts['redis-pass'] = self.opts['redis-pass'] || false;
  self.opts['redis-db'] = self.opts['redis-db'] || 0;

  self.checkDate = function(begin, end){
    valid = true;  
    if (begin != '0'){
	    if(new Date(end).toLocaleDateString("pt-BR") < (new Date().toLocaleDateString("pt-BR"))){
	      valid = false;
	    }
	    if(new Date(begin).toLocaleDateString("pt-BR") > (new Date().toLocaleDateString("pt-BR"))){
	      valid = false;
	    }
	    console.log(new Date(end).toLocaleDateString("pt-BR"));
	    console.log(new Date().toLocaleDateString("pt-BR"));
	   /* if((end - begin) < 0){
	      valid = false
	    }; */
    }

    return valid;
  }

  self.checkUrl = function (s, domain) {
    var regexp = /^(ftp|http|https):\/\/(\w+:{0,1}\w*@)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%@!\-\/]))?/
      , valid = true;

    // Url correct
    if (regexp.test(s) !== true) {
      valid = false;
    }

    // Url equal application url
    if (valid === true && domain === true) {
      if (url.parse(self.opts.url).hostname === url.parse(s).hostname) {
        valid = false
      }
    }

    return valid;
  };

  self.getModel = function (callback) {
    var RedisModel = require('./redis-model')
      , config = {
          host: self.opts['redis-host'],
          port: self.opts['redis-port'],
          pass: self.opts['redis-pass'],
          db: self.opts['redis-db']
        };

    callback(null, new RedisModel(config));
  };

  self.shorten = function (long_url,brand, startDate, endDate, cNew, callback) {
    if (this.checkUrl(long_url, true)) {
      this.getModel(function (err, model) {
        if (err) {
          callback(500);
        } else {
          dateObj = startDate ? {'start_date': new Date(startDate), 'end_date' : new Date(endDate)} : {}
          model.set(long_url,brand, dateObj, cNew, callback);
        }
      });
    } else {
      callback(400);
    }
  };

  self.expand = function (short_url, callback, click, brand) {
    if (this.checkUrl(short_url)) {
      short_url = short_url.split('/').pop();
    }

    if (short_url && /^[\w=]+$/.test(short_url)) {
      this.getModel(function (err, model) {
        if (err) {
          callback(500);
        } else {
          model.get(short_url, callback, click, brand);
        }
      });
    } else {
      callback(400,'Página não encontrada!');
    }
  };


  return self;
};
