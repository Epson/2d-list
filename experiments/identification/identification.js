var fs = require("fs");

var identification = {
	proxy: function(func, context) {
		return(function(){
      return func.apply(context, arguments);
    });
	},

	generateHeaderOfCSVFile: function(experiments) {
		var numOfQuestionTypes,
				questionHeader, timeHeader, listHeader;

		questionHeader = [];
		timeHeader = [];
		listHeader = [];

		questionHeader.push("questionType: ");
		timeHeader.push("timeType: ");
		listHeader.push("listType");

		results = experiments[0];
		numOfQuestionTypes = results.questionTypes.length;

		for(var i = 0; i < numOfQuestionTypes; i ++) {
			var questionType = results.questionTypes[i];
			var questionResult = results[questionType];
			var numOfTime = questionResult.timeTypes.length;

			for(var j = 0; j < numOfTime; j ++) {
				var timeType = questionResult.timeTypes[j];
				var timeTaskResult = questionResult[timeType];
		
				var ListResults_1D = timeTaskResult["1d"];
				questionHeader.push(questionType);
				timeHeader.push(timeType);
				listHeader.push("1D");
				for(var t = 0; t < ListResults_1D.length; t ++) {
					questionHeader.push("");
					timeHeader.push("");
					listHeader.push("");
				}

				var ListResults_2D = timeTaskResult["2d"];
				questionHeader.push(questionType);
				timeHeader.push(timeType);
				listHeader.push("2D");
				for(var t = 0; t < ListResults_2D.length; t ++) {
					questionHeader.push("");
					timeHeader.push("");
					listHeader.push("");
				}
			}
		}

		var headers = {
			questionHeader: questionHeader,
			timeHeader: timeHeader,
			listHeader: listHeader
		};

		return headers;

		// var numOfAllQuestions = questions.length;
		// var numOfExperiments = experimentResultData.numOfExperiments;

		// var experimentHeader = [];
		// var itemHeader = [];
		// var taskTimeHeader = [];
		// var questionHeader = [];

		// experimentHeader.push("experimentType:");
		// itemHeader.push("numOfItems:");
		// taskTimeHeader.push("time:");
		// questionHeader.push("question:");
		// for(var i = 0; i < numOfExperiments; i ++) {
		// 	var experiment = experimentResultData["experiment_" + (i + 1)];
		// 	var numOfTasks = experiment.numOfTasks;
		// 	var numOfItems = experiment.numOfItems;

		// 	experimentHeader.push(experiment.experimentType);
		// 	itemHeader.push(numOfItems);
			
		// 	for(var j = 0; j < numOfTasks; j ++) {
		// 		var task = experiment["scores"]["task_" + (j + 1)];
				
		// 		taskTimeHeader.push(task.time);

		// 		for(var k = 1; k <= numOfAllQuestions; k ++) {
		// 			if( k === 1 && j === 0 ) {

		// 			} else {
		// 				experimentHeader.push("");
		// 				itemHeader.push("");

		// 				if( k !== 1 ) {
		// 					taskTimeHeader.push("");
		// 				}
		// 			}
					
		// 			questionHeader.push("question_" + k);
		// 		}
		// 	}

		// 	experimentHeader.push("");
		// 	itemHeader.push("");
		// 	taskTimeHeader.push("");
		// 	questionHeader.push("");
		// }

		// var headers = {
		// 	experimentHeader: experimentHeader,
		// 	itemHeader: itemHeader,
		// 	taskTimeHeader: taskTimeHeader,
		// 	questionHeader: questionHeader
		// };

		// return headers;
	},

	generateCSVFile: function(experiments, experimentName, collectionName) {
		console.log(experiments);
		var numOfQuestionTypes, results, content, 
				indexRow, scoreRow, timeRow,
				headersObj, header;

		content = [];
		headersObj = this.generateHeaderOfCSVFile(experiments);
		header = headersObj.questionHeader.join(",") + "\n" +
							headersObj.timeHeader.join(",") + "\n" + 
							headersObj.listHeader.join(",");
		
		for(var k = 0; k < experiments.length; k ++) {
			indexRow = [];
			scoreRow = [];
			timeRow = [];
			results = experiments[k];
			numOfQuestionTypes = results.questionTypes.length;

			indexRow.push("testIndex: ");
			scoreRow.push("score: ");
			timeRow.push("costTime: ")

			for(var i = 0; i < numOfQuestionTypes; i ++) {
				var questionResult = results[results.questionTypes[i]];
				var numOfTime = questionResult.timeTypes.length;

				for(var j = 0; j < numOfTime; j ++) {
					var timeType = questionResult.timeTypes[j];
					var timeTaskResult = questionResult[timeType];
					
					var ListResults_1D = timeTaskResult["1d"];
					var totalScore = 0;
					var totalTime = 0;
					for(var t = 0; t < ListResults_1D.length; t ++) {
						var testResult = ListResults_1D[t];

						totalScore += testResult["score"];
						if(testResult["score"] !== 0) {
							totalTime += testResult["searchingTime"];
						}

						indexRow.push(t + 1);
						scoreRow.push(testResult["score"]);
						timeRow.push(testResult["searchingTime"]);
					}
					indexRow.push("total");
					scoreRow.push(totalScore);
					timeRow.push(totalTime);

					var ListResults_2D = timeTaskResult["2d"];
					var totalScore = 0;
					var totalTime = 0;
					for(var t = 0; t < ListResults_2D.length; t ++) {
						var testResult = ListResults_2D[t];

						totalScore += testResult["score"];
						if(testResult["score"] !== 0) {
							totalTime += testResult["searchingTime"];
						}

						indexRow.push(t + 1);
						scoreRow.push(testResult["score"]);
						timeRow.push(testResult["searchingTime"]);
					}
					indexRow.push("total");
					scoreRow.push(totalScore);
					timeRow.push(totalTime);
				}
			}

			content.push(indexRow.join(",") + "\n" + scoreRow.join(",") + "\n" + timeRow.join(","));
		}

		content = content.join("\n\n");

		// var questions = fs.readdirSync("webRoot/js/experiments/" + experimentName + "/questions");
		// var headersObj = this.generateHeaderOfCSVFile(questions, results[0]);

		// var headers = headersObj.experimentHeader.join(",") + "\n" + headersObj.itemHeader.join(",") +
		// 	"\n" + headersObj.taskTimeHeader.join(",") + "\n" + headersObj.questionHeader.join(",");

		// var content = [];
		// for(var i = 0; i < results.length; i ++) {
		// 	var numOfExperiments = results[i].numOfExperiments;
		// 	var row = [];

		// 	row.push("");
		// 	for(var j = 1; j <= numOfExperiments; j ++) {
		// 		var experiment = results[i]["experiment_" + j];
		// 		var numOfTasks = experiment.numOfTasks;

		// 		for(var k = 1; k <= numOfTasks; k ++) {
		// 			var task = experiment["scores"]["task_" + k];
		// 			var numOfQuestions = questions.length;

		// 			for(var l = 1; l <= numOfQuestions; l ++) {
		// 				if( task["question_" + l] ) {
		// 					row.push(task["question_" + l]["correct"]);
		// 				} else {
		// 					row.push("*");
		// 				}
		// 			}
		// 		}

		// 		row.push("");
		// 	}

		// 	row.join(",");
		// 	content.push(row);
		// }

		// content = content.join("\n");
		EventCenter.trigger("outputToCSVFile", [header, content, experimentName, collectionName]);
	},

	subscribeEvents: function() {
		EventCenter.bind("generateCSVFile", this.proxy(this.generateCSVFile, this));
	},

	init: function() {
		this.subscribeEvents();
	}
}

module.exports = identification;