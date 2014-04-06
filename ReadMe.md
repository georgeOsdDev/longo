#Under construction

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

## Usage

## APIs

### DB

### Collection

### Query

### Query Operators

## Browser Support

## Build

## Licence

Source code can be found on [github](https://github.com/georgeOsdDev/markdown-edit), licenced under [MIT](http://opensource.org/licenses/mit-license.php).

Developed by [Takeharu.Oshida](http://about.me/takeharu.oshida)