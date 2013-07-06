var mongodb = require('./db');

var dbUtils = {
	saveRecordInCollection: function(collectionName, data, callback) {
		mongodb.open(function(err, db) {
			if( err ) {
				mongodb.close();
				console.log("Error: " + err);
				return callback(err);
			}

			db.collection(collectionName, function(err, collection) {
				if( err ) {
					mongodb.close();
					console.log("Error: " + err);
					return callback(err);
				}

				collection.insert(data, {safe: true}, function(err, result) {
					db.close();
					mongodb.close();
					callback(err);
				});
			});
		});
	},

	getAllRecordsInCollection: function(collectionName, callback) {
		mongodb.open(function(err, db) {
			if( err ) {
				mongodb.close();
				console.log("Error: " + err);
				return callback(err);
			}

			db.collection(collectionName, function(err, collection) {
				if( err ) {
					mongodb.close();
					console.log("Error: " + err);
					return callback(err);
				}

				collection.find().toArray(function(err, results) {
					db.close();
					mongodb.close();
					callback(err, results);
				});
			});
		});
	},

	subscribeEvents: function() {
		EventCenter.bind("saveRecordInCollection", this.saveRecordInCollection);
		EventCenter.bind("getAllRecordsInCollection", this.getAllRecordsInCollection);
	},

	init: function() {
		this.subscribeEvents();
	}
};

module.exports = dbUtils;