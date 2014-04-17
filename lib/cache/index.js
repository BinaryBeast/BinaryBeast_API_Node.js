var
    utils   = require('../core/utils'),
    _       = require('underscore');

/**
 * @constructs {BinaryBeast.Cache|Cache}
 * @type {BinaryBeast.Cache|Cache}
 */
module.exports = Cache;

/**
 * Core Cache setup / handler class
 *
 *
 * @constructor
 * @memberOf BinaryBeast
 *
 * @version 0.0.2
 * @date    2014-04-17
 * @since   2014-04-16
 * @author  Brandon Simmons <brandon@binarybeast.com>
 */
function Cache() {
}

Cache.engine_modules = {
    'redis':    'redis',
    'couchdb':  'cradle'
};

Cache.prototype = {

    /**
     * Storage engine-specific handler
     *
     * @type {Redis|CouchDB|BinaryBeast.Cache.Redis|BinaryBeast.Cache.CouchDB}
     */
    handler: null,

    /**
     * Setup a storage-engine specific handler
     *
     * @param {string} engine
     * @param {BinaryBeast.Cache.Redis.config|BinaryBeast.Cache.CouchDB.config|Object} [options]
     * @return boolean
     */
    set_engine: function(engine, options) {

        //Validate the engine
        engine = engine.trim().toLowerCase();
        if( engine ) {

            if( !_.has(Cache.engine_modules, engine) ) {
                return false;
            }

            //Test the engine
            try {
                require.resolve( Cache.engine_modules[engine] );

                options = options || {};
                this.handler = new (require('./' + engine))(options);

                return true;
            }
            catch(e) {
                utils.error('Unable to initialize cache handling - missing library module for ' + engine, e);
            }
        }

        return false;
    },

    _handler_error: function(callback, response) {
        if(typeof response === 'undefined') response = false;

        if( !this.handler ) {
            if( typeof callback == 'function' ) {
                callback(response);
            }

            return true;
        }

        return false;
    },

    save: function(svc, args, data, ttl, callback) {
        if( this._handler_error(callback) ) return;

        //Default to 5 minutes
        ttl = ttl || 300;

        var key = this.generate_key(svc, args);
        this.handler.save(key, data, ttl, callback);
    },

    load: function(svc, args, callback) {
        if( this._handler_error(callback, null) ) return;

        var key = this.generate_key(svc, args);
        this.handler.load(key, callback);
    },

    invalidate: function(svc, args, callback) {
        if( this._handler_error(callback, null) ) return;

        var key = this.generate_key(svc, args);
        this.handler.remove(key, callback);
    },

    /**
     * Generate a unique storage key from the given arguments
     *
     * @param {string} svc
     * @param {object} [args]
     *
     * @return string
     */
    generate_key: function(svc, args) {
        var key = svc.replace('.', ':');

        if(args && typeof args === 'object') {
            if( Object.keys(args).length > 0 ) {

                var values = _.map(args, function(value) {
                    if( typeof value == 'object' ) {
                        return _.values(value);
                    }
                    return value;
                });

                //Replace special characters
                values = _.map(values, function(value) {
                    return value.replace(/[:[\]{};\s]/g, '');
                });

                key += ':' + _.flatten(values)
                    .join(':');
            }
        }

        return key;
    }
};