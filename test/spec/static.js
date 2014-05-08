// For command line test
if (typeof module !== "undefined" && module.exports) {
  /*jshint -W079 */
  var expect = require("chai").expect;
  var _ = require("underscore");
  require("underscore-query")(_);
  var Longo = require("../../dest/longo.js");
  /*jshint +W079 */
}

/* global Longo: false */
(function () {
  "use strict";
  describe("Static method of Longo namespace", function(){

    describe("getVersion", function(){
      it("return specified version", function (done) {
        expect(Longo.getVersion()).to.be.match(/[0-9]+\.[0-9]+\..*/);
        done();
      });
    });


    describe("LONGOROOT", function(){
      it("will be set automatically", function (done) {
        if (typeof require !== "undefined"){
          expect(Longo.getRoot()).to.be.eql("/Longo.js");
        } else {
          expect(Longo.getRoot()).to.be.eql("http://localhost:9000/dest");
        }
        done();
      });

      it("is is adujstable", function (done) {
        Longo.setRoot("/MyRoot");
        expect(Longo.getRoot()).to.be.eql("/MyRoot");
        done();
      });
    });

    describe("Create db object", function(){
      var myDB;
      describe("with createDB method", function(){
        it("return specified db with name", function (done) {
          myDB = Longo.createDB("mydb");
          expect(myDB instanceof Longo.DB).to.be.eql(true);
          done();
        });
      });

      describe("with use method", function(){
        it("return specified db with name", function (done) {
          var db = Longo.use("mydb");
          expect(db instanceof Longo.DB).to.be.eql(true);
          done();
        });
      });

      describe("when existing name is used", function(){
        it("it will return existing db", function (done) {
          var db = Longo.use("mydb");
          expect(db).to.be.eql(myDB);
          done();
        });
      });
    });
  });
})();