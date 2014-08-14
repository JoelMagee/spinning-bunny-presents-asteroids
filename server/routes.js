module.exports = {
	register_post: function(req, res) {
		console.log(req.body);
		res.status(200).send();
	},

	login_post: function(req, res) {
		console.log(req.body);
		res.status(200).send();
	},

	lobby_post: function(req, res) {

	},

	lobby_get: function(req, res) {
		//Creates a new lobby
		
	}
}

