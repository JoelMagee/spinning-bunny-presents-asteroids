var ChannelUtils = {};

ChannelUtils.messageIn = function(cb, err) {
	return function(channelPattern, actualPattern, message) {
		try {
			var messageObj = JSON.parse(message);
			var sessionID = messageObj.sessionID;
			try {
				cb(sessionID, messageObj.data);
			} catch (e) {
				console.log("Server error");
				console.log(message);
				console.log(e.stack);

				if (messageObj.hasOwnProperty('channel')) {
					return err(sessionID, e, "Server Error", messageObj['channel']);
				}

				err(sessionID, e, undefined, channelPattern);
			}
		} catch (e) {
			console.log("Invalid message received");
			console.log(message);
			console.log(e.stack);
			err(sessionID, e, undefined, "Message format error", channelPattern);
		}

	}
};

module.exports = function() {
	return ChannelUtils;
}