define('SignupView', [
    'App',
    'text!templates/signup.html',
    'jquery',
    'backbone',
    'marionette',
    'underscore',
    'backbone.radio',
    'parsleyjs'
], function(App, template, $, Backbone, Marionette, _, Radio) {

    var sessionCh = Radio.channel('session');

    return Marionette.ItemView.extend({

        initialize: function(options) {
            this.options = options || {};
            this.listenTo(sessionCh, 'signup:success', this.onSignupSuccess);
            this.listenTo(sessionCh, 'signup:error', this.onSignupError);
        },

        template: _.template(template),

        templateHelpers: function() {
            return this.options;
        },
        ui : {
            'signup_form': '#signup-form',
            'signup_username': '#signup-username',
            'signup_name': '#signup-name',
            'signup_password': '#signup-password',
            'signup_passwordconfirm': '#signup-password-confirm'
        },
        events: {
            'click #signup-btn': 'onSignupAttempt',
            'keyup #signup-password-confirm': 'onConfirmPasswordKeyup'
        },

        // Allow enter press to trigger signup
        onConfirmPasswordKeyup: function(evt) {
            var k = evt.keyCode || evt.which;

            if (k == 13 && this.ui.signup_password.val() === '') {
                evt.preventDefault(); // prevent enter-press submit when input is empty
            } else if (k == 13) {
                evt.preventDefault();
                this.onSignupAttempt();
                return false;
            }
        },

        onSignupAttempt: function(evt) {
            if (evt) evt.preventDefault();
            if (this.ui.signup_form.parsley().validate()) {
                sessionCh.request('signup', {
                    username: this.ui.signup_username.val(),
                    password: this.ui.signup_password.val(),
                    name: this.ui.signup_name.val()
                });
            } else {
                // Invalid clientside validations thru parsley
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