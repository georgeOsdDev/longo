/* global Longo: false */
Longo.setLogLevel("debug");
(function () {
  "use strict";
  describe("Test for Longo.DB", function(){
    var db;

    describe("getName", function(){
      before(function(){
        localStorage.clear();
        if (db) db.dropDatabase();
        db = Longo.use("getName");
      });
      it("return database name", function(done){
        expect(db.getName()).to.be.eql("getName");
        done();
      });
    });

    describe("collection", function(){
      before(function(){
        localStorage.clear();
        if (db) db.dropDatabase();
        db = Longo.use("collectionTest");
      });
      it("return 'temp' uncapped-collection if name is not specified", function (done) {
        var col = db.collection();
        expect(col instanceof Longo.Collection).to.be.eql(true);
        expect(col.name).to.be.eql("temp");
        expect(col.option.capped).to.be.eql(false);
        done();
      });

      it("return named uncapped-collection if name is specified", function (done) {
        var col = db.collection("col");
        expect(col instanceof Longo.Collection).to.be.eql(true);
        expect(col.name).to.be.eql("col");
        expect(col.option.capped).to.be.eql(false);
        done();
      });

      it("return existing collection if specified named collection is already exist", function (done) {
        var col1 = db.collection("myCollection");
        col1.mark = "This is myCollection as col1";

        var exisiting = db.collection("myCollection");
        expect(exisiting instanceof Longo.Collection).to.be.eql(true);
        expect(exisiting.name).to.be.eql("myCollection");
        expect(exisiting.mark).to.be.eql("This is myCollection as col1");
        done();
      });
    });

    describe("createCollection", function(){
      before(function(){
        localStorage.clear();
        if (db) db.dropDatabase();
        db = Longo.use("createCollectionTest");
      });
      it("return 'temp' uncapped-collection if name is not specified", function (done) {
        var col = db.createCollection();
        expect(col instanceof Longo.Collection).to.be.eql(true);
        expect(col.name).to.be.eql("temp");
        expect(col.option.capped).to.be.eql(false);
        done();
      });

      it("return named uncapped-collection if name is specified", function (done) {
        var col = db.createCollection("col");
        expect(col instanceof Longo.Collection).to.be.eql(true);
        expect(col.name).to.be.eql("col");
        expect(col.option.capped).to.be.eql(false);
        done();
      });

      it("return named capped-collection if name and option is specified", function (done) {
        var col = db.createCollection("col2", {capped:true, max:5000, size:10000});
        expect(col instanceof Longo.Collection).to.be.eql(true);
        expect(col.name).to.be.eql("col2");
        expect(col.option.capped).to.be.eql(true);
        expect(col.option.max).to.be.eql(5000);
        expect(col.option.size).to.be.eql(10000);
        done();
      });

      it("overwrite exisiting collection if specified named collection is already exist", function (done) {
        var col1 = db.createCollection("myCollection", {capped:true, max:5000, size:10000});
        col1.mark = "This is myCollection as col1";

        var exisiting = db.createCollection("myCollection");
        expect(exisiting instanceof Longo.Collection).to.be.eql(true);
        expect(exisiting.name).to.be.eql("myCollection");
        expect(exisiting.mark).to.be.eql(undefined);
        expect(exisiting.option.capped).to.be.eql(false);
        done();
      });
    });

    describe("getCollectionNames", function(){
      before(function(){
        localStorage.clear();
        if (db) db.dropDatabase();
        db = Longo.use("getCollectionNamesTest");
      });
      it("return empty Array if no collection is exist", function (done) {
        expect(db.getCollectionNames()).to.be.eql([]);
        done();
      });
      it("return Array of existing collection names", function (done) {
        db.collection("col1");
        db.collection("col2");
        db.collection("col1");
        var nms = db.getCollectionNames();
        expect(nms).has.length(2);
        expect(nms).contain("col1");
        expect(nms).contain("col2");
        done();
      });
    });

    describe("getCollectionNames", function(){
      before(function(){
        localStorage.clear();
        if (db) db.dropDatabase();
        db = Longo.use("getCollectionNamesTest");
      });
      it("return empty Array if no collection is exist", function (done) {
        expect(db.getCollectionNames()).to.be.eql([]);
        done();
      });
      it("return Array of existing collection names", function (done) {
        db.collection("col1");
        db.collection("col2");
        db.collection("col1");
        var nms = db.getCollectionNames();
        expect(nms).has.length(2);
        expect(nms).contain("col1");
        expect(nms).contain("col2");
        done();
      });
    });

    describe("getCollection", function(){
      before(function(){
        localStorage.clear();
        if (db) db.dropDatabase();
        db = Longo.use("getCollectionTest");
      });
      it("return 'temp' uncapped-collection if name is not specified", function (done) {
        var col = db.getCollection();
        expect(col instanceof Longo.Collection).to.be.eql(true);
        expect(col.name).to.be.eql("temp");
        expect(col.option.capped).to.be.eql(false);
        done();
      });

      it("return named uncapped-collection if name is specified and not exist", function (done) {
        var col = db.getCollection("col");
        expect(col instanceof Longo.Collection).to.be.eql(true);
        expect(col.name).to.be.eql("col");
        expect(col.option.capped).to.be.eql(false);
        done();
      });

      it("return existing collection if specified named collection is already exist", function (done) {
        var col1 = db.createCollection("myCollection");
        col1.mark = "This is myCollection as col1";

        var exisiting = db.getCollection("myCollection");
        expect(exisiting instanceof Longo.Collection).to.be.eql(true);
        expect(exisiting.name).to.be.eql("myCollection");
        expect(exisiting.mark).to.be.eql("This is myCollection as col1");
        done();
      });
    });


    describe("dropDatabase", function(){
      before(function(){
        localStorage.clear();
        if (db) db.dropDatabase();
        db = Longo.use("dropDatabaseTest");
      });
      it("delete all existing collection", function (done) {
        db.collection("col1");
        db.collection("col2");
        db.collection("col1");
        db.dropDatabase();
        expect(db.getCollectionNames()).to.be.eql([]);
        done();
      });
    });

    describe("cloneCollection", function(){
      before(function(done){
        localStorage.clear();
        if (db) db.dropDatabase();
        db = Longo.use("cloneCollectionTest");
        done();
      });
      it("clone existing collection", function (done) {
        var original = db.createCollection("original",{capped:true});
        original.save([
          {name:"a", val:1},
          {name:"b", val:2}
        ]).done(function(){
          db.cloneCollection("original", "cloned", {}, function(e, col){
            expect(e).to.be.eql(null);
            expect(col instanceof Longo.Collection).to.be.eql(true);
            expect(col.name).to.be.eql("cloned");
            expect(col.option.capped).to.be.eql(true);
            done();
          });
        });
      });
      it("contains cloned data", function(done){
        db.collection("cloned").find().sort({"_id":1}).done(function(e, result){
          expect(result).has.length(2);
          expect(result[0].name).to.be.eql("a");
          expect(result[1].name).to.be.eql("b");
          done();
        });
      });
      it("will not be affect by original after clone", function(done){
        db.collection("original").insert({name:"c", val:1}).done(function(){
          db.collection("original").find().sort({"_id":1}).done(function(e, result){
            expect(result).has.length(3);
            expect(result[0].name).to.be.eql("a");
            expect(result[1].name).to.be.eql("b");
            expect(result[2].name).to.be.eql("c");
          });
          db.collection("cloned").find().sort({"_id":1}).done(function(e, result){
            expect(result).has.length(2);
            expect(result[0].name).to.be.eql("a");
            expect(result[1].name).to.be.eql("b");
            done();
          });
        });
      });
      it("will not effect to original after clone", function(done){
        db.collection("cloned").insert({name:"d"}).done(function(){
          db.collection("original").find().sort({"_id":1}).done(function(e, result){
            expect(result).has.length(3);
            expect(result[0].name).to.be.eql("a");
            expect(result[1].name).to.be.eql("b");
            expect(result[2].name).to.be.eql("c");
          });
          db.collection("cloned").find().sort({"_id":1}).done(function(e, result){
            expect(result).has.length(3);
            expect(result[0].name).to.be.eql("a");
            expect(result[1].name).to.be.eql("b");
            expect(result[2].name).to.be.eql("d");
            done();
          });
        });
      });

      it("will clone existing collection with specified query", function (done) {
        db.cloneCollection("original", "cloned2", {val:1}, function(e, col){
          col.find().sort({"_id":1}).done(function(e, result){
            expect(result).has.length(2);
            expect(result[0].name).to.be.eql("a");
            expect(result[1].name).to.be.eql("c");
            done();
          });
        });
      });

      it("will create empty collection if from collection is not exist", function(done){
        db.cloneCollection("not-existing", "cloned3", {}, function(e, col){
          expect(col instanceof Longo.Collection).to.be.eql(true);
          expect(col.name).to.be.eql("cloned3");
          expect(col.option.capped).to.be.eql(false);
          done();
        });
      });

      it("will fail if specified named collection is already exist", function(done){
        db.cloneCollection("original", "cloned", {}, function(e, col){
          expect(e instanceof Longo.Error).to.be.eql(true);
          expect(e.code).to.be.eql(Longo.Error.COLLECTION_ALREADY_EXISTS);
          expect(col).to.be.eql(null);
          done();
        });
      });
    });
    describe("getLastErrorObj / getLastError", function(){
      before(function(done){
        localStorage.clear();
        if (db) db.dropDatabase();
        db = Longo.use("getLastError");
        done();
      });
      it("getLastErrorObj return last error object", function(done){
        db.cloneCollection("original", "cloned", {}, function(){
          db.cloneCollection("original", "cloned", {}, function(){
            var e = db.getLastErrorObj();
            expect(e instanceof Longo.Error).to.be.eql(true);
            expect(e.code).to.be.eql(Longo.Error.COLLECTION_ALREADY_EXISTS);
            done();
          });
        });
      });
      it ("getLastError returns last error message", function(done){
        var msg = db.getLastError();
        expect(typeof msg).to.be.eql("string");
        expect(msg).to.be.eql("Collection is already exists! name: cloned");
        done();
      });
    });
  });
})();