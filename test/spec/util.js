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
        expect(ab.constructor.name).to.be.eql("Uint16Array");
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

    describe("dataFromId", function(){
      var CHARS = "abcdefghijklmnopqrstuvwxyz0123456789".split("");
      function objectId(val){
        return val || Date.now() + _.shuffle(CHARS).join("").substr(0, 11);
      }
      it("convert id to Data object", function(done){
        var id = objectId();
        var d = Utils.dataFromId(id);
        expect(d instanceof Date).to.be.eql(true);
        expect(d.getTime()).to.be.match(/\d+/);
        done();
      });
      it("convert id to invalid Data object, when id is not made by Long", function(done){
        var id = objectId("something my own id");
        var d = Utils.dataFromId(id);
        expect(d instanceof Date).to.be.eql(true);
        expect(d.toString()).to.be.eql("Invalid Date");
        done();
      });
    });
  });
})();

