/* global self:false */
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


// Global objects
var Longo, _;
if (typeof importScripts !== "undefined") {
  // For WebWorker
  importScripts("./lib/underscore/underscore-min.js",
    "./lib/underscore-query/lib/underscore-query.min.js",
    "./longo.js");
} else {
  // For command line test
  _ = require("underscore");
  require("underscore-query")(_);
  Longo = require("./longo.js");
}

(function(global, Longo, _, undefined) {
  "use strict";

  var _console = (typeof console !== "undefined") ? console : {};
  var logger = function(obj, method) {
    var loglevel = method || "log";
    // console in WebWorker thread does not accept more than one arguments
    // eg. console.log(1,2,3); -> console display just only `1`
    // So use JSON
    var msg = {
      "msg": obj,
      "workerName": Worker.name
    };
    if (typeof _console !== undefined && _console[loglevel]) _console[loglevel].call(_console, JSON.stringify(msg));
  };

  var Worker = {};
  var Utils = Longo.Utils;


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

  var gctx = {};
  gctx.dataset = [];
  gctx.option = {
    capped: false
  };
  gctx.isUpdatedBySeq = {};

  Worker.getDataset = function(ctx) {
    var _ctx = ctx || gctx;
    return _ctx.dataset;
  };

  Worker.setDataset = function(dataset, ctx) {
    var _ctx = ctx || gctx;
    _ctx.dataset = dataset;
  };


  Worker.applyOperator = function(doc, current) {
    var result = _.identity(current);
    var operators = _.keys(doc);
    var pairs;

    _.each(operators, function(op) {
      pairs = doc[op];
      switch (op) {
      case "$inc":
        _.each(_.keys(pairs), function(k) {
          if (_.isNumber(current[k]) && _.isNumber(pairs[k])) result[k] = current[k] + pairs[k];
        });
        break;
      case "$mul":
        _.each(_.keys(pairs), function(k) {
          if (_.isNumber(current[k]) && _.isNumber(pairs[k])) result[k] = current[k] * pairs[k];
        });
        break;
      case "$rename":
        _.each(_.keys(pairs), function(k) {
          if (_.has(current, k)) result[pairs[k]] = current[k];
        });
        break;
      case "$set":
        _.each(_.keys(pairs), function(k) {
          if (_.has(current, k)) result[k] = pairs[k];
        });
        break;
      case "$unset":
        _.each(_.keys(pairs), function(k) {
          if (_.has(current, k)) delete result[k];
        });
        break;
      case "$mod":
        _.each(_.keys(pairs), function(k) {
          if (_.isNumber(current[k]) && _.isNumber(pairs[k])) result[k] = current[k] % pairs[k];
        });
        break;
      default:
        //noop
      }
    });
    return result;
  };


  Worker.parseDotQuery = function(v,k){
    var token, parent, child, matcher;
    if (k.indexOf(".") > 0) {
      token = k.split(".");
      child  = _.last(token);
      parent = _.initial(token).join(".");
      matcher = {};
      matcher[child] = v;
      return Worker.parseDotQuery({$elemMatch:matcher}, parent);
    } else {
      return [v, k];
    }
  };

  Worker.toQuery = function(query) {
    var q = Utils.checkOrElse(query, {}, function(val) {
      return _.isObject(val);
    });

    var queryArray = {};
    _.each(q, function(v,k){
      if (_.contains(k, ".")){
        var tuple = Worker.parseDotQuery(v, k);
        var or = {};
        or[k] = v;
        or[tuple[1]] = tuple[0];
        queryArray.$or = or;
      } else {
        queryArray[k] = v;
      }
    });

    return queryArray;
  };

  Worker.toDocument = function(doc) {
    if (_.isObject(doc) && !_.isArray(doc)) return doc;
    var arr = Utils.toArray(doc);
    var keys = _.keys(arr);
    return _.object(keys, arr);
  };

  Worker.isSizeReached = function(dataset, doc, size) {
    var max = size || 1024 * 1024,
      current = Utils.str2ab(JSON.stringify(dataset)).byteLength,
      param = Utils.str2ab(JSON.stringify(doc)).byteLength;
    return current + param > max;
  };

  Worker.isCountReached = function(dataset, max) {
    return _.size(dataset) + 1 > (max || 1000);
  };


  // side effect to the ctx
  Worker.doStart = function(command, seq, ctx) {
    var _ctx = ctx || gctx;
    _ctx.name = command.name;
    _ctx.option = command.option;
    _ctx.dataset = command.dataset;
    if (!_ctx.isUpdatedBySeq) _ctx.isUpdatedBySeq = {};
    _ctx.isUpdatedBySeq[seq] = true;
    logger("Longo Collection Worker Started", "info");
    return [null, []];
  };

  Worker.doFind = function(dataset, query) {
    var q = Worker.toQuery(query);
    return [null, _.query(dataset, q)];
  };

  // side effect to the ctx
  Worker.doInsert = function(docs, seq, ctx) {
    var _ctx = ctx || gctx;
    if (Utils.isZero(_.size(docs))) {
      return [SKIP_REST, null];
    }
    if (!_ctx.dataset) _ctx.dataset = [];

    // TODO : what does this line mean ?
    var doc = _.omit(Worker.toDocument(_.first(Utils.toArray(docs))), UPDATE_OPERATORS);

    if (!doc._id) {
      doc._id = Utils.objectId();
    } else {
      if (_.where(_ctx.dataset, {
        "_id": doc._id
      }).length > 0) return [new Longo.Error(Longo.Error.DUPLICATE_KEY_ERROR, "_id: " + doc._id), doc];
    }

    if (_ctx.option.capped) {
      // Check max size of dataset
      if (Worker.isSizeReached(_ctx.dataset, doc, _ctx.option.size)) {
        logger("Reached to size count for capped Collection. Size: " + _ctx.option.size, "warn");
        _ctx.dataset.shift();
        if (_ctx.dataset.length === 0) return [SKIP_REST, null];
        return Worker.doInsert(docs, seq, _ctx);
      }
      // Check max count of dataset
      if (Worker.isCountReached(_ctx.dataset, _ctx.option.max)) {
        logger("Reached to max count for capped Collection. Count: " + _ctx.option.max, "warn");
        _ctx.dataset.shift();
      }
    }

    _ctx.dataset.push(doc);
    _ctx.isUpdatedBySeq[seq] = true;
    return Worker.doInsert(_.rest(docs), seq, _ctx);
  };

  // side effect to the ctx
  Worker.updateById = function(current, doc, seq, ctx) {
    var _ctx = ctx || gctx;
    doc = Worker.toDocument(doc);
    if (doc._id && current._id !== doc._id) return [new Longo.Error(Longo.Error.MOD_ID_NOT_ALLOWED, "_id: " + doc._id), null];

    var operators = _.pick(doc, UPDATE_OPERATORS);
    var normal = _.omit(doc, UPDATE_OPERATORS);

    if (_.size(operators) > 0) {
      if (_.size(normal) > 0) return [new Longo.Error(Longo.Error.INVALID_MODIFIER_SPECIFIED, normal[0]), null];

      doc = Worker.applyOperator(doc, current);
    }
    doc._id = current._id;
    _ctx.dataset = _.reject(_ctx.dataset, function(d) {
      return d._id === current._id;
    }).concat([doc]);
    _ctx.isUpdatedBySeq[seq] = true;
    return [null, null];
  };

  // side effect to the ctx
  Worker.doUpdate = function(query, update, option, seq, ctx) {
    var _ctx = ctx || gctx;
    var hits, current;
    hits = Worker.doFind(_ctx.dataset, query)[1];

    if (Utils.isZero(_.size(hits))) {
      if (option.upsert) return Worker.doInsert(update, seq, _ctx);
      return [new Longo.Error(Longo.Error.DOCUMENT_NOT_FOUND, "query: " + JSON.stringify(query)), null];
    } else if (Utils.isOne(_.size(hits))) {
      current = hits[0];
      return Worker.updateById(current, update, seq, _ctx);
    } else {
      if (!option.multi) return Worker.updateById(hits[0], update, seq, _ctx);
      if (update._id && current._id !== update._id) return [new Longo.Error(Longo.Error.MOD_ID_NOT_ALLOWED, "_id: " + update._id), null];

      var res = [null, null];
      _.every(hits, function(current) {
        res = Worker.updateById(current, update, seq, _ctx);
        return res[0] === null;
      });
      return res;
    }
  };

  // side effect to the ctx
  Worker.doSave = function(docs, seq, ctx) {
    var _ctx = ctx || gctx;
    var doc, result;
    docs = Utils.toArray(docs);
    if (Utils.isZero(_.size(docs))) {
      return [SKIP_REST, null];
    }
    doc = _.first(docs);

    if (!doc._id) {
      result = Worker.doInsert(doc, seq, _ctx);
    } else {
      result = Worker.doUpdate({
        "_id": doc._id
      }, doc, {
        upsert: true
      }, seq, _ctx);
      if (result[0] && result[0] !== SKIP_REST) return result;
    }
    return Worker.doSave(_.rest(docs), seq, _ctx);
  };

  // side effect to the ctx
  Worker.doRemove = function(query, justOne, seq, ctx) {
    var _ctx = ctx || gctx;
    var hits = Worker.doFind(_ctx.dataset, query)[1],
      ids;

    if (Utils.isZero(_.size(hits))) return [new Longo.Error(Longo.Error.DOCUMENT_NOT_FOUND, "query: " + JSON.stringify(query)), null];

    if (justOne) {
      _ctx.dataset = _.reject(_ctx.dataset, function(doc) {
        return doc._id === hits[0]._id;
      });
    } else {
      ids = _.pluck(hits, "_id");
      _ctx.dataset = _.reject(_ctx.dataset, function(doc) {
        return _.contains(ids, doc._id);
      });
    }
    _ctx.isUpdatedBySeq[seq] = true;
    return [null, null];
  };

  Worker.doProject = function(dataset, projection) {
    var pairs = _.pairs(projection),
      includes = _.filter(pairs, function(p) {
        return Utils.isOne(p[1]) || Utils.isTrue(p[1]);
      }),
      excludes = _.filter(pairs, function(p) {
        return Utils.isZero(p[1]) || Utils.isFalse(p[1]);
      }),
      keys;

    if (_.size(includes) > 0) {
      keys = _.pluck(includes, "0");
      if (Utils.isZero(projection._id) || Utils.isFalse(projection._id)) {
        keys = _.without(keys, "_id");
      } else {
        keys = _.union(keys, ["_id"]);
      }
      return [null, _.map(dataset, function(d) {
        return _.pick(d, keys);
      })];
    } else {
      keys = _.pluck(excludes, "0");
      return [null, _.map(dataset, function(d) {
        return _.omit(d, keys);
      })];
    }
  };

  Worker.doLimit = function(dataset, limit) {
    return [null, _.first(dataset, limit)];
  };

  Worker.doSkip = function(dataset, skip) {
    return [null, _.rest(dataset, skip)];
  };

  Worker.doCount = function(dataset) {
    return [SKIP_REST, [_.size(dataset)]];
  };

  Worker.doSize = function(dataset) {
    return [SKIP_REST, [Utils.str2ab(JSON.stringify(dataset)).byteLength]];
  };

  Worker.doToArray = function(dataset) {
    return [null, Utils.toArray(dataset)];
  };

  Worker.doMax = function(dataset, indexBounds) {
    var k, v, query;
    k = _.keys(indexBounds);
    v = _.values(indexBounds, function(val) {
      return {
        "$lte": val
      };
    });
    query = _.object(k, v);
    return Worker.doFind(dataset, query);
  };

  Worker.doMin = function(dataset, indexBounds) {
    var k, v, query;
    k = _.keys(indexBounds);
    v = _.values(indexBounds, function(val) {
      return {
        "$gte": val
      };
    });
    query = _.object(k, v);
    return Worker.doFind(dataset, query);
  };

  Worker.doForEach = function(dataset, func) {
    /*jshint -W054 */
    if (!func) return [null, dataset];
    var f = (new Function(func + ""))();
    try {
      return [null, _.forEach(dataset, f)];
    } catch (e) {
      return [new Longo.Error(Longo.Error.EVAL_ERROR, "function: " + func, e.stack), null];
    }
  };

  Worker.doMap = function(dataset, func) {
    /*jshint -W054 */
    if (!func) return [null, dataset];
    var f = (new Function(func + ""))();
    try {
      return [null, _.map(dataset, f)];
    } catch (e) {
      return [new Longo.Error(Longo.Error.EVAL_ERROR, "function: " + func, e.stack), null];
    }
  };

  Worker.doSort = function(dataset, sorter) {
    var sorted;
    /*jshint -W054 */
    if (_.isString(sorter)) {
      var f = (new Function(sorter + ""))();
      try {
        sorted = _.sortBy(dataset, f);
        // remove trailing comma
        if (_.isEmpty(_.last(sorted))) sorted = _.initial(sorted);
        return [null, sorted];
      } catch (e) {
        return [new Longo.Error(Longo.Error.EVAL_ERROR, "sorter: " + sorter, e.stack), null];
      }
    } else {
      var key = _.keys(sorter)[0],
        order = sorter[key];
      sorted = _.sortBy(dataset, key);

      // remove trailing comma
      if (_.isEmpty(_.last(sorted))) sorted = _.initial(sorted);
      if (!Utils.isOne(order)) return [null, sorted.reverse()];
      return [null, sorted];
    }
  };

  Worker.getExecuter = function(seq, ctx) {
    var _ctx = ctx || gctx;
    return function(memo, command) {
      var error = memo[0],
        dataset = memo[1];

      if (error) return memo;

      switch (command.cmd) {

      // start/insert/save/update/remove will change dataset of ctx
      case "start":
        return Worker.doStart(command, seq, _ctx);
      case "insert":
        return Worker.doInsert(Utils.toArray(Utils.getOrElse(command.doc), []), seq, _ctx);
      case "save":
        return Worker.doSave(Utils.toArray(command.doc), seq, _ctx);
      case "update":
        return Worker.doUpdate(command.query, Utils.getOrElse(command.update, {}), Utils.getOrElse(command.option, {}), seq, _ctx);
      case "remove":
        return Worker.doRemove(command.query, Utils.getOrElse(command.justOne, false), seq, _ctx);

      // rest commands have no side effect
      case "find":
        return Worker.doFind(dataset, command.query);
      case "project":
        return Worker.doProject(dataset, Utils.getOrElse(command.projection, {}));
      case "limit":
        return Worker.doLimit(dataset, Utils.getOrElse(command.value, 15));
      case "skip":
        return Worker.doSkip(dataset, Utils.getOrElse(command.value, 0));
      case "count":
        return Worker.doCount(dataset);
      case "size":
        return Worker.doSize(dataset);
      case "toArray":
        return Worker.doToArray(dataset);
      case "max":
        return Worker.doMax(dataset, Utils.getOrElse(command.indexBounds, {}));
      case "min":
        return Worker.doMin(dataset, Utils.getOrElse(command.indexBounds, {}));
      case "forEach":
        return Worker.doForEach(dataset, Utils.getOrElse(command.func, null));
      case "map":
        return Worker.doMap(dataset, Utils.getOrElse(command.func, null));
      case "sort":
        return Worker.doSort(dataset, Utils.getOrElse(command.sorter, {"_id": 1}));

      default:
        return memo;
      }
    };
  };

  global.postMessage = global.webkitPostMessage || global.postMessage || function() {};
  Worker.send = function(message) {
    message.seqs = self.seqs;
    var json = JSON.stringify(message),
      bytes = Utils.str2ab(json);
    global.postMessage(bytes, [bytes]);
  };

  global.addEventListener = global.addEventListener || function() {};
  global.addEventListener("message", function(e) {

    var request, data, cmds, seq, result = [],
      executer;
    request = Utils.tryParseJSON(Utils.ab2str(e.data));

    if (request[0]) {
      return Worker.send({
        "seq": -1,
        "error": request[0],
        "result": []
      });
    }

    data = request[1] || {};
    cmds = data.cmds;
    seq = data.seq;
    gctx.isUpdatedBySeq[seq] = false;
    executer = Worker.getExecuter(seq, gctx);

    try {
      result = _.reduce(cmds, executer, [null, Worker.getDataset()]);
    } catch (err) {
      return Worker.send({
        "seq": seq,
        "error": err,
        "result": []
      });
    }

    if (result[0] === SKIP_REST) result[0] = null;

    Worker.send({
      "seq": seq,
      "error": result[0],
      "result": result[1],
      "isUpdated": gctx.isUpdatedBySeq[seq]
    });
  }, false);

  if (typeof exports !== "undefined") {
    if (typeof module !== "undefined" && module.exports) {
      module.exports = Worker;
    }
    exports.LongoWorker = Worker;
  }

  // self is global at WebWorker thread
})((typeof self !== "undefined") ? self : this, Longo, _);