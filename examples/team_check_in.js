/**
 * Example BinaryBeast API script
 * 
 * How to confirm team positions before starting the tournament
 * 
 * only teams that have status => 1 (aka confirmed) are included in the brackets
 * 
 * Note: If you call team_insert without defining a status, the team will automatically be confirmed
 */

//Include the create_tournament example so we have a tournament with which to work
var tournament      = require('./tournament_create'),
    events        = require('events');
    

//the last example exported a reference to the API class for us
var bb = tournament.bb;


//Allow dependent examples to use the results of this example once we're done with this one
module.exports      = new events.EventEmitter();
module.exports.bb   = bb;


/**
 *
 * Wait for the tournament_create example to finish, then we'll start adding teams
 * 
 */
tournament.on('complete', function(result) {

    //Check tournament_create.js if you want to see where these values came from
    var tourney_id = result.tourney_id;


    /**
     * First step, create a team that is NOT automatically confirmed
     */
    bb.team.insert(tourney_id, 'Confirmation player', {
       'status':        0,          //Status 0 means he is NOT confirmed 
       'country_code':  'NOR'       //From norway
    }, function(result) {

        var tourney_team_id = result.tourney_team_id;

        console.log('Confirmation player added successfully (' + tourney_team_id + ')'
            + ' (' + result.api_total_time + ')');

        //Now let's confirm him
        //silly to do it immediately afterwards, but this is just to show you how you would do it
        bb.team.confirm(result.tourney_team_id, function(result) {

            console.log('Confirmation player confirmed successfully'
                + ' (' + result.api_total_time + ')');
            
            //if any other examples which to use this file, let them know we're finished
            module.exports.emit('complete', {
                'tourney_id':           tourney_id,
                'tourney_team_id':      tourney_team_id
            });

        }); //Player confirmed callback

    }); //Player added callback

}); //Tourney created event