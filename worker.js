onmessage = function(e) {
	var triangles = e.data[0],
		quality = e.data[1],
		width = e.data[2],
		height = e.data[3];
	var results = renderFractal(triangles,quality,width,height);
	postMessage(results);
}

function renderFractal(triangles,quality,width,height) {
	var x = Math.random()*2-1,
		y = Math.random()*2-1,
		c = Math.random(),
		sierpFuncs = [ function(x,y) { return [x/2,y/2] },
				  function(x,y) { return [(x+1)/2,y/2] },
				  function(x,y) { return [x/2,(y+1)/2] }]
		funcs2 = [ function(x,y) { return [-1*y,x] },
				  function(x,y) { return [(-0.5*x)+0.5,(-0.5*y)+1] } ]
		funcs3 = [ function(x,y) { return [.7*x - .85*y + .25, .3*x + .66*y - .44] },
				  function(x,y) { return [-.3*x + .7*y - .31, -.67*x + .14*y + .13] } ],
		fColors = [0,0.5,0.99],
		grid = [];
		
	function func(x,y,t) {
		function scale(n) {	return (n) / 75; }
		return [scale(t[0][0]-150) + scale(t[1][0])*x + scale(t[2][0])*y,
				scale(t[0][1]-150) + scale(t[1][1])*x + scale(t[2][1])*y];
	};

	for (var xR = 0; xR < width; xR++) {
		grid[xR] = [];
		for (var yR = 0; yR < height; yR++) {
			grid[xR][yR] = [0,null] // freq, color
		}
	}

	for (var n = 0; n < width * height * quality; n++) {
		var i = Math.floor(Math.random()*triangles.length),
			v = func(x,y,triangles[i]), x = v[0], y = v[1],
			xR = Math.floor((x+1)/2*130)+10,
			yR = Math.floor((y+1)/2*130)+10;
		if (xR > 0 && xR < width && yR > 0 && yR < height) { 
			var	c = (c+fColors[i])/2,
				pta = grid[xR],
				pt = pta[yR];
			if (n > 20) {
				if (pt[0] === 0) { pt[0] = 1; pt[1] = c}
				else { pt[0] += 1; pt[1] = (pt[1]+c)/2 }
			}
		}
	}
	return grid;
}

