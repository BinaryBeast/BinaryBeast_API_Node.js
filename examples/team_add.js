/**
 * Example BinaryBeast API script
 * 
 * Adding players / teams
 */

//Include the create_tournament example so we have a tournament with which to work
var tournament      = require('./tournament_create'),
    events          = require('events');
    

//the last example exported a reference to the API class for us
var bb = tournament.bb;


//Allow other examples to add teams without, we'll emit 'complete' when we're done
module.exports      = new events.EventEmitter();
module.exports.bb   = bb;



//An array of teams, keys = display_name, values = tourney_team_id
var teams = {'Team_1': 0, 'Team_2': 0, 'Team_0b11': 0, 'Team_03': 0, 'Team_0x4': 0};

/* Keep track of teams inserted so we can emit 'complete' for the next example 
 * after all teams are inserted
 */
var inserted = 0;
var teamsCount = 5; //Object.keys(teams).length;

/**
 * I'm doing a small trick here...
 * 
 * Let's say we may want to add the ability to re-sync our local data with binarybeast's.. download each tournament and team from our account
 * 
 * Well, we'll lose local user associations with any teams right?
 * Let's hack $notes to store our local user id, so we if resync, we can json_decode the team notes and figure out which local user it belongs to
 * 
 * obviously this is done outside the loop so it's not really unique to a specific team, this is purely academic
 * 
 * Note: tournaments have a special column just for this very purpse, it's called 'hidden'
 */
var notes = JSON.stringify({user_id: 'Over 9,000!'});


/**
 *
 * Wait for the tournament_create example to finish, then we'll start adding teams
 * 
 */
tournament.on('complete', function(result) {

    //Check tournament_create.js if you want to see where these values came from
    var tourney_id = result.tourney_id;


    /**
     * Loop through our teams array an start adding them
     * 
     * Wrapped in a function so each callback has the correct display_name key
     */
    for(var display_name in teams) addTeam(display_name);
    function addTeam(display_name) {

        bb.team.insert(tourney_id, display_name, {
            country_code:   'NOR',      //From norway
            status:         1,          //Auto-confirm
            'notes':        notes
        },
        function(result) {

            console.info('Player ' + display_name + ' inserted successfully!'
                + ' (id: ' + result.tourney_team_id + ')'
                + ' (' + result.api_total_time + ')'
            );

            //Remember this team's tourney_team_id
            teams[display_name] = result.tourney_team_id;

            //Is this the last team? emit a 'complete' event so
            //any examples that use this file can move on
            inserted++;
            if(inserted >= teamsCount) module.exports.emit('complete', {
                'tourney_id':   tourney_id,
                'teams':        teams
            });

        }); //Team callback

    } //Teams loop

}); //Tourney created event