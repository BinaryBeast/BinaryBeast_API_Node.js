/**
 * Example BinaryBeast API script
 * 
 * Create a new tournament
 */

var bb              = require('binarybeast'),
    events          = require('events');

bb = new bb('e17d31bfcbedd1c39bcb018c5f0d0fbf.4dcb36f5cc0d74.24632846');

//Allow dependent examples to use the results of this example once we're done with this one
module.exports      = new events.EventEmitter();
module.exports.bb   = bb;

/**
 * Create the tournament!
 *
 * Only one argument, an associative array of options 
 * 
 * here are the available options:
 *   string title
 *   string description
 *   bool   public
 *   string game_code            	SC2: StarCraft 2, BW: StarCraft BroodWar, QL: Quake Live ... you can search through our games using $bb->game_search('filter'))
 *   int    type_id              	(0 = elimination brackets, 1 = group rounds to elimination brackets, also the BinaryBeast.php class has constants to help with this)
 *   int    elimination          	(1 = single, 2 = double
 *   int    max_teams
 *   int    team_mode            	(id est 1 = 1v1, 2 = 2v2)
 *   int    group_count
 *   int    teams_from_group
 *   date   date_start             YYYY-MM-DD HH:SS
 *   string location               Simple description of where players should meet to play their matches, or where the event takes place
 *   array  teams                  You may automatically add players, with a simple indexed array of player names
 *   int    return_data          	(0 = TourneyID and URL only, 1 = List of team id's inserted (from teams array), 2 = team id's and full tourney info dump)
 */
bb.tournament.create({
    title:        'Node.js (' + bb.VERSION + ') API Test',

    //Double elimination, brackets only
    elimination:    bb.ELIMINATION_DOUBLE,
    type_id:        bb.TOURNEY_TYPE_BRACKETS,

    description:	'Testing the new BB API Node.js Modules package!',
    location:       'V8 LULZ',
    team_mode:      1,
    max_teams:      8,

    //StarCraft 2
    'game_code':    'SC2'

}, function(result) {

    //Emit a 'complete' event in case other examples want to use this tournament
    module.exports.emit('complete', {
        'tourney_id':   result.tourney_id,
        'url':          result.url,
        'result':       result
    });

});

module.exports.on('complete', function(result) {
    console.log('Tournament created in ' + result.result.api_total_time + ' (' + result.result.url + ')');
});