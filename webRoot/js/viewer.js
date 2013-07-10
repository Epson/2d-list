
/**
 * @brief 	process the dom elements
 * @author 	zhaojian
 */
(function(window, $, undefined) {
	var linkOfSurvey = [
		"http://www.sojump.com/jq/2588329.aspx",
		"http://www.sojump.com/jq/2588294.aspx",
		"http://www.sojump.com/jq/2588298.aspx",
		"http://www.sojump.com/jq/2588313.aspx",
		"http://www.sojump.com/jq/2588262.aspx",
		"http://www.sojump.com/jq/2588278.aspx"
	];

	var serveyIndex = 0;

	var Viewer = {
		proxy: function(func, context) {
			return(function(){
	      return func.apply(context, arguments);
	    });
		},

		show1DList: function(subject, items, numOfRows, numOfCols, wrapper) {
			var ul = $("<ul id='one-dimension-list'></ul>");
			
			for(var i = 0; i < numOfRows; i ++) {
				var li = $("<li class='one-dimension-item'></li>");
				li.append(items[i]);

				ul.append(li);
			}

			if( wrapper !== undefined ) {
				wrapper.append(ul);
			} else {
				var wrapper = $("<div></div>").append(ul);
			}

			return wrapper;
		},

		show2DList: function(subject, items, numOfRows, numOfCols, wrapper) {
			var ul = $("<ul id='two-dimension-list'></ul>");

			ul[0].style.width = ( 122 * numOfCols ) + "px";
			ul[0].style.height = ( 122 * numOfRows ) + "px";

			for(var i = 0; i < numOfRows; i ++) {
				for(var j = 0; j < numOfCols; j ++) {
					var li = $("<li class='two-dimension-item'></li>");
					li.append(items[j * numOfRows + i]);

					ul.append(li);
				}
			}
			if( wrapper !== undefined ) {
				wrapper.append(ul);
			} else {
				var wrapper = $("<div></div>").append(ul);
			}

			return wrapper;
		},

		showItems: function(experimentType, question, subject, numOfRows, numOfCols, callback) {
			var wrapper = question.showItems(experimentType, subject, numOfRows, numOfCols, this.show1DList, this.show2DList);

			$("#main").html(wrapper);

			if( callback ) {
				callback();
			}
		},

		showQuestion: function(experimentType, question, subject, numOfRows, numOfCols) {
			var wrapper = question.showQuestion(experimentType, subject, numOfRows, numOfCols, this.show1DList, this.show2DList);
			$("#main").html(wrapper);
		},

		showCorrectResult: function(userChoosenElem) {
			$(userChoosenElem).parent().addClass("correct-item");
		},

		showWrongResult: function(userChoosenElem) {
			$(userChoosenElem).parent().addClass("wrong-item");
		},

		chooseAnswer: function(e) {
			e = e || window.event;

      var elem = $(e.target);
      var result;

      if( elem.hasClass("choose-item") ) {
        var target = elem.children().first();
        target = target[0];
        target.checked = true;

        this.stopPropagation(e);
      }

      if( elem.parent().hasClass("choose-item") ) {
        var target = elem.parent().children().first();
        target = target[0];

        this.stopPropagation(e);
      }

      EventCenter.trigger("controller-userSelectItem", [target]);
		},

		mouseEnterChooseItem: function(e) {
			e = e || window.event;

			var elem = $(e.currentTarget);

			if( elem.hasClass("choose-item") ) {	
				elem.addClass("choose-item-hover");

				this.stopPropagation(e);
			}
		},

		mouseLeaveChooseItem: function(e) {
			e = e || window.event;

			var elem = $(e.currentTarget);

			if( elem.hasClass("choose-item") ) {
				elem.removeClass("choose-item-hover");

				this.stopPropagation(e);
			}
		},

		stopPropagation: function(e) {
			if( e.stopPropagation ) {
				e.stopPropagation();
			} else {
				e.cancelBubble = true;
			}
		},	

		showPrompting: function(experimentIndex, taskIndex, time, questions) {
			var promptingDiv = $("<div id='prompting'></div>");
			var difficulty;
			
			if( time === 1500 ) {
				difficulty = "简单";
			} else if( time === 1000 ) {
				difficulty = "一般";
			} else {
				difficulty = "困难";
			}

			var h1 = $("<h1>温馨提醒</h1>");
			promptingDiv.append(h1);

			var description = $("<p>接下来您将进入实验<span id='experimentId'>" + (experimentIndex + 1) + "</span>的第<span id='taskId'>" + (taskIndex + 1) + "</span>轮测试，该轮测试的难度为<span id='difficulty' class='blue'>" + difficulty + "</span></p>");
			promptingDiv.append(description);

			var p1 = $("<p>本轮测试中的题型如下：</p>");
			promptingDiv.append(p1);

			var questionTypes = $("<ol></ol>");
			for(var i = 0; i < questions.length; i ++) {
				var li = $("<li>" + questions[i].content + "</li>");

				questionTypes.append(li);
			}
			promptingDiv.append(questionTypes);

			var p2 = $("<p>其中每道题目出现的时间为<span id='time' class='purple'>" + time + "毫秒</span></p>");
			promptingDiv.append(p2);

			if(experimentIndex % 2 === 0 && experimentIndex !== 0) {
				var p4 = $("<p>在进行下一轮测试之前，请您先花一点点时间完成这份调查问卷（如果问卷页面没有自动弹出，请手动点击下面的链接）：</p>" + 
									"<p><a href='" + linkOfSurvey[serveyIndex] + "' target='_blank'>" + linkOfSurvey[serveyIndex] + "</a></p>");
				promptingDiv.append(p4);
				serveyIndex ++;
			}

			var p3 = $("<p>当您准备好进行测试之后，请点击下面的按钮开始</p>");
			promptingDiv.append(p3);

			var button = $("<button id='next'>继续测试</button>");
			promptingDiv.append(button);

			$("#main").html(promptingDiv);

			if(p4) {
				window.open(linkOfSurvey[serveyIndex]);
			}
		},

		countingTime: function() {
			var button, secSpan, seconds;

			button = $("#start");
			secSpan = $("#countingSec");
			seconds = 20;

			setTimeout(function() {
				seconds -= 1;
				secSpan.html(seconds);

				if( seconds > 0 ) {
				 setTimeout(arguments.callee, 1000);
				} else {
					button.attr('disabled',false);
				}
			}, 1000);
		},
		
		showSubjects: function(subjectName, subjectList) {
			var subjectsDiv, wrapperDiv,
					h1, p1, p2, img, button,
					subjectItem;

			wrapperDiv = $("<div id='subjects'></div>");
			h1 = $("<h1>温馨提醒</h1>");
			p1 = $("<p>以下是本次实验中要用到的所有素材，请在进行实验之前尽可能地熟悉它们</p>");
			subjectsDiv = $("<div id='subject-images'></div>");
			p2 = $("<p>请尽可能地熟悉这些素材，并在<span id='countingSec' class='red'>20</span>秒后点击下面的按钮开始实验</p>");
			button = $("<button id='start' disabled='disabled'>开始测试</button>");
			h2 = $("<p>一维/二维列表示例：</p>");
			p3 = $("<p><img src='images/list.jpg' width=700 height=250 /></p>");

			for(var i = subjectList.length - 1; i >= 0; i --) {
				subjectItem = subjectList[i];
				img = $("<img src=files/" + subjectName + "/" + subjectItem.imageName + " alt=" + subjectItem.name + "  width=60 height=60 />");
				subjectsDiv.append(img);
			}

			wrapperDiv.append(h1);
			wrapperDiv.append(p1);
			wrapperDiv.append(subjectsDiv);
			wrapperDiv.append(p2);
			wrapperDiv.append(button);
			wrapperDiv.append(h2);
			wrapperDiv.append(p3);
			$("#main").html(wrapperDiv);

			this.countingTime();
		},

		showEnding: function(showingContentElems) {
			var div = $("<div id='ending'></div>");

			var h1 = $("<h1>测试结束，感谢您的支持与配合！^-^</h1>");
			div.append(h1);

			for(var i = 0; i < showingContentElems.length; i ++) {
				div.append(showingContentElems[i]);
			}

			var p1 = $("<p>在实验结束之前，请您再最后花一点点时间完成这份调查问卷：</p>" + 
									"<p><a href='" + linkOfSurvey[linkOfSurvey.length-1] + "' target='_blank'>" + linkOfSurvey[linkOfSurvey.length-1] + "</a></p>");
			div.append(p1);
			
			$("#main").html(div);
		},

		subscribeEvents: function() {
			EventCenter.bind("viewer-showItems", this.proxy(this.showItems, this));
			EventCenter.bind("viewer-showQuestion", this.proxy(this.showQuestion, this));
			EventCenter.bind("viewer-chooseAnswer", this.proxy(this.chooseAnswer, this));
			EventCenter.bind("viewer-showWrongResult", this.proxy(this.showWrongResult, this));
			EventCenter.bind("viewer-showCorrectResult", this.proxy(this.showCorrectResult, this));
			EventCenter.bind("viewer-showPrompting", this.proxy(this.showPrompting, this));
			EventCenter.bind("viewer-showSubjects", this.proxy(this.showSubjects, this));
			EventCenter.bind("viewer-showEnding", this.proxy(this.showEnding, this));
			EventCenter.bind("viewer-mouseEnterChooseItem", this.proxy(this.mouseEnterChooseItem, this));
			EventCenter.bind("viewer-mouseLeaveChooseItem", this.proxy(this.mouseLeaveChooseItem, this));
		},

		init: function() {

			this.subscribeEvents();
		}
	};

	window.Viewer = Viewer;
}(window, jQuery, undefined));
