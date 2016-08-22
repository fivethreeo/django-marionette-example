define('LoginView', [
    'App',
    'SignupView',
    'text!templates/login.html',
    'jquery',
    'backbone',
    'marionette',
    'underscore',
    'backbone.radio'
], function(App, SignupView, template, $, Backbone, Marionette, _, Radio) {

    var sessionCh = Radio.channel('session');

    return Marionette.ItemView.extend({

        initialize: function(options) {
            this.options = options || {};
            this.listenTo(sessionCh, 'login:error', this.onLoginError);
        },

        template: _.template(template),
        className: 'row',

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
            'keyup #login-password': 'onPasswordKeyup',
            'click #signup': 'onSignupClick'
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

            if (this.ui.login_form.parsley(App.ParsleyConfig).validate()) {
                sessionCh.request('login', {
                    username: this.ui.login_username.val(),
                    password: this.ui.login_password.val()
                }, this.options);
            } else {
                // Invalid clientside validations thru parsley
            }
        },

        onSignupClick: function(evt) {
            if (evt) evt.preventDefault();
            App.rootView.showChildView('content', new SignupView());

        },

        onLoginError: function(evt) {
           console.log("Error", mod, res);
        }

    });
});