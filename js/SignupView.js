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

    var SignupModel = Backbone.Model.extend({

        defaults: {
            username: "",
            password1: "",
            password2: "",
            email: "",
            key: "",
        },

        validation: function() {
            var self = this
            return {
                username: {
                    required: true,
                    blank: false,
                    minLength: 4
                },

                password1: {
                    required: true,
                    blank: false,
                    minLength: 5,
                    maxLength: 25
                },

                password2: {
                    required: true,
                    blank: false,
                    fn: function(value) {
                        return self.get('password1') !== value ? 'Must be the same as password' : true
                    }
                },

                email: {
                  required: true,
                  format: 'email',
                  message: 'Not a valid email'
                }
            }

        },

        urlRoot: function(){
            return "/rest-auth/registration/";
        }

    });
    return Marionette.ValidationView.extend({

        initialize: function(options) {
            this.options = options || {};
            this.model = new SignupModel()
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
          '#password1': {
            observe: 'password1',
            updateMethod: 'val',
            validateHandler: 'bootstrap',
            setOptions: {validate:true,suppress:true}
          },
          '#password2': {
            observe: 'password2',
            updateMethod: 'val',
            validateHandler: 'bootstrap',
            setOptions: {validate:true}
          },
          '#email': {
            observe: 'email',
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
            sessionCh.request('setToken', value)
            sessionCh.request('checkAuth', {
                success: function() {
                   Backbone.history.navigate(that.getOption('next'), {trigger:true});
                }
            })
          }
        },

        events: {
            'click #signup': 'onSignupAttempt',
        },

        onSignupAttempt: function(evt) {
            if (evt) evt.preventDefault();
            this.model.save()
        }

    });
});