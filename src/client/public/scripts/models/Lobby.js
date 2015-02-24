define([
	'knockout'
], function (ko) {
    'use strict';

    var Lobby = function Lobby(id, name, players) {
        this.id = id;
        this.name = name;
		this.players = ko.observableArray(players);
    };
	
    Lobby.prototype = {
    };

    return Lobby;
});