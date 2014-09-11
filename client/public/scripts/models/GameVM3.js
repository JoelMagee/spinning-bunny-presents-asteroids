define([
    'knockout',
    'jquery',
	'pixi',
	'jsBezier',
    'models/Ship',
	'models/Asteroid',
	'models/Helper',
	'models/UI',
	'models/PhaseManager',
	'models/Phases/LoadingPhase',
	'models/Phases/MovementPhase',
	'models/Phases/FirePointPhase',
	'models/Phases/FireDirectionPhase',
	'models/Phases/WaitingPhase',
	'models/Phases/AnimationPhase',
	'models/Phases/GameEndPhase'
], function (ko, $, PIXI, jsBezier, Ship, Asteroid, Helper, UI, PhaseManager, LoadingPhase, MovementPhase, FirePointPhase, FireDirectionPhase, WaitingPhase, AnimationPhase, GameEndPhase) {
    'use strict';
	
	/*jslint browser: true*/
    
    var GameVM3 = function GameVM3(socket, session) {
		
		var setMovementPhase = function() {
			self.phaseManager.setCurrentPhase(self.movementPhase);
			self.waiting(false);
		};

		var self = this;

		this.socket = socket;
		this.session = session;
		
		this.worldObects = {"ships": [], "asteroids": []};
		
		this.world = new PIXI.DisplayObjectContainer();
		
		this.world.pannedAmountX = 0;
		this.world.pannedAmountY = 0;
		this.world.scaledAmount = 1;
			
		this.started = false;
		this.waiting = ko.observable(false);
		
		this.clientShip = undefined;
		this.ships = [];
	
		this.SCREEN_WIDTH = $(window).width();
		this.SCREEN_HEIGHT = $(window).height();
				
		// create an new instance of a pixi stage
		var stage = new PIXI.Stage(0x66FF99);
		
		var createMouse = function(world, stage) {
		
			var mouseX = function () { return (stage.getMousePosition().x-world.pannedAmountX)/world.scaledAmount; };
			var mouseY = function () { return (stage.getMousePosition().y-world.pannedAmountY)/world.scaledAmount; };
		
			return {"x": mouseX, "y": mouseY};
		};
		
		var mouse = createMouse(this.world, stage);
		
		var border = new PIXI.Graphics();
		this.world.addChild(border);
		
		this.UI = new UI(this.world, mouse);
		this.world.addChild(this.UI.movementLine);
		this.world.addChild(this.UI.fireDot);
		this.world.addChild(this.UI.fireLine);
		
		this.loadingPhase = new LoadingPhase();
		this.movementPhase = new MovementPhase(stage, mouse, this.UI, this.ships);
		this.firePointPhase = new FirePointPhase(stage, mouse, this.UI, this.ships);
		this.fireDirectionPhase = new FireDirectionPhase(stage, mouse, this.UI, this.ships);

		this.waitingPhase = new WaitingPhase(this.UI, stage, mouse);
		this.animationPhase = new AnimationPhase(this.UI, this.ships, stage, mouse);
		this.gameEndPhase = new GameEndPhase(this.world, this.ships, this.socket);

		this.phaseManager = new PhaseManager();

		this.movementPhase.on('movement set', function() {
			self.phaseManager.setCurrentPhase(self.firePointPhase);
		});

		this.firePointPhase.on('fire point set', function() {
			self.phaseManager.setCurrentPhase(self.fireDirectionPhase);
		});

		// create a renderer instance.
		var renderer = PIXI.autoDetectRenderer(this.SCREEN_WIDTH, this.SCREEN_HEIGHT, null, false, true); //width, height, view, transparent, antialias
		
		// add the renderer view element to the DOM
		$('#gameScreen').append(renderer.view);

		// simple resize listener - can be expanded upon
		$(window).resize(resizeRenderer);
		function resizeRenderer() {
		
			console.log("resizing");
			
			renderer.resize($(window).width(), $(window).height());

		}
		
		// mousewheel event handler for zooming in and out
		$('#gameScreen').on('mousewheel', function(e) {
			if(e.originalEvent.wheelDelta < 0) {
				//scroll down
				self._zoomOut(e.clientX, e.clientY);
			} else {
				//scroll up
				self._zoomIn(e.clientX, e.clientY);
			}
			//prevent page from scrolling
			return false;
		});

		requestAnimFrame( animate );
		
		stage.addChild(this.world);

		var updateLogic = function () {
			var time = Date.now();
			var prevTime = time;
			return function (cb) {
				prevTime = time;
				time = Date.now();
				
				cb(time-prevTime);
			};
		};
		
		var update = updateLogic();
				
		function animate() {
		
			requestAnimFrame( animate );
		
			if (self.started) {
			
				update(self.phaseManager.currentPhase.update.bind(self.phaseManager.currentPhase));
				
				self.phaseManager.currentPhase.draw();
				
				border.clear();
				border.lineStyle(2/self.world.scale.x, 0x000000, 1);
				border.drawRect(0, 0, 10000, 10000);
				
			}
			
			// render the stage   
			renderer.render(stage);
		
		} 
		
		this.socket.on('loading game', function(response) {
			console.log(response);
			
			console.log("setting current phase");
			self.phaseManager.setCurrentPhase(self.loadingPhase);
		});
		 
		this.socket.on('start game', function(response) {
			console.log(response);
			self.started = true;

			if (self.world.children.length > 1) {
				self.world.removeChild(self.UI.movementLine);
				self.world.removeChild(self.UI.fireDot);
				self.world.removeChild(self.UI.fireLine);
			}
			self.world.addChild(self.UI.movementLine);
			self.world.addChild(self.UI.fireDot);
			self.world.addChild(self.UI.fireLine);
			
			for (var username in response.data) {
				var position = response.data[username].position;
				var ship = self.createShip(username);
				ship.setInitialPosition(position);
			}
			
			self.phaseManager.setCurrentPhase(self.movementPhase);
			
		});
		
		this.socket.on('start turn', function() {
			console.log("start turn");
			self.animationPhase.off('animation finished', setMovementPhase);
			self.animationPhase.once('animation finished', setMovementPhase);
		});
		
		this.socket.on('game turn', function(response) {
			if (response.success) {
				console.log("waiting");
				
				self.phaseManager.setCurrentPhase(self.waitingPhase);

				self.waiting(true);
			} else {
				console.log("failed");
			}
		});
		
		this.socket.on('turn result', function(response) {
			console.log(response);
			
			self.phaseManager.setCurrentPhase(self.animationPhase);
						
			self.ships.forEach(function(ship) {
				var shipResult = undefined;
				
				if (response.turnResult.hasOwnProperty(ship.username)) {
					shipResult = response.turnResult[ship.username];
				}
				
				if (shipResult === undefined) {
					console.error("Player has no result");
					return;
				}
			
				ship.setDestination(shipResult.position, shipResult.prediction);
			});
			
		});
		
		this.socket.on('game end', function(response) {
		
			self.animationPhase.off('animation finished', setMovementPhase);
			self.animationPhase.once('animation finished', function() {
				console.log(response);
				self.phaseManager.setCurrentPhase(self.gameEndPhase);
				self.waiting(false);
				self.started = false;
			});

		});
        
    };
	
    GameVM3.prototype = {
		endGame: function () {
			
			alert('work in progress');
			
		},
		endTurn: function () {
			var self = this;

			console.log("turn submitted");
			if ($.isEmptyObject(self.clientShip.currentMove)) {
				self.clientShip.currentMove = self.clientShip.position;
			}
			if (self.clientShip.angle) {
				console.log("sent next values as: " + self.clientShip.currentMove.x + ", " + self.clientShip.currentMove.y);
				console.log("sent t value as: " + self.clientShip.t + ", sent angle as: " + self.clientShip.angle);
				this.socket.emit('game turn', {
					destination: self.clientShip.currentMove,
					shot: {'t': self.clientShip.t, 'direction': self.clientShip.angle}
				});
			} else {
				console.log("sent next values as: " + self.clientShip.currentMove.x + ", " + self.clientShip.currentMove.y);
				this.socket.emit('game turn', {
					destination: self.clientShip.currentMove
				});
			}
			
		},
		undo: function () {
			this.phaseManager.setCurrentPhase(this.movementPhase);
		},

		_zoomIn: function (mouseX, mouseY) {
			if (this.world.scaledAmount < 2) {
			
				console.log("zooming in");
				this.world.scale.x *= 2;
				this.world.scale.y *= 2;
				this.world.scaledAmount *= 2;
				
				var startX = this.world.pannedAmountX;
				var startY = this.world.pannedAmountY;
				
				var changeX = mouseX - startX;
				var changeY = mouseY - startY;
				
				this.world.x -= changeX;
				this.world.pannedAmountX -= changeX;
				this.world.y -= changeY;
				this.world.pannedAmountY -= changeY;
			
			}
		},
		_zoomOut: function (mouseX, mouseY) {
			if (this.world.scaledAmount > 1/32) {
			
				console.log("zooming out");
				this.world.scale.x /= 2;
				this.world.scale.y /= 2;
				this.world.scaledAmount /= 2;
				
				var startX = this.world.pannedAmountX;
				var startY = this.world.pannedAmountY;
				
				var changeX = mouseX - startX;
				var changeY = mouseY - startY;
				
				this.world.x += changeX/2;
				this.world.pannedAmountX += changeX/2;
				this.world.y += changeY/2;
				this.world.pannedAmountY += changeY/2;
			
			}
		},
		createShip: function (username) {
			var ship = new Ship(username);
			this.world.addChild(ship.graphics);
			this.world.addChild(ship.text);
			this.world.addChild(ship.ghostGraphics);
			this.world.addChild(ship.bulletGraphics);
			if (username === this.session.username) {
				this.clientShip = ship;
				this.UI.setClientShip(ship);
			}
			this.ships.push(ship);
			
			return ship;
		}
    };
	
    return GameVM3;
});