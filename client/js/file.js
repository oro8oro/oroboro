/*
var w = window,
    d = document,
    e = d.documentElement,
    g = d.getElementsByTagName('body')[0],
    x = w.innerWidth || e.clientWidth || g.clientWidth,
    y = w.innerHeight|| e.clientHeight|| g.clientHeight;
*/

Session.set("window", {w: window.innerWidth, h: window.innerHeight}); 
Session.set("selectedLayer", '');
Session.set("hiddenLayers", []);
Session.set("lockedItems", []);
//Session.set("", "false");

Meteor.startup(function () {
  $(window).resize(function(evt) {
    Session.set("window", {w: window.innerWidth, h: window.innerHeight});
  });
});


Template.show_meteor_file_svg.rendered = function(){
    $('body').addClass('no_scroll');
    var file = File.findOne({_id: this.data._id});
    var fileId = this.data._id;
    Session.set("fileId", this.data._id);
    var groups = Group.find({fileId: this.data._id}, { sort: { ordering:1 }}).fetch();
    var draw = SVG(this.data._id);//.size(file.width, file.height);
    draw.width(file.width);
    draw.height(file.height);
    draw.attr("style", "overflow: visible;");
    var dGroups=[];
    for(var g in groups){
        dGroups[g] = recursive_group_client(draw, groups[g]);
    }

    var kids = draw.children();
    for(var k in kids){
        if(kids[k].type)
            if(kids[k].type == "menu" || kids[k].type == "menu_item")
                kids[k].scale(global_oro_variables.menu_scale ,global_oro_variables.menu_scale);
    }

    this.autorun(function(){
        var selected = global_oro_variables.selected;
        if(selected.members)
            if(selected.members.length > 0)
                update();
    });

    this.autorun(function(){
        var win = Session.get("window");
        removeLayerMenu();
        createLayerMenu(win.w,win.h);
    });


    this.autorun(function(){
        var ids = file_components_ids(fileId);
        var win = Session.get("window");
        Group.find({_id: {$in: ids.groups}}).observe({
            added: function(doc){
                if(!SVG.get(doc._id)){
                    if(doc.groupId)
                        var parentId = doc.groupId;
                    else
                        var parentId = doc.fileId;
                    if(parentId == undefined)
                        console.log("Group: " + JSON.stringify(doc) + " does not have a parent id")
                    else{
                        var idds = recursive_group_ids(doc._id, {items:[],groups:[]});
                        recursive_group_client(SVG.get(parentId), doc);
                        if(doc.type == 'layer'){
                            removeLayerMenu();
                            var win = Session.get("window");
                            createLayerMenu(win.w,win.h);
                        }
                        if(doc.type == 'simpleGroup'){
                            console.log(SVG.get(doc._id).children());
                            deselect();
                            var selector = buildSelector(SVG.get('svgEditor'), doc._id);
                            global_oro_variables.selected.add(selector);
                            showDatGui();
                        }
                    }
                }
            },
            changed: function(doc){
                var group = SVG.get(doc._id);
                if(doc.groupId)
                    var parentId = doc.groupId;
                else
                    var parentId = doc.fileId;
                if(parentId == undefined)
                    console.log("Group: " + JSON.stringify(doc) + " does not have a parent id")
                else{
                    group.remove();
                    recursive_group_client(SVG.get(parentId), doc);
                    if(doc.type == 'layer'){
                        removeLayerMenu();
                        var win = Session.get("window");
                        createLayerMenu(win.w,win.h);
                    }
                }
            },
            removed: function(doc){
                console.log('removed: ' + doc._id);
                if(SVG.get(doc._id)){
                    var type = SVG.get(doc._id).attr("type");
                    SVG.get(doc._id).remove();
                    if(type == "layer"){
                        removeLayerMenu();
                        createLayerMenu(win.w,win.h);
                    }
                }
            }
        });
        Item.find({_id: {$in: ids.items}}).observe({
            added: function(doc){
                if(!SVG.get(doc._id))
                    build_item(SVG.get(doc.groupId), doc);
            },
            removed: function(doc){}
        });
        Item.find({_id: {$in: ids.items}}).observeChanges({
            added: function(id, fields){},
            changed: function(id, fields){
                console.log(fields);
                if(fields.selected){
                    var locked = Session.get("lockedItems");
                    if(fields.selected != 'null'){
                        if(fields.selected != Meteor.userId()){
                            if(locked.indexOf(id) == -1){
                                locked.push(id);
                                buildSelectorLocked(id);
                                Session.set("lockedItems", locked);
                            }
                        }
                        else
                            if(global_oro_variables.selected.members)
                                if(global_oro_variables.selected.members.indexOf(SVG.get("box_"+id)) == -1){
                                    locked.push(id);
                                    buildSelectorLocked(id);
                                    Session.set("lockedItems", locked);
                                }
                    }
                    else
                        if(locked.indexOf(id) != -1){
                            SVG.get('locked_'+id).remove();
                            locked.splice(locked.indexOf(id),1);
                            Session.set("lockedItems", locked);
                        }
                }
                updateItem(id, fields);
            },
            removed: function(id){
                removeItem(id);
            }
        });
    });
}

Template.show_meteor_file_svg.destroyed = function(){
    $('body').removeClass('no_scroll');
    var users = File.findOne({_id: Session.get('fileId')}).selected;
    users.splice(users.indexOf(Meteor.userId()), 1); 
    Meteor.call('update_document', 'File', this.data._id, {selected: users});
    deselect();
}

mini_scale = global_oro_variables.minimap_scale;

setItemsValue = function setItemValue(property, val){
    var itemids = [];
    var kids = global_oro_variables.selected.members;
    for(var k in kids){
        var itemid = kids[k].attr("selected");
        itemids.push(itemid);
    } 
    var upd = {};
    upd[property] = val;
    Meteor.call('update_collection', "Item", itemids, upd);
}

setFill = function setFill(val){
    var itemids = [];
    //var val = String($.jPicker.List[0].color.active.val('ahex')); 
    //console.log(val);
    var kids = global_oro_variables.selected.members;
    for(var k in kids){
        var itemid = kids[k].attr("selected");
        itemids.push(itemid);
    } 
    var upd = {};
    upd = {"palette.fillColor": val};
    console.log(upd);
    Meteor.call('update_collection', "Item", itemids, upd);
}

setFillOpacity = function setFillOpacity(val){
    var itemids = [];
    //var val = String($.jPicker.List[0].color.active.val('ahex')); 
    //console.log(val);
    var kids = global_oro_variables.selected.members;
    for(var k in kids){
        var itemid = kids[k].attr("selected");
        itemids.push(itemid);
    } 
    var upd = {};
    upd = {"palette.fillOpacity": val};
    Meteor.call('update_collection', "Item", itemids, upd);
}

setStroke = function setStroke(val){
    var itemids = [];
    //var val = String($.jPicker.List[1].color.active.val('ahex'));
    var kids = global_oro_variables.selected.members;
    for(var k in kids){
        var itemid = kids[k].attr("selected");
        itemids.push(itemid);
    }
    var upd = {};
    upd = {"palette.strokeColor": val};
    Meteor.call('update_collection', "Item", itemids, upd);
}

setStrokeOpacity = function setStrokeOpacity(val){
    var itemids = [];
    //var val = String($.jPicker.List[1].color.active.val('ahex'));
    var kids = global_oro_variables.selected.members;
    for(var k in kids){
        var itemid = kids[k].attr("selected");
        itemids.push(itemid);
    }
    var upd = {};
    upd = {"palette.strokeOpacity": val};
    Meteor.call('update_collection', "Item", itemids, upd);
}

setStrokeWidth = function setStrokeWidth(val){
    var itemids = [];
    //var val = String($('#StrokeWidth').val());
    var kids = global_oro_variables.selected.members;
    for(var k in kids){
        var itemid = kids[k].attr("selected");
        itemids.push(itemid);
    }
    var upd = {};
    upd = {"palette.strokeWidth": val};
    Meteor.call('update_collection', "Item", itemids, upd);
}

setStrokeDasharray = function setStrokeDasharray(val){
    var itemids = [];
    //var val = String($("#StrokeDasharray").val());
    var kids = global_oro_variables.selected.members;
    for(var k in kids){
        var itemid = kids[k].attr("selected");
        itemids.push(itemid);
    }
    var upd = {};
    upd = {"palette.strokeDasharray": val};
    Meteor.call('update_collection', "Item", itemids, upd);
}

setStrokeLinejoin = function StrokeLinejoin(val){
    var itemids = [];
    //var val = $("#StrokeLinejoin").val();
    var kids = global_oro_variables.selected.members;
    for(var k in kids){
        var itemid = kids[k].attr("selected");
        itemids.push(itemid);
    }
    var upd = {};
    upd = {"palette.strokeLinejoin": val};
    Meteor.call('update_collection', "Item", itemids, upd);
}

setStrokeLinecap = function StrokeLinecap(val){
    var itemids = [];
    //var val = $("#StrokeLinecap").val();
    var kids = global_oro_variables.selected.members;
    for(var k in kids){
        var itemid = kids[k].attr("selected");
        itemids.push(itemid);
    }
    var upd = {};
    upd = {"palette.strokeLinecap": val};
    Meteor.call('update_collection', "Item", itemids, upd);
}

setOpacity = function setOpacity(val){
    var itemids = [];
    //var val = String($.jPicker.List[1].color.active.val('ahex'));
    var kids = global_oro_variables.selected.members;
    for(var k in kids){
        var itemid = kids[k].attr("selected");
        itemids.push(itemid);
    }
    var upd = {};
    upd = {"palette.opacity": val};
    Meteor.call('update_collection', "Item", itemids, upd);
}

/*
setPalette = function setPalette(fillColor, strokeColor, strokeWidth, dash, linejoin, linecap){
    if(fillColor.substring(0,1) == "#")
        fillColor = fillColor.substring(1);
    if(strokeColor.substring(0,1) == "#")
        strokeColor = strokeColor.substring(1);
    $.jPicker.List[0].color.active.val('ahex',fillColor);
    $.jPicker.List[1].color.active.val('ahex',strokeColor);
    $('#StrokeWidth').val(String(strokeWidth));
    if(dash)
        $('#StrokeDasharray').val(String(dash));
    if(linejoin)
        $('#StrokeLinejoin').val(String(linejoin));
    if(linecap)
        $('#StrokeLinecap').val(String(linecap));
}

Template.svgEditor.events({
    'click #viewport': function(event){
        if($('#Palette').attr("aria-hidden") == "false"){
            if(global_oro_variables.selected.members){
                var id = global_oro_variables.selected.members[0].attr("selected");
                var item = Item.findOne({_id: id});
                var p = item.palette;
                setPalette(p.fillColor, p.strokeColor, p.strokeWidth, p.strokeDasharray, p.strokeLinejoin, p.strokeLinecap);
            }
        }
    }
});
*/


deselect = function(){
    var selected = global_oro_variables.selected.members;
    var ids = []
        for(var s in selected){
            ids.push(selected[s].attr("selected"));
            if(SVG.get(selected[s].attr("selected")).attr("type") != 'simpleGroup'){
                SVG.get(selected[s].attr("selected")).draggable();
                SVG.get(selected[s].attr("selected")).fixed();
            }
            selected[s].remove();
        }
    global_oro_variables.selected.clear();
    Meteor.call('update_collection', 'Item', ids, {selected: 'null'});
    //if(SVG.get("svgMenu") != undefined)
    //    SVG.get("svgMenu").remove();
    //buildMenu(SVG.get("svgEditor"),"menu_group.unselected");
    if(global_oro_variables.gui != undefined && Session.get('selected') != 'false'){
        removeGui();
        showDatGui();
    }
    Session.set('selected', 'false');
}

scaleMinimap = function(matrix){
    matrix = matrix.split(',');
    SVG.get('mini_doc').size(Session.get('fileWidth') * matrix[0], Session.get('fileHeight') * matrix[3]).move(matrix[4],matrix[5]);
    buildMinimap(Session.get('window').w, Session.get('window').h);
}

buildMinimap = function buildMinimap(x,y){
    SVG.get('mini_display').size(x,y);
    var box = groupBbox(SVG.get('minimapgr'));
    var a = Math.min(x,y) * mini_scale;
    if(box.height > box.width)
        SVG.get('minimapgr').scale(a / box.height, a / box.height);
    else
        SVG.get('minimapgr').scale(a / box.width, a / box.width);
    var b = SVG.get('minimap').bbox();
    SVG.get('minimap').dx(x-b.width-1-b.x).dy(y-b.height-1-b.y);
}
buildColorPicker = function(){
    $('#FillPicker').jPicker({
            window:{
                position: {x: 'right',y: 'bottom'},
                expandable: true,
                alphaSupport: true,
                alphaPrecision: 2,
            },
            color:
            {mode: 'a', active: new $.jPicker.Color({ ahex: '99330099' })}
        },
        function(color, context){
            var ahex = color.val('ahex');
            setFill();
        },
        function(color, context){
            var ahex = color.val('ahex');
            setFill();
        }
    );
    $('#StrokePicker').jPicker({
            window:{
                position: {x: 'right',y: 'bottom'},
                expandable: true,
                alphaSupport: true,
                alphaPrecision: 2,
            },
            color:
            {mode: 'a', active: new $.jPicker.Color({ ahex: '99330099' })}
        },
        function(color, context){
            var ahex = color.val('ahex');
            setStroke();
        },
        function(color, context){
            var ahex = color.val('ahex');
            setStroke();
        }
    );
}

togglePanZoom = function(){
    if(Session.get("lockPanZoom") == "true"){
        SVG.get('locked').show();
        SVG.get('unlocked').hide();
        disablePan();
    }
    else{
        SVG.get('unlocked').show();
        SVG.get('locked').hide();
        enablePan();
    }
}

buildWBackground = function(){
    var background = SVG.get('viewport').rect(Session.get('fileWidth'), Session.get('fileHeight')).fill("#FFFFFF").move(0,0).attr("id", "background");

    background.on('click', function(event){
        if(!event.shiftKey)
            deselect();  
    });
}

Tracker.autorun(function(){
    var lock = Session.get('lockPanZoom');
    if(lock)
        togglePanZoom();
});

renderedTemplates = [];
Template.svgEditor.rendered = function(){ 
    window.windowType = 'svgEditor' 
    var cssfiles = this.data.cssfiles;
    this.data = this.data.file;
    for(var i in jsfiles){
        $("head").append('<script type="application/javascript" src="/file/' + jsfiles[i]._id + '">');
    }
    for(var i in cssfiles){
        $("head").append('<link rel="stylesheet" type="text/css" href="/file/' + cssfiles[i]._id + '">');
    }

    //buildColorPicker();

    
     /*******
    **  variables:
    ********/

    var x = Session.get("window").w;
    var y = Session.get("window").h;
    var a = Math.min(x,y) * mini_scale;
    var fileId = this.data._id;
    var file = this.data;
    Session.set("fileId", fileId);
    Session.set('fileWidth', this.data.width);
    Session.set('fileHeight', this.data.height);
    console.log(file.permissions.edit);
    console.log(Meteor.userId());
    console.log(String(file.permissions.edit.indexOf(Meteor.userId()) != -1));
    var enableEdit = String(file.permissions.edit.indexOf(Meteor.userId()) != -1);
    Session.set("enableEdit", enableEdit);
    //console.log(Session.get("enableEdit"));

    var editor = SVG("svgEditor").size(10000,10000);
    
    /*******
    **  grey background for screen:
    ********/

    var grey = editor.rect(x,y).attr("id","grey_background").fill("#A9A9A9");
    grey.on('click', function(event){
        if(!event.shiftKey)
            deselect();  
    });

    var viewport = editor.group().attr("id", "viewport");


    global_oro_variables.selected = viewport.set();
  
   /*******
    **  white background for file:
    ********/

    buildWBackground();

    /*******
    **  database SVG file:
    ********/

    renderedTemplates["show_meteor_file_svg"] = Blaze.renderWithData(Template.show_meteor_file_svg, {"_id":this.data._id}, document.getElementById("viewport"));
    var g0 = SVG(fileId);

    /*******
    **  minimap:
    ********/

    var minimap = editor.group().attr("id",'minimap');
    var minimapgr = minimap.group().attr("id","minimapgr");
    var doc = minimapgr.rect(this.data.width,this.data.height).fill({ color: '#4178D7'}).attr("id","mini_doc").opacity(0.4);
    var d = minimapgr.rect(x,y).fill({color: '#BB6F8D'}).attr("id","mini_display").opacity(0.4);
    buildMinimap(x,y);


    /*******
    **  layers menu:
    ********/

    var layersg = editor.group().attr("id","layersGroup");


    //buildMenu(SVG.get("svgEditor"),"menu_group.unselected");
    showDatGui();

    /*******
    **  lock Pan and Zoom:
    ********/

    var lockbutton = editor.group().attr("id", "lockButton").move(x-30,y-30).front();
    var locked = lockbutton.image('/file/iZkjxcxRDvK9ubM7H').attr("id","locked").size(30,30).opacity(0.6);
    var unlocked = lockbutton.image('/file/2j4FekqSWwTfFGSeX').attr("id","unlocked").size(30,30).opacity(0.6);
    locked.on('mouseover',function(e){
        this.opacity(1);
    });
    locked.on('mouseout',function(e){
        this.opacity(0.6);
    });
    locked.on('click',function(e){
        console.log('locked');
        Session.set('lockPanZoom', 'false');
        console.log(Session.get('lockPanZoom'))
    });
    unlocked.on('mouseover',function(e){
        this.opacity(1);
    });
    unlocked.on('mouseout',function(e){
        this.opacity(0.6);
    });
    unlocked.on('click',function(e){
        console.log('unlocked');
        Session.set('lockPanZoom', 'true');
        console.log(Session.get('lockPanZoom'))
    });
    Session.set('lockPanZoom', 'false');

    /*******
    **  chatter:
    ********/

    var chat = editor.group().attr("id", "chatter").opacity(0.6);
    var chatButton = chat.group().attr("id", "chatButton").move(x-30,0);
    chatButton.image('/file/HeqoiKvqbBDkhQK8N').attr("id", "chatIcon").size(30,30);
    var sc = 0.2;
    var iconsize = 30;
    var chatContent = chat.group().attr("id", "chatContent");//.scale(sc,sc);
    var chatRect = chatContent.rect(30,30).radius(10).attr("id","chatRect").stroke({color: '#000000', width: 3}).fill('none');
    var icons = chatContent.group().attr("id", "chatUserIcons");
    var iconx = x-iconsize-2, icony = 30;
    //chatContent.move(x-x*sc,30).hide();
    chatContent.hide();

    chatButton.on('mouseover',function(e){
        this.opacity(1);
    });
    chatButton.on('mouseout',function(e){
        this.opacity(0.6);
    });
    chatButton.on('click',function(e){
        //$('#chatterModal').modal({backdrop: false, show: true});
        
        if(chatContent.visible())
            chatContent.hide();
        else
            chatContent.show();
    });

    this.autorun(function(){
        if(Meteor.userId()){
            if(file.selected){
                var users = file.selected;
                if(users.indexOf(Meteor.userId()) == -1)
                    users.push(Meteor.userId());
            }
            else
                var users = [Meteor.userId()];
            Meteor.call('update_document', 'File', fileId, {selected: users});

        }
    })



    this.autorun(function(){
        var f = File.findOne({_id: Session.get('fileId')});
        if(f.selected){
            //console.log(f.selected);
            users = f.selected;
            SVG.get("chatUserIcons").clear();
            for(i in users){
                var user = Meteor.users.findOne({_id: users[i]});
                icons.rect(iconsize,iconsize).stroke('none').fill(random_pastels()).move(iconx, icony).radius(10).attr("id", "chatUserRect");
                icons.image(user.profile.icon).move(iconx, icony).size(iconsize,iconsize);
                iconx = iconx - iconsize;
            }
            chatRect.attr("width", users.length * iconsize + 4).attr("height", iconsize + 4).move(iconx+iconsize - 2, icony - 2);
        }
    })



    /*******
    **  resize minimap, grey background on window resize:
    ********/

    this.autorun(function(){
        var win = Session.get("window");
        buildMinimap(win.w,win.h);
        grey.size(win.w,win.h);
        SVG.get("lockButton").move(win.w-30, win.h-30);
        //SVG.get("chatButton").move(win.w-30,0);
        //SVG.get("chatRect").size(win.w, win.h);
    });
}
  
/*
Template.chatterModal.rendered = function(){
    $('#chatterModal').modal();

    this.autorun(function(){
        var f = File.findOne({_id: Session.get('fileId')});
        if(f.selected){
            console.log(f.selected);
            users = f.selected;
            $('#chatterUsers').html();
            var icons = [];
            for(i in users){
                var user = Meteor.users.findOne({_id: users[i]});

                icons.image(user.profile.icon).move(iconx, icony).size(150,150);
            }
        }
    })
}*/