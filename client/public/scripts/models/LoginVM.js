define([
    'knockout',
    'jquery',
	'models/User',
	'bootstrap'
], function (ko, $, User) {
    'use strict';
	
    var LoginVM = function LoginVM() {
		this.username = ko.observable();
		this.password = ko.observable();
		this.usernameModal = ko.observable();
		this.passwordModal = ko.observable();
		
		this.errorMessage = ko.observable("Error");
		this.showError = ko.observable(false);
	
		// this.chat = new Chat(this);
    };
	
    LoginVM.prototype = {
		_validateInput: function(username, password) {
			if (username() === undefined || username() === "") {
				// $( "#username" ).toggleClass( "has-error");
				this.errorMessage("You must enter a username");
				this.showError(true);
				console.log(this.errorMessage());
			} else if (password() === undefined  || this.password() === ""){
				// $( "#password" ).toggleClass( "has-error");
				this.errorMessage("You must enter a password");
				this.showError(true);
				console.log(this.errorMessage());
			} else {
				return true;
			}
			return false;
		},
		login: function () {
			if (this._validateInput(this.username, this.password)) {
				console.log("logged in as " + this.username() + " with password " + this.password());
				this.username("");
				this.password("");
				$('#loginScreen').hide();
				$('#lobbyListScreen').show();
			}
		},
		register: function () {
			if (this._validateInput(this.usernameModal, this.passwordModal)) {
				console.log("registered as " + this.usernameModal() + " with password " + this.passwordModal());
				this.usernameModal("");
				this.passwordModal("");
				$('#registerModal').modal('hide');
			}
		},
		clearModal: function () {
			this.usernameModal("");
			this.passwordModal("");
		}
    };
	
    return LoginVM;
});