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
  describe("Test for Longo.Utils", function(){
    var Utils = Longo.Utils;
    describe("ab2str / str2ab", function(){
      var src = [
        "Τη γλώσσα μου έδωσαν ελληνική το σπίτι φτωχικό στις αμμουδιές του ",
        "ღმერთსი შემვედრე, ნუთუ კვლა დამხსნას სოფლისა შრომასა, ცეცხლს, წყალს",
        "⠊⠀⠉⠁⠝⠀⠑⠁⠞⠀⠛⠇⠁⠎⠎⠀⠁⠝⠙⠀⠊⠞⠀⠙⠕⠑⠎⠝⠞⠀⠓⠥⠗⠞⠀⠍⠑",
        "Би шил идэй чадна, надад хортой биш",
        "을",
        "나는 유리를 먹을 수 있어요. 그래도 아프지 않아요",
        "ฉันกินกระจกได้ แต่มันไม่ทำให้ฉันเจ็บฉันกินกระจกได้ แต่มันไม่ทำให้ฉันเจ็บ",
        "Ég get etið gler án þess að meiða mig.",
        "Mogę jeść szkło, i mi nie szkodzi.",
        "あいうえおアイウエオｱｲｳｴｵ一二三四五六七八九〇",
        "\ufffd\u10102\u2f877",
        "1234567890",
        "Lorem ipsum dolor sit amet, consectetuer adipiscing elit."
      ].join(),
      ab, str;

      it("convert string to ArrayBuffer", function(done){
        ab = Utils.str2ab(src);
        expect(typeof ab).to.be.eql("object");
        expect(ab.constructor.name).to.be.eql("ArrayBuffer");
        done();
      });

      it("convert ArrayBuffer to String", function(done){
        str = Utils.ab2str(ab);
        expect(typeof str).to.be.eql("string");
        expect(str).to.be.eql(src);
        done();
      });
    });

    describe("inherits", function(){
      function Parent(name){
        this.name = name;
      }
      Parent.prototype.getName = function(){
        return "P:"+this.name;
      };
      function Child(name){
        this.name = name;
      }
      Utils.inherits(Child, Parent);

      it("enables extend prototype", function(done){
        var c = new Child("c1");
        expect(c.constructor.name).to.be.eql("Child");
        expect(c.getName()).to.be.eql("P:"+c.name);
        done();
      });
    });

    describe("createLogger", function(){
      it("return loggable object", function(done){
        var logger = Utils.createLogger();
        expect(logger).has.property("log");
        expect(logger).has.property("debug");
        expect(logger).has.property("warn");
        expect(logger).has.property("info");
        expect(logger).has.property("error");
        done();
      });
    });

    describe("noop", function(){
      it("do nothing", function(done){
        expect(Utils.noop()).to.be.eql(void 0);
        done();
      });
    });

    describe("asNoop", function(){
      it("return function which do nothing", function(done){
        var noop = Utils.asNoop();
        expect(typeof noop).to.be.eql("function");
        expect(noop()).to.be.eql(void 0);
        done();
      });
    });

    describe("aSlice", function(){
      it("is alias for Array.prototype.slice.apply", function(done){
        var a1 = (function(a,b,c){
          return Utils.aSlice(arguments);
        })(1,2,3);
        var a2 = (function(a,b,c){
          return Array.prototype.slice.apply(arguments);
        })(1,2,3);
        expect(a1).to.be.eql(a2);
        done();
      });
    });

    describe("toArray", function(){
      it("convert obj to Array", function(done){
        expect(Utils.toArray(1)).to.be.eql([1]);
        expect(Utils.toArray({a:true})).to.be.eql([{a:true}]);
        done();
      });
      it("do nothing when param is Array", function(done){
        expect(Utils.toArray([1,2,3])).to.be.eql([1,2,3]);
        expect(Utils.toArray([{a:true}])).to.be.eql([{a:true}]);
        done();
      });
    });

    describe("existy", function(){
      it("return true if param is empty obj", function(done){
        expect(Utils.existy({})).to.be.eql(true);
        done();
      });
      it("return true if param is empty array", function(done){
        expect(Utils.existy([])).to.be.eql(true);
        done();
      });
      it("return true if param is string", function(done){
        expect(Utils.truthy("1")).to.be.eql(true);
        done();
      });
      it("return true if param is NaN", function(done){
        expect(Utils.truthy(NaN)).to.be.eql(true);
        done();
      });
      it("return true if param is 1", function(done){
        expect(Utils.truthy(1)).to.be.eql(true);
        done();
      });
      it("return true if param is 0", function(done){
        expect(Utils.existy(0)).to.be.eql(true);
        done();
      });
      it("return true if param is -1", function(done){
        expect(Utils.existy(-1)).to.be.eql(true);
        done();
      });
      it("return true if param is false", function(done){
        expect(Utils.existy(false)).to.be.eql(true);
        done();
      });
      it("return false when param is null", function(done){
        expect(Utils.existy(null)).to.be.eql(false);
        done();
      });
      it("return false when param is undefined", function(done){
        expect(Utils.existy(void 0)).to.be.eql(false);
        done();
      });
    });

    describe("truthy", function(){
      it("return true if param is empty obj", function(done){
        expect(Utils.truthy({})).to.be.eql(true);
        done();
      });
      it("return true if param is empty array", function(done){
        expect(Utils.truthy([])).to.be.eql(true);
        done();
      });
      it("return true if param is string", function(done){
        expect(Utils.truthy("1")).to.be.eql(true);
        done();
      });
      it("return true if param is NaN", function(done){
        expect(Utils.truthy(NaN)).to.be.eql(true);
        done();
      });
      it("return true if param is 1", function(done){
        expect(Utils.truthy(1)).to.be.eql(true);
        done();
      });
      it("return true if param is 0", function(done){
        expect(Utils.truthy(0)).to.be.eql(true);
        done();
      });
      it("return true if param is -1", function(done){
        expect(Utils.truthy(-1)).to.be.eql(true);
        done();
      });
      it("return false if param is false", function(done){
        expect(Utils.truthy(false)).to.be.eql(false);
        done();
      });
      it("return false when param is null", function(done){
        expect(Utils.truthy(null)).to.be.eql(false);
        done();
      });
      it("return false when param is undefined", function(done){
        expect(Utils.truthy(void 0)).to.be.eql(false);
        done();
      });
    });

    describe("isTrue", function(){
      it("return true if param is only true", function(done){
        expect(Utils.isTrue(true)).to.be.eql(true);
        done();
      });
      it("return false if param is empty obj", function(done){
        expect(Utils.isTrue({})).to.be.eql(false);
        done();
      });
      it("return false if param is empty array", function(done){
        expect(Utils.isTrue([])).to.be.eql(false);
        done();
      });
      it("return false if param is string", function(done){
        expect(Utils.isTrue("1")).to.be.eql(false);
        done();
      });
      it("return false if param is NaN", function(done){
        expect(Utils.isTrue(NaN)).to.be.eql(false);
        done();
      });
      it("return false if param is 1", function(done){
        expect(Utils.isTrue(1)).to.be.eql(false);
        done();
      });
      it("return false if param is 0", function(done){
        expect(Utils.isTrue(0)).to.be.eql(false);
        done();
      });
      it("return false if param is -1", function(done){
        expect(Utils.isTrue(-1)).to.be.eql(false);
        done();
      });
      it("return false if param is false", function(done){
        expect(Utils.isTrue(false)).to.be.eql(false);
        done();
      });
      it("return false when param is null", function(done){
        expect(Utils.isTrue(null)).to.be.eql(false);
        done();
      });
      it("return false when param is undefined", function(done){
        expect(Utils.isTrue(void 0)).to.be.eql(false);
        done();
      });
    });

    describe("isFalse", function(){
      it("return true if param is only fasle", function(done){
        expect(Utils.isFalse(false)).to.be.eql(true);
        done();
      });
      it("return false if param is true", function(done){
        expect(Utils.isFalse(true)).to.be.eql(false);
        done();
      });
      it("return false if param is empty obj", function(done){
        expect(Utils.isFalse({})).to.be.eql(false);
        done();
      });
      it("return false if param is empty array", function(done){
        expect(Utils.isFalse([])).to.be.eql(false);
        done();
      });
      it("return false if param is string", function(done){
        expect(Utils.isFalse("1")).to.be.eql(false);
        done();
      });
      it("return false if param is NaN", function(done){
        expect(Utils.isFalse(NaN)).to.be.eql(false);
        done();
      });
      it("return false if param is 1", function(done){
        expect(Utils.isFalse(1)).to.be.eql(false);
        done();
      });
      it("return false if param is 0", function(done){
        expect(Utils.isFalse(0)).to.be.eql(false);
        done();
      });
      it("return false if param is -1", function(done){
        expect(Utils.isFalse(-1)).to.be.eql(false);
        done();
      });
      it("return false when param is null", function(done){
        expect(Utils.isFalse(null)).to.be.eql(false);
        done();
      });
      it("return false when param is undefined", function(done){
        expect(Utils.isFalse(void 0)).to.be.eql(false);
        done();
      });
    });

    describe("isNegativeNum", function(){
      it("return true if param is -2", function(done){
        expect(Utils.isNegativeNum(-2)).to.be.eql(true);
        done();
      });
      it("return true if param is -1", function(done){
        expect(Utils.isNegativeNum(-1)).to.be.eql(true);
        done();
      });
      it("return false if param is 0", function(done){
        expect(Utils.isNegativeNum(0)).to.be.eql(false);
        done();
      });
      it("return false if param is 1", function(done){
        expect(Utils.isNegativeNum(1)).to.be.eql(false);
        done();
      });
      it("return false if param is truhy", function(done){
        expect(Utils.isNegativeNum(true)).to.be.eql(false);
        done();
      });
      it("return false if param is falsy", function(done){
        expect(Utils.isNegativeNum(false)).to.be.eql(false);
        done();
      });
      it("return false if param is NaN", function(done){
        expect(Utils.isNegativeNum(NaN)).to.be.eql(false);
        done();
      });

    });

    describe("isPositiveNum", function(){
      it("return true if param is 2", function(done){
        expect(Utils.isPositiveNum(2)).to.be.eql(true);
        done();
      });
      it("return true if param is 1", function(done){
        expect(Utils.isPositiveNum(1)).to.be.eql(true);
        done();
      });
      it("return false if param is 0", function(done){
        expect(Utils.isPositiveNum(0)).to.be.eql(false);
        done();
      });
      it("return false if param is -1", function(done){
        expect(Utils.isPositiveNum(-1)).to.be.eql(false);
        done();
      });
      it("return false if param is truhy", function(done){
        expect(Utils.isPositiveNum(true)).to.be.eql(false);
        done();
      });
      it("return false if param is NaN", function(done){
        expect(Utils.isPositiveNum(NaN)).to.be.eql(false);
        done();
      });
    });

    describe("isOne", function(){
      it("return true if param is only 1", function(done){
        expect(Utils.isOne(1)).to.be.eql(true);
        done();
      });
      it("return true if param is 2", function(done){
        expect(Utils.isOne(2)).to.be.eql(false);
        done();
      });
      it("return false if param is 0", function(done){
        expect(Utils.isOne(0)).to.be.eql(false);
        done();
      });
      it("return false if param is -1", function(done){
        expect(Utils.isOne(-1)).to.be.eql(false);
        done();
      });
      it("return false if param is truhy", function(done){
        expect(Utils.isOne(true)).to.be.eql(false);
        done();
      });
      it("return false if param is NaN", function(done){
        expect(Utils.isOne(NaN)).to.be.eql(false);
        done();
      });
    });

    describe("isZero", function(){
      it("return true if param is only 0", function(done){
        expect(Utils.isZero(0)).to.be.eql(true);
        done();
      });
      it("return true if param is 1", function(done){
        expect(Utils.isZero(1)).to.be.eql(false);
        done();
      });
      it("return false if param is -1", function(done){
        expect(Utils.isZero(-1)).to.be.eql(false);
        done();
      });
      it("return false if param is truhy", function(done){
        expect(Utils.isZero(true)).to.be.eql(false);
        done();
      });
      it("return false if param is falsy", function(done){
        expect(Utils.isZero(false)).to.be.eql(false);
        done();
      });
      it("return false if param is NaN", function(done){
        expect(Utils.isZero(NaN)).to.be.eql(false);
        done();
      });
    });

    describe("doWhen", function(){
      it("apply action to the context when condition is true", function(done){
        var action = function(a,b,c){
          this.a = a;
          this.b = b;
          this.c = c;
        };
        var context = {};
        Utils.doWhen(true, action, [1,2,3], context);
        expect(context.a).to.be.eql(1);
        expect(context.b).to.be.eql(2);
        expect(context.c).to.be.eql(3);
        done();
      });

      it("does not apply action to the context when condition is false", function(done){
        var action = function(a,b,c){
          this.a = a;
          this.b = b;
          this.c = c;
        };
        var context = {};
        Utils.doWhen(false, action, [1,2,3], context);
        expect(context.a).to.be.eql(undefined);
        expect(context.b).to.be.eql(undefined);
        expect(context.c).to.be.eql(undefined);
        done();
      });
    });

    describe("doWhenOrElse", function(){
      it("apply action to the context when condition is true", function(done){
        var action = function(a,b,c){
          this.a = a;
          this.b = b;
          this.c = c;
        };
        var alternative = function(a,b,c){
          this.a = a*2;
          this.b = b*2;
          this.c = c*2;
        };
        var context = {};
        Utils.doWhenOrElse(true, action, alternative, [1,2,3], context);
        expect(context.a).to.be.eql(1);
        expect(context.b).to.be.eql(2);
        expect(context.c).to.be.eql(3);
        done();
      });

      it("apply alternative to the context when condition is false", function(done){
        var action = function(a,b,c){
          this.a = a;
          this.b = b;
          this.c = c;
        };
        var alternative = function(a,b,c){
          this.a = a*2;
          this.b = b*2;
          this.c = c*2;
        };
        var context = {};
        Utils.doWhenOrElse(false, action, alternative, [1,2,3], context);
        expect(context.a).to.be.eql(2);
        expect(context.b).to.be.eql(4);
        expect(context.c).to.be.eql(6);
        done();
      });
    });

    describe("getOrElse", function(){
      it("return valeues when it is existy: true", function(done){
        var result = Utils.getOrElse(true, "els");
        expect(result).to.be.eql(true);
        done();
      });
      it("return valeues when it is existy: false", function(done){
        var result = Utils.getOrElse(false, "els");
        expect(result).to.be.eql(false);
        done();
      });
      it("return valeues when it is existy: 1", function(done){
        var result = Utils.getOrElse(1, "els");
        expect(result).to.be.eql(1);
        done();
      });
      it("return valeues when it is existy: 0", function(done){
        var result = Utils.getOrElse(0, "els");
        expect(result).to.be.eql(0);
        done();
      });
      it("return valeues when it is existy: -1", function(done){
        var result = Utils.getOrElse(-1, "els");
        expect(result).to.be.eql(-1);
        done();
      });
      it("return valeues when it is existy: {}", function(done){
        var result = Utils.getOrElse({}, "els");
        expect(result).to.be.eql({});
        done();
      });
      it("return els when it is not existy: null", function(done){
        var result = Utils.getOrElse(null, "els");
        expect(result).to.be.eql("els");
        done();
      });
      it("return els when it is not existy: undefined", function(done){
        var result = Utils.getOrElse(undefined, "els");
        expect(result).to.be.eql("els");
        done();
      });
    });

    describe("checkOrElse", function(){
      it("return input if result of input has been evaluated by predictor is truthy", function(done){
        var result = Utils.checkOrElse(true, "els", Utils.truthy);
        expect(result).to.be.eql(true);
        done();
      });
      it("return els if result of input has been evaluated by predictor is not truthy", function(done){
        var result = Utils.checkOrElse(false, "els", Utils.truthy);
        expect(result).to.be.eql("els");
        done();
      });
    });

    describe("tryParseJSON", function(){
      it("try parse string to JSON, then return result as tuple [error, result]. "+
        "if successed to parse, left element will be null, right element will be parsed JSON obj", function(done){
        var validStr = "{\"key\":\"val\"}";
        var result = Utils.tryParseJSON(validStr);
        expect(result).has.length(2);
        expect(result[0]).to.be.eql(null);
        expect(result[1]).to.be.eql({"key":"val"});
        done();
      });

      it("try parse string to JSON, then return result as tuple [error, result]. "+
        "if successed to parse, left element will be Longo.Error, right element will be null", function(done){
        var invalidStr = "{\"key\":\"val\"";
        var result = Utils.tryParseJSON(invalidStr);
        expect(result).has.length(2);
        expect(result[0] instanceof Longo.Error).to.be.eql(true);
        expect(result[0].code).to.be.eql(Longo.Error.PARSE_ERROR);
        expect(result[1]).to.be.eql(null);
        done();
      });
    });

    describe("objectId", function(){
      it("generate unique objectId", function(done){
        var id = Utils.objectId();
        expect(id).to.be.a("string");
        expect(id).have.length(24);
        var id2 = Utils.uuid();
        expect(id2).to.be.not.eql(id);
        done();
      });
      it("return specified value if parameter passed", function(done){
        var id = Utils.objectId("myId");
        expect(id).to.be.eql("myId");
        done();
      });
    });

    describe("dataFromId", function(){
      it("convert id to Data object", function(done){
        var id = Utils.objectId();
        var d = Utils.dataFromId(id);
        expect(d instanceof Date).to.be.eql(true);
        expect(d.getTime()).to.be.match(/\d+/);
        done();
      });
      it("convert id to invalid Data object, when id is not made by Long", function(done){
        var id = Utils.objectId("something my own id");
        var d = Utils.dataFromId(id);
        expect(d instanceof Date).to.be.eql(true);
        expect(d.toString()).to.be.eql("Invalid Date");
        done();
      });
    });

    describe("uuid", function(){
      it("return random uuid like value", function(done){
        var uuid = Utils.uuid();
        expect(uuid).to.be.a("string");
        expect(uuid).have.length(16);
        var uuid2 = Utils.uuid();
        expect(uuid2).to.be.not.eql(uuid);
        done();
      });
    });

    describe("defer", function(){
      var asyncFuncAlwaysSuccess = function(done){
        done("success");
      };
      var asyncFuncAlwaysFail = function(done, reject){
        reject("fail");
      };
      var result;
      it("return thenable object", function(done){
        var successCalled = 0;
        var failCalled    = 0;

        function checker(done){
          expect(result).to.be.eql("success");
          expect(successCalled).to.be.eql(1);
          expect(failCalled).to.be.eql(0);
          done();
        }
        var process = Utils.defer(asyncFuncAlwaysSuccess);
        process.then(function(val){
          expect(val).to.be.eql("success");
          result = val;
          successCalled = 1;
          checker(done);
        });
        process.catch(function(val){
          expect(val).to.be.eql("fail");
          result = val;
          failCalled = 1;
          checker(done);
        });
      });
      it("return catchable object", function(done){
        var successCalled = 0;
        var failCalled    = 0;

        function checker(done){
          expect(result).to.be.eql("fail");
          expect(successCalled).to.be.eql(0);
          expect(failCalled).to.be.eql(1);
          done();
        }
        var process = Utils.defer(asyncFuncAlwaysFail);
        process.then(function(val){
          result = val;
          successCalled = 1;
          checker(done);
        });
        process.catch(function(val){
          result = val;
          failCalled = 1;
          checker(done);
        });
      });
    });

    describe("clone", function(){
      var original = {
        a:1,
        b:"b",
        c:true,
        d:[1,2,3],
        e:{
          ee1:1,
        }
      };
      var clone;
      it("return shallow copy", function(done){
        clone = Utils.clone(original);
        expect(clone.a).to.be.eql(original.a);
        expect(clone.b).to.be.eql(original.b);
        expect(clone.c).to.be.eql(original.c);
        expect(clone.d).to.be.eql(original.d);
        expect(clone.e).to.be.eql(original.e);
        done();
      });
      it("does not affect by new property on original", function(done){
        original.f = "f";
        expect(clone.f).to.be.eql(undefined);
        done();
      });
      it("does not affect by change of first level property on original", function(done){
        original.a = 2;
        expect(clone.a).to.be.eql(1);
        done();
      });
      it("new property to clone does not effect to original", function(done){
        clone.x = "x";
        expect(original.x).to.be.eql(undefined);
        done();
      });
      it("first level property change does not effect to original", function(done){
        clone.b = "bb";
        expect(original.b).to.be.eql("b");
        done();
      });
      it("will be effected by second level property change on original", function(done){
        original.d[0] = "d1";
        expect(clone.d[0]).to.be.eql(original.d[0]);
        original.e.ee2 = "ee2";
        expect(clone.e.ee2).to.be.eql(original.e.ee2);
        done();
      });
      it("second level property change will effect to original", function(done){
        clone.d[1] = "d1";
        expect(original.d[1]).to.be.eql(clone.d[1]);
        clone.e.ee3 = "ee3";
        expect(original.e.ee3).to.be.eql(clone.e.ee3);
        done();
      });
    });

    describe("deepClone", function(){
      var original = {
        a:1,
        b:"b",
        c:true,
        d:[1,2,3],
        e:{
          ee1:1,
        }
      };
      var clone;
      it("return deep copy", function(done){
        clone = Utils.deepClone(original);
        expect(clone.a).to.be.eql(original.a);
        expect(clone.b).to.be.eql(original.b);
        expect(clone.c).to.be.eql(original.c);
        expect(clone.d).to.be.eql(original.d);
        expect(clone.e).to.be.eql(original.e);
        done();
      });
      it("does not be affected by new property on original", function(done){
        original.f = "f";
        expect(clone.f).to.be.eql(undefined);
        done();
      });
      it("does not be affected by change of first level property on original", function(done){
        original.a = 2;
        expect(clone.a).to.be.eql(1);
        done();
      });
      it("new property to clone does not effect to original", function(done){
        clone.x = "x";
        expect(original.x).to.be.eql(undefined);
        done();
      });
      it("first level property change does not effect to original", function(done){
        clone.b = "bb";
        expect(original.b).to.be.eql("b");
        done();
      });
      it("does not be affected by second level property change on original", function(done){
        original.d[0] = "d0";
        expect(clone.d[0]).to.be.eql(1);
        original.e.ee2 = "ee2";
        expect(clone.e.ee2).to.be.eql(undefined);
        done();
      });
      it("second level property change does not effect to original", function(done){
        clone.d[1] = "d3";
        expect(original.d[1]).to.be.eql(2);
        clone.e.ee3 = "ee3";
        expect(original.e.ee3).to.be.eql(undefined);
        done();
      });
    });

    describe("nextTick", function(){
      var res = [];
      var func = function(){
        res.push("1");
      };
      it("executed function immediately at next tick", function(done){
        function a(){
          res.push("2");
          Utils.nextTick(func);
          res.push("3");
          expect(res.join("")).to.be.eql("23");
        }
        function b(){
          res.push("4");
          expect(res.join("")).to.be.eql("2314");
          done();
        }
        a();
        setTimeout(b,10);
      });
    });

  });
})();

