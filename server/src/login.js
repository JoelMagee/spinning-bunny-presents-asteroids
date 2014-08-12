/*
Creates a login object which handles authentication

Requres a storage abstraction to get user objects from

*/

var Login = function(storage) {
	this.storage = storage;
};

Login.prototype.auth = function(username, password) {
	return this.storage.verifyPassword(username, password);
};

Login.prototype.getUser = function(username) {
	return this.storage.getUser(username);
};

module.exports = Login;