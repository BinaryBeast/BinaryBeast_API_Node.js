/**
 * Example BinaryBeast API script
 * 
 * How to search for a game in our database
 *  
 * This can be an important service to have, as you need to know how we label our game_codes if you want
 * to associate your tournament with a specific game
 */

var bb = require('binarybeast');
bb = new bb('e17d31bfcbedd1c39bcb018c5f0d0fbf.4dcb36f5cc0d74.24632846');

//Search for a list of games with the word 'war' in them
bb.game.search('war', function(result) {

    console.log('');
    console.log('Games searched in ' + result.api_total_time);

    for(var x in result.games) {
        console.log(result.games[x].game, ' (game_code: ', result.games[x].game_code, ')');
    }

    console.log('');
});