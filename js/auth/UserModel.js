
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

    url: function(){
        return App.API + "/user";
    }

  });
  
  return UserModel;

});
