
require([
    'App',
    'session/SessionModel',
    'Header',
    'IndexView',
    'LoginView',
    'SignupView',
    'jquery',
    'backbone',
    'backbone.radio',
    'marionette',
    'underscore'
], function (App, SessionModel, HeaderRouter, IndexView, LoginView, SignupView, $, Backbone, Radio, Marionette, _) {

    var sessionCh = Radio.channel('session');
    var contentRegion;

    var Controller = Marionette.Object.extend({
      initialize: function(options){
        this.listenTo(sessionCh, 'logout:success', this.index);
      },
      
      signup: function(next) {
        App.contentRegion.show(new SignupView({next:next}));
      },

      login: function(next) {
        // Show login view for non authenticated users
        App.contentRegion.show(new LoginView({next:next}));
      },
      
      index: function() {
        App.requireLogin(function() {
            App.contentRegion.show(new IndexView());
        })
      }
    });

    var MainRouter = Marionette.AppRouter.extend({
      appRoutes: {
        '': 'index',
        'menus': 'index',
        'login(/*next)': 'login',
        'signup(/*next)': 'signup'
      },

      controller: new Controller()
    });

    App.on('start', function() {
      App.contentRegion  = new Marionette.Region({el:'#content'}) 
      new SessionModel({}); // Singleton session model
      new HeaderRouter();
      new MainRouter();
      // HTML5 pushState for URLs without hashbangs
      var hasPushstate = !!(window.history && history.pushState);
      if(hasPushstate) Backbone.history.start({ pushState: true, root: '/' });
      else Backbone.history.start({root:'/'}); // Start history when our application is ready
    });

    $(document).ready(function() {
      App.start();
    })
});