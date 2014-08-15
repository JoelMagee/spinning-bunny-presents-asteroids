var mongoose = require('mongoose');
var UserModel = require('./usermodel')(mongoose);

mongoose.connect('mongodb://localhost/spinningbunny');

var db = mongoose.connection;

db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {
	console.log("Connected to MongoDB");
});

module.exports = {
	UserModel: UserModel
};