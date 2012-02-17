/**
 * Example BinaryBeast API script
 * 
 * How to determine a team's current opponent
 *  
 */

//Include the team_add example so we have a tournament with which to work
var tournament      = require('./tournament_start'),
    events        = require('events');


//the last example exported a reference to the API class for us
var bb = tournament.bb;


//Allow other examples to add teams without, we'll emit 'complete' when we're done
module.exports      = new events.EventEmitter();
module.exports.bb   = bb;


/**
 *
 * Wait for the tournament to start, then determine each team's opponent
 * 
 */
tournament.on('complete', function(result) {

    //Check tournament_start.js if you want to see where these values came from
    var tourney_id = result.tourney_id;
    var teams       = result.teams;

    //Only emit 'complete' for the first match we find
    var emitted = false;

    //Used to lookup an opponent's display_name
    function getTeamName(tourney_team_id) {
        for(var display_name in teams) {
            if(teams[display_name] == tourney_team_id) return display_name;
        }
        return null;
    }

    /**
     * Loop through each team
     * 
     * The first team we come across that has an opponent, we'll emit
     * 'complete' (probably for the report_win example)
     * 
     * Wrapped in a function so each loop has the correct display_name key
     */
    for(var display_name in teams) getOpponent(display_name);
    function getOpponent(display_name) {

        //Teams is initailized in team_add.js, which is called from tournament_start.js
        //it's an array of tourney_team_ids keyed by display_name
        var tourney_team_id = teams[display_name];

        bb.team.getOpponent(tourney_team_id, function(result) {

            /**
             * Team has an opponent
             */
            if(result.o_tourney_team_id > 0) {

                console.log(display_name + "'s opponent: "
                    + getTeamName(result.o_tourney_team_id)
                    + ' (' + result.api_total_time + ')');

                //At this point we can emit (if not done so already)
                //the deatils of the match so any depdent examples can do something with it
                if(!emitted) {
                    module.exports.emit('complete', {
                        'tourney_id':           tourney_id,
                        'teams':                teams,
                        'tourney_team_id':      tourney_team_id,
                        'o_tourney_team_id':    result.o_tourney_team_id
                    });

                    emitted = true;
                }

            }

            /**
             * Team has no opponent yet
             */
            else if(result.o_tourney_team_id === 0) {
                console.log(display_name + " is currently waiting on a match to finish, he currently has no opponent"
                    + ' (' + result.api_total_time + ')');
            }

            /**
             * This team has been eliminated
             * 
             * In this example, this is impossible
             * however it's a good idea to demonstrate how you would know anyway
             */
            else if(result.o_tourney_team_id == -1) {

                //Determine who defeated him, based on result.victor
                var winner = result.victor.display_name;

                console.log(display_name + " was defeated by: "
                    + winner
                    + ' (' + result.api_total_time + ')');

            }

        }); //Get opponent callback
        
    } //Teams loop
    
});