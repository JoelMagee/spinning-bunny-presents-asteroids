/*jslint white: true node: true */

/**
 * LobbyTransferManager
 *
 * @author : Sam Stonehouse
 * @date : 01/09/2014
 * @version  : 0.1
 *
 * Manages communication between the lobby manager and game manager
 */

var LobbyTransferManager = function(lobbyMessageHandler, gameManager) {

	lobbyMessageHandler.on('launch game', function(lobby) {
		var game = gameManager.createGame(lobby.getUsers());
		lobby.startGame(game);
	});

	lobbyMessageHandler.on('loading game', function(sessionID, username, game) {
		gameManager.joinGame(sessionID, username, game);
	});
};

module.exports = function() {
	return LobbyTransferManager;
};