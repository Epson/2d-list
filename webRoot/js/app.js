

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
                EventCenter.trigger("chooseAnswer", [e]);
            });

            $(document).on("mouseenter", ".choose-item", function(e) {
                EventCenter.trigger("mouseEnterChooseItem", [e]);
            });

            $(document).on("mouseleave", ".choose-item", function(e) {
                EventCenter.trigger("mouseLeaveChooseItem", [e]);
            });

            $(document).on("click", "#number", function(e) {
                EventCenter.trigger("initEnvironment", ["数字"])
            });

            $(document).on("click", "#letter", function(e) {
                EventCenter.trigger("initEnvironment", ["字母"])
            });

            $(document).on("click", "#shape", function(e) {
                EventCenter.trigger("initEnvironment", ["shape"])
            });

            $(document).on("click", "#start", function(e) {
                EventCenter.trigger("getAllTests");
            });

            $(document).on("click", "#next", function(e) {
                EventCenter.trigger("getNextTest");
            });

            $(document).on("click", "#remember", function(e) {
                EventCenter.trigger("remembered");
            });
        },

        subscribeEvents: function() {
            EventCenter.bind("initEnvironment", this.proxy(this.initEnvironment, this));
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
