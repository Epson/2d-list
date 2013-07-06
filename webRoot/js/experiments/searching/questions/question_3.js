
(function(window, $, undefined) {
	function Question_3() {
		if( this instanceof Question_3 ) {
			this.result = {
				searchingTime: 0,
				wrongTimes: 0
			};

			this.showingItems = null;
			this.questionItems = null;
			this.isCorrect = false;
		} else {
			return new Question_3();
		}
	}

	Question_3.prototype = {};
	Question_3.prototype.constructor = Question_3;

	Question_3.prototype.id = 3;
	Question_3.prototype.type = 3;
	Question_3.prototype.optionsNum = undefined;
	Question_3.prototype.content = "请在下面的列表中找到之前出现的项";

	Question_3.prototype.checkAnswer = function(userChoosenElem) {
		var result;
		var userChoosen = userChoosenElem.value;

		if( userChoosen === this.showingItems[0].imageName) {
			result = "correct";

			EventCenter.trigger("viewer-showCorrectResult", [userChoosenElem]);
		} else {
			result = "wrong";

			EventCenter.trigger("viewer-showWrongResult", [userChoosenElem]);
		}

		return result;
	};
	Question_3.prototype.showItems = function(experimentType, subject, numOfRows, numOfCols, show1DList, show2DList) {
		var wrapper = $( "<div></div>");
		var list = [];
		var item = $("<img src='files/" + subject + "/" + this.showingItems[0].imageName + "' alt='" + this.showingItems[0].imageName + "' width=100 height=100 />");
		var title = $("<h3>请记住下面的列表项，记住后点击下方的按钮进入问题</h3>");
		list[list.length] = item;
		var div = show1DList(subject, list, numOfRows, numOfCols);
		var button = $("<button id='remember'>我记住了</button>");

		wrapper.html(title);
		wrapper.append(div);
		wrapper.append(button);

		return wrapper;
	};
	Question_3.prototype.showQuestion = function(experimentType, subject, numOfRows, numOfCols, show1DList, show2DList) {
		var wrapper = $("<div></div>");

		var div = $("<div id='question'> " +
						"<h3>" + this.content + "</h3>" +
					"</div>");

		var list = [];
		var chooseList = $( "<div id='choose-list'></div>");
		for(var i = 0; i < this.questionItems.length; i ++) {
			var item = $("<div class='choose-item'>" + 
							"<input type='radio' name='choose' value='" + this.questionItems[i].imageName + "' />" + 
							"<img src='files/" + subject + "/" + this.questionItems[i].imageName + "' width=100 height=100 />" + 
						"</div>");
			list[list.length] = item;
		}

		show1DList(subject, list, 4, 1, chooseList);

		wrapper.html(div);
		wrapper.append(chooseList);

		this.calculatingSearchingTime();

		return wrapper;
	};
	Question_3.prototype.generateQuestionItems = function(items, numOfItems) {
		var questionItems = [];
		var numOfQuestionItems = 4;

		var index = Math.floor(Math.random() * numOfQuestionItems);
		questionItems[index] = this.showingItems[0];

		for(var i = 0; i < numOfQuestionItems; i ++) {
			if( questionItems[i] === undefined ) {
				var index = Math.floor(Math.random() * items.length);

				questionItems[i] = items.splice(index, 1)[0];
			}
		}
		this.questionItems = questionItems;
	};
	Question_3.prototype.generateShowingItems = function(items, numOfItems) {
		var index = Math.floor(Math.random() * items.length);
		var showingItems = [];
	
		showingItems[showingItems.length] = items.splice(index, 1)[0];
		this.showingItems = showingItems;
	};
	Question_3.prototype.calculatingSearchingTime = function() {
		var that = this;

		setTimeout(function() {
			that.result.searchingTime += 100;

			if( that.isCorrect === false ) {
				setTimeout(arguments.callee, 100);
			} 
		}, 100);
		
	};
	Question_3.prototype.updateResult = function(result) {
		if(	result === undefined ) {
			this.result.wrongTimes = 0;
			this.result.searchingTime = 0;
		}

		if( result === "wrong" ) {
			this.result.wrongTimes ++;
		} else {
			this.isCorrect = true;
		}
	};
	Question_3.prototype.initQuestion = function(subjectItems, numOfItems) {
		var length = subjectItems.length;
		var items = [];

		for(var i = 0; i < length; i ++) {
			items[i] = subjectItems[i];
		}

		this.generateShowingItems(items, numOfItems);
		this.generateQuestionItems(items, numOfItems);
	};

	window.Question_3 = Question_3;
}(window, jQuery, undefined));
