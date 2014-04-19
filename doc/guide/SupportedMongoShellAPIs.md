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

|method                            | supported | inpremented |
|----------------------------------|:---------:|:-----------:|
|db.collection.aggregate           | yes       | no          |
|db.collection.count               | yes       | no          |
|db.collection.copyTo              | yes       | no          |
|db.collection.createIndex         | no        | -           |
|db.collection.getIndexStats       | no        | -           |
|db.collection.indexStats          | no        | -           |
|db.collection.dataSize            | yes       | no          |
|db.collection.distinct            | yes       | no          |
|db.collection.drop                | yes       | no          |
|db.collection.dropIndex           | no        | -           |
|db.collection.dropIndexes         | no        | -           |
|db.collection.ensureIndex         | no        | -           |
|db.collection.find                | yes       | no          |
|db.collection.findAndModify       | yes       | no          |
|db.collection.findOne             | yes       | no          |
|db.collection.getIndexes          | no        | -           |
|db.collection.getShardDistribution| no        | -           |
|db.collection.getShardVersion     | no        | -           |
|db.collection.group               | yes       | no          |
|db.collection.insert              | yes       | no          |
|db.collection.isCapped            | yes       | no          |
|db.collection.mapReduce           | yes       | no          |
|db.collection.reIndex             | no        | -           |
|db.collection.remove              | yes       | no          |
|db.collection.renameCollection    | yes       | no          |
|db.collection.save                | yes       | no          |
|db.collection.stats               | no        | -           |
|db.collection.storageSize         | yes       | no          |
|db.collection.totalSize           | yes       | no          |
|db.collection.totalIndexSize      | no        | -           |
|db.collection.update              | yes       | no          |
|db.collection.validate            | no        | -           |

| Original APIs                      | inpremented |
|------------------------------------|:-----------:|
|db.collection.loadFromServer        | no          |
|db.collection.loadFromLocalStorage  | no          |
|db.collection.persistToServ         | no          |
|db.collection.persistToLocalStorage | no          |

##Cursor APIs

|method                | supported | inpremented |
|----------------------|:---------:|:-----------:|
|cursor.addOption      | no        | -           |
|cursor.batchSize      | no        | -           |
|cursor.count          | yes       | yes         |
|cursor.explain        | no        | -           |
|cursor.forEach        | yes       | no          |
|cursor.hasNext        | no        | -           |
|cursor.hint           | no        | -           |
|cursor.limit          | yes       | yes         |
|cursor.map            | yes       | no          |
|cursor.max            | yes       | yes         |
|cursor.min            | yes       | yes         |
|cursor.next           | no        | -           |
|cursor.objsLeftInBatch| no        | -           |
|cursor.readPref       | no        | -           |
|cursor.showDiskLoc    | no        | -           |
|cursor.size           | yes       | yes         |
|cursor.skip           | yes       | yes         |
|cursor.snapshot       | no        | -           |
|cursor.sort           | yes       | no          |
|cursor.toArray        | yes       | yes         |

| Original APIs                    | inpremented |
|----------------------------------|:-----------:|
|cursor.done                       | yes         |
|cursor.onValue                    | yes         |


##Query operators

Query operators are depended on [underscore-query](https://github.com/davidgtonge/underscore-query#query-api).

##Projection operators


##Update operators
