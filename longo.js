(function(global, undefined){

  var VERSION = "0.1.0";
  var LONOGROOT = "/Longo.js";
  (function(){
    var scripts = document.getElementsByTagName("script");
    var i = scripts.length;
    while (i--) {
      var match = scripts[i].src.match(/(^|.*)\/longo\.js$/);
      if (match) {
          LONOGROOT = match[1];
          break;
      }
    }
  })();

  var STATUS_CDS = {
    "CREATED" :0,
    "STARTED" :1,
    "STOPPED" :2,
    "DELETED" :3
  };
  var ERROR_CDS = {
    // Common Errors
    "1"  : {"cd":1, "name":"UnknownError", "message":"Unknown error occured", isFatal:true},
    // Collection Errors
    "101": {"cd":101, "name": "CollectionNotFound",       "message":"Collection is not found %s",       isFatal:true},
    "102": {"cd":102, "name": "CollectionNotInitialized", "message":"Collection is not initialized %s", isFatal:true},
    "103": {"cd":103, "name": "CollectionStopped",        "message":"Collection is stopped %s",         isFatal:true}
    // Command Errors
  };
  var invertErrorCds = _.invert(ERROR_CDS);

  function isFatalError(errorCd){
    return ERROR_CDS[errorCd+""].isFatal;
  }


  // Inner Utils
  var aslice, inherits, createLogger;
  aslice = Array.prototype.slice;
  inherits = function(ctor, superCtor) {
    ctor.super_ = superCtor;
    ctor.prototype = Object.create(superCtor.prototype, {
      constructor: {
        value: ctor,
        enumerable: false,
        writable: true,
        configurable: true
      }
    });
  };
  createLogger = function(prefix){
    var logger = {
      log : function(){},
      error : function(){}
    };
    if (!console) return logger;
    logger.log   = (function(){console.log.bind(console, prefix);})();
    logger.error = (function(){console.error.bind(console, prefix);})();
    return logger;
  };

  // Inner Classes

  function EventEmitter(){
    this.dom = window.document.createDocumentFragment();
  }
  // https://developer.mozilla.org/en-US/docs/Web/API/EventTarget.addEventListener
  EventEmitter.prototype.addEventListener = function(event, listner){
    this.dom.addEventListener.apply(this.dom, aslice.apply(arguments));
  };
  // https://developer.mozilla.org/en-US/docs/Web/API/EventTarget.removeEventListener
  EventEmitter.prototype.removeEventListener = function(){
    this.dom.removeEventListener.apply(this.dom, aslice.apply(arguments));
  };
  // https://developer.mozilla.org/en-US/docs/Web/API/EventTarget.dispatchEvent
  EventEmitter.prototype.dispatchEvent = function(){
    var args = aslice.apply(arguments),
        ev   = args[0]
        ;
    if (!ev) return;
    args[0] = (ev.constructor.name === "Event") ? args[0] : new CustomEvent(args[0].toString(), args[1]);
    this.dom.dispatchEvent.apply(this.dom, args);
  };
  // alias
  EventEmitter.prototype.on      = EventEmitter.prototype.addEventListener;
  EventEmitter.prototype.bind    = EventEmitter.prototype.addEventListener;
  EventEmitter.prototype.off     = EventEmitter.prototype.removeEventListener;
  EventEmitter.prototype.unbind  = EventEmitter.prototype.removeEventListener;
  EventEmitter.prototype.emit    = EventEmitter.prototype.dispatchEvent;
  EventEmitter.prototype.trigger = EventEmitter.prototype.dispatchEvent;



  function Collection(name, opt, db){
    this.name   = name;
    this.opt    = opt;
    this.db     = db;
    this.cbs    = {};
    this.logger = createLogger("Longo."+db.name+"."+name);

    var self   = this,
        worker = this.worker = new Worker(LONOGROOT + '/longoCollectionWorker.js')
        ;

    worker.addEventListener("message", this.onMessage, false);
    worker.addEventListener("error",   this.onError,   false);
    this.status = STATUS_CDS.CREATED;
  }
  inherits(Collection, EventEmitter);

  Collection.prototype.onMessage = function(e){
    var data  = e.data     || {},
        seq   = data.seq   || -1,
        error = data.error || null
        ;
    if (error) this.db.lastError = error;
    if (typeof this.cbs[seq] === "function") this.cbs[seq](error, data.result);
  };

  Collection.prototype.onError = function(e){
    this.db.lastError = e;
    this.db.emit("error", e);
    this.emit("error", e);
    this.logger.error(['ERROR: Line ', e.lineno, ' in ', e.filename, ': ', e.message].join(''));
  };

  Collection.prototype.initialize = function(dataset){
    this.send({
      "cmd" : "start",
      "name": this.name,
      "opt" : this.opt,
      "db":   _.isArray(dataset) ? dataset : []
    }, function(){
      self.status = STATUS_CDS.STARTED;
    });
  };

  Collection.prototype.getNextSeq = function(){
    var seq = 0;
    var nextSeq = function(){
      seq++;
      return seq;
    };
    this.getNextSeq = nextSeq;
    return seq;
  };

  Collection.prototype.send = function(message, cb){
    if (this.status === STATUS_CDS.DELETED) return cb(ERROR_CDS["101"]);
    if (this.status === STATUS_CDS.CREATED) return cb(ERROR_CDS["102"]);
    if (this.status === STATUS_CDS.STOPPED) return cb(ERROR_CDS["103"]);

    var seq = this.getNextSeq();
    this.cbs[seq] = cb;
    message.seq   = seq;
    this.worker.postMessage(message);
    return this.name + ":" + seq;
  };

  Collection.prototype.findAll = function(projection, cb){
    return this.send({"cmd":"find", "criteria":{}, "projection":projection}, cb);
  };

  Collection.prototype.find = function(criteria, projection, cb){
    return this.send({"cmd":"find", "criteria":criteria, "projection":projection}, cb);
  };

  Collection.prototype.save = function(doc, cb){
    return this.send({"cmd":"save", "doc":doc}, cb);
  };

  Collection.prototype.cursor = function(criteria, projection){
    return new Cursor(criteria, projection, this);
  };

  Collection.prototype.drop = function(cb){
    var self = this;
    var _cb = function(param){
      delete self.db.workers[self.name];
      if (typeof cb === "function") cb();
    };
    return this.send({"cmd":"drop"}, _cb);
  };



// db.collection.aggregate(

// db.collection.count(
// db.collection.copyTo(

// db.collection.dataSize(

// db.collection.distinct(
// db.collection.drop(

// db.collection.find(
// db.collection.findAndModify(
// db.collection.findOne(

// db.collection.group(
// db.collection.insert(
// db.collection.isCapped(
// db.collection.mapReduce(

// db.collection.remove(
// db.collection.renameCollection(

// db.collection.save(

// db.collection.totalSize(

// db.collection.update(



  // lonog.collection("aa").cursor({},{}).limit(10).done(cb);
  function Cursor(){
    var args = aslice.apply(arguments);
    if (args[0] instanceof Cursor){
      this.criteria   = args[0].criteria;
      this.projection = args[0].projection;
      this.collection = args[0].collection;
      this.cmdChain   = args[0].cmdChain;
    } else {
      this.criteria   = args[0]    || {};
      this.projection = args[1]    || {};
      this.collection = args[2];
      this.cmdChain      = [];
    }
  }
  Cursor.prototype.done = function(cb){
    var message = {
      "cmd":        "find",
      "criteria":   this.criteria,
      "projection": this.projection,
      "cmdChain":   this.cmdChain
    };
    return this.collection.send(message, cb);
  };

  Cursor.prototype.count = function(num){
    this.cmdChain.push({"cmd":"count","args":num});
    return this;
  };

  Cursor.prototype.forEach = function(){
    this.cmdChain.push({"cmd":"forEach","args":aslice.apply(arguments)});
    return this;
  };

  Cursor.prototype.limit = function(num){
    this.cmdChain.push({"cmd":"limit","args":num});
    return this;
  };

  Cursor.prototype.map = function(){
    this.cmdChain.push({"cmd":"map","args":aslice.apply(arguments)});
    return this;
  };

  Cursor.prototype.max = function(){
    this.cmdChain.push({"cmd":"max","args":null});
    return this;
  };

  Cursor.prototype.min = function(){
    this.cmdChain.push({"cmd":"min","args":null});
    return this;
  };

  Cursor.prototype.size = function(){
    this.cmdChain.push({"cmd":"size","args":null});
    return this;
  };

  Cursor.prototype.skip = function(num){
    this.cmdChain.push({"cmd":"skip","args":num});
    return this;
  };

  Cursor.prototype.sort = function(sorter){
    this.cmdChain.push({"cmd":"sort","args":sorter});
    return this;
  };


  /*
   * Longo SDK
   */
  function Longo(name){
    this.name      = name;
    this.workers   = {};
    this.lastError = null;
    this.logger    = createLogger("Longo."+name);
  }
  inherits(Longo, EventEmitter);

  Longo.getVersion = function(){
    return VERSION;
  };
  Longo.ERROR_CDS  = ERROR_CDS;
  Longo.STATUS_CDS = STATUS_CDS;


  Longo.prototype.getCollectionNames = function(){
    return _.keys(this.workers);
  };

  Longo.prototype.getCollection = function(name){
    return this.workers[cname];
  };

  Longo.prototype.collection = function(name){
    var cname = name+"";
    if (!cname) cname = "temp";
    if (this.workers[cname]) {
      return this.workers[cname];
    } else {
      var worker = new Collection(cname, {capped:false}, this);
      worker.initialize([]);
      this.workers[cname] = worker;
      return worker;
    }
  };

  Longo.prototype.createCollection = Longo.prototype.collection;

  Longo.prototype.dropDatabase = function(){
    _.each(_.values(this.workers), function(collection){
      collection.drop();
    });
  };

  Longo.prototype.getLastError = function(){
    return this.lastError;
  };

  Longo.prototype.cloneCollection = function(from, name, query){
    if (!this.workers[name])

    if (!this.workers[from]){
      var worker = new Collection(cname, this);
      worker.initialize([]);
    }
  };

  // killOp is not kill operation but just delete callback
  Longo.prototype.killOp = function(opId){
    var tokens = opId.split[":"];
    if (this.workers[tokens[0]]) delete this.workers[tokens[0]].cbs[[1]];
  };

  global.Longo = Longo;
})(window);