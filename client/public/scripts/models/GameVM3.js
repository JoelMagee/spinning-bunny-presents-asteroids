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
	'models/Phases/AnimationPhase'
], function (ko, $, PIXI, jsBezier, Ship, Asteroid, Helper, UI, PhaseManager, LoadingPhase, MovementPhase, FirePointPhase, FireDirectionPhase, WaitingPhase, AnimationPhase) {
    'use strict';
	
	/*jslint browser: true*/
    
    var GameVM3 = function GameVM3(socket, session) {
	
		var self = this;

		this.socket = socket;
		this.session = session;
		
		this.worldObects = {"ships": [], "asteroids": []};
		
		this.world = new PIXI.DisplayObjectContainer();
		
		this.world.pannedAmountX = 0;
		this.world.pannedAmountY = 0;
		this.world.scaledAmount = 1;
			
		this.dragging = false;
		this.firstDrag = false;
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
		
		this.UI = new UI(this.world);
		this.world.addChild(this.UI.movementLine);
		this.world.addChild(this.UI.fireDot);
		this.world.addChild(this.UI.fireLine);
		
		var loadingPhase = new LoadingPhase();
		var movementPhase = new MovementPhase(stage, mouse, this.UI, this.ships);
		var firePointPhase = new FirePointPhase(stage, mouse, this.UI, this.ships);
		var fireDirectionPhase = new FireDirectionPhase(stage, mouse, this.UI, this.ships);

		var waitingPhase = new WaitingPhase(self.UI, this.socket);
		var animationPhase = new AnimationPhase();

		var phaseManager = new PhaseManager();

		movementPhase.on('movement set', function() {
			phaseManager.setCurrentPhase(firePointPhase);
		});

		firePointPhase.on('fire point set', function() {
			phaseManager.setCurrentPhase(fireDirectionPhase);
		});

		// firePointPhase.on('end turn', function() {
			// phaseManager.setCurrentPhase(waitingPhase);
		// });
		
		// fireDirectionPhase.on('fire direction set', function() {
			// phaseManager.setCurrentPhase(fireDirectionPhase); //what phase to set
		// });

		// fireDirectionPhase.on('end turn', function() {
			// phaseManager.setCurrentPhase(waitingPhase);
		// });

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
		
		stage.mousedown = function (data) {

			if (mouse.x() < 0 || mouse.x() > 10000 || mouse.y() < 0 || mouse.y() > 10000) {
				return false;
			} else if (data.originalEvent.which === 3 || data.originalEvent.which === 2) { //Right click
				self.dragging = true;
				self.firstDrag = true;
			} else if (data.originalEvent.which === 1) {
				
				self.UI.mouseClick(self.clientShip);
				
			}

		};
		
		stage.mouseup = function () {
			self.dragging = false;
		};
		
		stage.mousemove = (function() {
			var prevX;
			var prevY;
		
			return function (data) {
				if (self.dragging) {
					
					if (self.firstDrag) {
						prevX = data.global.x;
						prevY = data.global.y;
						self.firstDrag = false;
					}
					
					var changeX = data.global.x-prevX;
					var changeY = data.global.y-prevY;
					
					self.world.x += changeX;
					self.world.pannedAmountX += changeX;
					self.world.y += changeY;
					self.world.pannedAmountY += changeY;
					
					prevX = data.global.x;
					prevY = data.global.y;
					
					/* 
						Add a check in here somewhere that means that
						the world can only be panned a certain distance
						based on pannedAmountX and pannedAmountY
					*/
					
				}
			};
			
		})();
		
		// this._drawAsteroids();
		
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
			
				update(phaseManager.currentPhase.update.bind(phaseManager.currentPhase));
				
				// phaseManager.currentPhase.update();
				phaseManager.currentPhase.draw();
				
				border.clear();
				border.lineStyle(2/self.world.scale.x, 0x000000, 1);
				border.drawRect(0, 0, 10000, 10000);
				
				// self.UI.draw(self.clientShip, self.world);
				
				// self.ships.forEach(function(ship) {
					// ship.draw();
				// });
			}

			// render the stage   
			renderer.render(stage);
		
		} 
			
		
		this.socket.on('loading game', function(response) {
			console.log(response);
			
			console.log("setting current phase");
			phaseManager.setCurrentPhase(loadingPhase);
		});
		 
		this.socket.on('start game', function(response) {
			console.log(response);
			self.started = true;
			
			phaseManager.setCurrentPhase(movementPhase);
			
			
			for (var username in response.data) {
				var position = response.data[username].position;
				var ship = self.createShip(username);
				ship.setInitialPosition(position);
			}
						
		});
		
		this.socket.on('start turn', function(response) {
			console.log(response);
		});
		
		this.socket.on('game turn', function(response) {
			if (response.success) {
				console.log("waiting");
				
				phaseManager.setCurrentPhase(waitingPhase);
				
				self.UI.waiting = true;
				self.waiting(true);
			} else {
				console.log("failed");
			}
		});
		
		this.socket.on('turn result', function(response) {
			console.log(response);
			
			phaseManager.setCurrentPhase(animationPhase);
			
			// var moves = response.turnResult.moves;
						
			self.ships.forEach(function(ship) {
				var shipResult = undefined;
				
				// for (var i = 0; i < moves.length; i++) {
					// if (moves[i].username === ship.username) {
						// shipResult = moves[i];
					// }
				// }
				
				if (response.turnResult.hasOwnProperty(ship.username)) {
					shipResult = response.turnResult[ship.username];
				}
				
				
				if (shipResult === undefined) {
					console.error("Player has no result");
					return;
				}
			
				ship.setDestination(shipResult.position, shipResult.prediction);
			});
			
			// clear the ghost before showing the replay
			self.clientShip.ghostGraphics.clear();
			
			self.UI.drawingUI = false;
			
			self.ships.forEach(function(ship) {
				ship.startReplay();
			});
			
			// hacky way to wait for the replay to finish before entering planning state - replace with a callback
			setTimeout(function () {
				self.waiting(false);
				self.UI.completeReset();
			}, 2000);
			
		});
		
		this.socket.on('game end', function(response) {
		
			//add the stuff in here to a callback array which is called when the timer runs out

			//handle this better so that we can show the last turn
			alert('Game is over');
			console.log("game over");
			console.log(response);
			self.socket.emit('info lobby', {});
			
			self.started = false;
			self.world.removeChildren(1); // removes children from index 1 to the end
			self.ships = [];
			
			$('#gameScreen').hide();
			$('#lobbyListScreen').show();

		});
        
    };
	
    GameVM3.prototype = {
		endGame: function () {
			
			alert('work in progress');
			
		},
		endTurn: function () {
			var self = this;

			if (!this.waiting()) {
				console.log("turn submitted");
				if ($.isEmptyObject(self.clientShip.currentMove)) {
					self.clientShip.currentMove = self.clientShip.position;
				}
				console.log("sent next values as: " + self.clientShip.currentMove.x + ", " + self.clientShip.currentMove.y);
				this.socket.emit('game turn', {
					destination: self.clientShip.currentMove
				});
			}
		},
		undo: function () {
			if (!this.waiting()) {
				this.UI.reset();
				this.clientShip.ghostGraphics.clear();
			}
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
			if (username === this.session.username) {
				this.clientShip = ship;
				this.UI.setClientShip(ship);
			}
			this.ships.push(ship);
			
			return ship;
		},
		_drawAsteroids: function () {
			var pass = false;
			var asteroids = [];  // the array of asteroids
			var asteroid;
			
			for (var j = 0; j < 30; j++) {
				// randomly generates an asteroid x and y with relation to the screen size
				var asteroidX = Math.floor(Math.random() * $(window).width());
				var asteroidY = Math.floor(Math.random() * $(window).height());
				
				if (j === 0) {
					// for the first asteroid place it anywhere
					asteroid = new Asteroid(asteroidX, asteroidY);
					asteroid.draw();
					this.world.addChild(asteroid.graphics);
					asteroids[j] = asteroid;
				} else {	
					// for the following asteroids check whether it passes the check
					while (!pass) {
						asteroidX = Math.floor(Math.random() * $(window).width());
						asteroidY = Math.floor(Math.random() * $(window).height());
						// loop through the asteroids in the array
						for (var k = j-1; k >= 0; k--) {
							// check whether the distance between the generated points is large enough
							if (Helper.dist(new PIXI.Point(asteroidX, asteroidY), new PIXI.Point(asteroids[k].midX, asteroids[k].midY)) > 60 && asteroidX > 30 && asteroidX < $(window).width()-30 && asteroidY > 30 && asteroidY < $(window).height()-30) { //additional checks to make sure that the asteroids fit in the screen, just leave in the original dist check if that doesn't matter
								pass = true;
							} else {
								//break this for loop and start again with another randomly generated x and y
								pass = false;
								break;
							}
						}
					}
					
					// when the check is passed then create an asteroid at that point
					asteroid = new Asteroid(asteroidX, asteroidY);
					asteroid.draw();
					this.world.addChild(asteroid.graphics);
					asteroids[j] = asteroid;
				}
				
				// set check back to not passed
				pass = false;
				
			}
			this.worldObects.asteroids = asteroids;
		}
    };
	
    return GameVM3;
});