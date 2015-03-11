allfiles = {};

reloadFilebrowser = function(params){
    console.log('reloadFilebrowser');
    //SVG.get('fileBrowse').clear();
    SVG.get('browserContent').clear();
    if(!params.buttons)
        params.buttons = Session.get("fileButtons");
    browserContent(params);
    navButtons(params);
    fileBMenu();
    Session.set('fileId', params.id);
}

Template.filebrowse.rendered = function(){
    console.log('start');
    window.windowType = 'fileBrowser';
    $('body').css("background-color", "rgba(255, 255, 255, 0)");
    var start = Number(this.data.start);
    var dim = Number(this.data.dim);
    Session.set("fileButtons", this.data.buttons);
    var params = {start:start, dim:dim, col: this.data.col, id: this.data.id, buttons: this.data.buttons};
    Session.set('browseParams', JSON.stringify(params));
    var browser = SVG('fileBrowse'); 
    var browserContent = browser.group().attr('id', 'browserContent');
    defs = SVG.get('fileBrowse').defs();
    defs.attr("id", "defs");
    defs.group().attr('id','navdefs');
    defs.group().attr('id','navigation');

    this.autorun(function(){
        var params = JSON.parse(Session.get('browseParams'));
        console.log('start reloadFilebrowser')
        reloadFilebrowser(params);
        console.log('end reloadFilebrowser');
    });

    this.autorun(function(){
        var id = Session.get('fileId');
        if(SVG.get("Bcrumbs"))
            SVG.get("Bcrumbs").remove();
        console.log('start autorun crumbs')
        fileBcrumbs(id);
        console.log('end autorun crumbs');
    });

    this.autorun(function(){
       var win = Session.get("window");
       SVG.get('fileBrowse').attr({ "width": win.w, "height": win.h})
    });
}

browserContent = function(params){
    console.log('browserContent');
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
                //console.log(items);
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
    Session.set('parentDims', {w: parent.width, h: parent.height});
    //console.log(allfiles[params.id]);
    var files = allfiles[params.id].slice(start-1,dim*dim+start-1);
    //console.log(files);
    $('body').attr({"class": "no_scroll"}).css({margin:0,padding:0});
    var browser = SVG.get('fileBrowse'); 
    browser.viewbox(0,0,parent.width,parent.height);
    var browserContent = SVG.get('browserContent');
    var x, y=0;
    var svg=[],gr=[], bkg=[];
    var cols = [];
    for(var i = 0 ; i < files.length ; i++){
        if (i % dim == 0) {
            x = 0;
            y = y + parent.height/dim;
        }
        gr[i] = browserContent.group().attr("id", "group_"+i);
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
        bkg[i] = gr[i].rect(parent.width,parent.height).fill('#FFFFFF').attr('id','background_'+i).opacity(0);
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

        gr[i].on('mouseover', function(){
            var i = this.attr("id").substring(this.attr("id").lastIndexOf("_")+1);
            if(!params.buttons || params.buttons != 'nobuttons'){ 
                if(SVG.get("container_"+i))
                        SVG.get("container_"+i).show();
                else{
                    var vb = SVG.get('fileBrowse').attr("viewBox").split(" ");
                    var container = SVG.get('group_'+i).use(SVG.get('menu_defs')).attr("id", "container_"+i)
                    container.scale(0.8 * Number(vb[2]) / container.bbox().width);
                }
            }
            SVG.get("file_"+i).opacity(0.6);
            Session.set("fileBIt", SVG.get("file_"+i).attr("fileId"));
        })    
        gr[i].on('mouseout', function(){
            var i = this.attr("id").substring(this.attr("id").lastIndexOf("_")+1);
            if(SVG.get("container_"+i))
                SVG.get("container_"+i).hide();
            SVG.get("file_"+i).opacity(1);
        })
    }
    console.log('/browserContent');
}

navButtons = function(params){
    console.log('navButtons');
    var start = params.start;
    var dim = params.dim;
    var col = params.col;
    var browser = SVG.get('fileBrowse');
    var dims = Session.get('parentDims');
    console.log(dims);
    var nav = {}, bscale = 0.1;
    if(Math.ceil(start/(dim*dim)) == 1)
        nav.p = false;
    else
        nav.p = true;
    if(Math.ceil(allfiles[params.id].length / (dim*dim)) == 1 || Math.ceil(start/(dim*dim)) == Math.ceil(allfiles[params.id].length / (dim*dim)))
        nav.n = false;
    else
        nav.n = true;
    if(!nav.p)
        if(SVG.get('previousButtonUse'))
            SVG.get('previousButtonUse').remove();
    if(!nav.n)
        if(SVG.get('nextButtonUse'))
            SVG.get('nextButtonUse').remove();
    if(!nav.p && !nav.p){
        if(SVG.get('pagination'))
            SVG.get('pagination').remove();
        if(SVG.get('slider'))
            SVG.get('slider').remove();
    }

    if(nav.n){
        if(!SVG.get('nextButton')){
            var next = Group.findOne({_id: "Ka4qTJEBoLLLrmNK7"});
            var n = recursive_group_client(SVG.get('navigation'), next);
            n.attr('id', 'nextButton').attr({"dimsw":dims.w, "dimsh":dims.h});
            n.x(dims.w-20).y(dims.h-n.bbox().height*0.2);
            n.scale(bscale);
        }
        if(SVG.get('nextButtonUse'))
            SVG.get('nextButtonUse').remove();
        var n = SVG.get('fileBrowse').use(SVG.get('nextButton')).attr('id', 'nextButtonUse');
        n.opacity(0.1);
        n.x(dims.w-Number(SVG.get('nextButton').attr("dimsw"))).y(dims.h-Number(SVG.get('nextButton').attr("dimsh")));
        
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
        if(!SVG.get('previousButton')){
            var prev = Group.findOne({_id: "CrtnLmouQCC9eWWg8"});
            var p = recursive_group_client(SVG.get('navigation'), prev);
            p.attr('id', 'previousButton').attr({"dimsw":dims.w, "dimsh":dims.h});
            p.x(0-p.bbox().width*0.2).y(dims.h-p.bbox().height*0.2);
            p.scale(bscale);
        }
        if(SVG.get('previousButtonUse'))
            SVG.get('previousButtonUse').remove();
        var p = SVG.get('fileBrowse').use(SVG.get("previousButton"));
        p.opacity(0.1).attr('id', 'previousButtonUse');
        p.x(dims.w-Number(SVG.get('previousButton').attr("dimsw"))).y(dims.h-Number(SVG.get('previousButton').attr("dimsh")));

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
    if(nav.p || nav.n){
        if(!SVG.get('pagination'))
            var pages = browser.group().attr("id","pagination").opacity(0.3);
        var pages = SVG.get('pagination');
        pages.clear();
        var currentpg = Math.ceil(start/(dim*dim));
        var allpg = Math.ceil(allfiles[params.id].length / (dim*dim));
        pages.text(currentpg + '/' + allpg).move(dims.w+20, 20).font({size: 30, family: 'Sans-serif'}).attr('id', 'paginationtext');

        var st = 100
                , en = ((nav.p) ? SVG.get('previousButton').bbox().y : SVG.get('nextButton').bbox().y ) - 250
                , step = Math.floor((en - st) / allpg);
        console.log(en);
        console.log(step);
        if(!SVG.get('slider')){
            var slider = browser.group().attr('id', 'slider');
            var base = slider.group().attr('id', 'sliderbase');
            var st = 100
                , segs = []
                , slidex = dims.w+50
                , wd = SVG.get('browserContent').bbox().width / 65;

            for(var i = 0 ; i < allpg; i++){
                segs[i] = base.rect(wd , step).radius(wd/2).attr('id', 'base_'+i).move(slidex, st+step*i).fill('#cccccc').opacity(0.3);
                segs[i].on('mouseover', function(e){
                    this.opacity(0.7);
                    var page = Math.floor((this.cy() - st) / step)+1;
                    SVG.get('paginationtext').text(page + '/' + allpg);
                })
                segs[i].on('mouseout', function(e){
                    this.opacity(0.3);
                    var params = JSON.parse(Session.get('browseParams'));
                    SVG.get('paginationtext').text(Math.ceil(params.start/(params.dim*params.dim)) + '/' + allpg);
                })
                segs[i].on('click', function(e){
                    SVG.get('slidercontrol').cy(this.y()+this.height()/2);
                    var page = Math.floor((this.cy() - st) / step);
                    Session.set('browseParams', JSON.stringify({start: page*dim*dim+1, dim:dim, col: col, id: params.id, buttons: params.buttons}));
                })
            }
            var cw = wd*2;
            var sl = slider.circle(cw).center(slidex+wd/2, st+step/2).attr('id', 'slidercontrol').stroke({width:0}).fill('#000000').opacity(0.3).on('mouseover', function(){
                    this.opacity(0.5)
                }).on('mouseout', function(){
                    this.opacity(0.3)
                });

            sl.draggable({ minX: slidex+wd/2 - cw/2, maxX: slidex+wd/2 + cw/2, minY: st, maxY: en });
            var diff = 0;
            sl.on('dragstart', function(e){
                var invmatrix = SVG.get('slidercontrol').node.getCTM().inverse();
                var pp = transformPoint(this.cx(), this.cy(), [invmatrix]);
                diff = pp[1] - this.cy();
            })
            sl.on('dragmove', function(e){
                var invmatrix = SVG.get('slidercontrol').node.getCTM().inverse();
                var pp = transformPoint(this.cx(), this.cy(), [invmatrix]);
                this.cy(pp[1]-diff);
                var page = Math.floor((this.cy() - st) / step)+1;
                SVG.get('paginationtext').text(page + '/' + allpg);
            });
            sl.on('dragend', function(e){
                var page = Math.floor((this.cy() - st) / step);
                Session.set('browseParams', JSON.stringify({start: page*dim*dim+1, dim:dim, col: col, id: params.id, buttons: params.buttons}));
            });
        }
        else{
            SVG.get('slidercontrol').cy(st + step * (currentpg-1) + step/2);
        }
    }
    console.log('/navButtons');
}

fileBMenu = function(){
    console.log('fileBMenu');
    var params = JSON.parse(Session.get('browseParams'));
    var start = params.start, dim = params.dim, col = params.col, id = params.id;
    var browser = SVG.get('fileBrowse');
    var partfiles = allfiles[params.id].slice(start-1,dim*dim+start-1);

    if(!params.buttons || params.buttons != 'nobuttons'){
        if(!SVG.get('menu_defs')){
            console.log('create menu_defs')
            var each = Group.findOne({_id: "hBKYCaWAxHGkMLBYF"});
            var menu = SVG.get('defs').group().attr("id", "menu_defs")
            recursive_group_client(menu, each);
            console.log('/created menu_defs')
        }
        /*
        var ids= [];
        menu.each(function(j, children) {
            var id = this.attr("id");
            if(ids.indexOf(id) != -1){
                var index = ids.reduce(function(total,x){return x==id ? total+1 : total}, 0)
                this.attr("id", this.attr("id")+'_'+(index+1)+'ind');
            }
            ids.push(id);
            if(this.attr("id").lastIndexOf('_') == -1 || !Number(this.attr("id").substring(this.attr("id").lastIndexOf('_')+1)) )
                this.attr("id", this.attr("id")+'_0');
        }, true);*/
    }
    
    if(!SVG.get('navdefs'))
        navdefs = SVG.get('defs').group().attr('id','navdefs')
    if(!SVG.get('folder')){
        console.log('create folder')
        var foldergr = Group.findOne({_id: "8pmQarpMhMqeReis3"});
        folder = recursive_group_client(SVG.get('navdefs'), foldergr);
        folder.attr("id", 'folder');
        folder.first().first().first().fill('#59534d');
        console.log('/created folder')
    }
    if(!SVG.get('disector')){
        console.log('create disector')
        var disectorgr = Group.findOne({_id: "M8RdemnXdmHcJZKwi"});
        disector = recursive_group_client(SVG.get('navdefs'), disectorgr);
        disector.attr('id', 'disector');
        disector.first().first().first().fill('#59534d');
        console.log('/created disector')
    }
    var bscale = 0.3
    //for(i = 0; i < len; i++){
    for(i = 0; i < partfiles.length; i++){
        var vb = SVG.get('fileBrowse').attr("viewBox").split(" ");
        if(!params.buttons || params.buttons != 'nobuttons'){
            var gbox = SVG.get('group_'+i).bbox();
            var gm = SVG.get('group_'+i).transform();
            if(col == 'file'){
                if(partfiles[i].noofchildren > 0){
                    var fold = SVG.get("group_"+i).group().scale(bscale).fill('none');
                    //var backgf = fold.rect(1024,1024).radius(512).fill('#cccccc').opacity(0.6);
                    fold.use(SVG.get('folder'));
                    fold.rect(1024,1024).radius(512).fill('#cccccc').opacity(0.6);
                    fold.x(vb[2] - fold.bbox().width).y(vb[3] - fold.bbox().height);
                    fold.on('mouseover',function(){
                        this.opacity(0.6);
                    });
                    fold.on('mouseout',function(){
                        this.opacity(1);
                    })
                    fold.on('click',function(e){
                        browseIt();
                    });
                }
            }
            if(col == 'group'){
                var subs = Group.find({groupId: SVG.get("file_"+i).attr("fileId")}).count();
                if(subs == 0)
                    var subs = Item.find({groupId: SVG.get("file_"+i).attr("fileId")}).count()
            }
            if(col == 'file' || (col == 'group' && subs > 0)){
                var disect = SVG.get("group_"+i).group().scale(bscale).fill('none');
                //var backg = disect.rect(1024,1024).radius(512).fill('#cccccc').opacity(0.6);
                disect.use(SVG.get('disector')).attr('id', 'disectorUse_'+i);
                disect.rect(1024,1024).radius(512).fill('#cccccc').opacity(0.6);
                disect.y(vb[3] - disect.bbox().height);
                disect.on('mouseover',function(){
                    this.opacity(0.6);
                });
                disect.on('mouseout',function(){
                    this.opacity(1);
                })
                disect.on('click',function(e){
                    disectIt()
                });
            }
        }
    }
    console.log('/fileBMenu');
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
            var fold = gr[i].group().move(50, Number(vb[3])-300).scale(0.5).fill('none');
            var backgf = fold.rect(1024,1024).radius(512).fill('#cccccc').opacity(1);
            fold.use(SVG.get('folder'));
        }
        else{
            var disect = gr[i].group().move(50, Number(vb[3])-300).scale(0.5).fill('none');
            var backg = disect.rect(1024,1024).radius(512).fill('#cccccc').opacity(1);
            disect.use(SVG.get('disector'));
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
    console.log('/fileBcrumbs');
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
    if(Meteor.userId()){
        var params = JSON.parse(Session.get('browseParams'));
        if(params.col == 'file')
            cloneFile(Session.get("fileBIt"), function(res){window.open('/filem/'+res, '_blank');});
        else
            cloneGroupFile(Session.get("fileBIt"), function(res){window.open('/'+ params.col +'m/'+res, '_blank');});
    }
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
    if(File.findOne({_id: Session.get("fileBIt")}).creatorId == Meteor.userId() || Meteor.user().profile.role == 'admin'){
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
}