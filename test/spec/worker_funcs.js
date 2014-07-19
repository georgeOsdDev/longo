// For command line test
if (typeof module !== "undefined" && module.exports) {
  /*jshint -W079 */
  var expect = require("chai").expect;
  var _ = require("underscore");
  require("underscore-query")(_);
  var Longo = require("../../dest/longo.js");
  var Worker = require("../../dest/longoWorker.js");
  /*jshint +W079 */
}
/* global Longo,_: false */
(function () {
  "use strict";

  describe("Test for Functional mehtods of LongoWorker", function(){
    var ctx;
    beforeEach(function(done){
      ctx = {};
      ctx.dataset = [];
      ctx.option = {
        capped: false
      };
      ctx.isUpdatedBySeq = {};
      done();
    });

    describe("parseDotQuery",function(){
      it("parse dot expression to $elemMatch query", function (done) {
        var tuple = Worker.parseDotQuery(1,"a.b");
        expect(tuple).has.length(2);
        expect(tuple[0]).has.property("$elemMatch");
        expect(tuple[0].$elemMatch).has.property("b",1);
        expect(tuple[1]).to.be.eql("a");
        done();
      });
      it("parse nested dot expression to $elemMatch query", function (done) {
        var tuple = Worker.parseDotQuery(1,"a.b.c");
        expect(tuple).has.length(2);
        expect(tuple[0]).has.property("$elemMatch");
        expect(tuple[0].$elemMatch).has.property("b");
        expect(tuple[0].$elemMatch.b).has.property("$elemMatch");
        expect(tuple[0].$elemMatch.b.$elemMatch).has.property("c",1);
        expect(tuple[1]).to.be.eql("a");
        done();
      });
      it("don't parse undot expression to $elemMatch query", function (done) {
        var tuple = Worker.parseDotQuery(1,"a");
        expect(tuple).has.length(2);
        expect(tuple[0]).to.be.eql(1);
        expect(tuple[1]).to.be.eql("a");
        done();
      });
    });

    describe("toQuery",function(){
      it("return empty object, if unexpected argument", function (done) {
        var result = Worker.toQuery(1);
        expect(result).to.be.eql({});
        done();
      });
      it("return parsed dot expression to $elemMatch query", function (done) {
        var result = Worker.toQuery({"a":1, "b.b1":2});
        expect(result).have.property("a",1);
        expect(result).have.property("$or");
        expect(result.$or).have.property("b");
        expect(result.$or.b).have.property("$elemMatch");
        expect(result.$or.b).have.property("$elemMatch");
        expect(result.$or.b.$elemMatch).have.property("b1",2);
        expect(result.$or).have.property("b.b1",2);
        done();
      });
    });

    describe("toDocument",function(){
      it("return object, if argument is object", function (done) {
        var result = Worker.toDocument({"key":"val"});
        expect(typeof result).to.be.eql("object");
        expect(result).have.property("key", "val");
        done();
      });
      it("convert to empty object, if argument is empty array", function (done) {
        var result = Worker.toDocument([]);
        expect(typeof result).to.be.eql("object");
        done();
      });
      it("convert to object, if argument is array", function (done) {
        var result = Worker.toDocument(["key", "val"]);
        expect(typeof result).to.be.eql("object");
        expect(result).have.property("0", "key");
        expect(result).have.property("1", "val");
        done();
      });
      it("convert to object, if argument is string", function (done) {
        var result = Worker.toDocument("str");
        expect(typeof result).to.be.eql("object");
        expect(result).have.property("0", "str");
        done();
      });
      it("convert to object, if argument is number", function (done) {
        var result = Worker.toDocument(1);
        expect(typeof result).to.be.eql("object");
        expect(result).have.property("0", 1);
        done();
      });
      it("convert to object, if argument is boolean", function (done) {
        var result = Worker.toDocument(true);
        expect(typeof result).to.be.eql("object");
        expect(result).have.property("0", true);
        done();
      });
    });

    describe("isSizeReached", function(){
      it("return false, datasize is not reached to max", function (done) {
        var result = Worker.isSizeReached([], {"x":"y"}, 100);
        expect(result).to.be.eql(false);
        done();
      });
      it("return true, datasize reached to max", function (done) {
        var result = Worker.isSizeReached([], {"x":"y","z":"1"}, 10);
        expect(result).to.be.eql(true);
        done();
      });
    });

    describe("isCountReached", function(){
      it("return false, count is not reached to max", function (done) {
        var result = Worker.isCountReached([], 10);
        expect(result).to.be.eql(false);
        done();
      });
      it("return true, count reached to max", function (done) {
        var result = Worker.isCountReached([1,2,3,4,5,6,7,8,9,10], 10);
        expect(result).to.be.eql(true);
        done();
      });
    });

    describe("doStart", function(){
      it("bind option to the ctx", function (done) {

        var cmd = {
          name:"name",
          option:{op1:1,op2:true},
          dataset:[1,2,3]
        };
        var seq = 0;
        var ctx = {};

        var result = Worker.doStart(cmd, seq, ctx);
        expect(result).have.length(2);
        expect(result[0]).to.be.eql(null);
        expect(result[1]).to.be.a("array");
        expect(result[1]).have.length(0);

        expect(ctx.name).to.be.eql("name");
        expect(ctx.option.op1).to.be.eql(1);
        expect(ctx.option.op2).to.be.eql(true);
        expect(ctx.dataset).to.be.eql([1,2,3]);

        done();
      });
    });

    describe("doFind", function(){
      it("return result set of query result", function (done) {
        var dataset = [{val:1,name:"x"},{val:2,name:"y"},{val:3,name:"z"}],
            query   = {val:{"$gte":2}}
            ;

        var result = Worker.doFind(dataset, query);
        expect(result).have.length(2);
        expect(result[0]).to.be.eql(null);
        expect(result[1]).have.length(2);
        expect(result[1][0]).have.property("val",2);
        expect(result[1][0]).have.property("name","y");
        expect(result[1][1]).have.property("val",3);
        expect(result[1][1]).have.property("name","z");
        done();
      });
    });

    describe("doInsert", function(){
      it("insert doc with _id if doc already have.", function (done) {

        var seq = 0;
        var ctx = {};
        ctx.dataset = [];
        ctx.option = {
          capped: false
        };
        ctx.isUpdatedBySeq = {};

        var docs = [{"key":"val","_id":"customeId"}];

        var result = Worker.doInsert(docs, seq, ctx);
        expect(result).have.length(2);
        expect(result[0]).to.be.eql("SKIP_REST");
        expect(result[1]).to.be.eql(null);

        expect(ctx.dataset).have.length(1);
        expect(ctx.dataset[0]).have.property("_id", "customeId");
        expect(ctx.dataset[0]).have.property("key","val");

        done();
      });

      it("insert doc with _id auto created", function (done) {

        var seq = 0;
        var ctx = {};
        ctx.dataset = [];
        ctx.option = {
          capped: false
        };
        ctx.isUpdatedBySeq = {};

        var docs = [{"key":"val"}];

        var result = Worker.doInsert(docs, seq, ctx);
        expect(result).have.length(2);
        expect(result[0]).to.be.eql("SKIP_REST");
        expect(result[1]).to.be.eql(null);

        expect(ctx.dataset).have.length(1);
        expect(ctx.dataset[0]).have.property("_id");
        expect(ctx.dataset[0]._id).to.be.match(/\d+.*/g);
        expect(ctx.dataset[0]).have.property("key","val");

        done();
      });

      it("insert multiple docs", function (done) {

        var seq = 0;
        var ctx = {};
        ctx.dataset = [];
        ctx.option = {
          capped: false
        };
        ctx.isUpdatedBySeq = {};

        var docs = [{"key":"val"},{"key2":"val2"}];

        var result = Worker.doInsert(docs, seq, ctx);
        expect(result).have.length(2);
        expect(result[0]).to.be.eql("SKIP_REST");
        expect(result[1]).to.be.eql(null);

        expect(ctx.dataset).have.length(2);
        expect(ctx.dataset[0]).have.property("_id");
        expect(ctx.dataset[0]._id).to.be.match(/\d+.*/g);
        expect(ctx.dataset[0]).have.property("key","val");
        expect(ctx.dataset[1]._id).to.be.match(/\d+.*/g);
        expect(ctx.dataset[1]).have.property("key2","val2");

        done();
      });

      it("will shift data with capped collection if it reach its max size", function (done) {

        var seq = 0;
        var ctx = {};
        ctx.dataset = [{"a":"b"},{"a2":"b2"}]; //46
        ctx.option = {
          capped: true,
          size:115
        };
        ctx.isUpdatedBySeq = {};

        var docs = [{"x":"y"}]; // 84

        var result = Worker.doInsert(docs, seq, ctx);
        expect(result).have.length(2);
        expect(result[0]).to.be.eql("SKIP_REST");
        expect(result[1]).to.be.eql(null);

        expect(ctx.dataset).have.length(2);
        expect(ctx.dataset[0]).have.property("a2","b2");
        expect(ctx.dataset[1]).have.property("x","y");

        done();
      });

      it("will shift data with capped collection if it reach its max size", function (done) {

        var seq = 0;
        var ctx = {};
        ctx.dataset = [{"a":"b"},{"a2":"b2"}];
        ctx.option = {
          capped: true,
          size:1000,
          max:2,
        };
        ctx.isUpdatedBySeq = {};

        var docs = [{"x":"y"}];

        var result = Worker.doInsert(docs, seq, ctx);
        expect(result).have.length(2);
        expect(result[0]).to.be.eql("SKIP_REST");
        expect(result[1]).to.be.eql(null);

        expect(ctx.dataset).have.length(2);
        expect(ctx.dataset[0]).have.property("a2","b2");
        expect(ctx.dataset[1]).have.property("x","y");

        done();
      });
    });

    //@TODO
    describe("updateById", function(){
      it.skip("@TODO: Create test about updateById", function(done){
        done();
      });
    });

    //@TODO
    describe("doUpdate", function(){
      it.skip("@TODO: Create test about doUpdate", function(done){
        done();
      });
    });

    //@TODO
    describe("doSave", function(){
      it.skip("@TODO: Create test about doSave", function(done){
        done();
      });
    });

    describe("doRemove", function(){
      it("Remove all document, if no query specified", function(done){

        var seq = 0;
        var ctx = {};
        ctx.dataset = [{_id:1,key:"key1",val:"1"},{_id:2,key:"key2",val:"2"},{_id:3,key:"key3",val:"3"}];
        ctx.option = {
          capped: false
        };
        ctx.isUpdatedBySeq = {};

        var query = {};
        var justOne = false;

        var result = Worker.doRemove(query, justOne, seq, ctx);
        expect(result).have.length(2);
        expect(result[0]).to.be.eql(null);
        expect(result[1]).to.be.eql(null);

        expect(ctx.dataset).have.length(0);
        done();
      });

      it("Remove document which specified by query,", function(done){

        var seq = 0;
        var ctx = {};
        ctx.dataset = [{_id:1,key:"key1",val:"1"},{_id:2,key:"key2",val:"2"},{_id:3,key:"key3",val:"3"}];
        ctx.option = {
          capped: false
        };
        ctx.isUpdatedBySeq = {};

        var query = {"_id":1};
        var justOne = false;

        var result = Worker.doRemove(query, justOne, seq, ctx);
        expect(result).have.length(2);
        expect(result[0]).to.be.eql(null);
        expect(result[1]).to.be.eql(null);

        expect(ctx.dataset).have.length(2);
        expect(ctx.dataset[0]).have.property("key","key2");
        expect(ctx.dataset[1]).have.property("key","key3");
        done();
      });

      it("Remove document which specified by query,", function(done){

        var seq = 0;
        var ctx = {};
        ctx.dataset = [{_id:1,key:"key1",val:"1"},{_id:2,key:"key2",val:"2"},{_id:3,key:"key3",val:"3"}];
        ctx.option = {
          capped: false
        };
        ctx.isUpdatedBySeq = {};

        var query = {"val":{"$gt":1}};
        var justOne = false;

        var result = Worker.doRemove(query, justOne, seq, ctx);
        expect(result).have.length(2);
        expect(result[0]).to.be.eql(null);
        expect(result[1]).to.be.eql(null);

        expect(ctx.dataset).have.length(1);
        expect(ctx.dataset[0]).have.property("key","key1");
        done();
      });

      it("Remove first document which specified by query, if justOne = true", function(done){

        var seq = 0;
        var ctx = {};
        ctx.dataset = [{_id:1,key:"key1",val:"1"},{_id:2,key:"key2",val:"2"},{_id:3,key:"key3",val:"3"}];
        ctx.option = {
          capped: false
        };
        ctx.isUpdatedBySeq = {};

        var query = {"val":{"$gt":1}};
        var justOne = true;

        var result = Worker.doRemove(query, justOne, seq, ctx);
        expect(result).have.length(2);
        expect(result[0]).to.be.eql(null);
        expect(result[1]).to.be.eql(null);

        expect(ctx.dataset).have.length(2);
        expect(ctx.dataset[0]).have.property("key","key1");
        expect(ctx.dataset[1]).have.property("key","key3");
        done();
      });

      it("will fail if no document match query", function(done){

        var seq = 0;
        var ctx = {};
        ctx.dataset = [{_id:1,key:"key1",val:"1"},{_id:2,key:"key2",val:"2"},{_id:3,key:"key3",val:"3"}];
        ctx.option = {
          capped: false
        };
        ctx.isUpdatedBySeq = {};

        var query = {"val":{"$gt":4}};
        var justOne = true;

        var result = Worker.doRemove(query, justOne, seq, ctx);
        expect(result).have.length(2);
        expect(result[0] instanceof Longo.Error).to.be.eql(true);
        expect(result[0].code).to.be.eql(Longo.Error.DOCUMENT_NOT_FOUND);
        expect(result[1]).to.be.eql(null);

        expect(ctx.dataset).have.length(3);
        expect(ctx.dataset[0]).have.property("key","key1");
        expect(ctx.dataset[1]).have.property("key","key2");
        expect(ctx.dataset[2]).have.property("key","key3");
        done();
      });
    });


    //@TODO
    //Worker.doProject = function(dataset, projection)
    describe("doProject", function(){
      it.skip("@TODO: Create test about doProject", function(done){
        done();
      });
    });

    describe("doLimit", function(){
      it("return documents limit by parameter", function (done) {
        var dataset = [{val:1,name:"x"},{val:2,name:"y"},{val:3,name:"z"}];

        var result = Worker.doLimit(dataset, 2);
        expect(result).have.length(2);
        expect(result[0]).to.be.eql(null);
        expect(result[1]).have.length(2);
        expect(result[1][0]).have.property("val",1);
        expect(result[1][0]).have.property("name","x");
        expect(result[1][1]).have.property("val",2);
        expect(result[1][1]).have.property("name","y");
        done();
      });
    });

    describe("doSkip", function(){
      it("return documents skiped by parameter", function (done) {
        var dataset = [{val:1,name:"x"},{val:2,name:"y"},{val:3,name:"z"}];

        var result = Worker.doSkip(dataset, 2);
        expect(result).have.length(2);
        expect(result[0]).to.be.eql(null);
        expect(result[1]).have.length(1);
        expect(result[1][0]).have.property("val",3);
        expect(result[1][0]).have.property("name","z");
        done();
      });
    });

    describe("doCount", function(){
      it("return count of documents", function (done) {
        var dataset = [{val:1,name:"x"},{val:2,name:"y"},{val:3,name:"z"}];

        var result = Worker.doCount(dataset);
        expect(result).have.length(2);
        expect(result[0]).to.be.eql("SKIP_REST");
        expect(result[1]).have.length(1);
        expect(result[1][0]).to.be.eql(3);
        done();
      });
    });

    describe("doSize", function(){
      it("return size of documents", function (done) {
        var dataset = [{val:1,name:"x"},{val:2,name:"y"},{val:3,name:"z"}];
        var dataset2 = [{val:1,name:"x"},{val:2,name:"y"},{val:3,name:"z"},{val:1,name:"x"},{val:2,name:"y"},{val:3,name:"z"}];

        var result = Worker.doSize(dataset);
        expect(result).have.length(2);
        expect(result[0]).to.be.eql("SKIP_REST");
        expect(result[1]).have.length(1);
        expect(result[1][0]).to.be.match(/\d+/);

        var result2 = Worker.doSize(dataset2);
        expect(result[1][0] < result2[1][0]).to.be.eql(true);

        done();
      });
    });

    describe("doToArray", function(){
      it("return dataset as array(do nothing)", function (done) {
        var dataset = [{val:1,name:"x"},{val:2,name:"y"},{val:3,name:"z"}];

        var result = Worker.doToArray(dataset);
        expect(result).have.length(2);
        expect(result[0]).to.be.eql(null);
        expect(result[1]).have.length(3);
        done();
      });
    });

    describe("doMax", function(){
      it("return maximum document", function (done) {
        var dataset = [{val:1,name:"x"},{val:2,name:"y"},{val:3,name:"z"},{val:4,name:"zz"}];
        var indexBounds = {"val":3};

        var result = Worker.doMax(dataset,indexBounds);
        expect(result).have.length(2);
        expect(result[0]).to.be.eql(null);
        expect(result[1]).have.length(1);
        expect(result[1][0]).have.property("val",3);
        expect(result[1][0]).have.property("name","z");
        done();
      });
    });

    describe("doMin", function(){
      it("return minimum document", function (done) {
        var dataset = [{val:1,name:"x"},{val:2,name:"y"},{val:3,name:"z"},{val:4,name:"zz"}];
        var indexBounds = {"val":2};

        var result = Worker.doMin(dataset,indexBounds);
        expect(result).have.length(2);
        expect(result[0]).to.be.eql(null);
        expect(result[1]).have.length(1);
        expect(result[1][0]).have.property("val",2);
        expect(result[1][0]).have.property("name","y");
        done();
      });
    });

    describe("doForEach", function(){
      it("apply func to each document", function (done) {
        var dataset = [{val:1,name:"x"},{val:2,name:"y"},{val:3,name:"z"}];
        var func = function(doc){
          console.log(doc.name);
        };
        var funcstr = "return " + func.toString() + ";";

        var result = Worker.doForEach(dataset, funcstr);
        expect(result).have.length(2);
        expect(result[0]).to.be.eql(null);
        expect(result[1]).have.length(3);
        expect(result[1][0]).have.property("val",1);
        expect(result[1][0]).have.property("name","x");
        expect(result[1][1]).have.property("val",2);
        expect(result[1][1]).have.property("name","y");
        expect(result[1][2]).have.property("val",3);
        expect(result[1][2]).have.property("name","z");
        done();
      });
    });


    describe("doMap", function(){
      it("apply func and convert each document", function (done) {
        var dataset = [{val:1,name:"x"},{val:2,name:"y"},{val:3,name:"z"}];
        var func = function(doc){
          return {val:doc.val*2,name:doc.name+"!"};
        };
        var funcstr = "return " + func.toString() + ";";

        var result = Worker.doMap(dataset, funcstr);
        expect(result).have.length(2);
        expect(result[0]).to.be.eql(null);
        expect(result[1]).have.length(3);
        expect(result[1][0]).have.property("val",2);
        expect(result[1][0]).have.property("name","x!");
        expect(result[1][1]).have.property("val",4);
        expect(result[1][1]).have.property("name","y!");
        expect(result[1][2]).have.property("val",6);
        expect(result[1][2]).have.property("name","z!");
        done();
      });
    });


    describe("doSort", function(){
      it("sort document by sort key asc", function (done) {
        var dataset = [,{val:2,name:"y"},{val:1,name:"x"},{val:3,name:"z"}];
        var sorter = {"val":1};

        var result = Worker.doSort(dataset, sorter);
        expect(result).have.length(2);
        expect(result[0]).to.be.eql(null);
        expect(result[1]).have.length(3);
        expect(result[1][0]).have.property("val",1);
        expect(result[1][0]).have.property("name","x");
        expect(result[1][1]).have.property("val",2);
        expect(result[1][1]).have.property("name","y");
        expect(result[1][2]).have.property("val",3);
        expect(result[1][2]).have.property("name","z");
        done();
      });

      it("sort document by sort key desc", function (done) {
        var dataset = [,{val:2,name:"y"},{val:1,name:"x"},{val:3,name:"z"}];
        var sorter = {"val":-1};

        var result = Worker.doSort(dataset, sorter);
        expect(result).have.length(2);
        expect(result[0]).to.be.eql(null);
        expect(result[1]).have.length(3);
        expect(result[1][0]).have.property("val",3);
        expect(result[1][0]).have.property("name","z");
        expect(result[1][1]).have.property("val",2);
        expect(result[1][1]).have.property("name","y");
        expect(result[1][2]).have.property("val",1);
        expect(result[1][2]).have.property("name","x");
        done();
      });

      it("sort document by sorting function", function (done) {
        var dataset = [,{val:2,name:"y"},{val:1,name:"x"},{val:3,name:"z"}];
        var sorter  = function(doc){
          return -1*doc.val;
        };
        var funcstr = "return " + sorter.toString() + ";";

        var result = Worker.doSort(dataset, funcstr);
        expect(result).have.length(2);
        expect(result[0]).to.be.eql(null);
        expect(result[1]).have.length(3);
        expect(result[1][0]).have.property("val",3);
        expect(result[1][0]).have.property("name","z");
        expect(result[1][1]).have.property("val",2);
        expect(result[1][1]).have.property("name","y");
        expect(result[1][2]).have.property("val",1);
        expect(result[1][2]).have.property("name","x");
        done();
      });
    });

  });
})();


