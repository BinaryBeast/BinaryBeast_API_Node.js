/**
 * Example BinaryBeast API script
 * 
 * Report a match
 *  
 */

//Include the team_add example so we have a tournament with which to work
var tournament      = require('./tournament_start'),
    events          = require('events');


//the last example exported a reference to the API class for us
var bb = tournament.bb;


//Allow other examples to add teams without, we'll emit 'complete' when we're done
module.exports      = new events.EventEmitter();
module.exports.bb   = bb;


/**
 *
 * Wait for the tournament to start, find a match to report
 * 
 */
tournament.on('complete', function(result) {

    //Check tournament_start.js if you want to see where these values came from
    var tourney_id = result.tourney_id;
    var teams       = result.teams;

    //Remember a match to report 
    var tourney_team_id;
    var o_tourney_team_id;
    //
    var display_name;
    var o_display_name;

    /**
     * First Step: find a match
     * 
     * To kill two birds: I'm goign to use a service that returns a list of open matches, and we'll just grab one of those
     */
    bb.match.listOpen(tourney_id, function(result) {

        console.log('Open Matches: (' + result.api_total_time + ')');
        for(var x in result.matches) {

            //Who cares which match we end up with.. just save them to the global vars
            tourney_team_id = result.matches[x].team.tourney_team_id;
            display_name    = result.matches[x].team.display_name;
            //
            o_tourney_team_id = result.matches[x].opponent.tourney_team_id;
            o_display_name    = result.matches[x].opponent.display_name;

            console.log(display_name + '(' + tourney_team_id + ')'
                + ' vs '
                + o_display_name + '(' + o_tourney_team_id + ')');
        }

        /**
         * Now that we have a match to report, let's report it
         * 
         * We're not saving any details, we will save that for another example
         * 
         * Simply going to advance the player
         * 
         * Note: tourney_team_id = winner
         */
        bb.team.reportWin(tourney_id, tourney_team_id, o_tourney_team_id, function(result) {

            console.log(display_name + ' reported successfully against ' + o_display_name
                + ' (' + result.api_total_time + ')');

            //Now we can emit the complete event
            module.exports.emit('complete', {
               'tourney_id':            tourney_id,
               'teams':                 teams,
               'tourney_team_id':       tourney_team_id,
               'o_tourney_team_id':     o_tourney_team_id,
               'tourney_match_id':      result.tourney_match_id
            });

        }); //reportWin callback

    }); //getOpenMatches callback

}); //Tournament created event