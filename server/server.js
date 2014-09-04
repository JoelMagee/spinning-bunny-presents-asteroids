console.log("Bootstrapping Spinning Bunny");

var program              = require('commander');
var clc                  = require('cli-color');
var express              = require('express')

var app                  = express();

var http                 = require('http').Server(app);
var io                   = require('socket.io')(http);

var morgan               = require('morgan');
var bodyParser           = require('body-parser');
var methodOverride       = require('method-override');
var redis                = require('redis');

var SocketHandler        = require('./src/connection/sockethandler')(redis);
var GlobalChat           = require('./src/chat/globalchat')(redis);
var SessionStorage       = require('./src/session/session-storage')(redis);
var SessionManager       = require('./src/session/session-manager')();
var LobbyManager         = require('./src/lobby/lobby-manager')();
var GameManager          = require('./src/game/game-manager')(redis);
var LobbyTransferManager = require('./src/lobby/lobby-transfer-manager')();
var LobbyMessageManager  = require('./src/lobby/lobby-message-handler')(redis);
var Login                = require('./src/auth/login')(redis);
var Logout               = require('./src/auth/logout')(redis);
var Register             = require('./src/auth/register')(redis);

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
var sessionManager = new SessionManager(SessionStorage);
var socketHandler = new SocketHandler(io, sessionManager);
var globalChat = new GlobalChat(sessionManager);

var lobbyManager = new LobbyManager();
var gameManager = new GameManager(sessionManager);
var lobbyMessageManager = new LobbyMessageManager(sessionManager, lobbyManager);
var lobbyTransferManager = new LobbyTransferManager(lobbyMessageManager, gameManager);

var login = new Login(sessionManager, models.UserModel);
var logout = new Logout(sessionManager);
var register = new Register(models.UserModel);


// Listen on required port
http.listen(program.port);

console.log('Listening on port ' + program.port);