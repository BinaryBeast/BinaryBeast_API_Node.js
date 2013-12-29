var EventEmitter    = require('events').EventEmitter,
    util            = require('util'),
    utils           = require('./utils'),
    _               = require('underscore');


/**
 * Core Model class
 *
 * @constructor
 *
 * @param {string|number|Object} data
 *
 * @extends EventEmitter
 * @inheritDoc
 *
 * @version 0.0.1
 * @date    2013-12-28
 * @since   2013-12-28
 * @author  Brandon Simmons <brandon@binarybeast.com>
 */
function Model(data) {
    //EventEmitter constructor
    EventEmitter.call(this);

    //Import the data / id provided
    this._import(data);

    //If an ID was imported, load now
    if(this.id && !this.loaded) {

        //Load the model, but defer execution
        utils.defer(this.load, this);
    }
}

/**
 * @constructor
 * @type {Model}
 */
module.exports = Model;

Model.prototype = {
    /**
     * Standardized object id
     * @type string|number
     */
    id: null,

    /**
     * The user modal data was loaded from API cache
     * @type boolean
     */
    loaded_from_cache: false,

    /**
     * Indicates whether or not the model is currently loading
     * @type {boolean}
     */
    loading: false,

    /**
     * Indicates whether or not the model is currently loading
     * @type {boolean}
     */
    loaded: false,

    /**
     * Parent model constructor
     * @type Model
     */
    _super: null,

    _config: {
        /**
         * field name for setting
         *  the standardized id field
         */
        id_key: 'id',

        /**
         * List of service names to use when 
         *  calling the API 
         */
        services: {
            'create':   null,
            'read':     null,
            'update':   null,
            'delete':   null,
            'list':     null,
            'search':   null
        },

        /**
         * If cache is available, the default number
         *  of seconds to store read / list results
         */
        ttl: 60,

        /**
         * Field names used when parsing API responses
         */
        response_keys: {
            'read':     'data',
            'list':     'list',
            'search':   'list'
        }
    },

    /**
     * Import a hash of values to set
     *
     * This will also reset the "changed" hash
     *
     * @param {Object|number|string} data
     * @param {boolean} [silent=true]
     *
     * @return {Object|null}
     * Same return as set()
     */
    _import: function(data, silent) {
        if(typeof silent === 'undefined') silent = true;

        //If given a number / string, use it as the id
        if(typeof data == 'number' || typeof data == 'string') {
            //Use the data as an id, and normalize by casting it as an object
            data = {id: data};
        }

        //Must be a valid object
        if( typeof data != 'object') return false;

        //Must have values in it
        if( _.size(data) === 0 ) return false;

        //Delegate to set(), and return directly
        var changed = this.set(data, null, silent);

        //If not flagged as loaded yet, and we've changed at least 3 values, flag as loaded
        if(!this.loaded && changed) {
            this.loaded = _.size(_.omit(changed, 'previous')) > 2;
        }

        return changed;
    }
};

/**
 *
 * @param callback
 * @param context
 */
Model.prototype.load = function(callback, context) {
    //Already loaded
    if(this.loaded) {
        utils.defer( callback, context, this );
        return;
    }

    //Still loading, register a listener
    if(this.loading) {
        this.once('loaded', utils.deferred(callback, context));
        return;
    }

    //Load now
    this.fetch({
        success: callback,
        context: context
    });
};

/**
 * Fetch the model data
 *
 * @param options
 */
Model.prototype.fetch = function(options) {
    //Given a function
    if(typeof options == 'function') {
        options = {success: options};
    }

    //Defaults
    options = _.defaults({}, options, {
        id:         this.id,
        success:    null,
        error:      null,
        fail:       null,
        context:    null,
        type:       'read'
    });

    if(options.id && options.id != this.id) {
        //Silently reset the model
        this.reset(true);
        this.set_id(options.id, true);
    }

    //No id to load
    else if(!this.id && !options.arguments) {
        utils.defer(options.error, options.context, {message: 'Cannot fetch Model data without an ID', model: this});
    }

    //Already loaded
    else if(this.loaded) {
        utils.defer(options.success, options.context, this);
    }

    //Compile the API arguments
    var api_options = {
        service: this._service('read'),
        arguments: options.arguments || {},
        ttl: this._ttl()
    };

    //Add the id to the arguments
    api_options.arguments[ this._config.id_key || 'id' ] = this.id;

    //Set the loading flag
    this.loading = true;

    //Emit a loading event
    this.emit('loading');

    //Call the API
    this.bb.api.fetch(api_options.service, api_options.arguments, utils.create_callback(
        this._fetch_response, this,
        api_options.success, api_options.context
    ));
};

/**
 * API fetch response handler
 *
 * @param callback
 * @param context
 * @param {Object} response
 * @param error
 * @private
 */
Model.prototype._fetch_response = function(callback, context, response, error) {
    this.loading = false;

    //Looks good so far...
    if(response) {
        //Fetch the response key
        var key = this._response_key( 'read' ) || 'data';

        //Try extracting the data
        var data = response[key] || response['data'] || response['list'] || null;

        //Found the data!
        if(data) {
            //Set the loaded_from_cache value
            if(response.from_cache) {
                this.loaded_from_cache = true;
            }

            //Import the new data - non-silently
            this._import(data, false);
            this.loaded = true;

            //Loaded event
            this.emit('loaded', this);

            //Invoke the callback
            utils.defer(callback, context, this);
            return;
        }
    }

    //Fail
    util.error('[BinaryBeast] Model API Error: ' + util.inspect({response: response, request_error: error}));
    utils.defer(callback, context, false);


};

Model.prototype.reset = function() {
    this.loaded = false;
    this.loading = false;
};

/**
 * Set property value/values
 *
 * @param {object|string} data
 * @param [value]
 * @param {boolean} [silent]
 *
 * @return {boolean|*|{previous: object}|null}
 *  - Hash of changed values
 *  - null if nothing changed
 */
Model.prototype.set = function(data, value, silent) {

    //Hash of changed values
    var changed = {};

    //Import a hash of values
    if(typeof data == 'object') {

        _.each(data, function(value, key) {

            //Recursively set, and set silent
            var result = this.set(key, value, true);

            //Import any changed values
            if(result) {
                if(result.previous) {
                    _.defaults(changed, result);
                    _.defaults(changed.previous, result.previous);
                }
            }

        }, this);

    }

    //Import a single key => value pair
    else {

        //Must be a valid property
        if( typeof this[data] != 'undefined' ) {

            //Set ids differently
            if( data == 'id' || data == this._config.id_key ) {
                return this.set_id(value);
            }

            //Compare against the current value
            if(this[data] != value) {
                //Initialize the changed hash
                changed.previous = changed.previous || {};

                //Save to the hash of changed values
                changed.previous[data] = this[data];
                changed[data] = value;

                //Update the model
                this[data] = value;
            }

        }
    }

    //Return null if nothing changed
    if( _.size(changed) == 0 ) {
        return null;
    }

    //Emit the changed values unless silent
    if(!silent) {
        this.emit('change', changed);
    }

    //Return the changed values
    return changed;
};

/**
 * Update the id property
 *
 * @param {string|number} id
 * @param {boolean} [silent=false]
 *
 * @return Object|boolean
 * true if changed
 * false if nothing changed
 */
Model.prototype.set_id = function(id, silent) {

    //No change
    if(this.id == id) return null;

    var changed = {id: id, previous: {id: this.id}};
    if(this._config.id_key && this._config.id_key != 'id') {
        changed[this._config.id_key] = id;
        changed.previous[this._config.id_key] = this.id;
    }

    //Set 'id', and [id_key]
    this.id = this[ this._config.id_key || 'id' ] = id;

    if(!silent) {
        this.emit('id_change', changed);
    }

    return changed;
};

//Inherit event handling
Model.prototype = Object.create( _.defaults(Model.prototype, EventEmitter.prototype));

/**
 * Returns the service name for the given operation,
 *  for example 'list' or 'create'
 *
 * @private
 * @param {string} type
 * @return string
 */
Model.prototype._service = function(type) {
    return this.constructor._service(type);
};
/**
 * @static
 * @private
 * @param {string}
 * @return string
 */
Model._service = module.exports._service = function(type) {
    return this.prototype._config.services[type] || null;
};
/**
 * Fetch the caching TTL value
 *
 * @return number
 */
Model.prototype._ttl = function() {
    return this.constructor._ttl();
};
/**
 * @return number
 */
Model._ttl = module.exports._ttl = function() {
    return this.prototype._config.ttl || 0;
};
/**
 * Fetch an API response key name
 *
 * @return string
 */
Model.prototype._response_key = function(type) {
    return this.constructor._response_key(type);
};
/**
 * @return string
 */
Model._response_key = module.exports._response_key = function(type) {
    return this.prototype._config.response_keys[type] || null;
};

/**
 * Class factory
 * 
 * Returns a class constructor with the main bb application object
 *  set to the prototype
 * 
 * @static
 * 
 * @param {BinaryBeast} bb
 * @return Model
 */
Model.init = module.exports.init = function(bb) {
    this.prototype.bb = this.bb = bb;
    return this;
};

/**
 * Inheritance handler
 * @type constructor
 * @return constructor
 */
Model.extend = module.exports.extend = function(Child) {
    //Static inheritance
    _.defaults(Child, _.clone(Model));

    //Prototypical inheritance
    Child.prototype = Object.create(_.defaults(Child.prototype, Model.prototype) );
    Child.prototype.constructor = Child;

    //Save a reference to the parent constructor
    Child.prototype._super = Model;

    //Fill in defaults
    _.defaults(Child.prototype._config, Model.prototype._config);
    _.defaults(Child.prototype._config.response_keys, Model.prototype._config.response_keys);

    return Child;
};