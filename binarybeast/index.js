/**
 * BinaryBeast API written for Node.js
 *
 * @author Brandon Simmons
 *
 * You can find documentation on the API itself at http://binarybeast.com/api/info 
 *
 * Feel free to send any questions/suggestions to contact@binarybeast.com
 * 
 * I apologize in advance if I ignored any node.js conventions / best practices
 * this is my first node.js project, help / feedback would be appreciated
 * 
 * @version 0.1.0
 */




//Modules containing wrapper methods and other depdencies
var 	tournament	= require('./tournament'),
	team		= require('./team'),
	game		= require('./game'),
	country		= require('./country'),
	https		= require('https');
//	querystring	= require('querystring'); //ended up writing my own... querystring goofs up if you try to feed it anything nested


/**
 * BinaryBeast constructor
 */
var BinaryBeast = function(api_key) {

	this.api_key = api_key;

	//Instantiate the content-specific service wrapper modules
	this.tournament = new tournament(this);	
	this.team	= new team(this);
	this.game	= new game(this);
	this.country	= new country(this);
}
/**
 * Properties
 */
BinaryBeast.prototype = {

	//ghetto 'constants', sorry.. I'm a java / php developer, I'm used to having constants available
	VERSION: 			'0.0.1',
	//
	BRACKET_GROUPS:			0,
	BRACKET_WINNERS:		1,
	BRACKET_LOSERS:			2,
	BRACKET_FINALS:			3,
	BRACKET_BRONZE:			4,
	//
	ELIMINATION_SINGLE:		1,
	ELIMINATION_DOUBLE:		2,
	//
	TOURNEY_TYPE_BRACKETS:		0,
	TOURNEY_TYPE_CUP:		1,
	//
	SEEDING_RANDOM: 		'random',
	SEEDING_SPORTS: 		'sports',
	SEEDING_BALANCED: 		'balanced',
	SEEDING_MANUAL:			'manual',

	//Store the api key
	api_key: 		null,

	//Service wrapper modules
	tournament: 		null,
	team: 			null,
	country:		null,
	game:			null

};

/**
 * Make a service call
 * 
 * @param svc               A Service name (ie 'Tourney.TourneyCreate.Create')
 * @param args              An associate array of arguments ie {'Title': 'My Node API Test!'}
 * @param callback(result)
 *
 * @return {null}
 */
BinaryBeast.prototype.call = function(svc, args, callback) {

	//Add a few things to the query, then compile it into a query string using querystring
	args = this.extend(args, {
		api_use_underscores:		1,
		api_key:			this.api_key,
		api_service:			svc
	});
	//var query = querystring.stringify(args);
	var query = this.buildQuery(args);

	//Compile the request information
        var options = {
                host:   'binarybeast.com',
                port:   443,
                path:   '/api',
                method: 'POST',
		headers: {
			'Content-Type': 	'application/x-www-form-urlencoded',
			'Content-Length':	query.length,
			'User-Agent':		'BinaryBeast API Node.js v' + this.VERSION
		}
        };

	//Setup the request
	var request = https.request(options, function(response) {
		response.setEncoding('utf8');

                //Concatenate the chunks as we receive them.. until we recieve the 'end' event
		var body = '';
		response.on('data', function(chunk) {
			body += chunk;
		});
		response.on('end', function() {
			//Success!! Invoke the callback if it's actually a valid function
			if(typeof callback == 'function') {
				callback(JSON.parse(body));
			}
		});
	});

	//OH NOES
	request.on('error', function(error) {
		//Send an error to the callback, granted that it's a valid function
		if(typeof callback == 'function') {
			callback({result: 500, error: error.message});
		}
	});

	//gogogo
	request.write(query);
	request.end();
}

/**
 * I'm spoiled by jquery's .extend, so we're duplicating it here
 * used by the service wrapper modules to allow users to submit options arrays, and retain simple default values
 * 
 * In this method, obj2 gets priority - any duplicate values will result in the value from obj2
 */
BinaryBeast.prototype.extend = function(obj1, obj2) {

	if(typeof obj1 != 'object') obj1 = [obj1];
	if(typeof obj2 != 'object') obj2 = [obj2];

	for(var x in obj2) obj1[x] = obj2[x];
	return obj1;
}

/**
 * BinaryBeast.buildQuery(obj args)
 *
 * Unfortunately, the querystring module I tried does not seem to support "stringifying" nested objects/arrays
 * so I'm writing my own query parser
 *
 * @return {string}
 */
BinaryBeast.prototype.buildQuery = function(args) {

	var out = '';

	for(var x in args) {
		if(typeof args[x] == 'object') {
			for(var y in args[x]) {
				out += (out == '' ? '' : '&') +  x + '[' + y + ']=' + getValue(args[x][y]);
			}
		}
		else out += (out == '' ? '' : '&') + x + '=' + getValue(args[x]);
	}

	/**
	 * Very simply returns the value to add to the query
	 * For two reasons: escaping special characters, and converting booleans
	 */
	function getValue(val) {
		if(typeof val == 'boolean') return val == true ? 1 : 0;
		return escape(val);
	}

	return out;
};


module.exports = BinaryBeast;