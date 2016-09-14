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

    var LoginModel = Backbone.Model.extend({

        defaults: {
            username: "",
            password: "",
            key: "",
        },

        validation: {
            username: {
                required: true,
                blank: false,
                minLength: 4
            },

            password: {
                required: true,
                blank: false,
                minLength: 5,
                maxLength: 25
            }
        },

        urlRoot: function(){
            return "/rest-auth/login/";
        }

    });
    return Marionette.ValidationView.extend({

        initialize: function(options) {
            this.options = options || {};
            this.model = new LoginModel()
            this.listenTo(sessionCh, 'login:error', this.onLoginError);
        },

        template: _.template(template),
        className: 'row',

        templateHelpers: function() {
            return this.options;
        },

        bindings: {
          '#username': {
            observe: 'username',
            updateMethod: 'val',
            validateHandler: 'bootstrap',
            setOptions: {validate:true}
          },
          '#password': {
            observe: 'password',
            updateMethod: 'val',
            validateHandler: 'bootstrap',
            setOptions: {validate:true}
          },
          'form .form-errors': { // just for validation options
            observe: 'non_field_errors',
            validateHandler: 'form'
          }
        },

        modelEvents: {
          error: function(model, xhr, options) {
            this.model.triggerValidated(xhr.responseJSON, xhr.responseJSON);
          },
          'change:key': function(model, value){
            var that = this; 
            sessionCh.request('setToken', value)
            sessionCh.request('checkAuth', {
                success: function() {
                   Backbone.history.navigate(that.getOption('next'), {trigger:true});
                }
            })
          }
        },

        events: {
            'click #login': 'onLoginAttempt',
            'keyup #password': 'onPasswordKeyup',
            'click #signup': 'onSignupClick'
        },

        // Allow enter press to trigger login
        onPasswordKeyup: function(evt) {
            var k = evt.keyCode || evt.which;

            if (k == 13 && this.model.get('password')=== '') {
                evt.preventDefault(); // prevent enter-press submit when input is empty
            } else if (k == 13) {
                evt.preventDefault();
                this.onLoginAttempt();
                return false;
            }
        },

        onLoginAttempt: function(evt) {
            if (evt) evt.preventDefault();
            this.model.save()
        },

        onSignupClick: function(evt) {
            if (evt) evt.preventDefault();
            Backbone.history.navigate('signup/' + this.getOption('next'), {trigger:true});
        }

    });
});