# *This matrix is not well maintenanced yet.*

Longo is focusing to be work as like as Mongo Shell in browser world.

[Mongo Shell APIs](http://docs.mongodb.org/manual/reference/method/) described below are supported.

Except non-CRUD operation like Sharding, Replication, Auth, etcetra are not supported because it is used only in the browser by single user.

##Database APIs

|MongoDB Method              | Supported   | Inpremented |
|----------------------------|:-----------:|:-----------:|
|db.addUser                  | no          | -           |
|db.auth                     | no          | -           |
|db.changeUserPassword       | no          | -           |
|db.cloneCollection          | yes         | [See API](http://georgeosddev.github.io/longo/doc/DB.html#cloneCollection)         |
|db.cloneDatabase            | no          | -           |
|db.commandHelp              | no          | -           |
|db.copyDatabase             | no          | -           |
|db.createCollection         | yes         | [See API](http://georgeosddev.github.io/longo/doc/DB.html#createCollection)         |
|db.currentOp                | yes         | [See API](http://georgeosddev.github.io/longo/doc/DB.html#currentOp)         |
|db.dropDatabase             | yes         | [See API](http://georgeosddev.github.io/longo/doc/DB.html#dropDatabase)         |
|db.eval                     | no          | -           |
|db.fsyncLock                | no          | -           |
|db.fsyncUnlock              | no          | -           |
|db.getCollection            | yes         | [See API](http://georgeosddev.github.io/longo/doc/DB.html#getCollection)         |
|db.getCollectionNames       | yes         | [See API](http://georgeosddev.github.io/longo/doc/DB.html#getCollectionNames)         |
|db.getLastError             | yes         | [See API](http://georgeosddev.github.io/longo/doc/DB.html#getLastError)         |
|db.getLastErrorObj          | no          | [See API](http://georgeosddev.github.io/longo/doc/DB.html#getLastErrorObj)         |
|db.getMongo                 | no          | -           |
|db.getName                  | yes         | [See API](http://georgeosddev.github.io/longo/doc/DB.html#getName)         |
|db.getPrevError             | no          | -           |
|db.getProfilingLevel        | no          | -           |
|db.getProfilingStatus       | no          | -           |
|db.getReplicationInfo       | no          | -           |
|db.getSiblingDB             | no          | -           |
|db.help                     | no          | -           |
|db.hostInfo                 | no          | -           |
|db.isMaster                 | no          | -           |
|db.killOp                   | yes         | [See API](http://georgeosddev.github.io/longo/doc/DB.html#killOp)         |
|db.listCommands             | no          | `console.log(Longo.createDB(""));`           |
|db.loadServerScripts        | no          | -           |
|db.logout                   | no          | -           |
|db.printCollectionStats     | no          | -           |
|db.printReplicationInfo     | no          | -           |
|db.printShardingStatus      | no          | -           |
|db.printSlaveReplicationInfo| no          | -           |
|db.removeUser               | no          | -           |
|db.repairDatabase           | no          | -           |
|db.resetError               | no          | -           |
|db.runCommand               | no          | -           |
|db.serverBuildInfo          | no          | -           |
|db.serverStatus             | no          | -           |
|db.setProfilingLevel        | no          | -           |
|db.shutdownServer           | no          | -           |
|db.stats                    | no          | -           |
|db.version                  | no          | Use [Longo.getVersion](http://georgeosddev.github.io/longo/doc/Longo.html#getVersion)         |


##Collection APIs

|MongoDB Method                    | supported | inpremented |
|----------------------------------|:---------:|:-----------:|
|db.collection.aggregate           | yes       | [See API](http://georgeosddev.github.io/longo/doc/Collection.html#aggregate)         |
|db.collection.count               | yes       | [See API](http://georgeosddev.github.io/longo/doc/Collection.html#count)         |
|db.collection.copyTo              | yes       | [See API](http://georgeosddev.github.io/longo/doc/Collection.html#copyTo)         |
|db.collection.createIndex         | no        | -           |
|db.collection.getIndexStats       | no        | -           |
|db.collection.indexStats          | no        | -           |
|db.collection.dataSize            | yes       | [See API](http://georgeosddev.github.io/longo/doc/Collection.html#dataSize)         |
|db.collection.distinct            | yes       | no          |
|db.collection.drop                | yes       | [See API](http://georgeosddev.github.io/longo/doc/Collection.html#dataSize)         |
|db.collection.dropIndex           | no        | -           |
|db.collection.dropIndexes         | no        | -           |
|db.collection.ensureIndex         | no        | -           |
|db.collection.find                | yes       | [See API](http://georgeosddev.github.io/longo/doc/Collection.html#find)         |
|db.collection.findAndModify       | yes       | no          |
|db.collection.findOne             | yes       | [See API](http://georgeosddev.github.io/longo/doc/Collection.html#findOne)         |
|db.collection.getIndexes          | no        | -           |
|db.collection.getShardDistribution| no        | -           |
|db.collection.getShardVersion     | no        | -           |
|db.collection.group               | yes       | no          |
|db.collection.insert              | yes       | [See API](http://georgeosddev.github.io/longo/doc/Collection.html#insert)         |
|db.collection.isCapped            | yes       | [See API](http://georgeosddev.github.io/longo/doc/Collection.html#isCapped)         |
|db.collection.mapReduce           | yes       | no          |
|db.collection.reIndex             | no        | -           |
|db.collection.remove              | yes       | [See API](http://georgeosddev.github.io/longo/doc/Collection.html#remove)         |
|db.collection.renameCollection    | yes       | [See API](http://georgeosddev.github.io/longo/doc/Collection.html#renameCollection)         |
|db.collection.save                | yes       | [See API](http://georgeosddev.github.io/longo/doc/Collection.html#save)         |
|db.collection.stats               | no        | -           |
|db.collection.storageSize         | no        | -           |
|db.collection.totalSize           | yes       | [See API](http://georgeosddev.github.io/longo/doc/Collection.html#totalSize)         |
|db.collection.totalIndexSize      | no        | -           |
|db.collection.update              | yes       | [See API](http://georgeosddev.github.io/longo/doc/Collection.html#update)         |
|db.collection.validate            | no        | -           |


| Longo Original APIs                | inpremented |
|------------------------------------|:-----------:|
|db.collection.persist               | [See API](http://georgeosddev.github.io/longo/doc/Collection.html#persist)    |
|db.collection.persistOnce           | [See API](http://georgeosddev.github.io/longo/doc/Collection.html#persistOnce)    |
|db.collection.setDefaultErrorHandler| [See API](http://georgeosddev.github.io/longo/doc/Collection.html#setDefaultErrorHandler)    |

##Cursor APIs

In longo, differ from MongoDB, Cursor object does not have and reference to data.
Cursor is work as command stack, It will never executed until Cursror receiver APIs called.
Result dataset will be passed to these receiver.

|MongoDB Method        | supported | inpremented |
|----------------------|:---------:|:-----------:|
|cursor.addOption      | no        | -           |
|cursor.batchSize      | no        | -           |
|cursor.count          | yes       | [See API](http://georgeosddev.github.io/longo/doc/Cursor.html#count)         |
|cursor.explain        | no        | -           |
|cursor.forEach        | yes       | [See API](http://georgeosddev.github.io/longo/doc/Cursor.html#forEach)         |
|cursor.hasNext        | no        | -           |
|cursor.hint           | no        | -           |
|cursor.limit          | yes       | [See API](http://georgeosddev.github.io/longo/doc/Cursor.html#limit)         |
|cursor.map            | yes       | [See API](http://georgeosddev.github.io/longo/doc/Cursor.html#map)         |
|cursor.maxTimeMS      | no        | -           |
|cursor.max            | yes       | [See API](http://georgeosddev.github.io/longo/doc/Cursor.html#max)         |
|cursor.min            | yes       | [See API](http://georgeosddev.github.io/longo/doc/Cursor.html#min)         |
|cursor.next           | no        | -           |
|cursor.objsLeftInBatch| no        | -           |
|cursor.readPref       | no        | -           |
|cursor.showDiskLoc    | no        | -           |
|cursor.size           | yes       | [See API](http://georgeosddev.github.io/longo/doc/Cursor.html#size)         |
|cursor.skip           | yes       | [See API](http://georgeosddev.github.io/longo/doc/Cursor.html#skip)         |
|cursor.snapshot       | no        | -           |
|cursor.sort           | yes       | [See API](http://georgeosddev.github.io/longo/doc/Cursor.html#sort)         |
|cursor.toArray        | yes       | In Longo, result dataset always responsed as `Array`


| Cursror receiver APIs            | inpremented |
|----------------------------------|:-----------:|
|cursor.done                       | [See API](http://georgeosddev.github.io/longo/doc/Cursor.html#done)
|cursor.onValue                    | [See API](http://georgeosddev.github.io/longo/doc/Cursor.html#onValue)
|cursor.assign                     | [See API](http://georgeosddev.github.io/longo/doc/Cursor.html#assign)
|cursor.promise                    | [See API](http://georgeosddev.github.io/longo/doc/Cursor.html#promise)


##Query operators

Query operators are depended on [underscore-query](https://github.com/davidgtonge/underscore-query).

[Query API](https://github.com/davidgtonge/underscore-query#query-api)
`$equal`
`$contains`
`$ne`
`$lt`
`$lte`
`$gt`
`$gte`
`$between`
`$in`
`$nin`
`$all`
`$any`
`$size`
`$exists or $has`
`$like`
`$likeI`
`$elemMatch`

~~`$regex`~~
~~`$cb`~~
~~`$computed`~~

Longo does not support `$regex`、`$cb`、`$computed` operators. Because we use JSON formatted message between main thread and worker thread.

You can use `Longo.collection.find({}).map` instead, to perform like `$regex`、`$cb`、`$computed` operators.

##Projection operators


##Update operators
