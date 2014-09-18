define([
    'knockout',
    'jquery',
	'pixi',
	'jsBezier',
    'models/Ship',
	'models/Bullet',
	'models/Asteroid',
	'models/Explosion',
	'models/Helper',
	'models/UI',
	'models/PhaseManager',
	'models/Phases/LoadingPhase',
	'models/Phases/MovementPhase',
	'models/Phases/FirePointPhase',
	'models/Phases/FireDirectionPhase',
	'models/Phases/WaitingPhase',
	'models/Phases/AnimationPhase',
	'models/Phases/DeadPhase',
	'models/Phases/GameEndPhase'
], function(ko, $, PIXI, jsBezier, Ship, Bullet, Asteroid, Explosion, Helper, UI, PhaseManager, LoadingPhase, MovementPhase, FirePointPhase, FireDirectionPhase, WaitingPhase, AnimationPhase, DeadPhase, GameEndPhase) {
    'use strict';
	
	/*jslint browser: true*/
    
    var GameVM3 = function GameVM3(socket, session) {
		
		var setMovementPhase = function() {
			self.phaseManager.setCurrentPhase(self.movementPhase);
			self.waiting(false);
		};
		
		var setDeadPhase = function() {
			self.phaseManager.setCurrentPhase(self.deadPhase);
		};

		var self = this;

		this.socket = socket;
		this.session = session;
		
		this.scores = {};
		
		this.muted = ko.observable(false);
		
		this.world = new PIXI.DisplayObjectContainer();
		this.bulletGraphics = new PIXI.DisplayObjectContainer();
		this.world.addChild(this.bulletGraphics);
		
		this.world.pannedAmountX = 0;
		this.world.pannedAmountY = 0;
		this.world.scaledAmount = 1;
		
		// these lines zoom out to show the full map
		this.world.scale.x /= 16;
		this.world.scale.y /= 16;
		this.world.scaledAmount /= 16;
		
		// these lines centre the map
		// $(window).width()/2: moves the x point to the middle of the window
		// -10000/32: offsets it by the size of the playable world with the zoom factor applied and halved
		this.world.x += $(window).width()/2-10000/32;
		this.world.pannedAmountX += $(window).width()/2-10000/32;
		this.world.y += $(window).height()/2-10000/32;
		this.world.pannedAmountY += $(window).height()/2-10000/32;

		this.started = false;
		this.waiting = ko.observable(false);
		
		this.phaseTitle = ko.observable('');
		
		this.clientShip = undefined;
		this.ships = [];
		this.bullets = [];
		this.asteroids = [];
		this.explosions = [];
	
		this.SCREEN_WIDTH = $(window).width();
		this.SCREEN_HEIGHT = $(window).height();
				
		// create an new instance of a pixi stage
		var stage = new PIXI.Stage(0x000000);
		
		var createMouse = function(world, stage) {
		
			var mouseX = function() { return (stage.getMousePosition().x-world.pannedAmountX)/world.scaledAmount; };
			var mouseY = function() { return (stage.getMousePosition().y-world.pannedAmountY)/world.scaledAmount; };
		
			return {"x": mouseX, "y": mouseY};
		};
		
		var mouse = createMouse(this.world, stage);
		
		var border = new PIXI.Graphics();
		this.world.addChildAt(border, 0);
		
		this.UI = new UI(this.world, mouse);
		this.world.addChild(this.UI.movementLine);
		this.world.addChild(this.UI.fireDot);
		this.world.addChild(this.UI.fireLine);
		
		this.loadingPhase = new LoadingPhase();
		this.movementPhase = new MovementPhase(stage, mouse, this.UI, this.ships, this.asteroids, this.phaseTitle);
		this.firePointPhase = new FirePointPhase(stage, mouse, this.UI, this.ships, this.phaseTitle);
		this.fireDirectionPhase = new FireDirectionPhase(stage, mouse, this.UI, this.ships, this.phaseTitle);

		this.waitingPhase = new WaitingPhase(this.UI, stage, mouse, this.ships, this.phaseTitle);
		this.animationPhase = new AnimationPhase(this.UI, this.ships, this.bullets, this.explosions, stage, mouse, this.phaseTitle);
		this.deadPhase = new DeadPhase(this.UI, stage, mouse, this.ships, this.phaseTitle);
		this.gameEndPhase = new GameEndPhase(this.world, this.ships, this.bullets, this.asteroids, this.explosions, this.socket, this.scores);

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
		$('#game-screen').append(renderer.view);

		// simple resize listener - can be expanded upon
		$(window).resize(resizeRenderer);
		function resizeRenderer() {
		
			console.log("resizing");
			
			renderer.resize($(window).width(), $(window).height());

		}
		
		// mousewheel event handler for zooming in and out
		$('#game-screen').on('mousewheel', function(e) {
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

		var updateLogic = function() {
			var time = Date.now();
			var prevTime = time;
			return function(cb) {
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
				border.beginFill(0x222222);
				border.drawRect(0, 0, 10000, 10000);
				border.endFill();
				
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

			if (self.world.children.length > 2) {
				self.world.removeChild(self.UI.movementLine);
				self.world.removeChild(self.UI.fireDot);
				self.world.removeChild(self.UI.fireLine);
			}
			self.world.addChild(self.UI.movementLine);
			self.world.addChild(self.UI.fireDot);
			self.world.addChild(self.UI.fireLine);
			
			for (var username in response.data.players) {
				var position = response.data.players[username].position;
				var ship = self.createShip(username);
				ship.setInitialPosition(position);
			}
			
			for (var i in response.data.asteroids) {
				var position = response.data.asteroids[i].position;
				var radius = response.data.asteroids[i].radius;
				var asteroid = new Asteroid(position, radius);
				self.world.addChild(asteroid.graphics);
				self.asteroids.push(asteroid);
				
			}
			
			self.phaseManager.setCurrentPhase(self.movementPhase);
			
		});
		
		this.socket.on('start turn', function() {
			console.log("start turn");
			if (!self.clientShip.dead) {
				self.animationPhase.off('animation finished', setMovementPhase);
				self.animationPhase.once('animation finished', setMovementPhase);
			}
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
			console.log('turn result');
			console.log(response);
			
			console.log(self.ships);
			
			self.ships.forEach(function(ship) {
				var shipResult = undefined;
				
				if (response.turnResult.players.hasOwnProperty(ship.username)) {
					shipResult = response.turnResult.players[ship.username];
					ship.setDestination(shipResult.destination, shipResult.prediction);
					
					if (response.turnResult.players[ship.username].collisions.length > 0) {
						ship.addCollisions(response.turnResult.players[ship.username].collisions);
						
						var explosion = new Explosion(ship.getPositionOnArc(ship.collideT), ship.collideT, 0.01, self.muted);
						self.explosions.push(explosion);
						self.world.addChild(explosion.graphics);
						
						//Is this our ship
						if ((ship.lives <= 0) && (ship.username === self.clientShip.username)) {
							self.animationPhase.off('animation finished', setMovementPhase);
							self.animationPhase.on('animation finished', setDeadPhase);
						}
					}
				}
				
			});

			//remove previous bullets here
			if (self.bulletGraphics.children.length > 0) {
				self.bulletGraphics.removeChildren();
			}
			self.bullets.length = 0;
			
			for (var i in response.turnResult.bullets) {
				var bullet = new Bullet(response.turnResult.bullets[i], self.muted);
				self.bullets.push(bullet);
				self.bulletGraphics.addChild(bullet.graphics);
				
				if(response.turnResult.bullets[i].destroyed) {
					var explosion = new Explosion(bullet.getPositionOnLine(), response.turnResult.bullets[i].destroyedAt, 0.04, self.muted);
					self.explosions.push(explosion);
					self.world.addChild(explosion.graphics);
				}
			}

			self.phaseManager.setCurrentPhase(self.animationPhase);
			
		});
		
		this.socket.on('leave game', function(response) {
						
			if (response.success) {
				self.phaseManager.setCurrentPhase(self.gameEndPhase);
			} else { 
				alert('Failed to leave');
			}
		
		});
		
		this.socket.on('game end', function(response) {
		
			self.animationPhase.off('animation finished', setMovementPhase);
			self.animationPhase.off('animation finished', setDeadPhase);
			self.animationPhase.once('animation finished', function() {
				console.log(response);
				self.scores.result = response.scores;
				self.phaseManager.setCurrentPhase(self.gameEndPhase);
				self.waiting(false);
				self.started = false;
			});

		});
        
    };
	
    GameVM3.prototype = {
		endGame: function() {
			
			this.socket.emit('leave game');
			
		},
		endTurn: function() {
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
		undo: function() {
			this.phaseManager.setCurrentPhase(this.movementPhase);
		},

		_zoomIn: function(mouseX, mouseY) {
			if (this.world.scaledAmount < 1) {
			
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
		_zoomOut: function(mouseX, mouseY) {
			if (this.world.scaledAmount > 1/16) {
			
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
		createShip: function(username) {
			var ship = new Ship(username);
			
			this.world.addChild(ship.graphics);
			this.world.addChild(ship.text);
			this.world.addChild(ship.ghostGraphics);

			if (username === this.session.username) {
				this.clientShip = ship;
				this.UI.setClientShip(ship);
			}
			this.ships.push(ship);
			
			return ship;
		},
		toggleMute: function() {
			this.muted(!this.muted());
		}
    };
	
    return GameVM3;
});