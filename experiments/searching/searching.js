var fs = require('fs'),
	Questions = require('../../question');

var searching = {
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
		var testHeader = [];
		var questionHeader = [];
		var resultHeader = [];

		experimentHeader.push("experimentType:");
		itemHeader.push("numOfItems:");
		taskTimeHeader.push("time:");
		testHeader.push("test");
		questionHeader.push("question:");
		resultHeader.push("result:");

		for(var i = 0; i < numOfExperiments; i ++) {
			var experiment = experimentResultData["experiment_" + (i + 1)];
			var numOfTasks = experiment.numOfTasks;
			var numOfItems = experiment.numOfItems;

			experimentHeader.push(experiment.experimentType);
			itemHeader.push(numOfItems);
			
			for(var j = 0; j < numOfTasks; j ++) {
				var task = experiment["tasks"][j];
				var numOfTests = task.numOfTests;

				taskTimeHeader.push(task.time);

				for(var t = 0; t < numOfTests; t ++) {
					var test = task["tests"][t];

					testHeader.push(t + 1);

					for(var k = 0; k < numOfAllQuestions; k ++) {
						var questionType = questions[k].split(".")[0];

						questionHeader.push(questionType);

						var question = Questions[questionType];
						var numOfPros = question["result"].length;
						for(resultIndex = 0; resultIndex < numOfPros; resultIndex ++) {
							resultHeader.push(question["result"][resultIndex]);
			
							if( j === 0 && t === 0 && k === 0 && resultIndex === 0 ) {

							} else {
								experimentHeader.push("");
								itemHeader.push("");

								if( t === 0 && k === 0 && resultIndex === 0 ) {

								} else {
									taskTimeHeader.push("");

									if( k === 0 && resultIndex === 0 ) {
											
									} else {
										testHeader.push("");

										if( resultIndex !== 0 ) {
											questionHeader.push("");
										} 
									}
								}
							}
						}
					}
				}
			}

			experimentHeader.push("");
			itemHeader.push("");
			taskTimeHeader.push("");
			testHeader.push("")
			questionHeader.push("");
			resultHeader.push("");
		}

		var headers = {
			experimentHeader: experimentHeader,
			itemHeader: itemHeader,
			taskTimeHeader: taskTimeHeader,
			testHeader: testHeader,
			questionHeader: questionHeader,
			resultHeader: resultHeader
		};

		return headers;
	},

	generateCSVFile: function(results, experimentName) {
		var questions = fs.readdirSync("webRoot/js/experiments/" + experimentName + "/questions");
		var numOfAllQuestions = questions.length;
		var headersObj = this.generateHeaderOfCSVFile(questions, results[0]);

		var headers = headersObj.experimentHeader.join(",") + "\n" + headersObj.itemHeader.join(",") +
			"\n" + headersObj.taskTimeHeader.join(",") + "\n" + headersObj.testHeader.join(",") + 
			"\n" + headersObj.questionHeader.join(",") + "\n" + headersObj.resultHeader.join(",");

		var content = [];
		for(var i = 0; i < results.length; i ++) {
			var numOfExperiments = results[i].numOfExperiments;
			var row = [];

			row.push("");
			for(var j = 1; j <= numOfExperiments; j ++) {
				var experiment = results[i]["experiment_" + j];
				var numOfTasks = experiment.numOfTasks;

				for(var k = 0; k < numOfTasks; k ++) {
					var task = experiment["tasks"][k];
					var numOfTests = task.numOfTests;

					for(var t = 0; t < numOfTests; t ++) {
						var test = task["tests"][t];

						for(var q = 0; q < numOfAllQuestions; q ++) {
							var questionType = questions[k].split(".")[0];
							var question = test[questionType];
							var questionMes = Questions[questionType];
							var numOfPros = questionMes["result"].length;

							for(var p = 0; p < numOfPros; p ++) {
								var proName = questionMes["result"][p];

								row.push(question[proName]);
							}
						}
					}
				}

				row.push("");
			}

			row.join(",");
			content.push(row);
		}

		content = content.join("\n");

		
		EventCenter.trigger("outputToCSVFile", [headers, content, "searching"]);
	},

	subscribeEvents: function() {
		EventCenter.bind("generateCSVFile", this.proxy(this.generateCSVFile, this));
	},

	init: function() {
		this.subscribeEvents();
	}
}

module.exports = searching;