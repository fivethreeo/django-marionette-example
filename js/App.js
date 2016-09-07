
define("App", [
    'jquery',
    'backbone',
    'backbone.radio',
    'marionette',
    'underscore',
    'backbone.stickit', // add early
    'backbone.validator' // add early
], function ($, Backbone, Radio, Marionette, _) {

    // This module does all overriding / initialization before Init starts the app

    $.ajaxSetup({ cache: false }); // Force ajax call on all browsers

    var sessionCh = Radio.channel('session');

    var App = new Marionette.Application();

    // Just use GET and POST to support all browsers
    Backbone.emulateHTTP = true;

    Backbone.oldSync = Backbone.sync;
    Backbone.sync = function(method, model, options) {
        options.beforeSend = function(xhr){
          sessionCh.request('addToken', xhr);
        };
        return Backbone.oldSync(method, model, options);
    };
    
    /*
    Backbone.Object = function(options) {}
    _.extend(Backbone.Object.prototype, {})
    // just to get extend functionality
    Backbone.Object.extend = Backbone.Model.extend;

    var MyObject = Backbone.Object.extend({})
    */

    Backbone.History.prototype.loadUrl = function(fragment) {
    
    // Attempt to load the current URL fragment. If a route succeeds with a
    // match, returns `true`. If no defined routes matches the fragment,
    // returns `false`.
    // RB 9/15/2011: overriding this function
    
      if (!this.matchRoot()) return false;
      fragment = this.fragment = this.getFragment(fragment);
      return _.some(this.handlers, function(handler) {
        if (handler.route.test(fragment)) {
          handler.callback(fragment);
        }
      });
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

    return App;

});