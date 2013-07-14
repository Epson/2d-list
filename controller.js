var fs = require("fs"),
	csv = require('csv'),
	Config = require('./config'),
	Question = require('./question'),
	EventCenter = require('./eventCenter'),
	Subjects = require('./webRoot/files/subjects');

var Controller = {

	proxy: function(func, context) {
		return(function(){
            return func.apply(context, arguments);
        });
	},

	// generateSubject: function() {
	// 	return Subjects[parseInt(Math.random() * 3)]["name"];
	// },

	getSubjectFilesList: function(subject) {
		var file_list = require("./webRoot/files/" + subject + "/" + subject);
		var result = [];

		for(var i = 0; i < file_list.length; i ++) {
			result[result.length] = file_list[i];
		}

		return result;
	},

	generateTest: function(numOfItems, questionType, subject) {
		var test = {};
		var items = [];
		
		test.subject = subject;
		test.questionTypeId = questionType.split("_")[1];

		return test;
	},

	getAllTests: function(req, res, subject) {
		var message = {};
		var experiments = Config.experiments;
		
		message.experimentName = Config.experimentName;
		message.experiments = [];
		for(var i = 0; i < experiments.length; i ++) {
			var experiment = {};

			experiment.experimentName = Config.experimentName;
			experiment.type = experiments[i].type;
			experiment.numOfTasks = experiments[i].numOfTasks;
			experiment.numOfItems = experiments[i].numOfItems;
			experiment.numOfCols = experiments[i].numOfCols;
			experiment.numOfRows = experiments[i].numOfRows;
			experiment.tasks = [];

			for(var j = 0; j < experiments[i].numOfTasks; j ++) {
				var task = {};

				task.time = experiments[i]["tasks"][j].time;
				task.questionTypes = experiments[i]["tasks"][j].questionTypes;
				task.tests = [];

				for(var k = 0; k < experiments[i]["tasks"][j].numOfTests; k++) {
					task.tests[task.tests.length] = this.generateTest(experiments[i].numOfItems, experiments[i]["tasks"][j]["tests"][k], subject);
				}

				experiment.tasks[experiment.tasks.length] = task;
			}

			message.experiments[message.experiments.length] = experiment;
		}

		EventCenter.trigger("sendAllTestsMessage", [req, res, message]);
	},

	getSubjects: function(req, res, subject) {
		var subjects;

		subjects = this.getSubjectFilesList(subject);
	
		EventCenter.trigger("sendSubjects", [req, res, subjects]);
	},

	getAllQuestions: function(req, res) {
		var experimentName = Config.experimentName;

		fs.readdir("webRoot/js/experiments/" + experimentName + "/questions", function(err, questionFiles) {
			if( err ) {
				console.log(err);
				return ;
			}

			var questionObj = {
				experimentName: experimentName,
				questionFiles: questionFiles
			};
			EventCenter.trigger("sendAllQuestions", [req, res, questionObj]);
		});
	},

	generateCSVFile: function(experimentName, collectionName) {
		var callback = function(err, result) {
			if( err ) {
				return ;
			}

			EventCenter.trigger("generateCSVFile", [result, experimentName, collectionName]);
		};

		EventCenter.trigger("getAllRecordsInCollection", [collectionName, callback]);
	},

	outputToCSVFile: function(headers, content, experimentName, collectionName) {
		csv()
		.from(headers + "\n" + content)
		.to.path(__dirname + '/experiments/' + experimentName + "/" + collectionName + "Result.csv");
	},

	saveResult: function(experimentResultData, req, res, callback) {
		var experimentName = experimentResultData.experimentName;
		var subject = experimentResultData.subject;
		var collectionName = subject + "Of" +  experimentName;
		var that = this;

		var cb = function(err) {
			if( err ) {
				return callback(err, req, res) ;
			}

			that.generateCSVFile(experimentName, collectionName);

			return callback(err, req, res);
		};

		EventCenter.trigger("saveRecordInCollection", [collectionName, experimentResultData, cb]);
	},

	loadExperiment: function() {
		var experimentName = Config.experimentName;
		var path = "./experiments/" + experimentName + "/" + experimentName;
		var experiment = require(path);

		experiment.init();
	},

	subscribeEvents: function() {
		EventCenter.bind("getSubjects", this.proxy(this.getSubjects, this));
		EventCenter.bind("getAllQuestions", this.proxy(this.getAllQuestions, this));
		EventCenter.bind("getAllTests", this.proxy(this.getAllTests, this));
		EventCenter.bind("saveResult", this.proxy(this.saveResult, this));
		EventCenter.bind("outputToCSVFile", this.proxy(this.outputToCSVFile, this));
	},

	init: function() {
		this.subscribeEvents();

		this.loadExperiment();
	}
};

module.exports = Controller;