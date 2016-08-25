
require([
    'App',
    'session/SessionModel',
    'HeaderView',
    'IndexView',
    'LoginView',
    'SignupView',
    'jquery',
    'backbone',
    'backbone.radio',
    'marionette',
    'underscore'
], function (App, SessionModel, HeaderView, IndexView, LoginView, SignupView, $, Backbone, Radio, Marionette, _) {

    var sessionCh = Radio.channel('session');

    var Controller = Marionette.Object.extend({
      initialize: function(options){
        this.listenTo(sessionCh, 'checkAuth:success', this.onAuthSuccess);
        this.listenTo(sessionCh, 'checkAuth:error', this.onAuthError);
      },
      onAuthSuccess: function(session, response, context) {
        if (context.nextView) {
          App.rootView.showChildView('content', new context.nextView(context.nextViewOpts || {}));
        }
      },
      onAuthError: function(session, response, context) {
        if (context.nextView) {
          App.rootView.showChildView('content', new LoginView(context));
        }
      },
      index: function() {
        sessionCh.request('checkAuth', {nextView:IndexView});
      },
      signup: function() {
          App.rootView.showChildView('content', new SignupView());
      }
    });


    var Router = Marionette.AppRouter.extend({
      appRoutes: {
        '': 'index',
        'signup': 'signup'
      },

      controller: new Controller()
    });

    App.on('start', function() {
      App.session = new SessionModel({}); // Singleton session model
      App.rootView = new RootView({el: $('body') });
      App.rootView.render();
      App.router = new Router();
      Backbone.history.start({root:'/'}); // Start history when our application is ready
    });

    var RootView = Marionette.LayoutView.extend({
      template: false,
      regions: {
        header: '#header',
        content: '#content'
      },
      onRender: function() {
          this.showChildView('header', new HeaderView());
         // this.showChildView('content', new IndexView());
      }
    });
    
    $(document).ready(function() {
      App.start();
    })
});