define('IndexView', [
    'App',
    'text!templates/index.html',
    'jquery',
    'backbone',
    'marionette',
    'underscore',
    'backbone.radio',
    'parsleyjs'
], function(App, template, $, Backbone, Marionette, _, Radio) {

    var sessionCh = Radio.channel('session');

    return Marionette.ItemView.extend({

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