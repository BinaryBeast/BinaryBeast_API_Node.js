var
    util    = require('util'),
    _       = require('underscore');

/**
 * Collection of simple utility methods for the BinaryBeast API Module
 *
 * @version 0.0.4
 * @date    2014-04-21
 * @since   2013-12-28
 * @author  Brandon Simmons <brandon@binarybeast.com>
 */
var Utils = module.exports = {
    /**
     * Argument object handlers
     */
    args: {
        /**
         * Returns an arguments array, removing any values
         *  up to the provided 'start' value
         *
         * @param {Arguments} args
         * @param {number} start Number of arguments to ignore, aka if given 1, then the first argument would be ignored
         *
         * @return Array
         */
        ltrim: function(args, start) {
            return Array.prototype.slice.call(args, start) || [];
        }
    },

    /**
     * Invoke a callback, with dynamic arguments and optional context
     *
     * @param callback
     * @param context
     * @return {*}
     */
    callback: function(callback, context) {
        //No callback provided
        if(typeof callback != 'function') return;

        //GOGOGO
        return callback.apply( context || null, Utils.args.ltrim(arguments, 2) );
    },

    /**
     * Defer a callback invocation using nextTick()
     */
    defer: function() {
        process.nextTick(function(args) {
            return Utils.callback.apply(null, args);
        }.bind(null, arguments));
    },

    /**
     * Create a callback function, with optional dynamic arguments and context bound
     *
     * @param {function} callback
     * @param {object} [context]
     */
    create_callback: function(callback, context) {

        return function(args) {

            return Utils.callback.apply(null,
                _.toArray(args).concat( Utils.args.ltrim(arguments, 1) )
            );

        }.bind(null, arguments);

    },

    /**
     * Create a callback function that is deferred when called
     *
     * @param callback
     * @param context
     * @return {*}
     */
    deferred: function(callback, context) {

        return Utils.create_callback.apply(null,
            [Utils.defer, null].concat( _.toArray(arguments) )
        );

    },

    /**
     * Log a message to stdout
     *
     * @param {string} [message]
     * @param [data]
     * @param {boolean} [error]
     * @param {boolean} [skip_date]
     */
    log: function(message, data, error, skip_date) {
        message = message || '';

        if(data) {
            if(message) message += ' ';

            message += util.inspect(data, {colors: true, depth: 2});
        }

        if(error) {
            util.error(message);
        }
        else if(skip_date) {
            console.log(message);
        }
        else {
            util.log(message);
        }
    },

    /**
     * Log a message to stderr
     *
     * @param {string} [message]
     * @param [data]
     */
    error: function(message, data) {
        message = '[ERROR] ' + (message || message);
        return this.log(message, data, true);
    }
};