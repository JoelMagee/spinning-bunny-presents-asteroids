var redis = require('redis');

var completeSubscriber = redis.createClient();

completeSubscriber.on('pmessage', function(channelPattern, actualChannel, message) {
	console.log("[DEBUG][Subscriber][" + actualChannel + "]" + message);
});

completeSubscriber.psubscribe("*");