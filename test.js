var bb = new (require('./lib/index'))('e17d31bfcbedd1c39bcb018c5f0d0fbf.4dcb36f5cc0d74.24632846');
var
    util = require('util');
    utils = require('./lib/core/utils');

//Setup the cache handler
/*bb.cache.set_engine('redis', {
    db: 1
});
*/
bb.cache.set_engine('couchdb', {
    db: 'bb_api_node_cache'
});

var handler = function() {
    util.log('api response: ' + util.inspect(arguments));
};


var tournament = new bb.tournament('xUSFIV1404040');
tournament.load(handler, bb);


module.exports = tournament;