define([
	'pixi',
	'models/Helper'
], function (PIXI, Helper) {
    'use strict';

    var UI = function UI() {
		
		this.movementLine = new PIXI.Graphics();
		this.fireDot = new PIXI.Graphics();
		this.fireLine = new PIXI.Graphics();
		
		this.drawingUI = true;		
		
		this.moveSelect = true;
		this.firePositionSelect = false;
		this.fireDirectionSelect = false;
		
		this.movementPosition = undefined;
		this.firePoint = undefined;
		this.fireDestination = undefined;
		
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
		update: function (mouse) {
			
			if (this.moveSelect) {
				this.movementPosition = {'x': mouse.x(), 'y': mouse.y()};
			} else {
				this.movementPosition = this.movementPosition;
				
				if (this.firePositionSelect) {
					this.firePoint = {'x': mouse.x(), 'y': mouse.y()};
				} else {
					this.firePoint = this.firePoint;
				
					if (this.fireDirectionSelect) {
						this.fireDestination = {'x': mouse.x(), 'y': mouse.y()};
					} else {
						this.fireDestination = this.fireDestination;
					}
				}		
			}
			
		},
		mouseClick: function (mouse, clientShip) {
		
			if (this.moveSelect) {
			
					this.moveSelect = false;
					
					this.movementPosition = {'x': mouse.x(), 'y': mouse.y()};
					
					clientShip.drawGhost(this.movementPosition.x, this.movementPosition.y);

					clientShip.setCurrentMove(this.movementPosition.x, this.movementPosition.y);
					
					this.firePositionSelect = true;
				
				} else if (this.firePositionSelect) {
					this.firePositionSelect = false;
					Helper.bezierHelper.setBezier(clientShip.position.x, clientShip.position.y, clientShip.prediction.x, clientShip.prediction.y, clientShip.currentMove.x, clientShip.currentMove.y);
					var nearestPoint = Helper.bezierHelper.findNearestPoint(mouse.x(), mouse.y());
					console.log("t point is: " + nearestPoint.t);
					console.log("nearest point is " + nearestPoint.pos.x + ", " + nearestPoint.pos.y);
					
					clientShip.firePoint = nearestPoint.pos;
					this.fireDirectionSelect = true;
				} else if (this.fireDirectionSelect) {
					this.fireDirectionSelect = false;
					this.fireDestination = {'x': mouse.x(), 'y': mouse.y()};
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
		}
		createMouse: function(world, stage) {
		
			var mouseX = function () { return (stage.getMousePosition().x-world.pannedAmountX)/world.scaledAmount; };
			var mouseY = function () { return (stage.getMousePosition().y-world.pannedAmountY)/world.scaledAmount; };
		
			return {"x": mouseX, "y": mouseY};
		}
    };

    return UI;
});