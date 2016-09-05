
define('auth/UserTableView', [
    'App',
    'jquery',
    'backbone',
    'marionette',
    'underscore',
    'text!auth/table.html',
    'text!auth/row.html'
], function (App, $, Backbone, Marionette, _, table_template, row_template) {


  var RowView = Marionette.View.extend({
 
    bindings: {
      '[data-field=username]': {
        observe: 'username',
        setOptions: {validate: true, suppress: true},
        validateHandler: 'tooltip'
      },
      '[data-field=non_field_errors]': {
        observe: 'non_field_errors',
        validateHandler: 'tooltip'
      }
    },

    events: {
      'keypress [data-field=username]': function (event) {
        if ((event.keyCode || event.which) === 13 && this.model.isValid()) {
          event.preventDefault()
          this.model.save()
        }
      }
    },

    modelEvents: {
      error: function(model, xhr, options) {
        var self = this; 
        model.triggerValidated(null, xhr.responseJSON);
      }
    },


    validationHandlers: {
      tooltip: {
        valid: function (attrName, attrValue, model, selector){
          this.$(selector).tooltip('destroy');
        },
        invalid: function(attrName, attrValue, errors, model, selector){
          this.$(selector).tooltip({title:errors[0]}).tooltip('show')
        }
      }
    },

    onValidField: function(attrName, attrValue, model) {
      var self = this;
      _.each(_.result(this, 'bindings'), function(binding, selector){
        if (_.isObject(binding)) {
          if (binding.observe == attrName) {
            self.validationHandlers[binding.validateHandler]
              .valid.call(self, attrName, attrValue, model, selector)
          }
        }
      });    },

    onInvalidField: function(attrName, attrValue, errors, model) {
      var self = this;
      _.each(_.result(this, 'bindings'), function(binding, selector){
        if (_.isObject(binding)) {
          if (binding.observe == attrName) {
            self.validationHandlers[binding.validateHandler]
              .invalid.call(self, attrName, attrValue, errors, model, selector)
          }
        }
      });
    },
    tagName: 'tr',
    template: _.template(row_template),
    templateContext: function() {
      return {
        columns: this.getOption('columns')
      }
    },

    onRender: function() {
      this.stickit();
      this.bindValidation();
    }
  });

  var TableBody = Marionette.CollectionView.extend({
    tagName: 'tbody',
    childView: function() { return this.getOption('rowView'); },
    childViewOptions: function(model, index) {
      return {
        columns: this.getOption('columns'),
      }
    }
  });

  var TableView = Marionette.View.extend({
    
    template: _.template(table_template),

    regions: {
      body: {
        el: 'tbody',
        replaceElement: true
      }
    },

    templateContext: function() {
      return {
        columns: this.getColumns()
      }
    },

    onRender: function() {
      this.collection.fetch();
      this.showChildView('body', new TableBody({
        collection: this.collection,    
        columns: this.getColumns(),
        rowView: RowView
      }));
    },

    columns: {
      username: {label: 'Username', wrap: 'span', attributes: {contenteditable:'true'} },
      non_field_errors: {label: 'Error'}
    },

    active_columns: ['username', 'non_field_errors'],

    getColumns: function() {
      var that = this;
      var columns = [];
      _.each(this.active_columns, function(column) {
        var col = that.columns[column];
        col['attribute'] = column;
        columns.push(col);
      });
      return columns;
    }

  });
  
  return TableView;

});