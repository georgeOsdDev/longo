Longo.js [![Build Status](https://travis-ci.org/georgeOsdDev/longo.svg?branch=dev)](https://travis-ci.org/georgeOsdDev/longo)
========

Asynchronous local database with a flavor of FRP.
(`Longo` means the Analects(Lunyu), in Japanese)

> 子曰:
> 学而时习之，不亦说乎


### MongoDB like JavaScript Database Engine, in the local browser.

 * Work in multi-thread with the power of [WebWorker](https://developer.mozilla.org/en/docs/Web/Guide/Performance/Using_web_workers).
 * Work at offline with embedded NoSQL-Database.
 * MongoDB like APIs with [underscore-query](https://github.com/davidgtonge/underscore-query).
 * Functional programming style with [underscore.js](http://underscorejs.org/)
 * Event-Driven and Reactive with the spilit of [The Reactive Manifesto](http://www.reactivemanifesto.org/).

#### Architecture

	                                            +------------------+
	                                     -- ! --* Longo Collection |
	                                    /       +------------------+
	                                   /
	+-------------+    +--------------+         +------------------+
	| Application * -- *   Longo DB   * --- ! --* Longo Collection |
	+-------------+    +--------------+         +------------------+
	                                   \
	                                    \       +------------------+
	                                     -- ! --* Longo Collection |
	                                            +------------------+

## Dependencies

 * [underscore.js](http://underscorejs.org/)
 * [underscore-query](https://github.com/davidgtonge/underscore-query)

## Usage

Make sure that `longo.js`, `longoWorker.js`, `lib` is put in same directory. Default root name is `Longo.js`.

This tree will be created by `grunt compile` task as `dest` directory.


	Longo.js
	├── lib
	│   ├── underscore
	│   │   ├── underscore-min.js
	│   │   ├ ...
	│   │
	│   └── underscore-query
	│       ├── lib
	│       │   ├── underscore-query.min.js
	│       │   ├ ...
	│       ├ ...
	│
	├── longo.js
	├── longo.min.js
	├── longo.min.map
	├── longoWorker.js
	├── longoWorker.min.js
	└── longoWorker.min.map


`longo.js` (or `longo.min.js`) `underscore.js` are need to be loaded in html.

Other files will be imported at worker thread.

	<script type="text/javascript" src="path/to/Longo.js/lib/underscore-min.js"></script>
	<script type="text/javascript" src="path/to/Longo.js/longo.js"></script>
	<script>
		// Adjust root directory.
		Longo.setRoot("path/to/Longo.js");
	<script>


## APIs

Longo is focusing to be work as like as Mongo Shell in browser world.

Because it is used in browser, Non-CRUD operation like Sharding, Replication, Auth, etcetra are not supported.

See [diffrence between Mongo Shell](http://georgeosddev.github.io/longo/doc/tutorial-SupportedMongoShellAPIs.html).


### Basic Example

Create database.
<pre>
db = new Longo.DB("School");
db.on("error", function(e){});
</pre>

Create collection and save document.
<pre>
db.collection("students")
	.save([
        {name:"st1","val":1},
        {name:"st2","val":2},
        {name:"st3","val":3},
        {name:"st4","val":4},
        {name:"st5","val":5}
        ])
  .done(function(error){});

db.collection("teachers").insert({name:"te1","val":1}).done(function(error){});
db.collection("teachers").insert({name:"te2","val":1}).done(function(error){});
</pre>

Search document from collection.
<pre>
db.collection("students")
  .find({"count":{"$gt":3}}, {"_id":0})
  .limit(3)
  .done(function(error, result){});
</pre>

####Observe style

`onValue(cb, skipDuplicates)` offers observe style. Every data change in collection will be notified to observer.

<pre>
var observer = db.collection("teachers")
                 .find({"val":{"$gt":5}})
                 .onValue(function(error, result){console.log(result);}))

// => []

db.collection("teachers")
  .update({"name":"te1"}, {"name":te1, value:20})
  .done();

// observed query will react!
// => [{"name":te1, value:20}]

//kill
db.killOp(observer);
</pre>

####Assign style

`assign` is part of `onValue`. Result set of data will be assigned to UI with underscore's template.

<pre>&lt;div id="out"&gt;&lt;/div&gt;
&lt;script type="text/template" id="resultTpl"&gt;
  &lt;ul&gt;
  &lt;% if (result && result.length &gt; 0) { %&gt;
    &lt;% _.each(result, function(data) { %&gt;
      &lt;li id="&lt;%= data._id %&gt;" style="color:&lt;%= data.color %&gt;;"&gt;
        &lt;p&gt;
        &lt;span&gt;| Name: &lt;%= data.name %&gt;&lt;/span&gt;, &lt;span&gt;Value: &lt;%= data.value %&gt;&lt;/span&gt;
        &lt;/p&gt;
      &lt;/li&gt;
    &lt;% }); %&gt;
  &lt;% } %&gt;
  &lt;/ul&gt;
&lt;/script&gt;

&lt;script type="text/javascript"&gt;
var db = Longo.use("example");
var tpl = _.template($("#resultTpl").html());
db.collection("output").find({}).sort({"value":-1}).assign($("#out"), tpl);
&lt;/script&gt;
</pre>

####Promise style

`promise` offers promise style. This method return `thenable` object.

<pre>
var p = db.collection("test").find({"promise":true}).promise();
p.then(function(result){
  console.log(result);
});
p.catch(function(error){
  console.log(error);
});
</pre>


### Result Dataset Receiver

All [Collection](http://georgeosddev.github.io/longo/doc/Longo.Collection.html) methods and methods chain return [Cursor](http://georgeosddev.github.io/longo/doc/Longo.Cursor.html) object.<br>
Cursor itself does not have and reference to result dataset.<br>
Query will not executed until `done` or `onValue` or `promise`, or `assign` is called at the end of method chain.<br>
When query finished, result dataset will be passed to receiver.You can use 4 type receiver as you like.

* [`done`](http://georgeosddev.github.io/longo/doc/Longo.Cursor.html#done):
   Handle dataset with a given Node.js Callback style handler.
* [`onValue`](http://georgeosddev.github.io/longo/doc/Longo.Cursor.html#onValue) :
   Subscribes a given handler function to dataset change.
	 You can use dataset as stream. This feature is inspired by [Bacon.js](https://github.com/baconjs/bacon.js#stream-onvalue).
* [`promise`](http://georgeosddev.github.io/longo/doc/Longo.Cursor.html#promise) :
  Return [Promise](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise#Static_methods) object. You can access dataset with `then` and `catch` method.
* [`assign`](http://georgeosddev.github.io/longo/doc/Longo.Cursor.html#assign)  :
  Assign result dataset to UI with specified template.

For more detail : See [Api Reference](http://georgeosddev.github.io/longo/doc) and [Examples](https://github.com/georgeOsdDev/longo/tree/master/example).

### Query Operators

Longo use [underscore-query](https://github.com/davidgtonge/underscore-query)'s MongoDB like APIs for query operation.

You can use it's query for `find`, `update`, and `remove`.

## Road Map

 * Next version:
 	* Support sort function
 	* Support aggligation framework
 	* Basic Test/Documentation

 * ver 0.1.0:
 	* Support basic CRUD operation

## Browser Support

Longo use these native HTML5 features.

* [LocalStorage](http://caniuse.com/#feat=namevalue-storage).
* [Promise](http://caniuse.com/#feat=promises).
* [TypedArray](http://caniuse.com/#feat=typedarrays).
* [WebWorker](http://caniuse.com/#feat=webworkers).

Useful polyfills is described [here](https://github.com/Modernizr/Modernizr/wiki/HTML5-Cross-Browser-Polyfills)

## Develop

### Build

1. Longo is not released to npm, bower yet. You need build it from source.

		git clone https://github.com/georgeOsdDev/longo.git
		cd longo
		npm install -g grunt-cli
		npm install
		grunt build

### Deoloy

1. Start a web server in the `example/` folder.
	 Hint: if you have python installed, you can just run:

     `python -m SimpleHTTPServer`

1. Browse [http://localhost:8000/example/todomvc/](http://localhost:8000/example/todomvc/)

### Test

With Browser

	grunt connect:server:keepalive

	open http://localhost:9000/test/

With Node console(Only functional module)

	grunt test_cui

With PhantomJS

	grunt test_phantom

**Known Issue**

Some case will fail with PhantomJS.
So currently we run only console test with [Travis.ci](https://travis-ci.org/georgeOsdDev/longo).
If all test case passed with PhantomJS, I will change travis.ci setting to use PhantomJS.

## Licence

Source code can be found on [github](https://github.com/georgeOsdDev/longo), licenced under [MIT](http://opensource.org/licenses/mit-license.php).

Developed by [Takeharu.Oshida](http://about.me/takeharu.oshida).