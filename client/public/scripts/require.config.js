/* exported require */
var require = {
    paths: {
        'jquery': 'libs/jquery-2.1.0',
        'jquery-private': 'libs/jquery-private',
        'knockout': 'libs/knockout-3.0.0.debug',
		'pixi': 'libs/pixi.dev',
        'text': 'libs/text',
		'bootstrap': '../bootstrap/js/bootstrap',
		'socketio': 'https://cdn.socket.io/socket.io-1.0.0'
    },
    map: {
        '*': {
            'jquery': 'jquery-private'
        },
        'jquery-private': {
            'jquery': 'jquery'
        }
    },
    shim: {
        // Knockout pulls optional dependency jQuery off window - ensure it's always there first for consistent behaviour
        'knockout': {
            deps: ['jquery']
        },
		'bootstrap': {
			deps: ['jquery']
		},
		'socketio': {
		  exports: 'io'
		}
    }
};