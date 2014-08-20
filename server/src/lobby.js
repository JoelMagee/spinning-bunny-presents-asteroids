/*jslint white: true node: true */

var redis;

//Redis subscribers
var joinListener;
var createListener;
var destroyListener;
var leaveListener;
var infoListener;
var startListener;

//Redis publisher
var outputPub;

var LobbyManager = function(sessionManager, gameManager) {
	this.sessionManager = sessionManager;
	this.gameManager = gameManager;

	this.lobbies = [];
	this.lobbiesMap = {};
	this.lobbyCount = 0;

	this.usernameToLobbyMap = {};

	createListener.on('pmessage', this._createMessageReceived.bind(this));
	destroyListener.on('pmessage', this._destroyMessageRecieved.bind(this));
	joinListener.on('pmessage', this._joinMessageReceived.bind(this));
	leaveListener.on('pmessage', this._leaveMessageReceived.bind(this));
	infoListener.on('pmessage', this._infoMessageReceived.bind(this));
	startListener.on('pmessage', this._startMessageReceived.bind(this));

	createListener.psubscribe('create lobby:*');
	destroyListener.psubscribe('destroy lobby:*');
	joinListener.psubscribe('join lobby:*');
	leaveListener.psubscribe('leave lobby:*');
	infoListener.psubscribe('info lobby:*');
	startListener.psubscribe('start game:*');
};

LobbyManager.prototype._createMessageReceived = function(channelPattern, actualPattern, message) {
	var messageObj = JSON.parse(message);
	var sessionID = messageObj.sessionID;
	var lobbyName = messageObj.data.name;

	var newLobby = this.createLobby(lobbyName);

	console.log("Creating new lobby with name: " + newLobby.name + " and id: " + newLobby.id);

	var response = {};
	response.data = {};

	response.sessionID = sessionID;
	response.channel = "create lobby";
	response.data.success = true;
	response.data.message = "Lobby created";
	response.data.id = newLobby.id;

	outputPub.publish('output message:' + sessionID, JSON.stringify(response));
};

LobbyManager.prototype._destroyMessageRecieved = function(channelPattern, actualChannel, message) {
	var messageObj = JSON.parse(message);
	var sessionID = messageObj.sessionID;
	var lobbyID = messageObj.data.id;

	console.log("Processing destroy message");

	if (!this.lobbiesMap.hasOwnProperty(lobbyID)) {
		//Error, tried to join a lobby which doesn't exist
		
		var response = {};
		response.data = {};

		response.sessionID = sessionID;
		response.channel = "join lobby";
		response.data.success = false;
		response.data.message = "No such lobby";

		outputPub.publish('output message:' + sessionID, JSON.stringify(response));
		return;
	}

	var lobby = this.lobbiesMap[lobbyID];

	//TODO
};

LobbyManager.prototype._joinMessageReceived = function(channelPattern, actualPattern, message) {
	console.log("Processing join request");
	var messageObj = JSON.parse(message);
	var sessionID = messageObj.sessionID;

	var lobbyID = messageObj.data.id;
	var username = this.sessionManager.getSessionProperty(sessionID, 'username');


	if (!this.lobbiesMap.hasOwnProperty(lobbyID)) {
		//Error, tried to join a lobby which doesn't exist
		
		var response = {};
		response.data = {};

		response.sessionID = sessionID;
		response.channel = "join lobby";
		response.data.success = false;
		response.data.message = "No such lobby";

		outputPub.publish('output message:' + sessionID, JSON.stringify(response));
		return;
	}

	//Lobby exists
	var lobby = this.lobbiesMap[lobbyID];

	if (this.usernameToLobbyMap.hasOwnProperty(username)) {
		//User is already in another lobby, don't let them join another
		var response = {};
		response.data = {};

		response.sessionID = sessionID;
		response.channel = "join lobby";
		response.data.success = false;
		response.data.message = "Error joining lobby, you're already in a lobby!";

		outputPub.publish('output message:' + sessionID, JSON.stringify(response));
		return;
	}

	if (!lobby.userJoin(sessionID, username)) {
		//Joining lobby failed - Figure out reasons later
		var response = {};
		response.data = {};

		response.sessionID = sessionID;
		response.channel = "join lobby";
		response.data.success = false;
		response.data.message = "Error joining lobby";

		outputPub.publish('output message:' + sessionID, JSON.stringify(response));
		return;
	}

	this.usernameToLobbyMap[username] = lobbyID;

	console.log(this.usernameToLobbyMap);

	//Response to joining user which states the join was successful
	var response = {};
	response.data = {};

	response.sessionID = sessionID;
	response.channel = "join lobby";
	response.success = true;
	response.message = "Successfully joined lobby";

	//Response to all users in lobby to let them know a new person joined the lobby
	var lobbyResponse = {};
	lobbyResponse.username = username;
	
	outputPub.publish('output message:' + sessionID, JSON.stringify(response));
	lobby.sendToAll("user joined lobby", JSON.stringify(lobbyResponse));
};

LobbyManager.prototype._leaveMessageReceived = function(channelPattern, actualPattern, message) {
	console.log("Processing leave request");
	var messageObj = JSON.parse(message);
	var sessionID = messageObj.sessionID;

	var lobbyID = messageObj.data.id;
	var username = this.sessionManager.getSessionProperty(sessionID, 'username');


	if (!this.lobbiesMap.hasOwnProperty(lobbyID)) {
		//Error, tried to leave a lobby which doesn't exist
		
		var response = {};
		response.data = {};

		response.sessionID = sessionID;
		response.channel = "leave lobby";
		response.data.success = false;
		response.data.message = "No such lobby";

		outputPub.publish('output message:' + sessionID, JSON.stringify(response));
		return;
	}

	//Lobby exists
	var lobby = this.lobbiesMap[lobbyID];

	if (!lobby.userInLobby(username)) {
		//Error, tried to leave a lobby you're not a part of

		var response = {};
		response.data = {};

		response.sessionID = sessionID;
		response.channel = "leave lobby";
		response.data.success = false;
		response.data.message = "You're not in this lobby";

		outputPub.publish('output message:' + sessionID, JSON.stringify(response));
		return;
	}

	lobby.userLeave(username);
	delete this.usernameToLobbyMap[username];

	var response = {};
	response.data = {};

	response.sessionID = sessionID;
	response.channel = "leave lobby";
	response.data.success = true;
	response.data.message = "Successfully left the lobby";

	//Response to all users in lobby to let them know a new person joined the lobby
	var lobbyResponse = {};
	lobbyResponse.username = username;
	
	outputPub.publish('output message:' + sessionID, JSON.stringify(response));
	lobby.sendToAll("user left lobby", JSON.stringify(lobbyResponse));
};

LobbyManager.prototype._infoMessageReceived = function(channelPattern, actualPattern, message) {
	var messageObj = JSON.parse(message);
	var sessionID = messageObj.sessionID;

	if (messageObj.data.hasOwnProperty('id')) {
		//Request for info about a single lobby
		
		if (!this.lobbiesMap.hasOwnProperty(messageObj.data.id)) {
			//No such lobby
			var response = {};
			response.data = {};

			response.sessionID = sessionID;
			response.channel = "info lobby";
			response.data.success = false;
			response.data.message = "No such lobby";

			outputPub.publish('output message:' + sessionID, JSON.stringify(response));
			return;
		}

		var lobby = this.lobbiesMap[messageObj.data.id];

		var response = {};
		response.data = {};

		response.sessionID = sessionID;
		response.channel = "info lobby";
		response.data.success = true;
		response.data.message = "Lobby data retrieval successful";
		response.data.lobbyData = lobby.getLobbyInfo();

		outputPub.publish('output message:' + sessionID, JSON.stringify(response));
		return;	

	} else {
		//Request for info about all lobbies
		//We'll probably have to change it later to be paginated or 
		//something so it doesn't try to send information about too many lobbies at once
		
		var response = {};
		response.data = {};

		response.sessionID = sessionID;
		response.channel = "info lobby";
		response.data.success = true;
		response.data.message = "Lobby data retrieval successful";
		response.data.lobbyData = [];

		for (var i = 0; i < this.lobbies.length; i++) {
			response.data.lobbyData.push(this.lobbies[i].getLobbyInfo());
		}

		outputPub.publish('output message:' + sessionID, JSON.stringify(response));
		return;	
	}
};

LobbyManager.prototype._startMessageReceived = function(channelPattern, actualPattern, message) {
	console.log("Processing start game request");
	var messageObj = JSON.parse(message);
	var sessionID = messageObj.sessionID;

	var lobbyID = messageObj.data.id;
	var username = this.sessionManager.getSessionProperty(sessionID, 'username');

	if (!this.lobbiesMap.hasOwnProperty(lobbyID)) {
		//Error, tried to leave a lobby which doesn't exist
		
		var response = {};
		response.data = {};

		response.sessionID = sessionID;
		response.channel = "leave lobby";
		response.data.success = false;
		response.data.message = "No such lobby";

		outputPub.publish('output message:' + sessionID, JSON.stringify(response));
		return;
	}

	//Lobby exists
	var lobby = this.lobbiesMap[lobbyID];	

	var game = this.gameManager.createGame(lobby.users, function() {

		var response = {};
		response.channel = "start game";
		response.data = {};
		response.data.success = true;
		response.data.message = "Game started";

		for (var i = 0; i < lobby.users.length; i++) {
			response.sessionID = sessionID
			outputPub.publish('output message:' + sessionID, JSON.stringify(response));
		}
	});
};

LobbyManager.prototype.getAllLobbies = function() {
	return this.lobbies;
};

LobbyManager.prototype.getLobbyByID = function(id) {
	return this.lobbiesMap[id];
};

LobbyManager.prototype.createLobby = function(lobbyName) {
	var newLobby = new Lobby(this._generateLobbyID(), lobbyName);

	this.lobbies.push(newLobby);
	this.lobbiesMap[newLobby.id] = newLobby;

	return newLobby;
};

LobbyManager.prototype._generateLobbyID = function() {
	return this.lobbyCount++;
};

var Lobby = function(id, name) {
	this.id = id;
	this.name = name;
	this.usernames = [];
	this.users = [];
	console.log("New lobby created with name: " + this.name);
};

Lobby.prototype.userJoin = function(sessionID, username) {
	this.usernames.push(username);

	this.users.push({
		username: username,
		sessionID: sessionID
	});

	var response = {
		success: true,
		message: "Successfully joined lobby"
	}

	console.log("User: " + username + " joined lobby with ID " + this.id);

	return true;
};

Lobby.prototype.userLeave = function(username) {
	console.log("User: " + username + " left lobby with ID " + this.id);
	this.usernames.splice(this.usernames.indexOf(username), 1);
	//Reminder to do later
	for (var i = 0; i < this.users; i++) {
		if (this.users[i].username === username) {
			this.users.splice(i, 1);
			console.log("[DEBUG] User removed from lobby map");
			break; //User should only be in here once, right
		}
	}
};

Lobby.prototype.sendToAll = function(channel, responseData) {

	for (var i = 0; i < this.users.length; i++) {
		var response = {};
		response.sessionID = this.users[i].sessionID;
		response.channel = channel;
		response.data = responseData;
		outputPub.publish('output message:' + response.sessionID, JSON.stringify(response));
	}

}

Lobby.prototype.userInLobby = function(username) {
	return this.usernames.indexOf(username) !== -1;
};

Lobby.prototype.getLobbyInfo = function() {
	return {
		id: this.id,
		name: this.name,
		usernames: this.usernames
	};
};

Lobby.prototype.prepareForDestroy = function() {
	//ToDo: mark as about to be destroyed
	this.sendToAll("lobby destroy", {message: "This lobby has been destroyed", id: this.id });
};

module.exports = function(_redis) {
	redis = _redis;

	joinListener = redis.createClient(); //Lobby joins
	destroyListener = redis.createClient(); //Lobby destroys
	createListener = redis.createClient(); //Lobby creates
	leaveListener = redis.createClient(); //Lobby leaves
	infoListener = redis.createClient(); //Lobby info
	startListener = redis.createClient(); //Game starts

	outputPub = redis.createClient(); //Output messages;

	return LobbyManager;
};