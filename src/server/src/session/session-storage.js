/*jslint node: true white: true */

var redis;

var SessionStorage = function() {
	this.store;
};

SessionStorage.prototype.connect = function() {
	this.store = redis.createClient();
};

SessionStorage.prototype.disconnect = function() {
	this.store.quit();
};

SessionStorage.prototype.create = function(id) {
	this.store.hmset("session_" + id, { __d : "d" });
	this.setExpire(id);
};

SessionStorage.prototype.get = function(id, cb) {
	this.store.hgetall("session_" + id, cb);
	this.setExpire(id);
};

SessionStorage.prototype.hasProperty = function(id, property, cb) {
	this.store.hmget("session_" + id, property, function(err, result) {
		if (err) { return cb(err); }

		if (result === undefined) {
			return cb(null, false);
		}

		if (result.length === 0) {
			return cb(null, false);
		}

		cb(null, true);
	});
	this.setExpire(id);
};

SessionStorage.prototype.getProperty = function(id, property, cb) {
	this.store.hmget("session_" + id, property, function(err, result) {
		if (err) { return cb(err); }

		if (result === undefined) {
			return cb(null, null);
		}

		if (result.length === 0) {
			return cb(null, null);
		}

		cb(null, result[0]);
	});
	this.setExpire(id);
};

SessionStorage.prototype.exists = function(id, cb) {
	this.store.exists("session_" + id, function(err, result) {
		if (err) { return cb(err); }
		if (result === 1) {
			cb(null, true);
		} else {
			cb(null, false);
		}
	});
	this.setExpire(id);
};


SessionStorage.prototype.set = function(id, obj) {
	this.store.hmset("session_" + id, obj);
	this.setExpire(id);
};

SessionStorage.prototype.setProperty = function(id, property, value) {
	this.store.hmset("session_" + id, property, value);
};

SessionStorage.prototype.clear = function(id) {
	this.store.del("session_" + id);
	this.store.hmset("session_" + id, { __d: 'd' });
	this.setExpire(id);
};

SessionStorage.prototype.setExpire = function(id) {
	this.store.expire("session_" + id, 60 * 60 * 60); //60 minutes
}

SessionStorage.prototype.clearAll = function() {
	this.store.flushall();
}

module.exports = function(_redis) {
	redis = _redis;

	return SessionStorage;
}