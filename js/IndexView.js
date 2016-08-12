define('IndexView', [
    'App',
    'text!templates/app_login.html',
    'jquery',
    'backbone',
    'marionette',
    'underscore',
    'parsleyjs'
], function(App, template, $, Backbone, Marionette, _) {
        //ItemView provides some default rendering logic
        return Marionette.ItemView.extend({

            template: _.template(template),

            templateHelpers: function() {
                return this.options;
            },
            
            initialize: function(options) {
                console.log(options);
                this.options = options || {};
                _.bindAll(this, 'onPasswordKeyup', 'onConfirmPasswordKeyup', 'onLoginAttempt', 'onSignupAttempt', 'render');

                // Listen for session logged_in state changes and re-render
                App.session.on("change:logged_in", this.render);
            },

            events: {
                'click #login-btn': 'onLoginAttempt',
                'click #signup-btn': 'onSignupAttempt',
                'keyup #login-password-input': 'onPasswordKeyup',
                'keyup #signup-password-confirm-input': 'onConfirmPasswordKeyup'
            },

            // Allow enter press to trigger login
            onPasswordKeyup: function(evt) {
                var k = evt.keyCode || evt.which;

                if (k == 13 && $('#login-password-input').val() === '') {
                    evt.preventDefault(); // prevent enter-press submit when input is empty
                } else if (k == 13) {
                    evt.preventDefault();
                    this.onLoginAttempt();
                    return false;
                }
            },

            // Allow enter press to trigger signup
            onConfirmPasswordKeyup: function(evt) {
                var k = evt.keyCode || evt.which;

                if (k == 13 && $('#confirm-password-input').val() === '') {
                    evt.preventDefault(); // prevent enter-press submit when input is empty
                } else if (k == 13) {
                    evt.preventDefault();
                    this.onSignupAttempt();
                    return false;
                }
            },

            onLoginAttempt: function(evt) {
                if (evt) evt.preventDefault();

                if (this.$("#login-form").parsley().validate()) {
                    App.session.login({
                        username: this.$("#login-username-input").val(),
                        password: this.$("#login-password-input").val()
                    }, {
                        success: function(mod, res) {
                            console.log("SUCCESS", mod, res);

                        },
                        error: function(err) {
                            console.log("ERROR", err);
                            //app.showAlert('Bummer dude!', err.reason, 'alert-danger');
                        }
                    });
                } else {
                    // Invalid clientside validations thru parsley
                    //if(DEBUG) console.log("Did not pass clientside validation");

                }
            },


            onSignupAttempt: function(evt) {
                if (evt) evt.preventDefault();
                if (this.$("#signup-form").parsley().validate()) {
                    App.session.signup({
                        username: this.$("#signup-username-input").val(),
                        password: this.$("#signup-password-input").val(),
                        name: this.$("#signup-name-input").val()
                    }, {
                        success: function(mod, res) {
                            // if(DEBUG) console.log("SUCCESS", mod, res);

                        },
                        error: function(err) {
                            //      if(DEBUG) console.log("ERROR", err);
                            //  app.showAlert('Uh oh!', err.error, 'alert-danger'); 
                        }
                    });
                } else {
                    // Invalid clientside validations thru parsley
                    //if(DEBUG) console.log("Did not pass clientside validation");

                }
            }

        });
    });