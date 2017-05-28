/*
Router.route('/file/:_id', function () {
  this.redirect('/file/' + this.params._id + '/1');
})
*/

//var server = 'http://oroboro.meteor.com'
//var server = 'http://192.168.1.106:3000'
//var server = 'http://192.168.2.2:3000'
var server = ''

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
                    return;
                }

                var headers = {'Content-type': file.fileType, 'Access-Control-Allow-Origin' : '*'};
                this.response.writeHead(200, headers);
                if(['application/octet-stream', 'application/javascript', 'text/css', 'text/plain', 'gcode'].indexOf(file.fileType) != -1) {
                    this.response.end(file.script);
                    return;
                }

                if(file.fileType == 'image/svg+xml') {
                  var script = Meteor.call('getWrappedSvg', {
                      id: file._id,
                      responsive: this.params.query.responsive
                    });
                  this.response.end(script);
                }
            }
        }
    });
});

Router.map(function(){
    this.route('/file/:_id/:scale', {
        where: 'server',
        path: '/file/:_id/:scale',
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
                            var script = Meteor.call('getWrappedSvg', {id: file._id, scale: this.params.scale});
                    this.response.end(script);
                }
            }
        }
    });
});

Router.route('/viewer/:url', {
    template: 'svgViewer',
    path: '/viewer/:url',
    onBeforeAction: function(){
        var script1 = IRLibLoader.load(server + '/file/GZxMGchzEkKFtakFh');//svg.js
        if(script1.ready()){
            var script3 = IRLibLoader.load(server + '/file/9Za3SyDmhiBzmGYup');//svg.parse.js
            if(script3.ready()){
                var script4 = IRLibLoader.load(server + '/file/SvgoiuE2Ft5hPuA7s');//svg.import.js
                if(script4.ready()){
                    var script5 = IRLibLoader.load(server + '/file/ENoXS3yEwFhYhoXGS');//pan&zoom
                    if(script5.ready()){
                        this.next();
                    }
                }
            }
        }
    },
    data: function(){
        return {url: decodeURIComponent(this.params.url)}
    }
})

Router.route('/viewer', {
    template: 'svgViewer',
    path: '/viewer',
    onBeforeAction: function(){
        var script1 = IRLibLoader.load(server + '/file/GZxMGchzEkKFtakFh');//svg.js
        if(script1.ready()){
            var script3 = IRLibLoader.load(server + '/file/9Za3SyDmhiBzmGYup');//svg.parse.js
            if(script3.ready()){
                var script4 = IRLibLoader.load(server + '/file/SvgoiuE2Ft5hPuA7s');//svg.import.js
                if(script4.ready()){
                    var script5 = IRLibLoader.load(server + '/file/ENoXS3yEwFhYhoXGS');//pan&zoom
                    if(script5.ready()){
                        this.next();
                    }
                }
            }
        }
    },
    data: function(){
        if(this.params.query)
            return {url: this.params.query.url}
    }
})

Router.map(function(){
    this.route('/gcode/:_id/simulation', {
        path: '/gcode/:_id/simulation',
        template: 'gcodeSimulation',
        subscriptions: function(){
            this.subscribe('filepublish', this.params._id).wait();
        },
        onBeforeAction: function(){
            var script1 = IRLibLoader.load(server + 'http://api.jscut.org/bower_components/platform/platform.js');
            if(script1.ready()){
                this.next();
            }
        },
        action: function(){
            if(this.ready()){
                this.render();
            }
        }
    });
})

Router.map(function(){
    this.route('/gcode/:_id/', {
        path: '/gcode/:_id/',
        template: 'gcode',
        subscriptions: function(){
            this.subscribe('filepublish', this.params._id).wait();
        },/*
        waitOn: function(){
            var root = '/gcode/js'
            return [
                IRLibLoader.load('/Cam.js'),
                IRLibLoader.load('/path.js'),
                IRLibLoader.load('/GcodeConversionViewModel.js'),
                IRLibLoader.load('/MaterialViewModel.js'),
                IRLibLoader.load('/OperationsViewModel.js'),
                IRLibLoader.load('/SelectionViewModel.js'),
                IRLibLoader.load('/SvgViewModel.js')
                //IRLibLoader.load('/path.js'),
                //IRLibLoader.load('/path.js'),
                //IRLibLoader.load('/path.js'),
                //IRLibLoader.load('/path.js')
            ]
        },*//*
        onBeforeAction: function(){
            //var script1 = IRLibLoader.load(server + 'http://api.jscut.org/bower_components/platform/platform.js');
            var script1 = IRLibLoader.load(server + '/Cam.js');
            if(script1.ready()){
                this.next();
            }
        },*/
        action: function(){
            if(this.ready()){
                this.render();
            }
        }
    });
})

Router.map(function(){
    this.route('/md/:_id', {
        path: '/md/:_id',
        template: 'markdownFileMd',
        subscriptions: function(){
            this.subscribe('filemd', this.params._id).wait();
        },
        action: function(){
            if(this.ready()){
                this.render();
            }
        }
    });
});

Router.map(function(){
    this.route('/file/:_id/:scale/notemplate', {
        where: 'server',
        path: '/file/:_id/:scale/notemplate',
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
                    else {
                        if(file.fileType == 'image/svg+xml')
                            var script = Meteor.call('getWrappedSvg', {id: file._id, scale: this.params.scale, notemplate: true});
                    this.response.end(script);
                }
            }
          }
        }
    });
});


cssfiles = null, jsfiles = null;

Router.route('/filem/:_id', {
    path: '/filem/:_id',
    template: 'svgEditor',
    subscriptions: function(){
        console.orolog('subscribe');
        //this.subscribe('svgEditorScripts').wait();
        //this.subscribe('file', this.params._id).wait();
        //this.subscribe('filebrowse', 'vyRjpfv2kki5sPE9G', 'file').wait()
        var subs1 = Meteor.subscribe('svgEditorScripts');
        this.wait(subs1);
        global_oro_variables.subscriptionhandles['svgEditorScripts'] = subs1;

        var subs2 = Meteor.subscribe('file', this.params._id)
        this.wait(subs2);
        global_oro_variables.subscriptionhandles['file'] = subs2;

        //var subs3 = Meteor.subscribe('filebrowse', 'vyRjpfv2kki5sPE9G', 'file')
        //this.wait(subs3);
        //global_oro_variables.subscriptionhandles['filebrowse'] = subs3;

        console.orolog('/subscribe');
    },
    action: function(){
        if(this.ready()){
            console.orolog('this.ready');
            var f = File.findOne({_id: this.params._id});
            //console.orolog(JSON.stringify(File.find().fetch()))
            //console.orolog(JSON.stringify(Group.find().fetch()))
            //console.orolog(JSON.stringify(Item.find().fetch()))
            //var lastit = Item.findOne({_id: f.itemids[f.itemids.length-1]})
            this.render('svgEditor', {
                data: function(){
                    return {file: f};
                }
            })
        }
    }
});

Router.route('/editor/:_id', {
    path: '/editor/:_id',
    template: 'svgEditor',
    subscriptions: function(){
        console.orolog('subscribe');
        //this.subscribe('svgEditorScripts').wait();
        //this.subscribe('file', this.params._id).wait();
        //this.subscribe('filebrowse', 'vyRjpfv2kki5sPE9G', 'file').wait()

        this.subscribe('filepublish', this.params._id)
        this.subscribe('relatedfiles', this.params._id)

        var file = File.findOne({_id: this.params._id})
        console.orolog(file);
        /*
        for(var i in ids.items)
            this.subscribe('itempublish', ids.items[i])
        for(var i in ids.groups)
            this.subscribe('grouppublish', ids.group[i])

        */

        var subs1 = Meteor.subscribe('svgEditorScripts');
        this.wait(subs1);
        global_oro_variables.subscriptionhandles['svgEditorScripts'] = subs1;

        var subs2 = Meteor.subscribe('file', this.params._id)
        this.wait(subs2);
        global_oro_variables.subscriptionhandles['file'] = subs2;

        var subs3 = Meteor.subscribe('filebrowse', 'vyRjpfv2kki5sPE9G', 'file')
        this.wait(subs3);
        global_oro_variables.subscriptionhandles['filebrowse'] = subs3;

        //console.orolog(global_oro_variables.subscriptionhandles);
        console.orolog('/subscribe');
    },
    action: function(){
        if(this.ready()){
            console.orolog('this.ready');
            var f = File.findOne({_id: this.params._id});
            //console.orolog(JSON.stringify(File.find().fetch()))
            //console.orolog(JSON.stringify(Group.find().fetch()))
            //console.orolog(JSON.stringify(Item.find().fetch()))
            var lastit = Item.findOne({_id: f.itemids[f.itemids.length-1]})
            this.render('svgEditor', {
                data: function(){
                    return {file: f};
                }
            })
        }
    }
});

Router.route('/filed/:_id', {
    path: '/filed/:_id',
    template: 'svgDinamic',
    subscriptions: function(){
        console.orolog('subscribe');
        var subs1 = Meteor.subscribe('svgEditorScripts');
        this.wait(subs1);
        global_oro_variables.subscriptionhandles['svgEditorScripts'] = subs1;

        var subs2 = Meteor.subscribe('file', this.params._id)
        this.wait(subs2);
        global_oro_variables.subscriptionhandles['file'] = subs2;

        var subs3 = Meteor.subscribe('filebrowse', 'vyRjpfv2kki5sPE9G', 'file')
        this.wait(subs3);
        global_oro_variables.subscriptionhandles['filebrowse'] = subs3;

        console.orolog(global_oro_variables.subscriptionhandles);
        console.orolog('/subscribe');
    },
    action: function(){
        if(this.ready()){
            console.orolog('this.ready');
            var f = File.findOne({_id: this.params._id});
            this.render('svgDinamic', {
                data: function(){
                    return {file: f};
                }
            })
        }
    }
});


Router.route('/browse/:col/:id/:start/:dim/:buttons', {
    path: '/browse/:col/:id/:start/:dim/:buttons',
    template: 'filebrowse',
    data: function(){
        return {start: parseInt(this.params.start), dim: parseInt(this.params.dim), id: this.params.id, col: this.params.col, buttons: this.params.buttons};
    },
    onBeforeAction: function(){
        var script1 = IRLibLoader.load(server + '/file/NjYbTkGZKXn8miLnN');  // GZxMGchzEkKFtakFh');
        if(script1.ready()){
            var script2 = IRLibLoader.load(server + '/file/6BdThBrHzGa8qe3nm');
            if(script2.ready()){
              //var script3 = IRLibLoader.load(server + '/file/SvgoiuE2Ft5hPuA7s'); // svg import
              //if(script3.ready()) {
              //  var script5 = IRLibLoader.load(server + '/file/9Za3SyDmhiBzmGYup'); // svg parse
              //  if(script5.ready()) {
              //    var script6 = IRLibLoader.load(server + '/file/uqxojroeQhqAQ2RQm'); // foreignObject
              //    if(script6.ready()) {
                    this.next();
              //    }
              //  }
            //  }
            }
        }
    },
    action: function(){
        if(this.ready()){
            this.render();
        }
    }
});


Router.route('/browse/:col/:id/', function () {
  this.redirect('/browse/' + this.params.col + '/' + this.params.id + '/1/3/');
})

Router.route('/browse/:col/:id/:start', function () {
  this.redirect('/browse/' + this.params.col + '/' + this.params.id + '/' + this.params.start + '/3/');
})




Router.route('/browse/:col/:id/:start/:dim', {
    path: '/browse/:col/:id/:start/:dim',
    template: 'filebrowse',
    subscriptions: function(){
        //this.subscribe('filebrowse', this.params._id, this.params.col).wait();
    },
    data: function(){
        return {start: parseInt(this.params.start), dim: parseInt(this.params.dim), id: this.params.id, col: this.params.col, login: true};
    },
    onBeforeAction: function(){
        console.orolog('load scripts');
        var script1 = IRLibLoader.load(server + '/file/NjYbTkGZKXn8miLnN'); // GZxMGchzEkKFtakFh');
        if(script1.ready()){
            var script2 = IRLibLoader.load(server + '/file/6BdThBrHzGa8qe3nm');
            if(script2.ready()){
                var script3 = IRLibLoader.load(server + '/file/uqxojroeQhqAQ2RQm');
                if(script3.ready()){
                  //var script5 = IRLibLoader.load(server + '/file/9Za3SyDmhiBzmGYup'); // svg import
                  //if(script5.ready()) {
                    //var script4 = IRLibLoader.load(server + '/file/SvgoiuE2Ft5hPuA7s'); // svg parse
                    //if(script4.ready()) {
                      //var script6 = IRLibLoader.load(server + '/file/uqxojroeQhqAQ2RQm'); // foreignObject
                      //if(script6.ready()) {
                        this.next();
                      //}
                    //}
                  //}
                }
            }
        }
    },/*
     waitOn: function(){
        return IRLibLoader.load(server + '/file/GZxMGchzEkKFtakFh');
    },*/
    action: function(){
        if(this.ready()){
            console.orolog('ready');
            this.render();
        }
    }
});
/*
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
        return IRLibLoader.load(server + '/file/GZxMGchzEkKFtakFh');
    },
    action: function(){
        if(this.ready()){
            this.render();
        }
    }
});*/

Router.route('/add/deps', {
    template: 'addDeps',
    subscriptions: function(){
        this.subscribe('files').wait();
        this.subscribe('dependencies').wait();
    },
    onBeforeAction: function(){
        var script1 = IRLibLoader.load('http://cdn.jsdelivr.net/ace/1.1.8/min/ace.js');
        if(script1.ready()){
            var script2 = IRLibLoader.load('/file/wtjbgpTaFejHZCYrk');
            if(script2.ready())
                this.next();
        }
    }
});
