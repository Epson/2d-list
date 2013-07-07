
/**
 * @author zhaojian
 */
(function(window, $, undefined){
	var Experiment_identification = {
		proxy: function(func, context) {
			return(function(){
	      return func.apply(context, arguments);
	    });
		},

		calculateTotalScore: function(experiment) {
			var totalScore = 0;
			var numOfExperiments = experiment.length;

			for(var i = 0; i < numOfExperiments; i ++) {
				var numOfTasks = experiment[i]["tasks"].length;

				for(var j = 0; j < numOfTasks; j ++) {
					var task = experiment[i]["tasks"][j];
					var numOfTests = task["tests"].length;

					totalScore = totalScore + numOfTests - 1;
				}
			}

			return totalScore;
		},

		calculateActualScore: function(experiments) {
			var numOfExperiments = experiments.length;
			var actualScore = 0;

			for(var i = 0; i < numOfExperiments; i ++) {
				var experiment = experiments[i];
				var numOfTasks = experiment["tasks"].length;

				for(var j = 0; j < numOfTasks; j ++) {
					var task = experiment["tasks"][j];
					var numOfTests = task["tests"].length;

					for(var k = 1; k < numOfTests; k ++) {
						var test = task["tests"][k];
						
						actualScore = actualScore + test.question.result.correct;
					}
				}
			}

			return actualScore;
		},

		generateResult: function(experiments, experimentName) {
			console.log(experiments)
			console.log(experimentName)
			var numOfExperiments, results;
			numOfExperiments = experiments.length;
			results = {};

			results.questionTypes = [];
			results.numOfExperiments = numOfExperiments;
			results.experimentName = experimentName;
			for(var i = 0; i < numOfExperiments; i ++) {
				var experiment = experiments[i];
				var listType = experiment.type;
				var tasks = experiment["tasks"];
				var numOfTasks = tasks.length;

				for(var j = 0; j < numOfTasks; j ++) {
					var questionType = tasks[j].questionTypes[0];
					var questionResult = {};
					var time = tasks[j].time;
					var tests = tasks[j]["tests"];
					var numOfTests = tests.length;
					var taskResult = [];

					if(!results["question_" + questionType]) {
						results.questionTypes.push("question_" + questionType);
					}
					results["question_" + questionType] = results["question_" + questionType] || {};
					results["question_" + questionType].timeTypes = results["question_" + questionType].timeTypes || [];

					if(!results["question_" + questionType][time + "ms"]) {
						results["question_" + questionType].timeTypes.push(time + "ms");
					}
					results["question_" + questionType][time + "ms"] = results["question_" + questionType][time + "ms"] || {};

					for(var k = 0; k < numOfTests; k ++) { 
						var test = tests[k];
						var testResult = {};

						testResult["score"] = test.question.result["wrong"]; 
						testResult["searchingTime"] = test.question.result["searchingTime"];
						
						taskResult.push(testResult);
					}

					results["question_" + questionType][time + "ms"][listType] = taskResult;
				}
			}

			console.log(results);

			// results.numOfExperiments = numOfExperiments;
			// results.experimentName = experimentName;
			// for(var i = 0; i < numOfExperiments; i ++) {
			// 	var experiment = experiments[i];
			// 	var tasks = experiment["tasks"];
			// 	var experimentResult = {};

			// 	experimentResult.numOfItems = experiment.numOfItems;
			// 	experimentResult.experimentType = experiment.type;
			// 	experimentResult.numOfTasks = tasks.length;
			// 	experimentResult.scores = {};

			// 	for(var j = 0; j < experimentResult.numOfTasks; j ++) {
			// 		var questionTypes = tasks[j].questionTypes;
			// 		var tests = tasks[j]["tests"];
			// 		var numOfTests = tests.length;
			// 		var taskScore = {};

			// 		for(var k = 0; k < questionTypes.length; k ++) {
			// 			var questionType = "question_" + questionTypes[k];

			// 			taskScore[questionType] = {};
			// 			taskScore[questionType]["wrong"] = 0;
			// 			taskScore[questionType]["correct"] = 0;
			// 		}

			// 		for(var k = 0; k < numOfTests; k ++) {
			// 			var test = tests[k];
			// 			var questionType = "question_" + test.questionTypeId;
			// 			taskScore[questionType]["wrong"] += test.question.result["wrong"];
			// 			taskScore[questionType]["correct"] += test.question.result["correct"];
			// 		}	

			// 		taskScore["time"] = tasks[j].time;
			// 		experimentResult.scores["task_" + (j+1)] = taskScore;
			// 	}

			// 	results["experiment_" + (i+1)] = experimentResult;
			// }

			EventCenter.trigger("controller-sendResult", [results]);
		},

		showTest: function(experiments, currentExperiment, currentTask, currentTest) {
			var experiment = experiments[currentExperiment];
			var task = experiment["tasks"][currentTask];
			var test = task["tests"][currentTest];
			var numOfRows = experiment.numOfRows;
			var numOfCols = experiment.numOfCols;
			var experimentType = experiment.type;
			var question = test.question;
			var subject = test.subject;
			var time = task.time;
			var that = this;
	
			var callback = function() {
				setTimeout(function() {
					EventCenter.trigger("viewer-showQuestion", [experimentType, question, subject, numOfRows, numOfCols]);
					that.autoTest();
				}, time);
			};

			EventCenter.trigger("viewer-showItems", [experimentType, question, subject, numOfRows, numOfCols, callback]);
		},

		userSelectItem: function(test, currentTest, userChoosenElem, nextIndexObj, experiment) {
			var question, result;

			question = test.question;
			result = question.checkAnswer(userChoosenElem);

			if( currentTest !== 0 ) {
				question.updateResult(result);
			} else {
				question.updateResult();
			}

			this.testSelectDone(nextIndexObj, experiment, result);
		},

		testSelectDone: function(nextIndexObj, experiment) {
			var that = this;

			setTimeout(function() {
				if( nextIndexObj === false ) {
					var actualScore = that.calculateActualScore(experiment);
					var totalScore = that.calculateTotalScore(experiment);
					var finalScore = parseInt(actualScore / totalScore * 100);

					var showingMessage = ["<p>您最终的得分为：<span id='score' class='green'>" + finalScore + "</span> 分</p>"];

					EventCenter.trigger("controller-Ending", [showingMessage]);
				} else {
					if( nextIndexObj && nextIndexObj.nextTestIndex !== 0 ) {
						EventCenter.trigger("controller-getNextTest");
					}
				}
			}, 1000);
		},

		subscribeEvents: function() {
			EventCenter.bind("experiment-userSelectItem", this.proxy(this.userSelectItem, this));
			EventCenter.bind("experiment-testSelectDone", this.proxy(this.testSelectDone, this));
			EventCenter.bind("experiment-experimentEnd", this.proxy(this.generateResult, this));
			EventCenter.bind("experiment-showTest", this.proxy(this.showTest, this));
		},

		autoTest: function() {
			var index = parseInt(Math.random() * 2);

			$(".choose-item").get(index).click();
		},

		init: function() {
			this.subscribeEvents();
		}
	};

	Experiment_identification.init();

	window.Experiment_identification = Experiment_identification;
}(window, jQuery, undefined));