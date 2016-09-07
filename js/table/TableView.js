
define('auth/UserTableView', [
    'App',
    'jquery',
    'backbone',
    'marionette',
    'underscore',
    'text!table/table.html'
], function (App, $, Backbone, Marionette, _, table_template) {

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

    columns: {},
    active_columns: [],

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