countB = 0;
bscale = 0.1;
noedit = 'JZXXMo5N38iwgfNAG'
subsConfig = {
    cacheLimit: 40,
    expireIn: 20 //minutes
}
FileSubs = new SubsManager(subsConfig);
vips = global_oro_variables.vips;
op = {
  navBefore: 0.2,
  navAfter: 0.5
}
redirect = function(params) {
  //console.log('params', JSON.stringify(params));
  Router.go('/browse/file/' + params.id + '/' + params.start + '/' + params.dim + ( params.buttons || '' ));
}

Template.filebrowse.onCreated(function() {
  var self = this;
  this.files = new ReactiveVar();
  this.subs = {};
  this.menuDefsVals = {
    vips: [],
    anon: ['menuItemExport', 'menuItemSearch'],
    logged: ['menuItemEdit', 'menuItemClone', 'menuItemDelete', 'menuItemExport', 'menuItemSearch']
  }
  this.menuDefs = new ReactiveVar();

  this.autorun(function() {
    var data = Template.currentData();
    if(data) {
      var start = parseInt(data.start),
        dim = parseInt(data.dim);

      self.subs.filepublish = FileSubs.subscribe('filepublish', data.id);
      self.subs.fileParents = FileSubs.subscribe('fileParents', data.id);
      self.subs.fileRelated = FileSubs.subscribe('fileRelated', data.id);

      if(self.subs.fileKids) {
        self.subs.fileKids.stop();
      }
      if(data.id != vips.myWork) {
        self.subs.fileKids = Meteor.subscribe('fileKids', data.id, {skip: (start - 1) * dim*dim, limit: dim*dim });
      }
      else {
        self.subs.fileKids = Meteor.subscribe('userWork', 'image/svg+xml', (start - 1) * dim*dim, dim*dim);

      }
    }
  });
});

Template.filebrowse.onRendered(function(){
    var self = this;
    countB = 0;

    if(!window.windowType)
        window.windowType = 'fileBrowser';
    $('body').css("background-color", "rgba(255, 255, 255, 0)");
    var start = Number(this.data.start);
    var dim = Number(this.data.dim);
    if(!this.data.buttons){
        Session.set('defaultButtons', 'buttons');
        if(noedit.indexOf(this.data.id) != -1)
            this.data.buttons = 'nobuttons'
    }
    else
        Session.set('defaultButtons', 'nobuttons')

    Session.set("fileBCallback", this.data.callback);
    var browser = SVG('filebrowsediv')
    browser.attr('id', 'fileBrowse');
    var browserContent = browser.group().attr('id', 'browserContent');
    defs = SVG.get('fileBrowse').defs();
    defs.attr("id", "defs");
    defs.group().attr('id','navdefs');
    defs.group().attr('id','navigation');
    var crumbs = browser.group().attr("id", "Bcrumbs");
    if(this.data.login){
        Blaze.render(Template.login, document.getElementById('logintemplatediv'));
    }

    self.autorun(function(){
       var win = Session.get("window");
       SVG.get('fileBrowse').attr({ "width": win.w, "height": win.h})
    });

    this.autorun(function() {
      var ready = self.subs.fileKids.ready();
      var fready = self.subs.filepublish.ready();

      if(ready && fready) {
        var data = self.data;
        data.start = parseInt(data.start);
        data.dim = parseInt(data.dim);

        if(data.id != vips.myWork) {
          var files = Dependency.find({fileId2: Template.currentData().id, type:1})
            .map(function(dep) {
              return File.findOne({_id: dep.fileId1});
            });
        }
        else {
          var files = File.find({$and: [{creatorId: Meteor.userId()}, {fileType:'image/svg+xml'}]}, {sort: {dateModified: -1}}).fetch();
        }

        SVG.get('browserContent').clear();

        showBrowserContent(self.data, files);
        navButtons(self.data, files);
        fileBMenu(self.data, files);
        self.files.set(files);
      }
    });

    this.autorun(function() {
      var ready = self.subs.fileParents.ready();
      if(ready) {
        console.log('fileParents ready');
        SVG.get('Bcrumbs').clear()
        fileBcrumbs(self.data);
      }
    });

    this.autorun(function() {
      var userId = Meteor.userId();
      var files = self.files.get();
      console.log('userId', userId);
      if(files) {
        if(SVG.get('menu_defs')) {
          SVG.get('menu_defs').remove();
        }
        fileBMenu(self.data, files);
      }
    });
})

Template.filebrowse.events({
    'click .filegroup': function(e,t){
        console.log('click file')
        if(e.target.getAttribute('id').indexOf('container_') == -1 && e.target.tagName != 'use'){
            var id = e.currentTarget.getAttribute('id');
            var i = Number(id.substring(id.lastIndexOf("_")+1));
            var fileId = SVG.get("file_"+i).attr("fileId")
            if(File.findOne({_id: fileId}).noofchildren > 0 || fileId == vips.myWork){
                console.log('other subscription');
                var params = t.data;
                var defaultButtons = Session.get('defaultButtons');
                if(params.buttons != defaultButtons){
                    if(defaultButtons == 'buttons')
                        params.buttons = undefined
                    else
                        params.buttons = defaultButtons;
                }
                params.id = fileId
                params.col = SVG.get("file_"+i).attr("col")
                params.start = 1

                redirect(params);
            }
            else if(window.windowType == 'svgEditor' || window.parent.windowType == 'svgEditor')
                window.parent[Session.get("fileBCallback")](SVG.get("file_"+i).attr("fileId"));
            else if(fileId == vips.tutorial)
                window.open('/md/tutorial', '_blank'); //tutorial
            else if(fileId == vips.playground)
                window.open('/filem/eGfQyh6jCqxeEYmex', '_blank');//playground
            else if(fileId == vips.development)
                window.open('https://github.com/oro8oro/oroboro', '_blank'); //github
            else if(fileId == vips.about)
                window.open('/md/AboutOroboro', '_blank');//about us
        }
        console.log('/click file')
    }
})

showBrowserContent = function(params, files){
    console.log('browserContent');
    var start = params.start,
        dim = params.dim,
        col = params.col,
        parent;
        console.log('col', col)
    if(col == 'file')
        parent = File.findOne({_id: params.id});
    else{
        var path = getElementPath(params.id);
        parent = File.findOne({_id: path[path.length-1]});
    }
    console.log('parent', parent)
    Session.set('parentDims', {w: parent.width, h: parent.height});

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
        /*if(files[i].svg) {
          svg[i].nested().svg(files[i].svg)
        }
        else {
          Meteor.call('setSvg', files[i]._id);
        }*/
        bkg[i] = gr[i].rect(parent.width,parent.height).fill('#FFFFFF').attr('id','background_'+i).opacity(0);
        x=x+parent.width/dim;
        gr[i].on('mouseover', function(){
            var i = this.attr("id").substring(this.attr("id").lastIndexOf("_")+1);
            if(!params.buttons || params.buttons != 'nobuttons'){
                if(SVG.get("container_"+i))
                        SVG.get("container_"+i).show();
                else{
                    var vb = SVG.get('fileBrowse').attr("viewBox").split(" ");
                    var container = SVG.get('group_'+i).group()
                      .attr("id", "container_"+i);

                    SVG.get('menu_defs').children().forEach(function(k) {
                      var clone = container.use(k);
                      clone.on('click', function() {
                        var name = k.attr('data-action');
                        console.log('name', name);
                        window[name](params);
                      });
                    });
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

navButtons = function(params, files){
    console.log('navButtons', JSON.stringify(params));

    var start = params.start;
    var dim = params.dim;
    var browser = SVG.get('fileBrowse');
    var dims = Session.get('parentDims');
    var allfileslength = File.findOne(params.id).noofchildren;

    var nav = {};
    if(start == 1)
        nav.p = false;
    else
        nav.p = true;

    if(Math.ceil(allfileslength / (dim*dim)) == 1 || start == Math.ceil(allfileslength / (dim*dim)))
        nav.n = false;
    else
        nav.n = true;
    if(!nav.p && SVG.get('previousButtonUse'))
      SVG.get('previousButtonUse').remove();
    if(!nav.n && SVG.get('nextButtonUse'))
      SVG.get('nextButtonUse').remove();
    if(!nav.p && !nav.p) {
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

            })
            n.attr('id', 'nextButton').attr({"dimsw":dims.w, "dimsh":dims.h});
        }
        if(SVG.get('nextButtonUse'))
            SVG.get('nextButtonUse').remove();
        var n = SVG.get('fileBrowse').use(SVG.get('nextButton')).attr('id', 'nextButtonUse');
        n.opacity(op.navBefore);

        n.on('click', function(event){
          console.log('n on click', params.start, JSON.stringify(params));
            params.start += 1;
            redirect(params);
        })
        n.on('mouseover', function(event){
            this.opacity(op.navAfter);
        })
        n.on('mouseout', function(event){
            this.opacity(op.navBefore);
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
        p.opacity(op.navBefore).attr('id', 'previousButtonUse');

        p.on('click', function(event){
          params.start -= 1;
          console.log('prev click', JSON.stringify(params));
            if(params.start > 0){
              redirect(params);
            }
        })
        p.on('mouseover', function(event){
            this.opacity(op.navAfter);
        })
        p.on('mouseout', function(event){
            this.opacity(op.navBefore);
        })
    }
    if(nav.p || nav.n){
        if(!SVG.get('pagination'))
            var pages = browser.group().attr("id","pagination").opacity(0.3);
        var pages = SVG.get('pagination');
        pages.clear();
        var allpg = Math.ceil(allfileslength / (dim*dim));

        pages.text(start + '/' + allpg).move(dims.w+20, 20).font({size: 30, family: 'Sans-serif'}).attr('id', 'paginationtext');

        var st = 100
                , en = dims.h - 250
                , step = Math.floor((en - st) / allpg);

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
                    SVG.get('paginationtext').text(params.start + '/' + allpg);
                })
                segs[i].on('click', function(e){
                    SVG.get('slidercontrol').cy(this.y()+this.height()/2);
                    var page = Math.floor((this.cy() - st) / step) + 1;
                    params.start = page;
                    redirect(params);
                })
            }
            var cw = wd*2;
            var sliderstarty = st+step/2 + step*(params.start-1);
            var sl = slider.circle(cw).center(slidex+wd/2, sliderstarty).attr('id', 'slidercontrol').stroke({width:0}).fill('#000000').opacity(0.3).on('mouseover', function(){
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
                var page = Math.floor((this.cy() - st) / step) + 1;
                params.start = page;
                redirect(params);
            });
        }
        else{
            SVG.get('slidercontrol').cy(st + step * (start-1) + step/2);
        }
    }
    console.log('/navButtons');
}

fileBMenu = function(params, files){
    console.log('fileBMenu');

    var start = params.start, dim = params.dim, col = params.col, id = params.id;
    var browser = SVG.get('fileBrowse');
    var bscale = 0.16;

    if(!params.buttons || params.buttons != 'nobuttons'){
        if(!SVG.get('menu_defs')){
            console.log('create menu_defs')
            var menu = SVG.get('defs').group().attr("id", "menu_defs")
            var border = 100, skipx = 0;

            if(Meteor.userId()){
                menuBedit = menu.group()
                  .attr('id', 'menuItemEdit')
                  .opacity(0.7)
                  .attr('data-action', 'editIt');
                var backgE = menuBedit.rect(20,30).fill('#59534d').opacity(0.7);
                menuBedit.image('/file/menuItemEdit').loaded(function(loader) {
                        this.size(loader.width*bscale, loader.height*bscale)
                        this.x(border).y(loader.height*bscale/2);
                        backgE.size(loader.width*bscale, loader.height*bscale).x(border).y(loader.height*bscale/2)
                    }).front().on('mouseover', function(event){
                        this.parent.opacity(1);
                    }).on('mouseout', function(event){
                        this.parent.opacity(0.7);
                    }).mousedown(function(){
                        console.log('mousedown img');
                        editIt(params)
                    });

                var menuBclone = menu.group()
                  .attr('id', 'menuItemClone')
                  .opacity(0.7)
                  .attr('data-action', 'editCloneIt');
                var backgC = menuBclone.rect(20,30).fill('#59534d').opacity(0.7);
                var imgC = menuBclone.image('/file/menuItemClone').loaded(function(loader) {
                        this.size(loader.width*bscale, loader.height*bscale);
                        this.x(border+loader.width*bscale).y(loader.height*bscale/2);
                        backgC.size(loader.width*bscale, loader.height*bscale).x(border+loader.width*bscale).y(loader.height*bscale/2).fill('#59534d')
                    }).front();
                imgC.on('mouseover', function(event){
                        this.parent.opacity(1);
                    }).on('mouseout', function(event){
                        this.parent.opacity(0.7);
                    }).mousedown(function(){
                        console.log('mousedown img');
                        editCloneIt(params)
                    });

                menuBdelete = menu.group()
                  .attr('id', 'menuItemDelete')
                  .opacity(0.7)
                  .attr('data-action', 'removeIt');
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
                        removeIt(params)
                    });
                skipx = 3
            }

            menuBexport = menu.group()
              .attr('id', 'menuItemExport')
              .opacity(0.7)
              .attr('data-action', 'exportIt');
            var backgEx = menuBexport.rect(20,30).fill('#59534d').opacity(0.7);
            menuBexport.image('/file/menuItemExport').loaded(function(loader) {
                    this.size(loader.width*bscale, loader.height*bscale)
                    this.x(border+loader.width*bscale*skipx).y(loader.height*bscale/2);
                    backgEx.size(loader.width*bscale, loader.height*bscale).x(border+loader.width*bscale*skipx).y(loader.height*bscale/2).fill('#59534d')
                }).front().on('mouseover', function(event){
                    this.parent.opacity(1);
                }).on('mouseout', function(event){
                    this.parent.opacity(0.7);
                }).mousedown(function(){
                    console.log('mousedown img', JSON.stringify(params));
                    exportIt(params)
                });


            var menuBview = menu.group()
              .attr('id', 'menuItemView')
              .opacity(0.7)
              .attr('data-action', 'viewIt');
            var backgV = menuBview.rect(20,30).fill('#59534d').opacity(0.7);
            var imgV = menuBview.image('/file/menuItemSearch').loaded(function(loader) {
                    this.size(loader.width*bscale, loader.height*bscale)
                    this.x(border+loader.width*bscale*(skipx+1)).y(loader.height*bscale/2);
                    backgV.size(loader.width*bscale, loader.height*bscale).x(border+loader.width*bscale*(skipx+1)).y(loader.height*bscale/2);
                }).front();
            imgV.on('mouseover', function(event){
                    this.parent.opacity(1);
                }).on('mouseout', function(event){
                    this.parent.opacity(0.7);
                }).mousedown(function(){
                    console.log('mousedown img');
                    viewIt(params)
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
                browseIt(params);
            });
            console.log('/created folder')
        }
        /* not yet
        if(!SVG.get('disector')){
            console.log('create disector')
            var disector = SVG.get('navdefs').image('/file/menuItemDisector').loaded(function(loader) {
                this.size(loader.width, loader.height)
            })
            disector.attr('id', 'disector').on('click', function(){
                disectIt();
            });;
            console.log('/created disector')
        }*/
    }
    //for(i = 0; i < len; i++){
    for(i = 0; i < files.length; i++){
        var vb = SVG.get('fileBrowse').attr("viewBox").split(" ");
        if(!params.buttons || params.buttons != 'nobuttons'){
            var gbox = SVG.get('group_'+i).bbox();
            var gm = SVG.get('group_'+i).transform();
            if(col == 'file'){
                if(files[i].noofchildren > 0){
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
            /* not yet
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
            }*/
        }
    }
    console.log('/fileBMenu');
}

fileBcrumbs = function(params){
    console.log('fileBcrumbs');

    var start = params.start, dim = params.dim, col = params.col, id = params.id,
    fileid = params.id;
    if(col == "file"){
        var parent = File.findOne({_id: fileid});
        var path = parent.structuralpath;
    }
    else{
        var path2 = getElementPath(fileid);
        var parent = File.findOne({_id: path2[path2.length-1]});
        var path = parent.structuralpath;
        path = path2.concat(path);

        var lim = path2.length-2;
    }

    var browser = SVG.get('fileBrowse');
    var crumbs = SVG.get("Bcrumbs");
    //var scale = browser.attr("height")/data.dim;
    var scale = (1/6)*0.5;
    var vb = browser.attr("viewBox").split(" ");
    var crumbsarr = [], gr = [], y = 20, x;
    var cols = [];
    var maxwidth = 0;
    for(i = path.length-1; i >= 0; i--){
        if(typeof lim === 'undefined' || i > lim){
            var f = File.findOne({_id: path[i]})
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
            /* not yet
            else{
                var disect = gr[i].group().move(50, Number(vb[3])-300).scale(0.5).fill('none');
                var backg = disect.rect(1024,1024).radius(512).fill('#cccccc').opacity(1);
                disect.use(SVG.get('disector'));
            }*/
        }
        crumbsarr[i].on('click', function(){
            i = this.attr("id").substring(this.attr("id").indexOf('_')+1);

            if(noedit.indexOf(path[i]) != -1){
                Session.set('defaultButtons', 'buttons');
                params.buttons = 'nobuttons'
            }
            params.id = path[i]
            params.col = cols[i]
            params.start = 1
            redirect(params);
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

editIt = function editIt(params) {
    if(params.col == 'file')
        window.open('/'+ params.col +'m/'+Session.get("fileBIt"), '_blank');
    //else

}

viewIt = function viewIt(params) {
    window.open('/viewer?url='+ params.col +'/'+Session.get("fileBIt"), '_blank');
}

exportIt = function(params) {
    window.open('/'+ params.col +'/'+Session.get("fileBIt"), '_blank');
}

editCloneIt = function editCloneIt(params){
    console.log('editCloneItstart')
    if(Meteor.userId()){
        if(params.col == 'file')
            Meteor.call('cloneFile', Session.get("fileBIt"), function(err, res){
              console.log('clonefile res', res)
              window.open('/filem/'+res, '_blank');
            });
        /*else
            Meteor.call('cloneGroupFile', Session.get("fileBIt"), function(err, res){
              console.log('cloneGroupFile res', res)
              window.open('/filem/'+res, '_blank');
            });*/
    }
}

browseIt = function browseIt(params){
    var defaultButtons = Session.get('defaultButtons');
    if(params.buttons != defaultButtons){
        params.buttons = defaultButtons;
    }
    params.id = Session.get('fileBIt')
    params.start = 1
    redirect(params);
}

disectIt = function disectIt(params){
    var col = 'item';
    if(params.col == 'file')
        var col = 'group';
    else
        if(params.col == 'group')
            if(Group.find({groupId: Session.get("fileBIt")}).fetch().length > 0)
                var col = 'group';

    params.id = Session.get('fileBIt')
    params.col = col
    params.start = 1
    redirect(params);

}

removeIt = function removeIt(params){
    if(File.findOne({_id: Session.get("fileBIt")}).creatorId == Meteor.userId() || Meteor.user().profile.role == 'admin'){
        if(params.col == 'file')
            removeFile(Session.get("fileBIt"), function(){});
        else
            if(params.col == 'group'){
                if(Group.findOne({_id: Session.get("fileBIt")}).fetch().length > 0)
                    removeGroup(Session.get("fileBIt"), true, function(){
            });
                else
                    removeItem(Session.get("fileBIt"), function(){
            });
            }
            else
                removeItem(Session.get("fileBIt"), function(){
            });
    }
}
