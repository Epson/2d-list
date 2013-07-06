
var url = require('url'),
		http = require('http'),
    router = require('./router'),
    BufferHelper = require('bufferhelper'),
    EventCenter = require('./eventCenter');

var Server = {
	server: null, 

	req: null,

	res: null,

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

	init: function() {
		this.server = http.createServer(function(req, res) {
		    var pathname = url.parse(req.url).pathname;
		    router.route(req, res, pathname);
		});

		this.server.listen(12346, function() {
		    console.log("Server is listening at port 12346.");
		});

		this.subscribeEvents();
	}
};

module.exports = Server;