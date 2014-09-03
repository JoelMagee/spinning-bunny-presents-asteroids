define([
	'pixi'
], function (PIXI) {
    'use strict';

    var Helper = {
		getBezier: function (percent,C1,C2,C3) {
			function B1(t) { return (1-t)*(1-t); }
			function B2(t) { return 2*t*(1-t); }
			function B3(t) { return t*t; }
		
			var x = C1.x*B1(percent) + C2.x*B2(percent) + C3.x*B3(percent);
			var y = C1.y*B1(percent) + C2.y*B2(percent) + C3.y*B3(percent);
			return new PIXI.Point(x, y);
		},
		dist: function dist(p1, p2) {
			var xs = 0;
			var ys = 0;

			xs = p2.x - p1.x;
			xs = xs * xs;

			ys = p2.y - p1.y;
			ys = ys * ys;

			return Math.sqrt( xs + ys );
		}
    };

    return Helper;
});