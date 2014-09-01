var ChannelUtils = {};

ChannelUtils.messageIn = function(cb, err) {
	return function(channelPattern, actualPattern, message) {
		try {
			var messageObj = JSON.parse(message);
			var sessionID = messageObj.sessionID;		
			cb(sessionID, messageObj.data);
		} catch (e) {
			console.log("Invalid message received");
			console.log(message);
			console.log(e.stack);
			//err(sessionID, e, channelPattern);
		}
	}
};

module.exports = function() {
	return ChannelUtils;
}