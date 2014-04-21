/*
 * @project Longo.js
 * @module longo
 * @desc Asynchronous local database with a flavor of FRP.
 * @requires {@linkplain http://underscorejs.org/|underscore}
 * @example
 * &lt;script type="text/javascript" src="path/to/Longo.js/lib/underscore-min.js"&gt;&lt;/script&gt;
 * &lt;script type="text/javascript" src="path/to/Longo.js/longo.js"&gt;&lt;/script&gt;
 * &lt;script&gt;
 *   // Adjust root directory.
 *   Longo.setRoot("path/to/Longo.js");
 * &lt;script&gt;
 *
 * @see https://github.com/georgeOsdDev/Longo
 *
 * @license   The MIT License (MIT)
 * @copyright Copyright (c) 2014 Takeharu Oshida <georgeosddev@gmail.com>
 */

(function(global, undefined) {
  "use strict";

  var wnd = global;

  /**
   * @namespace Longo
   */
  var Longo = global.Longo = {};

  /**
   * VERSION of module
   * @memberof Longo
   * @constant
   * @type {String}
   */
  Longo.VERSION = "0.1.0";

  /**
   * The root path for Longo components
   * This value is automatically updated on window onload event.<br>
   * If you want to access DB object before window onload, <br>
   * be sure that set correct path with `setRoot`.
   * @see Longo.setRoot
   * @memberof Longo
   * @type {String}
   * @default "/Longo.js"
   *
   */
  Longo.LONGOROOT = "/Longo.js";

  /**
   * If you are using longo.min.js,<br>
   * this value will be automatically replaced with `longoWorker.min.js`
   * @see Longo.useMinified
   *
   * @memberof Longo
   * @type {String}
   * @default "longoWorker.js"
   */
  Longo.WORKERJS  = "longoWorker.js";

  /**
   * You can change this value with `debug`,`info`,`warn`,`error`.
   * @see Longo.setLogLevel
   * @memberof Longo
   * @type {String}
   * @default "warn"
   */
  Longo.LOGLEVEL = "warn";

  /**
   * @name Longo.Status
   * @namespace
   */
  var Status = Longo.Status = {
  /**
   * CREATED
   * @memberof Longo.Status
   * @type {Number}
   * @constant
   */
    "CREATED": 0,
  /**
   * STARTED
   * @memberof Longo.Status
   * @type {Number}
   * @constant
   */
    "STARTED": 1,
  /**
   * STOPPED
   * @memberof Longo.Status
   * @type {Number}
   * @constant
   */
    "STOPPED": 2,
  /**
   * DELETED
   * @memberof Longo.Status
   * @type {Number}
   * @constant
   */
    "DELETED": 3
  };

  /**
   * @name Longo.Error
   * @class Longo.Error
   * @param {Number} code    error code
   * @param {String} message error message
   * @param {Object} stack   error stack trace
   * @private
   * @constructs
   * @extends Error
   */
  Longo.Error = function(code, message, stack) {
    this.code = code;
    this.message = message;
    this.stack = stack || (new Error().stack);
  };

  function parseError(obj){
    return new Longo.Error(obj.code, obj.message, obj.stack);
  }

  /**
   * UNEXPECTED_ERROR
   * @memberof Longo.Error
   * @constant
   */
  Longo.Error.UNEXPECTED_ERROR = 1;
  /**
   * EXECUTION_ERROR
   * @memberof Longo.Error
   * @constant
   */
  Longo.Error.EXECUTION_ERROR = 2;
  /**
   * WEBWORKER_ERROR
   * @memberof Longo.Error
   * @constant
   */
  Longo.Error.WEBWORKER_ERROR = 3;
  /**
   * INVALID_QUERY
   * @memberof Longo.Error
   * @constant
   */
  Longo.Error.INVALID_QUERY = 4;
  /**
   * COLLECTION_NOT_FOUND
   * @memberof Longo.Error
   * @constant
   */
  Longo.Error.COLLECTION_NOT_FOUND = 5;
  /**
   * COLLECTION_ALREADY_EXISTS
   * @memberof Longo.Error
   * @constant
   */
  Longo.Error.COLLECTION_ALREADY_EXISTS = 6;
  /**
   * COLLECTION_NOT_STARTED
   * @memberof Longo.Error
   * @constant
   */
  Longo.Error.COLLECTION_NOT_STARTED = 7;
  /**
   * DUPLICATE_KEY_ERROR
   * @memberof Longo.Error
   * @constant
   */
  Longo.Error.DUPLICATE_KEY_ERROR = 8;
  /**
   * DOCUMENT_NOT_FOUND
   * @memberof Longo.Error
   * @constant
   */
  Longo.Error.DOCUMENT_NOT_FOUND = 9;
  /**
   * MOD_ID_NOT_ALLOWED
   * @memberof Longo.Error
   * @constant
   */
  Longo.Error.MOD_ID_NOT_ALLOWED = 10;
  /**
   * NOT_SUPPOETRD
   * @memberof Longo.Error
   * @constant
   */
  Longo.Error.NOT_SUPPOETRD = 11;
  /**
   * EVAL_ERROR
   * @memberof Longo.Error
   * @constant
   */
  Longo.Error.EVAL_ERROR = 12;
  /**
   * INVALID_MODIFIER_SPECIFIED
   * @memberof Longo.Error
   * @constant
   */
  Longo.Error.INVALID_MODIFIER_SPECIFIED = 13;

  Longo.ErrorCds = _.invert(Longo.Error);


  /**
   * Utility methods of Longo.<br>
   * These methods are also available from application.
   * @namespace
   * @name Longo.Utils
   * @memberof Longo
   * @static
   */
  var Utils = Longo.Utils = {

    /**
     * Decode Uint16Array to String
     * @see Longo.Utils.str2ab
     * @see http://www.html5rocks.com/en/tutorials/webgl/typed_arrays/#toc-transferables
     * @see http://updates.html5rocks.com/2012/06/How-to-convert-ArrayBuffer-to-and-from-String
     * @function
     * @memberof Longo.Utils
     * @static
     * @param {Uint16Array} buf Uint16Array
     * @return {String} str decoded string
     */
    ab2str: function(buf) {
      return String.fromCharCode.apply(null, new global.Uint16Array(buf));
    },

    /**
     * Encode String to Uint16Array for zero-copy messageing
     * @see Longo.Utils.ab2str
     * @see http://www.html5rocks.com/en/tutorials/webgl/typed_arrays/#toc-transferables
     * @see http://updates.html5rocks.com/2012/06/How-to-convert-ArrayBuffer-to-and-from-String
     * @function
     * @memberof Longo.Utils
     * @static
     * @param {String} str target string
     * @return {Uint16Array} buf encoded Uint16Array
     */
    str2ab: function(str) {
      var buf = new global.ArrayBuffer(str.length * 2); // 2 bytes for each char
      var bufView = new global.Uint16Array(buf);
      for (var i = 0, strLen = str.length; i < strLen; i++) {
        bufView[i] = str.charCodeAt(i);
      }
      return bufView;
    },

    /**
     * Browser-friendly inheritance fully compatible with standard node.js inherits<br>
     * This method have Side-effect
     * @see https://github.com/isaacs/inherits
     * @function
     * @memberof Longo.Utils
     * @static
     * @param {Function} ctor constructor
     * @return {Function} superCtor constructor of superClass
     */
    inherits: function(ctor, superCtor) {
      ctor._super = superCtor;
      ctor.prototype = Object.create(superCtor.prototype, {
        constructor: {
          value: ctor,
          enumerable: false,
          writable: true,
          configurable: true
        }
      });
    },

    /**
     * return prefixed logger.
     * @function
     * @memberof Longo.Utils
     * @static
     * @param {prefix}
     * @return {Object} logger
     */
    createLogger: function(prefix, loglevel) {
      var lookup = {
        "log":4,
        "debug":3,
        "info":2,
        "warn":1,
        "error":0,
      };
      var _logger = {
        log: function() {},
        debug: function() {},
        info: function() {},
        warn: function() {},
        error: function() {}
      };
      var level = lookup[loglevel+"".toLowerCase()] || 5;
      if (!wnd.console) return _logger;

      if (level > 3) {
        _logger.log = (function() {
          return wnd.console.log.bind(wnd.console, prefix);
        })();
      }

      if (level > 2) {
        _logger.debug = (function() {
          return wnd.console.debug.bind(wnd.console, prefix);
        })();
      }

      if (level > 1) {
        _logger.info = (function() {
          return wnd.console.info.bind(wnd.console, prefix);
        })();
      }

      if (level > 0) {
        _logger.warn = (function() {
          return wnd.console.warn.bind(wnd.console, prefix);
        })();
      }

      _logger.error = (function() {
        return wnd.console.error.bind(wnd.console, prefix);
      })();
      return _logger;
    },

    /**
     * Do nothing
     * @function
     * @memberof Longo.Utils
     * @static
     * @return undefined
     */
    noop: function() {
      return void 0;
    },


    /**
     * return noop as function.
     * @function
     * @memberof Longo.Utils
     * @static
     * @return {Function} Longo.Utils.noop
     */
    asNoop: function() {
      return Utils.noop;
    },

    /**
     * Alias for `Array.prototype.slice.apply`.
     * @function
     * @memberof Longo.Utils
     * @static
     * @param {Object} arguments argument object
     * @return {Array} result
     */
    aSlice: function(obj) {
      return Array.prototype.slice.apply(obj);
    },

    /**
     * return input as Array.
     * @function
     * @memberof Longo.Utils
     * @static
     * @param {Object} val
     * @return {Array} result
     */
    toArray: function(obj) {
      return _.isArray(obj) ? obj : [obj];
    },

    /**
     * return true if input is not `null` or `undefined`.
     * @function
     * @memberof Longo.Utils
     * @static
     * @param {Object} val
     * @return {Boolean} result
     */
    existy: function(val) {
      return val !== null && val !== undefined;
    },

    /**
     * return true if input is not `null` or `undefined` or `false`<br>
     * `0`, `-1`, `""` is detected as truthy
     * @function
     * @memberof Longo.Utils
     * @static
     * @param {Object} val
     * @return {Boolean} result
     */
    truthy: function(val) {
      return (val !== false) && Utils.existy(val);
    },

    /**
     * return true if input is the `true`
     * @function
     * @memberof Longo.Utils
     * @static
     * @param {Object} val
     * @return {Boolean} result
     */
    isTrue: function(val) {
      return val === true;
    },

    /**
     * return true if input is the `false`
     * @function
     * @memberof Longo.Utils
     * @static
     * @param {Object} val
     * @return {Boolean} result
     */
    isFalse: function(val) {
      return val === false;
    },

    /**
     * return true if input is less than 0
     * @function
     * @memberof Longo.Utils
     * @static
     * @param {Object} val
     * @return {Boolean} result
     */
    isNegativeNum: function(val) {
      return _.isNumber(val) && val < 0;
    },

    /**
     * return true if input is the 0
     * @function
     * @memberof Longo.Utils
     * @static
     * @param {Object} val
     * @return {Boolean} result
     */
    isZero: function(val) {
      return val === 0;
    },

    /**
     * return true if input is the 1
     * @function
     * @memberof Longo.Utils
     * @static
     * @param {Object} val
     * @return {Boolean} result
     */
    isOne: function(val) {
      return val === 1;
    },

    /**
     * return true if input is greater than 0
     * @function
     * @memberof Longo.Utils
     * @static
     * @param {Object} val
     * @return {Boolean} result
     */
    isPositiveNum: function(val) {
      return _.isNumber(val) && val > 0;
    },

    /**
     * execute action with values when condition is truthy
     * @function
     * @memberof Longo.Utils
     * @static
     * @param {Boolean} cond
     * @param {Function} action
     * @param {Array} values
     * @param {Object} context
     * @return {Any} result
     */
    doWhen: function(cond, action, values, context) {
      var arr = Utils.toArray(values);
      if (Utils.truthy(cond))
        return action.apply(context, arr);
      else
        return Utils.noop();
    },

    /**
     * execute action with values when condition is truthy else execute alternative
     * @function
     * @memberof Longo.Utils
     * @static
     * @param {Boolean} cond
     * @param {Function} action
     * @param {Function} alternative
     * @param {Array} values
     * @param {Object} context
     * @return {Any} result
     */
    doWhenOrElse: function(cond, action, alternative, values, context) {
      var arr = Utils.toArray(values);
      if (Utils.truthy(cond))
        return action.apply(context, arr);
      else
        return alternative.apply(context, arr);
    },

    /**
     * return input if input is existy else return els
     * @function
     * @memberof Longo.Utils
     * @static
     * @param {Object} val
     * @param {Object} els
     * @return {Any} result
     */
    getOrElse: function(val, els) {
      return Utils.existy(val) ? val : els;
    },

    /**
     * return val if result of input has been evaluated by predictor is truthy else return els
     * @function
     * @memberof Longo.Utils
     * @static
     * @param {Object} val
     * @param {Object} els
     * @param {Function} pred predictor
     * @return {Any} result
     */
    checkOrElse: function(val, els, pred) {
      return Utils.truthy(pred(val)) ? val : els;
    },

    /**
     * Try parse string to JSON object
     * @function
     * @memberof Longo.Utils
     * @static
     * @param {String} str JSON formated string
     * @return {Array} result A Tuple `[error, parsed]`
     */
    tryParseJSON: function(str) {
      var result = [null, null];
      try {
        result[1] = JSON.parse(str);
      } catch (e) {
        result[0] = new Longo.Error(Error.PARSE_ERROR, "Failed to parse: " + str, e.stack);
      }
      return result;
    },

    /**
     * Parse id to `Date` object
     * @function
     * @memberof Longo.Utils
     * @static
     * @param {String} id start with timestamp
     * @return {Date} result
     */
    dataFromId: function(id){
      return new Date(Number(id.substr(0,13)));
    }
  };

  Utils.inherits(Longo.Error, Error);

  /**
   * Longo use dom based EventEmitter by default.<br>
   * For better performance, please use Wolfy87's EventEmitter implementation.<br>
   * @see https://github.com/Wolfy87/EventEmitter
   * @class EventEmitter
   */
  var EventEmitter = Longo.EventEmitter;
  if (!wnd.EventEmitter){
    // Inner Classes
    EventEmitter = function() {
      this.dom = wnd.document.createDocumentFragment();
    };

    /**
     * @method
     * @memberof EventEmitter
     * @see https://developer.mozilla.org/en-US/docs/Web/API/EventTarget.addEventListener
     */
    EventEmitter.prototype.addEventListener = function() {
      this.dom.addEventListener.apply(this.dom, Longo.Utils.aSlice(arguments));
    };

    /**
     * @method
     * @memberof EventEmitter
     * @see https://developer.mozilla.org/en-US/docs/Web/API/EventTarget.removeEventListener
     */
    EventEmitter.prototype.removeEventListener = function() {
      this.dom.removeEventListener.apply(this.dom, Longo.Utils.aSlice(arguments));
    };

    /**
     * @method
     * @memberof EventEmitter
     * @see https://developer.mozilla.org/en-US/docs/Web/API/EventTarget.dispatchEvent
     */
    EventEmitter.prototype.dispatchEvent = function() {
      var args = Longo.Utils.aSlice(arguments),
        ev = args[0];
      if (!ev) return;
      if (ev.constructor.name !== "Event") {
        var cev = new global.CustomEvent(args[0].toString(), args[1]);
        cev.data = args.slice(1);
        args[0] = cev;
      }
      this.dom.dispatchEvent.apply(this.dom, args);
    };
    // alias

    /**
     * Alias for EventEmitter.addEventListener
     * @method
     * @memberof EventEmitter
     */
    EventEmitter.prototype.on = EventEmitter.prototype.addEventListener;
    /**
     * Alias for EventEmitter.addEventListener
     * @method
     * @memberof EventEmitter
     */
    EventEmitter.prototype.bind = EventEmitter.prototype.addEventListener;
    /**
     * Alias for EventEmitter.removeEventListener
     * @method
     * @memberof EventEmitter
     */
    EventEmitter.prototype.off = EventEmitter.prototype.removeEventListener;
    /**
     * Alias for EventEmitter.removeEventListener
     * @method
     * @memberof EventEmitter
     */
    EventEmitter.prototype.unbind = EventEmitter.prototype.removeEventListener;
    /**
     * Alias for EventEmitter.dispatchEvent
     * @method
     * @memberof EventEmitter
     */
    EventEmitter.prototype.emit = EventEmitter.prototype.dispatchEvent;
    /**
     * Alias for EventEmitter.dispatchEvent
     * @method
     * @memberof EventEmitter
     */
    EventEmitter.prototype.trigger = EventEmitter.prototype.dispatchEvent;

    if(wnd.console && wnd.console.warn) {
      wnd.console.warn(["[WARN]:EventEmitter is not imported.",
                 "Longo use dom based EventEmitter by default.",
                 "For better performance, please use Wolfy87's EventEmitter implementation.",
                 "https://github.com/Wolfy87/EventEmitter"].join(" "));
    }
  } else {
    EventEmitter = wnd.EventEmitter;
  }

  /**
   * Return Database instance.<br>
   * It is better to create database instance with {@link Longo.createDB} instead of `new` keyword.
   * @name Longo.DB
   * @class Database object
   * @param {String} name name of this database
   * @constructs
   * @private
   * @extends EventEmitter
   * @example
   * var db = Longo.createDB("test");
   */
  var DB = Longo.DB = function(name) {
    EventEmitter.call(this);
    this.name = name;
    this.lastError = null;
    this.currentOpId = null;
    this.collections = {};
    this.logger = Longo.Utils.createLogger("Longo." + name, Longo.LOGLEVEL);
  };
  Longo.Utils.inherits(DB, EventEmitter);

  /**
   * return array of collection names
   * @method
   * @memberof Longo.DB
   * @return {Array} names An array containing all collections in the existing database
   */
  Longo.DB.prototype.getCollectionNames = function() {
    return _.keys(this.collections);
  };

  /**
   * Returns a {@link Collection}
   * @method
   * @memberof Longo.DB
   * @param {String} name The name of the collection
   * @return {Collection}
   */
  Longo.DB.prototype.getCollection = function(name) {
    return this.collections[name] || this.collection(name);
  };

  /**
   * Creates a new {@link Collection} explicitly<br>
   * Because Longo creates a collection implicitly when the collection is first referenced in a command<br>
   * this method is used primarily for creating new capped collections.<br>
   * @method
   * @memberof Longo.DB
   * @param {String}  [name='temp'] The name of the collection to create.
   * @param {Object}  [option] Configuration options for creating a capped collection.
   * @param {Boolean} [option.capped = false] Enables a capped collection. To create a capped collection, specify true.
   *                                          If you specify true, you must also set a maximum size in the size field.
   * @param {Number}  [option.size = 1024*1024] Specifies a maximum size in bytes for a capped collection.
   *                                            The size field is required for capped collections.
   *                                            If capped is false, you can use this field will be ignored.
   * @param {Number}  [option.max = 1000] The maximum number of documents allowed in the capped collection.
   *                                      The size limit takes precedence over this limit.
   *                                      If a capped collection reaches its maximum size before it reaches the maximum number of documents,
   *                                      Longo removes old documents.
   *                                      If you prefer to use this limit, ensure that the size limit, which is required,
   *                                      is sufficient to contain the documents limit.
   *                                      If capped is false, you can use this field will be ignored.
   * @return {Collection} collection
   */
  Longo.DB.prototype.createCollection = function(name, option) {
    return this._createCollectionWithData(name, option);
  };

  /**
   * @private
   */
  Longo.DB.prototype._createCollectionWithData = function(name, option, dataset) {
    var cname = Utils.getOrElse(name, "temp") + "";
    var coll = new Collection(cname, option, this);
    coll.initialize(dataset);
    this.collections[cname] = coll;
    return coll;
  };

  /**
   * Return {@link Collection} instance<br>
   * You can use this method as a start of cursor function chain.<br>
   * If specified name of collection is not exist, Longo create new {@link Collection}.<br>
   * And when new collection is created,<br>
   * Longo search parsistant data from LocalStorage and initialize with that data.<br>
   *
   * @method
   * @memberof Longo.DB
   * @param {String} [name='temp'] The name of the collection to create.
   * @example
   *   var db = Longo.use("School");
   *   db.collection("students").save([{"name":"longo"},{"name":"mongo"},{"name":"underscore"}).done();
   *   db.collection("students").find({}).sort({"name":1}).limit(1).done();
   *
   */
  Longo.DB.prototype.collection = function(name) {
    var cname, lastData, initData;

    cname = Utils.getOrElse(name, "temp") + "";
    if (this.collections[cname]) return this.collections[cname];
    lastData = JSON.parse(localStorage.getItem("Longo:" + this.name + ":" + cname));
    initData = Utils.toArray(Utils.getOrElse(lastData, []));
    return this._createCollectionWithData(name, {}, initData);
  };

  /**
   * Removes the current database.
   * @method
   * @memberof Longo.DB
   */
  Longo.DB.prototype.dropDatabase = function() {
    _.each(_.values(this.collections), function(coll) {
      coll.drop().done();
    });

  };


  /**
   * Callback structure for {@link Longo.DB#cloneCollection}
   * @callback Longo.DB.cloneCollectionCallback
   * @param {Longo.Error} [error=null]      null when success
   * @param {Collection}  [collection=null] null when fail
   */

  /**
   * Create clone from existing {@link Collection}
   * @method
   * @memberof Longo.DB
   * @param  {String}   from          Collection name of Collection instance that holds dataset to copy.
   * @param  {String}   [name='temp'] Collection name that you want to clone.
   * @param  {Object}   [query={}]    A standard query document that limits the documents copied as part of the db.cloneCollection() operation.
   *                             All query selectors available to the find() are available here.
   * @param  {cloneCollectionCallback} [done=null] callback for result. See {@link Longo.DB.cloneCollectionCallback}
   * @return {String}   opId     id of this action
   */
  Longo.DB.prototype.cloneCollection = function(from, name, criteria, done) {
    var cname = Utils.getOrElse(name, "temp") + "";
    if (!_.isFunction(done)) done = Utils.noop;

    if (!this.collections[cname]) return done(new Longo.Error(Longo.Error.COLLECTION_ALREADY_EXISTS, "Collection is already exists! name: "+cname, null), null);

    if (!this.collections[from]) return done(null, this.createCollection(cname));

    var cloneCb = function(error, data) {
      if (Utils.existy(error)) return done(error, null);
      return done(null, this._createCollectionWithData(name, {}, data));
    };

    this.collection(from).find(criteria, {}).done(cloneCb);
  };

  /**
   * The db.currentOp() method can take no arguments, and it return just opId unlike MongoDB's currentOp
   * @method
   * @memberof Longo.DB
   * @return {String} currentOpId A last opId of this database instance.
   */
  Longo.DB.prototype.currentOp = function() {
    return this.currentOpId;
  };

  /**
   * Return last error message of this database instance
   * @method
   * @memberof Longo.DB
   * @return {String} lastError The last error message string
   */
  Longo.DB.prototype.getLastError = function() {
    return this.lastError.message;
  };

  /**
   * Return last error object of this database instance
   * @method
   * @memberof Longo.DB
   * @return {Error} lastError A full document with status information
   */
  Longo.DB.prototype.getLastErrorObj = function() {
    return this.lastError;
  };

  /**
   * Terminates an operation as specified by the operation ID.<br>
   * To find operations and their corresponding IDs, See {@link Longo.DB#currentOp}
   * @method
   * @memberof Longo.DB
   * @param {String} opId current opperation ID
   */
  Longo.DB.prototype.killOp = function(opId) {
    var tokens = opId.split[":"];
    if (this.collections[tokens[0]]) {
      delete this.collections[tokens[0]].cbs[[1]];
      delete this.collections[tokens[0]].observers[[1]];
    }
  };

  /**
   * Return the current database name.
   * @method
   * @memberof Longo.DB
   * @return {Error} name The current database name
   */
  Longo.DB.prototype.getName = function() {
    return this.name;
  };

  /**
   * Do not call this class with `new` from application.<br>
   * use {@link Longo.DB#createCollection} or {@link Longo.DB#collection} method.
   * @name Longo.Collection
   * @class Collection object
   * @param {String} [name='temp'] name of this collection
   * @param {Object} [option] config for capped collection
   * @param {Boolean} [option.capped = false] See {@link Longo.DB#createCollection}
   * @param {Number} [option.size = 1024*1024] See {@link Longo.DB#createCollection}
   * @param {Number} [option.max = 1000] See {@link Longo.DB#createCollection}
   * @param {DB} parent database instance
   * @constructs
   * @private
   * @extends EventEmitter
   * @example
   *   var db = Longo.createDB("test");
   *   db.createCollection("score");
   */
  var Collection = Longo.Collection = function(name, opt, db) {
    EventEmitter.call(this);
    var self = this;
    this.name = name;
    this.option = {
      "capped": opt.capped || false,
      "size": opt.size || 1024 * 1024,
      "max": opt.max || 1000,
      "storeFunction": false
    };
    this.db     = db;
    this.logger = Utils.createLogger("Longo." + this.db.name + "." + this.name, Longo.LOGLEVEL);
    this.cbs = {
      "-1": function(error){
        self.logger.error([
          "Error:Failed to detect specified callback.",
          "If you want to handle this error with your own listener,",
          "Use `db.collection('name').setDefaultErrorHandler(listner);`"
        ].join(""),
        error);
      }
    };
    this.observers = {};

    var worker = this.worker = new Worker(Longo.getRoot() + "/" + Longo.WORKERJS);

    worker.addEventListener("message", this.onMessage(), false);
    worker.addEventListener("error", this.onError(), false);
    this.status = Status.STARTED;
  };
  Utils.inherits(Collection, EventEmitter);

  /**
   * Set your own error handler.<br>
   * By default, Longo just log when some error happen.<br>
   * @method
   * @memberof Longo.Collection
   * @param {Function} func your error handler
   */
  Collection.prototype.setDefaultErrorHandler = function(func){
    this.cbs["-1"] = func;
  };

  Collection.prototype.onMessage = function() {
    var self = this;
    return function(e){
      var response, data, seq, error, result;
      self.logger.info("Response Received");

      response = Utils.tryParseJSON(Utils.ab2str(e.data));
      if (Utils.existy(response[0])) {
        error = parseError(response[0]);
        self.db.lastError = error;
        self.db.emit("error", error);
        self.emit("error", error);
        return self.logger.error("ERROR:Failed to parse WebWorker message", Longo.ErrorCds[error.code]);
      }
      data   = response[1] || {};
      seq    = data.seq || "-1";
      result = data.result;

      if (Utils.existy(data.error)) {
        error = parseError(data.error);
        self.db.lastError = error;
        self.db.emit("error", error);
        self.emit("error", error);
        self.logger.error("ERROR:Failed at worker", error);
      }

      if (data.isUpdated){
        _.each(_.values(self.observers), function(ob){
          self.send(ob.message, ob.func, false);
        });
        self.emit("updated");
      }
      self.logger.info("Trigger callback: ", self.name+":"+seq);
      Utils.doWhen(_.isFunction(self.cbs[seq]), self.cbs[seq], [null, result]);
    };
  };

  Collection.prototype.onError = function() {
    var self = this;
    return function(e){
      if (!Utils.existy(e.code)) e.code = Longo.Error.WEBWORKER_ERROR;
      self.db.lastError = e;
      self.db.emit("error", e);
      self.emit("error", e);
      self.logger.error(["Error:WebWorker Error!  Line ", e.lineno, " in ", e.filename, ": ", e.message].join(""));
      return self.cbs["-1"](e);
    };
  };

  Collection.prototype.isCapped = function() {
    return this.option.capped;
  };


  Collection.prototype.initialize = function(dataset) {
    var _dataset = Utils.checkOrElse(dataset, [], _.isArray);
    var msg = {
      "cmds": [{
        "cmd":"start",
        "name": this.name,
        "option": this.option,
        "dataset": _dataset
      }]
    };
    this.send(msg);
  };

  Collection.prototype.getNextSeq = function() {
    var seq = 0;
    var nextSeq = function() {
      seq++;
      return seq+"";
    };
    this.getNextSeq = nextSeq;
    return seq+"";
  };

  Collection.prototype.send = function(message, cb, observe) {
    var seq, callbackFunc, json, bytes, opId;
    callbackFunc = Utils.checkOrElse(cb, Utils.noop, _.isFunction);

    if (this.status !== Status.STARTED) return callbackFunc(Longo.Error.COLLECTION_NOT_STARTED, null);

    seq = this.getNextSeq();
    this.cbs[seq] = callbackFunc;
    message.seq = seq;

    if (this.option.storeFunction) {
      //http://stackoverflow.com/questions/5264916/convert-javascript-object-incl-functions-to-string
    }

    json = JSON.stringify(message);

    // Zero-Copy transfer
    // http://updates.html5rocks.com/2011/12/Transferable-Objects-Lightning-Fast
    bytes = Utils.str2ab(json);
    this.worker.postMessage(bytes, [bytes.buffer]);
    this.logger.info("New operation called: " + this.name + ":" + seq);

    if (observe){
      this.observers[seq] = {
        "message":message,
        "func":callbackFunc,
      };
      this.logger.info("New observer registerd: " + this.name + ":" + seq);
    }

    opId = this.name + ":" + seq;
    this.db.currentOpId = opId;
    return opId;
  };

  Collection.prototype.find = function(criteria, projection) {
    var cmds = [{
      "cmd": "find",
      "criteria": criteria
    }, {
      "cmd": "project",
      "projection": projection
    }];
    return new Cursor(this, cmds);
  };

  Collection.prototype.findOne = function(criteria, projection) {
    var cmds = [{
      "cmd": "find",
      "criteria": criteria
    }, {
      "cmd": "project",
      "projection": projection
    }, {
      "cmd": "limit",
      "value": 1
    }];
    return new Cursor(this, cmds);
  };

  Collection.prototype.aggregate = function(pipeline) {
    var key,
      cursor = new Cursor(this, []);
    _.each(pipeline, function(op) {
      key = _.keys(op)[0];
      switch (key) {
      case "$project":
        cursor = cursor.project(op[key]);
        break;
      case "$match":
        cursor = cursor.match(op[key]);
        break;
      case "$skip":
        cursor = cursor.skip(op[key]);
        break;
      case "$unwind":
        cursor = cursor.unwind(op[key]);
        break;
      case "$group":
        cursor = cursor.group(op[key]);
        break;
      case "$sort":
        cursor = cursor.sort(op[key]);
        break;
      default:
        //noop
      }
    });
    return cursor;
  };

  Collection.prototype.save = function(doc) {
    var cmd = {
      "cmd": "save",
      "doc": doc,
    };
    return new Cursor(this, cmd);
  };

  Collection.prototype.insert = function(doc) {
    var cmd = {
      "cmd": "insert",
      "doc": Utils.toArray(doc)
    };
    return new Cursor(this, cmd);
  };

  Collection.prototype.remove = function(criteria, justOne) {
    var cmd = {
      "cmd": "remove",
      "criteria": criteria,
      "justOne": justOne
    };
    return new Cursor(this, cmd);
  };

  Collection.prototype.update = function(criteria, update, option) {
    var cmd = {
      "cmd": "update",
      "criteria": criteria,
      "update": update,
      "option": option
    };
    return new Cursor(this, cmd);
  };

  Collection.prototype.drop = function() {
    this.emit("drop");
    this.worker.terminate();
    this.cbs = {};
    this.observers = {};
    delete this.db.collections[this.name];
    localStorage.setItem("Longo:" + this.db.name + ":" + this.name, []);
  };

  Collection.prototype.count = function() {
    var cmds = [{
      "cmd": "find",
      "criteria": {}
    }, {
      "cmd": "count",
    }];
    return new Cursor(this, cmds);
  };

  Collection.prototype.findAndModify = function() {

  };



  Collection.prototype.parsist = function(){
    var self = this;
    this.find({}).onValue(function(e, result){
      localStorage.setItem("Longo:" + self.db.name + ":" + self.name, JSON.stringify(result));
    });
  };

  Collection.prototype.copyTo = function() {};
  Collection.prototype.dataSize = function() {};
  Collection.prototype.copyTo = function() {};
  Collection.prototype.distinct = function() {};
  Collection.prototype.group = function() {};
  Collection.prototype.mapReduce = function() {};
  Collection.prototype.renameCollection = function(name) {
    this.db.collections[name] = this;
    delete this.db.collections[this.name];
    this.name = name;
    this.logger = Utils.createLogger("Longo." + this.db.name + "." + this.name, Longo.LOGLEVEL);
  };


  var Cursor = Longo.Cursor = function() {
    var args = Utils.aSlice(arguments);
    if (args[0] instanceof Cursor) {
      this.collection = args[0].collection;
      this.cmds = args[0].cmds;
      this.wrapCb = args[0].wrapCb;

      this.cmds.push(Utils.getOrElse(args[1], {}));
      if (_.isFunction(args[2])) this.wrapCb.push(args[2]);
    } else {
      this.collection = args[0];
      this.cmds = Utils.toArray(args[1]);
      this.wrapCb = Utils.toArray(Utils.getOrElse(args[2], Utils.noop));
    }
  };

  // for callback style
  Cursor.prototype.done = function(cb) {
    var self,
        message,
        callback,
        userCallback = Utils.checkOrElse(cb, Utils.noop, _.isFunction)
        ;
    self = this;
    message = {
      "cmds": this.cmds
    };
    callback = function() {
      var args = Utils.aSlice(arguments);
      _.invoke(self.wrapCb, "call");
      userCallback.apply(null, args);
    };

    return this.collection.send(message, callback);
  };

  // for reactive style
  Cursor.prototype.onValue = function(cb, skipDuplicates) {

    if (_.some([
      _.contains(_.keys(this.cmds), "save"),
      _.contains(_.keys(this.cmds), "insert"),
      _.contains(_.keys(this.cmds), "remove"),
      _.contains(_.keys(this.cmds), "update"),
      _.contains(_.keys(this.cmds), "drop")
    ])){
      this.collection.logger.warn("WARN:`onValue` is not supported for 'save','insert','remove','update','drop'. call `done` instead.");
      return this.done(cb);
    }

    var self,
        message,
        callback,
        userCallback = Utils.checkOrElse(cb, Utils.noop, _.isFunction)
        ;
    self = this;
    message = {
      "cmds": this.cmds
    };

    callback = (function() {
      var cache = null;
      return function(){
        var args = Utils.aSlice(arguments);
        _.invoke(self.wrapCb, "call");
        var hash = JSON.stringify(args[1]);
        if(!skipDuplicates || !_.isEqual(cache, hash)){
          cache = hash;
          userCallback.apply(null, args);
        }
      };
    })();

    return this.collection.send(message, callback, true);
  };

  Cursor.prototype.assign = function(elementSelector, template) {
    var target, cb;
    if (_.isFunction(elementSelector.html)) {
      cb = function(error, result){
        if (error) this.collection.logger.error("Error:Assign Result Error");
        console.log(result);
        elementSelector.html(template({"result":result}));
      };
    } else {
      target = document.querySelector(elementSelector);
      cb = function(error, result){
        if (error) this.collection.logger.error("Error:Assign Result Error");
        target.innerHTML = template({"result":result});
      };
    }
    return this.onValue(cb, true);
  };

  // Cursor.prototype.wrap = function(cb) {
  //   return new Cursor(this, {}, cb);
  // };

  Cursor.prototype.count = function() {
    var cmd = {
      "cmd": "count"
    };
    return new Cursor(this, cmd);
  };

  Cursor.prototype.forEach = function(func) {
    var cmd = {
      "cmd": "forEach",
      "func": "return " + func.toString() + ";"
    };
    return new Cursor(this, cmd);
  };

  Cursor.prototype.limit = function(num) {
    var cmd = {
      "cmd": "limit",
      "value": num
    };
    return new Cursor(this, cmd);
  };

  Cursor.prototype.map = function(func) {
    var cmd = {
      "cmd": "map",
      "func": "return " + func.toString() + ";"
    };
    return new Cursor(this, cmd);
  };

  Cursor.prototype.max = function(indexBounds) {
    var cmd = {
      "cmd": "max",
      "indexBounds": indexBounds || {}
    };
    return new Cursor(this, cmd);
  };

  Cursor.prototype.min = function(indexBounds) {
    var cmd = {
      "cmd": "min",
      "indexBounds": indexBounds || {}
    };
    return new Cursor(this, cmd);
  };

  Cursor.prototype.size = function() {
    var cmd = {
      "cmd": "size"
    };
    return new Cursor(this, cmd);
  };

  Cursor.prototype.skip = function(num) {
    var cmd = {
      "cmd": "skip",
      "value": num
    };
    return new Cursor(this, cmd);
  };

  Cursor.prototype.sort = function(sorter) {
    var cmd = {
      "cmd": "sort",
      "sorter": sorter
    };
    if (_.isFunction(sorter)) cmd.func = "return " + sorter.toString() + ";";
    return new Cursor(this, cmd);
  };

  Cursor.prototype.match = function(criteria) {
    var cmd = {
      "cmd": "find",
      "criteria": criteria
    };
    return new Cursor(this, cmd);
  };

  Cursor.prototype.project = function(projection) {
    var cmd = {
      "cmd": "project",
      "projection": projection
    };
    return new Cursor(this, cmd);
  };

  Cursor.prototype.unwind = function(projection) {
    var cmd = {
      "cmd": "unwind",
      "projection": projection
    };
    return new Cursor(this, cmd);
  };

  Cursor.prototype.group = function(grouping) {
    var cmd = {
      "cmd": "group",
      "grouping": grouping
    };
    return new Cursor(this, cmd);
  };


  /**
   * Return version of Longo module
   * @name Longo.getVersion
   * @function
   * @memberof Longo
   * @public
   */
  Longo.getVersion = function() {
    return Longo.VERSION;
  };

  /**
   * Set rootPath for longo modules<br>
   * This method will be called when window `load` event fired.
   *
   * @function
   * @memberof Longo
   * @public
   * @param {String} root Abstruct path of longo root
   * @example
   * Longo.setRoot("/javascript/vender/longo");
   */
  Longo.setRoot = function(root){
    if (_.isUndefined(root) || root instanceof wnd.Event) {
      root = "/Longo.js";
      var scripts = wnd.document.getElementsByTagName("script");
      var i = scripts.length;
      while (i--) {
        var match = scripts[i].src.match(/(^|.*)\/longo(\.min){0,}\.js$/);
        if (match) {
          root = match[1];
          if(match[2]) Longo.WORKERJS = "longoWorker.min.js";
          break;
        }
      }
    }
    if (Longo.LONGOROOT !== root) console.info("LONGOROOT is setted :" + root);
    Longo.LONGOROOT = root;
  };
  wnd.addEventListener("load", Longo.setRoot, false);

  /**
   * Return rootPath for longo modules
   * @name Longo.getRoot
   * @function
   * @memberof Longo
   * @public
   */
  Longo.getRoot = function(){
    return Longo.LONGOROOT;
  };

  /**
   * Force to use minified longoWorker module.
   * @function
   * @memberof Longo
   * @public
   */
  Longo.useMinified = function(){
    Longo.WORKERJS = "longoWorker.min.js";
  };

  /**
   * Set logging level.
   * @function
   * @memberof Longo
   * @public
   * @param {string} loglevel `log`,`debug`,`info`,`warn`,`error`
   */
  Longo.setLogLevel = function(level){
    Longo.LOGLEVEL = level;
  };

  /**
   * Return new database instance.<br>
   * If sepcifyed name database is already exists, return that database.
   * @name Longo.createDB
   * @function
   * @memberof Longo
   * @public
   * @param {String} [name='temp'] database name
   * @return {DB} db
   */
  Longo.createDB = (function() {
    var dbs = {};
    return function(name){
      var dname = Utils.getOrElse(name, "temp") + "";
      var db;
      if (_.has(dbs, dname)) return dbs[dname];
      db = new DB(dname);
      dbs[dname] = db;
      return db;
    };
  })();

  /**
   * Alias for Longo.createDB().
   * @name Longo.use
   * @function
   * @memberof Longo
   * @param {String} name database name
   * @return {DB} db
   * @example
   * var db = Longo.use("School");
   * db.collection("students").insert({name:"tome",score:100}).done();
   */
  Longo.use = Longo.createDB;

  global.Longo = Longo;

})(this);