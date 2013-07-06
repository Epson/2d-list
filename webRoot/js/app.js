

(function(window, $, undefined){

$(document).ready(function() {

    var APP = {

        proxy: function(func, context) {
            return(function(){
                return func.apply(context, arguments);
            });
        },

        bindEvents: function() {
            $(document).on("click", ".choose-item", function(e) {
                EventCenter.trigger("viewer-chooseAnswer", [e]);
            });

            $(document).on("mouseenter", ".choose-item", function(e) {
                EventCenter.trigger("viewer-mouseEnterChooseItem", [e]);
            });

            $(document).on("mouseleave", ".choose-item", function(e) {
                EventCenter.trigger("viewer-mouseLeaveChooseItem", [e]);
            });

            $(document).on("click", "#number", function(e) {
                EventCenter.trigger("app-initEnvironment", ["数字"])
            });

            $(document).on("click", "#letter", function(e) {
                EventCenter.trigger("app-initEnvironment", ["字母"])
            });

            $(document).on("click", "#shape", function(e) {
                EventCenter.trigger("app-initEnvironment", ["shape"])
            });

            $(document).on("click", "#start", function(e) {
                EventCenter.trigger("controller-getAllTests");
            });

            $(document).on("click", "#next", function(e) {
                EventCenter.trigger("controller-getNextTest");
            });

            $(document).on("click", "#remember", function(e) {
                EventCenter.trigger("experiment-remembered");
            });
        },

        subscribeEvents: function() {
            EventCenter.bind("app-initEnvironment", this.proxy(this.initEnvironment, this));
        },

        initEnvironment: function(subject) {
            EventCenter.init();

            Viewer.init();

            Controller.init(subject);
        },

        init: function() {
            this.subscribeEvents();

            this.bindEvents();
        }
    };

    APP.init();

    window.APP = APP;
});

}(window, jQuery, undefined));
