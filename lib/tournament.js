/**
 * Constructor
 * 
 * Argument accepts a reference to the API class, as it does the actual calls
 * This wrapper class only containers a list of service names + arguments
 */
var tournament = function(bb) {
	this.bb = bb;
}
/**
 * Properties
 */
tournament.prototype = {

	//Reference to the main API Class
	bb: 		null
};


/**
 * Wrapper method for creating a tournament
 *
 * @param options	Array of options, see http://wiki.binarybeast.com/index.php?title=Tourney.TourneyCreate.Create
 * @param callback	What to do with the result (expect 1 argument, a data object)
 *
 * @return null
 */
tournament.create = function(options, callback) {

	//Extend default settings with whatever the user gives us
	options = bb.extend({
		title: 		'Node API Test',
		type_id:	bb.TOURNEY_TYPE_BRACKETS,
		elimination:	bb.ELIMINATION_SINGLE
	}, options);

	bb.call('Tourney.TourneyCreate.Create', options, callback);
}
/**
 * Delete a tournament
 * @param tourney_id
 * @param callback(result)
 */
tournament.delete = function(tourney_id, callback) {
	bb.call('Tourney.TourneyDelete.Delete', {'tourney_id':tourney_id}, callback);
}
/**
 * Update tournament settings
 * @param tourney_id
 * @param options
 * @param callback(result)
 */
tournament.update = function(tourney_id, options, callback) {
	options = bb.extend(options, {'tourney_id':tourney_id};
	bb.call('Tourney.TourneyDelete.Delete', options, callback);
}


module.exports = tournament;
