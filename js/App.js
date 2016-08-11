
define("App", [
    'jquery',
    'backbone',
    'marionette',
    'underscore'
], function ($, Backbone, Marionette, _) {

    // Just use GET and POST to support all browsers
    Backbone.emulateHTTP = true;

    getCookie = function(name) {
      var cookieValue = null;
      if (document.cookie && document.cookie != '') {
          var cookies = document.cookie.split(';');
          for (var i = 0; i < cookies.length; i++) {
              var cookie = jQuery.trim(cookies[i]);
              // Does this cookie string begin with the name we want?
              if (cookie.substring(0, name.length + 1) == (name + '=')) {
                  cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                  break;
              }
          }
      }
      return cookieValue;
    };
    
    addCsrfHeader = function(xhr) {
      // Set the CSRF Token in the header for security
      var token = getCookie('csrftoken');
      if (token) xhr.setRequestHeader('X-CSRF-Token', token);
    };

    var oldSync = Backbone.sync;
    Backbone.sync = function(method, model, options) {
        options.beforeSend = function(xhr){
          addCsrfHeader(xhr);
        };
        return oldSync(method, model, options);
    };

    $.ajaxSetup({ cache: false }); // Force ajax call on all browsers

    var App = new Marionette.Application();
    App.API = "/api/v1/"; // Base API URL (used by models & collections

    return App;

});