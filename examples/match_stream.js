/**
 * Example BinaryBeast API script
 * 
 * Stream match results
 * 
 * It's not truely streaming, we'd have to setup a proper callback for that (coming soon)
 * all it does is ping for new matches that our account hasn't been sent yet (track on binarybeast's end)
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
 * Wait for the tournament to start, then start listening for match results
 * 
 */
tournament.on('complete', function(result) {
    
    //Check tournament_start.js if you want to see where these values came from
    var tourney_id          = result.tourney_id;
    
    console.log('Listening for match results, try reporting directly from the website and checking back');

    //Start listening only after the previous call was successfully
    function initInterval() {
        setInterval(pingMatches, 20000);
    }

    /**
     * Ping the server for match results
     */
    function pingMatches() {
        bb.match.stream(tourney_id, function(result) {

            /**
             * New matches!
             */
            if(result.matches.length > 0) {
                console.log('New matches!');

                for(var x in result.matches) {

                    var display_name     = result.matches[x].winner.display_name;
                    var o_display_name   = result.matches[x].loser.display_name;
                    //
                    var score            = result.matches[x].score;
                    var o_score          = result.matches[x].o_score;
                    //
                    var map              = result.matches[x].games[0].map;

                    //Try logging the entire object, there's a lot more information available
                    //Even the map url and user avatars are included if you have the ability to draw them

                    //Sexy eh?
                    console.log(display_name + ' ' + score + ':' + o_score + ' ' + o_display_name
                        + ' (' + map + ')');
                }
            }

           //Wait 15 seconds, then ping again
           initInterval();
        });
    }

    //Ping Immediately
    pingMatches();
    
}); //Tournament start callback