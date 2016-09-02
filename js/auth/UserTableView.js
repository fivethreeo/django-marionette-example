
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
    tagName: 'tr',
    template: _.template(row_template),
    templateContext: function() {
      return {
        columns: this.getOption('columns')
      }
    },
    serializeModel: function serializeModel() {
      if (!this.model) {
        return {model:{}};
      }
      return {model:_.clone(this.model.attributes)};
    }
  });

  var TableBody = Marionette.CollectionView.extend({
    tagName: 'tbody',
    childView: RowView,
    childViewOptions: function(model, index) {
      return {
        columns: this.getOption('columns')
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
        columns: this.getColumns()
      }));
    },

    columns: {
      username: {label: 'Username'}
    },

    active_columns: ['username'],

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