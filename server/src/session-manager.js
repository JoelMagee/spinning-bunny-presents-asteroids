/*jslint white: true */

var crypto = require('crypto');

var SessionGenerator = function() {
	this.sessionNumber = 0;
};

SessionGenerator.prototype.generateSessionID = function() {
	var md5hash = crypto.createHash('md5');
	md5hash.update(Math.random() + "");
	var time = new Date().getTime();
	return this.sessionNumber++ + "" + time + md5hash.digest('hex');
};

var SessionManager = function(SessionStorage) {
	this.sessionStorage = new SessionStorage();
	this.sessionStorage.connect();
	//this.sessions = {};
	this.sessionGenerator = new SessionGenerator();
};

SessionManager.prototype.create = function() {
	var sessionID = this.sessionGenerator.generateSessionID();

	this.sessionStorage.create(sessionID);
	return sessionID;
};

SessionManager.prototype.login = function(sessionID, username) {
	this.sessionStorage.setProperty(sessionID, 'username', username);
};

SessionManager.prototype.logout = function(sessionID) {
	this.sessionStorage.clear(sessionID);
};

SessionManager.prototype.clear = function(sessionID) {
	this.sessionStorage.clear(sessionID);
};

SessionManager.prototype.hasProperty = function(sessionID, property, cb) {
	this.sessionStorage.getProperty(sessionID, property, cb);
}

SessionManager.prototype.getProperty = function(sessionID, property, cb) {
	this.sessionStorage.getProperty(sessionID, property, cb);
};

SessionManager.prototype.setProperty = function(sessionID, property, value) {
	this.sessionStorage.setProperty(sessionID, property, value);
};

SessionManager.prototype.get = function(sessionID, cb) {
	this.sessionStorage.get(sessionID, cb);
};

module.exports = function() {
	return SessionManager;
};