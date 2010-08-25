$(function() {
	$("#button").live("click",refresh);
	render();
});


/* dragging */

function render() {
	var c = $('#c3'),
		cvs = document.getElementById('c3'),
		context = cvs.getContext('2d'),
		triangles = [[[10,10],[50,0],[0,50]],
					 [[40,40],[30,20],[40,70]],
					 [[100,100],[50,50],[50,0]],
					 [[150,10],[10,50],[50,0]],
					 [[10,150],[50,0],[0,60]]],
		colors = [["f00","f88"],["0f0","8f8"],["66f","aaf"],["ff0","ff8"],["0ff","8ff"]],
		selectedTriangle = null,
		selectedPoint = null,
		canMove = false,
		offset = [0,0],
		x = 0,
		y = 0;
	setInterval(draw,5);
	function draw(pX,pY) {
		context.clearRect(0,0,300,300);
		context.fillStyle = "#ccc";
		for (var n = 0; n < 5; n++) {
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
			context.beginPath();
			context.arc(pts[2][0]+pts[0][0],pts[2][1]+pts[0][1],3,0,Math.PI*2);
			if (pX && pY && context.isPointInPath(pX,pY)) {
				selectedTriangle = i;
				selectedPoint = 2;
			}
			context.fill();
			context.closePath();
			//if (pX && pY )
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
	c.mouseup(function() { canMove = false });
	c.mouseleave(function() { canMove = false } );
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

function refresh() {
	var canvas = document.getElementById('c'),
		ctx = canvas.getContext('2d'),
		canvasData = ctx.createImageData(canvas.width, canvas.height),
		cd = canvasData.data;

	function r(x,y) {
		return Math.sqrt(Math.pow(x,2)+Math.pow(y,2));
	}
	function theta(x,y) {
		return Math.atan(x/y);
	}
	function phi(x,y) {
		return Math.atan(y/x);
	}

	function draw() {
		var x = Math.random()*2-1,
			y = Math.random()*2-1,
			c = Math.random(),
			sierpFuncs = [ function(x,y) { return [x/2,y/2] },
					  function(x,y) { return [(x+1)/2,y/2] },
					  function(x,y) { return [x/2,(y+1)/2] }]
			funcs2 = [ function(x,y) { return [-0.83*y,0.83*x] },
					  function(x,y) { return [(-0.5*x)+0.5,(-0.5*y)+1] } ]
			funcs = [ function(x,y) { return [.7*x - .85*y + .25, .3*x + .66*y - .44] },
					  function(x,y) { return [-.3*x + .7*y - .31, -.67*x + .14*y + .13] } ]
			fColors = [0,0.5,0.99],
			grid = [],
			quality = 2;

		for (var xR = 0; xR < canvas.width; xR++) {
			grid[xR] = [];
			for (var yR = 0; yR < canvas.height; yR++) {
				grid[xR][yR] = [0,null] // freq, color
			}
		}

		for (var n = 0; n < canvas.width * canvas.height * quality; n++) {
			var i = Math.floor(Math.random()*funcs.length),
				v = funcs[i](x,y), x = v[0], y = v[1],
				xR = Math.floor((x+1)/2*200)+100,
				yR = Math.floor((y+1)/2*200)+100;
			if (xR > 0 && xR < canvas.width && yR > 0 && yR < canvas.height) { 
				var	c = (c+fColors[i])/2,
					pta = grid[xR],
					pt = pta[yR];
				if (n > 20) {
					if (pt[0] === 0) { pt[0] = 1; pt[1] = c}
					else { pt[0] += 1; pt[1] = (pt[1]+c)/2 }
				}
			}
		}
		var freqMax = -1;
		for (var x = 0; x < grid.length; x++) {
			for (var y = 0; y < grid[x].length; y++) {
				if (grid[x][y][0] > freqMax) freqMax = grid[x][y][0];
			}
		}
		for (var x = 0; x < canvas.width; x++) {
			for (var y = 0; y < canvas.height; y++) {
				var pt = grid[x][y],
					freq = pt[0];
				if (freq > 0) {
					var idx = (x + y*canvas.width) * 4,
						color = mapping(pt[1]);
					if (n > 20 && pt[0] >= 0) {
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
	draw();
	drawColors();
	return false;
}
