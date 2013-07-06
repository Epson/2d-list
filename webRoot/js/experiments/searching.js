
/**
 * @author zhaojian
 */
(function(window, $, undefined){
	var Experiment_searching = {
		proxy: function(func, context) {
			return(function(){
	            return func.apply(context, arguments);
	        });
		},

		calculateTotalWrongTimesAndTotalSearchingTime: function(experiments) {
			var numOfExperiments = experiments.length;
			var totalSearchingTime = 0;
			var totalWrongTimes = 0;

			for(var i = 0; i < numOfExperiments; i ++) {
				var experiment = experiments[i];
				var numOfTasks = experiment["tasks"].length;

				for(var j = 0; j < numOfTasks; j ++) {
					var task = experiment["tasks"][j];
					var numOfTests = task["tests"].length;

					for(var k = 1; k < numOfTests; k ++) {
						var test = task["tests"][k];
						
						totalWrongTimes = totalWrongTimes + test.question.result.wrongTimes;
						totalSearchingTime = totalSearchingTime + test.question.result.searchingTime;
					}
				}
			}

			return {
				totalWrongTimes: totalWrongTimes,
				totalSearchingTime: totalSearchingTime
			};
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
				experimentResult.tasks = [];

				for(var j = 0; j < experimentResult.numOfTasks; j ++) {
					var questionTypes = tasks[j].questionTypes;
					var tests = tasks[j]["tests"];
					var numOfTests = tests.length;
					var task = {};

					task["tests"] = [];

					for(var k = 0; k < numOfTests; k ++) {
						var questionType = "question_" + tests[k].questionTypeId;
						var test = {};

						test[questionType] = {};
						test[questionType]["wrongTimes"] = tests[k].question.result["wrongTimes"];
						test[questionType]["searchingTime"] = tests[k].question.result["searchingTime"];
						
						task["tests"].push(test);
					}	

					experimentResult["tasks"].push(task);
				}

				results["experiment_" + (i+1)] = experimentResult;
			}

			console.log(results);
			EventCenter.trigger("sendResult", [results]);
		},

		showTest: function(experiments, currentExperiment, currentTask, currentTest) {
			var experiment = experiments[currentExperiment];
			var task = experiment["tasks"][currentTask];
			var test = task["tests"][currentTest];
			var questionTypeId = test.questionTypeId;
			var numOfItems = experiment.numOfItems;
			var numOfRows = experiment.numOfRows;
			var numOfCols = experiment.numOfCols;
			var experimentType = experiment.type;
			var question = test.question;
			var subject = test.subject;
			var items = test.items;
			var time = task.time;
			var that = this;

			EventCenter.trigger("showItems", [experimentType, question, subject, numOfRows, numOfCols]);
		
			this.experiment = experiments;
			this.currentExperiment = currentExperiment;
			this.currentTask = currentTask;
			this.currentTest = currentTest;
		},

		showQuestion: function() {
			var experiment = this.experiment[this.currentExperiment];
			var task = experiment["tasks"][this.currentTask];
			var test = task["tests"][this.currentTest];
			var numOfRows = experiment.numOfRows;
			var numOfCols = experiment.numOfCols;
			var experimentType = experiment.type;
			var question = test.question;
			var subject = test.subject;

			EventCenter.trigger("showQuestion", [experimentType, question, subject, numOfRows, numOfCols]);
			// this.autoTest();
		},

		testSelectDone: function(nextIndexObj, experiment, result) {
			var that = this;

			setTimeout(function() {
				if( nextIndexObj === false ) {
					var resultObj = that.calculateTotalWrongTimesAndTotalSearchingTime(experiment);
					var totalSearchingTime = resultObj.totalSearchingTime;
					var totalWrongTimes = resultObj.totalWrongTimes;

					var showingMessageList = [];
					var mes_1 = ("<p>您总的用时为：<span id='score' class='green'>" + totalSearchingTime + "</span> 秒</p>");
					var mes_2 = ("<p>您总的错误次数为：<span id='score' class='green'>" + totalWrongTimes + "</span> 次</p>");
					
					showingMessageList[0] = mes_1;
					showingMessageList[1] = mes_2;

					EventCenter.trigger("Ending", [showingMessageList]);
				} else {
					if( result === "correct" && nextIndexObj && nextIndexObj.nextTestIndex !== 0 ) {
						EventCenter.trigger("getNextTest");
					}
				}
			}, 1000);
		},

		subscribeEvents: function() {
			EventCenter.bind("testSelectDone", this.proxy(this.testSelectDone, this));
			EventCenter.bind("experimentEnd", this.proxy(this.generateResult, this));
			EventCenter.bind("showTest", this.proxy(this.showTest, this));
			EventCenter.bind("remembered", this.proxy(this.showQuestion, this));
		},

		autoTest: function() {
			var items = $(".choose-item");
			var index = parseInt(Math.random() * items.length);

			$(".choose-item").get(index).click();
		},

		init: function() {
			this.subscribeEvents();
		}
	};

	Experiment_searching.init();

	window.Experiment_searching = Experiment_searching;
}(window, jQuery, undefined));