
Router.map(function(){
    this.route('/file/:_id', {
        where: 'server',
        path: '/file/:_id',
        template: 'show_file',
        action: function(){
            var file = File.findOne({_id: this.params._id});
            if(typeof file == 'undefined')
                file = File.findOne({title: this.params._id});
            if(typeof file != 'undefined'){      
                if(file.fileType == 'image/jpeg'){
                    //var headers = {'Content-type': file.fileType, 'Access-Control-Allow-Origin' : '*', Location: file.script};
                    this.response.writeHead(302, {Location: file.script});
                    this.response.end();
                }
                else{
                    var headers = {'Content-type': file.fileType, 'Access-Control-Allow-Origin' : '*'};
                    this.response.writeHead(200, headers);
                    if(['application/octet-stream', 'application/javascript', 'text/css', 'text/plain'].indexOf(file.fileType) != -1)
                        var script = file.script;
                    else
                        if(file.fileType == 'image/svg+xml')
                            var script = Meteor.call('getFileScript', file._id);
                    //console.log(script);
                    this.response.end(script);
                }
            }
        }
    });
});


//js_dep = [];
//all_dep = {};

recursive_depends = function recursive_depends(fileId, rel, level_dep, level){
    var deps = Dependency.find({fileId1: fileId, type: rel}).fetch();
    if(!level_dep[level])
        level_dep[level] = [];
    for(var d in deps){
        level_dep[level].push(deps[d].fileId2);
        recursive_depends(deps[d].fileId2, rel, level_dep, level + 1);
    }
    return level_dep;
}

getDependencies = function(fileId, rel){
    var level_dep = [];
    var js_dep = [];
    level_dep = recursive_depends(fileId, rel, level_dep, 0);
    console.log(level_dep);
    for(var i = level_dep.length-1; i >= 0; i--){
        js_dep = js_dep.concat(level_dep[i]);
    }
    js_dep = js_dep.filter(onlyUnique);
    return js_dep;
}

/*
recursive_depends = function recursive_depends(fileId, rel){
    var deps = Dependency.find({fileId1: fileId, type: rel}).fetch();
    if(deps.length > 0)
        for(var d in deps){
            if(js_dep.indexOf(deps[d].fileId2) == -1){
                recursive_depends(deps[d].fileId2, rel);
                js_dep.push(deps[d].fileId2);
            }
        }
}*/
//GZxMGchzEkKFtakFh
separate_deps = function separate_deps(js_dep,type){
    if(js_dep.length > 0){
        var result = [];
        for(j in js_dep){
            var f = File.findOne({_id: js_dep[j], fileType: type});
            if(f)
                result.push(f);
        }/*
        var select = {};
        select._id = { $in: js_dep };
        select.fileType = type;
        return File.find(select).fetch();*/
        return result;
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
        this.subscribe('users').wait();
    },
    waitOn: function(){
        scripts = [];
        //js_dep = [];
        //recursive_depends(this.params._id, 3);
        //recursive_depends("Yq9iqYhEma9z9mYrp", 3);
        var js_dep = getDependencies("Yq9iqYhEma9z9mYrp", 3);
        console.log(js_dep);
        jsfiles = separate_deps(js_dep, "application/javascript");
        //js_dep = [];
        console.log(jsfiles);
        for(var s in jsfiles){
            //http://oroboro.meteor.com/
            //http://192.168.1.106:300
            scripts.push(IRLibLoader.load('http://oroboro.meteor.com/file/' + jsfiles[s]._id)); 
        }
        return scripts;
    },
    data: function(){
        //if(js_dep.length == 0)
            //recursive_depends("Yq9iqYhEma9z9mYrp", 3);
            //recursive_depends(this.params._id, 3);
        var js_dep = getDependencies("Yq9iqYhEma9z9mYrp", 3);
        cssfiles = separate_deps(js_dep,"text/css");
        jsfiles = separate_deps(js_dep,"application/javascript");
        //js_dep = [];
        return {file: File.findOne({_id:this.params._id}), cssfiles: cssfiles, jsfiles: jsfiles};
    },
    action: function(){
        if(this.ready()){
            this.render();
        }
    }
});

Router.route('/browse/:col/:_id/:start/:dim/:buttons', {
    path: '/browse/:col/:_id/:start/:dim/:buttons',
    template: 'filebrowse',
    subscriptions: function(){
        this.subscribe('files').wait();
        this.subscribe('groups').wait();
        this.subscribe('dependencies').wait();
    },
    data: function(){
        var dim = Number(this.params.dim);
        var limit = dim * dim;
        /*
        if(this.params.col == "file")
            var files = Dependency.find({fileId2: this.params._id}, {skip: Number(this.params.start)-1, limit: limit}).fetch();
        else
            var files = Group.find({groupId: this.params._id}, {skip: Number(this.params.start)-1, limit: limit}).fetch();

        return {files: files, start: this.params.start, dim: this.params.dim, id: this.params._id, col: this.params.col};  */
        return {start: this.params.start, dim: this.params.dim, id: this.params._id, col: this.params.col, buttons: this.params.buttons};
    },
     waitOn: function(){
        return IRLibLoader.load('http://oroboro.meteor.com/file/GZxMGchzEkKFtakFh');
    },
    action: function(){
        if(this.ready()){
            this.render();
        }
    }
});


Router.route('/browse/:col/:_id/', function () {
  this.redirect('/browse/' + this.params.col + '/' + this.params._id + '/1/3/');
})

Router.route('/browse/:col/:_id/:start', function () {
  this.redirect('/browse/' + this.params.col + '/' + this.params._id + '/' + this.params.start + '/3/');
})




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
        return {start: this.params.start, dim: this.params.dim, id: this.params._id, col: this.params.col};
    },
     waitOn: function(){
        return IRLibLoader.load('http://oroboro.meteor.com/file/GZxMGchzEkKFtakFh');
    },
    action: function(){
        if(this.ready()){
            this.render();
        }
    }
});

Router.route('/browse/:_id/:dim', {
    path: '/browse/:_id/:dim',
    template: 'browser',
    subscriptions: function(){
        this.subscribe('files').wait();
        this.subscribe('dependencies').wait();
    },
    data: function(){
        return {id: this.params._id, dim: this.params.dim};   
    },
     waitOn: function(){
        return IRLibLoader.load('http://oroboro.meteor.com/file/GZxMGchzEkKFtakFh');
    },
    action: function(){
        if(this.ready()){
            this.render();
        }
    }
});