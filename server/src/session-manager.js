/*jslint white: true */

var SessionManager = function() {
	this.sessions = {};
};

SessionManager.prototype.loginUser = function(sessionID, username) {
	console.log("[Session Manager] Logging in user");
	this._createSession();
	this._setSessionProperty(sessionID, 'loggedIn', true);
	this._setSessionProperty(sessionID, 'username', username)
};

SessionManager.prototype.logoutUser = function(sessionID) {
	console.log("[Session Manager] Logging out user");
	this._clearSession(sessionID);
};

SessionManager.prototype.loggedIn = function(sessionID) {
	return this._getSession(sessionID).loggedIn;
}

SessionManager.prototype.getSession = function(sessionID) {
	return this._getSession(sessionID);
};

SessionManager.prototype._createSession = function(sessionID) {
	if (this.sessions.hasOwnProperty(sessionID)) {
		//Error, we should not be creating a session if it already exists
		return false;
	}

	this.sessions[sessionID] = {};
	return true;
};

SessionManager.prototype._setSessionProperty = function(sessionID, property, val) {
	if (this.sessions.hasOwnProperty(sessionID)) {
		this.sessions[sessionID][property] = val;
	} else {
		//Produce an error? return false? AH!
	}
}

SessionManager.prototype._deleteSessionProperty = function(sessionID, property) {
	if (this.sessions[sessionID].hasOwnProperty(property)) {
		delete this.sessions[sessionID][property];
	}
}

SessionManager.prototype._storeSession = function(sessionID, sessionData) {
	this.sessions[sessionID] = sessionData;
};

SessionManager.prototype._getSession = function(sessionID) {
	if (this.sessions.hasOwnProperty(sessionID)) {
		return sessions[sessionID];
	}

	return {};
};

SessionManager.prototype._clearSession = function(sessionID) {
	this.sessions[sessionID] = {};
}

module.exports = function() {
	return SessionManager;
};