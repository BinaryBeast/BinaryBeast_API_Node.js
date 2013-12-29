var Model = require('../core/model');

/**
 * Core Model class
 *
 * @constructor
 *
 * @param {string|number|Object} data
 *
 * @extends Model
 * @inheritDoc
 *
 * @version 0.2.0
 * @date    2013-12-28
 * @since   2013-11-02
 * @author  Brandon Simmons <brandon@binarybeast.com>
 */
function Tournament(data) {
    this._super.apply(this, arguments);
}

/**
 * @constructor
 * @type {Tournament}
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
     * Current tournament status
     * @type string
     * - Building
     * - Confirmation
     * - Active
     * - Complete
     */
    status: '',

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
     * Number of teams in each group that advance to the brackets
     * Group rounds only
     * @type number
     */
    teams_from_group: 2,

    _config: {
        id_key: 'tourney_id',
        services: {
            'create': 'Tourney.TourneyCreate.Create',
            'read':   'Tourney.TourneyLoad.Info',
            'update': 'Tourney.TourneyUpdate.Settings',
            'delete': 'Tourney.TourneyDelete.Delete',
            'list':   'Tourney.TourneyList.Creator',
            'search': 'Tourney.TourneyListFilter.LoadList'
        },
        response_keys: {
            'read': 'tourney_info'
        }
    }
};

//Inherit from the base Model
Model.extend(Tournament);