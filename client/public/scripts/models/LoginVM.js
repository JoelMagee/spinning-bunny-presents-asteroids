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
		login: function () {
			if (this.username() === undefined || this.username() === "") {
				this.errorMessage("You must enter a username");
				this.showError(true);
				console.log(this.errorMessage());
			} else if (this.password() === undefined  || this.password() === ""){
				this.errorMessage("You must enter a password");
				this.showError(true);
				console.log(this.errorMessage());
			} else {
				console.log("logged in as " + this.username() + " with password " + this.password());
				this.username("");
				this.password("");
				$('#loginScreen').hide();
				$('#lobbyListScreen').show();
			}
		},
		register: function () {
			console.log("registered as " + this.usernameModal() + " with password " + this.passwordModal());
			$('#registerModal').modal('hide');
			// return false;
		},
		_validateInput: function(username, password, type) {
			if (username() === undefined || username() === "") {
				this.errorMessage("You must enter a username");
				this.showError(true);
				console.log(this.errorMessage());
			} else if (password() === undefined  || this.password() === ""){
				this.errorMessage("You must enter a password");
				this.showError(true);
				console.log(this.errorMessage());
			} else {
				console.log("logged in as " + username() + " with password " + password());
				username("");
				password("");
			}
		}
    };
	
	
  
    return LoginVM;
});