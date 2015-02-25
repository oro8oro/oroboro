allfiles = {};

reloadFilebrowser = function(params){
    console.log('reload');
    SVG.get('fileBrowse').clear();
    if(!params.buttons)
        params.buttons = Session.get("fileButtons");
    browserContent(params);
    navButtons(params);
    fileBMenu();
    if(params.id == Session.get('fileId') && !SVG.get("Bcrumbs"))
        fileBcrumbs(params.id)
    else
        Session.set('fileId', params.id);
}

Template.filebrowse.rendered = function(){
    console.log('start');
    window.windowType = 'fileBrowser';
    var start = Number(this.data.start);
    var dim = Number(this.data.dim);
    Session.set("fileButtons", this.data.buttons);
    var params = {start:start, dim:dim, col: this.data.col, id: this.data.id, buttons: this.data.buttons};
    Session.set('browseParams', JSON.stringify(params));
    var browser = SVG('fileBrowse'); 
    this.autorun(function(){
        var params = JSON.parse(Session.get('browseParams'));
        reloadFilebrowser(params);
        console.log('reloadFilebrowser');
    });

    this.autorun(function(){
        var id = Session.get('fileId');
        if(SVG.get("Bcrumbs"))
            SVG.get("Bcrumbs").remove();
        fileBcrumbs(id);
        console.log('reload crumbs');
    });

    this.autorun(function(){
       var win = Session.get("window");
       SVG.get('fileBrowse').attr({ "width": win.w, "height": win.h})
    });
}

browserContent = function(params){
    console.log('content');
    var start = params.start;
    var dim = params.dim;
    var col = params.col;
    if(col == 'file'){
        var parent = File.findOne({_id: params.id});
        if(!allfiles[params.id]){
            allfiles = {};
            var deps = Dependency.find({fileId2: params.id}).fetch();
            var idss = [];
            for(var d in deps)
                idss.push(deps[d].fileId1);
            allfiles[params.id] = File.find({_id: {$in: idss}}, {sort: {dateModified: -1}}).fetch();
        }
    }
    else{
        var path = getElementPath(params.id);
        var parent = File.findOne({_id: path[path.length-1]});
        if(!allfiles[params.id]){
            allfiles = {};
            if(col == 'group'){
                var gr = Group.findOne({_id: params.id});
                if(gr)
                    var q = {groupId: params.id};
                else
                    var q = {fileId: params.id}
                allfiles[params.id] = Group.find(q, {sort: {ordering: 1}}).fetch();
                //var items = Item.find({groupId: params.id}, {sort: {ordering: 1}}).fetch();
                //if(items.length > 0){
                //    var lim = allfiles[params.id].length;
                //    allfiles[params.id] = allfiles[params.id].concat(items);
                //}
            }
            if(col == 'item'){
                allfiles[params.id] = Item.find({groupId: params.id}, {sort: {ordering: 1}}).fetch();
            }
        }
    }
    var files = allfiles[params.id].slice(start-1,dim*dim+start-1);

    $('body').attr({"class": "no_scroll"}).css({margin:0,padding:0});
    var browser = SVG.get('fileBrowse'); 
    browser.viewbox(0,0,parent.width,parent.height);
    var x, y=0;
    var svg=[],gr=[];
    var cols = [];
    for(var i = 0 ; i < files.length ; i++){
        if (i % dim == 0) {
            x = 0;
            y = y + parent.height/dim;
        }
        gr[i] = browser.group().attr("id", "group_"+i);
        gr[i].transform({"scaleX": (1/dim)*0.99,"scaleY": (1/dim)*0.99,x: x,y: y-parent.height/dim}); 
        if(col == "file"){
            var f = files[i];
            var imagepath = '/file/'+f._id;
            cols[i] = 'file';
        }
        else{
            var f = parent;
            f._id = files[i]._id;
            if(col == "group"){
                //if(!lim || i < lim){
                    var imagepath = '/group/'+files[i]._id;
                    cols[i] = 'group';
                //}
                //else{
                //    var imagepath = '/item/'+files[i]._id;
                //    cols[i] = 'item';
                //}
            }
            else{
                var imagepath = '/item/'+files[i]._id;
                cols[i] = 'item';
            }
        }
        svg[i] = gr[i].nested().attr("id", "file_"+i).attr("fileId", f._id);
        if(dim != 1)
            svg[i].rect(f.width,f.height).fill('#FFFFFF');
        if(dim != 1)
            gr[i].rect(parent.width,parent.height).attr({rx:100,ry:100, strokeWidth:6,stroke:"#000"}).fill('none');
        svg[i].attr({preserveAspectRatio: "xMidYMid meet"})
        svg[i].viewbox(0,0,f.width,f.height);
        svg[i].image(imagepath); 
        svg[i].group().attr("id","container_"+i)
        x=x+parent.width/dim
        if(window.parent.windowType == 'svgEditor')
            gr[i].on('click',function(event){
                var i = Number(this.attr("id").substring(this.attr("id").lastIndexOf("_")+1));
                if(SVG.get(event.target.getAttribute('id')).parent.attr('id').indexOf('adapter') == -1 || SVG.get(event.target.getAttribute('id')).parent.parent.parent.attr("function").indexOf('disect') == -1){
                    var subfiles = Dependency.find({fileId2: SVG.get("file_"+i).attr("fileId"), type: 1}).fetch()
                    if(subfiles.length > 0){
                        Session.set('browseParams', JSON.stringify({start:1, dim:dim, col: cols[i], id: SVG.get("file_"+i).attr("fileId"), buttons: params.buttons}));
                    }
                    else
                        window.parent.menuAddElemCallb(SVG.get("file_"+i).attr("fileId"));
                }
            });
        
    }
    //fileBMenu(parent, files.length);
}

navButtons = function(params){
    console.log('nav');
    var start = params.start;
    var dim = params.dim;
    var col = params.col;
    var browser = SVG.get('fileBrowse'); 
    if(col == "file")
        var parent = File.findOne({_id: params.id});
    else{
        var path = getElementPath(params.id);
        var parent = File.findOne({_id: path[path.length-1]});
    }
    var nav = {};
    if(Math.ceil(start/(dim*dim)) == 1)
        nav.p = false;
    else
        nav.p = true;
    if(Math.ceil(allfiles[params.id].length / (dim*dim)) == 1 || Math.ceil(start/(dim*dim)) == Math.ceil(allfiles[params.id].length / (dim*dim)))
        nav.n = false;
    else
        nav.n = true;
    if(nav.p || nav.n){
        var pages = browser.group().attr("id","pagination").opacity(0.3);
        pages.text(Math.ceil(start/(dim*dim))+ '/' + (Math.ceil(allfiles[params.id].length / (dim*dim)))).move(parent.width+20, 20).font({size: 30, family: 'Sans-serif'});
    }
    if(nav.n || nav.p)
        var buttons = browser.group().attr("id","sideMenu")
    if(nav.n){
        var next = Group.findOne({_id: "Ka4qTJEBoLLLrmNK7"});
        recursive_group_client(buttons, next);
        var n = SVG.get("Ka4qTJEBoLLLrmNK7");
        n.x(parent.width-20).y(parent.height-n.bbox().height*0.2);
        n.scale(0.1).opacity(0.1);
        n.on('click', function(event){
            var ini = start+dim*dim;
            Session.set('browseParams', JSON.stringify({start:ini, dim:dim, col: col, id: params.id, buttons: params.buttons}));
        })
        n.on('mouseover', function(event){
            this.opacity(0.3);
        })
        n.on('mouseout', function(event){
            this.opacity(0.1);
        })
    }
    if(nav.p){
        var prev = Group.findOne({_id: "CrtnLmouQCC9eWWg8"});
        recursive_group_client(buttons, prev);
        var p = SVG.get("CrtnLmouQCC9eWWg8");
        p.x(0-p.bbox().width*0.2).y(parent.height-p.bbox().height*0.2);
        p.scale(0.1).opacity(0.1);
        p.on('click', function(event){
            var ini = start-dim*dim;
            if(ini > 0){
                Session.set('browseParams', JSON.stringify({start:ini, dim:dim, col: col, id: params.id, buttons: params.buttons}));
            }
        })
        p.on('mouseover', function(event){
            this.opacity(0.3);
        })
        p.on('mouseout', function(event){
            this.opacity(0.1);
        })
    } 
}

fileBMenu = function(){
    console.log('menu');
    var params = JSON.parse(Session.get('browseParams'));
    var start = params.start, dim = params.dim, col = params.col, id = params.id;
    var browser = SVG.get('fileBrowse');
    if(col == "file")
        var parent = File.findOne({_id: params.id});
    else{
        var path = getElementPath(params.id);
        var parent = File.findOne({_id: path[path.length-1]});
    }
    var len = allfiles[params.id].slice(start-1,dim*dim+start-1).length;
    var each = Group.findOne({_id: "hBKYCaWAxHGkMLBYF"});
    var butt = [];
    if(!params.buttons || params.buttons != 'nobuttons'){
        recursive_group_client(SVG.get("container_0"), each);
        var ids= [];
        SVG.get("container_0").each(function(j, children) {
            var id = this.attr("id");
            if(ids.indexOf(id) != -1){
                var index = ids.reduce(function(total,x){return x==id ? total+1 : total}, 0)
                this.attr("id", this.attr("id")+'_'+(index+1)+'ind');
            }
            ids.push(id);
            if(this.attr("id").lastIndexOf('_') == -1 || !Number(this.attr("id").substring(this.attr("id").lastIndexOf('_')+1)) )
                this.attr("id", this.attr("id")+'_0');
        }, true);
    }

    for(i = 0; i < len; i++){
        var vb = SVG.get('file_'+i).attr("viewBox").split(" ");      
        if(!params.buttons || params.buttons != 'nobuttons'){           
            if(i != 0){
                var container = deepClone(SVG.get("container_0"),i, SVG.get("container_"+i));
                SVG.get('file_'+i).add(container);
                container.attr("id","container_"+i);
                container.each(function(j, children) {
                    var id = this.attr("id").substring(0,this.attr("id").indexOf('_'));
                    this.attr("id", id+"_"+i);
                    if(this.attr('type') == 'menu_item')
                        this.on('click',function(){
                            if(this.attr("function").lastIndexOf('.') != -1)
                                var func = this.attr("function").substring(this.attr("function").lastIndexOf('.')+1);
                            else
                                var func = this.attr("function");
                            console.log(func);
                            if(window[func])
                                window[func](this, event);
                        });
                }, true);
            }
            else
                var container = SVG.get("container_0");
            container.scale(0.8 * Number(vb[2]) / container.bbox().width);
            container.hide();
            SVG.get("file_"+i).on('mouseover', function(){
                var i = this.attr("id").substring(this.attr("id").lastIndexOf("_")+1);
                SVG.get("container_"+i).show();
                Session.set("fileBIt", this.attr("fileId"));
            })
            SVG.get("file_"+i).on('mouseout', function(){
                var i = this.attr("id").substring(this.attr("id").lastIndexOf("_")+1);
                SVG.get("container_"+i).hide();
            })
        }
        else
            SVG.get("file_"+i).on('mouseover', function(){
                Session.set("fileBIt", this.attr("fileId"));
            });
        if(dim != 1){
            var subfiles = Dependency.find({fileId2: SVG.get("file_"+i).attr("fileId"), type: 1}).fetch()
            if(subfiles.length > 0){
                var fold = SVG.get("file_"+i).group().move(Number(vb[2])-300, Number(vb[3])-300).scale(0.2).fill('none');
                var folder = Group.findOne({_id: "8pmQarpMhMqeReis3"});
                var backgf = fold.rect(1024,1024).radius(512).fill('#cccccc').opacity(0.6);
                recursive_group_client(fold, folder);
                //fold.first().first().first().first().fill('#cccccc').stroke({color: '#FFFFFF', width: 2});
                fold.on('mouseover',function(){
                    this.opacity(0.6);
                });
                fold.on('mouseout',function(){
                    this.opacity(1);
                })
                backgf.on('click',function(){
                    var func = this.parent.last().attr('function');
                    if(func.lastIndexOf('.') != -1)
                        func = func.substring(func.lastIndexOf('.')+1);
                    console.log(func);
                    if(window[func])
                        window[func](this, event);
                });
            }
            var subs = [];
            if(col == 'file')
                subs = Group.find({fileId: SVG.get("file_"+i).attr("fileId")}).fetch();
            else{
                if(col == 'group')
                    subs = Group.find({groupId: SVG.get("file_"+i).attr("fileId")}).fetch();
                if(col == 'item' || subs.length == 0)
                    subs = Item.find({groupId: SVG.get("file_"+i).attr("fileId")}).fetch();
            }
            if(subs.length > 0){
                var disect = SVG.get("file_"+i).group().move(50, Number(vb[3])-300).scale(0.2).fill('none');
                var disector = Group.findOne({_id: "M8RdemnXdmHcJZKwi"});
                var backg = disect.rect(1024,1024).radius(512).fill('#cccccc').opacity(0.6);
                recursive_group_client(disect, disector);
                //disect.first().first().first().first().fill('#cccccc').stroke({color: '#FFFFFF', width: 2});
                disect.on('mouseover',function(){
                    this.opacity(0.6);
                });
                disect.on('mouseout',function(){
                    this.opacity(1);
                })
                backg.on('click',function(){
                    var func = this.parent.last().attr('function');
                    if(func.lastIndexOf('.') != -1)
                        func = func.substring(func.lastIndexOf('.')+1);
                    console.log(func);
                    if(window[func])
                        window[func](this, event);
                });
            }
        }
    }
}

fileBcrumbs = function(fileid){
    console.log('fileBcrumbs');
    var params = JSON.parse(Session.get('browseParams'));
    var start = params.start, dim = params.dim, col = params.col, id = params.id;
    if(col == "file"){
        var parent = File.findOne({_id: fileid});
        var path = getDependencyPath(id);
        path.splice(0,0, {fileId2: id});
    }
    else{
        var path2 = getElementPath(fileid);
        var parent = File.findOne({_id: path2[path2.length-1]});
        var path = getDependencyPath(parent._id);
        path2[path2.length-1] = {fileId2: path2[path2.length-1]};
        path = path2.concat(path);
        console.log(path2);
        var lim = path2.length-2;
    }
    var browser = SVG.get('fileBrowse');
    var crumbs = browser.group().attr("id", "Bcrumbs");
    //var scale = browser.attr("height")/data.dim;
    var scale = (1/6)*0.5;
    var vb = browser.attr("viewBox").split(" ");
    var crumbsarr = [], gr = [], y = 20, x;
    var cols = [];
    console.log(lim);
    console.log(path);
    var maxwidth = 0;
    for(i = path.length-1; i >= 0; i--){
        if(typeof lim === 'undefined' || i > lim){
            var f = File.findOne({_id: path[i]["fileId2"]});
            var imagepath = '/file/'+f._id;
            if(typeof lim === 'undefined' || i > lim+1)
                cols[i] = 'file';
            else
                cols[i] = 'group';
            path[i] = f._id;
        }
        else{
            var f = parent;
            var imagepath = '/group/'+path[i];
            if(i > 0)
                cols[i] = 'group';
            else
                cols[i] = 'item';
        }
        console.log(imagepath); console.log(cols[i]);
        x = -f.width*scale-20;
        if(maxwidth < f.width)
            maxwidth = f.width;
        gr[i] = crumbs.group().opacity(0.3);
        gr[i].transform({"scaleX": scale,"scaleY": scale, x: x, y: y});
        gr[i].rect(Number(vb[2]),Number(vb[3])).attr({rx:20,ry:20, fill:"#eee", strokeWidth:6,stroke:"#000"});
        crumbsarr[i] = gr[i].nested().attr("id", "parentfile_"+i).attr("fileId", f._id);
        crumbsarr[i].rect(f.width,f.height).fill('#FFFFFF');
        crumbsarr[i].attr({preserveAspectRatio: "xMidYMid meet"})
        crumbsarr[i].viewbox(0,0,f.width,f.height);
        crumbsarr[i].image(imagepath);
        if(cols[i] == 'file'){
            var fold = crumbsarr[i].group().move(50, Number(vb[3])-300).scale(0.5).fill('none');
            var folder = Group.findOne({_id: "8pmQarpMhMqeReis3"});
            var backgf = fold.rect(1024,1024).radius(512).fill('#cccccc').opacity(1);
            recursive_group_client(fold, folder);
        }
        else{
            var disect = crumbsarr[i].group().move(50, Number(vb[3])-300).scale(0.5).fill('none');
            var disector = Group.findOne({_id: "M8RdemnXdmHcJZKwi"});
            var backg = disect.rect(1024,1024).radius(512).fill('#cccccc').opacity(1);
            recursive_group_client(disect, disector);
        }
        crumbsarr[i].on('click', function(){
            i = this.attr("id").substring(this.attr("id").indexOf('_')+1);
            Session.set('browseParams', JSON.stringify({start:1, dim:dim, col: cols[i], id: path[i], buttons: params.buttons}));
        });
        y = y + f.height*scale + 20;
        gr[i].on('mouseover', function(){
            this.opacity(0.5);
        });
        gr[i].on('mouseout', function(){
            this.opacity(0.3);
        });
    }
    for(i in path)
        gr[i].cx(-maxwidth*scale/2 - 20)
}

editIt = function editIt(){
    var params = JSON.parse(Session.get('browseParams'));
    window.open('/'+ params.col +'m/'+Session.get("fileBIt"), '_blank');
}

viewIt = function viewIt(){
    var params = JSON.parse(Session.get('browseParams'));
    window.open('/'+ params.col +'/'+Session.get("fileBIt"), '_blank');
}

editCloneIt = function editCloneIt(){
    var params = JSON.parse(Session.get('browseParams'));
    if(params.col == 'file')
        cloneFile(Session.get("fileBIt"), function(res){window.open('/filem/'+res, '_blank');});
    else
        cloneGroupFile(Session.get("fileBIt"), function(res){window.open('/'+ params.col +'m/'+res, '_blank');});
}

browseIt = function browseIt(){
    var params = JSON.parse(Session.get('browseParams'));
    Session.set('browseParams', JSON.stringify({start:1, dim:params.dim, col: params.col, id: Session.get("fileBIt"), buttons: params.buttons}));
}

disectIt = function disectIt(){
    var params = JSON.parse(Session.get('browseParams'));
    var col = 'item';
    if(params.col == 'file')
        var col = 'group';
    else
        if(params.col == 'group')
            if(Group.find({groupId: Session.get("fileBIt")}).fetch().length > 0)
                var col = 'group';
    Session.set('browseParams', JSON.stringify({start:1, dim:params.dim, col: col, id: Session.get("fileBIt"), buttons: params.buttons}));
}

removeIt = function removeIt(){
    var params = JSON.parse(Session.get('browseParams'));
    if(params.col == 'file')
        removeFile(Session.get("fileBIt"));
    else
        if(params.col == 'group'){
            if(Group.findOne({_id: Session.get("fileBIt")}).fetch().length > 0)
                removeGroup(Session.get("fileBIt"));
            else
                Meteor.call('remove_document', 'Item', Session.get("fileBIt"));
        }
        else
            Meteor.call('remove_document', 'Item', Session.get("fileBIt"));
}