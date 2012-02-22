/**
 * Example BinaryBeast API script
 * 
 * Report a match
 *  
 */

//Include the team_add example so we have a tournament with which to work
var match           = require('./team_report_match'),
    events          = require('events');


//the last example exported a reference to the API class for us
var bb = match.bb;


//Allow dependent examples to use the results of this example once we're done with this one
module.exports      = new events.EventEmitter();
module.exports.bb   = bb;


/**
 *
 * Wait for the a match to be reported, then report the details
 * 
 */
match.on('complete', function(result) {
    
    //Check tournament_start.js if you want to see where these values came from
    var tourney_id          = result.tourney_id;
    var teams               = result.teams;
    //
    var tourney_team_id     = result.tourney_team_id;
    var o_tourney_team_id   = result.o_tourney_team_id;
    //
    var tourney_match_id    = result.tourney_match_id;

    /**
     * Unfortunately the report_match method does not support game details, so we have to make a second call
     * 
     * The arguments work like this: $winners is an array indexed by game order, it should contain the tourney_team_id of the winner of the overall match
     * so for $winners = array($team_id1, $team_id2, $team_id1) means that the winner of the match won the 1st and 3rd games
     * 
     * $maps too should be an indexed array in order that the games were played
     * ie $maps = array('map 1', 'map 2', 'map3') if a BO3 and all 3games played, first map is map 1, etc
     * 
     * For $scores and $o_scores, they too should be in order of the games played, and they should reflect the score of the winner of the overall match
     * ie $scores = array(1, 1, 1) means the winner of the overall match got a score of 1 for every game
     * ie $o_scores = array(0, 0, 0) where the loser of each game got a score of 0
     */

    //Compile an array indicating the winner of each match
    //So o_tourney_team_id won the first game, then tourney_team_id wins the next 2
    var winners = [o_tourney_team_id, tourney_team_id, tourney_team_id];

    //Even though this is StarCraft 2 and we don't need scores, I'm reporting just so you can see the result
    var scores = [15, 9001, 9];
    //The loser built zealots vs carriers game 2.. so he's l337 * -1
    var o_scores = [3, -1337, 8];

    //Let's define the map each game was played on
    //if you spell it correclty and we happen to have your map, an image will be drawn for it (see the 3rd map)
    var maps = ['First Map', 'Second Map', 'Metalopolis'];

    //Everything is ready, let's make the call
    bb.match.saveDetails(tourney_match_id, winners, scores, o_scores, maps, function(result) {
       
       var url = 'http://binarybeast.com/tourney/load_match/' + tourney_match_id;
       
       console.log('Details saved successfully! (' + url + ') (' + result.api_total_time + ')');

       //Depdent examples
       
    });

}); //Match report complete event