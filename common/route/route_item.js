
Router.map(function(){
    this.route('/item/:_id', {
        where: 'server',
        path: '/item/:_id',
        template: 'show_group',/*
        subscriptions: function(){
            this.subscribe('item', this.params._id).wait();
        },*/
        action: function(){
            var item = Item.findOne({_id: this.params._id});
            var headers = {'Content-type': 'image/svg+xml', 'Access-Control-Allow-Origin' : '*'};
            this.response.writeHead(200, headers);
            var script = Meteor.call('getItemScript', this.params._id);
            var path = getElementPath(this.params._id);
            var file = File.findOne({_id: path[path.length-1]});
            var layer = Group.findOne({_id: path[path.length-2]});
            script = '<svg width="' + file.width + '" height="' + file.height + '" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" onload="init()" id="' + file._id + '">' + '<g id="' + layer._id + '" type="' + layer.type + '">' + script + '</g></svg>';
            this.response.end(script);
        }
    });
});

Router.map(function(){
    this.route('/item/:_id/:scale', {
        where: 'server',
        path: '/item/:_id/:scale',
        template: 'show_group',/*
        subscriptions: function(){
            this.subscribe('item', this.params._id).wait();
        },*/
        action: function(){
            var item = Item.findOne({_id: this.params._id});
            var headers = {'Content-type': 'image/svg+xml', 'Access-Control-Allow-Origin' : '*'};
            this.response.writeHead(200, headers);
            var script = Meteor.call('getItemScript', this.params._id);
            var path = getElementPath(this.params._id);
            var file = File.findOne({_id: path[path.length-1]});
            var layer = Group.findOne({_id: path[path.length-2]});
            script = '<svg width="' + file.width*this.params.scale + '" height="' + file.height*this.params.scale + '" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" id="' + file._id + '">' + '<g id="viewport" transform="matrix(' + this.params.scale + ' 0 0 ' + this.params.scale + ' 0 0)">' + '<g id="' + layer._id + '" type="' + layer.type + '">' + script + '</g></g></svg>';
            this.response.end(script);
        }
    });
});

