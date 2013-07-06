
/**
 * @author 	zhaojian
 * @brief 	the center of event processing
 */
(function(window, undefined){
	var EventCenter = {

		eventList: null,

		trigger: function(eventType, paramArray) {
			if( !this.eventList ) {
				throw new Error("The eventList was undefined");
			}
			if( !this.eventList[eventType] ) {
				throw new Error("The event type " + eventType + " was not found");
			}

			var events = this.eventList[eventType];
			for(var i = 0; i < events.length; i ++) {
				events[i].apply(this, paramArray);
			}
		},	

		bind: function(eventType, handler) {
			if( !this.eventList ) {
				this.init();
			}
			
			if( !this.eventList[eventType] ) {
				this.eventList[eventType] = [];
			}

			this.eventList[eventType].push(handler);
		},

		unbind: function(eventType, handler) {
			if( !this.eventList ) {
				throw new Error("The eventList was undefined");
			}
			if( !this.eventList[eventType] ) {
				throw new Error("The event type " + eventType + " was not found");
			}

			if( handler === undefined ) {
				this.eventList[eventType] = [];
			} else {
				var events = this.eventList[eventType];
				var length = events.length;

				for(var i = 0; i < length; i ++) {
					if( events[i] === handler ) {
						events.splice(i, 1);
						break ;
					}
				}
			}
		},

		showEvents: function() {
			if( !this.eventList ) {
				this.init();
			}

			var events = this.eventList;
			for(var eventType in events) {
				console.log("event: " + eventType);
				for(var i = 0; i < events[eventType].length; i ++) {
					console.log("handler-" + i + ": " + events[eventType][i]);
				}
			}
		},

		init: function() {
			this.eventList = [];
		}
	};	

	window.EventCenter = EventCenter;
}(window, undefined));