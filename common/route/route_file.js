
Router.map(function(){
    this.route('/file/:_id', {
        where: 'server',
        path: '/file/:_id',
        template: 'show_file',
        action: function(){
            var file = File.findOne({_id: this.params._id});
            var headers = {'Content-type': file.fileType, 'Access-Control-Allow-Origin' : '*'};
            this.response.writeHead(200, headers);
            if(file.fileType == 'application/javascript')
                var script = file.script;
            else
                if(file.fileType == 'image/svg+xml')
                var script = Meteor.call('getFileScript', this.params._id);
            this.response.end(script);
        }
    });
});


js_dep = [];

recursive_depends = function recursive_depends(fileId, rel){
    var deps = Dependency.find({fileId1: fileId, type: rel}).fetch();
    if(deps.length > 0)
        for(var d in deps){
            if(js_dep.indexOf(deps[d].fileId2) == -1){
                recursive_depends(deps[d].fileId2, rel);
                js_dep.push(deps[d].fileId2);
            }
        }
}

path_points = function path_points(pointList){
    var points = JSON.parse(pointList);
    var path = "";
    for(var l in points){
        path = path + "M" + points[l].join(" ") + "z";
    }
    return path;
}

Router.route('/filem/:_id', {
    path: '/filem/:_id',
    template: 'show_meteor_file_svg',
    subscriptions: function(){
        this.subscribe('files').wait();
        this.subscribe('groups').wait();
        this.subscribe('items').wait();
        this.subscribe('dependencies').wait();
    },
    data: function(){
        return {"_id": this.params._id};
    },
    waitOn: function(){
        scripts = [];
        recursive_depends(this.params._id, 3);
        for(var s in js_dep){
            scripts.push(IRLibLoader.load('http://192.168.1.106:3000/file/' + js_dep[s]));
        }
        js_dep = [];
        return scripts;
    },
    action: function(){
        if(this.ready()){
            this.render();
        }
    }
});
