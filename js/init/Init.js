
require([
  "App"
    'session/SessionModel',
    'HeaderView',
    'IndexView',
    'jquery',
    'backbone',
    'marionette',
    'underscore'
], function (App, SessionModel, HeaderView, IndexView, $, Backbone, Marionette, _) {

    // Start history when our application is ready
    App.on('start', function() {
      App.rootView.render();
      App.session = new SessionModel({});
      Backbone.history.start();
    });

    var RootView = Marionette.LayoutView.extend({
      el: 'body',
      template: false,
      regions: {
        header: "#header",
        content: "#content"
      },
      onBeforeShow: function() {
          this.showChildView('header', new HeaderView());
          this.showChildView('content', new IndexView());
      }
    });

    App.rootView = new RootView();
    App.start();
});