define('HeaderView', [
    'text!templates/header.html',
    'jquery',
    'backbone',
    'backbone.radio',
    'marionette',
    'underscore'
], function (template, $, Backbone, Radio, Marionette, _) {


    var sessionCh = Radio.channel('session');

    return Marionette.ItemView.extend({

        initialize: function(options){
            this.options = options || {};
            this.listenTo(sessionCh, 'login:success', this.render);
            this.listenTo(sessionCh, 'checkAuth:success', this.render);
        },
        
        template: _.template(template),

        templateHelpers: function() {
            var obj = sessionCh.request('object');
            var context = obj.toJSON();
            context.user = obj.user.toJSON();
            return context
        }

    });
});