var
    Cache       = require('./cache/index'),
    Tournament  = require('./models/tournament'),
    //Team        = require('./models/team'),
    //Game        = require('./models/game'),
    //Match       = require('./models/match'),
    //Country     = require('./models/country'),
    api         = require('./core/api');


module.exports = BinaryBeast;

/**
 * Base BinaryBeast application object
 *
 * Used as the middle man and as a model factory
 *
 * @constructor
 * @namespace
 *
 * @param {string} api_key
 *
 * @version 0.2.0
 * @date    2014-04-17
 * @since   2012-02-11
 * @author  Brandon Simmons <brandon@binarybeast.com>
 */
function BinaryBeast(api_key) {
    this.api_key = api_key;

    this.api = api;
    this.api.bb = this;

    this.tournament = Tournament.init(this);

    this.cache = new Cache();
}

/**
 * Static value containing the library version
 *
 * @static
 * @type {string}
 */
BinaryBeast.VERSION = module.exports.VERSION = '0.1.9';

BinaryBeast.prototype = {

    /**
     * Account API key
     *
     * @see {@link http://binarybeast.com/user/settings/api}
     *
     * @type string
     */
    api_key: 		null,

    /**
     * Library version number
     */
    VERSION: 			    BinaryBeast.VERSION,
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

    /**
     * Cache handler
     *
     * @type BinaryBeast.Cache|Cache
     */
    cache: null,

    //Models

    /**
     * Tournament class / constructor
     * @type BinaryBeast.Tournament
     */
    tournament: null,

    /**
     * Team class / constructor
     * @type BinaryBeast.Team
     */
    team:       null,
    game:       null,
    match:      null,
    country:    null
};

BinaryBeast.prototype.init_cache = function(engine, config) {

};

/**
 * BinaryBeast factory method
 *
 * @constructs BinaryBeast
 * @return BinaryBeast
 */
module.exports = BinaryBeast.init = function(api_key) {
    return new BinaryBeast(api_key);
};