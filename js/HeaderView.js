define('HeaderView', [
    'App',
    'text!templates/header.html',
    'jquery',
    'bootstrap',
    'backbone',
    'backbone.radio',
    'marionette',
    'underscore'
], function (App, template, $, Bootstrap, Backbone, Radio, Marionette, _) {


    var sessionCh = Radio.channel('session');

    return Marionette.ItemView.extend({

        initialize: function(options){
            this.options = options || {};
            this.listenTo(sessionCh, 'login:success', this.render);
            this.listenTo(sessionCh, 'checkAuth:success', this.render);
            this.listenTo(sessionCh, 'logout:success', this.logged_out);
        },
        
        events: {
            'click #logout-link': 'logout',
            'click #remove-account-link': 'removeAccount'
        },

        logout: function(evt) {
            evt.preventDefault();
            sessionCh.request('logout');
        },

        removeAccount: function(evt) {
            evt.preventDefault();
            sessionCh.request('removeAccount');
        },

        logged_out: function() {
            this.render();
            App.router.controller.index();
            App.router.navigate('')
        },

        template: _.template(template),

        templateHelpers: function() {
            var obj = sessionCh.request('object');
            var context = obj.toJSON();
            context.user = obj.user.toJSON();
            return context
        }

    });
});