var bb = require('./lib/index')('e17d31bfcbedd1c39bcb018c5f0d0fbf.4dcb36f5cc0d74.24632846');
var util = require('util');

var handler = function() {
    util.log('api response: ' + util.inspect(arguments));
};


var tour = new bb.tournament('x13081612');
tour.load(handler, bb);
