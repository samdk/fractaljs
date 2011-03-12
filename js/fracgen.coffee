class Grid
	constructor: (@width,@height,@functions) ->
		@x = rand(2)-1
		@y = rand(2)-1
		@color = rand()
		@grid = (([0,undefined] for y in [0...height]) for x in [0...width])
		@funcColors = (x/(@functions.length - 1.0001) for x in [0...@functions.length])
		@iterationsDone = 0
	# quality is the number of iterations per pixel in the image
	iterate: (quality) ->
		iterations = @iterationsDone + quality * @width * @height
		[x,y,color] = [@x,@y,@color]
		for n in [@iterationsDone...iterations]
			choice = randInt(@functions.length)
			[x,y] = @functions[choice](x,y)
			[xR,yR] = this.transform(x,y)
			# if generated point is inside bounds, record it
			if (0 <= xR < @width) and (0 <= yR < @height)
				color = (color + @funcColors[choice])/2
				point = @grid[xR][yR]
				if (n > 20) # we don't draw the first 20 iterations
					[count,oldColor] = point
					if count is 0 # first time we've hit this point
						point[0] = 1
						point[1] = color
					else # we've hit this point before. color becomes average color.
						point[0] += 1
						point[1] = (color+oldColor)/2
					
		@iterationsDone = iterations
		[@x,@y,@color] = [x,y,color]
		this

	colorize: (colorMap) ->
		if colorMap is undefined then colorMap = new ColorMapper(['blue','teal','green'],[0,0,0,255])
		# brightness is logarithmically calculated, so we need to know
		# which point is the brightest
		maxFreq = max(max((pt[0] for pt in line)) for line in @grid)
		@colors = []
		for line in @grid
			for point in line
				[freq,color] = point
				color = Math.floor(color*100)
				if freq is 0
					@colors.push(colorMap.default)
				else
					mapped = colorMap.map[color]
					alpha = 255 * (Math.log(freq) / Math.log(maxFreq))
					@colors.push([mapped[0],mapped[1],mapped[2],alpha])
		@colors

	draw: (canvasId,colorMap) ->
		if @colors is undefined then this.colorize(colorMap)
		canvas = document.getElementById(canvasId)
		context = canvas.getContext('2d')
		canvasData = context.createImageData(@width, @height)
		cd = canvasData.data
		for i in [0...@colors.length]
			point = @colors[i]
			index = i * 4
			if point is undefined
				cd[index...index+4] = [255,255,255,255]
			else
				cd[index...index+4] = point
		context.putImageData(canvasData,0,0)
		this
	printCounts: () ->
		for x in [0...@width]
			console.log((a for [a,b] in @grid[x]))
		this
	transform: (x,y) ->
		# [-1,1) to [0,1) to [0,width/height)
		xR = (x+1)/2 * @width
		yR = (y+1)/2 * @height
		# return the integer floor
		[Math.floor(xR),Math.floor(yR)]

rand = (range=1) ->
	Math.random() * range
# range is non-inclusive. randInt(3) returns results on [0,2].
randInt = (range=1) ->
	Math.floor(Math.random()*range)

max = (array) ->
	largest = array[0]
	for num in array
		if num > largest then largest = num
	largest

sierpFuncs = [((x,y) -> [ x/2,    y/2   ]),
			  ((x,y) -> [(x+1)/2, y/2   ]),
			  ((x,y) -> [ x/2,   (y+1)/2])]
testFuncs1 = [((x,y) -> [ -1*y,x]),
			  ((x,y) -> [-0.5*x+0.5, -0.5*y+1])]

#			#funcs2 = [ (x,y) { return [-1*y,x] },
#			  (x,y) { return [(-0.5*x)+0.5,(-0.5*y)+1] } ]
#			funcs3 = [ (x,y) { return [.7*x - .85*y + .25, .3*x + .66*y - .44] },
#					  (x,y) { return [-.3*x + .7*y - .31, -.67*x + .14*y + .13] } ]


# creates a hidden canvas to generate a gradient
class ColorMapper
	constructor: (@colors,@default=[255,255,255,255]) ->
		$('body').append('<canvas id="colorgen" width="100" height="1"></canvas>')
		$('#colorgen').css({position:'fixed',top:'-100px'})
		canvas = document.getElementById('colorgen')
		context = canvas.getContext('2d')
		@gradient = context.createLinearGradient(0,0,100,0)
		for i in [0...@colors.length]
			@gradient.addColorStop(i/(@colors.length-1),@colors[i])
		context.fillStyle = @gradient
		context.fillRect(0,0,100,1)
		@rawData = context.getImageData(0,0,100,1).data
		@map = []
		prev = []
		for i in [0..@rawData.length]
			if i % 4 is 0
				if prev.length is 4 then @map.push(prev)
				prev = [@rawData[i]]
			else
				prev.push(@rawData[i])
		$('#colorgen').remove()
	draw: (canvasId) ->
		canvas = document.getElementById(canvasId)
		context = canvas.getContext('2d')
		oldFillStyle = context.fillStyle
		context.fillStyle = @gradient
		context.fillRect(0,0,canvas.width,canvas.height)
		context.fillStyle = oldFillStyle
		this

