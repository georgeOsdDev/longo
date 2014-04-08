/* global Longo: false */
(function () {
  "use strict";
  describe("Test for Collection methods", function(){

    describe("getVersion", function(){
      it("return specified version", function (done) {
        expect(Longo.getVersion()).to.be.match(/[0-9]+\.[0-9]+\..*/);
        done();
      });
    });

    describe("getVersion", function(){
      it("return specified version", function (done) {
        expect(Longo.getVersion()).to.be.match(/[0-9]+\.[0-9]+\..*/);
        done();
      });
    });


  });
})();

