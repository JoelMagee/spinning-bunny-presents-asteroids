/*jslint white: true */

var redis;

var ServerChat = function() {
	var loginSub = redis.createClient();
	var logoutSub = redis.createClient();
	var joinLobbySub = redis.createClient();
	var createLobbySub = redis.createClient();
	var globalChatPub = redis.createClient();

	loginSub.on('pmessage', function(channelPattern, actualChannel, message) {
		var messageObj = JSON.parse(message);
		var sessionID = messageObj.sessionID;
		var username = messageObj.username;

		var newMessageObj = {};
		newMessageObj.message = {};
		newMessageObj.message.content = username + " has just logged in";
		newMessageObj.message.username = "";
		globalChatPub.publish('output message', JSON.stringify({sessionID: sessionID, channel: "global message", data:newMessageObj }));

	});

	loginSub.psubscribe("internal:login:username:*");

	logoutSub.on('pmessage', function(channelPattern, actualChannel, message) {
		var messageObj = JSON.parse(message);
		var sessionID = messageObj.sessionID;
		var username = messageObj.username;

		var newMessageObj = {};
		newMessageObj.message = {};
		newMessageObj.message.content = username + " has just logged out";
		newMessageObj.message.username = "";
		globalChatPub.publish('output message', JSON.stringify({sessionID: sessionID, channel: "global message", data:newMessageObj }));
	});

	logoutSub.psubscribe("internal:logout:username:*");

	joinLobbySub.on('message', function(channel, message) {
		var messageObj = JSON.parse(message);

		var username = messageObj.username;
		var sessionID = messageObj.sessionID;
		var lobbyName = messageObj.lobbyName;

		var newMessageObj = {};
		newMessageObj.message = {};
		newMessageObj.message.content = username + " has just joined the lobby " + lobbyName;
		newMessageObj.message.username = "";
		globalChatPub.publish('output message', JSON.stringify({sessionID: sessionID, channel: "global message", data:newMessageObj }));
	});

	joinLobbySub.subscribe('internal:lobby:join');

	createLobbySub.on('message', function(channel, message) {
		var messageObj = JSON.parse(message);

		var username = messageObj.username;
		var sessionID = messageObj.sessionID;
		var lobbyName = messageObj.lobbyName;

		var newMessageObj = {};
		newMessageObj.message = {};
		newMessageObj.message.content = username + " has just created the lobby " + lobbyName;
		newMessageObj.message.username = "";
		globalChatPub.publish('output message', JSON.stringify({sessionID: sessionID, channel: "global message", data:newMessageObj }));
	});

	createLobbySub.subscribe('internal:lobby:create');

	console.log("Server chat module loaded");
};

module.exports = function(_redis) {
	redis = _redis;

	return ServerChat;
};