
var Server = require('./server'),
	dbUtils = require('./dbUtils'),
	Controller = require('./controller');
	EventCenter = require('./eventCenter');

var APP = {
	init: function() {
		EventCenter.init();
		dbUtils.init();
		Server.init();
		Controller.init();
	}
};

APP.init();

module.exports.APP = APP;


