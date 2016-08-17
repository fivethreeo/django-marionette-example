
require([
    'App',
    'session/SessionModel',
    'HeaderView',
    'IndexView',
    'jquery',
    'backbone',
    'marionette',
    'underscore'
], function (App, SessionModel, HeaderView, IndexView, $, Backbone, Marionette, _) {

    App.on('start', function() {
      App.session = new SessionModel({}); // Singleton session model
      App.rootView = new RootView({el: $('body') });
      App.rootView.render();
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
          this.showChildView('content', new IndexView());
      }
    });
    
    $(document).ready(function() {
      App.start();
    })
    
});