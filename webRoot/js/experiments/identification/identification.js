
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
			var numOfExperiments = experiments.length;
			var results = {};

			results.numOfExperiments = numOfExperiments;
			results.experimentName = experimentName;
			for(var i = 0; i < numOfExperiments; i ++) {
				var experiment = experiments[i];
				var tasks = experiment["tasks"];
				var experimentResult = {};

				experimentResult.numOfItems = experiment.numOfItems;
				experimentResult.experimentType = experiment.type;
				experimentResult.numOfTasks = tasks.length;
				experimentResult.scores = {};

				for(var j = 0; j < experimentResult.numOfTasks; j ++) {
					var questionTypes = tasks[j].questionTypes;
					var tests = tasks[j]["tests"];
					var numOfTests = tests.length;
					var taskScore = {};

					for(var k = 1; k <= questionTypes.length; k ++) {
						var questionType = "question_" + k;

						taskScore[questionType] = {};
						taskScore[questionType]["wrong"] = 0;
						taskScore[questionType]["correct"] = 0;
					}

					for(var k = 0; k < numOfTests; k ++) {
						var test = tests[k];
						var questionType = "question_" + test.questionTypeId;

						taskScore[questionType]["wrong"] += test.question.result["wrong"];
						taskScore[questionType]["correct"] += test.question.result["correct"];
					}	

					taskScore["time"] = tasks[j].time;
					experimentResult.scores["task_" + (j+1)] = taskScore;
				}

				results["experiment_" + (i+1)] = experimentResult;
			}

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
			EventCenter.bind("testSelectDone", this.proxy(this.testSelectDone, this));
			EventCenter.bind("experimentEnd", this.proxy(this.generateResult, this));
			EventCenter.bind("showTest", this.proxy(this.showTest, this));
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