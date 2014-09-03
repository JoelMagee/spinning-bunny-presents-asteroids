define([
	'knockout'
], function (ko) {
    'use strict';

    var Lobby = function Lobby(id, name, totPlayers) {
        this.id = id;
        this.name = name;
		this.totPlayers = ko.observable(totPlayers);
		this.players = ko.observableArray();
    };
	
    Lobby.prototype = {
    };

    return Lobby;
});