(function(global, undefined){

  var alice = Array.prototype.slice;
  var inherits = function(ctor, superCtor) {
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

  function EventEmitter(){
    this.dom = window.document.createDocumentFragment();
  }
  // https://developer.mozilla.org/en-US/docs/Web/API/EventTarget.addEventListener
  EventEmitter.prototype.addEventListener = function(event, listner){
    this.dom.addEventListener.apply(this.dom, alice.apply(arguments));
  };
  // https://developer.mozilla.org/en-US/docs/Web/API/EventTarget.removeEventListener
  EventEmitter.prototype.removeEventListener = function(){
    this.dom.removeEventListener.apply(this.dom, alice.apply(arguments));
  };
  // https://developer.mozilla.org/en-US/docs/Web/API/EventTarget.dispatchEvent
  EventEmitter.prototype.dispatchEvent = function(){
    var args = alice.apply(arguments),
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


  var longoRoot = "/Longo.js";
  (function(){
    var scripts = document.getElementsByTagName("script");
    var i = scripts.length;
    while (i--) {
      var match = scripts[i].src.match(/(^|.*)\/longo\.js$/);
      if (match) {
          longoRoot = match[1];
          break;
      }
    }
  })();

  function Collection(name, parent){
    this.name   = name;
    this.parent = parent;
    this.cbs    = {};

    var self   = this,
        worker = this.worker = new Worker(longoRoot+'/longoCollectionWorker.js')
        ;

    worker.addEventListener('message', function(e) {
      self.receive(e);
    },false);

    this.send({"cmd":"start", "name": name}, function(){
      self.status = "start";
    });
  }

  Collection.prototype.getNextSeq = function(){
    var seq = 0;
    var nextSeq = function(){
      seq++;
      return seq;
    };
    this.getNextSeq = nextSeq;
    return seq;
  };

  Collection.prototype.receive = function(e){
    // TODO: Error handle
    var data = e.data || {},
        seq  = data.seq || -1
        ;
    if (typeof this.cbs[seq] === "function") this.cbs[seq](data.result);
  };

  Collection.prototype.send = function(message, cb){
    var seq = this.getNextSeq();
    this.cbs[seq] = cb;
    message.seq   = seq;
    this.worker.postMessage(message);
  };

  Collection.prototype.findAll = function(projection, cb){
    this.send({"cmd":"findAll", "projection":projection}, cb);
  };

  Collection.prototype.find = function(criteria, projection, cb){
    this.send({"cmd":"find", "criteria":criteria, "projection":projection}, cb);
  };

  Collection.prototype.save = function(doc, cb){
    this.send({"cmd":"save", "doc":doc}, cb);
  };

  Collection.prototype.drop = function(cb){
    var self = this;
    var _cb = function(param){
      delete self.parent.workers[self.name];
      if (typeof cb === "function") cb();
    };
    this.send({"cmd":"drop"}, _cb);
  };

  // Collection.prototype.count = function(){};
  // Collection.prototype.findAndModify = function(){};
  // Collection.prototype.insert = function(){};
  // Collection.prototype.mapReduce = function(){};
  // Collection.prototype.remove = function(){};
  // Collection.prototype.update = function(){};




  /*
   * Longo SDK
   */
  function Longo(){
    this.workers = {};
  }
  inherits(Longo, EventEmitter);

  Longo.prototype.collections = function(){
    return _.keys(this.workers);
  };

  Longo.prototype.collection = function(name){
    var cname = name+"";
    if (!cname) cname = "temp";
    if (this.workers[cname]) {
      return this.workers[cname];
    } else {
      var worker = new Collection(cname, this);
      this.workers[cname] = worker;
      return worker;
    }
  };

  Longo.prototype.dropDatabase = function(){
    _.each(_.values(this.workers), function(collection){
      collection.drop();
    });
  };

  global.Longo = Longo;
})(window);