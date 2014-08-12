var SocketManager = function(sockjs, server) {
	this.sockjs = sockjs;
	this.server = server;

	this.initServer();
};

SocketManager.prototype.initServer = function() {
	this.sockets = this.sockjs.createServer();
	this.sockets.installHandlers(this.server, { prefix: "/socket" });
	console.log(this.sockets);
	this.sockets.on('connection', this.clientConnection.bind(this));
}

SocketManager.prototype.clientConnection = function(conn) {
	console.log("Client connection");
	conn.on('close', this.clientClose.bind(this));
};

SocketManager.prototype.clientClose = function() {
	console.log("Client close connection");
};

module.exports = SocketManager;