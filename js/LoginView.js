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

    return Marionette.View.extend({

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
            'form': '#form',
            'username': '#username',
            'password': '#password',
            'errors': '#errors'
        },

        events: {
            'click #login': 'onLoginAttempt',
            'keyup #password': 'onPasswordKeyup',
            'click #signup': 'onSignupClick'
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

        onLoginAttempt: function(evt) {
            if (evt) evt.preventDefault();
            this.ui.errors.html('');
            this.ui.form.parsley().reset();
            if (this.ui.form.parsley(App.ParsleyConfig).validate()) {
                sessionCh.request('login', {
                    username: this.ui.username.val(),
                    password: this.ui.password.val()
                }, this.options);
            } else {
                // Invalid clientside validations thru parsley
            }
        },

        onSignupClick: function(evt) {
            if (evt) evt.preventDefault();
            App.rootView.showChildView('content', new SignupView(this.options));
        },

        onLoginError: function(session, response, context) {
          var self = this;
          _.each(response, function(value, key) {
            _.each(value, function(val) {
              if (key == 'non_field_errors') self.ui.errors.append('<p class="bg-danger">'+val+'</p>')
              else $('#'+key).parsley().addError(val, {message:val, updateClass:true});
            });
          });

        }

    });
});