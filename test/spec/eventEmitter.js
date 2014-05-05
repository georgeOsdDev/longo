/* global Longo: false */
(function () {
  "use strict";
  describe("Test for Longo.EventEmitter", function(){
    var ee;
    var result,spyA,spyB,spyC,spyC2;
    beforeEach(function(done){
      ee = new Longo.EventEmitter();
      result = {
        spyA:{
          called:0,
          args:[]
        },
        spyB:{
          called:0,
          args:[]
        },
        spyC:{
          called:0,
          args:[]
        },
        spyC2:{
          called:0,
          args:[]
        }
      };
      spyA = function(){
        result.spyA.called++;
        result.spyA.args.push(Array.prototype.slice.apply(arguments));
      };
      spyB = function(){
        result.spyB.called++;
        result.spyB.args.push(Array.prototype.slice.apply(arguments));
      };
      spyC = function(){
        result.spyC.called++;
        result.spyC.args.push(Array.prototype.slice.apply(arguments));
      };
      spyC2 = function(){
        result.spyC2.called++;
        result.spyC2.args.push(Array.prototype.slice.apply(arguments));
      };
      done();
    });
    describe("addEventListener / dispatchEvent", function(){
      it("fire specified listner", function(){
        ee.addEventListener("A", spyA);
        ee.addEventListener("B", spyB);
        ee.dispatchEvent("A");
        expect(result.spyA.called).to.be.eql(1);
        expect(result.spyA.args[0][0] instanceof Event).to.be.eql(true);
        expect(result.spyB.called).to.be.eql(0);
      });

      it("fire specified listner per event", function(){
        ee.addEventListener("A", spyA);
        ee.addEventListener("B", spyB);
        ee.dispatchEvent("A");
        expect(result.spyA.called).to.be.eql(1);
        expect(result.spyA.args[0][0] instanceof Event).to.be.eql(true);
        expect(result.spyB.called).to.be.eql(0);

        ee.dispatchEvent("A");
        expect(result.spyA.called).to.be.eql(2);
        expect(result.spyA.args[1][0] instanceof Event).to.be.eql(true);
        expect(result.spyB.called).to.be.eql(0);
      });

      it("fire specified listneres", function(){
        ee.addEventListener("A", spyA);
        ee.addEventListener("B", spyB);
        ee.addEventListener("C", spyC);
        ee.addEventListener("C", spyC2);
        ee.dispatchEvent("C");
        expect(result.spyA.called).to.be.eql(0);
        expect(result.spyB.called).to.be.eql(0);
        expect(result.spyC.called).to.be.eql(1);
        expect(result.spyC.args[0][0] instanceof Event).to.be.eql(true);
        expect(result.spyC2.called).to.be.eql(1);
        expect(result.spyC2.args[0][0] instanceof Event).to.be.eql(true);
      });

      it("dispatchEvent with detail", function(){
        ee.addEventListener("A", spyA);
        ee.addEventListener("B", spyB);
        ee.dispatchEvent("A", {detail:{key:"val"}});
        expect(result.spyA.called).to.be.eql(1);
        expect(result.spyA.args[0][0].detail).has.property("key","val");
      });

      it("dispatchEvent with values, it will passed as `detail` property of event", function(){
        ee.addEventListener("A", spyA);
        ee.addEventListener("B", spyB);
        ee.dispatchEvent("A", {key2:"val2"});
        expect(result.spyA.called).to.be.eql(1);
        expect(result.spyA.args[0][0].detail).has.property("key2","val2");
      });
    });
    describe("removeEventListener", function(){
      it("remove specified eventlistner", function(){
        ee.addEventListener("A", spyA);
        ee.addEventListener("B", spyB);
        ee.addEventListener("C", spyC);
        ee.addEventListener("C", spyC2);

        ee.removeEventListener("A", spyA);
        ee.dispatchEvent("A");
        expect(result.spyA.called).to.be.eql(0);
        expect(result.spyB.called).to.be.eql(0);
        expect(result.spyC.called).to.be.eql(0);
        expect(result.spyC2.called).to.be.eql(0);

        ee.dispatchEvent("B");
        expect(result.spyA.called).to.be.eql(0);
        expect(result.spyB.called).to.be.eql(1);
        expect(result.spyC.called).to.be.eql(0);
        expect(result.spyC2.called).to.be.eql(0);

        ee.removeEventListener("C", spyC);
        ee.dispatchEvent("C");
        expect(result.spyA.called).to.be.eql(0);
        expect(result.spyB.called).to.be.eql(1);
        expect(result.spyC.called).to.be.eql(0);
        expect(result.spyC2.called).to.be.eql(1);
      });
    });
    describe("on / off / emit", function(){
      it("is alias for `addEventListener`, `removeEventListener`, `dispatchEvent`", function(){
        ee.on("A", spyA);
        ee.on("B", spyB);
        ee.on("C", spyC);
        ee.on("C", spyC2);

        ee.off("A", spyA);
        ee.emit("A");
        expect(result.spyA.called).to.be.eql(0);
        expect(result.spyB.called).to.be.eql(0);
        expect(result.spyC.called).to.be.eql(0);
        expect(result.spyC2.called).to.be.eql(0);

        ee.emit("B", {key:"val"});
        expect(result.spyA.called).to.be.eql(0);
        expect(result.spyB.called).to.be.eql(1);
        expect(result.spyB.args[0][0].detail).has.property("key","val");
        expect(result.spyC.called).to.be.eql(0);
        expect(result.spyC2.called).to.be.eql(0);

        ee.off("C", spyC);
        ee.emit("C");
        expect(result.spyA.called).to.be.eql(0);
        expect(result.spyB.called).to.be.eql(1);
        expect(result.spyC.called).to.be.eql(0);
        expect(result.spyC2.called).to.be.eql(1);
      });
    });
    describe("bind / unbind / trigger", function(){
      it("is alias for `addEventListener`, `removeEventListener`, `dispatchEvent`", function(){
        ee.bind("A", spyA);
        ee.bind("B", spyB);
        ee.bind("C", spyC);
        ee.bind("C", spyC2);

        ee.unbind("A", spyA);
        ee.trigger("A");
        expect(result.spyA.called).to.be.eql(0);
        expect(result.spyB.called).to.be.eql(0);
        expect(result.spyC.called).to.be.eql(0);
        expect(result.spyC2.called).to.be.eql(0);

        ee.trigger("B", {key:"val"});
        expect(result.spyA.called).to.be.eql(0);
        expect(result.spyB.called).to.be.eql(1);
        expect(result.spyB.args[0][0].detail).has.property("key","val");
        expect(result.spyC.called).to.be.eql(0);
        expect(result.spyC2.called).to.be.eql(0);

        ee.unbind("C", spyC);
        ee.trigger("C");
        expect(result.spyA.called).to.be.eql(0);
        expect(result.spyB.called).to.be.eql(1);
        expect(result.spyC.called).to.be.eql(0);
        expect(result.spyC2.called).to.be.eql(1);
      });
    });
  });
})();