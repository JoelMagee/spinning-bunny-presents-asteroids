var bcrypt = require('bcrypt');

var session;
var redis;

var Auth = function() {
	// Setup redis subscribers to listen for login, register and logout
	// messages
	this.messageSub = redis.createClient();
	this.messagePub = redis.createClient();

	// Temporary store usernames and password hashes in memory
	// TODO: turn into persistant store
	this.storage = {};
}

Auth.prototype.addSubscribers = function() {
	messageSub.subscribe('login:*', this.loginMessage.bind(this));
	messageSub.subscribe('register:*', this.registerMessage.bind(this));
	messageSub.subscribe('logout:*', this.logoutMessage.bind(this));
};

Auth.prototype.loginMessage = function(channel, message) {
	var messagObj = JSON.parse(message);

	var sessionID = messageObj.sessionID;
	var username = messageObj.username;
	var password = messageObj.password;

	if (this._validateLogin(username, password)) {
		session.loginUser(username, password);
		this.messagePub.publish('login:' + sessionID, true);
	} else {
		this.messagePub.publish('login:' + sessionID, false);
	}
};

Auth.prototype.registerMessage = function(channel, message) {
	var messagObj = JSON.parse(message);

	var sessionID = messageObj.sessionID;
	var username = messageObj.username;
	var password = messageObj.password;

	this._createUser(username, password);
};

Auth.prototype.logoutMessage = function(channel, message) {
	var messagObj = JSON.parse(message);
	var sessionID = messageObj.sessionID;
};

Auth.prototype._createUser = function(username, password) {
	if (storage.hasOwnProperty(username)) {
		//Can't create user, username already exists
		return false;
	}

	storage[username] = {
		username: username,
		hash: this._hashPassword(password);
	}

	return true;
};

Auth.prototype._validateLogin = function(username, password) {
	if (storage.hasOwnProperty(username)) {
		return bcrypt.compareSync(password, storage[username].hash);
	}

	return false;
};

Auth.prototype._hashPassword = function(password) {
	var salt = bcrypt.genSaltSync(10);
	return bcrypt.hashSync(password, salt);
};

module.exports = function(_session, _redis) {
	session = _session;
	redis = _redis;

	return Auth;
}