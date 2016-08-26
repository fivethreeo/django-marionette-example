define("session/SessionModel", [
  "App",
  "auth/UserModel",
  "jquery",
  "backbone",
  "backbone.radio"
], function(App, UserModel, $, Backbone, Radio) {

  var sessionCh = Radio.channel('session');

  var SessionModel = Backbone.Model.extend({

        initialize: function(){
            // Singleton user object
            this.user = new UserModel({});
            _.bindAll(this,
                'login',
                'logout',
                'signup',
                'removeAccount',
                'checkAuth',
                'getObject',
                'addToken',
                'addCsrfHeader'
            );
            sessionCh.reply('login', this.login);
            sessionCh.reply('logout', this.logout);
            sessionCh.reply('signup', this.signup);
            sessionCh.reply('removeAccount', this.removeAccount);
            sessionCh.reply('checkAuth', this.checkAuth);
            sessionCh.reply('object', this.getObject);
            sessionCh.reply('addToken', this.addToken);
            sessionCh.reply('addCsrfHeader', this.addCsrfHeader);

            this.method_map = {
                signup: ['POST', 'registration'],
                login: ['POST', 'login'],
                logout: ['POST', 'logout'],
                checkAuth:  ['GET', 'user'],
                removeAccount: ['DELETE', '/api/removeuser']
            }
        },

        // Initialize with negative/empty defaults
        // These will be overriden after the initial checkAuth
        defaults: {
            logged_in: false,
            token: ''
        },

        url: function(){
            return App.AUTH_API + "user/";
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

        // Fxn to update user attributes after recieving API response
        updateSessionUser: function( userData ){
            this.user.set(_.pick(userData, _.keys(this.user.defaults)));
        },

        /*
         * Check for session from API 
         * The API will parse client cookies using its secret token
         * and return a user object if authenticated
         */
        checkAuth: function(context) {
            var self = this;
            this.fetch({ 
                success: function(mod, response){
                    if(!response.error){
                        self.updateSessionUser(response);
                        self.set({ logged_in : true });
                        sessionCh.trigger('checkAuth:success', self, response, context);
                    } else {
                        self.updateSessionUser({});
                        self.set({ logged_in : false });
                        sessionCh.trigger('checkAuth:error', self, response, context);
                    }
                }, error:function(mod, response){
                    self.updateSessionUser({});
                    self.set({ logged_in : false });
                    sessionCh.trigger('checkAuth:error', self, response, context);  
                }
            }).always( function(response){
                sessionCh.trigger('checkAuth:complete', self, response, context);  
            });
        },


        /*
         * Abstracted fxn to make a POST request to the auth endpoint
         * This takes care of the CSRF header for security, as well as
         * updating the user and session after receiving an API response
         */
        postAuth: function(opts){
            var self = this;
            var mapped_suffix = this.method_map[opts.method][1];
            var apiurl = ((mapped_suffix[0] == '/') ? '' : App.AUTH_API) +
              mapped_suffix + '/';
            $.ajax({
                url: apiurl,
                contentType: 'application/json',
                dataType: 'json',
                type: this.method_map[opts.method][0],
                beforeSend: function(xhr) {
                  sessionCh.request('addToken', xhr);
                },
                data:  JSON.stringify( _.omit(opts, 'method', 'context') ),
                success: function(response){

                        var status = (!response || !response.error) ? 'success' : 'error';
                        var event = opts.method + ':' + status;

                        if(_.indexOf(['login', 'signup'], opts.method) !== -1){
                            if (status == 'success') self.set({ token: response.key, logged_in: true });
                        }
                        if(_.indexOf(['logout', 'removeAccount'], opts.method) !== -1){
                            self.updateSessionUser( {} );
                            self.set({ token: '', logged_in: false });
                        }
                        if (opts.method=='login'){
                            sessionCh.trigger(event, self, response, opts.context);
                            if (status == 'success') sessionCh.request('checkAuth', opts.context);
                        }
                        if (opts.method=='signup'){
                            sessionCh.trigger(event, self, response);
                            if (status == 'success') sessionCh.request('checkAuth', opts.context);
                        }
                        if (opts.method=='logout'){
                            sessionCh.trigger(event, self, response, opts.context);
                        }
                        if (opts.method=='removeAccount'){
                            sessionCh.trigger(event, self, response);
                            if (status == 'success') sessionCh.trigger('logout:success', self, response, opts.context);
                        }
                },
                error: function(xhr, response){
                    var event = opts.method + ':' + 'error';
                    sessionCh.trigger(event, self, xhr.responseJSON, opts.context);
                }
            }).always( function(response){
                sessionCh.trigger('postAuth:complete', self, response, opts.context);
            });
        },


        login: function(opts, context){
            this.postAuth(_.extend(opts||{}, { method: 'login', context:context }));
        },

        logout: function(opts, context){
            this.postAuth(_.extend(opts||{}, { method: 'logout', context:context } ));
        },

        signup: function(opts, context){
            this.postAuth(_.extend(opts||{}, { method: 'signup', context:context  }));
        },

        removeAccount: function(opts, context){
            this.postAuth(_.extend(opts||{}, { method: 'removeAccount', context:context }));
        }

    });

    return SessionModel;

});
