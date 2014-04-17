# Longo TodoMVC Example

> This is a example implementation of TodoMVC by Longo.js.

> In fact, since this is a sample about Longo.js, this sample not in MVC style.

> _[Longo.js](http://georgeosddev.github.io/longo/)_


## Learning Longo.js

The [Longo.js website](http://georgeosddev.github.io/longo/) is a great resource for getting started.

Here are some links you may find helpful:

* [Documentation](http://georgeosddev.github.io/longo/)
* [API Reference](http://georgeosddev.github.io/longo/doc/)
* [Longo.js on GitHub](https://github.com/georgeOsdDev/longo)

_If you have other helpful links to share, or find any of the links above no longer work, please [let us know](https://github.com/georgeOsdDev/longo/issues)._


## Implementation

The Longo.js implementation of TodoMVC has a few key differences with other implementations:

* Longo.js is not MVC Framework, it is just an asynchronous database.
* Longo.js does not contain MVC logic (eg.Binding Model to View, etc).
* So this sample is based on [Jquery implementation](https://github.com/tastejs/todomvc/tree/gh-pages/architecture-examples/jquery)
* This sample show how Longo work as **Reactive**.


## Running

Longo use HTML5 [Web Worker](https://developer.mozilla.org/en/docs/Web/Guide/Performance/Using_web_workers).

Browser compatibility is described [here](https://developer.mozilla.org/en/docs/Web/Guide/Performance/Using_web_workers#Browser_Compatibility)

1. Install [node.js](nodejs.org)
1. Required for `bower` client-side package management, `grunt` the javascript task runner
 * Install grunt: `npm install -g grunt-cli`
 * Install bower: `npm install -g bower`

1. From the root folder, `grunt build`
1. From the `example/todomvc/` folder, run `bower update`
1. Start a web server in the `example/` folder.
	 Hint: if you have python installed, you can just run:

     `python -m SimpleHTTPServer`

1. Browse [http://localhost:8000/example/todomvc/](http://localhost:8000/example/todomvc/)

## Credit

This TodoMVC application was created by [Takeharu.Oshida](http://about.me/takeharu.oshida).
