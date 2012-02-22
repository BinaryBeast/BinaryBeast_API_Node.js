/**
 * Example BinaryBeast API script
 * 
 * Stream match results
 * 
 * It's not truely streaming, we'd have to setup a proper callback for that (coming soon)
 * all it does is ping for new matches that our account hasn't been sent yet (tracked on binarybeast's end)
 *  
 */

//Include the tournament_start example so we have brackets to ping for match results
var tournament      = require('./tournament_start'),
    events          = require('events');


//the last example exported a reference to the API class for us
var bb = tournament.bb;

/**
 *
 * Wait for the tournament to start, then start listening for match results
 * 
 */
tournament.on('complete', function(result) {
    
    //Check tournament_start.js if you want to see where these values came from
    var tourney_id          = result.tourney_id;
    
    console.log('Listening for match results, try reporting directly from the website and checking back');

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
                console.log('');

                for(var x in result.matches) {

                    var display_name     = result.matches[x].winner.display_name;
                    var o_display_name   = result.matches[x].loser.display_name;
                    //
                    var score            = result.matches[x].score;
                    var o_score          = result.matches[x].o_score;

                    //Sexy eh?
                    console.log(display_name + ' ' + score + ':' + o_score + ' ' + o_display_name);
                    console.log('Game details:');

                    /**
                     * Individual game results
                     */
                    for(var y in result.matches[x].games) {

                            var winner, loser,
                                game_score, game_o_score,
                                map = result.matches[x].games[y].map;

                            //Winner of the entire match won this game
                            if(result.matches[x].games[y].tourney_team_id == result.matches[x].winner.tourney_team_id) {
                                winner  = display_name;
                                loser   = o_display_name;
                                game_score = result.matches[x].games[y].score;
                                game_o_score = result.matches[x].games[y].o_score;
                            }
                            //Loser of the entire match won this game
                            else {
                                winner = o_display_name;
                                loser = display_name;
                                game_score = result.matches[x].games[y].o_score;
                                game_o_score = result.matches[x].games[y].score;
                            }

                            console.log(winner + ' ' + game_score + ':' + game_o_score + ' ' + loser
                                + ' (on ' + map + ')');

                    }

                    console.log('------');
                } //Matches loop

            } //If ping returned matches

            //Wait 10 seconds, then ping again
            setTimeout(pingMatches, 10000);

        });//On ping result

    } //function pingMatches
   

    //Ping Immediately
    pingMatches();
    
}); //Tournament start callback
