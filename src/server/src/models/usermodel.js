/*jslint white: true node: true */

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
		},
		gamesStarted: {
			type: Number,
			required: true,
			default: 0
		},
		gamesFinished: {
			type: Number,
			required: true,
			default: 0
		},
		gamesWon: {
			type: Number,
			required: true,
			default: 0
		},
		totalScore: {
			type: Number,
			required: true,
			default: 0
		},
		killStats: [{ username:  String, count:  Number }],
		totalKills: {
			type: Number,
			required: true,
			default: 0
		},
		highestScore: {
			type: Number,
			required: true,
			default: 0
		}
	});

	UserSchema.pre('save', function(next) {
		var user = this;

		if (!user.isModified('password')) {
			//Not modified so we don't need to hash it
			return next();
		}

		bcrypt.genSalt(SALT_WORK_FACTOR, function(err, salt) {
			if (err) { return next(err); }

			bcrypt.hash(user.password, salt, function(err, hash) {
				if (err) { return next(err); }

				user.password = hash;
				next();
			});
		});
	});

	UserSchema.methods.comparePassword = function(candidatePassword, callback) {
		bcrypt.compare(candidatePassword, this.password, function(err, isMatch) {
			if (err) { return callback(err); }
			callback(null, isMatch);
		});
	};

	UserSchema.methods.addKills = function(kills) {
		var self = this;

		kills.forEach(function(kill) {
			var found = false;

			self.killStats.forEach(function(stat) {
				if (stat.username === kill) {
					found = true;
					stat.count++;
				}
			});

			if (!found) {
				self.killStats.push({
					username: kill,
					count: 1
				});
			}
		});
	};

	UserSchema.methods.getPublicData = function() {
		return {
			username: this.username,
			totalKills: this.totalKills,
			killStats: this.killStats,
			totalScore: this.totalScore,
			gamesWon: this.gamesWon,
			gamesStarted: this.gamesStarted,
			gamesFinished: this.gamesFinished,
			highestScore: this.highestScore
		}
	}

	var User = mongoose.model('User', UserSchema);

	return User;
};