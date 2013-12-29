/**
 * This module provides the main BinaryBeast node.js module with wrapper methods
 * used to manipulate tournaments
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
var Tournament = function(bb) {
    this.bb = bb;
};

/**
 * Properties
 */
Tournament.prototype = {

    //Reference to the main API Class
    bb: 		null
};


/**
 * bb.tournament.create(options, callback)
 * 
 * Wrapper method for creating a tournament
 * 
 * Available options, check the wiki for their meanings, and default / possible values: 
 *      string title
 *      string description
 *      int    public
 *      string game_code            (SC2, BW, QL examples, @see http://wiki.binarybeast.com/index.php?title=API_PHP:_game_search, you can also use our game service wrappers to search (bb.game.search(filter,callback);)
 *      int    type_id              (0 = elimination brackets, 1 = group rounds to elimination brackets, you can use constants for this (bb.BRACKET_CUP for example means round-robin)
 *      int    elimination          (1 = single, 2 = double, again we have constants for this (bb.ELIMINATION_DOUBLE for example)
 *      int    max_teams
 *      int    team_mode            (id est 1 = 1v1, 2 = 2v2)
 *      int    group_count
 *      int    teams_from_group
 *      date   date_start
 *      string location
 *      array  teams                You have the option to automatically add players/teams, just pass an array of player/team names
 *      int    return_data          (0 = TourneyID and URL only, 1 = List of team id's inserted (from teams array), 2 = team id's and full tourney info dump)
 *
 *
 * @param options
 * @param callback(result)
 *
 * @return {null}
 */
Tournament.prototype.create = function(options, callback) {

    //Extend default settings with whatever the user gives us
    options = this.bb.extend({
        title:          'Node API Test',
        type_id:        this.bb.TOURNEY_TYPE_BRACKETS,
        elimination:	this.bb.ELIMINATION_SINGLE
    }, options);

    this.bb.call('Tourney.TourneyCreate.Create', options, callback);
};


/**
 * bb.tournament.rm(tourney_id, callback)
 * 
 * Delete a tournament
 * 
 * OK so I don't know if this matters.. I'm still a node.js newb, this is my first project
 * however my IDE si complaining that delete is a future keyword, so I'm not sure if 
 * I can use tournament.prototype.delete as a function name
 * 
 * I'm sure anyone using a node.js module woudl be smart enough to know what tournament.rm does though eh? :D
 *
 * @param tourney_id
 * @param callback(result)
 *
 * @return {null}
 */
Tournament.prototype.rm = function(tourney_id, callback) {
    this.bb.call('Tourney.TourneyDelete.Delete', {'tourney_id':tourney_id}, callback);
};


/**
 * bb.tournament.update(tourney_id, options, callback)
 *
 * Update tournament settings
 * 
 * See bb.tournament.create for a list of available options, they are very nearly the same with obvious exceptions
 *
 * @param tourney_id
 * @param options
 * @param callback(result)
 *
 * @return {null}
 */
Tournament.prototype.update = function(tourney_id, options, callback) {
    options = bb.extend(options, {'tourney_id':tourney_id});
    bb.call('Tourney.TourneyDelete.Delete', options, callback);
};

/**
 * bb.tournament.list([options], callback(result))
 *
 * This wrapper method returns a list of tournaments in your account
 *
 * Available Options:
 * 	string filter	Just like it sounds, filter your results with a keyword / phrase
 *	int page_size	aka limit the number of results
 *	bool private	By default it WILL include your private tournaments, but you can disable that
 *
 * @param options
 * @param callback(result)
 *
 * @return {null}
 */
Tournament.prototype.list = function(options, callback) {

    if(typeof options == 'function') {
        callback    = options;
        options     = {};
    }
    options = this.bb.extend({
        filter: 	null,
        page_size:  	30,
        'private': 	true
    }, options);

    this.bb.call('Tourney.TourneyList.Creator', options, callback);
};

/**
 * bb.tournament.round_update(tourney_id, bracket, round, best_of, map, date, callback)
 *
 * Change the format of a round within a tournament (best of, map, and date)
 * 
 * This function also works to create the details - even if they have not yet been provided
 *
 * @param tourney_id
 * @param bracket	which bracket the round effects - ie 0 = groups, 1 = winners (there are class constants for these values (ie bb.BRACKET_WINNERS, bb.BRACKET_BRONZE)
 * @param round		0 = first round
 * @param best_of
 * @param map
 * @param date		Just a string, no strict format is required
 * @param callback(result)
 *
 * @return {null}
 */
Tournament.prototype.roundUpdate = function(tourney_id, bracket, round, best_of, map, date, callback) {

    this.bb.call('Tourney.TourneyRound.Update', {
        'tourney_id':		tourney_id,
        'bracket':          bracket,
        'round':            round,
        'best_of':          best_of,
        'map':              map,
        'date':             date
    }, callback);
};

/**
 * bb.tournament.round_update_batch(tourney_id, bracket, best_ofs, maps, dates, callback) 
 * 
 * the round_update function is fine and all.. but not incredibly effecient for large tournaments with
 * many rounds and brackets, this method llows you to update all rounds with one call, by passing in
 * a simple array for each value
 *
 *
 * The arrays should each be indexed by round
 *
 * For example... var best_ofs = [1, 1, 3, 5]; indicates 
 * 	round 1 = best of 1
 * 	round 2 = best of 1
 *	round 3 = best of 3
 * 	round 4 = best of 5
 * 
 * Same goes for maps[] and dates[]
 *
 * @param tourney_id
 * @param bracket
 * @param best_ofs
 * @param maps
 * @param dates
 * @param callback(result)
 *
 * @return void
 */
Tournament.prototype.roundUpdateBatch = function(tourney_id, bracket, best_ofs, maps, dates, callback) {
    this.bb.call('Tourney.TourneyRound.BatchUpdate', {
        'tourney_id':		tourney_id,
        'bracket':          bracket,
        'best_ofs':         best_ofs,
        'maps':             maps,
        'dates':            dates
    }, callback);
};

/**
 * bb.tournament.start(tourney_id [, seeding [, teams [, callback]]])
 * 
 * This wrapper class is a shortcut to Tourney.TourneyStart.Start
 * It will generate groups or brackets, depending on TypeID and Status
 *
 * @see @link http://wiki.binarybeast.com/index.php?title=API_PHP:_tournament_start
 *
 * @param tourney_id
 * @param seeding	Options are 'random', 'manual', 'sports' (traditional 1v32, 8v9 etc), 'balanced' - the bb class has constants for these values
 * @param teams		An array of positions / ranks - only necessary if using a non-random method
 * @param callback(result)
 *
 * @return {null}
 */
Tournament.prototype.start = function(tourney_id, seeding, teams, callback) {

    if(typeof seeding == 'function') {
        callback    = seeding;
        seeding     = this.bb.SEEDING_RANDOM;
    }
    if(typeof teams == 'function') {
        callback    = teams;
        teams       = [];
    }

    this.bb.call('Tourney.TourneyStart.Start', {
        'tourney_id':   tourney_id,
        'seeding':      seeding,
        'teams':        teams
    }, callback);
};


/**
 * bb.tournament.load(tourney_id [, callback])
 * 
 * Load details about a tournament
 * 
 * @param tourney_id
 * @param callback(result)
 * 
 * @return {null}
 */
Tournament.prototype.load = function(tourney_id, callback) {
    this.bb.call('Tourney.TourneyLoad.Info', {'tourney_id':tourney_id}, callback);
};

/**
 * bb.tournament.loadRoundFormat(tourney_id)
 * 
 * Loads current round format (BO, Maps, etc)
 * 
 * @param tourney_id
 * @param callback(result)
 * 
 * @return {null}
 */
Tournament.prototype.loadRoundFormat = function(tourney_id, callback) {
    this.bb.call('Tourney.TourneyLoad.Rounds', {'tourney_id':tourney_id, bracket:'*'}, callback);
};

module.exports = Tournament;