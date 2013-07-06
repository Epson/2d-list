var path = require('path'),
		getFile = require('./getFile'),
		EventCenter = require('./eventCenter'),
		BufferHelper = require('bufferhelper');

var route = function(req, res, pathname) {
	var realPath, bufferHelper;

	pathname = decodeURIComponent(pathname);

	if( req.method === "POST" ) {

		if( pathname === "/getAllTests" ) {
			var subject = "";
			bufferHelper = new BufferHelper();

			req.on("data", function(data) {
				bufferHelper.concat(data);
			});

			req.on("end", function() {
				subject = decodeURIComponent(bufferHelper.toBuffer().toString());
				subject = subject.split("=")[1];
				EventCenter.trigger("getAllTests", [req, res, subject]);
			});
		}

		if( pathname === "/getAllQuestions" ) {
			EventCenter.trigger("getAllQuestions", [req, res]);
		}

		if( pathname === "/getSubjects" ) {
			var subject = "";
			bufferHelper = new BufferHelper();

			req.on("data", function(data) {
				bufferHelper.concat(data);
			});

			req.on("end", function() {
				subject = decodeURIComponent(bufferHelper.toBuffer().toString());
				subject = subject.split("=")[1];
				EventCenter.trigger("getSubjects", [req, res, subject]);
			});
		}

		if( pathname === "/sendResult" ) {
			EventCenter.trigger("sendResult", [req, res]);
		}

	} else {
		if( pathname === "/" ) {
			realPath = "webRoot/index.html";
		} else {
			realPath = "webRoot" + pathname;
		}

		getFile.get(req, res, realPath);
	}
};

exports.route = route;