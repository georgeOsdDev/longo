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

self.logger = function(obj, method){
  "use strict";
  var msg = {
    "msg":obj,
    "workerName":self.name
  };
  var loglevel = method || "log";
  // console in WebWorker thread does not accept more than one arguments
  // eg. console.log(1,2,3); -> console display just only `1`
  // So use JSON
  var _console = console || undefined;
  if (typeof _console !== undefined && _console[loglevel]) _console[loglevel].call(_console, JSON.stringify(msg));
};


// import utilities
importScripts("./lib/underscore/underscore-min.js",
              "./lib/underscore-query/lib/underscore-query.min.js",
              "./longo.js");

var Utils = Longo.Utils;

// global parameter for this collection worker
self.dataset = [];
self.option  = {
  capped:false,
};
self.isUpdatedBySeq = {};
var SKIP_REST = "SKIP_REST";
var CHARS     = "abcdefghijklmnopqrstuvwxyz0123456789".split("");

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

function applyOperator(doc, current){
  "use strict";
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
}

/*
 * return random string length 24
 * first 13 char is timestamp
 */
function objectId(val){
  "use strict";
  return val || Date.now() + _.shuffle(CHARS).join("").substr(0, 11);
}

function toQuery(criteria) {
  "use strict";
  return Utils.checkOrElse(criteria, {}, function(val){
    return _.isObject(val) && !_.isArray(val) && !_.isFunction(val);
  });
}

function toDocument(doc) {
  "use strict";
  if (_.isObject(doc) && !_.isArray(doc)) return doc;
  var arr  = Utils.toArray(doc);
  var keys = _.keys(arr);
  return _.object(keys, arr);
}

function doStart(command, seq){
  "use strict";
  self.name   = command.name;
  self.option = command.option;
  self.dataset = command.dataset;
  self.isUpdatedBySeq[seq] = true;
  self.logger("Longo Collection Worker Started", "info");
  return [null, []];
}

function doFind(dataset, query){
  "use strict";
  return [null, _.query(dataset, query)];
}

function doInsert(docs, seq) {
  "use strict";
  if (Utils.isZero(_.size(docs))){
    return [SKIP_REST, null];
  }
  var doc = _.omit(toDocument(_.first(docs)), UPDATE_OPERATORS);

  if (!doc._id) {
    doc._id = objectId();
  } else {
    if (_.where(self.dataset, {"_id":doc._id}).length > 0) return [new Longo.Error(Longo.Error.DUPLICATE_KEY_ERROR, "_id: "+doc._id), doc];
  }
  self.dataset.push(doc);
  self.isUpdatedBySeq[seq] = true;
  return doInsert(_.rest(docs), seq);
}

function updateById(current, doc, seq) {
  "use strict";
  doc = toDocument(doc);
  if (doc._id) return [new Longo.Error(Longo.Error.MOD_ID_NOT_ALLOWED, "_id: "+doc._id), null];

  var operators = _.pick(doc, UPDATE_OPERATORS);
  var normal    = _.omit(doc, UPDATE_OPERATORS);

  if (_.size(operators) > 0 ) {
    if (_.size(normal) > 0) return [new Longo.Error(Longo.Error.INVALID_MODIFIER_SPECIFIED, normal[0]), null];

    doc = applyOperator(doc, current);
  }
  doc._id = current._id;
  self.dataset = _.reject(self.dataset, function(d){return d._id === current._id;}).concat([doc]);
  self.isUpdatedBySeq[seq] = true;
  return [null, null];
}

function doUpdate(query, update, option, seq) {
  "use strict";
  var hits, current;
  hits = doFind(self.dataset, query)[1];

  if (Utils.isZero(_.size(hits))) {
    if (option.upsert) return doInsert(Utils.toArray(update), seq);
    return [new Longo.Error(Longo.Error.DOCUMENT_NOT_FOUND, "query: "+JSON.stringify(query)), null];
  } else if (Utils.isOne(_.size(hits))) {
    current = hits[0];
    return updateById(current, update, seq);
  } else {
    if (!option.multi) return updateById(hits[0], update, seq);
    if (update._id) return [new Longo.Error(Longo.Error.MOD_ID_NOT_ALLOWED, "_id: "+update._id), null];

    var res = [null, null];
    _.every(hits, function(current){
      res = updateById(current, update, seq);
      return res[0] === null;
    });
    return res;
  }
}

function doSave(docs, seq){
  "use strict";
  var doc, result;
  if (Utils.isZero(_.size(docs))){
    return [SKIP_REST, null];
  }
  doc = _.first(docs);

  if (!doc._id) {
    result = doInsert(Utils.toArray(doc), seq);
  } else {
    result = doUpdate({"_id": doc._id}, doc, {upsert:true}, seq);
    if (result[0] && result[0] !== SKIP_REST) return result;
  }
  return doSave(_.rest(docs), seq);
}

function doRemove(query, justOne, seq){
  "use strict";
  var hits = doFind(self.dataset, query)[1],
      ids;

  if (Utils.isZero(_.size(hits))) return [new Longo.Error(Longo.Error.DOCUMENT_NOT_FOUND, "query: "+JSON.stringify(query)), null];

  if (justOne){
    self.dataset = _.reject(self.dataset, function(doc){ return doc._id === hits[0]._id;});
  } else {
    ids = _.pluck(hits, "_id");
    self.dataset = _.reject(self.dataset, function(doc){ return _.contains(ids, doc._id);});
  }
  self.isUpdatedBySeq[seq] = true;
  return [null, null];
}

function doProject(dataset, projection){
  "use strict";
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
}

function doLimit(dataset, limit){
  "use strict";
  return [null, _.first(dataset, limit)];
}

function doSkip(dataset, skip){
  "use strict";
  return [null, _.rest(dataset, skip)];
}

function doCount(dataset){
  "use strict";
  return [SKIP_REST, [_.size(dataset)]];
}

function doSize(dataset){
  "use strict";
  return [SKIP_REST, [Utils.str2ab(JSON.stringify(dataset)).bytesize]];
}

function doToArray(dataset){
  "use strict";
  return [null, dataset];
}

function doMax(dataset, indexBounds){
  "use strict";
  var k, v, query;
  k = _.keys(indexBounds);
  v = _.values(indexBounds, function(val){
    return {"$lte": val};
  });
  query = _.object(k, v);
  return doFind(dataset, query);
}

function doMin(dataset, indexBounds){
  "use strict";
  var k, v, query;
  k = _.keys(indexBounds);
  v = _.values(indexBounds, function(val){
    return {"$gte": val};
  });
  query = _.object(k, v);
  return doFind(dataset, query);
}

function doForEach(dataset, func){
  /*jshint -W054 */
  "use strict";
  if (!func) return [null, dataset];
  var f = (new Function(func+""))();
  try {
    return [null, _.forEach(dataset, f)];
  } catch (e){
    return [new Longo.Error(Longo.Error.EVAL_ERROR, "function: "+func, e.stack), null];
  }
}

function doMap(dataset, func){
  /*jshint -W054 */
  "use strict";
  if (!func) return [null, dataset];
  var f = (new Function(func+""))();
  try {
    return [null, _.map(dataset, f)];
  } catch (e){
    return [new Longo.Error(Longo.Error.EVAL_ERROR, "function: "+func, e.stack), null];
  }
}

function doSort(dataset, sorter) {
  "use strict";
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
}

function getExecuter(seq){
  "use strict";
  return function(memo, command){
    var error   = memo[0],
        dataset = memo[1]
        ;

    if (error) return memo;

    switch(command.cmd) {
    case "start":
      return doStart(command, seq);
    case "find":
      return doFind(dataset, toQuery(command.criteria));
    case "insert":
      return doInsert(Utils.toArray(Utils.getOrElse(command.doc),[]), seq);
    case "save":
      return doSave(Utils.toArray(command.doc), seq);
    case "update":
      return doUpdate(toQuery(command.criteria), Utils.getOrElse(command.update, {}), Utils.getOrElse(command.option, {}), seq);
    case "remove":
      return doRemove(toQuery(command.criteria), Utils.getOrElse(command.justOne, false), seq);
    case "project":
      return doProject(dataset, Utils.getOrElse(command.projection,{}));
    case "limit":
      return doLimit(dataset, Utils.getOrElse(command.value, 15));
    case "skip":
      return doSkip(dataset, Utils.getOrElse(command.value, 0));
    case "count":
      return doCount(dataset);
    case "size":
      return doSize(dataset);
    case "toArray":
      return doToArray(dataset);
    case "max":
      return doMax(dataset, Utils.getOrElse(command.indexBounds, {}));
    case "min":
      return doMin(dataset, Utils.getOrElse(command.indexBounds, {}));
    case "forEach":
      return doForEach(dataset, Utils.getOrElse(command.func, null));
    case "map":
      return doMap(dataset, Utils.getOrElse(command.func, null));
    case "sort":
      return doSort(dataset, Utils.getOrElse(command.sorter, {"_id":1}));


    default :
      return memo;
    }
  };
}


// self is WebWorker's global context
self.send = function(message) {
  "use strict";
  message.seqs = self.seqs;
  var json  = JSON.stringify(message),
      bytes = Utils.str2ab(json)
      ;
  self.postMessage(bytes, [bytes.buffer]);
};

self.addEventListener("message", function(e) {
  "use strict";

  var request, data, cmds, seq, result = [], executer;
  request = Utils.tryParseJSON(Utils.ab2str(e.data));

  if (request[0]) return self.send({"seq":-1, "error": request[0], "result": []});

  data = request[1] || {};
  cmds = data.cmds;
  seq  = data.seq;
  self.isUpdatedBySeq[seq] = false;
  executer = getExecuter(seq);

  result = _.reduce(cmds, executer, [null, self.dataset]);

  if (result[0] === SKIP_REST ) result[0] = null;

  self.send({"seq": seq, "error": result[0] , "result": result[1], "isUpdated":self.isUpdatedBySeq[seq]});

}, false);
