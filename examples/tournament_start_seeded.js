/**
 * Example BinaryBeast API script
 * 
 * Start brackets (with sports/traditional seeding)
 */

//Include the team_add example so we have a tournament with which to work
var teams           = require('./team_add')
    rounds          = require('./tournament_update_rounds')
    , events        = require('events');


//the last example exported a reference to the API class for us
var bb = teams.bb;


//Allow other examples to add teams without, we'll emit 'complete' when we're done
module.exports      = new events.EventEmitter();
module.exports.bb   = bb;


/**
 *
 * Wait for the team_add example to finish, then we'll start the brackets
 * 
 */
teams.on('complete', function(result) {

    //Check tournament_create.js if you want to see where these values came from
    var tourney_id  = result.tourney_id;
    var teams       = result.teams;
    
    /**
     * First step: rank the teams 
     * 
     * What we need to is create an array of tourney_team_ids in order of rank
     * we'll simply copy teams (see add_teams.js to see how I came up with that)
     * 
     * To make sure we don't get the same ranks every time this example is run, we'll also randomize it
     */
    var ranks = [];
    for(var x in teams) ranks.push(teams[x]);
    ranks.sort(function() {
       return .5 - Math.random() 
    });

    function getTeamName(tourney_team_id) {
        for(var x in teams) {
            if(teams[x] == tourney_team_id) return x;
        }
        return null;
    }

    //Spit out the rank orders
    console.log('Starting the brackets with the following seed ranks:');
    for(var rank in ranks) {
        var tourney_team_id = ranks[rank];
        console.log(getTeamName(tourney_team_id) + ': ' + (parseInt(rank)+1));
    }
    
    //GOGOGO
    bb.tournament.start(tourney_id, bb.SEEDING_SPORTS, ranks, function(result) {

        console.log('Tournament started successfully (' + result.api_total_time + ')'
            + ' (new status: ' + result.status + ')');

        //Emit 'complete' to any depedent examples
        module.exports.emit('complete', {
           'tourney_id':            tourney_id,
           'status':                result.status,
           'teams':                 teams
        });

    }); //Tournament start callback

}); //on tournament created