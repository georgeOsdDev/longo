/*
 * @project Longo.js
 * @module longo
 * @desc Asynchronous local database with a flavor of FRP.
 * @requires {@linkplain http://underscorejs.org/|underscore}
 * @example
 * <caption>Longo needs some files. Root path(`Longo.LONGOROOT`) to longo components is defined as `/Longo.js`.<br>
 * If you use other path on your http(s) server, you need adjust change root path of Longo.</caption>
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

// For command line test
if (typeof require !== "undefined") {
  var _ = require("underscore");
  var EventEmitter = require("events").EventEmitter;
}

(function(global, _, EventEmitter, undefined) {
  "use strict";

  var wnd = global;
  var CHARS = "abcdefghijklmnopqrstuvwxyz0123456789".split("");


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
  Longo.WORKERJS = "longoWorker.js";

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

  function parseError(obj) {
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
  /**
   * PARSE_ERROR
   * @memberof Longo.Error
   * @constant
   */
  Longo.Error.PARSE_ERROR = 14;

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
      return String.fromCharCode.apply(null, new Uint16Array(buf));
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
      var buf = new ArrayBuffer(str.length * 2); // 2 bytes for each char
      var bufView = new Uint16Array(buf);
      for (var i = 0, strLen = str.length; i < strLen; i++) {
        bufView[i] = str.charCodeAt(i);
      }
      return bufView.buffer;
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
        "log": 4,
        "debug": 3,
        "info": 2,
        "warn": 1,
        "error": 0,
      };
      var _logger = {
        log: function() {},
        debug: function() {},
        info: function() {},
        warn: function() {},
        error: function() {}
      };
      var level = lookup[loglevel + "".toLowerCase()] || 5;
      if (!global.console) return _logger;

      if (level > 3 && global.console.log && global.console.log.bind) {
        _logger.log = (function() {
          return global.console.log.bind(global.console, prefix);
        })();
      }

      if (level > 2 && global.console.debug && global.console.debug.bind) {
        _logger.debug = (function() {
          return global.console.debug.bind(global.console, prefix);
        })();
      }

      if (level > 1 && global.console.info && global.console.info.bind) {
        _logger.info = (function() {
          return global.console.info.bind(global.console, prefix);
        })();
      }

      if (level > 0 && global.console.warn && global.console.warn.bind) {
        _logger.warn = (function() {
          return global.console.warn.bind(global.console, prefix);
        })();
      }

      if (global.console.error && global.console.error.bind) {
        _logger.error = (function() {
          return global.console.error.bind(global.console, prefix);
        })();
      }
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
        result[0] = new Longo.Error(Longo.Error.PARSE_ERROR, "Failed to parse: " + str, e.stack);
      }
      return result;
    },


    /**
     * Generate objectId
     * @function
     * @memberof Longo.Utils
     * @static
     * @param {String} [id=null]
     * @return {String} objectId if id is specified return that id
     */
    objectId: function(id) {
      return id ? id + "" : Date.now() + _.shuffle(CHARS).join("").substr(0, 11);
    },

    /**
     * Parse id to `Date` object
     * @function
     * @memberof Longo.Utils
     * @static
     * @param {String} id start with timestamp
     * @return {Date} result
     */
    dataFromId: function(id) {
      return new Date(Number(id.substr(0, 13)));
    },

    /**
     * Return uuid like random value
     * @function
     * @memberof Longo.Utils
     * @static
     * @return {String} uuid uuid like random value
     */
    uuid: (function() {
      var s4 = function() {
        return Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1);
      };
      return function() {
        return s4() + s4() + s4() + s4();
      };
    })(),

    /**
     * Return promise object
     * @function
     * @memberof Longo.Utils
     * @static
     * @param {function} f This function should call `done` and `reject`.
     * @return {Promise} promise thenable object
     */
    defer: function(f) {
      return new Promise(function(done, reject) {
        return f(done, reject);
      });
    },

    clone: function(obj) {
      if (null === obj || "object" !== typeof obj) return obj;
      var copy = obj.constructor();
      for (var attr in obj) {
        if (obj.hasOwnProperty(attr)) copy[attr] = obj[attr];
      }
      return copy;
    },

    deepClone: function(obj) {
      if (null === obj || "object" !== typeof obj) return obj;
      var copy = obj.constructor();
      for (var attr in obj) {
        if (obj.hasOwnProperty(attr)) {
          if (typeof obj[attr] === "object") {
            copy[attr] = Utils.deepClone(obj[attr]);
          } else {
            copy[attr] = obj[attr];
          }
        }
      }
      return copy;
    }

  };

  Utils.inherits(Longo.Error, Error);

  /**
   * Longo use dom based EventEmitter by default.<br>
   * For better performance, please use Wolfy87's EventEmitter implementation.<br>
   * @see https://github.com/Wolfy87/EventEmitter
   * @class EventEmitter
   */
  if (!EventEmitter) {
    // Inner Classes
    EventEmitter = function() {
      this.dom = wnd.document.createDocumentFragment();
      this.listners = {};
    };

    /**
     * @method
     * @memberof EventEmitter
     * @param {String} type A string representing the event type to listen for.
     * @param {Function} listner The object that receives a notification when an event of the specified type occurs.
     * @see https://developer.mozilla.org/en-US/docs/Web/API/EventTarget.addEventListener
     */
    EventEmitter.prototype.addEventListener = function() {
      this.dom.addEventListener.apply(this.dom, Longo.Utils.aSlice(arguments));
    };

    /**
     * @method
     * @memberof EventEmitter
     * @param {String} type A string representing the event type being removed.
     * @param {Function} listner The listener parameter indicates the EventListener function to be removed.
     * @see https://developer.mozilla.org/en-US/docs/Web/API/EventTarget.removeEventListener
     */
    EventEmitter.prototype.removeEventListener = function() {
      this.dom.removeEventListener.apply(this.dom, Longo.Utils.aSlice(arguments));
    };

    /**
     * @method
     * @memberof EventEmitter
     * @param {String} type dusoatch event type
     * @param {Object} data dispatch parameter
     * @see https://developer.mozilla.org/en-US/docs/Web/API/EventTarget.dispatchEvent
     * @see https://developer.mozilla.org/en-US/docs/Web/API/CustomEvent
     */
    EventEmitter.prototype.dispatchEvent = function() {
      var args = Longo.Utils.aSlice(arguments);
      if (!args[0]) return;
      if (args[0].constructor.name !== "Event" || args[0].constructor.name !== "CustomEvent") {
        var detail = (args[1] && args[1].detail) ? args[1].detail : args[1];
        var cev = new global.CustomEvent(args[0].toString(), {
          detail: detail
        });
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

    if (global.console && global.console.warn) {
      global.console.warn(["[WARN]:EventEmitter is not imported.",
        "Longo use dom based EventEmitter by default.",
        "For better performance, please use Wolfy87's EventEmitter implementation.",
        "https://github.com/Wolfy87/EventEmitter"
      ].join(" "));
    }
  }
  Longo.EventEmitter = EventEmitter;

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
    var opt = Utils.getOrElse(option, {});
    var coll = new Collection(cname, opt, this);
    coll._initialize(dataset);
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
    lastData = Utils.tryParseJSON((localStorage.getItem("Longo:" + this.name + ":" + cname)));
    initData = Utils.toArray(Utils.getOrElse(lastData[1], []));
    return this._createCollectionWithData(name, {}, initData);
  };

  /**
   * Removes the current database.
   * @method
   * @memberof Longo.DB
   */
  Longo.DB.prototype.dropDatabase = function() {
    _.each(_.values(this.collections), function(coll) {
      coll.drop();
    });
    Longo._dropDB(this.name);
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
  Longo.DB.prototype.cloneCollection = function(from, name, query, done) {
    var self = this;
    var cname = Utils.getOrElse(name, "temp") + "";
    if (!_.isFunction(done)) done = Utils.noop;

    if (this.collections[cname]) {
      var error = new Longo.Error(Longo.Error.COLLECTION_ALREADY_EXISTS, "Collection is already exists! name: " + cname, null);
      self.lastError = error;
      return done(error, null);
    }
    if (!this.collections[from]) return done(null, this.createCollection(cname));

    var cloneCb = function(error, data) {
      if (Utils.existy(error)) return done(error, null);
      return done(null, self._createCollectionWithData(cname, self.collections[from].option, data));
    };

    this.collection(from).find(query, {}).done(cloneCb);
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
    if (!this.lastError) return null;
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
      delete this.collections[tokens[0]].cbs[tokens[1]];
      delete this.collections[tokens[0]].observers[tokens[1]];
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
   * Callback structure for {@link Longo.Collection}
   * @callback Longo.Collection.collectionCallback
   * @param {Longo.Error} [error=null]  null when success
   * @param {Array}       [result=null] null when fail
   */

  /**
   * Do not call this class with `new` from application.<br>
   * use {@link Longo.DB#createCollection} or {@link Longo.DB#collection} method.
   * @name Longo.Collection
   * @class Collection object. Most collection methods return {@link Longo.Cursor} object.<br>
   *        In longo inspite of MongoDB, Cursor object does not have and reference to data.<br>
   *        You need to call `{@link Longo.Cursor#done}` or `{@link Longo.Cursor#onValue}` or `{@link Longo.Cursor#assign}`
   *        or `{@link Longo.Cursor#promise}` at the end of method chain.
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
    this.db = db;
    this.logger = Utils.createLogger("Longo." + this.db.name + "." + this.name, Longo.LOGLEVEL);
    this.cbs = {
      "-1": function(error) {
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
    this.worker.postMessage = worker.webkitPostMessage || worker.postMessage;

    worker.addEventListener("message", this._onMessage(), false);
    worker.addEventListener("error", this._onError(), false);
    this.status = Status.STARTED;
  };
  Utils.inherits(Collection, EventEmitter);

  /**
   * Return collection is capped.<br>
   * @method
   * @memberof Longo.Collection
   * @return {Boolean} isCapped
   */
  Longo.Collection.prototype.isCapped = function() {
    return this.option.capped;
  };

  /**
   * Set your own error handler.<br>
   * By default, Longo just log when some error happen.<br>
   * @method
   * @memberof Longo.Collection
   * @param {Function} func your error handler
   */
  Longo.Collection.prototype.setDefaultErrorHandler = function(func) {
    this.cbs["-1"] = func;
  };

  /**
   * Save collection snapshot to LocalStorage.<br>
   * If dataset in this collection changed, persisted data will be updated.<br>
   * @see {@link Longo.Collection#parsistOnce}
   * @method
   * @memberof Longo.Collection
   * @param {Function} func your error handler
   */
  Longo.Collection.prototype.parsist = function() {
    var self = this;
    this.find({}).onValue(function(e, result) {
      localStorage.setItem("Longo:" + self.db.name + ":" + self.name, JSON.stringify(result));
    });
  };

  /**
   * Save collection snapshot to LocalStorage.<br>
   * @see {@link Longo.Collection#parsist}
   * @method
   * @memberof Longo.Collection
   * @param {Function} func your error handler
   */
  Longo.Collection.prototype.parsistOnce = function() {
    var self = this;
    this.find({}).done(function(e, result) {
      localStorage.setItem("Longo:" + self.db.name + ":" + self.name, JSON.stringify(result));
    });
  };
  /**
   * This method handle message from WebWorker
   * @private
   */
  Longo.Collection.prototype._onMessage = function() {
    var self = this;
    return function(e) {
      var response, data, seq, error, result;
      response = Utils.tryParseJSON(Utils.ab2str(e.data));
      self.logger.info("Response Received", response);

      if (Utils.existy(response[0])) {
        error = parseError(response[0]);
        self.db.lastError = error;
        self.db.emit("error", error);
        self.emit("error", error);
        return self.logger.error("ERROR:Failed to parse WebWorker message", Longo.ErrorCds[error.code]);
      }
      data = response[1] || {};
      seq = data.seq || "-1";
      result = data.result;

      if (Utils.existy(data.error)) {
        error = parseError(data.error);
        self.db.lastError = error;
        self.db.emit("error", error);
        self.emit("error", error);
        self.logger.error("ERROR:Failed at worker", error);
        return Utils.doWhen(_.isFunction(self.cbs[seq]), self.cbs[seq], [error, null]);
      }

      if (data.isUpdated) {
        _.each(_.values(self.observers), function(ob) {
          self._send(ob.message, ob.func, false);
        });
        self.emit("updated");
      }
      self.logger.info("Trigger callback: ", self.name + ":" + seq);
      Utils.doWhen(_.isFunction(self.cbs[seq]), self.cbs[seq], [null, result]);
    };
  };

  /**
   * This method handle error from WebWorker
   * @private
   */
  Longo.Collection.prototype._onError = function() {
    var self = this;
    return function(e) {
      if (!Utils.existy(e.code)) e.code = Longo.Error.WEBWORKER_ERROR;
      self.db.lastError = e;
      self.db.emit("error", e);
      self.emit("error", e);
      self.logger.error(["Error:WebWorker Error!  Line ", e.lineno, " in ", e.filename, ": ", e.message].join(""));
      return self.cbs["-1"](e);
    };
  };

  /**
   * This method initialize collection with initial dataset
   * @private
   * @param [Array] dataset
   */
  Longo.Collection.prototype._initialize = function(dataset) {
    var _dataset = Utils.checkOrElse(dataset, [], _.isArray);
    var msg = {
      "cmds": [{
        "cmd": "start",
        "name": this.name,
        "option": this.option,
        "dataset": _dataset
      }]
    };
    this._send(msg);
  };

  /**
   * This method return seaquence
   * @private
   */
  Longo.Collection.prototype._getNextSeq = function() {
    var seq = 0;
    var nextSeq = function() {
      seq++;
      return seq + "";
    };
    this._getNextSeq = nextSeq;
    return seq + "";
  };

  /**
   * This method send message to WebWorker
   * @private
   * @param [Object] message
   * @param [Function] cb
   * @param [Boolean] observe
   */
  Longo.Collection.prototype._send = function(message, cb, observe) {
    var seq, callbackFunc, json, bytes, opId;
    callbackFunc = Utils.checkOrElse(cb, Utils.noop, _.isFunction);

    if (this.status !== Status.STARTED) return callbackFunc(Longo.Error.COLLECTION_NOT_STARTED, null);

    seq = this._getNextSeq();
    this.cbs[seq] = callbackFunc;
    message.seq = seq;

    if (this.option.storeFunction) {
      //http://stackoverflow.com/questions/5264916/convert-javascript-object-incl-functions-to-string
    }

    json = JSON.stringify(message);

    // Zero-Copy transfer
    // http://updates.html5rocks.com/2011/12/Transferable-Objects-Lightning-Fast
    bytes = Utils.str2ab(json);
    this.worker.postMessage(bytes, [bytes]);
    this.logger.info("New operation called: " + this.name + ":" + seq);

    if (observe) {
      this.observers[seq] = {
        "message": message,
        "func": callbackFunc,
      };
      this.logger.info("New observer registerd: " + this.name + ":" + seq);
    }

    opId = this.name + ":" + seq;
    this.db.currentOpId = opId;
    return opId;
  };

  /**
   * Selects documents in a collection and returns Cursor object.
   * @method
   * @memberof Longo.Collection
   * @param {Object} [query={}] Specifies selection query using query operators.
   *                               To return all documents in a collection, omit this parameter or pass an empty document ({}).
   *                               Specifies the fields to return using projection operators.
   * @param {Object} [projection]  To return all fields in the matching document, omit this parameter.
   * @return {Cursor} cursor Cursor object
   */
  Longo.Collection.prototype.find = function(query, projection) {
    var cmds = [{
      "cmd": "find",
      "query": query
    }, {
      "cmd": "project",
      "projection": projection
    }];
    return new Cursor(this, cmds);
  };

  /**
   * Returns one document that satisfies the specified query query.
   * If multiple documents satisfy the query, this method returns the first document according to the natural order
   * which reflects the order of documents on the memory.
   * In capped collections, natural order is the same as insertion order.
   *
   * @method
   * @memberof Longo.Collection
   * @param {Object} [query={}] Specifies selection query using query operators.
   *                               To return all documents in a collection, omit this parameter or pass an empty document ({}).
   *                               Specifies the fields to return using projection operators.
   * @param {Object} [projection]  To return all fields in the matching document, omit this parameter.
   * @return {Cursor} cursor Cursor object
   */
  Longo.Collection.prototype.findOne = function(query, projection) {
    var cmds = [{
      "cmd": "find",
      "query": query
    }, {
      "cmd": "project",
      "projection": projection
    }, {
      "cmd": "limit",
      "value": 1
    }];
    return new Cursor(this, cmds);
  };

  Longo.Collection.prototype.aggregate = function(pipeline) {
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

  /**
   * Updates an existing document or inserts a new document, depending on its document parameter.
   *
   * <b>Insert</b><br>
   * If the document does not contain an _id field, then the save() method performs an insert().<br>
   * During the operation, the longo will create an ObjectId and assign it to the _id field.<br>
   *
   * <b>Upsert</b><br>
   * If the document contains an _id field, then the save() method performs an update with upsert, querying by the _id field.<br>
   * If a document does not exist with the specified _id value, the save() method performs an insert.<br>
   * If a document exists with the specified _id value,<br>
   * the save() method performs an update that replaces all fields in the existing document with the fields from the document.<br>
   *
   * @method
   * @memberof Longo.Collection
   * @param {Object} doc A document to save to the collection.
   * @return {Cursor} cursor Cursor object
   */
  Longo.Collection.prototype.save = function(doc) {
    var cmd = {
      "cmd": "save",
      "doc": doc,
    };
    return new Cursor(this, cmd);
  };

  /**
   * Inserts a document or documents into a collection.
   * Different from MongoDB, this method does not accept second parameter for option.
   * @method
   * @memberof Longo.Collection
   * @param {Object | Array} document A document or array of documents to insert into the collection.
   * @return {Cursor} cursor Cursor object
   */
  Longo.Collection.prototype.insert = function(document) {
    var cmd = {
      "cmd": "insert",
      "doc": Utils.toArray(document)
    };
    return new Cursor(this, cmd);
  };

  /**
   * Removes documents from a collection.
   * @method
   * @memberof Longo.Collection
   * @param {Object} query Specifies deletion query using query operators.
   *                       To delete all documents in a collection, pass an empty document ({}).
   * @param {Boolean} [justOne] To limit the deletion to just one document, set to true.
   *                            Omit to use the default value of false and delete all documents matching the deletion query.
   * @return {Cursor} cursor Cursor object
   */
  Longo.Collection.prototype.remove = function(query, justOne) {
    var cmd = {
      "cmd": "remove",
      "query": query,
      "justOne": justOne
    };
    return new Cursor(this, cmd);
  };

  /**
   * Modifies an existing document or documents in a collection.<br>
   * The method can modify specific fields of existing document or documents or replace an existing document entirely,<br>
   * depending on the update parameter.<br>
   * By default, the update() method updates a single document.<br>
   * Set the Multi Parameter to update all documents that match the query criteria.<br>
   * @method
   * @memberof Longo.Collection
   * @param {Object} query The selection criteria for the update.
   *                       Use the same query selectors as used in the find() method.
   * @param {Object} update The modifications to apply.
   * @param {Object} [option] option.
   * @param {Boolean} [option.upsert = false] If set to true, creates a new document when no document matches the query criteria.
   *                                          which does not insert a new document when no match is found.
   * @param {Boolean} [option.multi = false] If set to true, updates multiple documents that meet the query criteria.
   *                                         If set to false, updates one document.
   * @return {Cursor} cursor Cursor object
   */
  Longo.Collection.prototype.update = function(query, update, option) {
    var cmd = {
      "cmd": "update",
      "query": query,
      "update": update,
      "option": option
    };
    return new Cursor(this, cmd);
  };

  /**
   * Drop collection from database.<br>
   * @method
   * @memberof Longo.Collection
   */
  Longo.Collection.prototype.drop = function() {
    this.emit("drop");
    this.worker.terminate();
    this.cbs = {};
    this.observers = {};
    delete this.db.collections[this.name];
    localStorage.setItem("Longo:" + this.db.name + ":" + this.name, []);
  };

  /**
   * Returns the count of documents that would match a {@link Longo.Collection#find} query.
   * @method
   * @memberof Longo.Collection
   * @param {Object} query The query selection query.
   * @return {Cursor} cursor Cursor object
   */
  Longo.Collection.prototype.count = function(query) {
    var cmds = [{
      "cmd": "find",
      "query": query
    }, {
      "cmd": "count",
    }];
    return new Cursor(this, cmds);
  };

  /**
   * Return the size of the collection.
   * @method
   * @memberof Longo.Collection
   * @return {Cursor} cursor Cursor object
   */
  Longo.Collection.prototype.dataSize = function() {
    var cmds = [{
      "cmd": "size",
    }];
    return new Cursor(this, cmds);
  };

  /**
   * Return the total size of the data in the collection.
   * As same as {@link Longo.Collection#dataSize}
   * @method
   * @memberof Longo.Collection
   * @return {Cursor} cursor Cursor object
   */
  Longo.Collection.prototype.totalSize = Longo.Collection.prototype.dataSize;

  /**
   * Copies all documents from collection into newCollection.<br>
   * If newCollection does not exist, MongoDB creates it.
   * {@link Longo.Collection.collectionCallback} will be called with the number of documents copied.<br>
   * If the copy fails, it will be called with the error.
   * @method
   * @memberof Longo.Collection
   * @param {String} newCollection Name of destination Collection.
   * @param {Object} query The query selection query.
   * @param  {collectionCallback} [done=null] callback for result. See {@link Longo.Collection.collectionCallback}
   * @return {String} opId
   */
  Longo.Collection.prototype.copyTo = function(newCollection, done) {
    var self = this;
    return this.db.cloneCollection(this, newCollection + "", {}, function(error, newColl) {
      if (error) {
        return self.find({}).done(function(error2, result2) {
          if (error2) return done(error2);
          return self.db.collection(newCollection + "").save(result2).done(function(error3) {
            if (error3) return done(error3);
            return self.db.collection(newCollection + "").count().dene(done);
          });
        });
      } else {
        return newColl.count().done(done);
      }
    });
  };

  /**
   * Changes the name of an existing collection
   * This method have side effect
   * @method
   * @memberof Longo.Collection
   * @param {String} The new name of the collection.
   */
  Longo.Collection.prototype.renameCollection = function(name) {
    this.db.collections[name] = this;
    delete this.db.collections[this.name];
    this.name = name;
    this.logger = Utils.createLogger("Longo." + this.db.name + "." + this.name, Longo.LOGLEVEL);
  };

  // @TODO
  Longo.Collection.prototype.distinct = function() {};
  Longo.Collection.prototype.findAndModify = function() {};
  Longo.Collection.prototype.group = function() {};
  Longo.Collection.prototype.mapReduce = function() {};



  /**
   * Callback structure for {@link Longo.Cursor}
   * @callback Longo.Cursor.cursorCallback
   * @param {Longo.Error} [error=null]  null when success
   * @param {Array}       [result=null] null when fail
   */

  /**
   * Do not call this class with `new` from application.<br>
   * @name Longo.Cursor
   * @class Cursor object with command stack.<br>
   * Cursor itself does not have, reference to result dataset.<br>
   * All stacked command will never triggerd until receiver method will be called.<br>
   * Asynchronously ,result dataset will be passed to receiver.<br>
   * @see {@link Longo.Cursor.done}
   * @see {@link Longo.Cursor.onValue}
   * @see {@link Longo.Cursor.assign}
   * @see {@link Longo.Cursor.promise}
   * @constructs
   * @private
   */
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

  /**
   * Handle result set of query with Node.js callback style receiver
   * @method
   * @memberof Longo.Cursor
   * @param  {cursorCallback} cb callback for result. See {@link Longo.Cursor.cursorCallback}
   * @return {String} opId operation id
   */
  Longo.Cursor.prototype.done = function(cb) {
    var self,
      message,
      callback,
      userCallback = Utils.checkOrElse(cb, Utils.noop, _.isFunction);
    self = this;
    message = {
      "cmds": this.cmds
    };
    callback = function() {
      var args = Utils.aSlice(arguments);
      _.invoke(self.wrapCb, "call");
      userCallback.apply(null, args);
    };

    return this.collection._send(message, callback);
  };

  /**
   * Handle result set of query with Node.js callback style receiver<br>
   * And observe collection with same query, callback will be executed when collection changed.
   * @method
   * @memberof Longo.Cursor
   * @param  {cursorCallback} cb callback for result. See {@link Longo.Cursor.cursorCallback}
   * @param  {Boolean} [skipDuplicates=false] skipDuplicate Set true if you do not want to receive duplicate resultset.
   * @return {String} opId operation id
   */
  Longo.Cursor.prototype.onValue = function(cb, skipDuplicates) {

    if (_.some([
      _.contains(_.keys(this.cmds), "save"),
      _.contains(_.keys(this.cmds), "insert"),
      _.contains(_.keys(this.cmds), "remove"),
      _.contains(_.keys(this.cmds), "update"),
      _.contains(_.keys(this.cmds), "drop")
    ])) {
      this.collection.logger.warn("WARN:`onValue` is not supported for 'save','insert','remove','update','drop'. call `done` instead.");
      return this.done(cb);
    }

    var self,
      message,
      callback,
      userCallback = Utils.checkOrElse(cb, Utils.noop, _.isFunction);
    self = this;
    message = {
      "cmds": this.cmds
    };

    callback = (function() {
      var cache = null;
      return function() {
        var args = Utils.aSlice(arguments);
        _.invoke(self.wrapCb, "call");
        var hash = JSON.stringify(args[1]);
        if (!skipDuplicates || !_.isEqual(cache, hash)) {
          cache = hash;
          userCallback.apply(null, args);
        }
      };
    })();

    return this.collection._send(message, callback, true);
  };

  /**
   * Assign result set to dom element with template.<br>
   * And observe collection change.<br>
   * @method
   * @memberof Longo.Cursor
   * @param  {String} elementSelector ElementSelector string or jQuery object Example: "p.myClass" , $("#myId")
   * @param  {Function} template underscore.js template
   * @return {String} opId operation id
   * @example
   * <caption>See live <a href="http://georgeosddev.github.io/longo/example/assign/" target="_blank">example</a> for more detail.<caption>
   * var db = Longo.use("example");
   * var tpl = _.template($("#resultTpl").html());
   * db.collection("output").find({}).sort({"value":-1}).assign($("#out"), tpl);
   */
  Longo.Cursor.prototype.assign = function(elementSelector, template) {
    var target, cb;
    if (_.isFunction(elementSelector.html)) {
      cb = function(error, result) {
        if (error) return this.collection.logger.error("Error:Assign Result Error");
        elementSelector.html(template({
          "result": result
        }));
      };
    } else {
      target = document.querySelector(elementSelector);
      cb = function(error, result) {
        if (error) return this.collection.logger.error("Error:Assign Result Error");
        target.innerHTML = template({
          "result": result
        });
      };
    }
    return this.onValue(cb, true);
  };


  /**
   * Return `{@linkplain https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise | Promise}` object for query.<br>
   * You can access result with `then` or error with `catch` method.<br>
   * This method does not return opId.
   * @method
   * @memberof Longo.Cursor
   * @return {Promise} promise object
   */
  Longo.Cursor.prototype.promise = function() {
    var self = this;
    return new Promise(function(resolve, reject) {
      var callback = function() {
        var args = Utils.aSlice(arguments);
        _.invoke(self.wrapCb, "call");
        if (args[0]) {
          reject(args[0]);
        } else {
          resolve(args[1]);
        }
      };
      self.collection._send({
        cmds: self.cmds
      }, callback);
    });
  };


  /**
   * Counts the number of documents referenced by a cursor.<br>
   * Append the count() method to a {@link Longo.Collection#find} query to return the number of matching documents.<br>
   * The operation does not perform the query but instead counts the results that would be returned by the query.<br>
   * Diffeer from MongoShell, `count` does not take `applySkipLimit` parameter.<br>
   * So this method is as same as {@link Longo.Cursor#size}
   * @see {@link Longo.Cursor#size}
   * @method
   * @memberof Longo.Cursor
   * @return {Cursor} cursor Cursor object
   */
  Longo.Cursor.prototype.count = function() {
    var cmd = {
      "cmd": "count"
    };
    return new Cursor(this, cmd);
  };

  /**
   * Iterates the cursor to apply a JavaScript function to each document from the cursor.<br>
   * The `func` will be evaluate at Worker Thread. You should care for limitation of WebWorker.<br>
   * If you want to work at Main-Thread, You can use simply use `_.forEach` to result set in `done` function.<br>
   * @method
   * @memberof Longo.Cursor
   * @func {Function} func javascript function
   * @return {Cursor} cursor Cursor object
   */
  Longo.Cursor.prototype.forEach = function(func) {
    var cmd = {
      "cmd": "forEach",
      "func": "return " + func.toString() + ";"
    };
    return new Cursor(this, cmd);
  };

  /**
   * Use the limit() method on a cursor to specify the maximum number of documents the cursor will return.
   * @method
   * @memberof Longo.Cursor
   * @param {Number} num limit
   * @return {Cursor} cursor Cursor object
   */
  Longo.Cursor.prototype.limit = function(num) {
    var cmd = {
      "cmd": "limit",
      "value": num
    };
    return new Cursor(this, cmd);
  };

  /**
   * Applies function to each document visited by the cursor<br>
   * and collects the return values from successive application into an array.<br>
   * The `func` will be evaluate at Worker Thread. You should care for limitation of WebWorker.<br>
   * If you want to work at Main-Thread, You can use simply use `_.map` to result set in `done` function.<br>
   * @method
   * @memberof Longo.Cursor
   * @func {Function} func javascript function
   * @return {Cursor} cursor Cursor object
   */
  Longo.Cursor.prototype.map = function(func) {
    var cmd = {
      "cmd": "map",
      "func": "return " + func.toString() + ";"
    };
    return new Cursor(this, cmd);
  };

  /**
   * Specifies the exclusive upper bound for a specific field in order to constrain the results of {@link Longo.Collection#find}().<br>
   * max() provides a way to specify an upper bound on compound field.
   * @see {@link Longo.Cursor#min}
   * @method
   * @memberof Longo.Cursor
   * @param {Object} indexBounds The exclusive upper bound for the field
   * @return {Cursor} cursor Cursor object
   */
  Longo.Cursor.prototype.max = function(indexBounds) {
    var cmd = {
      "cmd": "max",
      "indexBounds": indexBounds || {}
    };
    return new Cursor(this, cmd).limit(1);
  };

  /**
   * Specifies the inclusive lower bound for a specific field in order to constrain the results of {@link Longo.Collection#find}().<br>
   * min() provides a way to specify lower bounds on compound field.
   * @see {@link Longo.Cursor#max}
   * @method
   * @memberof Longo.Cursor
   * @param {Object} indexBounds The exclusive lower bound for the field
   * @return {Cursor} cursor Cursor object
   */
  Longo.Cursor.prototype.min = function(indexBounds) {
    var cmd = {
      "cmd": "min",
      "indexBounds": indexBounds || {}
    };
    return new Cursor(this, cmd).limit(1);
  };

  /**
   * A count of the number of documents that match the {@link Longo.Collection#find}() query<br>
   * after applying any cursor.skip() and cursor.limit() methods.
   * @method
   * @memberof Longo.Cursor
   * @see {@link Longo.Cursor#count}
   * @return {Cursor} cursor Cursor object
   */
  Longo.Cursor.prototype.size = function() {
    var cmd = {
      "cmd": "count"
    };
    return new Cursor(this, cmd);
  };

  /**
   * Call the cursor.skip() method on a cursor to control where MongoDB begins returning results.<br>
   * This approach may be useful in implementing `paged` results.
   * @method
   * @memberof Longo.Cursor
   * @param {Number} num the number to skip
   * @return {Cursor} cursor Cursor object
   */
  Longo.Cursor.prototype.skip = function(num) {
    var cmd = {
      "cmd": "skip",
      "value": num
    };
    return new Cursor(this, cmd);
  };

  /**
   * Specifies the order in which the query returns matching documents. You must apply sort().
   * You can use sorter in two style.<br>
   * 1.field and value pairs: in this style, value must be `1` or `-1`
   * 2.function: the function which will be applyed to result set as `_.sort(dataset, sorter)`
   * @method
   * @memberof Longo.Cursor
   * @param {Object | Function} sorter see avobe
   * @return {Cursor} cursor Cursor object
   */
  Longo.Cursor.prototype.sort = function(sorter) {
    var cmd = {
      "cmd": "sort",
      "sorter": sorter
    };
    if (_.isFunction(sorter)) cmd.sorter = "return " + sorter.toString() + ";";
    return new Cursor(this, cmd);
  };

  /**
   * @private
   */
  Longo.Cursor.prototype.match = function(query) {
    var cmd = {
      "cmd": "find",
      "query": query
    };
    return new Cursor(this, cmd);
  };

  /**
   * @private
   */
  Longo.Cursor.prototype.project = function(projection) {
    var cmd = {
      "cmd": "project",
      "projection": projection
    };
    return new Cursor(this, cmd);
  };

  /**
   * @private
   */
  Longo.Cursor.prototype.unwind = function(projection) {
    var cmd = {
      "cmd": "unwind",
      "projection": projection
    };
    return new Cursor(this, cmd);
  };

  /**
   * @private
   */
  Longo.Cursor.prototype.group = function(grouping) {
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
  Longo.setRoot = function(root) {
    if (_.isUndefined(root) || root instanceof global.Event) {
      root = "/Longo.js";
      var scripts = wnd.document.getElementsByTagName("script");
      var i = scripts.length;
      while (i--) {
        var match = scripts[i].src.match(/(^|.*)\/longo(\.min){0,}\.js(\?.*)?$/);
        if (match) {
          root = match[1];
          if (match[2]) Longo.WORKERJS = "longoWorker.min.js"; // use min
          if (match[3]) Longo.WORKERJS = Longo.WORKERJS + match[3]; // no cache
          break;
        }
      }
    }
    if (Longo.LONGOROOT !== root) console.info("LONGOROOT is setted :" + root);
    Longo.LONGOROOT = root;
  };
  if (wnd.addEventListener) wnd.addEventListener("load", Longo.setRoot, false);

  /**
   * Return rootPath for longo modules
   * @name Longo.getRoot
   * @function
   * @memberof Longo
   * @public
   */
  Longo.getRoot = function() {
    return Longo.LONGOROOT;
  };

  /**
   * Force to use minified longoWorker module.
   * @function
   * @memberof Longo
   * @public
   */
  Longo.useMinified = function() {
    Longo.WORKERJS = "longoWorker.min.js";
  };

  /**
   * Set logging level.
   * @function
   * @memberof Longo
   * @public
   * @param {string} loglevel `log`,`debug`,`info`,`warn`,`error`
   */
  Longo.setLogLevel = function(level) {
    Longo.LOGLEVEL = level;
  };


  (function() {
    var dbs = {};

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
    Longo.createDB = function(name) {
      var dname = Utils.getOrElse(name, "temp") + "";
      var db;
      if (_.has(dbs, dname)) return dbs[dname];
      db = new DB(dname);
      dbs[dname] = db;
      return db;
    };

    /**
     * @private
     */
    Longo._dropDB = function(name) {
      if (dbs[name]) delete dbs[name];
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

  if (typeof exports !== "undefined") {
    if (typeof module !== "undefined" && module.exports) {
      module.exports = Longo;
    }
    exports.Longo = Longo;
  } else {
    global.Longo = Longo;
  }

})(this, _, (typeof EventEmitter !== undefined) ? EventEmitter : undefined);