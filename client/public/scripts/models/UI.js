define([
	'pixi',
	'models/Helper'
], function (PIXI, Helper) {
    'use strict';

    var UI = function UI(world) {
		
		this.movementLine = new PIXI.Graphics();
		this.fireDot = new PIXI.Graphics();
		this.fireLine = new PIXI.Graphics();
		
		this.drawingUI = true;		
		
		this.moveSelect = true;
		this.firePositionSelect = false;
		this.fireDirectionSelect = false;
		
		this.waiting = false;
		
		this.movementPosition = {};
		this.firePoint = {};
		this.fireDestination = {};
		this.possibleFireDestination = {};
		
		this.fireDestinationLineTo = this.possibleFireDestination;
		
		this.clientShip = undefined;
		this.world = world;
		
    };
	
    UI.prototype = {
		draw: function (clientShip, world) {	
			
			if (this.drawingUI) {
						
				if (this.movementPosition) {
					this.movementLine.clear();
					this.movementLine.lineStyle(2/world.scale.x, 0x000000, 1);
					this.movementLine.moveTo(clientShip.position.x, clientShip.position.y);
					this.movementLine.quadraticCurveTo(clientShip.prediction.x, clientShip.prediction.y, this.movementPosition.x, this.movementPosition.y);
					
					this.movementLine.drawCircle(clientShip.prediction.x, clientShip.prediction.y, 1/world.scale.x);
				}
				
				if (this.firePoint) {
					Helper.bezierHelper.setBezier(clientShip.position.x, clientShip.position.y, clientShip.prediction.x, clientShip.prediction.y, clientShip.currentMove.x, clientShip.currentMove.y);
					var nearestPoint = Helper.bezierHelper.findNearestPoint(this.firePoint.x, this.firePoint.y);
					
					this.fireDot.clear();
					this.fireDot.beginFill(0xFF0000);
					this.fireDot.drawCircle(nearestPoint.pos.x, nearestPoint.pos.y, 4/world.scale.x);
					this.fireDot.endFill();
				}

				if (this.fireDestination) {
					this.fireLine.clear();
					this.fireLine.lineStyle(2/world.scale.x, 0x000000, 1);
					this.fireLine.moveTo(clientShip.firePoint.x, clientShip.firePoint.y);
					this.fireLine.lineTo(this.fireDestination.x, this.fireDestination.y);
				}
				
			} else {
				this.reset();
			}
						
		},
		clearMovementLine: function () {
			this.movementLine.clear();
		},
		clearFirePoint: function () {
			this.fireDot.clear();
		},
		clearFireLine: function () {
			this.fireLine.clear();
		},
		drawMovementLine: function () {
			this.movementLine.clear();
			this.movementLine.lineStyle(2/this.world.scale.x, 0x000000, 1);
			this.movementLine.moveTo(this.clientShip.position.x, this.clientShip.position.y);
			this.movementLine.quadraticCurveTo(this.clientShip.prediction.x, this.clientShip.prediction.y, this.movementPosition.x, this.movementPosition.y);
			
			this.movementLine.drawCircle(this.clientShip.prediction.x, this.clientShip.prediction.y, 1/this.world.scale.x);
		},
		drawFirePoint: function (clientShip, world) {
			this.fireDot.clear();
			if (this.firePoint.x) {
				Helper.bezierHelper.setBezier(this.clientShip.position.x, this.clientShip.position.y, this.clientShip.prediction.x, this.clientShip.prediction.y, this.clientShip.currentMove.x, this.clientShip.currentMove.y);
				var nearestPoint = Helper.bezierHelper.findNearestPoint(this.firePoint.x, this.firePoint.y);
				
				this.fireDot.clear();
				this.fireDot.beginFill(0xFF0000);
				this.fireDot.drawCircle(nearestPoint.pos.x, nearestPoint.pos.y, 4/this.world.scale.x);
				this.fireDot.endFill();
			}
		},
		drawFireLine: function () {
			this.fireLine.clear();
			if (this.clientShip.firePoint) {
				this.fireLine.clear();
				this.fireLine.lineStyle(2/this.world.scale.x, 0x000000, 1);
				this.fireLine.moveTo(this.clientShip.firePoint.x, this.clientShip.firePoint.y);
				this.fireLine.lineTo(this.fireDestinationLineTo.x, this.fireDestinationLineTo.y);
			}
		},
		setMove: function () {
				
			this.clientShip.drawGhost(this.movementPosition.x, this.movementPosition.y);
			this.clientShip.setCurrentMove(this.movementPosition.x, this.movementPosition.y);
				
			return true;
		},
		setFirePoint: function () {
		
			Helper.bezierHelper.setBezier(this.clientShip.position.x, this.clientShip.position.y, this.clientShip.prediction.x, this.clientShip.prediction.y, this.clientShip.currentMove.x, this.clientShip.currentMove.y);
			var nearestPoint = Helper.bezierHelper.findNearestPoint(this.firePoint.x, this.firePoint.y);
			console.log("t point is: " + nearestPoint.t);
			console.log("nearest point is " + nearestPoint.pos.x + ", " + nearestPoint.pos.y);
			
			this.clientShip.firePoint = nearestPoint.pos;
		
			return true;
		},
		setFireDestination: function () {
		
			this.fireDestinationLineTo = this.fireDestination;
		
			this.fireDestination.x = this.possibleFireDestination.x;
			this.fireDestination.y = this.possibleFireDestination.y;
		
			var angle = Math.atan2(this.firePoint.y-this.fireDestination.y, this.firePoint.x-this.fireDestination.x);
			console.log("angle from t point in radians is " + angle);
			
			return true;
		},
		setClientShip: function (ship) {
			this.clientShip = ship;
		},
		startDrag: function () {
			
		},
		stopDrag: function () {
			
		},
		update: function (mouse) {
		
			var mousePos = {'x': mouse.x(), 'y': mouse.y()};
			
			if (this.moveSelect) {
				if (this.waiting) {
					this.movementPosition = null;
					this.movementLine.clear();
				} else {
					this.movementPosition = mousePos;
				} 
			} else if (this.firePositionSelect) {
				if (this.waiting) {
					this.firePoint = null;
					this.fireDot.clear();
				} else {
					this.firePoint = mousePos;
					}
			} else if (this.fireDirectionSelect) {
				if (this.waiting) {
					this.fireDestination = null;
					this.fireLine.clear();
				} else {
					this.fireDestination = mousePos;
				}
			}
			
		},
		mouseClick: function (clientShip) {
		
			if (this.moveSelect) {
			
				this.moveSelect = false;
				
				clientShip.drawGhost(this.movementPosition.x, this.movementPosition.y);

				clientShip.setCurrentMove(this.movementPosition.x, this.movementPosition.y);
				
				this.firePositionSelect = true;
			
			} else if (this.firePositionSelect) {
				this.firePositionSelect = false;
				Helper.bezierHelper.setBezier(clientShip.position.x, clientShip.position.y, clientShip.prediction.x, clientShip.prediction.y, clientShip.currentMove.x, clientShip.currentMove.y);
				var nearestPoint = Helper.bezierHelper.findNearestPoint(this.firePoint.x, this.firePoint.y);
				console.log("t point is: " + nearestPoint.t);
				console.log("nearest point is " + nearestPoint.pos.x + ", " + nearestPoint.pos.y);
				
				clientShip.firePoint = nearestPoint.pos;
				this.fireDirectionSelect = true;
			} else if (this.fireDirectionSelect) {
				this.fireDirectionSelect = false;
				var angle = Math.atan2(this.firePoint.y-this.fireDestination.y, this.firePoint.x-this.fireDestination.x);
				console.log("angle from t point in radians is " + angle);
			}
		
		},
		reset: function () {
			this.movementLine.clear();
			this.fireDot.clear();
			this.fireLine.clear();
			
			this.moveSelect = true;
			this.firePositionSelect = false;
			this.fireDirectionSelect = false;
			
			this.movementPosition = null;
			this.firePoint = null;
			this.fireDestination = null;
		},
		completeReset: function () {
			this.reset();
			this.drawingUI = true;
			this.waiting = false;
		},
		createMouse: function(world, stage) {
		
			var mouseX = function () { return (stage.getMousePosition().x-world.pannedAmountX)/world.scaledAmount; };
			var mouseY = function () { return (stage.getMousePosition().y-world.pannedAmountY)/world.scaledAmount; };
		
			return {"x": mouseX, "y": mouseY};
		}
    };

    return UI;
});