define('LoginView', [
    'App',
    'text!templates/login.html',
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
            this.listenTo(sessionCh, 'login:success', this.onLoginSuccess);
            this.listenTo(sessionCh, 'login:error', this.onLoginError);
        },

        template: _.template(template),

        templateHelpers: function() {
            return this.options;
        },

        ui : {
            'login_form': '#login-form',
            'login_username': '#login-username',
            'login_password': '#login-password'
        },

        events: {
            'click #login-btn': 'onLoginAttempt',
            'keyup #login-password': 'onPasswordKeyup'
        },

        // Allow enter press to trigger login
        onPasswordKeyup: function(evt) {
            var k = evt.keyCode || evt.which;

            if (k == 13 && this.ui.login_password.val() === '') {
                evt.preventDefault(); // prevent enter-press submit when input is empty
            } else if (k == 13) {
                evt.preventDefault();
                this.onLoginAttempt();
                return false;
            }
        },

        onLoginAttempt: function(evt) {
            if (evt) evt.preventDefault();

            if (this.ui.login_form.parsley().validate()) {
                sessionCh.request('login', {
                    username: this.ui.login_username.val(),
                    password: this.ui.login_password.val()
                });
            } else {
                // Invalid clientside validations thru parsley
            }
        },

        onLoginSuccess: function(evt) {
           console.log("SUCCESS", mod, res);
        },

        onLoginError: function(evt) {
           console.log("Error", mod, res);
        }

    });
});