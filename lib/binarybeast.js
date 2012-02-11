//Modules containing wrapper methods
var tournament	= require('./tournament');

//borrow the "extend" functionality from jquery
var extend 	= require('./extend');


/**
 * BinaryBeast constructor
 */
var BinaryBeast = function(api_key) {

	this.api_key = api_key;
	this.extend = extend.;

	this.tournament = new tournament(this);	
}
/**
 * Properties
 */
BinaryBeast.prototype = {

	//ghetto 'constants'
	VERSION: 		'0.0.1',
	//
	BRACKET_GROUPS:		0,
	BRACKET_WINNERS:	1,
	BRACKET_LOSERS:		2,
	BRACKET_FINALS:		3,
	BRACKET_BRONZE:		4,
	//
	ELIMINATION_SINGLE:	1,
	ELIMINATION_DOUBLE:	2,
	//
	TOURNEY_TYPE_BRACKETS:	0,
	TOURNEY_TYPE_CUP:	1,

	//Store the api key
	api_key: 		null,

	//Wrapper modules
	tournament: 		null,
	team: 			null,
	country:		null,
	game:			null,

	//jQuery extend();
	extend:			null

};

/**
 * Make a service call
 * 
 * @param svc		A Service name (ie 'Tourney.TourneyCreate.Create')
 * @param args		An associate array of arguments ie {'Title': 'My Node API Test!'}
 *
 * 
 */
BinaryBeast.prototype.call = function(svc, args, callback) {

	

}

/**
 * I'm spoiled by jquery's .extend, so we're duplicating it here
 * used by the service wrapper modules to allow users to submit options arrays, and retain simple default values
 * 
 * In this method, obj2 gets priority - any duplicate values will result in the value from obj2
 */
BinaryBeast.extend = function(obj1, obj2) {
	for(var x in object2) object1[x] = object2[x];
	return obj1;
}


module.exports = BinaryBeast;
