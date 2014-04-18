var
    redis   = require('redis'),
    utils   = require('../core/utils'),
    _       = require('underscore');


/**
 * @constructs {BinaryBeast.Cache.Redis|Redis}
 * @type {BinaryBeast.Cache.Redis|Redis}
 */
module.exports = Redis;

/**
 * Redis cache handler
 *
 * @memberOf BinaryBeast.Cache
 * @constructor
 *
 * @param config
 *
 * @version 0.0.3
 * @date    2014-04-18
 * @since   2014-04-16
 * @author  Brandon Simmons <brandon@binarybeast.com>
 */
function Redis(config) {
    config = config || {};

    this.config = _.extend(this.config, config);

    //Defer the connection
    this.connect();
}

Redis.prototype = {
    connected: false,

    /**
     * Redis connection
     *
     * @type RedisClient
     */
    client: null,

    config: {
        host: 'localhost',
        port: 6379,
        db:   0,
        prefix: 'bbapi:node:',
        password: null
    },

    connect: function() {
        var options = {};
        if( this.config.password ) {
            options.auth_pass = this.config.password;
        }

        this.client = redis.createClient(this.config.port, this.config.host, options);
        this.client.on('error', this._handle_error.bind(this));

        if(this.config.db > 0) {
            this.client.select(this.config.db, null);
        }
    },
    _handle_error: function(error) {
        utils.error('Redis cache client error', error);
    },

    /**
     * Store a value
     *
     * @param {string} key
     *
     * @param {object} data
     *
     * @param {number} [ttl]
     *  number of seconds
     *
     * @param [callback]
     *
     */
    save: function(key, data, ttl, callback) {
        //Don't bother storing invalid data
        if( !data || typeof data != 'object' ) return;
        if( !_.size(data) ) return;

        //json encode the value first
        data = JSON.stringify(data);

        //apply the key prefix
        key = this.config.prefix + key;

        //Store the value
        if(typeof callback != 'function') callback = function(){};
        this.client.setex(key, ttl, data, callback);
    },

    load: function(key, callback) {
        utils.log('redis.load', {key: key});

        //apply the key prefix
        key = this.config.prefix + key;

        this.client.get(key, utils.deferred(this._on_load, this, callback));

    },

    _on_load: function(callback, error, data) {
        utils.log('redis._on_load', {error: error, data: data});

        if( error ) {
            utils.error('Redis error', error);
            data = false;
        }
        else {
            //Decode the serialized json string
            try {
                data = JSON.parse(data) || data;
            }
            catch(e) {
                utils.error('Redis response parse error', e);
            }
        }

        if(typeof callback == 'function') {
            callback(data);
        }
    },

    remove: function(key, callback) {
        key = this.config.prefix + key;

        if(typeof callback != 'function') callback = function(){};
        this.client.del(key, callback);
    },

    /**
     * Not required for redis
     */
    removeExpired: function(callback) {
        if( typeof callback == 'function' ) {
            callback(0);
        }
    }
};