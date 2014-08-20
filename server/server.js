console.log("Bootstrapping Spinning Bunny");

var program        = require('commander');
var clc            = require('cli-color');

var express        = require('express')
var app            = express();
var http           = require('http').Server(app);
var io             = require('socket.io')(http);

var morgan         = require('morgan');
var bodyParser     = require('body-parser');
var methodOverride = require('method-override');

var redis          = require('redis');

var SocketHandler  = require('./src/sockethandler')(redis);
var GlobalChat     = require('./src/globalchat')(redis);
var SessionManager = require('./src/session-manager')();
var LobbyManager   = require('./src/lobby')(redis);
var GameManager    = require('./src/game-manager')(redis);

var Login          = require('./src/login')(redis);
var Logout         = require('./src/logout')(redis);
var Register       = require('./src/register')(redis);

// Parse provided arguments
program
  .version('0.0.1')
  .option('-p, --port <n>', 'Listen port [5000]', 5000)
  .option('-d, --dev', 'Development version')
  .parse(process.argv);

if (program.dev) {
	//Set any dev vars here
	console.log(clc.red("Running development"));

	//Static directory for test files
	console.log("Using __dirname/public as static file directory");
	app.use(express.static(__dirname + '/public'));

	// Set up morgan for logging
	app.use(morgan('dev'));
	app.use(bodyParser.json());
	app.use(methodOverride());
} else {
	console.log(clc.green("Running production"));
}

var models = require('./src/models/models');

// Load main internal modules
var sessionManager = new SessionManager();
var socketHandler = new SocketHandler(io, sessionManager);
var globalChat = new GlobalChat(sessionManager);

var gameManager = new GameManager(sessionManager);
var lobbyManager = new LobbyManager(sessionManager, gameManager);


var login = new Login(sessionManager, models.UserModel);
var logout = new Logout(sessionManager);
var register = new Register(models.UserModel);


// Listen on required port
http.listen(program.port);

console.log('Listening on port ' + program.port);