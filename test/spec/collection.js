/* global Longo: false */
(function () {
  "use strict";
  describe("Test for Longo.Collection", function(){
    describe("Test for capped collection", function(){
      var db = Longo.use("cappedCollectionTest");
      describe("isCapped", function(){
        it("return true if capped collection", function(done){
          var col = db.createCollection("capped", {capped:true, max:5, size:500});
          expect(col.isCapped()).to.be.eql(true);
          done();
        });
        it("return fales if non-capped collection", function(done){
          var col = db.createCollection("non-capped");
          expect(col.isCapped()).to.be.eql(false);
          done();
        });
      });
      describe("Capped collection will shift its documents when it reached cap", function(){
        it("save document until reached max count", function(done){
          db.collection("capped").save([{name:1},{name:2},{name:3},{name:4}]).done(function(){
            db.collection("capped").find().sort({name:1}).done(function(e,r){
              expect(r).has.length(4);
              expect(r[0]).has.property("name",1);
              expect(r[3]).has.property("name",4);
              done();
            });
          });
        });
        it("shift document when it reached max count", function(done){
          db.collection("capped").save([{name:6},{name:7},{name:8}]).done(function(){
            db.collection("capped").find().sort({name:1}).done(function(e,r){
              expect(r).has.length(5);
              expect(r[0]).has.property("name",3);
              expect(r[4]).has.property("name",8);
              done();
            });
          });
        });
        it("shift document when it reached max size", function(done){
          db.collection("capped").save([{name:9, etc:"123456789012345678901234567890123456789012345678901234567890"}]).done(function(){
            db.collection("capped").find().sort({name:1}).done(function(e,r){
              console.log(Longo.Utils.str2ab(JSON.stringify(r)).byteLength);
              var size = Longo.Utils.str2ab(JSON.stringify(r)).byteLength;
              expect(size).to.be.below(500);
              expect(r).has.length(4);
              expect(r[0]).has.property("name",6);
              expect(r[3]).has.property("name",9);
              done();
            });
          });
        });
      });
    });

    describe("save", function(){
      var db, col;
      before(function(done){
        localStorage.clear();
        if(db) db.dropDatabase();
        db = Longo.use("saveCollectionTest");
        col = db.getCollection("saveCol");
        done();
      });
      it("Inserts a new document", function(done){
        col.save([{_id:1,val:1},{_id:2,val:1},{_id:3,val:1}]).done(function(){
          col.find().sort({_id:1}).done(function(e,r){
            expect(e).to.be.eql(null);
            expect(r).has.length(3);
            expect(r[0]).has.property("_id",1);
            expect(r[0]).has.property("val",1);
            expect(r[1]).has.property("_id",2);
            expect(r[2]).has.property("_id",3);
            done();
          });
        });
      });
      it("Update a document when specified id document is exist", function(done){
        col.save([{_id:1,val:2},{_id:2,val:2},{_id:3,val:2}]).done(function(){
          col.find().sort({_id:1}).done(function(e,r){
            expect(e).to.be.eql(null);
            expect(r).has.length(3);
            expect(r[0]).has.property("_id",1);
            expect(r[0]).has.property("val",2);
            expect(r[1]).has.property("_id",2);
            expect(r[1]).has.property("val",2);
            expect(r[2]).has.property("_id",3);
            expect(r[2]).has.property("val",2);
            done();
          });
        });
      });
      it("Mixed pattern", function(done){
        col.save([{_id:1,val:3},{_id:4,val:3}]).done(function(){
          col.find().sort({_id:1}).done(function(e,r){
            expect(e).to.be.eql(null);
            expect(r).has.length(4);
            expect(r[0]).has.property("_id",1);
            expect(r[0]).has.property("val",3);
            expect(r[1]).has.property("_id",2);
            expect(r[1]).has.property("val",2);
            expect(r[2]).has.property("_id",3);
            expect(r[2]).has.property("val",2);
            expect(r[3]).has.property("_id",4);
            expect(r[3]).has.property("val",3);
            done();
          });
        });
      });
    });

    describe("find", function(){
      it.skip("tests are described in separate file", function(done){
        done();
      });
    });

    describe("findOne", function(){
      var db, col;
      before(function(done){
        localStorage.clear();
        if(db) db.dropDatabase();
        db = Longo.use("findOneCollectionTest");
        col = db.getCollection("col");
        col.save([{_id:1,val:1},{_id:2,val:2},{_id:3,val:2}]).done(done);
      });
      it("return oldest document", function(done){
        col.findOne().done(function(e,r){
          expect(e).to.be.eql(null);
          expect(r).has.length(1);
          expect(r[0]).has.property("_id",1);
          done();
        });
      });
      it("return oldest document which match query", function(done){
        col.findOne({val:2}).done(function(e,r){
          expect(e).to.be.eql(null);
          expect(r).has.length(1);
          expect(r[0]).has.property("_id",2);
          done();
        });
      });
    });

    describe("insert", function(){
      var db, col;
      before(function(done){
        localStorage.clear();
        if(db) db.dropDatabase();
        db = Longo.use("insertCollectionTest");
        col = db.getCollection("col");
        done();
      });
      it("insert specifyed document", function(done){
        col.insert({name:"1",val:1}).done(function(e){
          expect(e).to.be.eql(null);
          col.find().done(function(e,r){
            expect(r).has.length(1);
            expect(r[0]).has.property("_id");
            expect(r[0]).has.property("name","1");
            expect(r[0]).has.property("val",1);
            done();
          });
        });
      });
      it("insert specifyed documents", function(done){
        col.insert([{name:"2",val:2},{name:"3",val:3}]).done(function(e){
          expect(e).to.be.eql(null);
          col.find().done(function(e,r){
            expect(r).has.length(3);
            expect(r[0]).has.property("_id");
            expect(r[0]).has.property("name","1");
            expect(r[0]).has.property("val",1);
            expect(r[1]).has.property("_id");
            expect(r[1]).has.property("name","2");
            expect(r[1]).has.property("val",2);
            expect(r[2]).has.property("_id");
            expect(r[2]).has.property("name","3");
            expect(r[2]).has.property("val",3);
            done();
          });
        });
      });
      it("will fail if specified _id document is already exists", function(done){
        col.insert({_id:10,name:"10",val:10}).done(function(){
          col.insert({_id:10,name:"11",val:11}).done(function(e){
            expect(e instanceof Longo.Error).to.be.eql(true);
            expect(e.code).to.be.eql(Longo.Error.DUPLICATE_KEY_ERROR);
            expect(db.getLastErrorObj()).to.be.eql(e);
            col.find().done(function(e,r){
              expect(r).has.length(4);
              expect(r[0]).has.property("_id");
              expect(r[0]).has.property("name","1");
              expect(r[0]).has.property("val",1);
              expect(r[1]).has.property("_id");
              expect(r[1]).has.property("name","2");
              expect(r[1]).has.property("val",2);
              expect(r[2]).has.property("_id");
              expect(r[2]).has.property("name","3");
              expect(r[2]).has.property("val",3);
              expect(r[3]).has.property("_id");
              expect(r[3]).has.property("name","10");
              expect(r[3]).has.property("val",10);
              done();
            });
          });
        });
      });
      it("will fail if specified _id document is dupricated in array, only first document will be inserted", function(done){
        col.insert([{_id:20,name:"20",val:20},{_id:20,name:"21",val:21}]).done(function(e){
          expect(e instanceof Longo.Error).to.be.eql(true);
          expect(e.code).to.be.eql(Longo.Error.DUPLICATE_KEY_ERROR);
          expect(db.getLastErrorObj()).to.be.eql(e);
          col.find().done(function(e,r){
            expect(r).has.length(5);
            expect(r[0]).has.property("_id");
            expect(r[0]).has.property("name","1");
            expect(r[0]).has.property("val",1);
            expect(r[1]).has.property("_id");
            expect(r[1]).has.property("name","2");
            expect(r[1]).has.property("val",2);
            expect(r[2]).has.property("_id");
            expect(r[2]).has.property("name","3");
            expect(r[2]).has.property("val",3);
            expect(r[3]).has.property("_id");
            expect(r[3]).has.property("name","10");
            expect(r[3]).has.property("val",10);
            expect(r[4]).has.property("_id");
            expect(r[4]).has.property("name","20");
            expect(r[4]).has.property("val",20);
            done();
          });
        });
      });
    });

    describe("remove", function(){
      var db, col;
      before(function(done){
        localStorage.clear();
        if(db) db.dropDatabase();
        db = Longo.use("removeCollectionTest");
        col = db.getCollection("col");
        col.save([{_id:"1",val:1},{_id:"2",val:2},{_id:"3",val:2},{_id:"4",val:4},{_id:"5",val:4},{_id:"6",val:6}]).done(done);
      });
      it("remove specifyed document", function(done){
        col.remove({_id:"1"}).done(function(e){
          expect(e).to.be.eql(null);
          col.find().sort({"_id":1}).done(function(e,r){
            expect(r).has.length(5);
            expect(r[0]).has.property("_id","2");
            expect(r[0]).has.property("val",2);
            expect(r[1]).has.property("_id","3");
            expect(r[1]).has.property("val",2);
            expect(r[2]).has.property("_id","4");
            expect(r[2]).has.property("val",4);
            expect(r[3]).has.property("_id","5");
            expect(r[3]).has.property("val",4);
            expect(r[4]).has.property("_id","6");
            expect(r[4]).has.property("val",6);
            done();
          });
        });
      });
      it("remove matched document", function(done){
        col.remove({val:2}).done(function(e){
          expect(e).to.be.eql(null);
          col.find().sort({"_id":1}).done(function(e,r){
            expect(r).has.length(3);
            expect(r[0]).has.property("_id","4");
            expect(r[0]).has.property("val",4);
            expect(r[1]).has.property("_id","5");
            expect(r[1]).has.property("val",4);
            expect(r[2]).has.property("_id","6");
            expect(r[2]).has.property("val",6);
            done();
          });
        });
      });
      it("remove justOne document", function(done){
        col.remove({val:4}, true).done(function(e){
          expect(e).to.be.eql(null);
          col.find().sort({"_id":1}).done(function(e,r){
            expect(r).has.length(2);
            expect(r[0]).has.property("_id","5");
            expect(r[0]).has.property("val",4);
            expect(r[1]).has.property("_id","6");
            expect(r[1]).has.property("val",6);
            done();
          });
        });
      });
      it("remove all document when query is not specified", function(done){
        col.remove().done(function(e){
          expect(e).to.be.eql(null);
          col.find().sort({"_id":1}).done(function(e,r){
            expect(r).has.length(0);
            done();
          });
        });
      });
      it("fail when specified document is not exist", function(done){
        col.remove({"_id":"unknown"}).done(function(e){
          expect(e instanceof Longo.Error).to.be.eql(true);
          expect(e.code).to.be.eql(Longo.Error.DOCUMENT_NOT_FOUND);
          done();
        });
      });
    });

    describe("update", function(){
      var db, col;
      before(function(done){
        localStorage.clear();
        if(db) db.dropDatabase();
        db = Longo.use("removeCollectionTest");
        col = db.getCollection("col");
        col.save([{_id:"1",val:1},{_id:"2",val:2},{_id:"3",val:2},{_id:"4",val:4},{_id:"5",val:4},{_id:"6",val:6}]).done(done);
      });
      it.skip("@TODO: Create test about Update specified document", function(done){
        done();
      });
    });

    describe("drop", function(){
      var db, col;
      before(function(done){
        localStorage.clear();
        if(db) db.dropDatabase();
        db = Longo.use("removeCollectionTest");
        col = db.getCollection("removecol");
        col.save([{_id:"1",val:1},{_id:"2",val:2},{_id:"3",val:2},{_id:"4",val:4},{_id:"5",val:4},{_id:"6",val:6}]).done(done);
      });
      it("remove all document from specified collection", function(done){
        this.timeout(10000);
        var p = col.drop();
        p.then(function(){
          col = db.getCollection("removecol");
          col.find().done(function(e,r){
            expect(r).have.length(0);
            done();
          });
        });
      });
    });

    describe("count", function(){
      var db, col;
      before(function(done){
        localStorage.clear();
        if(db) db.dropDatabase();
        db = Longo.use("countTest");
        col = db.getCollection("col");
        col.save([{_id:1,val:1},{_id:2,val:2},{_id:3,val:2}]).done(done);
      });
      it("return counts of document", function(done){
        col.count().done(function(e,r){
          expect(e).to.be.eql(null);
          expect(r).has.length(1);
          expect(r[0]).to.be.eql(3);
          done();
        });
      });
    });

    describe("dataSize", function(){
      var db, col, x, y;
      before(function(done){
        localStorage.clear();
        if(db) db.dropDatabase();
        db = Longo.use("dataSize");
        col = db.getCollection("col");
        col.save([{_id:1,val:1},{_id:2,val:2},{_id:3,val:2}]).done(done);
      });

      it("return dataSize of collection", function(done){
        col.dataSize().done(function(e,r){
          expect(e).to.be.eql(null);
          expect(r).has.length(1);
          expect(typeof r[0]).to.be.eql("number");
          x = r[0];
          done();
        });
      });
      it("dataSize will be afected by document size", function(done){
        col.save([{_id:4,val:4},{_id:5,val:5},{_id:6,val:6}]).done(function(){
          col.dataSize().done(function(e,r){
            y = r[0];
            expect(y > x).to.be.eql(true);
            done();
          });
        });
      });
    });

    describe("totalSize as same as dataSize", function(){
      var db, col, x, y;
      before(function(done){
        localStorage.clear();
        if(db) db.dropDatabase();
        db = Longo.use("totalSize");
        col = db.getCollection("col");
        col.save([{_id:1,val:1},{_id:2,val:2},{_id:3,val:2}]).done(done);
      });

      it("return dataSize of collection", function(done){
        col.totalSize().done(function(e,r){
          expect(e).to.be.eql(null);
          expect(r).has.length(1);
          expect(typeof r[0]).to.be.eql("number");
          x = r[0];
          done();
        });
      });
      it("totalSize will be afected by document size", function(done){
        col.save([{_id:4,val:4},{_id:5,val:5},{_id:6,val:6}]).done(function(){
          col.totalSize().done(function(e,r){
            y = r[0];
            expect(y > x).to.be.eql(true);
            done();
          });
        });
      });
    });

    describe("renameCollection", function(){
      var db, col;
      before(function(done){
        localStorage.clear();
        if(db) db.dropDatabase();
        db = Longo.use("renameCollectionTest");
        col = db.getCollection("renameOriginalCol");
        col.save([{name:1},{name:2}]).done(done);
      });
      it("change collection name", function(done){
        expect(col.name).to.be.eql("renameOriginalCol");
        col.renameCollection("renamedCol");
        expect(col.name).to.be.eql("renamedCol");
        done();
      });
      it("does not effect dataset", function(done){
        col.find().done(function(e,r){
          expect(r).has.length(2);
          expect(r[0]).has.property("name",1);
          expect(r[1]).has.property("name",2);
          done();
        });
      });
    });

    describe("copyTo", function(){
      var db, col;
      before(function(done){
        localStorage.clear();
        if(db) db.dropDatabase();
        db = Longo.use("copyToCollectionTest");
        col = db.getCollection("copyToOriginalCol");
        col.save([{name:1},{name:2}]).done(done);
      });
      it("copy data to other collection", function(done){
        col.copyTo("clone", function(){
          console.log(arguments);
          var colNames = db.getCollectionNames();
          expect(colNames).have.length(2);
          db.collection("clone").find().done(function(e,r){
            expect(r).has.length(2);
            expect(r[0]).has.property("name",1);
            expect(r[1]).has.property("name",2);
            done();
          });
        });
      });
    });

    describe("setDefaultErrorHandler", function(){
      var db, col;
      before(function(done){
        localStorage.clear();
        if(db) db.dropDatabase();
        db = Longo.use("setDefaultErrorHandler");
        col = db.getCollection("setDefaultErrorHandlerCol");
        col.save([{name:1},{name:2}]).done(done);
      });
      it("use add error handler", function(done){
        col.setDefaultErrorHandler(function(e){
          expect(e instanceof Error).to.be.eql(true);
          expect(typeof "This handler will called").to.be.eql("string");
          done();
        });
        col.worker.postMessage("x");
      });
    });

    describe("distinct", function(){
      it.skip("is not implemented yet", function(done){
        done();
      });
    });

    describe("findAndModify", function(){
      it.skip("is not implemented yet", function(done){
        done();
      });
    });

    describe("group", function(){
      it.skip("is not implemented yet", function(done){
        done();
      });
    });

    describe("mapReduce", function(){
      it.skip("is not implemented yet", function(done){
        done();
      });
    });

  });
})();
