// For command line test
if (typeof module !== "undefined" && module.exports) {
  /*jshint -W079 */
  var expect = require("chai").expect;
  var _ = require("underscore");
  require("underscore-query")(_);
  var Longo = require("../../dest/longo.js");
  /*jshint +W079 */
}

/* global Longo,_: false */
(function () {
  "use strict";

  var StabCollection = function(){
    this.name   = "stub";
    this.logger = {};
    this.logger.warn  = function(){};
    this.logger.error = function(){};
    this.executed = {
      called:0,
      args:[]
    };
  };
  StabCollection.prototype._send = function(message, cb, observe){
    this.executed.called++;
    this.executed.args.push([message, cb, observe]);
  };
  var cmd = {"cmd":"test"};
  var cmd2 = {"cmd":"test2"};
  var func = function(){};

  describe("Test for Longo.Cursor", function(){
    it("construct with argument", function (done) {
      var c = new Longo.Cursor(new StabCollection(), cmd, func);
      expect(c.collection.name).to.be.eql("stub");
      expect(c.cmds).have.length(1);
      expect(c.cmds[0]).have.property("cmd","test");
      expect(c.wrapCb).have.length(1);
      expect(c.wrapCb[0]).to.be.eql(func);
      done();
    });
    it("construct with Cursor instance", function (done) {
      var c1 = new Longo.Cursor(new StabCollection(), cmd, func);
      var c2 = new Longo.Cursor(c1, cmd2);

      expect(c2.collection.name).to.be.eql("stub");
      expect(c2.cmds).have.length(2);
      expect(c2.cmds[0]).have.property("cmd","test");
      expect(c2.cmds[1]).have.property("cmd","test2");
      expect(c2.wrapCb).have.length(1);
      expect(c2.wrapCb[0]).to.be.eql(func);
      done();
    });
  });

  describe("Test for cursor methods", function(){
    var col, c1;
    beforeEach(function(done){
      col = new StabCollection();
      c1 = new Longo.Cursor(col, cmd, func);
      done();
    });
    describe("Test for execution",function(){
      describe("done", function(){
        it("execute `_send` method of collection", function(done){
          c1.done();
          expect(col.executed.called).to.be.eql(1);
          var args = col.executed.args[0];
          var msg = args[0];
          var cb  = args[1];
          var observe  = args[2];
          expect(msg.cmds).have.length(1);
          expect(msg.cmds[0]).have.property("cmd","test");
          expect(typeof cb).to.be.eql("function");
          expect(observe).to.be.eql(undefined);
          done();
        });
      });
      describe("onValue", function(){
        it("execute `_send` method of collection", function(done){
          c1.onValue();
          expect(col.executed.called).to.be.eql(1);
          var args = col.executed.args[0];
          var msg = args[0];
          var cb  = args[1];
          var observe  = args[2];
          expect(msg.cmds).have.length(1);
          expect(msg.cmds[0]).have.property("cmd","test");
          expect(typeof cb).to.be.eql("function");
          expect(observe).to.be.eql(true);
          done();
        });
      });
      describe("assign", function(){
        it("execute `_send` method of collection", function(done){
          var $ = function(){
            return {html:function(){}};
          };
          c1.assign($("#a"), _.template("<div></div>"));
          expect(col.executed.called).to.be.eql(1);
          var args = col.executed.args[0];
          var msg = args[0];
          var cb  = args[1];
          var observe  = args[2];
          expect(msg.cmds).have.length(1);
          expect(msg.cmds[0]).have.property("cmd","test");
          expect(typeof cb).to.be.eql("function");
          expect(observe).to.be.eql(true);
          done();
        });
      });
      describe("promise", function(){
        it("execute `_send` method of collection, retunr promise object", function(done){
          var p = c1.promise();
          var args = col.executed.args[0];
          var msg = args[0];
          var cb  = args[1];
          var observe  = args[2];
          expect(msg.cmds).have.length(1);
          expect(msg.cmds[0]).have.property("cmd","test");
          expect(typeof cb).to.be.eql("function");
          expect(observe).to.be.eql(undefined);
          expect(p).have.property("then");
          expect(p).have.property("catch");
          done();
        });
      });
    });

    describe("Test for cmd pipeline", function(){
      describe("count", function(){
        it("add `count` command",function(done){
          var c2 = c1.count();
          expect(c2.collection.name).to.be.eql("stub");
          expect(c2.cmds).have.length(2);
          expect(c2.cmds[0]).have.property("cmd","test");
          expect(c2.cmds[1]).have.property("cmd","count");
          expect(c2.wrapCb).have.length(1);
          expect(c2.wrapCb[0]).to.be.eql(func);
          done();
        });
      });
      describe("limit", function(){
        it("add `limit` command",function(done){
          var c2 = c1.limit(10);
          expect(c2.collection.name).to.be.eql("stub");
          expect(c2.cmds).have.length(2);
          expect(c2.cmds[0]).have.property("cmd","test");
          expect(c2.cmds[1]).have.property("cmd","limit");
          expect(c2.cmds[1]).have.property("value",10);
          expect(c2.wrapCb).have.length(1);
          expect(c2.wrapCb[0]).to.be.eql(func);
          done();
        });
      });
      describe("forEach", function(){
        it("add `forEach` command, add function expression as string",function(done){
          var c2 = c1.forEach(function(val){
            return "this is forEach func:"+val;
          });
          expect(c2.collection.name).to.be.eql("stub");
          expect(c2.cmds).have.length(2);
          expect(c2.cmds[0]).have.property("cmd","test");
          expect(c2.cmds[1]).have.property("cmd","forEach");
          expect(c2.cmds[1]).have.property("func");
          var forEachFunc = c2.cmds[1].func;
          expect(typeof forEachFunc).to.be.eql("string");
          /*jshint -W054 */
          var compiledFunc = (new Function(forEachFunc + ""))();
          /*jshint +W054 */
          expect(compiledFunc("executed")).to.be.eql("this is forEach func:executed");
          expect(c2.wrapCb).have.length(1);
          expect(c2.wrapCb[0]).to.be.eql(func);
          done();
        });
      });
      describe("map", function(){
        it("add `map` command, add function expression as string",function(done){
          var c2 = c1.map(function(val){
            return "this is map func:"+val;
          });
          expect(c2.collection.name).to.be.eql("stub");
          expect(c2.cmds).have.length(2);
          expect(c2.cmds[0]).have.property("cmd","test");
          expect(c2.cmds[1]).have.property("cmd","map");
          expect(c2.cmds[1]).have.property("func");
          var mapFunc = c2.cmds[1].func;
          expect(typeof mapFunc).to.be.eql("string");
          /*jshint -W054 */
          var compiledFunc = (new Function(mapFunc + ""))();
          /*jshint +W054 */
          expect(compiledFunc("executed")).to.be.eql("this is map func:executed");
          expect(c2.wrapCb).have.length(1);
          expect(c2.wrapCb[0]).to.be.eql(func);
          done();
        });
      });
      describe("max", function(){
        it("add `max` command, add `limit` command",function(done){
          var index = {"_id":1};
          var c2 = c1.max(index);
          expect(c2.collection.name).to.be.eql("stub");
          expect(c2.cmds).have.length(3);
          expect(c2.cmds[0]).have.property("cmd","test");
          expect(c2.cmds[1]).have.property("cmd","max");
          expect(c2.cmds[1]).have.property("indexBounds",index);
          expect(c2.cmds[2]).have.property("cmd","limit");
          expect(c2.cmds[2]).have.property("value",1);
          expect(c2.wrapCb).have.length(1);
          expect(c2.wrapCb[0]).to.be.eql(func);
          done();
        });
      });
      describe("min", function(){
        it("add `min` command, add `limit` command",function(done){
          var index = {"_id":1};
          var c2 = c1.min(index);
          expect(c2.collection.name).to.be.eql("stub");
          expect(c2.cmds).have.length(3);
          expect(c2.cmds[0]).have.property("cmd","test");
          expect(c2.cmds[1]).have.property("cmd","min");
          expect(c2.cmds[1]).have.property("indexBounds",index);
          expect(c2.cmds[2]).have.property("cmd","limit");
          expect(c2.cmds[2]).have.property("value",1);
          expect(c2.wrapCb).have.length(1);
          expect(c2.wrapCb[0]).to.be.eql(func);
          done();
        });
      });
      describe("size", function(){
        it("add `count` command",function(done){
          var index = {"_id":1};
          var c2 = c1.size(index);
          expect(c2.collection.name).to.be.eql("stub");
          expect(c2.cmds).have.length(2);
          expect(c2.cmds[0]).have.property("cmd","test");
          expect(c2.cmds[1]).have.property("cmd","count");
          expect(c2.wrapCb).have.length(1);
          expect(c2.wrapCb[0]).to.be.eql(func);
          done();
        });
      });
      describe("skip", function(){
        it("add `skip` command",function(done){
          var c2 = c1.skip(10);
          expect(c2.collection.name).to.be.eql("stub");
          expect(c2.cmds).have.length(2);
          expect(c2.cmds[0]).have.property("cmd","test");
          expect(c2.cmds[1]).have.property("cmd","skip");
          expect(c2.cmds[1]).have.property("value",10);
          expect(c2.wrapCb).have.length(1);
          expect(c2.wrapCb[0]).to.be.eql(func);
          done();
        });
      });
      describe("sort", function(){
        it("add `sort` command, and sorter query if sorter is not function",function(done){
          var sorter = {"_id": 1};
          var c2 = c1.sort(sorter);
          expect(c2.collection.name).to.be.eql("stub");
          expect(c2.cmds).have.length(2);
          expect(c2.cmds[0]).have.property("cmd","test");
          expect(c2.cmds[1]).have.property("cmd","sort");
          expect(c2.cmds[1]).have.property("sorter",sorter);
          expect(c2.wrapCb).have.length(1);
          expect(c2.wrapCb[0]).to.be.eql(func);
          done();
        });
        it("add `sort` command, add function expression as string",function(done){
          var c2 = c1.sort(function(val){
            return "this is sort func:"+val;
          });
          expect(c2.collection.name).to.be.eql("stub");
          expect(c2.cmds).have.length(2);
          expect(c2.cmds[0]).have.property("cmd","test");
          expect(c2.cmds[1]).have.property("cmd","sort");
          var sortFunc = c2.cmds[1].sorter;
          expect(typeof sortFunc).to.be.eql("string");
          /*jshint -W054 */
          var compiledFunc = (new Function(sortFunc + ""))();
          /*jshint +W054 */
          expect(compiledFunc("executed")).to.be.eql("this is sort func:executed");
          expect(c2.wrapCb).have.length(1);
          expect(c2.wrapCb[0]).to.be.eql(func);
          done();
        });
      });
      describe("mix of avobe", function(){
        it("create command pipeline with specified order", function(done){
          var c2 = c1.map(function(val){
            val.now = Date.now();
          }).skip(2).limit(10).count();
          done();
          expect(c2.collection.name).to.be.eql("stub");
          expect(c2.cmds).have.length(5);
          expect(c2.cmds[0]).have.property("cmd","test");
          expect(c2.cmds[1]).have.property("cmd","map");
          expect(c2.cmds[2]).have.property("cmd","skip");
          expect(c2.cmds[3]).have.property("cmd","limit");
          expect(c2.cmds[4]).have.property("cmd","count");
        });
      });
      describe("mix of avobe then execution", function(){
        it("call `_send` method of collection with command pipeline",function(done){
          c1.map(function(val){
            val.now = Date.now();
          }).skip(2).limit(10).count().done(function(){});
          expect(col.executed.called).to.be.eql(1);
          var args = col.executed.args[0];
          var msg = args[0];
          var cb  = args[1];
          expect(msg.cmds).have.length(5);
          expect(msg.cmds[0]).have.property("cmd","test");
          expect(msg.cmds[1]).have.property("cmd","map");
          expect(msg.cmds[2]).have.property("cmd","skip");
          expect(msg.cmds[3]).have.property("cmd","limit");
          expect(msg.cmds[4]).have.property("cmd","count");
          expect(typeof cb).to.be.eql("function");
          done();
        });
      });
    });
    describe("Test for aggligation cmd", function(){

      describe("match", function(){
        it("add `find` command",function(done){
          var query = {"key":1};
          var c2 = c1.match(query);
          expect(c2.collection.name).to.be.eql("stub");
          expect(c2.cmds).have.length(2);
          expect(c2.cmds[0]).have.property("cmd","test");
          expect(c2.cmds[1]).have.property("cmd","find");
          expect(c2.cmds[1]).have.property("query",query);
          expect(c2.wrapCb).have.length(1);
          expect(c2.wrapCb[0]).to.be.eql(func);
          done();
        });
      });

      describe("project", function(){
        it("add `project` command",function(done){
          var projection = {"key":1};
          var c2 = c1.project(projection);
          expect(c2.collection.name).to.be.eql("stub");
          expect(c2.cmds).have.length(2);
          expect(c2.cmds[0]).have.property("cmd","test");
          expect(c2.cmds[1]).have.property("cmd","project");
          expect(c2.cmds[1]).have.property("projection",projection);
          expect(c2.wrapCb).have.length(1);
          expect(c2.wrapCb[0]).to.be.eql(func);
          done();
        });
      });

      describe("unwind", function(){
        it("add `unwind` command",function(done){
          var unwindProjection = {"key":"val"};
          var c2 = c1.unwind(unwindProjection);
          expect(c2.collection.name).to.be.eql("stub");
          expect(c2.cmds).have.length(2);
          expect(c2.cmds[0]).have.property("cmd","test");
          expect(c2.cmds[1]).have.property("cmd","unwind");
          expect(c2.cmds[1]).have.property("projection",unwindProjection);
          expect(c2.wrapCb).have.length(1);
          expect(c2.wrapCb[0]).to.be.eql(func);
          done();
        });
      });

      describe("group", function(){
        it("add group command",function(done){
          var c2 = c1.group("score");
          expect(c2.collection.name).to.be.eql("stub");
          expect(c2.cmds).have.length(2);
          expect(c2.cmds[0]).have.property("cmd","test");
          expect(c2.cmds[1]).have.property("cmd","group");
          expect(c2.cmds[1]).have.property("grouping","score");
          expect(c2.wrapCb).have.length(1);
          expect(c2.wrapCb[0]).to.be.eql(func);
          done();
        });
      });
    });
  });
})();
