/*
 * longo
 * https://github.com/georgeOsdDev/Longo
 *
 * @license   The MIT License (MIT)
 * @copyright Copyright (c) 2014 Takeharu Oshida <georgeosddev@gmail.com>
 */
(function(global, undefined) {
  "use strict";
  var wnd = global;

  // namespace
  var Longo = global.Longo = {};

  var VERSION = Longo.VERSION = "0.1.0";

  Longo.getVersion = function() {
    return VERSION;
  };


  Longo.setRoot = function(root){
    if (!root) {
      root = "/Longo";
      var scripts = wnd.document.getElementsByTagName("script");
      var i = scripts.length;
      while (i--) {
        var match = scripts[i].src.match(/(^|.*)\/longo(\.min){0,}\.js$/);
        if (match) {
          root = match[1];
          break;
        }
      }
    }
    Longo.LONGOROOT = root;
  };
  wnd.addEventListener("load", Longo.setRoot);

  var Status = Longo.Status = {
    "CREATED": 0,
    "STARTED": 1,
    "STOPPED": 2,
    "DELETED": 3
  };

  Longo.Error = function(code, message, stack) {
    this.code = code;
    this.message = message;
    this.stack = stack || (new Error().stack);
  };
  Longo.Error.UNEXPECTED_ERROR = 1;
  Longo.Error.EXECUTION_ERROR = 2;
  Longo.Error.WEBWORKER_ERROR = 3;
  Longo.Error.INVALID_QUERY = 4;
  Longo.Error.COLLECTION_NOT_FOUND = 5;
  Longo.Error.COLLECTION_IS_ALREADY_EXISTS = 6;
  Longo.Error.COLLECTION_IS_NOT_STARTED = 7;
  Longo.Error.DUPLICATE_KEY_ERROR = 8;
  Longo.Error.DOCUMENT_NOT_FOUND = 9;
  Longo.Error.MOD_ID_NOT_ALLOWED = 10;
  Longo.Error.NOT_SUPPOETRD = 10;


  var Utils = Longo.Utils = {

    // For Zero-Copy
    // Convert ArrayBuffer to and from String
    // messageing(http://www.html5rocks.com/en/tutorials/webgl/typed_arrays/#toc-transferables)
    // http://updates.html5rocks.com/2012/06/How-to-convert-ArrayBuffer-to-and-from-String
    ab2str: function(buf) {
      return String.fromCharCode.apply(null, new Uint16Array(buf));
    },

    str2ab: function(str) {
      var buf = new ArrayBuffer(str.length * 2); // 2 bytes for each char
      var bufView = new Uint16Array(buf);
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
      if (!console) return _logger;
      _logger.log = (function() {
        console.log.bind(console, prefix);
      })();
      _logger.error = (function() {
        console.error.bind(console, prefix);
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
    }
  };


  // Inner Classes

  function EventEmitter() {
    this.dom = window.document.createDocumentFragment();
  }
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
    args[0] = (ev.constructor.name === "Event") ? args[0] : new CustomEvent(args[0].toString(), args[1]);
    this.dom.dispatchEvent.apply(this.dom, args);
  };
  // alias
  EventEmitter.prototype.on = EventEmitter.prototype.addEventListener;
  EventEmitter.prototype.bind = EventEmitter.prototype.addEventListener;
  EventEmitter.prototype.off = EventEmitter.prototype.removeEventListener;
  EventEmitter.prototype.unbind = EventEmitter.prototype.removeEventListener;
  EventEmitter.prototype.emit = EventEmitter.prototype.dispatchEvent;
  EventEmitter.prototype.trigger = EventEmitter.prototype.dispatchEvent;


  /**
   * DB Constructor
   *
   * @class
   * @param name {string} Database name
   * @classdesc Database constructor
   */
  var DB = Longo.DB = function(name) {
    this.name = name;
    this.lastError = null;
    this.collections = {};
    this.logger = Longo.Utils.createLogger("Longo." + name);
  };
  Longo.Utils.inherits(Longo, EventEmitter);

  DB.prototype.getCollectionNames = function() {
    return _.keys(this.collections);
  };

  DB.prototype.getCollection = function(name) {
    return this.collections[name];
  };

  DB.prototype.collection = function(name) {
    var cname = Utils.getOrElse(name, "temp") + "";
    if (this.collections[cname]) return this.collections[cname];
    return this.createCollection(name, {}, []);
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

  DB.prototype.cloneCollection = function(from, name, criteria, done) {
    var cname = Utils.getOrElse(name, "temp") + "";

    if (!this.collections[cname]) return done(Longo.Error.COLLECTION_IS_ALREADY_EXISTS, null);

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

    var worker = this.worker = new Worker(Longo.LONGOROOT + "/longoCollectionWorker.js");

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
        return self.logger.error("ERROR:Failed to parse WebWorker message", response[0]);
      }
      data   = response[1] || {};
      seq    = data.seq || "-1";
      error  = data.error || null;
      result = data.result;

      if (error) {
        self.db.lastError = error;
        self.db.emmit("error", error);
        self.emit("error", error);
        self.logger.error("ERROR:Failed at worker", error);
      }
      if (data.isUpdated){
        _.each(_.values(self.observers), function(ob){
          console.log(ob);
          self.send(ob.message, ob.func, false);
        });
      }

      return Utils.doWhen(_.isFunction(self.cbs[seq]), self.cbs[seq], [error, result]);
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

    if (this.status !== Status.STARTED) return callbackFunc(Longo.Error.COLLECTION_IS_NOT_STARTED, null);

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


  // Collection.prototype.findAll = function(projection) {
  //   var cmds = [{
  //     "cmd": "find",
  //     "criteria": {}
  //   }, {
  //     "cmd": "project",
  //     "projection": projection
  //   }];
  //   return new Cursor(this, cmds);
  // };

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
    var self = this,
      wrapCb = function() {
        delete self.db.collections[self.name];
      },
      cmd = {
        "cmd": "drop"
      };

    return (new Cursor(this, cmd, wrapCb));
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


  Collection.prototype.copyTo = function() {};
  Collection.prototype.dataSize = function() {};
  Collection.prototype.copyTo = function() {};
  Collection.prototype.distinct = function() {};
  Collection.prototype.findAndModify = function() {};
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
        if(!skipDuplicates || !_.isEqual(cache, args)){
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

  Cursor.prototype.max = function() {
    var cmd = {
      "cmd": "max"
    };
    return new Cursor(this, cmd);
  };

  Cursor.prototype.min = function() {
    var cmd = {
      "cmd": "min"
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