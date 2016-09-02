
define('auth/UserCollection', [
    'App',
    'jquery',
    'backbone',
    'marionette',
    'underscore',
    'auth/UserModel'
], function (App, $, Backbone, Marionette, _, model) {

  var UserCollection = Backbone.ResultsCollection.extend({
    model: model,
    url: '/api/users/'
  })

  return UserCollection;
  
});