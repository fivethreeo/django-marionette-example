
define("auth/UserModel", [
  "App",
  "backbone"
], function(App, Backbone) {

  var UserModel = Backbone.Model.extend({
    
    validation: {
      username: [{
        required: true,
        message: 'Username is required'
      }, {
        minLength: 8,
        message: 'Username is too short'
      }]
    },

    initialize: function(){
    },

    defaults: {
        id: null,
        username: "",
        name: "",
        email: ""
    },

    urlRoot: function(){
        return "/api/users/";
    },

    url: function() {
      return UserModel.__super__.url.call(this).replace(/[^\/]$/, '$&/') 
    }
    
  });
  
  return UserModel;

});
