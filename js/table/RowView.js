
define('auth/UserTableView', [
    'App',
    'jquery',
    'backbone',
    'marionette',
    'underscore',
    'text!table/row.html'
], function (App, $, Backbone, Marionette, _, row_template) {
  
  var RowView = Marionette.ValidationView.extend({
    tagName: 'tr',
    template: _.template(row_template),
    templateContext: function() {
      return {
        columns: this.getOption('columns')
      }
    }
  });
  return RowView;

});