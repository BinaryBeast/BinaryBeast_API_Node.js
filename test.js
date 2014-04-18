var bb = new (require('./lib/index'))('e17d31bfcbedd1c39bcb018c5f0d0fbf.4dcb36f5cc0d74.24632846');
var
    _       = require('underscore'),
    util    = require('util'),
    utils   = require('./lib/core/utils');

//Setup the cache handler
/*bb.cache.set_engine('redis', {
    db: 1
});
*/
bb.cache.set_engine('couchdb', {
    db: 'bb_api_node_cache'
});

var handle_tour = function(tournament, error) {
    if(!tournament) {
        utils.error('Error loading tournament', error);
        return;
    }

    utils.log('tournament load', _.pick(tournament, [
        'name', 'id', 'status',
        'type', 'elimination',
        'game',
        'teams_confirmed_count',
        'group_count', 'group_mode'
    ]));

    tournament.participants(handle_participants);

};
var handle_participants = function(participants, error) {
    if(!participants) {
        utils.error('Error loading participants', error);
        return;
    }

    utils.log('Successfully loaded ' + participants.length + ' participants');
    _.each(participants, function(participant) {

        utils.log('tournament load', _.pick(participant, [
            'name', 'id', 'status',
            'country', 'country_flag',
            'group',
            'race_id', 'race', 'race_icon',
            'match_wins', 'match_losses'
        ]));

    });
};


var tournament = new bb.tournament('xHotS1404181');

utils.log('loading xHotS1404181');
tournament.load(handle_tour);