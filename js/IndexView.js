define('IndexView', [
    'App',
    'text!templates/index.html',
    'jquery',
    'backbone',
    'marionette',
    'underscore',
    'backbone.radio'
], function(App, template, $, Backbone, Marionette, _, Radio) {

    var sessionCh = Radio.channel('session');

    return Marionette.View.extend({

        initialize: function(options) {
            this.options = options || {};
        },

        template: _.template(template),

        templateHelpers: function() {
            return this.options;
        },
        ui : {
        },
        events: {
        },

    });
});