# Under construction. Not working

---

Longo.js
========

Asynchronous local database with a flavor of FRP.
(`Longo` means the Analects(Lunyu), in Japanese)

> 子曰:
> 学而时习之，不亦说乎


### MongoDB like JavaScript Database Engine, in the local world of browser.

 * Event-Driven with the spilit of [The Reactive Manifesto](http://www.reactivemanifesto.org/).
 * Work in multi thread with the power of WebWorker.
 * Work on offline with embedded NoSQL-Database.
 * Work with query operator similar to that of MongoDB.
 * Functional programming style with [Underscore.js](http://underscorejs.org/)

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

 * [Underscore.js](http://underscorejs.org/)
 * [underscore-query](https://github.com/davidgtonge/underscore-query)

## Usage

Download [file](http://path.to.tarball) and put it to your server.

Make sure that `longo.js`, `longoCollectionWorker.js`, `lib` is put in same directory eg.`Longo`.

Just only `longo.js` (or `longo.min.js`) is need to be loaded in html.
Other files will be imported at worker thread.

	<script type="text/javascript" src="path/to/Longo/longo.js"></script>


## APIs

Longo is focusing to be work as like Mongo Shell in browser world.
See [diffrence between Mongo Shell](./supportedMongoShell).

### Basic Example

Create database.

	var db = new Longo("zoo");

Create collection and save document.

	var opId = db.collection("animals")
								.insert([
								  {"name":"tiger",  count:5,  "food":["chicken", "water"]},
								  {"name":"monkey", count:15, "food":["apple", "banana", "water"]}
								])
							 	.done(function(error){
							 		if(error) return console.log("fail to save", error);
							 		console.log("tiger saved");
							  });

Search document from collection.

	var opId = db.collection("animal")
							  .find({"count":{"gt":3}}, {"_id":0})
							  .sort({"name":1})
							  .limit(5)
							  .done(function(error, result){
							 		if(error) return console.log("fail to find", error);
							 		console.log(result);
							 	});


Observe document.

	db.collection("animals").insert({"name":rabit, count:10});

	var rabitCounter = db.collection("animal")
									  .find({"name":"rabit"}, {"_id":0, "count":1});
									  .onValue(function(error, result){
									  	if(error) return console.log(error);
									  	console.log("There are" + result[0] + "rabits.");
									  });

	// There are 10 rabits!

	db.collection("animals").update({"name":"rabit"}, {"name":rabit, count:20}).done();

	// There are 20 rabits!

	DB.killOp(rabitCounter);

	db.collection("animals").update({"name":"rabit"}, {"name":rabit, count:15}).done();

	// nothing happen




For more detail : See [Api Reference](http://path.to.documents).

### Query Operators

Longo use [underscore-query](https://github.com/davidgtonge/underscore-query) for query operation.
It is similer to mongoShell API.
You can use it's query for `find`, `update`, and `$match` in `aggregation` pipeline.

### Aggregation Operators

## Browser Support

Longo use HTML5 [Web Worker](https://developer.mozilla.org/en/docs/Web/Guide/Performance/Using_web_workers).

Browser compatibility is described [here](https://developer.mozilla.org/en/docs/Web/Guide/Performance/Using_web_workers#Browser_Compatibility)

## Build

## Licence

Source code can be found on [github](https://github.com/georgeOsdDev/markdown-edit), licenced under [MIT](http://opensource.org/licenses/mit-license.php).

Developed by [Takeharu.Oshida](http://about.me/takeharu.oshida).