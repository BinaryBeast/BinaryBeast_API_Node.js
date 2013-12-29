var util    = require('util'),
    utils   = require('./utils'),
    request = require('request'),
    _       = require('underscore');

/**
 * API handler
 *
 * @version 0.0.1
 * @date    2013-12-28
 * @since   2013-12-28
 * @author  Brandon Simmons <brandon@binarybeast.com>
 */
var API = module.exports = {
    bb: null,

    /**
     * Execute an API request
     *
     * @param {string} svc
     * @param {Object} args
     * @param {function} callback
     * @param {object} [context]
     */
    fetch: function(svc, args, callback, context) {
        //Verify bb first
        if(this.bb) {
            if(this.bb.api_key) {

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
                    this._response, this, callback, context)
                );

                return;
            }
        }

        //Fail
        util.error('[ERROR] BinaryBeast (lib/core/api.fetch()): Unable to determine the api_key');
        utils.defer(callback, context, false, 'Unable to determine the api_key');

    },

    _response: function(callback, context, error, response, data) {

        //Fail
        if(error) {
            util.error('[BinaryBeast] API fetch error: ' + error);
            utils.defer(callback, context, false, error);
        }

        //Successful response
        else {
            utils.defer(callback, context, data);
        }

    }
};