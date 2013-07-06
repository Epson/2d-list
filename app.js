
var Router = require('./router'),
	dbUtils = require('./dbUtils'),
	Controller = require('./controller');
	EventCenter = require('./eventCenter');

var APP = {
	init: function() {
		EventCenter.init();
		dbUtils.init();
		Router.init();
		Controller.init();
	}
};

APP.init();

module.exports.APP = APP;


