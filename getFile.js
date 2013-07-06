var fs = require('fs');
var path = require("path");
var mime = require('./mime').types;

var get = function(req, res, realPath) {

	path.exists(realPath, function (exists) {
		if( !exists ) {
			res.writeHead(404, {'Content-Type': 'text/plain'});
			res.write("This request URL " + realPath + " was not found on this server.");
            res.end();
		} else {
			fs.readFile(realPath, "binary", function(err, file) {
				if( err ) {
					res.writeHead(500, {'Content-Type': 'text/plain'});
					res.end(err);
				} else {
					var ext = path.extname(realPath);
					ext = ext ? ext.slice(1) : 'unknown';
					var contentType = mime[ext] || "text/plain";
					res.writeHead(200, {'Content-Type': contentType});
					res.write(file, "binary");
					res.end();
				}
			});
		}
	});
};

module.exports.get = get;
	