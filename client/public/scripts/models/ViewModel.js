define([
    'knockout',
    'jquery',
	'pixi',
    'models/Ship'	
], function (ko, $, PIXI, Ship) {
    'use strict';
    
	
	
    var ViewModel = function ViewModel() {
        this.players = ko.observableArray();
		// this.chat = new Chat(this);
		
		// this.test();
		
		this.playerId = ko.observable();
		this.playerName = ko.observable();
		this.playerTitle = ko.observable();
        
        // this._loadData();
    };
	
    ViewModel.prototype = {
        // _loadData: function () {
			// var self = this;
            // $.ajax({
				// url: '/ladder/rest/players',
				// success: function (data) {
					// for(var i = 0; i<data.length; i++) {
						// var player = new Player(data[i].id, data[i].name, data[i].position);
						// self.players.push(player);
					// }
				// }
			// });
        // },		
		// createPlayer: function () {
			// var self = this;
			// var player = new Player(self.playerId(), self.playerName(), self.players().length+1, self.playerTitle());
			// console.log(JSON.stringify(player));
			// console.log(self.players().length);
			// $.ajax({
				// url: '/ladder/rest/player/' + self.playerId(),
				// data: JSON.stringify(player),
				// type: "PUT",
				// contentType: "application/json",
				// success: function () {
					// self.players.push(player);
					// self.playerId("");
					// self.playerName("");
					// self.playerTitle("");
				// }
			// });
		
		// },
		test: function() {
			
			// $('body').css("margin",0);
			// $('body').css("padding",0);
		
			var SCREEN_WIDTH = $(document).width();
			var SCREEN_HEIGHT = $(document).height();
			console.log($(document).width());
			console.log($(document).height());

			// create an new instance of a pixi stage
			var stage = new PIXI.Stage(0x66FF99);

			// create a renderer instance.
			var renderer = PIXI.autoDetectRenderer(SCREEN_WIDTH, SCREEN_HEIGHT);

			// add the renderer view element to the DOM
			document.body.appendChild(renderer.view);

			requestAnimFrame( animate );

			// create a texture from an image path
			var texture = PIXI.Texture.fromImage("images/bunny.png");
			// create a new Sprite using the texture
			var bunny = new PIXI.Sprite(texture);

			// center the sprites anchor point
			bunny.anchor.x = 0.5;
			bunny.anchor.y = 0.5;

			// move the sprite to the center of the screen
			bunny.position.x = SCREEN_WIDTH/2;
			bunny.position.y = SCREEN_HEIGHT/2;

			stage.addChild(bunny);
			
			var yellowShip = new Ship(400, 400, 40, 0xFFFF00);
			yellowShip.draw();
			console.log(yellowShip);
			
			var blueShip = new Ship(430, 460, 40, 0x0000FF);
			blueShip.draw();
			console.log(blueShip);
			
			
			// blueShip.graphics.rotation += 1*Math.PI;
			
			stage.mousedown = function() {
				blueShip.rotateToPoint(stage.getMousePosition().x, stage.getMousePosition().y);
				blueShip.destroy();				
			};			
			
			
			
			var graphics = new PIXI.Graphics();
			graphics.lineStyle(1, 0x000000, 1);
				graphics.moveTo(430-20, 460-20);
				graphics.lineTo(430-20, 460+20);
				graphics.lineTo(430+20, 460+20);
				graphics.lineTo(430+20, 460-20);
				graphics.lineTo(430-20, 460-20);
				stage.addChild(graphics);
			 
			// add it the stage so we see it on our screens..
			stage.addChild(yellowShip.graphics);
			stage.addChild(blueShip.graphics);
			
			
			
			

			function animate() {

				requestAnimFrame( animate );

				// just for fun, lets rotate mr rabbit a little
				bunny.rotation += 0.1;
				
				yellowShip.graphics.clear();
				yellowShip.midX += 10;
				yellowShip.draw();
				
				// blueShip.graphics.clear();
				// blueShip.draw();
				
				
				
				
				// graphics.moveTo(0,0);
				// graphics.lineTo(400, 100);
				//graphics.lineTo(stage.getMousePosition().x, stage.getMousePosition().y);
				//graphics.moveTo(0,0);
				//graphics.bezierCurveTo(100, 200, 100, 200, stage.getMousePosition().x, stage.getMousePosition().y);
				
				
				// render the stage   
				renderer.render(stage);
			}
			
		}
		
    };
	
	
  
    return ViewModel;
});