define('IndexView', [
    'App',
    'text!templates/app_login.html',
    'jquery',
    'backbone',
    'marionette',
    'underscore',
    'parsleyjs'
], function(App, template, $, Backbone, Marionette, _) {

    var sessionCh = Radio.channel('session');

    return Marionette.ItemView.extend({

        initialize: function(options) {
            this.options = options || {};
            this.listenTo(sessionCh, 'login:success', this.onLoginSuccess);
            this.listenTo(sessionCh, 'login:error', this.onLoginError);
            this.listenTo(sessionCh, 'signup:success', this.onSignupSuccess);
            this.listenTo(sessionCh, 'signup:error', this.onSignupError);
        },

        template: _.template(template),

        templateHelpers: function() {
            return this.options;
        },
        ui : {
            'loginform': '#login-form',
            'signupform': '#signup-form',
            'username': '#login-username-input',
            'password': '#login-password-input',
            'signupusername': '#signup-username-input',
            'signupname': '#signup-name-input',
            'signuppassword': '#signup-password-input',
            'signuppasswordconfirm': '#signup-password-confirm-input'
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

            if (k == 13 && this.ui.password.val() === '') {
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

            if (k == 13 && this.ui.passwordsignup.val() === '') {
                evt.preventDefault(); // prevent enter-press submit when input is empty
            } else if (k == 13) {
                evt.preventDefault();
                this.onSignupAttempt();
                return false;
            }
        },

        onLoginAttempt: function(evt) {
            if (evt) evt.preventDefault();

            if (this.ui.loginform.parsley().validate()) {
                sessionCh.request('login'. {
                    username: this.ui.username.val(),
                    password: this.ui.password.val()
                });
            } else {
                // Invalid clientside validations thru parsley
                //if(DEBUG) console.log("Did not pass clientside validation");

            }
        },

        onLoginSuccess: function(evt) {
           console.log("SUCCESS", mod, res);
        },

        onLoginError: function(evt) {
           console.log("Error", mod, res);
        },

        onSignupAttempt: function(evt) {
            if (evt) evt.preventDefault();
            if (this.ui.signupform.parsley().validate()) {
                sessionCh.request('signup', {
                    username: this.ui.signupusername.val(),
                    password: this.ui.signuppassword.val(),
                    name: this.ui.signupname.val()
                });
            } else {
                // Invalid clientside validations thru parsley
                //if(DEBUG) console.log("Did not pass clientside validation");

            }
        },


        onSignupSuccess: function(evt) {
            // if(DEBUG) console.log("SUCCESS", mod, res);

        },

        onSignupError: function(evt) {
            // if(DEBUG) console.log("SUCCESS", mod, res);

        }



    });
});