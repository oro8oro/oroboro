
Router.map(function(){
    this.route('/group/:_id/:scale', {
        where: 'server',
        path: '/group/:_id/:scale',
        template: 'show_group',
        subscriptions: function(){
            this.subscribe('group', this.params._id).wait();
        },
        action: function(){
            if(this.ready()){
                var group = Group.findOne({_id: this.params._id});
                var headers = {'Content-type': 'image/svg+xml', 'Access-Control-Allow-Origin' : '*'};
                this.response.writeHead(200, headers);
                var grscript = Meteor.call('getGroupScript', this.params._id);
                var path = getElementPath(this.params._id);
                var file = File.findOne({_id: path[path.length-1]});
                if(!file)
                    file = {width: 1024, height: 1024, id: ''}

                file.width = file.width * this.params.scale
                file.height = file.height * this.params.scale

                script = '<svg width="' + file.width + '" height="' + file.height + '" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" id="' + file._id+ '">' + '<g id="viewport" transform="matrix(' + this.params.scale + ' 0 0 ' + this.params.scale + ' 0 0)">'
                var end = '</g></svg>';

                if(group.type == 'layer')
                    script = script + grscript + end
                else{
                    var layer = Group.findOne({_id: path[path.length-2]});
                    script = script + '<g id="' + layer._id + '" type="' + layer.type + '">' + grscript + '</g>' + end;
                }
                this.response.end(script);
            }
        }
    });
});

Router.map(function(){
    this.route('/group/:_id', {
        where: 'server',
        path: '/group/:_id',
        template: 'show_group',
        subscriptions: function(){
            this.subscribe('group', this.params._id).wait();
        },
        action: function(){
            if(this.ready()){
                var group = Group.findOne({_id: this.params._id});
                var headers = {'Content-type': 'image/svg+xml', 'Access-Control-Allow-Origin' : '*'};
                this.response.writeHead(200, headers);
                var script = Meteor.call('getGroupScript', this.params._id);
                var path = getElementPath(this.params._id);
                var file = File.findOne({_id: path[path.length-1]});
                if(!file)
                    file = {width: 1024, height: 1024, id: ''}
                if(group.type == 'layer')
                    script = '<svg width="' + file.width + '" height="' + file.height + '" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" onload="init()" id="' + file._id+ '">' + script + '</svg>';
                else{
                    var layer = Group.findOne({_id: path[path.length-2]});
                    script = '<svg width="' + file.width + '" height="' + file.height + '" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" onload="init()" id="' + file._id + '">' + '<g id="' + layer._id + '" type="' + layer.type + '">' + script + '</g></svg>';
                }
                this.response.end(script);
            }
        }
    });
});


Router.route('/groupm/:_id', {
    path: '/groupm/:_id',
    template: 'svgEditor',
    subscriptions: function(){
        this.subscribe('files').wait();
        this.subscribe('groups').wait();
        this.subscribe('items').wait();
        this.subscribe('dependencies').wait();
        this.subscribe('users').wait();
    },/*
    waitOn: function(){
        scripts = [];
        var js_dep = getDependencies("Yq9iqYhEma9z9mYrp", 3);
        jsfiles = separate_deps(js_dep, "application/javascript");
        for(var s in jsfiles){
            scripts.push(IRLibLoader.load('http://192.168.1.106:3000/file/' + jsfiles[s]._id));
        }
        return scripts;
    },*/
    data: function(){
        var js_dep = getDependencies("Yq9iqYhEma9z9mYrp", 3);
        cssfiles = separate_deps(js_dep,"text/css");
        jsfiles = separate_deps(js_dep,"application/javascript");
        return {file: File.findOne({_id:this.params._id}), cssfiles: cssfiles, jsfiles: jsfiles};
    },
    action: function(){
        if(this.ready()){
            this.render();
        }
    }
});


