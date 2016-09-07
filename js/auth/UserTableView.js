
define('auth/UserTableView', [
    'App',
    'jquery',
    'backbone',
    'marionette',
    'underscore',
    'text!auth/table.html',
    'text!auth/row.html'
], function (App, $, Backbone, Marionette, _, table_template, row_template) {

  
  var RowView = Marionette.ValidationView.extend({
 
    bindings: {
      '[data-field=username]': {
        observe: 'username',
        updateMethod: 'text',
        validateHandler: 'tooltip',
        setOptions: {validate:true}
      },
      '[data-field=non_field_errors]': { // just for validation options
        observe: 'non_field_errors',
        validateHandler: 'tooltip'
      }
    },

    events: {
      'keypress [data-field=username]': function(e) {
        if ((e.keyCode || e.which) === 13) {
          e.preventDefault()
        }
      }
    },

    tagName: 'tr',
    template: _.template(row_template),
    templateContext: function() {
      return {
        columns: this.getOption('columns')
      }
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