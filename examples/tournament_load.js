/**
 * Example BinaryBeast API script
 * 
 * How to retrieve information about a tournament
 *  
 */

//Include the team_add example so we have a tournament with which to work
var teams           = require('./team_add'),
    events          = require('events');


//the last example exported a reference to the API class for us
var bb = teams.bb;


//Allow other examples to add teams without, we'll emit 'complete' when we're done
module.exports      = new events.EventEmitter();
module.exports.bb   = bb;


/**
 *
 * Wait for the tournament to be created and teams to be added, then load / display its settings
 * 
 */
teams.on('complete', function(result) {

    //Check tournament_start.js if you want to see where these values came from
    var tourney_id = result.tourney_id;
    var teams       = result.teams;

    bb.tournament.load(tourney_id, function(result) {

        console.log('Info loaded in ' + result.api_total_time);

       for(var key in result.tourney_info) {
           console.log(key + ': ' + result.tourney_info[key]);
       }

       module.exports.emit('complete', {
           'tourney_id':        tourney_id,
           'teams':             teams,
           'tourney_info':      result.tourney_info
       });
       
    });
    
    
}); //On teams added