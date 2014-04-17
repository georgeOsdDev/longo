/*
 * @project Longo.js
 * @desc Asynchronous local database with a flavor of FRP.
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
   * VERSION
   * @field
   * @memberOf Longo
   * @constant
   */
  var VERSION = Longo.VERSION = "0.1.0";

  /**
   * return version of Longo module
   * @name Longo.getVersion
   * @function
   * @memberOf Longo
   * @public
   */
  Longo.getVersion = function() {
    return VERSION;
  };

  /**
   * This value is automatically updated on window onload event.<br>
   * If you want to access DB object before window onload, <br>
   * be sure that set correct path with `setRoot`.
   *
   * @memberOf Longo
   * @default "/Longo.js"
   */
  Longo.LONGOROOT = "/Longo.js";

  /**
   * If you are using longo.min.js, this value will be replaced with "longoWorker.min.js"
   *
   * @memberOf Longo
   * @default "longoWorker.js"
   */
  Longo.WORKERJS  = "longoWorker.js";


  /**
   * Set rootPath for longo modules.
   *
   * @method setRoot
   * @memberOf Longo
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
   * Force load minified longoWorker module.
   * @method useMinified
   * @memberOf Longo
   * @public
   */
  Longo.useMinified = function(){
    Longo.WORKERJS = "longoWorker.min.js";
  };


  /**
   * STATUS
   * @memberOf Longo
   * @constant
   */
  var Status = Longo.Status = {
    "CREATED": 0,
    "STARTED": 1,
    "STOPPED": 2,
    "DELETED": 3
  };

  /**
   * @name Longo.Error
   * @class
   * @param {Number} code
   * @param {String} message
   * @param {Object} stack
   * @constructs
   */
  Longo.Error = function(code, message, stack) {
    this.code = code;
    this.message = message;
    this.stack = stack || (new Error().stack);
  };

  /**
   * UNEXPECTED_ERROR
   * @memberOf Longo.Error
   * @constant
   */
  Longo.Error.UNEXPECTED_ERROR = 1;
  /**
   * EXECUTION_ERROR
   * @memberOf Longo.Error
   * @constant
   */
  Longo.Error.EXECUTION_ERROR = 2;
  /**
   * WEBWORKER_ERROR
   * @memberOf Longo.Error
   * @constant
   */
  Longo.Error.WEBWORKER_ERROR = 3;
  /**
   * INVALID_QUERY
   * @memberOf Longo.Error
   * @constant
   */
  Longo.Error.INVALID_QUERY = 4;
  /**
   * COLLECTION_NOT_FOUND
   * @memberOf Longo.Error
   * @constant
   */
  Longo.Error.COLLECTION_NOT_FOUND = 5;
  /**
   * COLLECTION_ALREADY_EXISTS
   * @memberOf Longo.Error
   * @constant
   */
  Longo.Error.COLLECTION_ALREADY_EXISTS = 6;
  /**
   * COLLECTION_NOT_STARTED
   * @memberOf Longo.Error
   * @constant
   */
  Longo.Error.COLLECTION_NOT_STARTED = 7;
  /**
   * DUPLICATE_KEY_ERROR
   * @memberOf Longo.Error
   * @constant
   */
  Longo.Error.DUPLICATE_KEY_ERROR = 8;
  /**
   * DOCUMENT_NOT_FOUND
   * @memberOf Longo.Error
   * @constant
   */
  Longo.Error.DOCUMENT_NOT_FOUND = 9;
  /**
   * MOD_ID_NOT_ALLOWED
   * @memberOf Longo.Error
   * @constant
   */
  Longo.Error.MOD_ID_NOT_ALLOWED = 10;
  /**
   * NOT_SUPPOETRD
   * @memberOf Longo.Error
   * @constant
   */
  Longo.Error.NOT_SUPPOETRD = 11;
  /**
   * EVAL_ERROR
   * @memberOf Longo.Error
   * @constant
   */
  Longo.Error.EVAL_ERROR = 12;
  /**
   * INVALID_MODIFIER_SPECIFIED
   * @memberOf Longo.Error
   * @constant
   */
  Longo.Error.INVALID_MODIFIER_SPECIFIED = 13;

  Longo.ErrorCds = _.invert(Longo.Error);

  /**
   * @namespace
   * @name Longo.Utils
   * @memberOf Longo
   * @static
   */
  var Utils = Longo.Utils = {

    // For Zero-Copy
    // Convert ArrayBuffer to and from String
    // messageing(http://www.html5rocks.com/en/tutorials/webgl/typed_arrays/#toc-transferables)
    // http://updates.html5rocks.com/2012/06/How-to-convert-ArrayBuffer-to-and-from-String
    /**
     * ab2str for zero-copy
     * @function
     * @memberOf Longo.Utils
     * @static
     * @param {Object} buf
     * @return {String} str
     */
    ab2str: function(buf) {
      return String.fromCharCode.apply(null, new global.Uint16Array(buf));
    },

    str2ab: function(str) {
      var buf = new global.ArrayBuffer(str.length * 2); // 2 bytes for each char
      var bufView = new global.Uint16Array(buf);
      for (var i = 0, strLen = str.length; i < strLen; i++) {
        bufView[i] = str.charCodeAt(i);
      }
      return bufView;
    },

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

    createLogger: function(prefix) {
      var _logger = {
        log: function() {},
        error: function() {}
      };
      if (!wnd.console) return _logger;
      _logger.log = (function() {
        return wnd.console.log.bind(wnd.console, prefix);
      })();
      _logger.error = (function() {
        return wnd.console.error.bind(wnd.console, prefix);
      })();
      return _logger;
    },

    noop: function() {
      return void 0;
    },

    asNoop: function() {
      return Utils.noop;
    },

    aSlice: function(obj) {
      return Array.prototype.slice.apply(obj);
    },

    toArray: function(obj) {
      return _.isArray(obj) ? obj : [obj];
    },

    existy: function(val) {
      return val !== null && val !== undefined;
    },

    truthy: function(val) {
      return (val !== false) && Utils.existy(val);
    },

    isTrue: function(val) {
      return val === true;
    },

    isFalse: function(val) {
      return val === false;
    },

    isNegativeNum: function(val) {
      return _.isNumber(val) && val < 0;
    },

    isZero: function(val) {
      return val === 0;
    },

    isOne: function(val) {
      return val === 1;
    },

    isPositiveNum: function(val) {
      return _.isNumber(val) && val > 0;
    },

    doWhen: function(cond, action, values, context) {
      var arr = Utils.toArray(values);
      if (Utils.truthy(cond))
        return action.apply(context, arr);
      else
        return Utils.noop();
    },

    doWhenOrElse: function(cond, action, alternative, values, context) {
      var arr = Utils.toArray(values);
      if (Utils.truthy(cond))
        return action.apply(context, arr);
      else
        return alternative.apply(context, arr);
    },

    getOrElse: function(val, els) {
      return val ? val : els;
    },

    checkOrElse: function(val, els, condition) {
      return condition(val) ? val : els;
    },

    tryParseJSON: function(str) {
      var ret = [null, null];
      try {
        ret[1] = JSON.parse(str);
      } catch (e) {
        ret[0] = new Longo.Error(Error.PARSE_ERROR, "Failed to parse: " + str, e.stack);
      }
      return ret;
    },

    dataFromId: function(id){
      return new Date(Number(id.substr(0,13)));
    }

  };

  var EventEmitter;
  if (!wnd.EventEmitter){
    // Inner Classes
    EventEmitter = function() {
      this.dom = wnd.document.createDocumentFragment();
    };
    // https://developer.mozilla.org/en-US/docs/Web/API/EventTarget.addEventListener
    EventEmitter.prototype.addEventListener = function() {
      this.dom.addEventListener.apply(this.dom, Longo.Utils.aSlice(arguments));
    };
    // https://developer.mozilla.org/en-US/docs/Web/API/EventTarget.removeEventListener
    EventEmitter.prototype.removeEventListener = function() {
      this.dom.removeEventListener.apply(this.dom, Longo.Utils.aSlice(arguments));
    };
    // https://developer.mozilla.org/en-US/docs/Web/API/EventTarget.dispatchEvent
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
    EventEmitter.prototype.on = EventEmitter.prototype.addEventListener;
    EventEmitter.prototype.bind = EventEmitter.prototype.addEventListener;
    EventEmitter.prototype.off = EventEmitter.prototype.removeEventListener;
    EventEmitter.prototype.unbind = EventEmitter.prototype.removeEventListener;
    EventEmitter.prototype.emit = EventEmitter.prototype.dispatchEvent;
    EventEmitter.prototype.trigger = EventEmitter.prototype.dispatchEvent;

    console.warn(["[INFO]:EventEmitter is not imported.",
                 "Longo use dom based EventEmitter by default.",
                 "For better performance, please use Wolfy87's EventEmitter implementation.",
                 "https://github.com/Wolfy87/EventEmitter"].join(" "));
  } else {
    EventEmitter = wnd.EventEmitter;
  }


  /**
   * Database
   * @name Longo.DB
   * @class Create DB object with specified name
   * @param {String} name name of this database
   * @inherits EventEmitter
   */
  var DB = Longo.DB = function(name) {
    EventEmitter.call(this);
    this.name = name;
    this.lastError = null;
    this.collections = {};
    this.logger = Longo.Utils.createLogger("Longo." + name);
  };
  Longo.Utils.inherits(DB, EventEmitter);

  /**
   * @scope Longo.DB.prototype
   */
  DB.prototype.getCollectionNames = function() {
    return _.keys(this.collections);
  };

  DB.prototype.getCollection = function(name) {
    return this.collections[name];
  };

  DB.prototype.collection = function(name) {
    var cname, lastData, initData;

    cname = Utils.getOrElse(name, "temp") + "";
    if (this.collections[cname]) return this.collections[cname];
    lastData = JSON.parse(localStorage.getItem("Longo:" + this.name + ":" + cname));
    initData = Utils.toArray(Utils.getOrElse(lastData, []));
    return this.createCollection(name, {}, initData);
  };

  DB.prototype.createCollection = function(name, option, data) {
    var cname = Utils.getOrElse(name, "temp") + "";
    var coll = new Collection(cname, option, this);
    coll.initialize(data);
    this.collections[cname] = coll;
    return coll;
  };

  DB.prototype.dropDatabase = function() {
    _.each(_.values(this.collections), function(coll) {
      coll.drop().done();
    });
  };

  DB.prototype.getLastError = function() {
    return this.lastError;
  };

  /**
   * cloneCollection from
   * @param  {String}   from     from collection
   * @param  {String}   name     name of cloned collection
   * @param  {Object}   criteria criteria for finding documents from collection
   * @param  {Function} done                 collback
   *   @param {Number} [done.error]          error
   *   @param {Collection} [done.collection] cloned collection
   * @return {String}   opId                 id of this action
   */
  DB.prototype.cloneCollection = function(from, name, criteria, done) {
    var cname = Utils.getOrElse(name, "temp") + "";

    if (!this.collections[cname]) return done(Longo.Error.COLLECTION_ALREADY_EXISTS, null);

    if (!this.collections[from]) return done(null, this.createCollection(cname));

    var cloneCb = function(error, data) {
      if (error) return done(error, null);
      return done(null, this.createCollection(name, {}, data));
    };

    this.collection(from).find(criteria, {}).done(cloneCb);
  };

  // killOp is not kill operation but just delete callback
  DB.prototype.killOp = function(opId) {
    var tokens = opId.split[":"];
    if (this.collections[tokens[0]]) {
      delete this.collections[tokens[0]].cbs[[1]];
      delete this.collections[tokens[0]].observers[[1]];
    }
  };


  function Collection(name, opt, db) {
    EventEmitter.call(this);
    var self = this;
    this.name = name;
    this.option = {
      "capped": opt.capped || false,
      "size": opt.size || 1024 * 1024,
      "count": opt.count || 1000
    };
    this.db     = db;
    this.logger = Utils.createLogger("Longo." + db.name + "." + this.name);
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

    var worker = this.worker = new Worker(Longo.LONGOROOT + "/" + Longo.WORKERJS);

    worker.addEventListener("message", this.onMessage(), false);
    worker.addEventListener("error", this.onError(), false);
    this.status = Status.STARTED;
  }
  Utils.inherits(Collection, EventEmitter);

  Collection.prototype.setDefaultErrorHandler = function(func){
    this.cbs["-1"] = func;
  };

  Collection.prototype.onMessage = function() {
    var self = this;
    return function(e){
      var response, data, seq, error, result;

      response = Utils.tryParseJSON(Utils.ab2str(e.data));
      if (response[0]) {
        self.db.lastError = response[0];
        self.db.emit("error", response[0]);
        self.emit("error", response[0]);
        return self.logger.error("ERROR:Failed to parse WebWorker message", Longo.ErrorCds[response[0]]);
      }
      data   = response[1] || {};
      seq    = data.seq || "-1";
      error  = data.error || null;
      result = data.result;

      if (error) {
        self.db.lastError = error;
        self.db.emit("error", error);
        self.emit("error", error);
        self.logger.error("ERROR:Failed at worker", Longo.ErrorCds[error]);
      }
      if (data.isUpdated){
        _.each(_.values(self.observers), function(ob){
          self.send(ob.message, ob.func, false);
        });
      }

      Utils.doWhen(_.isFunction(self.cbs[seq]), self.cbs[seq], [error, result]);
      if (data.isUpdated) self.emit("updated", error);
    };
  };

  Collection.prototype.onError = function() {
    var self = this;
    return function(e){
      self.db.lastError = e;
      self.db.emit("error", e);
      self.emit("error", e);
      self.logger.error(["Error:Unexpected error!  Line ", e.lineno, " in ", e.filename, ": ", e.message].join(""));
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
    var seq, callbackFunc, json, bytes;
    callbackFunc = Utils.checkOrElse(cb, Utils.noop, _.isFunction);

    if (this.status !== Status.STARTED) return callbackFunc(Longo.Error.COLLECTION_NOT_STARTED, null);

    seq = this.getNextSeq();
    this.cbs[seq] = callbackFunc;
    message.seq = seq;
    json = JSON.stringify(message);

    // Zero-Copy transfer
    // http://updates.html5rocks.com/2011/12/Transferable-Objects-Lightning-Fast
    bytes = Utils.str2ab(json);
    this.worker.postMessage(bytes, [bytes.buffer]);

    if (observe){
      this.observers[seq] = {
        "message":message,
        "func":callbackFunc,
      };
    }

    return this.name + ":" + seq;
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
    this.logger = Utils.createLogger("Longo." + this.db.name + "." + this.name);
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
      this.collection.logger.log("WARN:`onValue` is not supported for 'save','insert','remove','update','drop'. call `done` instead.");
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

  global.Longo = Longo;

})(this);