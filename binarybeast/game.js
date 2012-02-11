/**
 * This module provides the main BinaryBeast node.js module with wrapper methods
 * used for searching through our list of games
 *
 * this is important since you need to know our game_code for each game if you want
 * to use them in your tournaments
 *
 * @author Brandon Simmons
 * @version 0.1.0
 *
 * @see http://binarybeast.com/api/info
 */




/**
 * Constructor
 * 
 * Argument accepts a reference to the API class, as it does the actual calls
 * This wrapper class only containers a list of service names + arguments
 */
var Game = function(bb) {
	this.bb = bb;
};

/**
 * Properties
 */
Game.prototype = {

	//Reference to the main API Class
	bb: 		null
};

/**
 * bb.game.search(filter, callback)
 *
 * Search through our list of games
 *
 * @param filter
 * @param callback(result)
 *
 * @return {null}
 */
Game.prototype.search = function(filter, callback) {
	this.bb.call('Game.GameSearch.Search', {game:filter}, callback);
};

/**
 * bb.game.listTop([limit, callback])
 * 
 * Lists our currently most popular games
 *
 * @param limit
 * @param callback(result)
 *
 * @return {null}
 */
Game.prototype.listTop = function(limit, callback) {
	if(typeof limit == 'function') {
		callback = limit;
		limit = 30;
	}
	//This seems silly really.. if they don't give us a limit, OR a callback, they can't do anything with
	//the results anyway.. meh w/e, who cares
	else if(typeof limit == 'undefined') limit = 30;

	this.bb.call('Game.GameSearch.Top',{'limit':limit}, callback);
}

module.exports = Game;
