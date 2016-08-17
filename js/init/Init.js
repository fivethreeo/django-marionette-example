
require([
    'App',
    'session/SessionModel',
    'HeaderView',
    'IndexView',
    'jquery',
    'backbone',
    'backbone.radio',
    'marionette',
    'underscore'
], function (App, SessionModel, HeaderView, IndexView, $, Backbone, Radio, Marionette, _) {

    var sessionCh = Radio.channel('session');

    var Controller = Marionette.Object.extend({
      initialize: function(options){
        this.authView = null
        this.listenTo(sessionCh, 'checkAuth:success', this.onAuthSuccess);
      },
      onAuthSuccess: function() {
        if (this.authView) {
          App.rootView.showChildView('content', new this.authView());
          this.authView = null
        }
      },
      index: function() {
        this.authView = IndexView;
        sessionCh.request('checkAuth');
      }
    });


    var Router = Marionette.AppRouter.extend({
      appRoutes: {
        '': 'index'
      },

      controller: new Controller(),

      onRoute: function(name, path, args) {
        if (name !== 'index') {
            this.controller.authView = null;
        }
      }

    });

    App.on('start', function() {
      App.session = new SessionModel({}); // Singleton session model
      App.rootView = new RootView({el: $('body') });
      App.rootView.render();
      new Router();
      Backbone.history.start(); // Start history when our application is ready
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