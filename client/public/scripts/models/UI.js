define([
	'pixi',
	'models/Helper'
], function (PIXI, Helper) {
    'use strict';

    var UI = function UI(world) {
		
		this.movementLine = new PIXI.Graphics();
		this.fireDot = new PIXI.Graphics();
		this.fireLine = new PIXI.Graphics();

		this.moveSelect = true;
		this.firePositionSelect = false;
		this.fireDirectionSelect = false;
		
		this.dragging = false;
		
		this.movementPosition = {};
		this.firePoint = {};
		this.fireDestination = {};
		this.possibleFireDestination = {};
		
		this.moveSet = false;
		this.firePointSet = false;
		this.fireDestinationSet = false;
		
		this.fireDestinationLineTo = this.possibleFireDestination;
		
		this.clientShip = {};
		this.world = world;
		
		this.prev = {'x': 0, 'y': 0};
		
    };
	
    UI.prototype = {
		drag: function (data) {
			if (this.dragging) {
									
					var changeX = data.global.x-this.prev.x;
					var changeY = data.global.y-this.prev.y;
					
					this.world.x += changeX;
					this.world.pannedAmountX += changeX;
					this.world.y += changeY;
					this.world.pannedAmountY += changeY;
					
					this.prev.x = data.global.x;
					this.prev.y = data.global.y;
					
					/* 
						Add a check in here somewhere that means that
						the world can only be panned a certain distance
						based on pannedAmountX and pannedAmountY
					*/
					
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
		drawFirePoint: function () {
			Helper.bezierHelper.setBezier(this.clientShip.position.x, this.clientShip.position.y, this.clientShip.prediction.x, this.clientShip.prediction.y, this.clientShip.currentMove.x, this.clientShip.currentMove.y);
			var nearestPoint = Helper.bezierHelper.findNearestPoint(this.firePoint.x, this.firePoint.y);
			
			this.fireDot.clear();
			this.fireDot.beginFill(0xFF0000);
			this.fireDot.drawCircle(nearestPoint.pos.x, nearestPoint.pos.y, 4/this.world.scale.x);
			this.fireDot.endFill();
		},
		drawFireLine: function () {
			this.fireLine.clear();
			this.fireLine.lineStyle(2/this.world.scale.x, 0x000000, 1);
			this.fireLine.moveTo(this.clientShip.firePoint.x, this.clientShip.firePoint.y);
			this.fireLine.lineTo(this.fireDestinationLineTo.x, this.fireDestinationLineTo.y);
		},
		setMove: function () {
				
			this.clientShip.drawGhost(this.movementPosition.x, this.movementPosition.y);
			this.clientShip.setCurrentMove(this.movementPosition.x, this.movementPosition.y);
			
			this.moveSet = true;
				
			return true;
		},
		setFirePoint: function () {
		
			Helper.bezierHelper.setBezier(this.clientShip.position.x, this.clientShip.position.y, this.clientShip.prediction.x, this.clientShip.prediction.y, this.clientShip.currentMove.x, this.clientShip.currentMove.y);
			var nearestPoint = Helper.bezierHelper.findNearestPoint(this.firePoint.x, this.firePoint.y);
			console.log("t point is: " + nearestPoint.t);
			console.log("nearest point is " + nearestPoint.pos.x + ", " + nearestPoint.pos.y);
			
			this.clientShip.t = nearestPoint.t;
			this.clientShip.firePoint = nearestPoint.pos;
			
			this.firePointSet = true;
		
			return true;
		},
		setFireDestination: function () {
		
			this.fireDestinationLineTo = this.fireDestination;
		
			this.fireDestination.x = this.possibleFireDestination.x;
			this.fireDestination.y = this.possibleFireDestination.y;
		
			var angle = Math.atan2(this.clientShip.firePoint.y-this.fireDestination.y, this.clientShip.firePoint.x-this.fireDestination.x)+Math.PI; // Add PI so that it goes from 0 to 2PI rather than -PI to PI
			console.log("angle from t point in radians is " + angle);
			this.clientShip.angle = angle;
			
			this.clientShip.drawBullet(); // remove soon, just used for testing
			
			this.fireDestinationSet = true;
			
			return true;
		},
		setClientShip: function (ship) {
			this.clientShip = ship;
		},
		startDrag: function (data) {
			this.dragging = true;
			this.prev.x = data.global.x;
			this.prev.y = data.global.y;
		},
		stopDrag: function () {
			this.dragging = false;
		}
    };

    return UI;
});