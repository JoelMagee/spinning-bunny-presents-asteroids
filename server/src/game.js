var World = require('./world.js')();

var defaultOptions = {

}

var Game = function(name) {
	//Name or title of the current game
	this.name = name;

	this.players = {};
	this.playerCount = 0;

	this.turnCount = 0;
	this.currentTurn = [];

	//Generate world
	this.world = new World.World(100, 100);
}

Game.prototype.addPlayer = function(connection, id) {
	this.players[id] = {connection:connection, id: id};
	this.playerCount++;

	console.log("Adding player to game, current player count: " + this.playerCount);

	var self = this;

	connection.on('disconnect', function() {
		self.removePlayer(connection, id);
	});

	connection.on('chat message', function(message) {
		console.log("Chat message from client");
		console.log(message);
		//Send chat message to all clients
		connection.emit('chat message', "PlayerID - " + id + ": " + message);
		connection.broadcast.emit('chat message', "PlayerID - " + id + ": " + message);
	});

	connection.on('turn', function(data) {
		console.log("Turn message from client: " + id);
		self.addTurn(data, {id: id, connection: connection});
	});


	//Send any initial information needed by the client
	connection.emit('players', Array.prototype.map(function(i, e) { return e.id; }, this.players));
	connection.emit('world', this.world);
	connection.broadcast.emit('player join', id);
}

Game.prototype.addTurn = function(turnData, player) {
	this.turnCount++;
	this.currentTurn.push({
		id: player.id,
		turnData: turnData
	});

	if (this.turnCount >= this.playerCount) {
		console.log("All turns submitted");

		this.turnCount = 0;

		var turnResult = this.currentTurn.reduce(function(prev, curr, index) {
			return prev + curr;
		});

		console.log(turnResult);

		for (i in this.players) {
			this.players[i].connection.emit('turn result', turnResult);
		}
	}
}


Game.prototype.removePlayer = function(connection, id) {
	connection.broadcast.emit('player leave', id);
	console.log("Player disconnected");
	delete this.players[id];
	this.playerCount--;
}

Game.prototype.messageToAll = function(message) {

}


module.exports = Game;