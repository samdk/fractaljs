var ColorMapper, Grid, max, rand, randInt, sierpFuncs, testFuncs1;
Grid = (function() {
  function Grid(width, height, functions) {
    var x, y;
    this.width = width;
    this.height = height;
    this.functions = functions;
    this.x = rand(2) - 1;
    this.y = rand(2) - 1;
    this.color = rand();
    this.grid = (function() {
      var _results;
      _results = [];
      for (x = 0; (0 <= width ? x < width : x > width); (0 <= width ? x += 1 : x -= 1)) {
        _results.push((function() {
          var _results;
          _results = [];
          for (y = 0; (0 <= height ? y < height : y > height); (0 <= height ? y += 1 : y -= 1)) {
            _results.push([0, void 0]);
          }
          return _results;
        })());
      }
      return _results;
    })();
    this.funcColors = (function() {
      var _ref, _results;
      _results = [];
      for (x = 0, _ref = this.functions.length; (0 <= _ref ? x < _ref : x > _ref); (0 <= _ref ? x += 1 : x -= 1)) {
        _results.push(x / (this.functions.length - 1.0001));
      }
      return _results;
    }).call(this);
    this.iterationsDone = 0;
  }
  Grid.prototype.iterate = function(quality) {
    var choice, color, count, iterations, n, oldColor, point, x, xR, y, yR, _ref, _ref2, _ref3, _ref4, _ref5;
    iterations = this.iterationsDone + quality * this.width * this.height;
    _ref = [this.x, this.y, this.color], x = _ref[0], y = _ref[1], color = _ref[2];
    for (n = _ref2 = this.iterationsDone; (_ref2 <= iterations ? n < iterations : n > iterations); (_ref2 <= iterations ? n += 1 : n -= 1)) {
      choice = randInt(this.functions.length);
      _ref3 = this.functions[choice](x, y), x = _ref3[0], y = _ref3[1];
      _ref4 = this.transform(x, y), xR = _ref4[0], yR = _ref4[1];
      if (((0 <= xR && xR < this.width)) && ((0 <= yR && yR < this.height))) {
        color = (color + this.funcColors[choice]) / 2;
        point = this.grid[xR][yR];
        if (n > 20) {
          count = point[0], oldColor = point[1];
          if (count === 0) {
            point[0] = 1;
            point[1] = color;
          } else {
            point[0] += 1;
            point[1] = (color + oldColor) / 2;
          }
        }
      }
    }
    this.iterationsDone = iterations;
    _ref5 = [x, y, color], this.x = _ref5[0], this.y = _ref5[1], this.color = _ref5[2];
    return this;
  };
  Grid.prototype.colorize = function(colorMap) {
    var alpha, color, freq, line, mapped, maxFreq, point, pt, _i, _j, _len, _len2, _ref;
    if (colorMap === void 0) {
      colorMap = new ColorMapper(['blue', 'teal', 'green'], [0, 0, 0, 255]);
    }
    maxFreq = max((function() {
      var _i, _len, _ref, _results;
      _ref = this.grid;
      _results = [];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        line = _ref[_i];
        _results.push(max((function() {
          var _i, _len, _results;
          _results = [];
          for (_i = 0, _len = line.length; _i < _len; _i++) {
            pt = line[_i];
            _results.push(pt[0]);
          }
          return _results;
        })()));
      }
      return _results;
    }).call(this));
    this.colors = [];
    _ref = this.grid;
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      line = _ref[_i];
      for (_j = 0, _len2 = line.length; _j < _len2; _j++) {
        point = line[_j];
        freq = point[0], color = point[1];
        color = Math.floor(color * 100);
        if (freq === 0) {
          this.colors.push(colorMap["default"]);
        } else {
          mapped = colorMap.map[color];
          alpha = 255 * (Math.log(freq) / Math.log(maxFreq));
          this.colors.push([mapped[0], mapped[1], mapped[2], alpha]);
        }
      }
    }
    return this.colors;
  };
  Grid.prototype.draw = function(canvasId, colorMap) {
    var canvas, canvasData, cd, context, i, index, point, _ref, _ref2;
    if (this.colors === void 0) {
      this.colorize(colorMap);
    }
    canvas = document.getElementById(canvasId);
    context = canvas.getContext('2d');
    canvasData = context.createImageData(this.width, this.height);
    cd = canvasData.data;
    for (i = 0, _ref = this.colors.length; (0 <= _ref ? i < _ref : i > _ref); (0 <= _ref ? i += 1 : i -= 1)) {
      point = this.colors[i];
      index = i * 4;
      if (point === void 0) {
        [].splice.apply(cd, [index, index + 4 - index].concat(_ref2 = [255, 255, 255, 255])), _ref2;
      } else {
        [].splice.apply(cd, [index, index + 4 - index].concat(point)), point;
      }
    }
    context.putImageData(canvasData, 0, 0);
    return this;
  };
  Grid.prototype.printCounts = function() {
    var a, b, x, _ref;
    for (x = 0, _ref = this.width; (0 <= _ref ? x < _ref : x > _ref); (0 <= _ref ? x += 1 : x -= 1)) {
      console.log((function() {
        var _i, _len, _ref, _ref2, _results;
        _ref = this.grid[x];
        _results = [];
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          _ref2 = _ref[_i], a = _ref2[0], b = _ref2[1];
          _results.push(a);
        }
        return _results;
      }).call(this));
    }
    return this;
  };
  Grid.prototype.transform = function(x, y) {
    var xR, yR;
    xR = (x + 1) / 2 * this.width;
    yR = (y + 1) / 2 * this.height;
    return [Math.floor(xR), Math.floor(yR)];
  };
  return Grid;
})();
rand = function(range) {
  if (range == null) {
    range = 1;
  }
  return Math.random() * range;
};
randInt = function(range) {
  if (range == null) {
    range = 1;
  }
  return Math.floor(Math.random() * range);
};
max = function(array) {
  var largest, num, _i, _len;
  largest = array[0];
  for (_i = 0, _len = array.length; _i < _len; _i++) {
    num = array[_i];
    if (num > largest) {
      largest = num;
    }
  }
  return largest;
};
sierpFuncs = [
  (function(x, y) {
    return [x / 2, y / 2];
  }), (function(x, y) {
    return [(x + 1) / 2, y / 2];
  }), (function(x, y) {
    return [x / 2, (y + 1) / 2];
  })
];
testFuncs1 = [
  (function(x, y) {
    return [-1 * y, x];
  }), (function(x, y) {
    return [-0.5 * x + 0.5, -0.5 * y + 1];
  })
];
ColorMapper = (function() {
  function ColorMapper(colors, _default) {
    var canvas, context, i, prev, _ref, _ref2;
    this.colors = colors;
    this["default"] = _default != null ? _default : [255, 255, 255, 255];
    $('body').append('<canvas id="colorgen" width="100" height="1"></canvas>');
    $('#colorgen').css({
      position: 'fixed',
      top: '-100px'
    });
    canvas = document.getElementById('colorgen');
    context = canvas.getContext('2d');
    this.gradient = context.createLinearGradient(0, 0, 100, 0);
    for (i = 0, _ref = this.colors.length; (0 <= _ref ? i < _ref : i > _ref); (0 <= _ref ? i += 1 : i -= 1)) {
      this.gradient.addColorStop(i / (this.colors.length - 1), this.colors[i]);
    }
    context.fillStyle = this.gradient;
    context.fillRect(0, 0, 100, 1);
    this.rawData = context.getImageData(0, 0, 100, 1).data;
    this.map = [];
    prev = [];
    for (i = 0, _ref2 = this.rawData.length; (0 <= _ref2 ? i <= _ref2 : i >= _ref2); (0 <= _ref2 ? i += 1 : i -= 1)) {
      if (i % 4 === 0) {
        if (prev.length === 4) {
          this.map.push(prev);
        }
        prev = [this.rawData[i]];
      } else {
        prev.push(this.rawData[i]);
      }
    }
    $('#colorgen').remove();
  }
  ColorMapper.prototype.draw = function(canvasId) {
    var canvas, context, oldFillStyle;
    canvas = document.getElementById(canvasId);
    context = canvas.getContext('2d');
    oldFillStyle = context.fillStyle;
    context.fillStyle = this.gradient;
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.fillStyle = oldFillStyle;
    return this;
  };
  return ColorMapper;
})();