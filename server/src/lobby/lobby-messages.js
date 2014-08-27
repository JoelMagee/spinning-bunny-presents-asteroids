/*jslint white: true node: true */

module.exports = {
	createLobbySuccessful: function(lobbyID) {
		return {
			success: true,
			message: "Lobby created",
			id: lobbyID
		}
	}
};