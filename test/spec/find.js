/* global Longo: false */
(function () {
  "use strict";
  describe("Test for Longo.collection.find", function(){
    describe("Basic document query", function(){
      var db = Longo.use("findTest");
      beforeEach(function(done){
        db.collection("findTest").drop();
        db.collection("findTest").save([
          {key:1,  val:1, name:"a1", score:100, ob:{obkey1:1,  obNest:{key:1} }, arr:[1, {"arrkey":1}, {"arrkey":1}]},
          {key:2,  val:1, name:"b1", score:200, ob:{obkey1:2,  obNest:{key:2} }, arr:[2, {"arrkey":2}, {"arrkey":2}]},
          {key:3,  val:1, name:"c1", score:100, ob:{obkey1:3,  obNest:{key:3} }, arr:[3, {"arrkey":3}, {"arrkey":3}]},
          {key:4,  val:1, name:"d1", score:200, ob:{obkey1:4,  obNest:{key:4} }, arr:[4, {"arrkey":4}, {"arrkey":4}]},
          {key:5,  val:1, name:"e1", score:100, ob:{obkey1:5,  obNest:{key:5} }, arr:[5, {"arrkey":5}, {"arrkey":5}]},
          {key:6,  val:2, name:"a2", score:200, ob:{obkey1:6,  obNest:{key:6} }, arr:[6, {"arrkey":6}, {"arrkey":1}]},
          {key:7,  val:2, name:"b2", score:100, ob:{obkey1:7,  obNest:{key:7} }, arr:[7, {"arrkey":7}, {"arrkey":2}]},
          {key:8,  val:2, name:"c2", score:200, ob:{obkey1:8,  obNest:{key:8} }, arr:[8, {"arrkey":8}, {"arrkey":3}]},
          {key:9,  val:2, name:"d2", score:100, ob:{obkey1:9,  obNest:{key:9} }, arr:[9, {"arrkey":9}, {"arrkey":4}]},
          {key:10, val:2, name:"e2", score:200, ob:{obkey1:10, obNest:{key:10}}, arr:[10,{"arrkey":10},{"arrkey":5}]}
        ]).done(done);
      });
      describe("Single key query", function(){
        it("find({key:1})` return specified doc", function(done){
          db.collection("findTest").find({key:1}).sort({"_id":1}).done(function(e,r){
            expect(r).have.length(1);
            expect(r[0]).have.property("_id");
            expect(r[0]).have.property("key",1);
            expect(r[0]).have.property("val",1);
            expect(r[0]).have.property("name","a1");
            expect(r[0]).have.property("score",100);
            done();
          });
        });
        it("find({name:'b1'})` return specified doc", function(done){
          db.collection("findTest").find({name:"b1"}).sort({"_id":1}).done(function(e,r){
            expect(r).have.length(1);
            expect(r[0]).have.property("_id");
            expect(r[0]).have.property("key",2);
            expect(r[0]).have.property("val",1);
            expect(r[0]).have.property("name","b1");
            expect(r[0]).have.property("score",200);
            done();
          });
        });
        it("find({val:1})` return specified docs", function(done){
          db.collection("findTest").find({val:1}).sort({"_id":1}).done(function(e,r){
            expect(r).have.length(5);
            console.log(r);
            expect(r[0]).have.property("_id");
            expect(r[0]).have.property("key",1);
            expect(r[0]).have.property("val",1);
            expect(r[0]).have.property("name","a1");
            expect(r[0]).have.property("score",100);
            expect(r[1]).have.property("_id");
            expect(r[1]).have.property("key",2);
            expect(r[1]).have.property("val",1);
            expect(r[1]).have.property("name","b1");
            expect(r[1]).have.property("score",200);
            expect(r[2]).have.property("_id");
            expect(r[2]).have.property("key",3);
            expect(r[2]).have.property("val",1);
            expect(r[2]).have.property("name","c1");
            expect(r[2]).have.property("score",100);
            expect(r[3]).have.property("_id");
            expect(r[3]).have.property("key",4);
            expect(r[3]).have.property("val",1);
            expect(r[3]).have.property("name","d1");
            expect(r[3]).have.property("score",200);
            expect(r[4]).have.property("_id");
            expect(r[4]).have.property("key",5);
            expect(r[4]).have.property("val",1);
            expect(r[4]).have.property("name","e1");
            expect(r[4]).have.property("score",100);
            done();
          });
        });
      });

      describe("Multi key query", function(){
        it("find({val:1, name:'c1'})` return specified doc", function(done){
          db.collection("findTest").find({val:1, name:"c1"}).sort({"_id":1}).done(function(e,r){
            expect(r).have.length(1);
            expect(r[0]).have.property("_id");
            expect(r[0]).have.property("key",3);
            expect(r[0]).have.property("val",1);
            expect(r[0]).have.property("name","c1");
            expect(r[0]).have.property("score",100);
            done();
          });
        });
        it("find({val:1, score:100})` return specified docs", function(done){
          db.collection("findTest").find({val:1, score:100}).sort({"_id":1}).done(function(e,r){
            expect(r).have.length(3);
            expect(r[0]).have.property("_id");
            expect(r[0]).have.property("key",1);
            expect(r[0]).have.property("val",1);
            expect(r[0]).have.property("name","a1");
            expect(r[0]).have.property("score",100);
            expect(r[1]).have.property("_id");
            expect(r[1]).have.property("key",3);
            expect(r[1]).have.property("val",1);
            expect(r[1]).have.property("name","c1");
            expect(r[1]).have.property("score",100);
            expect(r[2]).have.property("_id");
            expect(r[2]).have.property("key",5);
            expect(r[2]).have.property("val",1);
            expect(r[2]).have.property("name","e1");
            expect(r[2]).have.property("score",100);
            done();
          });
        });
      });
      describe("Object dot key query", function(){
        it("find({'ob.obkey1':2}})` return specified doc", function(done){
          db.collection("findTest").find({"ob.obkey1":2}).sort({"_id":1}).done(function(e,r){
            expect(r).have.length(1);
            expect(r[0]).have.property("_id");
            expect(r[0]).have.property("key",2);
            expect(r[0]).have.property("val",1);
            expect(r[0]).have.property("name","b1");
            expect(r[0]).have.property("score",200);
            done();
          });
        });
      });
      describe("Array element query", function(){
        it("find({'arr':3})` return specified doc", function(done){
          db.collection("findTest").find({"arr":3}).sort({"_id":1}).done(function(e,r){
            expect(r).have.length(1);
            expect(r[0]).have.property("_id");
            expect(r[0]).have.property("key",3);
            expect(r[0]).have.property("val",1);
            expect(r[0]).have.property("name","c1");
            expect(r[0]).have.property("score",100);
            done();
          });
        });
      });
      describe("Nest Object dot key query", function(){
        it("find({'ob.obNest.key':2})` return specified doc", function(done){
          db.collection("findTest").find({"ob.obNest.key":2}).sort({"_id":1}).done(function(e,r){
            expect(r).have.length(1);
            console.log(r);
            expect(r[0]).have.property("_id");
            expect(r[0]).have.property("key",2);
            expect(r[0]).have.property("val",1);
            expect(r[0]).have.property("name","b1");
            expect(r[0]).have.property("score",200);
            done();
          });
        });
      });
      describe("Nest Array element query", function(){
        it("find({'arr.arrkey':3})` return specified doc", function(done){
          db.collection("findTest").find({"arr.arrkey":3}).sort({"_id":1}).done(function(e,r){
            expect(r).have.length(2);
            expect(r[0]).have.property("_id");
            expect(r[0]).have.property("key",3);
            expect(r[0]).have.property("val",1);
            expect(r[0]).have.property("name","c1");
            expect(r[0]).have.property("score",100);

            expect(r[1]).have.property("_id");
            expect(r[1]).have.property("key",8);
            expect(r[1]).have.property("val",2);
            expect(r[1]).have.property("name","c2");
            expect(r[1]).have.property("score",200);
            done();
          });
        });
      });
    });
    describe("Query API based on underscore-query", function(){
      var db;
      beforeEach(function(done){
        db = Longo.use("findTest");
        db.collection("findTest").drop();
        done();
      });
      describe("$equal", function(){
        beforeEach(function(done){
          db.collection("findTest").save([
            {key:1,  val:1, name:"a1"},
            {key:2,  val:1, name:"b1"}
          ]).done(done);
        });
        it("find({key:{$equal:2}})",function(done){
          db.collection("findTest").find({key:{$equal:2}}).done(function(e,r){
            expect(r).have.length(1);
            expect(r[0]).have.property("_id");
            expect(r[0]).have.property("name","b1");
            done();
          });
        });
      });

      describe("$contains", function(){
        beforeEach(function(done){
          db.collection("findTest").save([
            {key:[1,11],  val:1, name:"a1"},
            {key:[2,22],  val:1, name:"b1"}
          ]).done(done);
        });
        it("find({key:{$contains:2}})",function(done){
          db.collection("findTest").find({key:{$contains:2}}).done(function(e,r){
            expect(r).have.length(1);
            expect(r[0]).have.property("_id");
            expect(r[0]).have.property("name","b1");
            done();
          });
        });
      });


      describe("$ne", function(){
        beforeEach(function(done){
          db.collection("findTest").save([
            {key:1,  val:1, name:"a1"},
            {key:2,  val:1, name:"b1"}
          ]).done(done);
        });
        it("find({key:{$ne:1}})",function(done){
          db.collection("findTest").find({key:{$ne:1}}).done(function(e,r){
            expect(r).have.length(1);
            expect(r[0]).have.property("_id");
            expect(r[0]).have.property("name","b1");
            done();
          });
        });
      });

      describe("$lt", function(){
        beforeEach(function(done){
          db.collection("findTest").save([
            {key:1,  val:1, name:"a1"},
            {key:2,  val:1, name:"b1"},
            {key:3,  val:1, name:"c1"},
            {key:4,  val:1, name:"d1"}
          ]).done(done);
        });
        it("find({key:{$lt:3}})",function(done){
          db.collection("findTest").find({key:{$lt:3}}).sort({_id:1}).done(function(e,r){
            expect(r).have.length(2);
            expect(r[0]).have.property("_id");
            expect(r[0]).have.property("name","a1");
            expect(r[1]).have.property("_id");
            expect(r[1]).have.property("name","b1");
            done();
          });
        });
      });

      describe("$lte", function(){
        beforeEach(function(done){
          db.collection("findTest").save([
            {key:1,  val:1, name:"a1"},
            {key:2,  val:1, name:"b1"},
            {key:3,  val:1, name:"c1"},
            {key:4,  val:1, name:"d1"}
          ]).done(done);
        });
        it("find({key:{$lte:3}})",function(done){
          db.collection("findTest").find({key:{$lte:3}}).sort({_id:1}).done(function(e,r){
            expect(r).have.length(3);
            expect(r[0]).have.property("_id");
            expect(r[0]).have.property("name","a1");
            expect(r[1]).have.property("_id");
            expect(r[1]).have.property("name","b1");
            expect(r[2]).have.property("_id");
            expect(r[2]).have.property("name","c1");
            done();
          });
        });
      });

      describe("$gt", function(){
        beforeEach(function(done){
          db.collection("findTest").save([
            {key:1,  val:1, name:"a1"},
            {key:2,  val:1, name:"b1"},
            {key:3,  val:1, name:"c1"},
            {key:4,  val:1, name:"d1"}
          ]).done(done);
        });
        it("find({key:{$gt:2}})",function(done){
          db.collection("findTest").find({key:{$gt:2}}).sort({_id:1}).done(function(e,r){
            expect(r).have.length(2);
            expect(r[0]).have.property("_id");
            expect(r[0]).have.property("name","c1");
            expect(r[1]).have.property("_id");
            expect(r[1]).have.property("name","d1");
            done();
          });
        });
      });

      describe("$gte", function(){
        beforeEach(function(done){
          db.collection("findTest").save([
            {key:1,  val:1, name:"a1"},
            {key:2,  val:1, name:"b1"},
            {key:3,  val:1, name:"c1"},
            {key:4,  val:1, name:"d1"}
          ]).done(done);
        });
        it("find({key:{$gte:2}})",function(done){
          db.collection("findTest").find({key:{$gte:2}}).sort({_id:1}).done(function(e,r){
            expect(r).have.length(3);
            expect(r[0]).have.property("_id");
            expect(r[0]).have.property("name","b1");
            expect(r[1]).have.property("_id");
            expect(r[1]).have.property("name","c1");
            expect(r[2]).have.property("_id");
            expect(r[2]).have.property("name","d1");
            done();
          });
        });
      });

      describe("$between", function(){
        beforeEach(function(done){
          db.collection("findTest").save([
            {key:1,  val:1, name:"a1"},
            {key:2,  val:1, name:"b1"},
            {key:3,  val:1, name:"c1"},
            {key:4,  val:1, name:"d1"}
          ]).done(done);
        });
        it("find({key:{$between:[2,4]}})",function(done){
          db.collection("findTest").find({key:{$between:[2,4]}}).sort({_id:1}).done(function(e,r){
            expect(r).have.length(1);
            expect(r[0]).have.property("_id");
            expect(r[0]).have.property("name","c1");
            done();
          });
        });
      });

      describe("$in", function(){
        beforeEach(function(done){
          db.collection("findTest").save([
            {key:1,  val:1, name:"a1"},
            {key:2,  val:1, name:"b1"},
            {key:3,  val:1, name:"c1"},
            {key:4,  val:1, name:"d1"}
          ]).done(done);
        });
        it("find({name:{$in:['b1','c1']}})",function(done){
          db.collection("findTest").find({name:{$in:["b1","c1"]}}).sort({_id:1}).done(function(e,r){
            expect(r).have.length(2);
            expect(r[0]).have.property("_id");
            expect(r[0]).have.property("name","b1");
            expect(r[1]).have.property("_id");
            expect(r[1]).have.property("name","c1");
            done();
          });
        });
      });

      describe("$nin", function(){
        beforeEach(function(done){
          db.collection("findTest").save([
            {key:1,  val:1, name:"a1"},
            {key:2,  val:1, name:"b1"},
            {key:3,  val:1, name:"c1"},
            {key:4,  val:1, name:"d1"}
          ]).done(done);
        });
        it("find({name:{$nin:['b1','c1']}})",function(done){
          db.collection("findTest").find({name:{$nin:["b1","c1"]}}).sort({_id:1}).done(function(e,r){
            expect(r).have.length(2);
            expect(r[0]).have.property("_id");
            expect(r[0]).have.property("name","a1");
            expect(r[1]).have.property("_id");
            expect(r[1]).have.property("name","d1");
            done();
          });
        });
      });

      describe("$all", function(){
        beforeEach(function(done){
          db.collection("findTest").save([
            {key:1,  val:1, name:"a1", color:["blue","green","red"]},
            {key:2,  val:1, name:"b1", color:["blue","green"]},
            {key:3,  val:1, name:"c1", color:["blue","red"]},
            {key:4,  val:1, name:"d1", color:["blue"]}
          ]).done(done);
        });
        it("find({color:{$all:['blue','green']}})",function(done){
          db.collection("findTest").find({color:{$all:["blue","green"]}}).sort({_id:1}).done(function(e,r){
            expect(r).have.length(2);
            expect(r[0]).have.property("_id");
            expect(r[0]).have.property("name","a1");
            expect(r[1]).have.property("_id");
            expect(r[1]).have.property("name","b1");
            done();
          });
        });
      });

      describe("$any", function(){
        beforeEach(function(done){
          db.collection("findTest").save([
            {key:1,  val:1, name:"a1", color:["blue","green","red"]},
            {key:2,  val:1, name:"b1", color:["blue","green"]},
            {key:3,  val:1, name:"c1", color:["blue","red"]},
            {key:4,  val:1, name:"d1", color:["blue"]}
          ]).done(done);
        });
        it("find({color:{$any:['green','red']}})",function(done){
          db.collection("findTest").find({color:{$any:["green","red"]}}).sort({_id:1}).done(function(e,r){
            expect(r).have.length(3);
            expect(r[0]).have.property("_id");
            expect(r[0]).have.property("name","a1");
            expect(r[1]).have.property("_id");
            expect(r[1]).have.property("name","b1");
            expect(r[2]).have.property("_id");
            expect(r[2]).have.property("name","c1");
            done();
          });
        });
      });

      describe("$size", function(){
        beforeEach(function(done){
          db.collection("findTest").save([
            {key:1,  val:1, name:"a1", color:["blue","green","red"]},
            {key:2,  val:1, name:"b1", color:["blue","green"]},
            {key:3,  val:1, name:"c1", color:["blue","red"]},
            {key:4,  val:1, name:"d1", color:["blue"]}
          ]).done(done);
        });
        it("find({color:{$size:2}})",function(done){
          db.collection("findTest").find({color:{$size:2}}).sort({_id:1}).done(function(e,r){
            expect(r).have.length(2);
            expect(r[0]).have.property("_id");
            expect(r[0]).have.property("name","b1");
            expect(r[1]).have.property("_id");
            expect(r[1]).have.property("name","c1");
            done();
          });
        });
      });

      describe("$exists | $has", function(){
        beforeEach(function(done){
          db.collection("findTest").save([
            {key:1,  val:1, name:"a1", color:["blue","green","red"]},
            {key:2,  val:1, name:"b1", color:["blue","green"],attr:["attr"]},
            {key:3,  val:1, name:"c1", color:["blue","red"]},
            {key:4,  val:1, name:"d1", color:["blue"]}
          ]).done(done);
        });
        it("find({attr:{$exists:true}})",function(done){
          db.collection("findTest").find({attr:{$exists:true}}).sort({_id:1}).done(function(e,r){
            expect(r).have.length(1);
            expect(r[0]).have.property("_id");
            expect(r[0]).have.property("name","b1");
            done();
          });
        });
        it("find({attr:{$has:true}})",function(done){
          db.collection("findTest").find({attr:{$has:true}}).sort({_id:1}).done(function(e,r){
            expect(r).have.length(1);
            expect(r[0]).have.property("_id");
            expect(r[0]).have.property("name","b1");
            done();
          });
        });
        it("find({attr:{$exists:false}})",function(done){
          db.collection("findTest").find({attr:{$exists:false}}).sort({_id:1}).done(function(e,r){
            expect(r).have.length(3);
            expect(r[0]).have.property("_id");
            expect(r[0]).have.property("name","a1");
            expect(r[1]).have.property("_id");
            expect(r[1]).have.property("name","c1");
            expect(r[2]).have.property("_id");
            expect(r[2]).have.property("name","d1");
            done();
          });
        });
      });

      describe("$like", function(){
        beforeEach(function(done){
          db.collection("findTest").save([
            {key:1,  val:1, name:"a1", attr:"test1"},
            {key:2,  val:1, name:"b1", attr:"test2"},
            {key:3,  val:1, name:"c1", attr:"Test3"},
            {key:4,  val:1, name:"d1", attr:"Tes"},
          ]).done(done);
        });
        it("find({attr:{$like:'test'}})",function(done){
          db.collection("findTest").find({attr:{$like:"test"}}).sort({_id:1}).done(function(e,r){
            expect(r).have.length(2);
            expect(r[0]).have.property("_id");
            expect(r[0]).have.property("name","a1");
            expect(r[1]).have.property("_id");
            expect(r[1]).have.property("name","b1");
            done();
          });
        });
      });

      describe("$likeI", function(){
        beforeEach(function(done){
          db.collection("findTest").save([
            {key:1,  val:1, name:"a1", attr:"test1"},
            {key:2,  val:1, name:"b1", attr:"test2"},
            {key:3,  val:1, name:"c1", attr:"Test3"},
            {key:4,  val:1, name:"d1", attr:"Tes"},
          ]).done(done);
        });
        it("find({attr:{$likeI:'test'}})",function(done){
          db.collection("findTest").find({attr:{$likeI:"test"}}).sort({_id:1}).done(function(e,r){
            expect(r).have.length(3);
            expect(r[0]).have.property("_id");
            expect(r[0]).have.property("name","a1");
            expect(r[1]).have.property("_id");
            expect(r[1]).have.property("name","b1");
            expect(r[2]).have.property("_id");
            expect(r[2]).have.property("name","c1");
            done();
          });
        });
      });

      describe("$elemMatch", function(){
        beforeEach(function(done){
          db.collection("findTest").save([
            {key:1,  val:1, name:"a1", arr:[{"blue":1},{"yellow":1},{"red":1}]},
            {key:2,  val:1, name:"b1", arr:[{"blue":2},{"yellow":2},{"black":2}]},
            {key:3,  val:1, name:"c1", arr:[{"blue":3},{"white":3},{"red":3}]},
            {key:4,  val:1, name:"d1", arr:[{"yellow":4},{"green":4},{"red":4}]},
          ]).done(done);
        });
        it("find({$elemMatch:{'arr':'yellow'}})",function(done){
          db.collection("findTest").find({arr:{$elemMatch:{"blue":{$gte : 2}}}}).sort({_id:1}).done(function(e,r){
            expect(r).have.length(2);
            expect(r[0]).have.property("_id");
            expect(r[0]).have.property("name","b1");
            expect(r[1]).have.property("_id");
            expect(r[1]).have.property("name","c1");
            done();
          });
        });
      });

      describe("$regex", function(){
        it.skip("Sorry! $regex is not supported by Longo. Use `Collection.find({}).map()` instead",function(done){
          done();
        });
      });

      describe("$cb", function(){
        it.skip("Sorry! $cb is not supported by Longo. Use `Collection.find({}).map()` instead",function(done){
          done();
        });
      });

      describe("$computed", function(){
        it.skip("Sorry! $computed is not supported by Longo. Use `Collection.find({}).map()` instead",function(done){
          done();
        });
      });
    });

    describe("Combined Queries based on underscore-query", function(){
      var db;
      beforeEach(function(done){
        db = Longo.use("findTest");
        db.collection("findTest").drop();
        done();
      });
      describe("$and", function(){
        beforeEach(function(done){
          db.collection("findTest").save([
            {key:1,  val:1, name:"a1"},
            {key:2,  val:2, name:"b1"},
            {key:3,  val:1, name:"c1"},
            {key:4,  val:2, name:"d1"}
          ]).done(done);
        });
        it("find({$and:[{key:{$gt:2}},{val:2}]})",function(done){
          db.collection("findTest").find({$and:[{key:{$gt:2}},{val:2}]}).sort({_id:1}).done(function(e,r){
            expect(r).have.length(1);
            expect(r[0]).have.property("_id");
            expect(r[0]).have.property("name","d1");
            done();
          });
        });
      });

      describe("$or", function(){
        beforeEach(function(done){
          db.collection("findTest").save([
            {key:1,  val:1, name:"a1"},
            {key:2,  val:2, name:"b1"},
            {key:3,  val:1, name:"c1"},
            {key:4,  val:2, name:"d1"}
          ]).done(done);
        });
        it("find({$or:[{key:{$gt:2}},{val:1}]})",function(done){
          db.collection("findTest").find({$or:[{key:{$gt:2}},{val:1}]}).sort({_id:1}).done(function(e,r){
            expect(r).have.length(3);
            expect(r[0]).have.property("_id");
            expect(r[0]).have.property("name","a1");
            expect(r[1]).have.property("_id");
            expect(r[1]).have.property("name","c1");
            expect(r[2]).have.property("_id");
            expect(r[2]).have.property("name","d1");
            done();
          });
        });
      });

      describe("$nor", function(){
        beforeEach(function(done){
          db.collection("findTest").save([
            {key:1,  val:1, name:"a1"},
            {key:2,  val:2, name:"b1"},
            {key:3,  val:1, name:"c1"},
            {key:4,  val:2, name:"d1"}
          ]).done(done);
        });
        it("find({$nor:[{key:{$gt:2}},{val:1}]})",function(done){
          db.collection("findTest").find({$nor:[{key:{$gt:2}},{val:1}]}).sort({_id:1}).done(function(e,r){
            expect(r).have.length(1);
            expect(r[0]).have.property("_id");
            expect(r[0]).have.property("name","b1");
            done();
          });
        });
      });

      describe("$not", function(){
        beforeEach(function(done){
          db.collection("findTest").save([
            {key:1,  val:1, name:"a1"},
            {key:2,  val:2, name:"b1"},
            {key:3,  val:1, name:"c1"},
            {key:4,  val:2, name:"d1"}
          ]).done(done);
        });
        it("find($not:{key:{$gt:2}})",function(done){
          db.collection("findTest").find({$not:{key:{$gt:2}}}).sort({_id:1}).done(function(e,r){
            expect(r).have.length(2);
            expect(r[0]).have.property("_id");
            expect(r[0]).have.property("name","a1");
            expect(r[1]).have.property("_id");
            expect(r[1]).have.property("name","b1");
            done();
          });
        });
      });
    });
  });
})();
