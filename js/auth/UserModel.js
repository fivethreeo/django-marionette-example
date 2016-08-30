
define("auth/UserModel", [
  "App",
  "backbone"
], function(App, Backbone) {

  var UserModel = Backbone.Model.extend({

    initialize: function(){
    },

    defaults: {
        id: 0,
        username: "",
        name: "",
        email: ""
    },

    urlRoot: function(){
        return "/api/users/";
    }

  });
  
  return UserModel;

});
