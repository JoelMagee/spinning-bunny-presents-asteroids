/*jslint white: true */

//Module dependencies
var redis;

var Session = function() {
	var sessions = {};
};

Session.prototype.loginUser = function(sessionID, username) {
	this._createSession();
	this._setSessionProperty(sessionID, 'loggedIn', true);
	this._setSessionProperty(sessionID, 'username', username)
};

Session.prototype.logoutUser = function(sessionID) {
	this._setSessionProperty(sessionID, 'loggedIn', false);
	this._deleteSessionProperty(sessionID, 'username');
	this._clearSession(sessionID);
};

Session.prototype.getSession = function(sessionID) {
	return this._getSession(sessionID);
};

Session.prototype.isLoggedIn = function(sessionID) {
	return this._getSession(sessionID).loggedIn;
}

Session.prototype._createSession = function(sessionID) {
	if (this.sessions.hasOwnProperty(sessionID)) {
		//Error, we should not be creating a session if it already exists
		return false;
	}

	this.sessions[sessionID] = {};
	return true;
};

Session.prototype._setSessionProperty = function(sessionID, property, val) {
	if (this.sessions.hasOwnProperty(sessionID)) {
		this.sessions[sessionID][property] = val;
	} else {
		//Produce an error? return false? AH!
	}
}

Session.prototype._deleteSessionProperty = function(sessionID, property) {
	delete this.sessions[sessionID]
}

Session.prototype._storeSession = function(sessionID, sessionData) {
	this.sessions[sessionID] = sessionData;
};

Session.prototype._getSession = function() {
	if (this.sessions.hasOwnProperty(sessionID)) {
		return sessions[sessionID];
	}

	return {};
};

Session.prototype._clearSession = function(sessionID) {
	delete this.sessions[sessiondID];
}

module.exports = function(_redis) {
	redis = _redis;

	return Session;
};