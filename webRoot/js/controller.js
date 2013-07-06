
/**
 * @author zhaojian
 */
(function(window, $, undefined) {
	var Controller = {
		experiment: null,
		experimentName: undefined,

		currentTask: 0,
		currentTest: -1,
		currentExperiment: 0,

		isEnd: false,

		subjects: null,

		subjectName: undefined,

		proxy: function(func, context) {
			return(function(){
	            return func.apply(context, arguments);
	        });
		},

		sendResult: function(results) {
			var that = this;
			
			$.post("sendResult", JSON.stringify(results), function(err) {
				if( err ) {
					alert("发生未知错误: [error code]");
					console.log(err);
				} else {
					alert("答题记录已成功保存，感谢您的配合！");
				}
            }); 
		},

		startExperiment: function() {
			var experiment = this.experiment[this.currentExperiment];
			var task = experiment["tasks"][this.currentTask];
			var time = task.time;
			var questionTypes = task.questionTypes;
			var questions = [];

			for(var i = 0; i < questionTypes.length; i ++) {
				questions[questions.length] = new window["Question_" + questionTypes[i]]();
			}

			EventCenter.trigger("showPrompting", [this.currentExperiment, this.currentTask, time, questions]);
		},

		addQuestionsToTests: function() {
			var numOfExperiments = this.experiment.length;

			for(var i = 0; i < numOfExperiments; i ++) {
				var numOfItems = this.experiment[i].numOfItems;
				var taskArray = this.experiment[i]["tasks"];
				var numOfTasks = taskArray.length;

				for(var j = 0; j < numOfTasks; j ++) {
					var testArray = taskArray[j]["tests"];
					var numOfTests = testArray.length;

					for(var k = 0; k < numOfTests; k ++) {
						var test = testArray[k];
						var question = new window["Question_" + test.questionTypeId]();
						var subjectItems = this.subjects;

						question.initQuestion(subjectItems, numOfItems);
						test.question = question;
					}
				}
			}
		},

		loadExperimentFile: function(experimentName) {
			var body = document.body;

			var script = document.createElement("script");
			script.type = "text/javascript";
			script.src = "js/experiments/" + experimentName + "/" + experimentName + ".js";
				
			body.appendChild(script);

			var that = this;
			setTimeout(function() {
				var loaded = true;

				if( window["Experiment_" + experimentName] === undefined ) {
					loaded = false;
				}

				if( loaded === true ) {
					that.startExperiment();
				} else {
					setTimeout(arguments.callee, 200);
				}
			}, 200);
		},

		getAllTests: function() {
			var that = this;

			$.post("getAllTests", {"subject": this.subjectName}, function(res) {
        var message = JSON.parse(res);
        that.experiment = message.experiments;
        that.experimentName = message.experimentName

        that.addQuestionsToTests();
        that.loadExperimentFile(that.experimentName);
      }); 
		},

		// getAllSubjects: function() {
		// 	var that = this;
		// 	$.post("getAllSubjects", {}, function(res) {
  //       that.subjects = JSON.parse(res);

  //       EventCenter.trigger("getAllTests");
  //     }); 
		// },

		loadQuestionFiles: function(experimentName, questionFiles) {
			var body = document.body;

			for(var i = questionFiles.length - 1 ; i >= 0; i --) {
				var script = document.createElement("script");
				script.type = "text/javascript";
				script.src = "js/experiments/" + experimentName + "/questions/" + questionFiles[i];
				
				body.appendChild(script);
			}

			setTimeout(function() {
				var loaded = true;

				for(var i = questionFiles.length - 1 ; i > 0; i --) {
					var questionTypeId = questionFiles[i].split("_")[1].split(".")[0];

					if( window["Question_" + questionTypeId] === undefined ) {
						loaded = false;
						break ;
					}
				}

				if( loaded === true ) {
					// EventCenter.trigger("getAllSubjects");
					// EventCenter.trigger("getAllTests");
				} else {
					console.log("waiting to load question file...");
					setTimeout(arguments.callee, 200);
				}
			}, 200);
		},

		getAllQuestions: function() {
			var that = this;

			$.post("getAllQuestions", {}, function(res) {
            	var questionObj = JSON.parse(res);
            	var experimentName = questionObj.experimentName;
            	var questionFiles = questionObj.questionFiles;

                that.loadQuestionFiles(experimentName, questionFiles);
            }); 
		},

		getNextTextIndex: function(numOfExperiment, numOfTasks, numOfTests) {
			var experimentIndex, taskIndex, testIndex;
			var isNext = true;

			if( this.currentTest < numOfTests - 1 ) {
			 	experimentIndex = this.currentExperiment;
			 	taskIndex = this.currentTask;
				testIndex = this.currentTest + 1;
			} else {
				if( this.currentTask < numOfTasks - 1 ) {
					experimentIndex = this.currentExperiment;
					taskIndex = this.currentTask + 1;
					testIndex = 0;
				} else {
					if( this.currentExperiment < numOfExperiment - 1 ) {
						testIndex = 0;
						taskIndex = 0;
						experimentIndex = this.currentExperiment + 1;
					} else {
						isNext = false;
						return isNext;
					}
				}
			}

			return {
				nextExperimentIndex: experimentIndex,
				nextTaskIndex: taskIndex,
				nextTestIndex: testIndex
			};
		},

		updateTestIndex: function(numOfExperiment, numOfTasks, numOfTests) {
			var indexObj = this.getNextTextIndex(numOfExperiment, numOfTasks, numOfTests);

			if( indexObj === false ) {
				// console.log("end")
				this.isEnd = true;
				return ;
			}

			this.currentExperiment = indexObj.nextExperimentIndex;
			this.currentTask = indexObj.nextTaskIndex;
			this.currentTest = indexObj.nextTestIndex;
		},

		showPrompting: function(experiment, task) {
			var nextIndexObj = this.getNextTextIndex(this.experiment.length, experiment["tasks"].length, task["tests"].length);
			if( nextIndexObj === false ) { return ; }
			var nextTestIndex = nextIndexObj.nextTestIndex;
			var nextTaskIndex = nextIndexObj.nextTaskIndex;
			var nextExperimentIndex = nextIndexObj.nextExperimentIndex;
			var experiment = this.experiment[nextExperimentIndex];
			var task = experiment["tasks"][nextTaskIndex];
			var questionTypes = task.questionTypes;
			var time = task.time;
			var questions = [];

			if( nextTestIndex === 0 && this.isEnd === false ) {
				for(var i = 0; i < questionTypes.length; i ++) {
					questions[questions.length] = new window["Question_" + questionTypes[i]]();
				}
				// console.log(nextTestIndex);
				setTimeout(function() {
					EventCenter.trigger("showPrompting",[nextExperimentIndex, nextTaskIndex, time, questions]);
					$("#next").click();
				}, 1000);
			}
		},

		getNextTest: function() {
			var experiment = this.experiment[this.currentExperiment];
			var task = experiment["tasks"][this.currentTask];

			this.updateTestIndex(this.experiment.length, experiment["tasks"].length, task["tests"].length);
			EventCenter.trigger("showTest", [this.experiment, this.currentExperiment, this.currentTask, this.currentTest]);
		},

		userSelectItem: function(userChoosenElem) {
			var experiment = this.experiment[this.currentExperiment];
			var task = experiment["tasks"][this.currentTask];
			var test = task["tests"][this.currentTest];
			var question = test.question;
			var that = this;
			var result = question.checkAnswer(userChoosenElem);

			// the first test of each task will be ignore
			if( this.currentTest !== 0 ) {
				question.updateResult(result);
			} else {
				question.updateResult();
			}
			this.showPrompting(experiment, task);

			var nextIndexObj = this.getNextTextIndex(this.experiment.length, experiment["tasks"].length, task["tests"].length);
			EventCenter.trigger("testSelectDone", [nextIndexObj, this.experiment, result]);

			if( nextIndexObj === false ) {
				EventCenter.trigger("experimentEnd", [this.experiment, this.experimentName]);
			}
		},

		showEnding: function(showingContentArray) {
			var showingContentElems = [];

			for(var i = 0; i < showingContentArray.length; i ++) {
				showingContentElems[showingContentElems.length] = $(showingContentArray[i]);
			}

			EventCenter.trigger("showEnding", [showingContentElems]);
		},

		chooseSubject: function(subject) {
			var that = this;

			$.post("getSubjects", {"subject": subject}, function(res) {
        that.subjects = JSON.parse(res);

        that.subjectName = subject;
        EventCenter.trigger("showSubjects", [subject, that.subjects]);
        EventCenter.trigger("getAllQuestions");
      }); 
		},

		subscribeEvents: function() {
			EventCenter.bind("chooseSubject", this.proxy(this.chooseSubject, this));
			// EventCenter.bind("getAllSubjects", this.proxy(this.getAllSubjects, this));
			EventCenter.bind("getAllQuestions", this.proxy(this.getAllQuestions, this));
			EventCenter.bind("getAllTests", this.proxy(this.getAllTests, this));
			EventCenter.bind("userSelectItem", this.proxy(this.userSelectItem, this));
			EventCenter.bind("getNextTest", this.proxy(this.getNextTest, this));
			EventCenter.bind("Ending", this.proxy(this.showEnding, this));
			EventCenter.bind("sendResult", this.proxy(this.sendResult, this));
		},

		init: function(subject) {
			this.subscribeEvents();

			EventCenter.trigger("chooseSubject", [subject]);
		}
	};

	window.Controller = Controller;
}(window, jQuery, undefined));