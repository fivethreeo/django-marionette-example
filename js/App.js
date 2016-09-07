
define("App", [
    'jquery',
    'backbone',
    'backbone.radio',
    'marionette',
    'underscore',
    'backbone.stickit', // add early
    'backbone.validator' // add early
], function ($, Backbone, Radio, Marionette, _) {

    $.ajaxSetup({ cache: false }); // Force ajax call on all browsers

    var sessionCh = Radio.channel('session');

    var App = new Marionette.Application();
    App.AUTH_API = "/rest-auth/"; // Base API URL (used by models & collections

    Backbone.Object = function(options) {}
    _.extend(Backbone.Object.prototype, {})
    // just to get extend functionality
    Backbone.Object.extend = Backbone.Model.extend;

    var MyObject = Backbone.Object.extend({})

    // Just use GET and POST to support all browsers
    Backbone.emulateHTTP = true;

    Backbone.oldSync = Backbone.sync;
    Backbone.sync = function(method, model, options) {
        options.beforeSend = function(xhr){
          sessionCh.request('addToken', xhr);
        };
        return Backbone.oldSync(method, model, options);
    };

    Backbone.ResultsCollection = Backbone.Collection.extend({
        parse: function(response) {
            this.permissions = response.permissions
            return response.results;
        }
    });

    Marionette.ValidationView = Marionette.View.extend({

      bindings: {},

      validationHandlers: {
        tooltip: {
            valid: function (attrName, attrValue, model, selector){
            this.$(selector).tooltip('destroy');
          },
          invalid: function(attrName, attrValue, errors, model, selector){
            this.$(selector).tooltip({trigger:'manual'})
            .attr('data-original-title', errors.join(', '))
            .tooltip('show')
          }
        },
        bootstrap: {
          valid: function (attrName, attrValue, model, selector){
            var formgroup = this.$(selector).parents('.form-group')
            formgroup.removeClass('has-error').addClass('has-success')
            formgroup.find('.help-block').remove()
          },
          invalid: function(attrName, attrValue, errors, model, selector){  
            var formgroup = this.$(selector).parents('.form-group')
            formgroup.removeClass('has-success').addClass('has-error')
            formgroup.find('.help-block').remove()
            errorblock = formgroup.append('<div class="help-block">').find('.help-block')
            _.each(errors, function(error){
              errorblock.append('<div>').find('div').last().text(error)
            })
          }
        },
        form: {
          valid: function (attrName, attrValue, model, selector){
            var form = this.$(selector).empty()
          },
          invalid: function(attrName, attrValue, errors, model, selector){
            var formerrors = this.$(selector)
            formerrors.empty()
            _.each(errors, function(error){
              formerrors.append('<p>').find('p').last().text(error)
            })
            formerrors.show()
          }
        },

      },

      handleValidation: function(attrName, attrValue, errors, model) {
        var self = this;
        _.each(_.result(this, 'bindings'), function(binding, selector){
          if (_.isObject(binding)) {
            if (binding.observe == attrName) {
              var handler = self.validationHandlers[binding.validateHandler]
              if (errors) { handler.invalid.call(self, attrName, attrValue, errors, model, selector); }
              else { handler.valid.call(self, attrName, attrValue, model, selector); }
              }
            }
        })
      },

      onValidField: function(attrName, attrValue, model) {
        this.handleValidation(attrName, attrValue, null, model)    
      },

      onInvalidField: function(attrName, attrValue, errors, model) {
        this.handleValidation(attrName, attrValue, errors, model) 
      },

      saveInBackground: _.debounce(function(params) {
        return this.model.save(params);
      }, 800),

      modelEvents: {
        error: function(model, xhr, options) {
          model.triggerValidated(xhr.responseJSON, xhr.responseJSON);
        },
        'change': function(model) {
          if (model.isValid(null, {silent:true})) { this.saveInBackground() }
        }
      },

      onRender: function() {
        this.stickit();
        this.bindValidation();
      }

    })


    App.ParsleyConfig  = {
        errorClass: 'has-error',
        successClass: 'has-success',
        classHandler: function(ParsleyField) {
            return ParsleyField.$element.parents('.form-group');
        },
        errorsContainer: function(ParsleyField) {
            return ParsleyField.$element.parents('.form-group');
        },
        errorsWrapper: '<div class="help-block">',
        errorTemplate: '<div></div>'
    };  
    return App;

});