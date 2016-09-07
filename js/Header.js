define('Header', [
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

    var HeaderView = Marionette.View.extend({

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
        },

        template: _.template(template),

        templateContext: function() {
            var obj = sessionCh.request('object');
            var context = obj.toJSON();
            context.user = obj.user.toJSON();
            return context
        }

    });

    var HeaderRouter = Marionette.AppRouter.extend({
      initialize: function () {
        this.view = new HeaderView({el:'#header'});
        this.route('*path', 'default', this.defaultRoute);
      },
      defaultRoute: function(){
        this.view.render()
      }
    });

    return HeaderRouter;

});