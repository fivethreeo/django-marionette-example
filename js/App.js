
define("App", [
    'jquery',
    'backbone',
    'backbone.radio',
    'marionette',
    'underscore',
    'parsleyjs'
], function ($, Backbone, Radio, Marionette, _, parsley) {


    var sessionCh = Radio.channel('session');

    var App = new Marionette.Application();
    App.AUTH_API = "/rest-auth/"; // Base API URL (used by models & collections

    // Just use GET and POST to support all browsers
    Backbone.emulateHTTP = true;

    var oldSync = Backbone.sync;
    Backbone.sync = function(method, model, options) {
        options.beforeSend = function(xhr){
          sessionCh.request('addToken', xhr);
        };
        return oldSync(method, model, options);
    };

    $.ajaxSetup({ cache: false }); // Force ajax call on all browsers

    App.ParsleyConfig  = {
        errorClass: 'has-error',
        successClass: 'has-success',
        classHandler: function(ParsleyField) {
            return ParsleyField.$element.parents('.form-group');
        },
        errorsContainer: function(ParsleyField) {
            return ParsleyField.$element.parents('.form-group');
        },
        errorsWrapper: '<span class="help-block">',
        errorTemplate: '<div></div>'
    };  
    return App;

});