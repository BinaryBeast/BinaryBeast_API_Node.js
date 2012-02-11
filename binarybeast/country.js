/**
 * This module provides the main BinaryBeast node.js module with wrapper methods
 * used for searching through our list of countries
 *
 * This makes a nice addition to the API, as you can use it to make sure you use
 * the correct country_code for your players when inserting them (bb.team.insert(tour_id, {'country_code':'NOR'}))
 * 	for example, for your norwegian friends heh
 *
 * @author Brandon Simmons
 * @version 0.01
 *
 * @see http://binarybeast.com/api/info
 */




/**
 * Constructor
 * 
 * Argument accepts a reference to the API class, as it does the actual calls
 * This wrapper class only containers a list of service names + arguments
 */
var country = function(bb) {
	this.bb = bb;
};

/**
 * Properties
 */
country.prototype = {

	//Reference to the main API Class
	country: 		null
};

/**
 * bb.country.search(filter, callback)
 * 
 * Search through our list of ISO[23] country codes
 * 
 * @param filter
 * @param callback(result)
 *
 * @return {null}
 */
country.prototype.search = function(filter, callback) {
	this.bb.call('Country.CountrySearch.Search', {country:filter}, callback);
};


modules.export = country;
