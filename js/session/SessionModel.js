define("session/SessionModel", [
  "App",
  "auth/UserModel",
  "jquery",
  "backbone",
  "backbone.radio"
], function(App, UserModel, $, Backbone, Radio) {

  var sessionCh = Radio.channel('session');

  var RemoveAccount = Backbone.Model.extend({
    url: function() {
        return '/api/removeuser/'
    }
  });

  var Logout = Backbone.Model.extend({
    url: function() {
        return '/rest-auth/logout/'
    }
  });

  var SessionModel = Backbone.Model.extend({

        logout: function(context){
          var self = this;
          this.logoutSingleton.save(null, {
            success: function(model, response) {
                self.set({ logged_in : false });
                self.unset('token');
                self.updateSessionUser({})
                sessionCh.trigger('logout:success', self, response, context);
            },
            error: function(model, response) {
                sessionCh.trigger('logout:error', self, response, context);
            }
          })
        },

        removeAccount: function(context){
          var self = this;
          this.removeSingleton.destroy({
            success: function(model, response) {
                self.set({ logged_in : false });
                self.unset('token');
                self.updateSessionUser({})
                sessionCh.trigger('removeAccount:success', self, response, context);
                sessionCh.trigger('logout:success', self, response, context);
            },
            error: function(model, response) {
                sessionCh.trigger('removeAccount:error', self, response, context);
            }
          })
        },

        initialize: function(){
            _.bindAll(this,
                'logout',
                'removeAccount',
                'checkAuth',
                'getObject',
                'addToken',
                'setToken',
                'addCsrfHeader'
            );
            sessionCh.reply('logout', this.logout);
            sessionCh.reply('removeAccount', this.removeAccount);
            sessionCh.reply('checkAuth', this.checkAuth);
            sessionCh.reply('object', this.getObject);
            sessionCh.reply('addToken', this.addToken);
            sessionCh.reply('addCsrfHeader', this.addCsrfHeader);
            sessionCh.reply('setToken', this.setToken);


            // Singleton user object
            this.user = new UserModel();
            this.logoutSingleton = new Logout();
            this.removeSingleton = new RemoveAccount();

        },

        // Initialize with negative/empty defaults
        // These will be overriden after the initial checkAuth
        defaults: {
            logged_in: false,
            token: ''
        },

        url: function(){
            return '/rest-auth/user/';
        },

        getObject : function() {
            return this;
        },

        getCookie : function(name) {
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
        },
        
        addCsrfHeader : function(xhr) {
          // Set the CSRF Token in the header for security
          var token = this.getCookie('csrftoken');
          if (token) xhr.setRequestHeader('X-CSRF-Token', token);
        },

        addToken : function(xhr) {
            if (this.get('token')) xhr.setRequestHeader('Authorization', 'Token ' + this.get('token'));
        },

        setToken : function(token) {
            this.set({ token:token, logged_in: true})
        },

        // Fxn to update user attributes after recieving API response
        updateSessionUser: function( userData ){
            this.user.set(_.pick(userData, _.keys(this.user.defaults)));
        },

        /*
         * Will return a user object if authenticated
         */
        checkAuth: function(context) {
            var self = this;
            this.fetch({ 
                success: function(mod, response){
                    if(!response.error){
                        self.updateSessionUser(response);
                        self.set({ logged_in : true });
                        if (context.success) context.success(self, response);
                        sessionCh.trigger('checkAuth:success', self, response, context);
                    } else {
                        self.updateSessionUser({});
                        self.set({ logged_in : false });
                        if (context.error) context.error(self, response);
                        sessionCh.trigger('checkAuth:error', self, response, context);
                    }
                }, error:function(mod, response){
                    self.updateSessionUser({});
                    self.set({ logged_in : false });
                    if (context.error) context.error(self, response);
                    sessionCh.trigger('checkAuth:error', self, response, context);  
                }
            }).always( function(response){
                sessionCh.trigger('checkAuth:complete', self, response, context);  
            });
        }
    });

    return SessionModel;

});
