
require([
    'App',
    'jquery',
    'backbone',
    'marionette',
    'underscore',
    'text!/table/table.html',
    'text!/table/row.html'
], function (App, $, Backbone, Marionette, _, table_template, row_template) {

  var RowView = Marionette.View.extend({
    tagName: 'tr',
    template: _.template(row_template)
  });

  var TableBody = Marionette.CollectionView.extend({
    tagName: 'tbody',
    childView: RowView
  });

  var TableView = Marionette.View.extend({
    tagName: 'table',
    className: 'table table-hover',
    template: _.template(table_template),

    regions: {
      body: {
        el: 'tbody',
        replaceElement: true
      }
    },

    onRender: function() {
      this.showChildView('body', new TableBody({
        collection: this.collection
      }));
    }
  });
  
});