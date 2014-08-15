/*jslint white: true */

var bcrypt = require('bcrypt');
var SALT_WORK_FACTOR = 10;

module.exports = function(_mongoose) {
	
	// Dependencies
	var mongoose = _mongoose;
	var Schema = _mongoose.Schema;

	var UserSchema = new Schema({
		username: {
			type: String,
			required: true,
			index: {
				unique: true
			}
		},
		password: {
			type: String,
			required: true
		}
	});

	UserSchema.pre('save', function(next) {
		var user = this;

		if (!user.isModified('password')) {
			//Not modified so we don't need to hash it
			return next();
		}

		bcrypt.genSalt(SALT_WORK_FACTOR, function(err, salt) {
			if (err) return next(err);

			bcrypt.hash(user.password, salt, function(err, hash) {
				if (err) return next(err);

				user.password = hash;
				next();
			});
		});
	});

	UserSchema.methods.comparePassword = function(candidatePassword, callback) {
		bcrypt.compare(candidatePassword, this.password, function(err, isMatch) {
			if (err) return callback(err);
			callback(null, isMatch);
		});
	};

	var User = mongoose.model('User', UserSchema);

	return User;
}