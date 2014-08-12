/*
Storage abstration layer

Mock implementation layer
 */

var Storage = function() {

};

Storage.prototype.getUser = function(username) {
	return {
		username: "Ausername",
		email: "sstonehouse@scottlogic.com"
	}
}

Storage.prototype.addUser = function(userProperties) {
	return true; //Return true on success?
}

Storage.prototype.verifyPassword = function(username, password) {
	return true;
}

module.exports = Storage;