
require([
    'App',
    'session/SessionModel',
    'session/protect',
    'Header',
    'IndexView',
    'LoginView',
    'SignupView',
    'jquery',
    'backbone',
    'backbone.radio',
    'marionette',
    'underscore'
], function (App, SessionModel, protect, HeaderRouter, IndexView, LoginView, SignupView, $, Backbone, Radio, Marionette, _) {

    var sessionCh = Radio.channel('session');

    var Controller = Marionette.Object.extend({
      initialize: function(options){
        this.listenTo(sessionCh, 'checkAuth:error', this.onAuthError);
        this.listenTo(sessionCh, 'logout:success', this.index);
      },
      
      onAuthError: function(session, response, context) {
        // Show login view for non authenticated users
        context.el='#content'
        new LoginView(context).render();
      },
      
      index: protect(function() { // Require auth with protect
        new IndexView({el:'#content'}).render();
      })
    });

    var Router = Marionette.AppRouter.extend({
      appRoutes: {
        '': 'index',
      },

      controller: new Controller()
    });

    App.on('start', function() {
      new SessionModel({}); // Singleton session model

      new HeaderRouter();
            new Router();
      Backbone.history.start({root:'/'}); // Start history when our application is ready
    });

    $(document).ready(function() {
      App.start();
    })
});