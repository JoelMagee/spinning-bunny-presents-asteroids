//Module dependencies
var redis;

var SocketHandler = function(io) {
	var self = this;

	this.io = io;
	this.sessionGenerator = new SessionGenerator();

	this.connectionMap = {};

	//Redis queue Pub and Sub (different queues)
	this.inputPublisher = redis.createClient();
	//this.outputSubscriber = redis.createClient();

	io.on('connection', this.clientConnected.bind(this));

	//This deals with our outgoing messages
	//this.outputSubscriber.subscribe('output message');

	//Message is a stringified JSON object with the properties 'sessionID', 'channel' and 'data' and optionally 'broadcast'
	// this.outputSubscriber.on('message', function(channel, message) {
	// 	console.log("Message '" + message + "' on channel '" + channel + "' arrived!");
	// 	var messageObj = JSON.parse(message);

	// 	var socketClient = self._getFromConnectionMap(messageObj.sessionID);

	// 	if (socketClient === undefined) {
	// 		console.error("WARN: Trying to send message to session ID without a connection: " + messageObj.sessionID);
	// 	} else {
	// 		if (messageObj.broadcast) {
	// 			socketClient.connection.broadcast.emit(messageObj.channel, messageObj.data);
	// 		}
	// 		socketClient.connection.emit(messageObj.channel, messageObj.data);
	// 	}	
	// });

	// var chatSubscriber = redis.createClient();
	// var chatPublisher = redis.createClient();

	// chatSubscriber.psubscribe('global message:*');

	// chatSubscriber.on('pmessage', function(channel, message) {
	// 	console.log("Global chat message from redis queue");

	// 	var sessionID = channel.substring(channel.indexOf(":") + 1);

	// 	console.log("Global chat session: " + sessionID);

	// 	chatPublisher.publish('output message', JSON.stringify(
	// 		{
	// 			sessionID: sessionID,
	// 			channel: "global message",
	// 			broadcast: true,
	// 			data: message
	// 		}));
	// });

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
			sessionID = self.sessionGenerator.generateSessionID();
			console.log("Given client session ID " + sessionID);
		}

		var socketClient = new SocketClient(sessionID, connection);
		self._addToConnectionMap(socketClient);

		//Create subscriber for output messages
		var outputSubscriber = redis.createClient();
		outputSubscriber.psubscribe(['output message', 'output message:' + sessionID]);

		outputSubscriber.on('pmessage', function(channel, message) {
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

		console.log(queueData);

		self.inputPublisher.publish('global message:' + sessionID, JSON.stringify(queueData));
	});

	connection.on('login', function(data) {
		if (sessionID === undefined) {
			//Nothing happens, they never requested a session
			self.sendNoSessionError(connection);
			return;
		}

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

		var queueData = {
			sessionID: sessionID,
			data: data
		}

		self.inputPublisher.publish('register:' + sessionID, JSON.stringify(queueData));
	});

	connection.on('create lobby', function(data) {
		if (sessionID === undefined) {
			//Nothing happens, they never requested a session
			self.sendNoSessionError(connection);
			return;
		}

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

		var queueData = {
			sessionID: sessionID,
			data: data
		}

		self.inputPublisher.publish('join lobby:' + sessionID, JSON.stringify(queueData));
	});

	connection.on('start game', function(data) {
		if (sessionID === undefined) {
			//Nothing happens, they never requested a session
			self.sendNoSessionError(connection);
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

		var queueData = {
			sessionID: sessionID,
			data: data
		}

		self.inputPublisher.publish('game turn:' + sessionID, JSON.stringify(queueData));
	});
};

SocketHandler.prototype.sendNoSessionError = function(connection) {
	console.log("Sending error to client");
	connection('message', "You have not created a session, send a SocketIO message on the channel 'session'");
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

var SessionGenerator = function() {
	this.sessionNumber = 0;
}

SessionGenerator.prototype.generateSessionID = function() {
	return this.sessionNumber++;
}


module.exports = function(_redis) {
	redis = _redis;

	return SocketHandler;
}