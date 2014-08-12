console.log("Bootstrapping Spinning Bunny");

var program        = require('commander');
var clc            = require('cli-color');

var express        = require('express');
var morgan         = require('morgan');
var bodyParser     = require('body-parser');
var methodOverride = require('method-override');
var http           = require('http');
var sockjs         = require('sockjs');

var app            = express();

// Parse provided arguments
program
  .version('0.0.1')
  .option('-p, --port <n>', 'Listen port [5000]', 5000)
  .option('-d, --dev', 'Development version')
  .parse(process.argv);

if (program.dev) {
	//Set any dev vars here
	console.log(clc.red("Running"));

	//Static directory for test files
	console.log("Using __dirname/public as static file directory");
	app.use(express.static(__dirname + '/public')); 	
} else {
	console.log(clc.green("Running production"));
}

// Set up morgan for logging
app.use(morgan('dev'));
app.use(bodyParser.json());
app.use(methodOverride());




// Load main internal modules
var Storage       = require('./src/storage.js');
var Login         = require('./src/login.js');
var Register      = require('./src/Register.js');
var Lobby         = require('./src/lobby.js');
var Game          = require('./src/game.js');
var SocketManager = require('./src/socket.js');


// Initiate main internal modules
var storageManager = new Storage();

var register = new Register(storageManager, app);
var login = new Login(storageManager, app);

// Create new socket manager which will start
// listening for connections and put players in lobbies
var server = http.createServer(app);
var sockets = new SocketManager(sockjs, server);

// Listen on required port
//app.listen(program.port);
server.listen(program.port);

console.log('Listening on port ' + program.port);