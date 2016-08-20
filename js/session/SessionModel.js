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
            _.bindAll(this, 'login', 'logout', 'signup', 'removeAccount', 'checkAuth', 'getObject');
            sessionCh.reply('login', this.login);
            sessionCh.reply('logout', this.logout);
            sessionCh.reply('signup', this.signup);
            sessionCh.reply('removeAccount', this.removeAccount);
            sessionCh.reply('checkAuth', this.checkAuth);
            sessionCh.reply('object', this.getObject);
        },

        // Initialize with negative/empty defaults
        // These will be overriden after the initial checkAuth
        defaults: {
            logged_in: false,
            user_id: ''
        },

        url: function(){
            return App.API + "user/";
        },

        getObject : function() {
            return this;
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
                    if(!response.error && response.objects){
                        self.updateSessionUser(response.objects[0]);
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
            $.ajax({
                url: this.url()+ opts.method + '/' ,
                contentType: 'application/json',
                dataType: 'json',
                type: opts.method == 'logout' ? 'GET': 'POST',
                beforeSend: function(xhr) {
                  App.addCsrfHeader(xhr);
                },
                data:  JSON.stringify( _.omit(opts, 'method', 'context') ),
                success: function(response){

                        var status = !response.error ? 'success' : 'error';
                        var event = opts.method + ':' + status;

                        if(_.indexOf(['login', 'signup'], opts.method) !== -1){
                            self.updateSessionUser( response.user || {} );
                            self.set({ user_id: response.user.id, logged_in: true });
                        }
                        if(_.indexOf(['logout', 'removeAccount'], opts.method) !== -1){
                            self.updateSessionUser( {} );
                            self.set({ user_id: '', logged_in: false });
                        }
                        if (opts.method=='login'){
                            sessionCh.trigger(event, self, response, opts.context);
                        }
                        else if (opts.method=='signup'){
                            sessionCh.trigger(event, self, response);
                            if (status == 'success') sessionCh.trigger('login:success', self, response, opts.context);
                        }
                        else if (opts.method=='logout'){
                            sessionCh.trigger(event, self, response, opts.context);
                        }
                        else if (opts.method=='removeAccount'){
                            sessionCh.trigger(event, self, response);
                            if (status == 'success') sessionCh.trigger('logout:success', self, response, opts.context);
                        }
                },
                error: function(mod, response){
                    var event = opts.method + ':' + 'error';
                    sessionCh.trigger(event, self, response, opts.context);
                }
            }).always( function(response){
                sessionCh.trigger('postAuth:complete', self, response, opts.context);
            });
        },


        login: function(opts, context){
            this.postAuth(_.extend(opts, { method: 'login', context:context }));
        },

        logout: function(opts, context){
            this.postAuth(_.extend(opts, { method: 'logout', context:context } ));
        },

        signup: function(opts, context){
            this.postAuth(_.extend(opts, { method: 'signup', context:context  }));
        },

        removeAccount: function(opts, context){
            this.postAuth(_.extend(opts, { method: 'remove_account', context:context }));
        }

    });

    return SessionModel;

});
