Longo.js
========

Asynchronous local database with a flavor of FRP.
(`Longo` means the Analects(Lunyu), in Japanese)

> 子曰:
> 学而时习之，不亦说乎


### MongoDB like JavaScript Database Engine, in the local world of browser.

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

Observe document.
<pre>
var observer = db.collection("teachers")
                 .find({"val":{"$gt":5}})
                 .onValue(function(error, result){console.log(result);}))

// []

db.collection("teachers")
  .update({"name":"te1"}, {"name":te1, value:20})
  .done();

// observed query will be react!
// [{"name":te1, value:20}]

//kill
db.killOp(observer);
</pre>

Query will not executed until `done` or `onValue` is called at the end of query pipeline.

For more detail : See [Api Reference](http://georgeosddev.github.io/longo/doc).

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

Longo use HTML5 [Web Worker](https://developer.mozilla.org/en/docs/Web/Guide/Performance/Using_web_workers).

Browser compatibility is described [here](https://developer.mozilla.org/en/docs/Web/Guide/Performance/Using_web_workers#Browser_Compatibility)

## Develop

	git clone https://github.com/georgeOsdDev/longo.git
	cd longo
	npm install -g grunt-cli
	npm install
	grunt build

## Licence

Source code can be found on [github](https://github.com/georgeOsdDev/longo), licenced under [MIT](http://opensource.org/licenses/mit-license.php).

Developed by [Takeharu.Oshida](http://about.me/takeharu.oshida).