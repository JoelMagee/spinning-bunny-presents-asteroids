define([
], function () {
    'use strict';

    var Lobby = function Lobby(id, name, players) {
        this.id = id;
        this.name = name;
		this.players = players + "/6";
    };
	
    Lobby.prototype = {
    };

    return Lobby;
});