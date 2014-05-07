/* global self:false, Longo:false */

/**
 * @project Longo.js
 * @module longoWorker
 * @requires longo
 * @requires {@linkplain http://underscorejs.org/|underscore}
 * @requires {@linkplain https://github.com/davidgtonge/underscore-query|underscore-query}
 * @desc This module is work only WebWorker thread.<br>
 *       Longo automatically create worker thread. So user application does not need use this module directory.
 *
 * @see https://github.com/georgeOsdDev/Longo
 *
 * @license   The MIT License (MIT)
 * @copyright Copyright (c) 2014 Takeharu Oshida <georgeosddev@gmail.com>
 */

var _console = console || {};

// import utilities
var _importScripts = importScripts || function(){};
_importScripts("./lib/underscore/underscore-min.js",
              "./lib/underscore-query/lib/underscore-query.min.js",
              "./longo.js");
var Utils = Longo.Utils;

// self is global of WebWorker thread
var global = self || window;

(function(g, undefined){
  "use strict";


  g.logger = function(obj, method){
    var loglevel = method || "log";

    // console in WebWorker thread does not accept more than one arguments
    // eg. console.log(1,2,3); -> console display just only `1`
    // So use JSON
    var msg = {
      "msg":obj,
      "workerName":self.name
    };
    if (typeof _console !== undefined && _console[loglevel]) _console[loglevel].call(_console, JSON.stringify(msg));
  };

  var SKIP_REST = "SKIP_REST";

  var UPDATE_OPERATORS = [
    "$inc",
    "$mul",
    "$rename",
    "$setOnInsert",
    "$set",
    "$unset",
    "$min",
    "$max",
    "$currentDate",
    "$invert"
    // "$",
    // "$addToSet",
    // "$pop",
    // "$pullAll",
    // "$pull",
    // "$pushAll",
    // "$push",
    // "$each",
    // "$slice",
    // "$sort",
    // "$position",
    // "$bit",
    // "$isolated",
  ];

  g.dataset = [];
  g.option  = {
      capped:false
    };
  g.isUpdatedBySeq = {};

  g.getDataset = function(){
    return g.dataset;
  };

  g.setDataset = function(dataset){
    g.dataset = dataset;
  };


  g.applyOperator = function(doc, current){
    var result = _.identity(current);
    var operators = _.keys(doc);
    var pairs;

    _.each(operators, function(op){
      pairs = doc[op];
      switch (op) {
      case "$inc" :
        _.each(_.keys(pairs), function(k){
          if (_.isNumber(current[k]) && _.isNumber(pairs[k])) result[k] = current[k] + pairs[k];
        });
        break;
      case "$mul" :
        _.each(_.keys(pairs), function(k){
          if (_.isNumber(current[k]) && _.isNumber(pairs[k])) result[k] = current[k] * pairs[k];
        });
        break;
      case "$rename" :
        _.each(_.keys(pairs), function(k){
          if (_.has(current,k)) result[pairs[k]] = current[k];
        });
        break;
      case "$set" :
        _.each(_.keys(pairs), function(k){
          if (_.has(current,k)) result[k] = pairs[k];
        });
        break;
      case "$unset" :
        _.each(_.keys(pairs), function(k){
          if (_.has(current,k)) delete result[k];
        });
        break;
      case "$mod" :
        _.each(_.keys(pairs), function(k){
          if (_.isNumber(current[k]) && _.isNumber(pairs[k])) result[k] = current[k] % pairs[k];
        });
        break;
      default:
        //noop
      }
    });
    return result;
  };

  g.toQuery = function(query) {
    return Utils.checkOrElse(query, {}, function(val){
      return _.isObject(val) && !_.isArray(val) && !_.isFunction(val);
    });
  };

  g.toDocument = function(doc) {
    if (_.isObject(doc) && !_.isArray(doc)) return doc;
    var arr  = Utils.toArray(doc);
    var keys = _.keys(arr);
    return _.object(keys, arr);
  };

  g.isSizeReached = function(doc) {
    var max = self.option.size || 1024*1024,
        current = Utils.str2ab(JSON.stringify(self.dataset)).byteLength,
        param   = Utils.str2ab(JSON.stringify(doc)).byteLength
        ;
    return current + param > max;
  };

  g.isCountReached = function(dataset, max){
    return _.size(dataset) + 1 > (max || 1000);
  };

  g.doStart = function(command, seq, ctx){
    var _ctx = ctx || this;
    _ctx.name    = command.name;
    _ctx.option  = command.option;
    _ctx.dataset = command.dataset;
    _ctx.isUpdatedBySeq[seq] = true;
    g.logger("Longo Collection Worker Started", "info");
    return [null, []];
  };


  g.doFind = function(dataset, query){
    return [null, _.query(dataset, query)];
  };

  g.doInsert = function(docs, seq, ctx) {
    var _ctx = ctx || this;
    if (Utils.isZero(_.size(docs))){
      return [SKIP_REST, null];
    }
    var doc = _.omit(g.toDocument(_.first(docs)), UPDATE_OPERATORS);

    if (!doc._id) {
      doc._id = Utils.objectId();
    } else {
      if (_.where(_ctx.dataset, {"_id":doc._id}).length > 0) return [new Longo.Error(Longo.Error.DUPLICATE_KEY_ERROR, "_id: "+doc._id), doc];
    }

    if(_ctx.option.capped) {
      // Check max size of dataset
      if (g.isSizeReached(doc)){
        g.logger("Reached to size count for capped Collection. Size: "+ _ctx.option.max, "warn");
        _ctx.dataset.shift();
        return g.doInsert(docs, seq, _ctx);
      }
      // Check max count of dataset
      if (g.isCountReached()) {
        g.logger("Reached to max count for capped Collection. Count: "+ _ctx.option.max, "warn");
        _ctx.dataset.shift();
      }
    }

    _ctx.dataset.push(doc);
    _ctx.isUpdatedBySeq[seq] = true;
    return g.doInsert(_.rest(docs), seq, _ctx);
  };

  g.updateById = function(current, doc, seq, ctx) {
    var _ctx = ctx || this;
    doc = g.toDocument(doc);
    if (doc._id && current._id !== doc._id) return [new Longo.Error(Longo.Error.MOD_ID_NOT_ALLOWED, "_id: "+doc._id), null];

    var operators = _.pick(doc, UPDATE_OPERATORS);
    var normal    = _.omit(doc, UPDATE_OPERATORS);

    if (_.size(operators) > 0 ) {
      if (_.size(normal) > 0) return [new Longo.Error(Longo.Error.INVALID_MODIFIER_SPECIFIED, normal[0]), null];

      doc = g.applyOperator(doc, current);
    }
    doc._id = current._id;
    _ctx.dataset = _.reject(_ctx.dataset, function(d){return d._id === current._id;}).concat([doc]);
    _ctx.isUpdatedBySeq[seq] = true;
    return [null, null];
  };


  g.doUpdate = function(query, update, option, seq, ctx) {
    var _ctx = ctx || this;
    var hits, current;
    hits = g.doFind(_ctx.dataset, query)[1];

    if (Utils.isZero(_.size(hits))) {
      if (option.upsert) return g.doInsert(Utils.toArray(update), seq, _ctx);
      return [new Longo.Error(Longo.Error.DOCUMENT_NOT_FOUND, "query: "+JSON.stringify(query)), null];
    } else if (Utils.isOne(_.size(hits))) {
      current = hits[0];
      return g.updateById(current, update, seq, _ctx);
    } else {
      if (!option.multi) return g.updateById(hits[0], update, seq, _ctx);
      if (update._id && current._id !== update._id) return [new Longo.Error(Longo.Error.MOD_ID_NOT_ALLOWED, "_id: "+update._id), null];

      var res = [null, null];
      _.every(hits, function(current){
        res = g.updateById(current, update, seq, _ctx);
        return res[0] === null;
      });
      return res;
    }
  };

  g.doSave = function(docs, seq, ctx){
    var _ctx = ctx || this;
    var doc, result;
    if (Utils.isZero(_.size(docs))){
      return [SKIP_REST, null];
    }
    doc = _.first(docs);

    if (!doc._id) {
      result = g.doInsert(Utils.toArray(doc), seq, _ctx);
    } else {
      result = g.doUpdate({"_id": doc._id}, doc, {upsert:true}, seq, _ctx);
      if (result[0] && result[0] !== SKIP_REST) return result;
    }
    return g.doSave(_.rest(docs), seq, _ctx);
  };

  g.doRemove = function(query, justOne, seq, ctx){
    var _ctx = ctx || this;
    var hits = g.doFind(_ctx.dataset, query)[1],
        ids;

    if (Utils.isZero(_.size(hits))) return [new Longo.Error(Longo.Error.DOCUMENT_NOT_FOUND, "query: "+JSON.stringify(query)), null];

    if (justOne){
      _ctx.dataset = _.reject(_ctx.dataset, function(doc){ return doc._id === hits[0]._id;});
    } else {
      ids = _.pluck(hits, "_id");
      _ctx.dataset = _.reject(_ctx.dataset, function(doc){ return _.contains(ids, doc._id);});
    }
    _ctx.isUpdatedBySeq[seq] = true;
    return [null, null];
  };


  g.doProject = function(dataset, projection){
    var pairs     = _.pairs(projection),
        includes  = _.filter(pairs, function(p){return Utils.isOne(p[1])  || Utils.isTrue(p[1]);}),
        excludes  = _.filter(pairs, function(p){return Utils.isZero(p[1]) || Utils.isFalse(p[1]);}),
        keys
        ;

    if (_.size(includes) > 0) {
      keys = _.pluck(includes, "0");
      if (Utils.isZero(projection._id) || Utils.isFalse(projection._id)){
        keys = _.without(keys, "_id");
      } else {
        keys = _.union(keys, ["_id"]);
      }
      return [null, _.map(dataset, function(d){return _.pick(d, keys);})];
    } else {
      keys = _.pluck(excludes, "0");
      return [null, _.map(dataset, function(d){return _.omit(d, keys);})];
    }
  };

  g.doLimit = function(dataset, limit){
    return [null, _.first(dataset, limit)];
  };

  g.doSkip = function(dataset, skip){
    return [null, _.rest(dataset, skip)];
  };

  g.doCount = function(dataset){
    return [SKIP_REST, [_.size(dataset)]];
  };

  g.doSize = function(dataset){
    return [SKIP_REST, [Utils.str2ab(JSON.stringify(dataset)).byteLength]];
  };

  g.doToArray = function(dataset){
    return [null, Utils.toArray(dataset)];
  };

  g.doMax = function(dataset, indexBounds){
    var k, v, query;
    k = _.keys(indexBounds);
    v = _.values(indexBounds, function(val){
      return {"$lte": val};
    });
    query = _.object(k, v);
    return g.doFind(dataset, query);
  };

  g.doMin = function(dataset, indexBounds){
    var k, v, query;
    k = _.keys(indexBounds);
    v = _.values(indexBounds, function(val){
      return {"$gte": val};
    });
    query = _.object(k, v);
    return g.doFind(dataset, query);
  };

  g.doForEach = function(dataset, func){
    /*jshint -W054 */
    if (!func) return [null, dataset];
    var f = (new Function(func+""))();
    try {
      return [null, _.forEach(dataset, f)];
    } catch (e){
      return [new Longo.Error(Longo.Error.EVAL_ERROR, "function: "+func, e.stack), null];
    }
  };

  g.doMap = function(dataset, func){
    /*jshint -W054 */
    if (!func) return [null, dataset];
    var f = (new Function(func+""))();
    try {
      return [null, _.map(dataset, f)];
    } catch (e){
      return [new Longo.Error(Longo.Error.EVAL_ERROR, "function: "+func, e.stack), null];
    }
  };

  g.doSort = function(dataset, sorter) {
    /*jshint -W054 */
    if (_.isString(sorter)) {
      var f = (new Function(sorter+""))();
      try {
        return [null,  _.sortBy(dataset, f)];
      } catch (e) {
        return [new Longo.Error(Longo.Error.EVAL_ERROR, "sorter: "+sorter, e.stack), null];
      }
    } else {
      var key   = _.keys(sorter)[0],
          order = sorter[key],
          sorted
          ;
      sorted = _.sortBy(dataset, key);
      if (!Utils.isOne(order)) return [null, sorted.reverse()];
      return [null, sorted];
    }
  };

  g.getExecuter = function(seq, ctx){
    var _ctx = ctx || this;
    return function(memo, command){
      var error   = memo[0],
          dataset = memo[1]
          ;

      if (error) return memo;

      switch(command.cmd) {

      // start/insert/save/update/remove will change dataset of ctx
      case "start":
        return g.doStart(command, seq, _ctx);
      case "insert":
        return g.doInsert(Utils.toArray(Utils.getOrElse(command.doc),[]), seq, _ctx);
      case "save":
        return g.doSave(Utils.toArray(command.doc), seq, _ctx);
      case "update":
        return g.doUpdate(g.toQuery(command.query), Utils.getOrElse(command.update, {}), Utils.getOrElse(command.option, {}), seq, _ctx);
      case "remove":
        return g.doRemove(g.toQuery(command.query), Utils.getOrElse(command.justOne, false), seq, _ctx);

      // rest commands have no side effect
      case "find":
        return g.doFind(dataset, g.toQuery(command.query));
      case "project":
        return g.doProject(dataset, Utils.getOrElse(command.projection,{}));
      case "limit":
        return g.doLimit(dataset, Utils.getOrElse(command.value, 15));
      case "skip":
        return g.doSkip(dataset, Utils.getOrElse(command.value, 0));
      case "count":
        return g.doCount(dataset);
      case "size":
        return g.doSize(dataset);
      case "toArray":
        return g.doToArray(dataset);
      case "max":
        return g.doMax(dataset, Utils.getOrElse(command.indexBounds, {}));
      case "min":
        return g.doMin(dataset, Utils.getOrElse(command.indexBounds, {}));
      case "forEach":
        return g.doForEach(dataset, Utils.getOrElse(command.func, null));
      case "map":
        return g.doMap(dataset, Utils.getOrElse(command.func, null));
      case "sort":
        return g.doSort(dataset, Utils.getOrElse(command.sorter, {"_id":1}));

      default :
        return memo;
      }
    };
  };

  g.postMessage = g.webkitPostMessage || g.postMessage || function(){};
  g.send = function(message) {
    message.seqs = self.seqs;
    var json  = JSON.stringify(message),
        bytes = Utils.str2ab(json)
        ;
    g.postMessage(bytes, [bytes]);
  };

  g.addEventListener = g.addEventListener || function(){};
  g.addEventListener("message", function(e) {

    var request, data, cmds, seq, result = [], executer;
    request = Utils.tryParseJSON(Utils.ab2str(e.data));

    if (request[0]) return g.send({"seq":-1, "error": request[0], "result": []});

    data = request[1] || {};
    cmds = data.cmds;
    seq  = data.seq;
    g.isUpdatedBySeq[seq] = false;
    executer = g.getExecuter(seq);

    result = _.reduce(cmds, executer, [null, g.dataset]);

    if (result[0] === SKIP_REST ) result[0] = null;

    self.send({"seq": seq, "error": result[0] , "result": result[1], "isUpdated":g.isUpdatedBySeq[seq]});
    delete g.isUpdatedBySeq[seq];

  }, false);

})(global);


// //-----


// // global parameter for this collection worker
// self.dataset = [];
// self.option  = {
//   capped:false,
// };
// self.isUpdatedBySeq = {};
// var SKIP_REST = "SKIP_REST";

// var UPDATE_OPERATORS = [
//   "$inc",
//   "$mul",
//   "$rename",
//   "$setOnInsert",
//   "$set",
//   "$unset",
//   "$min",
//   "$max",
//   "$currentDate",
//   "$invert"
//   // "$",
//   // "$addToSet",
//   // "$pop",
//   // "$pullAll",
//   // "$pull",
//   // "$pushAll",
//   // "$push",
//   // "$each",
//   // "$slice",
//   // "$sort",
//   // "$position",
//   // "$bit",
//   // "$isolated",
// ];

// function applyOperator(doc, current){
//   "use strict";
//   var result = _.identity(current);
//   var operators = _.keys(doc);
//   var pairs;

//   _.each(operators, function(op){
//     pairs = doc[op];
//     switch (op) {
//     case "$inc" :
//       _.each(_.keys(pairs), function(k){
//         if (_.isNumber(current[k]) && _.isNumber(pairs[k])) result[k] = current[k] + pairs[k];
//       });
//       break;
//     case "$mul" :
//       _.each(_.keys(pairs), function(k){
//         if (_.isNumber(current[k]) && _.isNumber(pairs[k])) result[k] = current[k] * pairs[k];
//       });
//       break;
//     case "$rename" :
//       _.each(_.keys(pairs), function(k){
//         if (_.has(current,k)) result[pairs[k]] = current[k];
//       });
//       break;
//     case "$set" :
//       _.each(_.keys(pairs), function(k){
//         if (_.has(current,k)) result[k] = pairs[k];
//       });
//       break;
//     case "$unset" :
//       _.each(_.keys(pairs), function(k){
//         if (_.has(current,k)) delete result[k];
//       });
//       break;
//     case "$mod" :
//       _.each(_.keys(pairs), function(k){
//         if (_.isNumber(current[k]) && _.isNumber(pairs[k])) result[k] = current[k] % pairs[k];
//       });
//       break;
//     default:
//       //noop
//     }
//   });
//   return result;
// }

// function toQuery(query) {
//   "use strict";
//   return Utils.checkOrElse(query, {}, function(val){
//     return _.isObject(val) && !_.isArray(val) && !_.isFunction(val);
//   });
// }

// function toDocument(doc) {
//   "use strict";
//   if (_.isObject(doc) && !_.isArray(doc)) return doc;
//   var arr  = Utils.toArray(doc);
//   var keys = _.keys(arr);
//   return _.object(keys, arr);
// }

// function isSizeReached(doc) {
//   "use strict";
//   var max = self.option.size || 1024*1024,
//       current = Utils.str2ab(JSON.stringify(self.dataset)).byteLength,
//       param   = Utils.str2ab(JSON.stringify(doc)).byteLength
//       ;
//   return current + param > max;
// }

// function isCountReached(){
//   "use strict";
//   var max  = self.option.max  || 1000;
//   return _.size(self.dataset) + 1 > max;
// }

// function doStart(command, seq){
//   "use strict";
//   self.name   = command.name;
//   self.option = command.option;
//   self.dataset = command.dataset;
//   self.isUpdatedBySeq[seq] = true;
//   self.logger("Longo Collection Worker Started", "info");
//   return [null, []];
// }

// function doFind(dataset, query){
//   "use strict";
//   return [null, _.query(dataset, query)];
// }

// function doInsert(docs, seq) {
//   "use strict";
//   if (Utils.isZero(_.size(docs))){
//     return [SKIP_REST, null];
//   }
//   var doc = _.omit(toDocument(_.first(docs)), UPDATE_OPERATORS);

//   if (!doc._id) {
//     doc._id = Utils.objectId();
//   } else {
//     if (_.where(self.dataset, {"_id":doc._id}).length > 0) return [new Longo.Error(Longo.Error.DUPLICATE_KEY_ERROR, "_id: "+doc._id), doc];
//   }

//   if(self.option.capped) {
//     // Check max size of dataset
//     if (isSizeReached(doc)){
//       self.logger("Reached to size count for capped Collection. Size: "+ self.option.max, "warn");
//       self.dataset.shift();
//       return doInsert(docs, seq);
//     }
//     // Check max count of dataset
//     if (isCountReached()) {
//       self.logger("Reached to max count for capped Collection. Count: "+ self.option.max, "warn");
//       self.dataset.shift();
//     }
//   }

//   self.dataset.push(doc);
//   self.isUpdatedBySeq[seq] = true;
//   return doInsert(_.rest(docs), seq);
// }

// function updateById(current, doc, seq) {
//   "use strict";
//   doc = toDocument(doc);
//   if (doc._id && current._id !== doc._id) return [new Longo.Error(Longo.Error.MOD_ID_NOT_ALLOWED, "_id: "+doc._id), null];

//   var operators = _.pick(doc, UPDATE_OPERATORS);
//   var normal    = _.omit(doc, UPDATE_OPERATORS);

//   if (_.size(operators) > 0 ) {
//     if (_.size(normal) > 0) return [new Longo.Error(Longo.Error.INVALID_MODIFIER_SPECIFIED, normal[0]), null];

//     doc = applyOperator(doc, current);
//   }
//   doc._id = current._id;
//   self.dataset = _.reject(self.dataset, function(d){return d._id === current._id;}).concat([doc]);
//   self.isUpdatedBySeq[seq] = true;
//   return [null, null];
// }

// function doUpdate(query, update, option, seq) {
//   "use strict";
//   var hits, current;
//   hits = doFind(self.dataset, query)[1];

//   if (Utils.isZero(_.size(hits))) {
//     if (option.upsert) return doInsert(Utils.toArray(update), seq);
//     return [new Longo.Error(Longo.Error.DOCUMENT_NOT_FOUND, "query: "+JSON.stringify(query)), null];
//   } else if (Utils.isOne(_.size(hits))) {
//     current = hits[0];
//     return updateById(current, update, seq);
//   } else {
//     if (!option.multi) return updateById(hits[0], update, seq);
//     if (update._id && current._id !== update._id) return [new Longo.Error(Longo.Error.MOD_ID_NOT_ALLOWED, "_id: "+update._id), null];

//     var res = [null, null];
//     _.every(hits, function(current){
//       res = updateById(current, update, seq);
//       return res[0] === null;
//     });
//     return res;
//   }
// }

// function doSave(docs, seq){
//   "use strict";
//   var doc, result;
//   if (Utils.isZero(_.size(docs))){
//     return [SKIP_REST, null];
//   }
//   doc = _.first(docs);

//   if (!doc._id) {
//     result = doInsert(Utils.toArray(doc), seq);
//   } else {
//     result = doUpdate({"_id": doc._id}, doc, {upsert:true}, seq);
//     if (result[0] && result[0] !== SKIP_REST) return result;
//   }
//   return doSave(_.rest(docs), seq);
// }

// function doRemove(query, justOne, seq){
//   "use strict";
//   var hits = doFind(self.dataset, query)[1],
//       ids;

//   if (Utils.isZero(_.size(hits))) return [new Longo.Error(Longo.Error.DOCUMENT_NOT_FOUND, "query: "+JSON.stringify(query)), null];

//   if (justOne){
//     self.dataset = _.reject(self.dataset, function(doc){ return doc._id === hits[0]._id;});
//   } else {
//     ids = _.pluck(hits, "_id");
//     self.dataset = _.reject(self.dataset, function(doc){ return _.contains(ids, doc._id);});
//   }
//   self.isUpdatedBySeq[seq] = true;
//   return [null, null];
// }

// function doProject(dataset, projection){
//   "use strict";
//   var pairs     = _.pairs(projection),
//       includes  = _.filter(pairs, function(p){return Utils.isOne(p[1])  || Utils.isTrue(p[1]);}),
//       excludes  = _.filter(pairs, function(p){return Utils.isZero(p[1]) || Utils.isFalse(p[1]);}),
//       keys
//       ;

//   if (_.size(includes) > 0) {
//     keys = _.pluck(includes, "0");
//     if (Utils.isZero(projection._id) || Utils.isFalse(projection._id)){
//       keys = _.without(keys, "_id");
//     } else {
//       keys = _.union(keys, ["_id"]);
//     }
//     return [null, _.map(dataset, function(d){return _.pick(d, keys);})];
//   } else {
//     keys = _.pluck(excludes, "0");
//     return [null, _.map(dataset, function(d){return _.omit(d, keys);})];
//   }
// }

// function doLimit(dataset, limit){
//   "use strict";
//   return [null, _.first(dataset, limit)];
// }

// function doSkip(dataset, skip){
//   "use strict";
//   return [null, _.rest(dataset, skip)];
// }

// function doCount(dataset){
//   "use strict";
//   return [SKIP_REST, [_.size(dataset)]];
// }

// function doSize(dataset){
//   "use strict";
//   return [SKIP_REST, [Utils.str2ab(JSON.stringify(dataset)).byteLength]];
// }

// function doToArray(dataset){
//   "use strict";
//   return [null, dataset];
// }

// function doMax(dataset, indexBounds){
//   "use strict";
//   var k, v, query;
//   k = _.keys(indexBounds);
//   v = _.values(indexBounds, function(val){
//     return {"$lte": val};
//   });
//   query = _.object(k, v);
//   return doFind(dataset, query);
// }

// function doMin(dataset, indexBounds){
//   "use strict";
//   var k, v, query;
//   k = _.keys(indexBounds);
//   v = _.values(indexBounds, function(val){
//     return {"$gte": val};
//   });
//   query = _.object(k, v);
//   return doFind(dataset, query);
// }

// function doForEach(dataset, func){
//   /*jshint -W054 */
//   "use strict";
//   if (!func) return [null, dataset];
//   var f = (new Function(func+""))();
//   try {
//     return [null, _.forEach(dataset, f)];
//   } catch (e){
//     return [new Longo.Error(Longo.Error.EVAL_ERROR, "function: "+func, e.stack), null];
//   }
// }

// function doMap(dataset, func){
//   /*jshint -W054 */
//   "use strict";
//   if (!func) return [null, dataset];
//   var f = (new Function(func+""))();
//   try {
//     return [null, _.map(dataset, f)];
//   } catch (e){
//     return [new Longo.Error(Longo.Error.EVAL_ERROR, "function: "+func, e.stack), null];
//   }
// }

// function doSort(dataset, sorter) {
//   "use strict";
//   /*jshint -W054 */
//   if (_.isString(sorter)) {
//     var f = (new Function(sorter+""))();
//     try {
//       return [null,  _.sortBy(dataset, f)];
//     } catch (e) {
//       return [new Longo.Error(Longo.Error.EVAL_ERROR, "sorter: "+sorter, e.stack), null];
//     }
//   } else {
//     var key   = _.keys(sorter)[0],
//         order = sorter[key],
//         sorted
//         ;
//     sorted = _.sortBy(dataset, key);
//     if (!Utils.isOne(order)) return [null, sorted.reverse()];
//     return [null, sorted];
//   }
// }

// function getExecuter(seq){
//   "use strict";
//   return function(memo, command){
//     var error   = memo[0],
//         dataset = memo[1]
//         ;

//     if (error) return memo;

//     switch(command.cmd) {
//     case "start":
//       return doStart(command, seq);
//     case "find":
//       return doFind(dataset, toQuery(command.query));
//     case "insert":
//       return doInsert(Utils.toArray(Utils.getOrElse(command.doc),[]), seq);
//     case "save":
//       return doSave(Utils.toArray(command.doc), seq);
//     case "update":
//       return doUpdate(toQuery(command.query), Utils.getOrElse(command.update, {}), Utils.getOrElse(command.option, {}), seq);
//     case "remove":
//       return doRemove(toQuery(command.query), Utils.getOrElse(command.justOne, false), seq);
//     case "project":
//       return doProject(dataset, Utils.getOrElse(command.projection,{}));
//     case "limit":
//       return doLimit(dataset, Utils.getOrElse(command.value, 15));
//     case "skip":
//       return doSkip(dataset, Utils.getOrElse(command.value, 0));
//     case "count":
//       return doCount(dataset);
//     case "size":
//       return doSize(dataset);
//     case "toArray":
//       return doToArray(dataset);
//     case "max":
//       return doMax(dataset, Utils.getOrElse(command.indexBounds, {}));
//     case "min":
//       return doMin(dataset, Utils.getOrElse(command.indexBounds, {}));
//     case "forEach":
//       return doForEach(dataset, Utils.getOrElse(command.func, null));
//     case "map":
//       return doMap(dataset, Utils.getOrElse(command.func, null));
//     case "sort":
//       return doSort(dataset, Utils.getOrElse(command.sorter, {"_id":1}));


//     default :
//       return memo;
//     }
//   };
// }



// // self is WebWorker's global context
// self.postMessage = self.webkitPostMessage || self.postMessage;
// self.send = function(message) {
//   "use strict";
//   message.seqs = self.seqs;
//   var json  = JSON.stringify(message),
//       bytes = Utils.str2ab(json)
//       ;
//   self.postMessage(bytes, [bytes]);
// };

// self.addEventListener("message", function(e) {
//   "use strict";

//   var request, data, cmds, seq, result = [], executer;
//   request = Utils.tryParseJSON(Utils.ab2str(e.data));

//   if (request[0]) return self.send({"seq":-1, "error": request[0], "result": []});

//   data = request[1] || {};
//   cmds = data.cmds;
//   seq  = data.seq;
//   self.isUpdatedBySeq[seq] = false;
//   executer = getExecuter(seq);

//   result = _.reduce(cmds, executer, [null, self.dataset]);

//   if (result[0] === SKIP_REST ) result[0] = null;

//   self.send({"seq": seq, "error": result[0] , "result": result[1], "isUpdated":self.isUpdatedBySeq[seq]});
//   delete self.isUpdatedBySeq[seq];

// }, false);
