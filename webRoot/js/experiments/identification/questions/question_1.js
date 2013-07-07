
(function(window, $, undefined) {
	function Question_1() {
		if( this instanceof Question_1 ) {
			this.result = {
				wrong: 0,
				correct: 0,
				searchingTime: 0
			};

			this.isCountingTime = false;
			this.showingItems = null;
			this.questionItems = null;
			this.answer = undefined;
		} else {
			return new Question_1();
		}
	}

	Question_1.prototype = {};
	Question_1.prototype.constructor = Question_1;

	Question_1.prototype.id = 1;
	Question_1.prototype.type = 1,
	Question_1.prototype.optionsNum = 2;
	Question_1.prototype.content = "下面出现的列表是否与原列表相同？";
	
	Question_1.prototype.generateAnswer = function(items, question) {
		for(var i = 0; i < items.length; i ++) {
			if( items[i].id !== question[i].id ) {
				this.answer = false;
				return;
			}
		}

		this.answer = true;
	};
	Question_1.prototype.checkAnswer = function(userChoosenElem) {
		var userChoosen = userChoosenElem.value;
		var result = "wrong";

		if( userChoosen === "yes" && this.answer === true) {
			result = "correct";

			EventCenter.trigger("viewer-showCorrectResult", [userChoosenElem]);
		} 
		if( userChoosen === "no" && this.answer === false) {
			result = "correct";

			EventCenter.trigger("viewer-showCorrectResult", [userChoosenElem]);
		}

		if( result === "wrong" ) {
			var correctElem = userChoosenElem.parentNode.nextSibling || 
				userChoosenElem.parentNode.previousSibling;

			correctElem = correctElem.firstChild;

			EventCenter.trigger("viewer-showCorrectResult", [correctElem]);
			EventCenter.trigger("viewer-showWrongResult", [userChoosenElem]);
		}
	
		return result;
	};
	Question_1.prototype.showQuestion = function(experimentType, subject, numOfRows, numOfCols, show1DList, show2DList) {
		var wrapper = $("<div></div>");

		var div = $("<div id='question'> " +
						"<h3>" + this.content + "</h3>" +
					"</div>");

		var items = [];
		for(var i = 0; i < this.questionItems.length; i ++) {
			var img = $("<img src='files/" + subject + "/" + this.questionItems[i].imageName + "' width=100 height=100 />");
			items[items.length] = img;
		}

		if( experimentType === "1d" ) {
			var list = show1DList(subject, items, numOfRows, numOfCols);
		} else {
			var list = show2DList(subject, items, numOfRows, numOfCols);
		}
		div.append(list);

		var chooseList = $( "<ul id='choose-list'>" +
								"<li class='choose-item' style='width:150px;height:40px;padding-top:30px;'><input type='radio' name='choose' value='yes' />" + "是" + "</li>" +
								"<li class='choose-item' style='width:150px;height:40px;padding-top:30px;'><input type='radio' name='choose' value='no' />" + "否" + "</li>" +
							"</ul>");
		wrapper.append(div);
		wrapper.append(chooseList);

		this.startCountingTime();

		return wrapper;
	};
	Question_1.prototype.showItems = function(experimentType, subject, numOfRows, numOfCols, show1DList, show2DList) {
		var wrapper = $("<div></div>");

		var items = [];
		for(var i = 0; i < this.showingItems.length; i ++) {
			var img = $("<img src='files/" + subject + "/" + this.showingItems[i].imageName + "' width=100 height=100 />");
			items[items.length] = img;
		}
			
		if( experimentType === "1d" ) {
			show1DList(subject, items, numOfRows, numOfCols, wrapper);
		} else {
			show2DList(subject, items, numOfRows, numOfCols, wrapper);
		}

		return wrapper;
	};
	Question_1.prototype.generateQuestionItems = function(items, numOfItems) {
		var flag = parseInt(Math.random() * 2);

		if( flag === 0 ) {
			var tempArray = [];

			for(var i = 0; i < items.length; i ++) {
				tempArray[i] = items[i];
			}

			this.questionItems = [];
			for(var i = 0; i < numOfItems; i ++) {
				this.questionItems[this.questionItems.length] = tempArray.splice(Math.random() * tempArray.length, 1)[0];
			}
		} else {
			// do nothing
		}
	};
	Question_1.prototype.generateShowingItems = function(items, numOfItems) {
		var tempArray = [];

		for(var i = 0; i < items.length; i ++) {
			tempArray[i] = items[i];
		}

		this.showingItems = [];
		for(var i = 0; i < numOfItems; i ++) {
			this.showingItems[this.showingItems.length] = tempArray.splice(Math.random() * tempArray.length, 1)[0];
		}

		if( this.questionItems === null ) {
			this.questionItems = this.showingItems;
		}
	};
	Question_1.prototype.updateResult = function(result) {
		if(	result === undefined ) {
			this.result.searchingTime = 0;
		}

		this.isCountingTime = false;

		if( result === "correct" ) {
			this.result.correct += 1;
		} else {
			this.result.wrong += 1;
		}
	};
	Question_1.prototype.startCountingTime = function() {
		var that = this;
		this.isCountingTime = true;

		setTimeout(function() {
			if(that.isCountingTime === true) {
				that.result.searchingTime += 15;
				setTimeout(arguments.callee, 15);
			}
		}, 15);
	};
	Question_1.prototype.initQuestion = function(subjectItems, numOfItems) {
		var length = subjectItems.length;

		this.generateQuestionItems(subjectItems, numOfItems);
		this.generateShowingItems(subjectItems, numOfItems);
		this.generateAnswer(this.showingItems, this.questionItems);
	};

	window.Question_1 = Question_1;
}(window, jQuery, undefined));
