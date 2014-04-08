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


function ObjectId(){
  "use strict";
  this.val = Date.now();
}

function doStart(command){
  "use strict";
  self.option = command.option;
  return[null, []];
}

function doFind(dataset, criteria){
  "use strict";
  var query = !_.isObject(criteria) ? (!_.isArray(criteria) && !_.isFunction(criteria)) ? criteria : {} : {};
  return [null, _.query(dataset, query)];
}

function doInsert(docs) {
  "use strict";
  if (_.size(docs) === 0){
    return [SKIP_REST, []];
  }
  var doc = _.first(docs);

  if (!doc._id) {
    doc._id = new ObjectId();
  } else {
    if (_.where(self.dataset, {"_id":doc._id}).length > 0) return [Longo.Error.DUPLICATE_KEY_ERROR, doc];
  }
  self.dataset.push(doc);
  return doInsert(_.rest(docs));
}



// http://stackoverflow.com/questions/1248302/javascript-object-size
function roughSizeOfObject( object ) {
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
    return doFind(self.dataset, Utils.getOrElse(command.criteria, {}));
  case "insert":
    return doInsert(Utils.toArray(Utils.getOrElse(command.doc),[]));
  default :
    return dataset;
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
