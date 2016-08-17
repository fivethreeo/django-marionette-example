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
            sessionCh.reply('login', this.login);
            sessionCh.reply('logout', this.logout);
            sessionCh.reply('signup', this.signup);
            sessionCh.reply('removeAccount', this.removeAccount);
            sessionCh.reply('checkAuth', this.checkAuth);
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

        // Fxn to update user attributes after recieving API response
        updateSessionUser: function( userData ){
            this.user.set(_.pick(userData, _.keys(this.user.defaults)));
        },


        /*
         * Check for session from API 
         * The API will parse client cookies using its secret token
         * and return a user object if authenticated
         */
        checkAuth: function(args) {
            var self = this;
            this.fetch({ 
                success: function(mod, response){
                    if(!response.error && response.user){
                        self.updateSessionUser(response.user);
                        self.set({ logged_in : true });
                        sessionCh.trigger('checkAuth:success', self, response);
                    } else {
                        self.updateSessionUser({});
                        self.set({ logged_in : false });
                        sessionCh.trigger('checkAuth:error', self, response);
                    }
                }, error:function(mod, response){
                    self.updateSessionUser({});
                    self.set({ logged_in : false });
                    sessionCh.trigger('checkAuth:error', self, response);  
                }
            }).always( function(response){
                sessionCh.trigger('checkAuth:complete', self, response);  
            });
        },


        /*
         * Abstracted fxn to make a POST request to the auth endpoint
         * This takes care of the CSRF header for security, as well as
         * updating the user and session after receiving an API response
         */
        postAuth: function(opts, callback, args){
            var self = this;
            console.log(postData);
            $.ajax({
                url: this.url()+ opts.method + '/' ,
                contentType: 'application/json',
                dataType: 'json',
                type: opts.method == 'logout' ? 'GET': 'POST',
                beforeSend: function(xhr) {
                  App.addCsrfHeader(xhr);
                },
                data:  JSON.stringify( _.omit(opts, 'method') ),
                success: function(response){

                        var status = !response.error ? 'success' : 'error';
                        var event = opts.method + ':' + status;

                        if(_.indexOf(['login', 'signup'], opts.method) !== -1){
                            self.updateSessionUser( res.user || {} );
                            self.set({ user_id: res.user.id, logged_in: true });
                        }
                        if(_.indexOf(['logout', 'removeAccount'], opts.method) !== -1){
                            self.updateSessionUser( {} );
                            self.set({ user_id: '', logged_in: false });
                        }
                        if (opts.method=='login'){
                            sessionCh.trigger(event, self, response);
                        }
                        else if (opts.method=='signup'){
                            sessionCh.trigger(event, self, response);
                            if (status == 'success') sessionCh.trigger('login:success', self, response);
                        }
                        else if (opts.method=='logout'){
                            sessionCh.trigger(event, self, response);
                        }
                        else if (opts.method=='removeAccount'){
                            sessionCh.trigger(event, self, response);
                            if (status == 'success') sessionCh.trigger('logout:success', self, response);
                        }
                },
                error: function(mod, response){
                    var event = opts.method + ':' + 'error';
                    sessionCh.trigger(event, self, response);
                }
            }).always( function(response){
                sessionCh('postAuth:complete', self, response);
            });
        },


        login: function(opts){
            this.postAuth(_.extend({ method: 'login' }));
        },

        logout: function(opts){
            this.postAuth(_.extend(opts, { method: 'logout' }));
        },

        signup: function(opts){
            this.postAuth(_.extend(opts, { method: 'signup' }));
        },

        removeAccount: function(opts){
            this.postAuth(_.extend(opts, { method: 'remove_account' }));
        }

    });

    return SessionModel;

});
