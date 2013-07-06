var path = require('path'),
		express = require('express'),
		getFile = require('./getFile'),
		EventCenter = require('./eventCenter');

var app = express();
app.configure(function() {
	app.use(express.bodyParser());
	app.use(express['static'](__dirname + "/webRoot"));
});

var getAllQuestions = function(req, res) {
	EventCenter.trigger("getAllQuestions", [req, res]);
};

var getAllTests = function(req, res) {
	var subject = req.body.subject;

	EventCenter.trigger("getAllTests", [req, res, subject]);
};

var getSubjects = function(req, res) {
	var subject = req.body.subject;

	EventCenter.trigger("getSubjects", [req, res, subject]);
};

var sendResult = function(req, res) {
	EventCenter.trigger("sendResult", [req, res]);
};

var Router = {
	proxy: function(func, context) {
		return(function(){
      return func.apply(context, arguments);
    });
	},

	sendAllTestsMessage: function(req, res, message) {
		res.end(JSON.stringify(message));
	},

	sendAllQuestions: function(req, res, questions) {
		res.end(JSON.stringify(questions));
	},

	sendSubjects: function(req, res, subjects) {
		res.end(JSON.stringify(subjects));
	},

	sendEndMessage: function(err, req, res) {
		res.end(err);
	},

	getResult: function(req, res) {
		var that = this;
		var bufferHelper = new BufferHelper();

		req.on("data", function(chunk) {
			bufferHelper.concat(chunk);
		});

		req.on("end", function() {
			var data = bufferHelper.toBuffer().toString();

			EventCenter.trigger("saveResult", [JSON.parse(data), req, res, that.sendEndMessage]);

			res.end();
		});
	},

	subscribeEvents: function() {
		EventCenter.bind("sendSubjects", this.proxy(this.sendSubjects, this));
		EventCenter.bind("sendAllQuestions", this.proxy(this.sendAllQuestions, this));
		EventCenter.bind("sendAllTestsMessage", this.proxy(this.sendAllTestsMessage, this));
		EventCenter.bind("sendResult", this.proxy(this.getResult, this));
	},

	route: function() {
		app.post("/getAllQuestions", getAllQuestions);
		app.post("/getAllTests", getAllTests);
		app.post("/getSubjects", getSubjects);
		app.post("/sendResult", sendResult);
	},

	init: function() {
		this.subscribeEvents();
		this.route();

		app.listen(12346, function() {
			console.log("server is listening to port 12346");
		});
	},
}

// var route = function(req, res, pathname) {
// 	var realPath, bufferHelper;

// 	pathname = decodeURIComponent(pathname);

// 	if( req.method === "POST" ) {
// 		if( pathname === "/getAllTests" ) {
			
// 		}

// 		if( pathname === "/getAllQuestions" ) {
			
// 		}

// 		if( pathname === "/getSubjects" ) {
			
// 		}

// 		if( pathname === "/sendResult" ) {
			
// 		}

// 	} else {
// 		if( pathname === "/" ) {
// 			realPath = "webRoot/index.html";
// 		} else {
// 			realPath = "webRoot" + pathname;
// 		}

// 		getFile.get(req, res, realPath);
// 	}
// };

module.exports = Router;