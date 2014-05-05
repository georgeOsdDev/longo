## Build

1. Longo is not released to npm, bower yet. You need build it from source.

		git clone https://github.com/georgeOsdDev/longo.git
		cd longo
		npm install -g grunt-cli
		npm install
		grunt build

## Install

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