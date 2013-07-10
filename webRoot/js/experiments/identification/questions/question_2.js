
(function(window, $, undefined) {
	function Question_2() {
		if( this instanceof Question_2 ) {
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
			return new Question_2();
		}
	}

	Question_2.prototype = {};
	Question_2.prototype.constructor = Question_2;

	Question_2.prototype.id = 2;
	Question_2.prototype.type = 2,
	Question_2.prototype.optionsNum = 2;
	Question_2.prototype.content = "以下item是否出现？";

	Question_2.prototype.generateAnswer = function(items, question) {
		// 将显示列表项与问题列表项逐个进行比较，一旦发现有相同则说明答案为true，否则为false
		for(var i = 0; i < items.length; i ++) {
			if( items[i].id === question[0].id ) {
				this.answer = true;
				return ;
			}
		}

		this.answer = false;
	};
	Question_2.prototype.checkAnswer = function(userChoosenElem) {
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
	Question_2.prototype.showItems = function(experimentType, subject, numOfRows, numOfCols, show1DList, show2DList) {
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
	Question_2.prototype.showQuestion = function(experimentType, subject, numOfRows, numOfCols, show1DList, show2DList) {
		var wrapper = $("<div></div>");

		var div = $("<div id='question'> " +
						"<h3>" + this.content + "</h3>" +
					"</div>");

		var items = [];
		for(var i = 0; i < this.questionItems.length; i ++) {
			var img = $("<img src='files/" + subject + "/" + this.questionItems[i].imageName + "' width=100 height=100 />");
			items[items.length] = img;
		}

		show1DList(subject, items, 1, 1, div);
		wrapper.html(div);

		var chooseList = $( "<ul id='choose-list'>" +
								"<li class='choose-item' style='width:150px;height:40px;padding-top:30px;'><input type='radio' name='choose' value='yes' />" + "是" + "</li>" +
								"<li class='choose-item' style='width:150px;height:40px;padding-top:30px;'><input type='radio' name='choose' value='no' />" + "否" + "</li>" +
							"</ul>");
		wrapper.append(chooseList);

		return wrapper;
	};
	Question_2.prototype.generateQuestionItems = function(items, numOfItems) {
		var resultItems = [];
		var index = Math.floor(Math.random() * items.length);

		// 从双倍数目的列表项数组中随机抽取一个列表项作为问题中的列表项，以保证
		// 该项出现在测试列表项中的概率为50%
		resultItems[resultItems.length] = items.slice(index, index + 1)[0];

		this.questionItems = resultItems;
	};
	Question_2.prototype.generateShowingItems = function(items, numOfItems) {
		// 通过从双倍数目的列表项数组中随机删去一半的列表项来得到该测试中最终要展示的列表项
		for(var i = 1; i <= numOfItems; i ++) {
			var deleteIndex = Math.floor(Math.random() * items.length);

			items.splice(deleteIndex, 1);
		}

		this.showingItems = items;
	};
	Question_2.prototype.updateResult = function(result) {
		this.isCountingTime = false;

		if(	result === undefined ) {
			this.result.searchingTime = 0;
			this.result.correct = 0;
			this.result.wrong = 0;
		}

		if( result === "correct" ) {
			this.result.correct += 1;
		} else {
			this.result.wrong += 1;
		}
	};
	Question_2.prototype.startCountingTime = function() {
		var that = this;
		this.isCountingTime = true;

		setTimeout(function() {
			if(that.isCountingTime === true) {
				that.result.searchingTime += 15;
				setTimeout(arguments.callee, 15);
			}
		}, 15);
	};
	Question_2.prototype.initQuestion = function(subjectItems, numOfItems) {
		var length = subjectItems.length;
		var itemsIndex = [];
		var items = [];

		// 获取所有列表项在数组中的索引值
		for(var i = 0; i < length; i ++) {
			itemsIndex[i] = i;
		}

		// 从所有列表项中抽取出两倍于所需数目的项，因为要让问题中的列表项出现的概率为一半
		// 将抽取出的列表项放入items列表项数组中等待下一步处理
		for(var i = 0; i < numOfItems * 2; i ++) {
			var index = itemsIndex.splice(Math.floor(Math.random() * itemsIndex.length), 1)[0];
			items[items.length] = subjectItems[index];
		}

		this.generateQuestionItems(items, numOfItems);
		this.generateShowingItems(items, numOfItems);
		this.generateAnswer(this.showingItems, this.questionItems);
	};

	window.Question_2 = Question_2;
}(window, jQuery, undefined));
