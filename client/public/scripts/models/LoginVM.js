define([
    'knockout',
    'jquery',
	'models/Session',
	'bootstrap'
], function (ko, $, Session) {
    'use strict';
	
    var LoginVM = function LoginVM(socket, session) {
	
		var self = this;
	
		this.username = ko.observable();
		this.password = ko.observable();
		this.usernameModal = ko.observable();
		this.passwordModal = ko.observable();
		
		this.errorMessage = ko.observable("Error");
		this.showError = ko.observable(false);
	
		this.socket = socket;
		this.session = session;
		
		this.socket.on('login', function(response) {
			if (response.success) {
				self.socket.emit('info lobby', {}); // request the lobbies while logging in
				self.showError(false);
				console.log("logged in as " + self.username() + " with password " + self.password());
				self.session.username = self.username();
				
				self.username("");
				self.password("");
				$('.screen').hide();
				$('#dashboard-screen').show();
			} else {
				console.log(response.message);
				self.errorMessage(response.message);
				self.showError(true);
			}
		});
		
		this.socket.on('register', function(response) {
			if (response.success) {
				self.showError(false);
				console.log("registered as " + self.usernameModal() + " with password " + self.passwordModal());
				self.usernameModal("");
				self.passwordModal("");
				$('#register-modal').modal('hide');
			} else {
				console.log(response.message);
				self.errorMessage(response.message);
				self.showError(true);
			}
		});
    };
	
    LoginVM.prototype = {
		_validateInput: function(username, password) {
			if (username && password) {
				this.showError(false);
				return true;
			} 
			this.errorMessage("You must enter a username and a password");
			this.showError(true);
			return false;
		},
		login: function () {
			if (this._validateInput(this.username(), this.password())) {
				this.socket.emit('login', {'username': this.username(), 'password': this.password()});
			}
		},
		register: function () {
			if (this._validateInput(this.usernameModal(), this.passwordModal())) {
				this.socket.emit('register', {'username': this.usernameModal(), 'password': this.passwordModal()});
			}
		},
		clearModal: function () {
			this.usernameModal("");
			this.passwordModal("");
		},
		hideAlert: function () {
			this.showError(false);
		}
    };
	
    return LoginVM;
});