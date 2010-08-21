$(function() {
	$("#button").live("click",refresh);
}

function refresh() {
	var canvas = document.getElementById('c'),
		ctx = canvas.getContext('2d'),
		canvasData = ctx.createImageData(canvas.width, canvas.height),
		cd = canvasData.data;

	function draw() {
		var x = Math.random()*2-1,
			y = Math.random()*2-1,
			funcs = [ function(x,y) { return [x/2,y/2] },
					  function(x,y) { return [(x+1)/2,y/2] },
					  function(x,y) { return [x/2,(y+1)/2] } ];
		for (var n = 0; n < 100000; n++) {
			var i = Math.floor(Math.random()*funcs.length),
				v = funcs[i](x,y), x = v[0], y = v[1],
				xR = Math.round(x*200), yR = Math.round(y*200),
				idx = (xR + yR*canvas.width) * 4;
			cd[idx] = 0;
			cd[idx+1] = 0;
			cd[idx+2] = 0;
			cd[idx+3] = 255;
		}
		ctx.putImageData(canvasData,0,0);
	}
	draw();
})
