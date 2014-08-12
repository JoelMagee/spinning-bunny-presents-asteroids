/*
Creates a login object which handles authentication

Requres a storage abstraction to retreive the users from and
requires the app object to set up the routes

*/
var Register = function(storage, app) {
	this.storage = storage;
	this.app = app;

	this.initRoutes();
};

Register.prototype.addUser = function(userProperties) {
	//Data validation here
	this.storage.addUser(userProperties);
};

Register.prototype.initRoutes = function() {
	this.app.post('register', function(req, res) {
		console.log(req.body);
		res.status(200).send();
	});
};

module.exports = Register;