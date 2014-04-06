importScripts('./lib/underscore/underscore.js');

function ObjectId(){
  this.val = Date.now();
}


var db = [];
self.addEventListener('message', function(e) {
  var data   = e.data   || {},
      cmd    = data.cmd || 'unknown',
      seq    = data.seq || -1,
      result = []
      ;

  switch (cmd) {

    case 'start':
      self.Logger = {};
      self.Logger.log = function(msg){console.log("Longo." + data.name + ": "+ msg);};
      self.Logger.error = function(msg){console.error("Longo." + data.name + ": "+ msg);};
      self.Logger.log("start");

      self.postMessage({"seq":seq, "errCd":0});
      break;

    case 'drop':
      self.db = null;
      self.postMessage({"seq":seq, "errCd":0});
      self.close(); // Terminates the worker.
      break;

    case 'findAll':
      result = project(self.db, data.projection);
      self.postMessage({"seq":seq, "errCd":0, "result":result});
      break;

    case 'save':
      if (!data.doc["_id"]) data.doc["_id"] = new ObjectId();
      self.db.push(data.doc);
      self.postMessage({"seq":seq, "errCd":0, "result":data.doc});
      break;

    case 'removeAll':
      self.db = [];
      self.postMessage({"seq":seq, "errCd":0, "result":[]});
      break;

    default:
      self.postMessage({"seq":seq, "errCd":1, "result":cmd + " is not supported."});
  }
}, false);


function noop(){
  return void 0;
}
function asNoop(){
  return noop;
}

function aSlice(obj){
  return Array.prototype.slice.apply(obj);
}

function isArray(obj){
  return Array.isArray ? Array.isArray(obj) : (toString.call(obj) === "[object Array]");
}

function toArray(obj) {
  return isArray(obj) ? obj : [obj];
}

function existy(val){
  return val !== null && val !== undefined;
}

function truthy(val){
  return (val !== false) && existy(val);
}

function isTrue(val){
  return val === true;
}

function isFalse(val){
  return val === false;
}

function isNegativeNum(val){
  return !truthy(val) || (_.isNumber(val) && val < 0);
}

function isZero(val){
  return val === 0;
}

function isOne(val){
  return val === 1;
}

function isPositiveNum(val){
  return !isNegative(val) && !isZero(val);
}

function doWhen(cond, action, values, context) {
  var arr = toArray(values);
  if(truthy(cond))
    return action.apply(context, arr);
  else
    return undefined;
}

function doWhenOrElse(cond, action, alternative, values, context) {
  var arr = toArray(values);
  if(truthy(cond))
    return action.apply(context, arr);
  else
    return alternative.apply(context, arr);
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
function project(data, projection){
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


