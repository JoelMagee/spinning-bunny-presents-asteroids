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
		},
		bezierHelper: (function() {

			// a value we consider "small enough" to equal it to zero:
			// (this is used for double solutions in 2nd or 3d degree equation)
			var zeroMax = 0.0000001;
			
			var p0;			// handle 0 of curve
			var p1;			// handle 1 of curve
			var p2;			// handle 2 of curve
			
			// bounds data
			var xMin;
			var xMax;
			var yMin;
			var yMax;
			
			// data for position+tangent
			var pos;			// generic position on curve
			var tan;			// tangent
			var nor;			// normal
			
			// PERSONAL note: for conversion quadratic=>cubic, put 2 handles at 2/3 of p0p1 and p2p1

			// data for nearest:
			var A;				// an util vector (= p1-p0)
			var B;				// an util vector (= p2-p1-A)
			var solution;		// solution of 3d degree equation
			var nearest;			// data about nearest point
			var posMin;			// nearest position on curve
			
			
			// defines a Quadratic Bezier Curve with p0 = (x0, y0), p1 = (x1, y1), p2 = (x2, y2)
			// p0 and p2 are anchor points.
			// p1 is control point.
			function setBezier(x0,y0,x1,y1,x2,y2)
			{
				p0 = {'x': 0,'y': 0};
				p1 = {'x': 0,'y': 0};
				p2 = {'x': 0,'y': 0};
			
				pos = {'x': 0,'y': 0};
				tan = {'x': 0,'y': 0};
				nor = {'x': 0,'y': 0};
				
				A = {'x': 0,'y': 0};
				B = {'x': 0,'y': 0};
				solution = {};
				nearest = {};
				posMin = {'x': 0,'y': 0};
				
				update(x0, y0, x1, y1, x2, y2);
			}
			
			// should be called after any anchor or control point is moved.
			function update(x0, y0, x1, y1, x2, y2)
			{
				p0.x = x0;
				p0.y = y0;
				p1.x = x1;
				p1.y = y1;
				p2.x = x2;
				p2.y = y2;
				
				// precompute A and B, which will be very useful next.
				A.x = p1.x - p0.x;
				A.y = p1.y - p0.y;
				B.x = p0.x - 2 * p1.x + p2.x;
				B.y = p0.y - 2 * p1.y + p2.y;
				
				// rough evaluation of bounds:
				xMin = Math.min(x0, Math.min(x1, x2));
				xMax = Math.max(x0, Math.max(x1, x2));
				yMin = Math.min(y0, Math.min(y1, y2));
				yMax = Math.max(y0, Math.max(y1, y2));
				
				// more accurate evaluation:
				// see Andree Michelle for a faster but less readable method 
				var u;
				if (xMin == x1 || xMax == x1) 
				{
					u = -A.x / B.x; // u where getTan(u).x == 0
					u = (1 - u) * (1 - u) * p0.x + 2 * u * (1 - u) * p1.x + u * u * p2.x;
					if (xMin == x1) xMin = u;
					else xMax = u;
				}
				if (yMin == y1 || yMax == y1) 
				{
					u = -A.y / B.y; // u where getTan(u).y == 0
					u = (1 - u) * (1 - u) * p0.y + 2 * u * (1 - u) * p1.y + u * u * p2.y;
					if (yMin == y1) yMin = u;
					else yMax = u;
				}
			}
			
			// returns { t:Number, pos:Point, dist:Number, nor:Point }
			// (costs about 80 multiplications+additions)
			function findNearestPoint(x, y)
			{
				// a temporary util vect = p0 - (x,y)
				pos.x = p0.x - x;
				pos.y = p0.y - y;
				// search points P of bezier curve with PM.(dP / dt) = 0
				// a calculus leads to a 3d degree equation :
				var a = B.x * B.x + B.y * B.y;
				var b = 3 * (A.x * B.x + A.y * B.y);
				var c = 2 * (A.x * A.x + A.y * A.y) + pos.x * B.x + pos.y * B.y;
				var d = pos.x * A.x + pos.y * A.y;
				var sol = thirdDegreeEquation(a, b, c, d);
				
				var t;
				var dist;
				var tMin;
				var distMin = Number.MAX_VALUE;
				var d0 = getDist(x, y, p0.x, p0.y);
				var d2 = getDist(x, y, p2.x, p2.y);
				var orientedDist;
				
				if (sol !== null)
				{
					// find the closest point:
					for (var i = 1; i <= sol.count; i++)
					{
						t = sol["s" + i];
						if (t >= 0 && t <= 1)
						{
							pos = getPos(t);
							dist = getDist(x, y, pos.x, pos.y);
							if (dist < distMin)
							{
								// minimum found!
								tMin = t;
								distMin = dist;
								posMin.x = pos.x;
								posMin.y = pos.y;
							}
						}
					}
					if (tMin !== null && distMin < d0 && distMin < d2) 
					{
						// the closest point is on the curve
						nor.x = A.y + tMin * B.y;
						nor.y = -(A.x + tMin * B.x);
						nor = getNor(1);
						orientedDist = distMin;
						if ((x - posMin.x) * nor.x + (y - posMin.y) * nor.y < 0) 
						{
							nor.x *= -1;
							nor.y *= -1;
							orientedDist *= -1;
						}
						
						nearest.t = tMin;
						nearest.pos = posMin;
						nearest.nor = nor;
						nearest.dist = distMin;
						nearest.orientedDist = orientedDist;
						nearest.onCurve = true;
						return nearest;
					}
					
				} 
				// the closest point is one of the 2 end points
				if (d0 < d2) 
				{
					distMin = d0;
					tMin = 0;
					posMin.x = p0.x;
					posMin.y = p0.y;	
				} else 
				{
					distMin = d2;
					tMin = 1;
					posMin.x = p2.x;
					posMin.y = p2.y;
				}
				nor.x = x - posMin.x;
				nor.y = y - posMin.y;
				nor = getNor(1);
				
				nearest.t = tMin;
				nearest.pos = posMin;
				nearest.nor = nor;
				nearest.orientedDist = nearest.dist = distMin;
				nearest.onCurve = false;
				return nearest;
			}
			
			
			
			function getPos(t)
			{
				var a = (1 - t) * (1 - t);
				var b = 2 * t * (1 - t);
				var c = t * t;
				pos.x = a * p0.x + b * p1.x + c * p2.x;
				pos.y = a * p0.y + b * p1.y + c * p2.y;
				return pos;
			}
			
			function getNor(t)
			{
				nor.x = A.y + t * B.y;
				nor.y = -(A.x + t * B.x);
				// normalize:
				var lNorm = Math.sqrt(nor.x * nor.x + nor.y * nor.y);
				if (lNorm > 0)
				{
					nor.x /= lNorm;
					nor.y /= lNorm;
				}
				return nor;
			}
			
			// a local duplicate & optimized version of com.gludion.utils.MathUtils.thirdDegreeEquation(a,b,c,d):Object
			//WARNING: s2, s3 may be non - null if count = 1.
			// use only result["s"+i] where i <= count
			function thirdDegreeEquation(
										a,
										b,
										c,
										d
										)	// returns a {count:Number, s1:Number, s2:Number, s3:Number} object
			{
				if (Math.abs(a) > zeroMax)
				{
					// let's adopt form: x3 + ax2 + bx + d = 0
					var z = a; // multi-purpose util variable
					a = b / z;
					b = c / z;
					c = d / z;
					// we solve using Cardan formula: http://fr.wikipedia.org/wiki/M%C3%A9thode_de_Cardan
					var p = b - a * a / 3;
					var q = a * (2 * a * a - 9 * b) / 27 + c;
					var p3 = p * p * p;
					var D = q * q + 4 * p3 / 27;
					var offset = -a / 3;
					if (D > zeroMax)
					{
						// D positive
						z = Math.sqrt(D);
						var u = ( -q + z) / 2;
						var v = ( -q - z) / 2;
						u = (u >= 0)? Math.pow(u, 1 / 3) : -Math.pow( -u, 1 / 3);
						v = (v >= 0)? Math.pow(v, 1 / 3) : -Math.pow( -v, 1 / 3);
						solution.s1 = u + v + offset;
						solution.count = 1;
						return solution;
					} else if (D < -zeroMax)
					{
						// D negative
						var u = 2 * Math.sqrt( -p / 3);
						var v = Math.acos( -Math.sqrt( -27 / p3) * q / 2) / 3;
						solution.s1 = u * Math.cos(v) + offset;
						solution.s2 = u * Math.cos(v + 2 * Math.PI / 3) + offset;
						solution.s3 = u * Math.cos(v + 4 * Math.PI / 3) + offset;
						solution.count = 3;
						return solution;
					} else
					{
						// D zero
						var u;
						if (q < 0) u = Math.pow( -q / 2, 1 / 3);
						else u = -Math.pow( q / 2, 1 / 3);
						solution.s1 = 2*u + offset;
						solution.s2 = -u + offset;
						solution.count = 2;
						return solution;
					}
				} else
				{
					// a = 0, then actually a 2nd degree equation:
					// form : ax2 + bx + c = 0;
					a = b;
					b = c;
					c = d;
					if (Math.abs(a) <= zeroMax)
					{
						if (Math.abs(b) <= zeroMax) return null;
						else 
						{
							solution.s1 = -c / b;
							solution.count = 1;
							return solution;
						}
					}
					var D = b*b - 4*a*c;
					if (D <= - zeroMax) return null;
					if (D > zeroMax)
					{
						// D positive
						D = Math.sqrt(D);
						solution.s1 = ( -b - D) / (2 * a);
						solution.s2 = ( -b + D) / (2 * a);
						solution.count = 2;
						return solution;
					} else if (D < - zeroMax)
					{
						// D negative
						return null;
					} else 
					{
						// D zero
						solution.s1 = -b / (2 * a);
						solution.count = 1;
						return solution;
					}
				}
			}
			
			function getDist(x1, y1, x2, y2)
			{
				return Math.sqrt((x1 - x2) * (x1 - x2) + (y1 - y2) * (y1 - y2));
			}
			
			return {
				setBezier: setBezier,
				update: update,
				// hitTest: hitTest,
				findNearestPoint: findNearestPoint,
				getPos: getPos,
				// getSpeed: getSpeed,
				getNor: getNor
			};
		})()
    };

    return Helper;
});