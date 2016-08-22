define('SignupView', [
    'App',
    'text!templates/signup.html',
    'jquery',
    'backbone',
    'marionette',
    'underscore',
    'backbone.radio'
], function(App, template, $, Backbone, Marionette, _, Radio) {

    var sessionCh = Radio.channel('session');

    return Marionette.ItemView.extend({

        initialize: function(options) {
            this.options = options || {};
            this.listenTo(sessionCh, 'signup:success', this.onSignupSuccess);
            this.listenTo(sessionCh, 'signup:error', this.onSignupError);
        },

        template: _.template(template),
        className: 'row',

        templateHelpers: function() {
            return this.options;
        },
        ui : {
            'signup_form': '#signup-form',
            'signup_username': '#signup-username',
            'signup_password': '#signup-password',
            'signup_passwordconfirm': '#signup-password-confirm',
            'signup_email': '#signup-email'
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
            if (this.ui.signup_form.parsley(App.ParsleyConfig).validate()) {
                sessionCh.request('signup', {
                    user: {
                        username: this.ui.signup_username.val(),
                        raw_password: this.ui.signup_password.val(),
                        email: this.ui.signup_email.val()
                    }
                }, this.options);
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