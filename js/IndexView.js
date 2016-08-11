define("IndexView", ['text!templates/app_login.html', 'jquery', 'backbone', 'marionette', 'underscore'],
    function (template, $, Backbone, Marionette, _) {
        //ItemView provides some default rendering logic
        return Marionette.ItemView.extend({
            template: _.template(template),
            templateHelpers: function() {
			    return this.options;
			},
			initialize: function(options){
			  console.log(options);
			  this.options = options || {};
           }
        });
    });