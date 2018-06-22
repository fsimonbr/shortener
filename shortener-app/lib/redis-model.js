var redis = require('redis'),
    base58 = require('base58'),
    crypto = require('crypto');

var RedisModel = module.exports = function (config, client) {
      if (config === null && client) {
        this.db = client;
      } else {
        var options = {
          host: config.host,
          port: config.port,
          db: config.db
        };

        this.db = redis.createClient(options);

        if (config.pass) {
          this.db.auth(config.pass);
        }
      }
    };

var getRandomInt = function(min, max) {
      return Math.floor(Math.random() * (max - min)) + min;
    };

// General prefix
RedisModel._prefix_ = 'short:';

// counter
RedisModel.prototype.kCounter = function () {
  return RedisModel._prefix_ + 'counter';
};

// url:<long_url> <short_url>
RedisModel.prototype.kUrl = function (url) {
  return RedisModel._prefix_ + 'url:' + this.md5(url);
};

// hash:<id> url <long_url>
// hash:<id> hash <short_url>
// hash:<id> clicks <clicks>
RedisModel.prototype.kHash = function (hash) {
  return RedisModel._prefix_ + 'hash:' + hash;
};

RedisModel.prototype.kBrand = function (brand) {
  return RedisModel._prefix_ + 'brand:' + brand;
};

// Helpers
RedisModel.prototype.md5 = function (url) {
  return crypto.createHash('md5').update(url).digest('hex');
};

// Main methods
RedisModel.prototype.uniqId = function (callback) {
  this.db.incr(this.kCounter(), function (err, reply) {
    var hash = base58.encode(getRandomInt(9999, 999999) + reply.toString());
    if (typeof callback === 'function') {
      callback(err, hash);
    }
  });
};

RedisModel.prototype.findUrl = function (long_url, callback) {
  this.db.get(this.kUrl(long_url), function (err, reply) {
    if (typeof callback === 'function') {
      callback(err, reply);
    }
  });
};

RedisModel.prototype.findHash = function (short_url, callback) {
  this.db.hgetall(this.kHash(short_url), function (err, reply) {
    if (typeof callback === 'function') {
      callback(err, reply);
    }
  });
};


RedisModel.prototype.clickLink = function (short_url, callback) {
  this.db.hincrby(this.kHash(short_url), 'clicks', 1, function (err, reply) {
    if (typeof callback === 'function') {
      callback(err, reply);
    }
  });
};

String.prototype.boolean = function(str) {
  return "true" == str;
};

// Set record
RedisModel.prototype.set = function (long_url,brand, datesObject, cNew, callback) {
  var self = this;
  this.findUrl(long_url, function (err, reply) {
    if (err) {
      callback(500);
      self.db.quit();
    } else if (reply && cNew == 'false') {
      callback(null, {
        'hash' : reply,
        'long_url' : long_url
      });
      self.db.quit();
    } else {
      self.uniqId(function (err, hash) {
        if (err) {
          callback(500);
          self.db.quit();
        } else {
          var response = {
                'hash'     : hash,
                'long_url' : long_url
              };

          self.db.multi([
            ['set', self.kUrl(long_url), response.hash],
            ['hmset', self.kHash(response.hash),
              'url', long_url,
              'hash', response.hash,
              'start_date', datesObject.start_date || 0,
              'end_date', datesObject.end_date || 0,
              'clicks', 0,
	      'brand',brand
            ]
          ]).exec(function (err, replies) {
            if (err) {
              callback(503);
            } else {
              callback(null, response);
            }
            self.db.quit();
          });
        }
      });
    }
  });
};

// Get record
RedisModel.prototype.get = function (short_url, callback, click, brand) {
  var self = this;

  this.findHash(short_url, function (err, reply) {
    if (err) {
      callback(500);
    } else {
	console.log(reply);
	console.log(brand);
	if (reply && 'url' in reply && reply.brand === brand) {
	      if (click) {
		self.clickLink(reply.hash);
	      }
	      callback(null, {
		'start_date' : reply.start_date || 0,
		'end_date' : reply.end_date || 0,
		'hash' : reply.hash,
		'long_url' : reply.url,
		'clicks' : reply.clicks || 0,
		'brand' : reply.brand || ''
	      });
	} else {
		callback(404);
	}
      } 
    self.db.quit();
  });
};


