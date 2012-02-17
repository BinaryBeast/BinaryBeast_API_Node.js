/**
 * Example BinaryBeast API script
 * 
 * How to update Round Format
 * 
 * This includes Best Of, Maps, and Dates
 *  
 */

//Include the create_tournament example so we have a tournament with which to work
var tournament      = require('./tournament_create'),
    events        = require('events');
    

//the last example exported a reference to the API class for us
var bb = tournament.bb;


//Allow other examples to add teams without, we'll emit 'complete' when we're done
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
     * Now that we have a tournament.. let's update the round format
     * This means which maps are played, the BO, and Dates
     * 
     * 
     * There are 2 ways to do this
     * 
     * First: update a single round within a bracket
     * Second: batch update all rounds within a single bracket 
     */
    
    /**
     * First method: update a single round
     * 
     * round 1 => BO3 Starting on Shakuras Plateau
     * round 2 => BO3 Starting on Metalopolis
     * round 3 => BO5 Starting on Xel'Naga Caverns
     */
    bb.tournament.roundUpdate(tourney_id, bb.BRACKET_WINNERS, 0, 3, 'Shakuras Plateau');
    bb.tournament.roundUpdate(tourney_id, bb.BRACKET_WINNERS, 1, 3, 'Metalopolis');
    bb.tournament.roundUpdate(tourney_id, bb.BRACKET_WINNERS, 2, 5, "Xel'Naga Caverns");


    /**
    * Second example: batch update a single bracket
    * 
    * 
    * First, we compile the data into integer indexed arrays, in order of round
    * 
    * We can do a single call and update an entire bracket by passing arrays for each value
    */
   
    //round 1: best of 1
    //round 2: best of 3, etc
    var best_ofs = [1, 3, 3, 5];
    
    //round 1: starts on Tal'Darim Altar
    //round 2: starts on The Shattered Temple, etc
    var maps     = ["Tal'Darim Altar", 'The Shattered Temple', "Xel'Naga Caverns", 'Metalopolis'];

    //Dates are just strings, there is no strict format
    var dates    = ['Today', 'Tomorrow', 'canceled!'];
    
    //Note that we use the BinaryBeast::BRACKET_LOSERS constant to identify which bracket to update
    bb.tournament.roundUpdateBatch(tourney_id, bb.BRACKET_LOSERS, best_ofs, maps, dates);

    //let's go ahead and update the finals format, we can just use a single round update
    //Notice that it automatically corrects your invalid BO6 to BO7, as a BO series MUST NOT be evently divisible by 2
    bb.tournament.roundUpdate(tourney_id, bb.BRACKET_FINALS, 0, 6, 'Metalopolis');

    //Since I didn't bother with callbacks, we can just immediately emmit a 'complete''
    module.exports.emit('complete', {
        'tourney_id':       tourney_id
    });

}); //Tourney created event