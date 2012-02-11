/**
 * This module provides the main BinaryBeast node.js module with wrapper methods
 * used to manipulate participants within a tournament
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
var Team = function(bb) {
	this.bb = bb;
};

/**
 * Properties
 */
Team.prototype = {

	//Reference to the main API Class
	bb: 		null
};

/**
 * bb.team.insert(tourney_id, options, callback)
 *
 * Available options:
 *	string country_code		(ISO 3 character codes, you can use bb.country.search to find them too, or check wikipedia)
 *	int    status               	(0 = unconfirmed, 1 = confirmed, -1 = banned)
 *	string notes                	Notes on the team - this can also be used possibly to store a team's remote userid for your own website
 *	array  players              	If the TeamMode is > 1, you can provide a list of players to add to this team, by CSV (Player1,,Player2,,Player3)
 *	string network_name		If the game you've chosen for the tournament has a network configured (like sc2 = bnet 2, sc2eu = bnet europe), you can provide their in-game name here
 *
 * @param tourney_id
 * @param display_name
 * @param options
 * @param callback(result)
 * 
 * @return {null}
 */
Team.prototype.insert = function(tourney_id, display_name, options, callback) {

	options = this.bb.extend({
		'tourney_id':		tourney_id,
		'display_name':		display_name,
	}, options);

	this.bb.call('Tourney.TourneyTeam.Insert', options, callback);
};


/**
 * bb.team.update(tourney_team_id, options, callback)
 * 
 * Change a team's settings
 * 
 * @see @link http://wiki.binarybeast.com/index.php?title=API_PHP:_team_update
 *
 * For a list of available options, see the documentation for bb.team.insert
 * 
 * @param tourney_team_id
 * @param options 
 *
 * @return {null}
 */
Team.prototype.update = function(tourney_team_id, options, callback) {

	this.bb.call('Tourney.TourneyTeam.Update', this.bb.extend({
		'tourney_team_id':	tourney_team_id
	}), callback);

};

/**
 * bb.team.confirm(tourney_team_id [, tourney_id, callback])
 *
 * Granted that the tournament can still accept new teams, this method will update the status of a team to confirm his position in the draw
 * 
 * Unless otherwise specified, if you manually add a team through team_insert, he is confirmed by default
 * 
 * btw here's a tip: you can actually pass in '*' for the tourney_team_id to confirm ALL teams, but you would also have to include $tourney_id
 * 
 * @see @link http://wiki.binarybeast.com/index.php?title=API_PHP:_team_confirm
 * 
 * @param type $tourney_team_id 
 * 
 * @return {null}
 */
Team.prototype.confirm = function(tourney_team_id, tourney_id, callback) {

	if(typeof tourney_id == 'function') {
		callback = tourney_id;
		tourney_id = null;
	}

	this.bb.call('Tourney.TourneyTeam.Confirm', {
		'tourney_team_id':		tourney_team_id,
		'tourney_id':			tourney_id
	}, callback);

};

/**
 * bb.team.unconfirm(tourney_team_id [, callback])
 * 
 * Granted that the tournament hasn't started yet, this method can be used to unconfirm a team, so he will no longer be included in the grid once the tournament starts
 * 
 * Unless otherwise specified, if you manually add a team through team_insert, he is confirmed by default
 * 
 * @see @link http://wiki.binarybeast.com/index.php?title=API_PHP:_team_unconfirm
 * 
 * @param tourney_team_id 
 * @param callback(result)
 * 
 * @return {null}
 */
Team.prototype.unconfirm = function(tourney_team_id, callback) {
	this.bb.call('Tourney.TourneyTeam.Unconform', {'tourney_team_id':tourney_team_id}, callback);
};

/**
 * bb.team.ban(tourney_team_id [, callback])
 * 
 * BANNEDED!!!
 * 
 * Ban a team from the tournament
 * 
 * Warning: this will NOT work if the tournament has already started, the best you can do is rename the player (using team_update, 'display_name' => 'foo')
 * 
 * @see @link http://wiki.binarybeast.com/index.php?title=API_PHP:_team_ban
 * 
 * @param tourney_team_id
 * @param callback(result)
 * 
 * @return {null}
 */
Team.prototype.confirm = function(tourney_team_id, callback) {
	this.bb.call('Tourney.TourneyTeam.Ban', {'tourney_team_id':tourney_team_id}, callback);
};

/**
 * bb.team.delete(tourney_team_id [, callback])
 * 
 * This wrapper method will delete a team from a touranment
 * as long as the tournament has not been started or the team is unconfirmed
 *
 * @see @link http://wiki.binarybeast.com/index.php?title=API_PHP:_team_delete
 *
 * @param tourney_team_id
 *
 * @return {null}
 */
Team.prototype.delete = function(tourney_team_id, callback) {
	this.bb.call('Tourney.TourneyTeam.Delete', {'tourney_team_id':tourney_team_id}, callback);
};

/**
 * bb.team.reportWin(tourney_id, tourney_team_id, o_tourney_team_id, [options, callback]) 
 * 
 * This wrapper method will report a team's win (Tourney.TourneyTeam.ReportWin)
 *
 * @see @link http://wiki.binarybeast.com/index.php?title=API_PHP:_team_report_win
 *
 * Available options:
 * 	score		The winner's score
 * 	o_score		The loser's score
 * 	replay		A URL to the replay_pack for this match
 * 	map		The first map played (this will change later, as it doesn't currently support reporting a series of games from this service)
 *	notes		An optional description of the match
 * 	force		You can pass in true for this paramater, to force advancing the team even if he has no opponent (it would have thrown an error otherwise)
 *
 * 
 * @param tourney_id
 * @param tourney_team_id		The winner
 * @param o_tourney_team_id		The loser (optionally, only used for group-rounds)
 * @param options
 * @param callback(result)
 *
 * @return {null}
 */
Team.prototype.reportWin = function(tourney_id, tourney_team_id, o_tourney_team_id, options, callback) {

	if(typeof options == 'function') {
		callback = options;
		options = {};
	}

	options = this.bb.extend({
		'tourney_id':		tourney_id,
		'tourney_team_id':	tourney_team_id,
		'o_tourney_team_id':	o_tourney_team_id,
		'score':		1,
		'o_score':		0,
	}, options);

	this.bb.call('Tourney.TourneyTeam.ReportWin', options, callback);
};

/**
 * bb.team.getOpponent(tourney_team_id)
 * 
 * This wrapper will return the TourneyTeamID of the given team (Tourney.TourneyTeam.GetOTourneyTeamID)
 * 
 * Note: All this method wil give you is the tourney_team_id of the opponent, if you need more information
 * than that, you'll have to load from your own cache, or use bb.team.load(tourney-team_id)
 *
 * @see @link http://wiki.binarybeast.com/index.php?title=API_PHP:_team_get_opponent
 *
 * Evaluating the returned o_tourney_team_id will tell you what status of the requested team:
 *	o_tourney_team_id = -1 => Tne team has already been eliminated (see the returned 'victor' object to see who eliminated him
 *	o_tourney_team_id = 0  => The team is currently waiting on an opponent
 *
 * Also, if the team has been eliminated, it will return an object 'Victor" with some information
 * about the winning team
 *
 * @param tourney_team_id
 *
 * @return {null}
 */
Team.prototype.getOpponent = function(tourney_team_id) {
	this.bb.call('Tourney.TourneyTeam.GetOTourneyTeamID', {'tourney_team_id':tourney_team_id}, callback);
};

/**
 * bb.team.load(tourney_team_id)
 *
 * Returns as much information about a team as possible
 * 
 * @param tourney_team_id
 *
 * @return {null}
 */
Team.prototype.load = function(tourney_team_id) {
	this.bb.call('Tourney.TourneyLoad.Team', {'tourney_team_id':tourney_team_id}, callback);
};




module.exports = Team;
