var redis = require('redis');

var completeSubscriber = redis.createClient();

completeSubscriber.on('pmessage', function(channelPattern, actualChannel, message) {
	console.log("[DEBUG][Subscriber]" + message);
});

completeSubscriber.psubscribe("*");