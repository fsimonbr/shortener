var url = require('url');

module.exports = function (opts) {
  var self = {};

  self.opts = opts || {};
  self.checkDate = function(begin, end){
    valid = true;  
    if (begin != '0'){
	    if(new Date(end).toLocaleDateString("pt-BR") < (new Date().toLocaleDateString("pt-BR"))){
	      valid = false;
	    }
	    if(new Date(begin).toLocaleDateString("pt-BR") > (new Date().toLocaleDateString("pt-BR"))){
	      valid = false;
	    }
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
