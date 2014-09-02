var calcBez = function(p0, p1, p2) {
	return function(t) {
		return {
			x: (1 - t) * (1 - t) * p0.x + 2 * (1 - t) * t * p1.x + (t * t * p2.x),
			y: (1 - t) * (1 - t) * p0.y + 2 * (1 - t) * t * p1.y + (t * t * p2.y)
		}; 
	};
};

var calcBezDist = function(p0, p1, p2, q0, q1, q2) {
	var b1 = calcBez(p0, p1, p2);
	var b2 = calcBez(q0, q1, q2);

	return function(t) {
		var b1s = b1(t);
		var b2s = b2(t);

		return {
			x: b1s.x - b2s.x,
			y: b1s.y - b2s.y
		}
	}
}

var calcBexDerv = function(p0, p1, p2) {
	return function(t) {
		return {
			x: 2 * (1 - t) * (p1.x - p0.x) + 2 * t * (p2.x - p1.x),
			y: 2 * (1 - t) * (p1.y - p0.y) + 2 * t * (p2.y - p1.y)
		};
	};
};

var calcDistanceDot = function(p0, p1, p2, q0, q1, q2) {
	var bezDist = calcBezDist(p0, p1, p2, q0, q1, q2);
	var bezDerv = calcBexDerv(p0, p1, p2);


	return function(t) {
		var bezDist_ = bezDist(t);
		var bezDerv_ = bezDerv(t);	

		return bezDist_.x * bezDerv_.x + bezDist_.y * bezDerv_.y;
	}
}


var p0 = {
	x: 100,
	y: 100
}
var p1 = {
	x: 200,
	y: 400
}
var p2 = {
	x: 300,
	y: 100
}
var q0 = {
	x: 100,
	y: 300
}
var q1 = {
	x: 200,
	y: 0
}
var q2 = {
	x: 300,
	y: 300
}

var dotFinder = calcDistanceDot(p0, p1, p2, q0, q1, q2);

var prevNeg = dotFinder(t) > 0;
var currNeg = dotFinder(t) > 0;

for (var i = 0; i <= 1; i += 0.00001) {

	var t = i;

	var dist = dotFinder(t);

	//console.log("t: " + t + ", dist: " + dist);

	currNeg = dist > 0;

	if ((Math.abs(dist) < 1) || (currNeg && !prevNeg)) {
		console.log(calcBez(p0, p1, p2)(t).x + " - " + calcBez(p0, p1, p2)(t).y);
		break;
	}

	prevNeg = currNeg;

}