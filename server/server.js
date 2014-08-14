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

var SocketHandler = require('./src/sockethandler')(redis);
var GlobalChat    = require('./src/globalchat')(redis);

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
} else {
	console.log(clc.green("Running production"));
}

// Set up morgan for logging
app.use(morgan('dev'));
app.use(bodyParser.json());
app.use(methodOverride());


// Load main internal modules

var socketHandler = new SocketHandler(io);
var globalChat = new GlobalChat();


// Listen on required port
http.listen(program.port);

console.log('Listening on port ' + program.port);