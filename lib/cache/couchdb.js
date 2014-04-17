var
    cradle  = require('cradle'),
    utils   = require('../core/utils'),
    _       = require('underscore');

/**
 * @constructs {BinaryBeast.Cache.CouchDB|CouchDB}
 * @type {BinaryBeast.Cache.CouchDB|CouchDB}
 */
module.exports = CouchDB;

/**
 * Redis cache handler
 *
 * @memberOf BinaryBeast.Cache
 * @constructor
 *
 * @param config
 *
 * @version 0.0.2
 * @date    2014-04-16
 * @since   2014-04-17
 * @author  Brandon Simmons <brandon@binarybeast.com>
 */
function CouchDB(config) {
    config = config || {};

    this.config = _.extend(this.config, config);

    //Defer the connection
    this.connect();
}

CouchDB.prototype = {
    connected: false,

    /**
     * CouchDB client connection
     *
     * @type cradle.Connection
     */
    client: null,
    /**
     * CouchDB database object
     * @type cradle.Database
     */
    db: null,

    /**
     * CouchDB connection options
     */
    config: {
        host:       'http://localhost',
        port:       5984,
        db:         'bb_api_cache',
        cache:      true,
        forceSave:  true
    },

    connect: function() {
        this.client = new (cradle.Connection)(this.config);

        //If the database doesn't exist, create it now
        this.db = this.client.database( this.config.db );
        this.db.exists( this._create_db.bind(this) );
    },

    _create_db: function(error, exists) {
        if(error) {
            utils.error('CouchDB Error', error);
        }

        //Create the database
        else if( !exists ) {
            utils.log('Creating the ' + this.config.db + ' database in CouchDB');
            this.db.create( this._init_db.bind(this) );
        }

        //Existing db - defer a sweep of expired documents
        else {
            utils.defer( this.remove_expired(), this );
        }
    },

    _init_db: function() {
        utils.log('Setting up CouchDB views');

        //Define the views
        this.db.save('_design/responses', {
            '_id':      '_design/responses',
            language:   'javascript',
            views: {
                valid: {
                    map: function(doc) {
                        if( doc.expires >= new Date().getTime() ) {
                            emit(doc._id, doc.data);
                        }
                    }
                },
                expired: {
                    map: function(doc) {
                        if( doc.expires < new Date().getTime() ) {
                            emit(doc._id, doc.data);
                        }
                    }
                },
                expired_ids: {
                    map: function(doc) {
                        if( doc.expires < new Date().getTime() ) {
                            emit(doc._id, null);
                        }
                    }
                }
            }
        });

    },

    save: function(key, data, ttl, callback) {

        //Don't bother saving unless we have a reasonable ttl
        if( ttl < 30 ) {
            if(typeof callback == 'function') callback(true);
            return;
        }

        //Create / update the document
        this.db.save(key, {
                key:        key,
                expires:    (new Date().getTime() + (ttl * 1000)),
                data:       data
            },
            utils.deferred(this._on_save, this, key, callback)
        );
    },

    _on_save: function(key, callback, error) {
        var data = true;

        if(error) {
            utils.error('Error saving CouchDB cache!', {key: key, error: error});
            data = false;
        }

        if(typeof callback == 'function') {
            callback(data);
        }
    },

    load: function(key, callback) {

        this.db.view('responses/valid', {key: key},
            utils.deferred(this._on_load, this, key, callback)
        );

    },

    _on_load: function(key, callback, error, doc) {

        if( error || !Array.isArray(doc) ) {
            doc = null;
        }
        else if( doc.length > 0 ) {
            doc = doc[0].value;
        }
        else doc = null;

        if(typeof callback == 'function') {
            callback(doc);
        }
    },

    remove: function(key, callback) {
        if( typeof callback != 'function' ) callback = function(){};
        this.db.remove(key, callback);
    },

    /**
     * Remove all expired documents
     */
    remove_expired: function(callback) {

        //Fetch ids for expired documents
        this.db.view('responses/expired_ids', utils.deferred(this._expired_keys, this, callback));

    },

    _expired_keys: function(callback, error, ids) {
        if( error ) {
            utils.error('Error fetching expired document ids from CouchDB', error);
            return;
        }

        if(ids.length > 0) {
            utils.log('Removing ' + ids.length + ' expired response cache documents from CouchDB');

            _.each(ids, function(id) {
                this.db.remove(id.key, null);
            }, this);
        }
    }

};