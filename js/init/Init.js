
require([
    'App',
    'session/SessionModel',
    'HeaderView',
    'IndexView',
    'LoginView',
    'SignupView',
    'auth/UserCollection',
    'auth/UserTableView',
    'jquery',
    'backbone',
    'backbone.radio',
    'marionette',
    'underscore'
], function (App, SessionModel, HeaderView, IndexView, LoginView, SignupView, UserCollection, UserTableView, $, Backbone, Radio, Marionette, _) {

    var sessionCh = Radio.channel('session');
    var rootCh = Radio.channel('root');

    var Controller = Marionette.Object.extend({
      initialize: function(options){
        this.listenTo(sessionCh, 'checkAuth:success', this.onAuthSuccess);
        this.listenTo(sessionCh, 'checkAuth:error', this.onAuthError);
        this.listenTo(sessionCh, 'logout:success', this.index);
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
      users: function() {
          App.rootView.showChildView('content', new UserTableView({collection: new UserCollection()}));
      }
    });


    var Router = Marionette.AppRouter.extend({
      appRoutes: {
        '': 'index',
        'users/': 'users'
      },

      controller: new Controller()
    });

    App.on('start', function() {
      new SessionModel({}); // Singleton session model
      App.rootView = (new RootView({el: $('body') })).render();
      new Router();
      Backbone.history.start({root:'/'}); // Start history when our application is ready
    });

    var RootView = Marionette.View.extend({
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