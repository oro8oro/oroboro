
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

// Server API for getting an item record
Router.route('/api/item/:_id', { where: 'server' })
  .get(function () {
    var item = Item.findOne({_id: this.params._id});
    var headers = {'Access-Control-Allow-Origin' : '*'};
    if(!item) {
      this.response.writeHead(404, headers);
      this.response.end('Item not found');
      return;
    }

    headers['Content-Type'] = 'application/json';
    this.response.writeHead(200, headers);
    this.response.end(JSON.stringify(item));

  })
  .post(function () {
    var d = this.request.body.d;
    if(!d) {
      this.response.writeHead(404);
      this.response.end();
      return;
    }
    if(typeof d != 'string') {
      this.response.writeHead(400);
      this.response.end('String expected');
      return;
    }
    var item = Item.findOne({_id: this.params._id});
    if(!item) {
      this.response.writeHead(404);
      this.response.end('Item not found');
      return;
    }

    var doc = {
      groupId: item.groupId
    }

    if(checkPathType(d) == 'simple'){
        doc.pointList = JSON.stringify(pathArraySvgOro(item.array.value));
        doc.type = 'simple_path';
    }
    else{
        doc.pointList = d;
        doc.type = 'complex_path';
    }
    doc.closed = d[d.length-1].match(/z/i) ? true : false;
    id = Item.insert(doc);
    var headers = {
      'Access-Control-Allow-Origin' : '*',
      'Content-Type': 'application/json'
    };
    this.response.writeHead(200, headers);
    this.response.end(JSON.stringify({id: id}));
  })
