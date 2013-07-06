var fs = require("fs");

var identification = {
	proxy: function(func, context) {
		return(function(){
            return func.apply(context, arguments);
        });
	},

	generateHeaderOfCSVFile: function(questions, experimentResultData) {
		var numOfAllQuestions = questions.length;
		var numOfExperiments = experimentResultData.numOfExperiments;

		var experimentHeader = [];
		var itemHeader = [];
		var taskTimeHeader = [];
		var questionHeader = [];

		experimentHeader.push("experimentType:");
		itemHeader.push("numOfItems:");
		taskTimeHeader.push("time:");
		questionHeader.push("question:");
		for(var i = 0; i < numOfExperiments; i ++) {
			var experiment = experimentResultData["experiment_" + (i + 1)];
			var numOfTasks = experiment.numOfTasks;
			var numOfItems = experiment.numOfItems;

			experimentHeader.push(experiment.experimentType);
			itemHeader.push(numOfItems);
			
			for(var j = 0; j < numOfTasks; j ++) {
				var task = experiment["scores"]["task_" + (j + 1)];
				
				taskTimeHeader.push(task.time);

				for(var k = 1; k <= numOfAllQuestions; k ++) {
					if( k === 1 && j === 0 ) {

					} else {
						experimentHeader.push("");
						itemHeader.push("");

						if( k !== 1 ) {
							taskTimeHeader.push("");
						}
					}
					
					questionHeader.push("question_" + k);
				}
			}

			experimentHeader.push("");
			itemHeader.push("");
			taskTimeHeader.push("");
			questionHeader.push("");
		}

		var headers = {
			experimentHeader: experimentHeader,
			itemHeader: itemHeader,
			taskTimeHeader: taskTimeHeader,
			questionHeader: questionHeader
		};

		return headers;
	},

	generateCSVFile: function(results, experimentName) {
		var questions = fs.readdirSync("webRoot/js/experiments/" + experimentName + "/questions");
		var headersObj = this.generateHeaderOfCSVFile(questions, results[0]);

		var headers = headersObj.experimentHeader.join(",") + "\n" + headersObj.itemHeader.join(",") +
			"\n" + headersObj.taskTimeHeader.join(",") + "\n" + headersObj.questionHeader.join(",");

		var content = [];
		for(var i = 0; i < results.length; i ++) {
			var numOfExperiments = results[i].numOfExperiments;
			var row = [];

			row.push("");
			for(var j = 1; j <= numOfExperiments; j ++) {
				var experiment = results[i]["experiment_" + j];
				var numOfTasks = experiment.numOfTasks;

				for(var k = 1; k <= numOfTasks; k ++) {
					var task = experiment["scores"]["task_" + k];
					var numOfQuestions = questions.length;

					for(var l = 1; l <= numOfQuestions; l ++) {
						if( task["question_" + l] ) {
							row.push(task["question_" + l]["correct"]);
						} else {
							row.push("*");
						}
					}
				}

				row.push("");
			}

			row.join(",");
			content.push(row);
		}

		content = content.join("\n");

		EventCenter.trigger("outputToCSVFile", [headers, content, "identification"]);
	},

	subscribeEvents: function() {
		EventCenter.bind("generateCSVFile", this.proxy(this.generateCSVFile, this));
	},

	init: function() {
		this.subscribeEvents();
	}
}

module.exports = identification;