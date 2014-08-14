var World = function(w, h) {
	this.width  = w;
	this.height = h;
}

var WorldGenerator = function() {

}

module.exports = function() {
	return {
		World: World,
		WorldGenerator: WorldGenerator
	}
}
