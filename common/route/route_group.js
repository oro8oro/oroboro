
Router.map(function(){
    this.route('/group/:_id', {
        where: 'server',
        path: '/group/:_id',
        template: 'show_group',
        action: function(){
            var group = Group.findOne({_id: this.params._id});
            var headers = {'Content-type': 'image/svg+xml', 'Access-Control-Allow-Origin' : '*'};
            this.response.writeHead(200, headers);
            var script = Meteor.call('getGroupScript', this.params._id);
            this.response.end(script);
        }
    });
});


