
define("App", [
    'jquery',
    'backbone',
    'backbone.radio',
    'marionette',
    'underscore'
], function ($, Backbone, Radio, Marionette, _) {

    $.ajaxSetup({ cache: false }); // Force ajax call on all browsers

    var sessionCh = Radio.channel('session');

    var App = new Marionette.Application();
    App.AUTH_API = "/rest-auth/"; // Base API URL (used by models & collections

    // Just use GET and POST to support all browsers
    Backbone.emulateHTTP = true;

    Backbone.oldSync = Backbone.sync;
    Backbone.sync = function(method, model, options) {
        options.beforeSend = function(xhr){
          sessionCh.request('addToken', xhr);
        };
        return Backbone.oldSync(method, model, options);
    };

    Backbone.ResultsCollection = Backbone.Collection.extend({
        parse: function(response) {
            return response.results;
        }
    });
    App.ParsleyConfig  = {
        errorClass: 'has-error',
        successClass: 'has-success',
        classHandler: function(ParsleyField) {
            return ParsleyField.$element.parents('.form-group');
        },
        errorsContainer: function(ParsleyField) {
            return ParsleyField.$element.parents('.form-group');
        },
        errorsWrapper: '<div class="help-block">',
        errorTemplate: '<div></div>'
    };  
    return App;

});