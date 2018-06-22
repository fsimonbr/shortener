var redis = require('redis');

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

// General prefix
RedisModel._prefix_ = 'short:';

// hash:<id> url <long_url>
// hash:<id> hash <short_url>
// hash:<id> clicks <clicks>
RedisModel.prototype.kHash = function (hash) {
  return RedisModel._prefix_ + 'hash:' + hash;
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



// Get record
RedisModel.prototype.get = function (short_url, callback, click, brand) {
  var self = this;

  this.findHash(short_url, function (err, reply) {
    if (err) {
      callback(500);
    } else {
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


