var util    = require('util'),
    utils   = require('./utils'),
    request = require('request'),
    _       = require('underscore');

/**
 * API handler
 *
 * @memberOf BinaryBeast
 *
 * @version 0.0.2
 * @date    2013-12-28
 * @since   2014-04-17
 * @author  Brandon Simmons <brandon@binarybeast.com>
 */
var API = module.exports = {
    bb: null,

    /**
     * Execute an API request
     *
     * @param {string} svc
     * @param {Object} args
     * @param {number} ttl (seconds)
     * @param {function} callback
     * @param {object} [context]
     */
    fetch: function(svc, args, ttl, callback, context) {
        ttl = ttl || 0;

        //Verify bb first
        if(this.bb) {
            if(this.bb.api_key) {

                //Attempt to fetch from cache
                this.bb.cache.load(svc, args, utils.create_callback(
                    this._check_cache, this,
                    svc, args, ttl, callback, context
                ));

                return;
            }
        }

        //Fail
        utils.error('BinaryBeast (lib/core/api.fetch()): Unable to determine the api_key');
        utils.defer(callback, context, false, 'Unable to determine the api_key');

    },

    /**
     * Cache load response handler
     */
    _check_cache: function(svc, args, ttl, callback, context, cache) {

        //Success!
        if( cache && typeof cache == 'object' ) {

            //For good measure
            cache.cached = true;
            utils.defer(callback, context, cache);
            return;
        }

        //Not cached - fetch now
        //Compile the data query
        var data = _.extend({}, args || {}, {
                    api_service:            svc,
                    api_key:                this.bb.api_key,
                    api_use_underscores:    1,
                    api_agent:              'BinaryBeast API Node.js v' + this.bb.VERSION
                }
            ),

            //Compile the request options
            options = {
                url:        'https://api.binarybeast.com',
                form:       data,
                json:      true
            };

        request.post(options, utils.deferred(
            this._handle_response, this, svc, args, callback, context, ttl)
        );

    },

    _handle_response: function(svc, args, callback, context, ttl, error, response, data) {

        //Fail
        if(error) {
            util.error('[BinaryBeast] API fetch error: ' + error);
            utils.defer(callback, context, false, error);
        }

        //Successful response
        else {

            //Cache the response
            if( ttl > 0 ) {
                this.bb.cache.save(svc, args, data, ttl);
            }

            utils.defer(callback, context, data);
        }

    }
};