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
            'form': '#form',
            'username': '#username',
            'password1': '#password1',
            'password2': '#password2',
            'email': '#email'
        },
        events: {
            'click #signup': 'onSignupAttempt',
            'keyup #password2': 'onConfirmPasswordKeyup'
        },

        // Allow enter press to trigger signup
        onConfirmPasswordKeyup: function(evt) {
            var k = evt.keyCode || evt.which;

            if (k == 13 && this.ui.password1.val() === '') {
                evt.preventDefault(); // prevent enter-press submit when input is empty
            } else if (k == 13) {
                evt.preventDefault();
                this.onSignupAttempt();
                return false;
            }
        },

        onSignupAttempt: function(evt) {
            if (evt) evt.preventDefault();
            if (this.ui.form.parsley(App.ParsleyConfig).validate()) {
                sessionCh.request('signup', {
                    user: {
                        username: this.ui.username.val(),
                        password1: this.ui.password1.val(),
                        password2: this.ui.password1.val(),
                        email: this.ui.email.val()
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