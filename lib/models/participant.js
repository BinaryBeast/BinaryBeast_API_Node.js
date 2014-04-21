var Model = require('../core/model');

/**
 * Tournament team / participant model
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
 * @version 0.1.9
 * @date    2014-04-18
 * @since   2012-02-11
 * @author  Brandon Simmons <brandon@binarybeast.com>
 */
function Participant(data) {
    this._super.apply(this, arguments);
}

/**
 * @constructs BinaryBeast.Team
 * @type BinaryBeast.Participant
 */
module.exports = Participant;

Participant.prototype = {
    /**
     * team id
     * @type string
     */
    tourney_team_id: 0,

    /**
     * name
     * @type string
     */
    display_name: 'Test Participant',

    /** @inheritDoc */
    name: 'Test Participant',

    /**
     * Brackets only - the position within the first round
     * @type number
     */
    position: null,

    /**
     * 3 character country code (ISO 3166-1 alpha-3)
     * @type string
     */
    country_code: null,
    /**
     * 2 character country code (ISO 3166-1 alpha-2)
     * @type string
     */
    country_code_short: null,

    /**
     * Country name
     * @type string
     */
    country: null,

    /**
     * URL for the country flag if available
     * @type string
     */
    country_flag: null,

    /**
     * The race name if available
     * @type string
     */
    race: null,

    /**
     * URL to the race icon image if available
     * @type string
     */
    race_icon: null,

    /** @type number */
    race_id: null,

    /**
     * The group name this team is in
     * Group stages only
     * @type {string}
     */
    group: null,

    /**
     * Number of points for group rounds - a calculated values based on match wins and match losses
     * Group stages only
     * @type {number}
     */
    points: 0,

    /** @type {number} */
    match_losses: 0,

    /** @type {number} */
    match_wins: 0,

    /** @type string */
    game_difference: null,

    /** @type {number} */
    game_losses: 0,

    /** @type {number} */
    game_wins: 0,

    /**
     * Number of match draws - group rounds only
     * @type {number}
     */
    draws: 0,

    /**
     * Elimination brackets - number of wins in the winners' bracket
     * @type {number}
     */
    wins: 0,

    /**
     * Elimination brackets - number of wins in the bronze / 3rd place bracket
     * @type {number}
     */
    bronze_wins: 0,

    /**
     * Elimination brackets - number of wins in the loser' bracket
     * -1 means the participant is not in the losers' bracket yet
     * @type {number}
     */
    lb_wins: -1,

    /**
     * Confirmation status
     * 1: Confirmed
     * 0: Unconfirmed
     * -1: Banned
     *
     * @type {number}
     */
    status: 0,

    _config: {
        id_key:     'tourney_team_id',
        name_key:   'display_name',
        services: {
            'create':   'Tourney.TourneyTeam.Insert',
            'read':     'Tourney.TourneyLoad.Team',
            'update':   'Tourney.TourneyTeam.Update',
            'delete':   'Tourney.TourneyTeam.Delete'
        },
        response_keys: {
            'read': 'team_info'
        }
    }
};

//Inherit from the base Model
Model.extend(Participant);