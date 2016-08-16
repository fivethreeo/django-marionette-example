define('HeaderView', [
    'text!templates/app_header.html',
    'jquery',
    'backbone',
    'marionette',
    'underscore'
], function (template, $, Backbone, Marionette, _) {

    return Marionette.ItemView.extend({

        initialize: function(options){
            this.options = options || {};
        },
        
        template: _.template(template),

        templateHelpers: function() {
            return this.options;
        }

    });
});