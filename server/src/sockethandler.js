/*jslint white: true */

//Module dependencies
var redis;

var SocketHandler = function(io, sessionManager) {
	this.io = io;
	this.sessionManager = sessionManager;

	this.connectionMap = {};

	//Redis message queue publisher
	this.inputPublisher = redis.createClient();

	io.on('connection', this.clientConnected.bind(this));

};

SocketHandler.prototype.clientConnected = function(connection) {
	var self = this;

	console.log("Client connected");
	var sessionID;

	connection.on('session', function(data) {

		if (data.sessionID) {
			console.log("Client requesting old session");
			//reconnect to old session
			sessionID = data.sessionID;
		} else {
			console.log("Client requesting new session");
			//Create new session ID
			sessionID = self.sessionManager.createSession();
			console.log("Created new session for client with ID: " + sessionID);
		}

		var socketClient = new SocketClient(sessionID, connection);
		self._addToConnectionMap(socketClient);

		//Create subscriber for output messages
		var outputSubscriber = redis.createClient();
		outputSubscriber.psubscribe('output message:' + sessionID);
		outputSubscriber.subscribe('output message');

		outputSubscriber.on('pmessage', function(channelPattern, actualChannel, message) {
			//console.log("PMessage to output for session " + sessionID + " found");
			data = JSON.parse(message);
			connection.emit(data.channel, data.data);
		});

		outputSubscriber.on('message', function(actualChannel, message) {
			//console.log("Message to output for session " + sessionID + " found - " + message);
			console.dir(message);
			data = JSON.parse(message);
			connection.emit(data.channel, data.data);
		});
	});

	connection.on('disconnect', function() {
		if (sessionID === undefined) {
			//Nothing happens, they never requested a session
			return;
		}

		console.log("Client disconnected - " + sessionID);

		//Remove them from the session-connection map
		//TODO: Make not remove, just change so sessions can be regained
		self._removeFromConnectionMap(sessionID);
	});


	/*
	 * All message channels to listen on
	*/
	connection.on('chat message', function(data) {
		if (sessionID === undefined) {
			//Nothing happens, they never requested a session
			self.sendNoSessionError(connection);
			return;
		}

		var queueData = {
			sessionID: sessionID,
			data: data
		}

		console.log("Chat message from client " + sessionID);

		//Add sessionID, channel name and data to input message queue
		self.inputPublisher.publish('chat message:' + sessionID, JSON.stringify(queueData));
	});

	connection.on('global message', function(data) {
		if (sessionID === undefined) {
			//Nothing happens, they never requested a session
			self.sendNoSessionError(connection);
			return;
		}

		console.log("Global chat message from client " + sessionID + " - " + data);

		var queueData = {
			sessionID: sessionID,
			data: data
		}

		self.inputPublisher.publish('global message:' + sessionID, JSON.stringify(queueData));
	});

	connection.on('login', function(data) {
		if (sessionID === undefined) {
			//Nothing happens, they never requested a session
			self.sendNoSessionError(connection);
			return;
		}

		console.log("Login message recieved");

		var queueData = {
			sessionID: sessionID,
			data: data
		}

		self.inputPublisher.publish('login:' + sessionID, JSON.stringify(queueData));
	});

	connection.on('logout', function(data) {
		if (sessionID === undefined) {
			//Nothing happens, they never requested a session
			self.sendNoSessionError(connection);
			return;
		}

		if (!self.sessionManager.loggedIn(sessionID)) {
			//User not logged in
			self.sendNotLoggedInError(connection);
			return;
		}

		console.log("Logout message received");
		console.log(sessionID);

		var queueData = {
			sessionID: sessionID,
			data: data
		}

		self.inputPublisher.publish('logout:' + sessionID, JSON.stringify(queueData));
	});

	connection.on('register', function(data) {
		if (sessionID === undefined) {
			//Nothing happens, they never requested a session
			self.sendNoSessionError(connection);
			return;
		}

		console.log("Registration request recieved");

		var queueData = {
			sessionID: sessionID,
			data: data
		}

		console.log(queueData);

		self.inputPublisher.publish('register:' + sessionID, JSON.stringify(queueData));
	});

	connection.on('create lobby', function(data) {
		if (sessionID === undefined) {
			//Nothing happens, they never requested a session
			self.sendNoSessionError(connection);
			return;
		}

		if (!self.sessionManager.loggedIn(sessionID)) {
			//User not logged in
			self.sendNotLoggedInError(connection);
			return;
		}

		console.log("Create lobby request recieved");

		var queueData = {
			sessionID: sessionID,
			data: data
		}

		//Channel becomes 'create lobby:12'
		self.inputPublisher.publish('create lobby:' + sessionID, JSON.stringify(queueData));
	});

	connection.on('join lobby', function(data) {
		if (sessionID === undefined) {
			//Nothing happens, they never requested a session
			self.sendNoSessionError(connection);
			return;
		}

		if (!self.sessionManager.loggedIn(sessionID)) {
			//User not logged in
			self.sendNotLoggedInError(connection);
			return;
		}

		console.log("Join lobby request recieved");

		var queueData = {
			sessionID: sessionID,
			data: data
		}

		self.inputPublisher.publish('join lobby:' + sessionID, JSON.stringify(queueData));
	});

	connection.on('info lobby', function(data) {
		if (sessionID === undefined) {
			//Nothing happens, they never requested a session
			self.sendNoSessionError(connection);
			return;
		}

		console.log("Lobby info request recieved");

		var queueData = {
			sessionID: sessionID,
			data: data
		}

		self.inputPublisher.publish('info lobby:' + sessionID, JSON.stringify(queueData));
	});

	connection.on('start game', function(data) {
		if (sessionID === undefined) {
			//Nothing happens, they never requested a session
			self.sendNoSessionError(connection);
			return;
		}

		if (!self.sessionManager.loggedIn(sessionID)) {
			//User not logged in
			self.sendNotLoggedInError(connection);
			return;
		}

		var queueData = {
			sessionID: sessionID,
			data: data
		}

		self.inputPublisher.publish('start game:' + sessionID, JSON.stringify(queueData));
	});

	connection.on('game turn', function(data) {
		if (sessionID === undefined) {
			//Nothing happens, they never requested a session
			self.sendNoSessionError(connection);
			return;
		}

		if (!self.sessionManager.loggedIn(sessionID)) {
			//User not logged in
			self.sendNotLoggedInError(connection);
			return;
		}

		var queueData = {
			sessionID: sessionID,
			data: data
		}

		self.inputPublisher.publish('game turn:' + sessionID, JSON.stringify(queueData));
	});
};

SocketHandler.prototype.sendNoSessionError = function(connection) {
	connection.emit('error-message', "You have not created a session, send a SocketIO message on the channel 'session'");
};

SocketHandler.prototype.sendNotLoggedInError = function(connection) {
	connection.emit('error-message', "You have not logged in, please log in before continuing");
};

SocketHandler.prototype._addToConnectionMap = function(socketClient) {
	this.connectionMap[socketClient.sessionID] = socketClient;
};

SocketHandler.prototype._removeFromConnectionMap = function(sessionID) {
	delete this.connectionMap[sessionID];
};

SocketHandler.prototype._getFromConnectionMap = function(sessionID) {
	if (this.connectionMap.hasOwnProperty(sessionID)) {
		return this.connectionMap[sessionID];
	}

	return undefined;
}

var SocketClient = function(sessionID, connection) {
	this.sessionID = sessionID;
	this.connection = connection;

	//Send the client it's session ID so it can be saved
	connection.emit('session', { sessionID: sessionID });
};



module.exports = function(_redis) {
	redis = _redis;

	return SocketHandler;
}