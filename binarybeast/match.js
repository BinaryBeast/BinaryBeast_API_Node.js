/**
 * This module provides the main BinaryBeast node.js module with wrapper methods
 * used for updating / loading match details
 * 
 * @author Brandon Simmons
 * @version 0.1.3
 *
 * @see http://binarybeast.com/api/info
 */




/**
 * Constructor
 * 
 * Argument accepts a reference to the API class, as it does the actual calls
 * This wrapper class only containers a list of service names + arguments
 */
var Match = function(bb) {
	this.bb = bb;
};

/**
 * Properties
 */
Match.prototype = {

	//Reference to the main API Class
	bb: 		null
};

/**
 * bb.match.saveDeatils(tourney_match_id, winners, scores, o_scores, maps [, callback])
 * 
 * Save deatils of a match (individual game scores, maps, etc)
 * 
 * @param tourney_match_id
 * @param winners
 * @param scores
 * @param o_scores
 * @param maps
 * @param callback(result)
 * 
 * return {null}
 */
Match.prototype.saveDetails = function(tourney_match_id, winners, scores, o_scores, maps, callback) {
    
    this.bb.call('Tourney.TourneyMatchGame.ReportBatch', {
        'tourney_match_id':     tourney_match_id,
        'winners':              winners,
        'scores':               scores,
        'o_scores':             o_scores,
        'maps':                 maps
    }, callback);
    
}

/**
 * bb.match.load(tourney_match_id [, callback])
 * 
 * Load details about a match
 * 
 * @param tourney_match_id
 * @param callback(result)
 * 
 * @return {null}
 */
Match.prototype.load = function(tourney_match_id, callback) {
    this.bb.call('Tourney.TourneyLoad.Match', {'tourney_match_id': tourney_match_id}, callback);
}

/**
 * bb.match.stream(tourney_id)
 * 
 * The name is a little bit misleading, this method is a one-time call, but
 * it can be used in conjuction with an interval etc to stream match results
 * 
 * It's labeled as such because it remembers the last match your account
 * received for the given tournament for your api_key
 * 
 * @param tourney_id
 * @param callback(result)
 * 
 * @return {null}
 */
Match.prototype.stream = function(tourney_id, callback) {
    this.bb.call('Tourney.TourneyMatch.Stream', {'tourney_id':tourney_id}, callback)
}

/**
 * bb.match.listOpen(tourney_id, callback)
 *
 * Retrieve a list of currently open matches
 * 
 * @param tourney_id
 * @param callback(result)
 * 
 * @return {null}
 */
Match.prototype.listOpen = function(tourney_id, callback) {
    this.bb.call('Tourney.TourneyLoad.OpenMatches', {'tourney_id':tourney_id}, callback);
};


module.exports = Match;