
Router.map(function(){
    this.route('/file/:_id', {
        where: 'server',
        path: '/file/:_id',
        template: 'show_file',
        action: function(){
            var file = File.findOne({_id: this.params._id});
            var headers = {'Content-type': file.fileType, 'Access-Control-Allow-Origin' : '*'};
            this.response.writeHead(200, headers);
            if(file.fileType == 'application/javascript' || file.fileType == "text/css")
                var script = file.script;
            else
                if(file.fileType == 'image/svg+xml')
                var script = Meteor.call('getFileScript', this.params._id);

            this.response.end(script);
        }
    });
});


js_dep = [];
all_dep = {};

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

separate_deps = function separate_deps(type){
    if(js_dep.length > 0){
        var select = {};
        select._id = { $in: js_dep };
        select.fileType = type;
        return File.find(select).fetch();
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
    template: 'svgEditor',//'show_meteor_file_svg',
    subscriptions: function(){
        this.subscribe('files').wait();
        this.subscribe('groups').wait();
        this.subscribe('items').wait();
        this.subscribe('dependencies').wait();
    },
    data: function(){
        if(js_dep.length == 0)
            recursive_depends("Yq9iqYhEma9z9mYrp", 3);
            //recursive_depends(this.params._id, 3);
        cssfiles = separate_deps("text/css");
        jsfiles = separate_deps("application/javascript");
        js_dep = [];
        return {file: File.findOne({_id:this.params._id}), cssfiles: cssfiles, jsfiles: jsfiles};
    },
    waitOn: function(){
        scripts = [];
        js_dep = [];
        //recursive_depends(this.params._id, 3);
        recursive_depends("Yq9iqYhEma9z9mYrp", 3);
        jsfiles = separate_deps("application/javascript");
        js_dep = [];
        for(var s in jsfiles){
            scripts.push(IRLibLoader.load('http://192.168.1.106:3000/file/' + jsfiles[s]._id));
        }
        return scripts;
    },
    action: function(){
        if(this.ready()){
            this.render();
        }
    }
});

Router.route('/browse/:col/:_id/:start/:dim', {
    path: '/browse/:col/:_id/:start/:dim',
    template: 'filebrowse',
    subscriptions: function(){
        this.subscribe('files').wait();
        this.subscribe('groups').wait();
        this.subscribe('dependencies').wait();
    },
    data: function(){
        var dim = Number(this.params.dim);
        var limit = dim * dim;
        if(this.params.col == "file")
            var files = Dependency.find({fileId2: this.params._id}, {skip: Number(this.params.start)-1, limit: limit}).fetch();
        else
            var files = Group.find({groupId: this.params._id}, {skip: Number(this.params.start)-1, limit: limit}).fetch();
        return {files: files, start: this.params.start, dim: this.params.dim, id: this.params._id, col: this.params.col};    
    },
     waitOn: function(){
        return IRLibLoader.load('http://192.168.1.106:3000/file/GZxMGchzEkKFtakFh');
    },
    action: function(){
        if(this.ready()){
            this.render();
        }
    }
});