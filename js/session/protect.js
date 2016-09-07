define("session/protect", [
  "App",
  "backbone",
  "backbone.radio"
], function(App, Backbone, Radio) {

    // A decorator for controller methods to require login

    var sessionCh = Radio.channel('session');

    var protect = function(func) {
      var that = this;
      return function() {
        var args = arguments;
        sessionCh.request('checkAuth', {success:function() { func.apply(that, args); }})
      }
    }
    sessionCh.on('checkAuth:success', function(session, response, context) { context.success() })

    return protect;

});
