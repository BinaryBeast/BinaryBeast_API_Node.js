var
    _           = require('underscore'),
    Participant = require('./participant'),
    utils       = require('../core/utils'),
    Model       = require('../core/model');

/**
 * Core Model class
 *
 * @constructor
 *
 * @memberOf BinaryBeast
 *
 * @param {string|number|Object} data
 *
 * @extends Model
 * @inheritDoc
 *
 * @version 0.2.2
 * @date    2014-04-18
 * @since   2013-11-02
 * @author  Brandon Simmons <brandon@binarybeast.com>
 */
function Tournament(data) {
    this._super.apply(this, arguments);
}

/**
 * @constructs BinaryBeast.Tournament
 * @type BinaryBeast.Tournament
 */
module.exports = Tournament;

Tournament.prototype = {
    /**
     * Unique tournament id
     * @type string
     */
    tourney_id: null,

    /**
     * Tournament name/title
     * @type {string}
     */
    title: 'Node.js Test Tournament',

    /** @inheritDoc */
    name: 'Node.js Test Tournament',

    /**
     * Current stage
     * @type {number}
     */
    stage: 0,

    /**
     * Tournament description
     * @type {string}
     */
    description: null,

    /**
     * General description of where the tournament takes place
     * @type {string}
     */
    location: null,

    /**
     * Timestamp of when the tournament is to begin
     * @type string
     */
    date_start: null,

    /**
     * Tournament visibility
     * @type {string}
     */
    public: false,

    /**
     * Short description of the tournament type (brackets, groups to brackets, etc)
     * @type string
     */
    type: null,

    /**
     * Current tournament status
     * @type string
     * - Building
     * - Confirmation
     * - Active
     * - Complete
     */
    status: '',

    /**
     * Number of confirmed participants
     * @type number
     */
    teams_confirmed_count: 0,

    /**
     * Total number of participants
     * @type number
     */
    teams_joined_count: 0,

    /**
     * Array of divisions selected for this tournament
     * @type {{id: number, division: number}[]}
     */
    divisions: [],

    /**
     * Array of division_ids this tournament allows
     * @type number[]
     */
    region_id: 0,

    /**
     * Unique game code for this tournament's game
     * @type {string}
     */
    game_code:      '',

    /**
     * Game title
     * @type {string}
     */
    game:           null,

    /**
     * Map pool
     * @type {Map[]}
     */
    map_pool: [],

    /**
     * Elimination mode
     * 1: Single
     * 2: Double
     *
     * @type number
     */
    elimination: 1,

    /**
     * Limit of number of participants that can join
     *
     * For brackets, must be a power of 2
     *
     * @type number
     */
    max_teams: 16,

    /**
     * Participant match-up mode
     *
     * 1: 1v1
     * 2: 2v2
     * 3tc
     *
     * @type number
     */
    team_mode: 1,

    /**
     * Number of groups (group rounds only
     * @type number
     */
    group_count: 1,

    /**
     * Group type
     * Could be 'round robin', or 'dual'
     * @type string
     */
    group_mode: null,

    /**
     * Number of teams in each group that advance to the brackets
     * Group rounds only
     * @type number
     */
    teams_from_group: 2,

    /**
     * @type {BinaryBeast.Participant[]|Participant[]}
     */
    _participants: null,

    _config: {
        id_key:     'tourney_id',
        name_key:   'title',
        services: {
            'create':       'Tourney.TourneyCreate.Create',
            'read':         'Tourney.TourneyLoad.Info',
            'update':       'Tourney.TourneyUpdate.Settings',
            'delete':       'Tourney.TourneyDelete.Delete',
            'list':         'Tourney.TourneyList.Creator',
            'search':       'Tourney.TourneyListFilter.LoadList',
            'participants': 'Tourney.TourneyLoad.Teams'
        },
        response_keys: {
            'read':         'tourney_info',
            'participants': 'teams'
        }
    }
};

/**
 * Fetch an array of tournament participants
 *
 * @param {function} callback
 * @param {boolean} [freewins=false]
 *
 * @return undefined
 */
Tournament.prototype.participants = function(callback, freewins) {
    if(typeof freewins == 'undefined') freewins = false;

    //Can't continue without a valid id
    if( !this.id ) {
        utils.defer(callback, null, null);
        return;
    }

    //Already set
    if( this._participants ) {
        if( typeof callback == 'function' ) {
            utils.defer(callback, null, this._participants);
        }

        return;
    }

    this._request('participants', {
        arguments: {
            tourney_id: this.id
        },
        callback: utils.deferred(this._handle_participants, this, freewins, callback)
    });

};

Tournament.prototype._handle_participants = function(freewins, callback, participants, error) {
    if( error ) {
        utils.defer(callback, null, participants, error);
        return;
    }

    //Instantiate each participant model
    this._participants = _.map(participants, function(participant) {
        return new Participant(participant);
    });

    //Setup callback data
    var data = this._participants;
    if( !freewins ) {
        data = _.filter( this._participants, function(participant) {
            var name = participant.name.toLowerCase();
            return name.indexOf('freewin') === -1 && name.indexOf('bye') === -1;
        } );
    }

    utils.defer(callback, null, data);
};

//Inherit from the base Model
Model.extend(Tournament);