$(function() {
	triangles = copy(preset1);
	refresh(triangles,10);
	render();
	$('#t1').click(function() {
		if (triangles.length == 2) triangles.pop();
		else if (triangles.length == 3) { triangles.pop(); triangles.pop(); }
	});
	$('#t2').click(function() {
		if (triangles.length == 1) triangles.push([[150,150],[0,75],[75,0]]);
		else if (triangles.length == 3) triangles.pop();
	});
	$('#t3').click(function() {
		if (triangles.length == 1) {
			triangles.push([[150,150],[0,75],[75,0]]);
			triangles.push([[150,150],[75,0],[0,75]]);
		}
		if (triangles.length == 2) triangles.push([[150,150],[0,75],[75,0]]);
	});
	$('#button').click(function(){refresh(triangles,100)});
});

function copy(triangles) {
	tns = [];
	for (var t = 0; t < triangles.length; t++) {
		tns[t] = [];
		for (var p = 0; p < triangles[t].length; p++) {
			tns[t][p] = [triangles[t][p][0],triangles[t][p][1]];
		}
	}
	return tns;
}
/* dragging */
var preset1 = [[[150,150],[0,75],[-75,0]],
			 [[187.5,225],[-37.5,0],[0,-37.5]]];
var triangles = [[[150,150],[0,75],[75,0]]];

function render() {
	var c = $('#c3'),
		cvs = document.getElementById('c3'),
		context = cvs.getContext('2d'),
		colors = [["f00","f88"],["0f0","8f8"],["66f","aaf"]],
		selectedTriangle = null,
		selectedPoint = null,
		canMove = false,
		offset = [0,0],
		x = 0,
		y = 0;
	setInterval(draw,5);
	function draw(pX,pY) {
		context.clearRect(0,0,300,300);
		for (var n = 0; n < 5; n++) {
			if (n == 2) context.fillStyle = '#aaa';
			else context.fillStyle = '#ddd';
			context.fillRect((cvs.width-1) / 4 * n,0,1,cvs.height);
			context.fillRect(0,(cvs.height-1) / 4 * n,cvs.width,1);
		}
		for (var i = 0; i < triangles.length; i++) {
			context.beginPath();
			context.lineWidth = 2;
			context.strokeStyle = '#777';
			context.fillStyle = '#'+colors[i][0];
			var pts = triangles[i];
			context.moveTo(pts[0][0],pts[0][1]);
			context.lineTo(pts[1][0]+pts[0][0],pts[1][1]+pts[0][1]);
			context.lineTo(pts[2][0]+pts[0][0],pts[2][1]+pts[0][1]);
			context.lineTo(pts[0][0],pts[0][1]);
			if (pX && pY && context.isPointInPath(pX,pY)) {
				selectedTriangle = i;
				offset[0] = pX - pts[0][0];
				offset[1] = pY - pts[0][1];
				selectedPoint = null;
			} else if (pX && pY && selectedTriangle === i) selectedTriangle = null;
			if (selectedTriangle === i) {
				context.fillStyle = '#'+colors[i][1];
				context.strokeStyle = '#000';
			}
			context.fill();
			context.stroke();
			context.closePath();
			context.fillStyle = '#000';
			context.beginPath();
			context.arc(pts[1][0]+pts[0][0],pts[1][1]+pts[0][1],3,0,Math.PI*2);
			if (pX && pY && context.isPointInPath(pX,pY)) {
				selectedTriangle = i;
				selectedPoint = 1;
			}
			context.fill();
			context.closePath();
			context.fillStyle = '#00f';
			context.beginPath();
			context.arc(pts[2][0]+pts[0][0],pts[2][1]+pts[0][1],3,0,Math.PI*2);
			if (pX && pY && context.isPointInPath(pX,pY)) {
				selectedTriangle = i;
				selectedPoint = 2;
			}
			context.fill();
			context.closePath();
		}
	}
	c.mousedown(function(e) {
		var pos = c.offset(),
			pX = e.clientX - pos.left,
			pY = e.clientY - pos.top;
		draw(pX,pY);
		if (selectedTriangle !== null) canMove = true;
		c.mousemove(mousemove);
	});
	function mousemove(e) {
		var pos = c.offset(),
			pX = e.clientX - pos.left,
			pY = e.clientY - pos.top;
		if (canMove && selectedTriangle !== null) {
			if (selectedPoint === null) {
				triangles[selectedTriangle][0][0] = pX - offset[0];
				triangles[selectedTriangle][0][1] = pY - offset[1];
			} else {
				triangles[selectedTriangle][selectedPoint][0] = pX-triangles[selectedTriangle][0][0];
				triangles[selectedTriangle][selectedPoint][1] = pY-triangles[selectedTriangle][0][1];
			}
		}
	}
	c.mouseup(function() { canMove = false; refresh(triangles,10); });
	c.mouseleave(function() { canMove = false; refresh(triangles,10); } );
	function leave(e) {
		selectedTriangle = null;
		c.mousemove(null);
	};
}


/* fractal drawing */

function mapping(index,hex) {
	var val = Math.floor(256*index),
		color = [0,0,0];
	if (val < 128) {
		color = [0,255,255-val*2];
	} else {
		color = [0,255-(val-128)*2,255-(255-(val-128)*2)];
	}
	function hexify(val) {
		var hex = Math.floor(val).toString(16);
		if (hex.length === 1) { return '0'+hex } else { return hex }
	}
	if (hex) {
		return '#'+hexify(color[0])+hexify(color[1])+hexify(color[2]);
	} else {
		return [Math.floor(color[0]),Math.floor(color[1]),Math.floor(color[2])];
	}
}
function drawColors() {
	var canvas = document.getElementById('c2'),
		ctx = canvas.getContext('2d');
	for (var i = 0; i < canvas.width; i++) {
		var color = mapping(i/canvas.width,true);
		ctx.fillStyle = color;
		ctx.fillRect(i,0,1,10);
	}
}
function refresh(triangles,quality) {
	var canvas = document.getElementById('c');

	function renderFractal(triangles,quality) {
		// get canvas stuff for ease of reference later
		var canvas = document.getElementById('c'),
			ctx = canvas.getContext('2d'),
			canvasData = ctx.createImageData(canvas.width, canvas.height),
			cd = canvasData.data,
			width = canvas.width, height = canvas.height;
		// start out at a random x and y coord, and with a random color (from 0 to 1)
		var x = Math.random()*2-1,
			y = Math.random()*2-1,
			c = Math.random(),
			// the 'starting' color for each function
			fColors = [0,0.5,0.99],
			// the grid of points. we don't draw onto the canvas directly because we draw
			// colors based on the frequency a point is hit.
			grid = [];
		
		// extracts the functions from the triangles
		// (I apologize to anyone attemping to read this. it's disgusting.)
		function func(x,y,t) {
			function scale(n) {	return (n) / 75; }
			return [scale(t[0][0]-150) + scale(t[1][0])*x + scale(t[2][0])*y,
					scale(t[0][1]-150) + scale(t[1][1])*x + scale(t[2][1])*y];
		};

		// sets up the grid
		for (var xR = 0; xR < width; xR++) {
			grid[xR] = [];
			for (var yR = 0; yR < height; yR++) {
				grid[xR][yR] = [0,null] // freq, color
			}
		}

		// does the actual data generation for the fractal
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
		// finds the max frequency in the grid so that we can scale the colors based on it
		var freqMax = -1;
		for (var x = 0; x < grid.length; x++) {
			for (var y = 0; y < grid[x].length; y++) {
				if (grid[x][y][0] > freqMax) freqMax = grid[x][y][0];
			}
		}
		// calculates the correct color density based on the frequency, and draws
		// the fractal
		for (var x = 0; x < canvas.width; x++) {
			for (var y = 0; y < canvas.height; y++) {
				var pt = grid[x][y],
					freq = pt[0];
				if (freq > 0) {
					var idx = (x + y*canvas.width) * 4,
						color = mapping(pt[1]);
					if (pt[0] >= 0) {
						cd[idx] = color[0];
						cd[idx+1] = color[1];
						cd[idx+2] = color[2];
						cd[idx+3] = 255 * (Math.log(freq) / Math.log(freqMax));
					}
				}
			}
		}
		ctx.putImageData(canvasData,0,0);
	}
	
	renderFractal(triangles,quality);
	drawColors();
	return false;
}
