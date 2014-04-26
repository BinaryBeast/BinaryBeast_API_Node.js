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
 * @version 0.2.4
 * @date    2014-04-25
 * @since   2013-11-02
 * @author  Brandon Simmons <brandon@binarybeast.com>
 */
function Tournament(data) {
    this._super.apply(this, arguments);

    this._draw = {};
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
     * Will be deprecated soon - don't use this
     * @type {number}
     */
    type_id: 0,

    /**
     * Current stage
     * @type {number}
     */
    stage: 0,

    /**
     * Contextual stage
     *
     * Can be used by tournament.stage(x) to chain functions within the scope of a specific stage
     */
    _stage: 0,

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
    _draw: null,

    _config: {
        id_key:     'tourney_id',
        name_key:   'title',
        services: {
            'create':           'Tourney.TourneyCreate.Create',
            'read':             'Tourney.TourneyLoad.Info',
            'update':           'Tourney.TourneyUpdate.Settings',
            'delete':           'Tourney.TourneyDelete.Delete',
            'list':             'Tourney.TourneyList.Creator',
            'search':           'Tourney.TourneyListFilter.LoadList',
            'participants':     'Tourney.TourneyLoad.Teams',
            'draw_groups':      'Tourney.TourneyDraw.Groups',
            'draw_dual':        'Tourney.TourneyDraw.Groups',
            'draw_brackets':    'Tourney.TourneyDraw.Brackets'
        },
        response_keys: {
            'read':             'tourney_info',
            'participants':     'teams',
            'draw_groups':      'fixtures',
            'draw_dual':        'groups',
            'draw_brackets':    'brackets'
        }
    }
};

/**
 * Define a stage id as a context for future calls
 *
 * Set to null to use the current stage
 *
 *
 * @param stage
 */
Tournament.prototype.stage_scope = function(stage) {
    if( typeof stage == 'undefined' || stage === null ) stage = this.stage;

    this._stage = stage;
} ;

/**
 * @inheritDoc
 *
 * @param data
 * @param value
 * @param silent
 */
Tournament.prototype.set = function(data, value, silent) {

    //Update the _stage scope if appropriate
    if( data === 'stage' && (this._stage === null || this._stage == this.stage) ) {
        this._stage = value;
    }

    return Model.prototype.set.apply(this, arguments);
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
        arguments: {tourney_id: this.id},
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

/**
 * Fetch the standings and match results from the group rounds
 *
 * @param {function} callback
 * @returns {undefined}
 */
Tournament.prototype.draw_groups = function(callback) {

    //Already cached
    if( this._draw.groups ) {
        utils.callback(callback, null, this._draw.groups);
        return;
    }

    //Validate the tournament status / type
    if( !this.id || this.type_id != 1 || _.contains(['Active', 'Building'], this.status) ) {
        utils.callback(callback, false);
        return;
    }

    //We'll be expecting either 'fixtures' or 'groups' from the response, depending on the tournament type
    //TODO: this will be standardized and no longer necessary with api/v2/
    var type = this.group_mode == 'dual' ? 'draw_dual' : 'draw_groups';

    //Fetch from the API
    this._request(type, {
        arguments: {tourney_id: this.id},
        callback: utils.deferred(this._handle_groups, this, callback),
        context: this
    });
};

/**
 * Fetch elimination bracket results
 *
 * @param {function} callback
 */
Tournament.prototype.draw_brackets = function(callback) {

    //Already cached
    if( this._draw.brackets ) {
        utils.callback(callback, null, this._draw.brackets);
        return;
    }

    //Validate the tournament status / type
    if( !this.id || !_.contains(['Active', 'Active-Brackets', 'Complete'], this.status) ) {
        utils.callback(callback, false);
        return;
    }

    //Fetch from the API
    this._request('draw_brackets', {
        arguments: {tourney_id: this.id},
        callback: utils.deferred(this._handle_brackets, this, callback),
        context: this
    });
};

Tournament.prototype._handle_groups = function(callback, groups, error, options) {

    if( error ) {
        utils.defer(callback, null, false, error);
        return;
    }

    //Cast models
    //TODO: finish building this
    _.each(groups, function(group) {
        /**
         * Dual tournament brackets
         * @todo cast round robin models
         */
        _.map(group.teams, function(team) {
            return new Participant(team);
        });

        _.each(group.brackets, function(rounds) {
            _.each(rounds, function(matches) {
                _.map(matches, function(match) {
                    if( match.team ) match.team = new Participant(match.team);
                    if( match.opponent ) match.opponent = new Participant(match.opponent);

                    //TODO remove this hack!
                    match.winner = function() {
                        if( this.match && this.team && this.opponent ) {
                            if( this.match.tourney_team_id == this.team.id ) {
                                return this.team;
                            }
                            if( this.match.tourney_team_id == this.opponent.id ) {
                                return this.opponent
                            }
                        }

                        return null;
                    };

                    return match;
                })
            })
        });
    });

    utils.defer(callback, null, groups, error, options);
};

Tournament.prototype._handle_brackets = function(callback, brackets, error, options) {

    if( error ) {
        utils.defer(callback, null, false, error);
        return;
    }

    //TODO standardize this on the API side
    brackets.winners = brackets[1];
    delete brackets[1];

    if( brackets[2] ) {
        brackets.losers   = brackets[2];
        delete brackets[2];
    }
    if( brackets[3] ) {
        brackets.finals   = brackets[3];
        delete brackets[3];
    }
    if( brackets[4] ) {
        brackets.bronze   = brackets[4];
        delete brackets[4];
    }

    //Cast models
    //TODO: finish building this
    _.each(brackets, function(rounds) {

        _.each(rounds, function(matches) {
            _.map(matches, function(match) {
                if( match.team ) match.team = new Participant(match.team);
                if( match.opponent ) match.opponent = new Participant(match.opponent);
                match.asdf = true;

                //TODO remove this hack!
                match.winner = function() {
                    if( this.bracket_winner ) {
                        return this.team;
                    }

                    if( this.match && this.team && this.opponent ) {
                        if( this.match.tourney_team_id == this.team.id ) {
                            return this.team;
                        }
                        if( this.match.tourney_team_id == this.opponent.id ) {
                            return this.opponent
                        }
                    }

                    return null;
                };

                return match;
            })
        });
    });

    utils.defer(callback, null, brackets, error, options);
};

//Inherit from the base Model
Model.extend(Tournament);