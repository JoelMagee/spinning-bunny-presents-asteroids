/*jslint white: true */

var SessionGenerator = function() {
	this.sessionNumber = 0;
};

SessionGenerator.prototype.generateSessionID = function() {
	return this.sessionNumber++;
};

var SessionManager = function() {
	this.sessions = {};
	this.sessionGenerator = new SessionGenerator();
};

SessionManager.prototype.loginUser = function(sessionID, username) {
	this._setSessionProperty(sessionID, 'loggedIn', true);
	this._setSessionProperty(sessionID, 'username', username);
};

SessionManager.prototype.logoutUser = function(sessionID) {
	this._clearSession(sessionID);
};

SessionManager.prototype.loggedIn = function(sessionID) {
	if (this._sessionExists(sessionID)) {
		if (this.sessions[sessionID].hasOwnProperty('loggedIn')) {
			return this.sessions[sessionID]['loggedIn'];
		}
	}

	return false;
}

SessionManager.prototype.getLoggedInUser = function(sessionID) {
	if (this._sessionExists(sessionID)) {
		if (this.sessions[sessionID].hasOwnProperty('loggedIn')) {
			if (this.sessions[sessionID].hasOwnProperty('username')) {
				return this.sessions[sessionID]['username'];
			} else {
				console.error("User logged in but no username is set in the session");
			}
		}
	}

	return false;
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
	return sessionID;
};

SessionManager.prototype.createSession = function() {
	var sessionID = this.sessionGenerator.generateSessionID();
	return this._createSession(sessionID);
};

SessionManager.prototype.getSessionProperty = function(sessionID, property) {
	return this._getSessionProperty(sessionID, property)
};

SessionManager.prototype.setSessionProperty = function(sessionID, property, value) {
	return this._setSessionProperty(sessionID, property, value);
};

SessionManager.prototype._setSessionProperty = function(sessionID, property, val) {
	if (this.sessions.hasOwnProperty(sessionID)) {
		this.sessions[sessionID][property] = val;
		return true;
	} else {
		return false;
	}
}

SessionManager.prototype._getSessionProperty = function(sessionID, property) {
	if (this.sessions.hasOwnProperty(sessionID)) {
		if (this.sessions[sessionID].hasOwnProperty(property)) {
			return this.sessions[sessionID][property];
		} 
	}

	return null;
};

SessionManager.prototype._deleteSessionProperty = function(sessionID, property) {
	if (this.sessions[sessionID].hasOwnProperty(property)) {
		delete this.sessions[sessionID][property];
		return true;
	}

	return false;
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

SessionManager.prototype._sessionExists = function(sessionID) {
	return this.sessions.hasOwnProperty(sessionID);
}

module.exports = function() {
	return SessionManager;
};