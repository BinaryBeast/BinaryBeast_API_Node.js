/**
 * Example BinaryBeast API script
 * 
 * Start brackets (with random seeds);
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
    var tourney_id = result.tourney_id;
    var teams       = result.teams;

    //VERY easy example.. no fancy seeding
    //absolute minimal setup is a tourney_id, but we'll provide a callback too
    bb.tournament.start(tourney_id, function(result) {

        console.log('Tournament started successfully (' + result.api_total_time + ')'
            + ' (new status: ' + result.status + ')');

        //Emit 'complete' to any depedent examples
        module.exports.emit('complete', {
           'tourney_id':            tourney_id,
           'status':                result.status,
           'teams':                 teams
        });
    });
    
    
});