allfiles = {};
countB = 0;
bscale = 0.1;
noedit = 'JZXXMo5N38iwgfNAG'

reloadFilebrowser = function(params){
    console.log('reloadFilebrowser');
    console.log(allfiles[Session.get('browseParams').id])
    if(allfiles[Session.get('browseParams').id]){
        SVG.get('browserContent').clear();
        console.log(params)
        //if(!params.buttons)
        //    params.buttons = Session.get("fileButtons");
        browserContent(params);
        navButtons(params);
        fileBMenu();
    }
}

Template.filebrowse.onRendered(function(){
    console.log('start');
    var self = this;
    countB = 0;

    if(!window.windowType)
        window.windowType = 'fileBrowser';
    $('body').css("background-color", "rgba(255, 255, 255, 0)");
    var start = Number(this.data.start);
    var dim = Number(this.data.dim);
    console.log(this.data.buttons)
    console.log(this.data.id)
    if(!this.data.buttons){
        Session.set('defaultButtons', 'buttons');
        if(noedit.indexOf(this.data.id) != -1)
            this.data.buttons = 'nobuttons'
    }
    else
        Session.set('defaultButtons', 'nobuttons')
    Session.set('fileBId', {id: this.data.id, col: this.data.col});
    //Session.set("fileButtons", this.data.buttons);
    Session.set("fileBCallback", this.data.callback);
    var params = {start:start, dim:dim, col: this.data.col, id: this.data.id, buttons: this.data.buttons, login: this.data.login};
    Session.set('browseParams', {start:start, dim:dim, col: this.data.col, id: this.data.id, buttons: this.data.buttons, login: this.data.login});
    //var browser = SVG('fileBrowse'); 
    var browser = SVG('filebrowsediv')
    browser.attr('id', 'fileBrowse');
    var browserContent = browser.group().attr('id', 'browserContent');
    defs = SVG.get('fileBrowse').defs();
    defs.attr("id", "defs");
    defs.group().attr('id','navdefs');
    defs.group().attr('id','navigation');
    if(this.data.login){ 
        Blaze.render(Template.login, document.getElementById('logintemplatediv'));
    }

    self.autorun(function(){
        var dims = Session.get('parentDims')
    })


    self.autorun(function(){
        var p = Session.get('fileBId');     
        if(p.id == 'PRRyiPWSw8xj82T8F')
            self.subscribe('userWork', function(){
                console.log('userWork')
                console.log(File.find().fetch())
            })
        self.subscribe('filebrowse', p.id, p.col);
    })

    self.autorun(function(){
        var deps = Dependency.find({fileId2: Session.get('fileBId').id}).fetch();
        console.log('deps autorun');
        console.log(deps);
        if(deps.length > 0){
            var params = Session.get('browseParams');
            var fileBId = Session.get('fileBId');

            var idss = [];
            for(var d in deps)
                idss.push(deps[d].fileId1);
            console.log(idss);
            var data = File.find({_id: {$in: idss}}, {sort: {dateModified: -1}}).fetch();
            console.log(data)
            if(data.length > 0){
                allfiles = {};
                allfiles[fileBId.id] = data;

                console.log(allfiles[fileBId.id]);
                
                if(params.id != fileBId.id){
                    params.id = fileBId.id;
                    params.col = fileBId.col;
                    params.start = 1;
                    Session.set('browseParams', params);
                }
                else{
                    console.log('start reloadFilebrowser');
                    reloadFilebrowser(params);
                    console.log('end reloadFilebrowser');
                }
            }
        }
    })

    self.autorun(function(){
        var data = File.find({$and: [{creatorId: Meteor.userId()}, {fileType: 'image/svg+xml'}]}, {sort: {dateModified: -1}}).fetch();
        if(data.length > 0 && Session.get('fileBId').id == 'PRRyiPWSw8xj82T8F'){
            console.log('yes ' + JSON.stringify(Session.get('fileBId')));
            var params = Session.get('browseParams');
            var fileBId = Session.get('fileBId');
            allfiles = {};
            allfiles[fileBId.id] = data;      

            console.log(allfiles[fileBId.id]);
            
            if(params.id != fileBId.id){
                params.id = fileBId.id;
                params.col = fileBId.col;
                params.start = 1;
                Session.set('browseParams', params);
            }
            else{
                console.log('start reloadFilebrowser');
                reloadFilebrowser(params);
                console.log('end reloadFilebrowser');
            }
        }
    })

    self.autorun(function () {
        var gr = Group.findOne({$or: [{_id: Session.get('fileBId').id}, {fileId: Session.get('fileBId').id} ]});
        console.log('allfiles group/item')
        console.log(gr);
        if(Dependency.find({fileId2: Session.get('fileBId').id}).fetch().length == 0){
            var fileBId = Session.get('fileBId');
            var params = Session.get('browseParams');
            var data = [];
            if(fileBId.col == 'group'){
                if(Group.findOne({_id: fileBId.id}))
                    var q = {groupId: fileBId.id};
                else
                    var q = {fileId: fileBId.id}
                console.log(q);
                data = Group.find(q, {sort: {ordering: 1}}).fetch();
                console.log(data);
      
                 //var items = Item.find({groupId: params.id}, {sort: {ordering: 1}}).fetch();
                //console.log(items);
                //if(items.length > 0){
                //    var lim = allfiles[params.id].length;
                //    allfiles[params.id] = allfiles[params.id].concat(items);
                //}
            }
            else if(fileBId.col == 'item'){
                data = Item.find({groupId: fileBId.id}, {sort: {ordering: 1}}).fetch();
                console.log(data);
            }

            if(data.length > 0){
                allfiles = {};
                allfiles[fileBId.id] = data;

                console.log(allfiles[fileBId.id]);
                
                if(params.id != fileBId.id){
                    params.id = fileBId.id;
                    params.col = fileBId.col;
                    params.start = 1;
                    Session.set('browseParams', params);
                }
                else{
                    console.log('start reloadFilebrowser');
                    reloadFilebrowser(params);
                    console.log('end reloadFilebrowser');
                }
            }
        }
    })

    self.autorun(function(){
        var params = Session.get('browseParams');
        console.log(params);
        if(Session.get('fileBId') && params.id == Session.get('fileBId').id){
            console.log('start reloadFilebrowser');
            reloadFilebrowser(params);
            console.log('end reloadFilebrowser');
        }
    });
    self.autorun(function(){
        var data = allfiles[Session.get('fileBId').id];
        console.log(allfiles);
        console.log(Session.get('fileBId'))
        console.log('hereeeeee')
        console.log(data)
        if(data){
            if(SVG.get("Bcrumbs"))
                SVG.get("Bcrumbs").remove();
            console.log('start autorun crumbs')
            fileBcrumbs(Session.get('fileBId').id);
            console.log('end autorun crumbs');
        }
    })

    self.autorun(function(){
       var win = Session.get("window");
       SVG.get('fileBrowse').attr({ "width": win.w, "height": win.h})
    });
})

Template.filebrowse.events({
    'click .filegroup': function(e,t){
        console.log('click file')
        if(e.target.getAttribute('id').indexOf('container_') == -1){
            var id = e.currentTarget.getAttribute('id');
            var i = Number(id.substring(id.lastIndexOf("_")+1));
            var fileId = SVG.get("file_"+i).attr("fileId")
            if(File.findOne({_id: fileId}).noofchildren > 0 || fileId == 'PRRyiPWSw8xj82T8F'){
                console.log('other subscription');
                var params = Session.get('browseParams');
                var defaultButtons = Session.get('defaultButtons');
                if(params.buttons != defaultButtons){
                    if(defaultButtons == 'buttons')
                        params.buttons = undefined
                    else
                        params.buttons = defaultButtons;
                    Session.set('browseParams', params);
                }
                Session.set('fileBId', {id: fileId, col: SVG.get("file_"+i).attr("col")});
            }
            else if(window.windowType == 'svgEditor' || window.parent.windowType == 'svgEditor')
                window.parent[Session.get("fileBCallback")](SVG.get("file_"+i).attr("fileId"));
            else if(fileId == 'w7kkK7GvdDWz29Bdz')
                window.open('/md/tutorial', '_blank'); //tutorial
            else if(fileId == 'mmZmkPGbRDEhuBg5p')
                window.open('/filem/eGfQyh6jCqxeEYmex', '_blank');//playground
            else if(fileId == 'AXPzGY3BcQdNCXMyC')
                window.open('https://github.com/loredanacirstea/meteor-svg-app', '_blank'); //github
            else if(fileId == "37u7npbMF6NvccC6u")
                window.open('/md/AboutOroboro', '_blank');//about us
        }
        console.log('/click file')   
    }
})

browserContent = function(params){
    console.log('browserContent');
    var start = params.start,
        dim = params.dim,
        col = params.col,
        parent;

    console.log(params)
    console.log(File.findOne({_id: params.id}))
    if(col == 'file')
        parent = File.findOne({_id: params.id});
    else{
        var path = getElementPath(params.id);
        parent = File.findOne({_id: path[path.length-1]});
    }
    console.log(parent);
    Session.set('parentDims', {w: parent.width, h: parent.height});
    console.log(allfiles[params.id]);
    var files = allfiles[params.id].slice(start-1,dim*dim+start-1);
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
        gr[i] = browserContent.group().attr("id", "group_"+i).attr('class', 'filegroup');
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
        svg[i] = gr[i].nested().attr("id", "file_"+i).attr("fileId", f._id).attr('col', cols[i]);
        if(dim != 1)
            svg[i].rect(f.width,f.height).fill('#FFFFFF');
        if(dim != 1)
            gr[i].rect(parent.width,parent.height).attr({rx:100,ry:100, strokeWidth:6,stroke:"#000"}).fill('none');
        svg[i].attr({preserveAspectRatio: "xMidYMid meet"})
        svg[i].viewbox(0,0,f.width,f.height);
        svg[i].image(imagepath); 
        bkg[i] = gr[i].rect(parent.width,parent.height).fill('#FFFFFF').attr('id','background_'+i).opacity(0);
        x=x+parent.width/dim;
        gr[i].on('mouseover', function(){
            var i = this.attr("id").substring(this.attr("id").lastIndexOf("_")+1);
            if(!params.buttons || params.buttons != 'nobuttons'){ 
                if(SVG.get("container_"+i))
                        SVG.get("container_"+i).show();
                else{
                    var vb = SVG.get('fileBrowse').attr("viewBox").split(" ");
                    var container = SVG.get('group_'+i).use(SVG.get('menu_defs')).attr("id", "container_"+i)
                    //container.scale(0.8 * Number(vb[2]) / container.bbox().width);
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
    console.log(File.find({_id:"eAywEx5e5cNwe6BpC"}).fetch())
    var start = params.start;
    var dim = params.dim;
    var col = params.col;
    var browser = SVG.get('fileBrowse');
    var dims = Session.get('parentDims');
    console.log(dims);
    var nav = {};
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
            n = SVG.get('navigation').image('/file/menuItemNext').loaded(function(loader) {
                this.size(loader.width*bscale, loader.height*bscale);
                this.x(dims.w).y(dims.h-loader.height*bscale);
                console.log(this.x());
                console.log(dims.w);
            })
            n.attr('id', 'nextButton').attr({"dimsw":dims.w, "dimsh":dims.h});
        }
        if(SVG.get('nextButtonUse'))
            SVG.get('nextButtonUse').remove();
        var n = SVG.get('fileBrowse').use(SVG.get('nextButton')).attr('id', 'nextButtonUse');
        n.opacity(0.1);
        
        n.on('click', function(event){
            var ini = start+dim*dim;
            Session.set('browseParams', {start:ini, dim:dim, col: col, id: params.id, buttons: params.buttons, login: params.login});
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
            p = SVG.get('navigation').image('/file/menuItemPrevious').loaded(function(loader) {
                this.size(loader.width*bscale, loader.height*bscale)
                this.x(0-loader.width*bscale).y(dims.h-loader.height*bscale);
            })
            p.attr('id', 'previousButton').attr({"dimsw":dims.w, "dimsh":dims.h});
        }
        if(SVG.get('previousButtonUse'))
            SVG.get('previousButtonUse').remove();
        var p = SVG.get('fileBrowse').use(SVG.get("previousButton"));
        p.opacity(0.1).attr('id', 'previousButtonUse');

        p.on('click', function(event){
            var ini = start-dim*dim;
            if(ini > 0){
                Session.set('browseParams', {start:ini, dim:dim, col: col, id: params.id, buttons: params.buttons, login: params.login});
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
        console.log(allfiles[params.id]);
        console.log(allpg);
        pages.text(currentpg + '/' + allpg).move(dims.w+20, 20).font({size: 30, family: 'Sans-serif'}).attr('id', 'paginationtext');

        var st = 100
                , en = dims.h - 250
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
                    var params = Session.get('browseParams');
                    SVG.get('paginationtext').text(Math.ceil(params.start/(params.dim*params.dim)) + '/' + allpg);
                })
                segs[i].on('click', function(e){
                    SVG.get('slidercontrol').cy(this.y()+this.height()/2);
                    var page = Math.floor((this.cy() - st) / step);
                    Session.set('browseParams', {start: page*dim*dim+1, dim:dim, col: col, id: params.id, buttons: params.buttons, login: params.login});
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
                Session.set('browseParams', {start: page*dim*dim+1, dim:dim, col: col, id: params.id, buttons: params.buttons, login: params.login});
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
    console.log(File.find({_id:"eAywEx5e5cNwe6BpC"}).fetch())
    var params = Session.get('browseParams');
    var start = params.start, dim = params.dim, col = params.col, id = params.id;
    var browser = SVG.get('fileBrowse');
    var partfiles = allfiles[params.id].slice(start-1,dim*dim+start-1);
    var bscale = 0.16;

    if(!params.buttons || params.buttons != 'nobuttons'){
        if(!SVG.get('menu_defs')){
            console.log('create menu_defs')
            var menu = SVG.get('defs').group().attr("id", "menu_defs")
            var border = 100;

            var menuBclone = menu.group().attr('id', 'menuItemClone').opacity(0.7);
            var backgC = menuBclone.rect(20,30).fill('#59534d').opacity(0.7);
            var imgC = menuBclone.image('/file/menuItemClone').loaded(function(loader) {
                    this.size(loader.width*bscale, loader.height*bscale);
                    this.x(border).y(loader.height*bscale/2);
                    backgC.size(loader.width*bscale, loader.height*bscale).x(border).y(loader.height*bscale/2).fill('#59534d')
                }).front();
            imgC.on('mouseover', function(event){
                    this.parent.opacity(1);
                }).on('mouseout', function(event){
                    this.parent.opacity(0.7);
                }).mousedown(function(){
                    console.log('mousedown img');
                    editCloneIt()
                });


            menuBexport = menu.group().attr('id', 'menuItemExport').opacity(0.7);
            var backgEx = menuBexport.rect(20,30).fill('#59534d').opacity(0.7);
            menuBexport.image('/file/menuItemExport').loaded(function(loader) {
                    this.size(loader.width*bscale, loader.height*bscale)
                    this.x(border+loader.width*bscale).y(loader.height*bscale/2);
                    backgEx.size(loader.width*bscale, loader.height*bscale).x(border+loader.width*bscale).y(loader.height*bscale/2).fill('#59534d')
                }).front();

            menuBdelete = menu.group().attr('id', 'menuItemDelete').opacity(0.7);
            var backgD = menuBdelete.rect(20,30).fill('#59534d').opacity(0.7);
            menuBdelete.image('/file/menuItemDelete').loaded(function(loader) {
                    this.size(loader.width*bscale, loader.height*bscale)
                    this.x(border+loader.width*bscale*2).y(loader.height*bscale/2);
                    backgD.size(loader.width*bscale, loader.height*bscale).x(border+loader.width*bscale*2).y(loader.height*bscale/2).fill('#59534d')
                }).front().on('mouseover', function(event){
                    this.parent.opacity(1);
                }).on('mouseout', function(event){
                    this.parent.opacity(0.7);
                }).mousedown(function(){
                    console.log('mousedown img');
                    removeIt()
                });

            menuBedit = menu.group().attr('id', 'menuItemEdit').opacity(0.7);
            var backgE = menuBedit.rect(20,30).fill('#59534d').opacity(0.7);
            menuBedit.image('/file/menuItemEdit').loaded(function(loader) {
                    this.size(loader.width*bscale, loader.height*bscale)
                    this.x(border+loader.width*bscale*3).y(loader.height*bscale/2);
                    backgE.size(loader.width*bscale, loader.height*bscale).x(border+loader.width*bscale*3).y(loader.height*bscale/2)
                }).front().on('mouseover', function(event){
                    this.parent.opacity(1);
                }).on('mouseout', function(event){
                    this.parent.opacity(0.7);
                }).mousedown(function(){
                    console.log('mousedown img');
                    editIt()
                });
            
            var menuBview = menu.group().attr('id', 'menuItemView').opacity(0.7);
            var backgV = menuBview.rect(20,30).fill('#59534d').opacity(0.7);
            var imgV = menuBview.image('/file/menuItemSearch').loaded(function(loader) {
                    this.size(loader.width*bscale, loader.height*bscale)
                    this.x(border+loader.width*bscale*4).y(loader.height*bscale/2);
                    backgV.size(loader.width*bscale, loader.height*bscale).x(border+loader.width*bscale*4).y(loader.height*bscale/2);
                }).front();
            imgV.on('mouseover', function(event){
                    this.parent.opacity(1);
                }).on('mouseout', function(event){
                    this.parent.opacity(0.7);
                }).mousedown(function(){
                    console.log('mousedown img');
                    viewIt()
                });

            console.log('/created menu_defs')
        }
    }
    
    if(!SVG.get('navdefs'))
        navdefs = SVG.get('defs').group().attr('id','navdefs')
    if(!params.buttons || params.buttons != 'nobuttons'){
        if(!SVG.get('folder')){
            console.log('create folder')
            var folder = SVG.get('navdefs').image('/file/menuItemFolder').loaded(function(loader) {
                this.size(loader.width, loader.height)
            })
            folder.attr("id", 'folder').on('click', function(){
                browseIt();
            });
            console.log('/created folder')
        }
        if(!SVG.get('disector')){
            console.log('create disector')
            var disector = SVG.get('navdefs').image('/file/menuItemDisector').loaded(function(loader) {
                this.size(loader.width, loader.height)
            })
            disector.attr('id', 'disector').on('click', function(){
                disectIt();
            });;
            console.log('/created disector')
        }
    }
    //for(i = 0; i < len; i++){
    for(i = 0; i < partfiles.length; i++){
        var vb = SVG.get('fileBrowse').attr("viewBox").split(" ");
        if(!params.buttons || params.buttons != 'nobuttons'){
            var gbox = SVG.get('group_'+i).bbox();
            var gm = SVG.get('group_'+i).transform();
            if(col == 'file'){
                if(partfiles[i].noofchildren > 0){
                    var fold = SVG.get("group_"+i).group().scale(bscale).fill('none');
                    fold.use(SVG.get('folder'));
                    fold.rect(1024,1024).radius(512).fill('#59534d').opacity(0.6);
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
                disect.use(SVG.get('disector')).attr('id', 'disectorUse_'+i);
                disect.rect(1024,1024).radius(512).fill('#59534d').opacity(0.6);
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
    var params = Session.get('browseParams');
    var start = params.start, dim = params.dim, col = params.col, id = params.id;
    if(col == "file"){
        var parent = File.findOne({_id: fileid});
        //var path = getDependencyPath(id);
        //path.splice(0,0, {fileId2: id});
        var path = parent.structuralpath;
    }
    else{
        var path2 = getElementPath(fileid);
        var parent = File.findOne({_id: path2[path2.length-1]});
        //var path = getDependencyPath(parent._id);
        var path = parent.structuralpath;
        //path2[path2.length-1] = {fileId2: path2[path2.length-1]};
        path = path2.concat(path);
        console.log(path2);
        var lim = path2.length-2;
    }
    console.log(path);
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
            var f = File.findOne({_id: path[i]})//["fileId2"]});
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
        if(!params.buttons || params.buttons != 'nobuttons'){
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
        }
        crumbsarr[i].on('click', function(){
            i = this.attr("id").substring(this.attr("id").indexOf('_')+1);
            console.log(path[i]);
            if(noedit.indexOf(path[i]) != -1){
                Session.set('defaultButtons', 'buttons');
                var params = Session.get('browseParams')
                params.buttons = 'nobuttons'
                params.id = path[i]
                Session.set('browseParams', params);
            }
            Session.set('fileBId', {id: path[i], col: cols[i]});
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
    var params = Session.get('browseParams');
    if(params.col == 'file')
        window.open('/'+ params.col +'m/'+Session.get("fileBIt"), '_blank');
    //else
        
}

viewIt = function viewIt(){
    var params = Session.get('browseParams');
    window.open('/'+ params.col +'/'+Session.get("fileBIt"), '_blank');
}

editCloneIt = function editCloneIt(){
    console.log('editCloneItstart')
    if(Meteor.userId()){
        console.log(Meteor.userId());
        var params = Session.get('browseParams');
        if(params.col == 'file')
            cloneFile(Session.get("fileBIt"), function(res){window.open('/filem/'+res, '_blank');});
        else
            cloneGroupFile(Session.get("fileBIt"), function(res){window.open('/filem/'+res, '_blank');});
    }
}

browseIt = function browseIt(){
    var params = Session.get('browseParams');
    var defaultButtons = Session.get('defaultButtons');
    if(params.buttons != defaultButtons){
        params.buttons = defaultButtons;
        Session.set('browseParams', params);
    }
    Session.set('fileBId', {id: Session.get('fileBIt'), col: params.col});
}

disectIt = function disectIt(){
    var params = Session.get('browseParams');
    var col = 'item';
    if(params.col == 'file')
        var col = 'group';
    else
        if(params.col == 'group')
            if(Group.find({groupId: Session.get("fileBIt")}).fetch().length > 0)
                var col = 'group';

    //Session.set('browseParams', {start:1, dim:params.dim, col: col, id: Session.get("fileBIt"), buttons: params.buttons});

    Session.set('fileBId', {id: Session.get('fileBIt'), col: col});

}

removeIt = function removeIt(){
    if(File.findOne({_id: Session.get("fileBIt")}).creatorId == Meteor.userId() || Meteor.user().profile.role == 'admin'){
        var params = Session.get('browseParams');
        if(params.col == 'file')
            removeFile(Session.get("fileBIt"));
        else
            if(params.col == 'group'){
                if(Group.findOne({_id: Session.get("fileBIt")}).fetch().length > 0)
                    removeGroup(Session.get("fileBIt"), true);
                else
                    removeItem(Session.get("fileBIt"));
            }
            else
                removeItem(Session.get("fileBIt"));
    }
}