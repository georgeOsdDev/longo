# Supported [MongoDB Shell Methods](http://docs.mongodb.org/manual/reference/method/)
Longo does not support Auth, Index, Sharding, etc.

##Database APIs

|method                      | supported | inpremented |
|----------------------------|:---------:|:-----------:|
|db.addUser                  | no        | -           |
|db.auth                     | no        | -           |
|db.changeUserPassword       | no        | -           |
|db.cloneCollection          | yes       | no          |
|db.cloneDatabase            | no        | -           |
|db.commandHelp              | no        | -           |
|db.copyDatabase             | no        | -           |
|db.createCollection         | yes       | no          |
|db.currentOp                | yes       | no          |
|db.dropDatabase             | yes       | no          |
|db.eval                     | no        | -           |
|db.fsyncLock                | no        | -           |
|db.fsyncUnlock              | no        | -           |
|db.getCollection            | yes       | no          |
|db.getCollectionNames       | yes       | no          |
|db.getLastError             | yes       | no          |
|db.getLastErrorObj          | no        | -           |
|db.getMongo                 | no        | -           |
|db.getName                  | yes       | no          |
|db.getPrevError             | no        | -           |
|db.getProfilingLevel        | no        | -           |
|db.getProfilingStatus       | no        | -           |
|db.getReplicationInfo       | no        | -           |
|db.getSiblingDB             | no        | -           |
|db.help                     | no        | -           |
|db.hostInfo                 | no        | -           |
|db.isMaster                 | no        | -           |
|db.killOp                   | yes       | no          |
|db.listCommands             | no        | -           |
|db.loadServerScripts        | no        | -           |
|db.logout                   | no        | -           |
|db.printCollectionStats     | no        | -           |
|db.printReplicationInfo     | no        | -           |
|db.printShardingStatus      | no        | -           |
|db.printSlaveReplicationInfo| no        | -           |
|db.removeUser               | no        | -           |
|db.repairDatabase           | no        | -           |
|db.resetError               | no        | -           |
|db.runCommand               | no        | -           |
|db.serverBuildInfo          | no        | -           |
|db.serverStatus             | no        | -           |
|db.setProfilingLevel        | no        | -           |
|db.shutdownServer           | no        | -           |
|db.stats                    | no        | -           |
|db.version                  | yes       | no          |


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
|cursor.count          | yes       | no          |
|cursor.explain        | no        | -           |
|cursor.forEach        | yes       | no          |
|cursor.hasNext        | no        | -           |
|cursor.hint           | no        | -           |
|cursor.limit          | yes       | no          |
|cursor.map            | yes       | no          |
|cursor.max            | yes       | no          |
|cursor.min            | yes       | no          |
|cursor.next           | no        | -           |
|cursor.objsLeftInBatch| no        | -           |
|cursor.readPref       | no        | -           |
|cursor.showDiskLoc    | no        | -           |
|cursor.size           | yes       | no          |
|cursor.skip           | yes       | no          |
|cursor.snapshot       | no        | -           |
|cursor.sort           | yes       | no          |
|cursor.toArray        | yes       | no          |




$gt
$gte
$in
$lt
$lte
$ne
$nin

Logical
$or
$and
$not
$nor

$exists
$type

$mod
$regex
$text
$where

$all
$elemMatch
$size