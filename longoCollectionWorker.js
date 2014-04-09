/*
 * longo
 * https://github.com/georgeOsdDev/Longo
 *
 * The MIT License (MIT)
 * Copyright (c) 2014 Takeharu Oshida <georgeosddev@gmail.com>
 */

/* global self:false, Longo:false */

// import utilities
importScripts("./longo.js",
              "./lib/underscore/underscore.js",
              "./lib/underscore-query/lib/underscore-query.min.js");

var Utils = Longo.Utils;

// global parameter for this collection worker
self.dataset = [];
self.option  = {
  capped:false,
};

var SKIP_REST = "SKIP_REST";

// var operator = {

//   $gt: function(a, b) {
//         return b < a;
//       },
//   $gte: function(a, b) {
//         return b <= a;
//       },
//   $in: function(a, b) {
//         return _.contains(Utils.toArray(b), a);
//       }
//   $lt: function(a, b) {
//         return a < b;
//       },
//   $lte: function(a, b) {
//         return a <= b;
//       },
//   $ne: function(a, b) {
//         return a != b;
//       },

//   $nin: function(a, b) {
//         return !_.contains(Utils.toArray(b), a);
//       },

//   $or: function(list){
//         _.map(list, query);
//         _.some(a);
//       },
//   $and: function(list){
//         _.every(a);
//       }
//   $not: function(expression){
//           return !expression;
//         }
//   $nor: function()

//   $exists
//   $type

//   $mod
//   $regex
//   $text
//   $where

//   $all
//   $elemMatch
//   $size

// }

function objectId(val){
  "use strict";
  return val || Date.now();
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

function doStart(command){
  "use strict";
  self.option = command.option;
  self.dataset = command.dataset;
  return[null, []];
}

function doFind(dataset, query){
  "use strict";

  // TODO
  // implement find poeration for query operator

  return [null, _.where(dataset, query)];
  // return [null, _.query(dataset, query)];
}

function doInsert(docs) {
  "use strict";
  if (Utils.isZero(_.size(docs))){
    return [SKIP_REST, null];
  }
  var doc = toDocument(_.first(docs));

  if (!doc._id) {
    doc._id = objectId();
  } else {
    if (_.where(self.dataset, {"_id":doc._id}).length > 0) return [Longo.Error.DUPLICATE_KEY_ERROR, doc];
  }
  self.dataset.push(doc);
  return doInsert(_.rest(docs));
}

function updateById(id, doc) {
  "use strict";
  doc = toDocument(doc);
  if (doc._id) return [Longo.Error.MOD_ID_NOT_ALLOWED, null];
  doc._id = id;
  self.dataset = _.reject(self.dataset, function(d){return d._id === id;}).concat([doc]);
  return [null, null];
}

function doUpdate(query, update, option) {
  "use strict";
  var hits, current;
  hits = _.query(self.dataset, query);

  if (Utils.isZero(_.size(hits))) {
    if (option.upsert) return doInsert(Utils.toArray(update));
    return [Longo.Error.DOCUMENT_NOT_FOUND, null];
  } else if (Utils.isOne(_.size(hits))) {
    current = hits[0];
    return updateById(current._id, update);
  } else {
    if (!option.multi) hits = _.first(hits);
    if (update._id) return [Longo.Error.MOD_ID_NOT_ALLOWED, null];
    _.each(hits, function(current){
      updateById(current._id, update);
    });
    return [null, null];
  }
}

function doSave(docs){
  "use strict";
  var doc, result;
  if (Utils.isZero(_.size(docs))){
    return [SKIP_REST, null];
  }
  doc = _.first(docs);

  if (!doc._id) {
    result = doInsert(Utils.toArray(doc));
    if (result[0]/*error*/) return result;
  } else {
    result = doUpdate({"_id": doc._id}, doc, {upsert:true});
    if (result[0]/*error*/) return result;
  }
  return doSave(_.rest(docs));
}

// http://stackoverflow.com/questions/1248302/javascript-object-size
function roughSizeOfObject( object ) {
  "use strict";
  var objectList = [];
  var stack = [ object ];
  var bytes = 0;

  while ( stack.length ) {
    var value = stack.pop();
    if ( typeof value === 'boolean'){
      bytes += 4;
    } else if (typeof value === 'string'){
      bytes += value.length * 2;
    } else if (typeof value === 'number'){
      bytes += 8;
    } else if (typeof value === 'object' && objectList.indexOf( value ) === -1){
      objectList.push(value);
      for (var i in value) {
        stack.push(value[ i ]);
      }
    }
  }
  return bytes;
}


/**
 * http://docs.mongodb.org/manual/reference/method/db.collection.find/#definition
 *
 * The projection parameter takes a document of the following form:
 * { field1: <boolean>, field2: <boolean> ... }
 * The <boolean> value can be any of the following:

 * - 1 or true to include the field.
 * The find() method always includes the _id field
 * even if the field is not explicitly stated to return in the projection parameter.
 *
 * - 0 or false to exclude the field.
 * A projection cannot contain both include and exclude specifications, except for the exclusion of the _id field.
 * In projections that explicitly include fields, the _id field is the only field that you can explicitly exclude.
 */
function project(dataset, projection){
  "use strict";
  var pairs     = _.pairs(projection),
      includes  = _.filter(pairs, function(p){return isOne(p[1])  || isTrue(p[1]);}),
      excludes  = _.filter(pairs, function(p){return isZero(p[1]) || isFalse(p[1]);}),
      keys
      ;

  if (_.size(includes) > 0) {
    keys = _.pluck(includes, "0");
    if (isZero(projection["_id"]) || isFalse(projection["_id"])){
      keys = _.without(keys, "_id");
    } else {
      keys = _.union(keys, ["_id"]);
    }
    return _.map(data, function(d){return _.pick(d, keys);});
  } else {
    keys = _.pluck(excludes, "0");
    return _.map(data, function(d){return _.omit(d, keys);});
  }
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

self.doCommand = function(memo, command) {
  "use strict";
  var error   = memo[0],
      dataset = memo[1]
      ;

  if (error) return memo;

  switch(command.cmd) {
  case "start":
    return doStart(command);
  case "find":
    return doFind(memo[1], toQuery(command.criteria));
  case "insert":
    return doInsert(Utils.toArray(Utils.getOrElse(command.doc),[]));
  case "save":
    return doSave(Utils.toArray(command.doc));
  case "update":
    return doUpdate(toQuery(command.criteria), Utils.getOrElse(command.update, {}), Utils.getOrElse(command.option, {}));

  default :
    return memo;
  }
};

self.addEventListener("message", function(e) {
  "use strict";
  var request, data, cmds, seq, result = [];
  request = Utils.tryParseJSON(Utils.ab2str(e.data));

  if (request[0]) return self.send({"seq":-1, "error": request[0], "result": []});

  data = request[1] || {};
  cmds = data.cmds;
  seq  = data.seq;

  result = _.reduce(cmds, self.doCommand, [null, self.dataset]);

  if (result[0] === SKIP_REST ) result[0] = null;

  self.send({"seq": seq, "error": result[0] , "result": result[1]});

}, false);
