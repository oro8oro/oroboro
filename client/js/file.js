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
    var groups = Group.find({fileId: this.data._id}).fetch();
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
        SVG.get('layersGroup').clear();
        createLayerMenu(win.w,win.h);
    });


    this.autorun(function(){
        var ids = file_components_ids(fileId);
        Group.find({_id: {$in: ids.groups}}).observeChanges({
            added: function(id, fields){},
            changed: function(id, fields){
                //build_group_client(g, group);
            },
            removed: function(id){
                console.log(id);
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
                updateItem(id, fields);
            },
            removed: function(id){
                removeItem(id);
            }
        });
    })

    
    
}

Template.show_meteor_file_svg.destroyed = function(){
    $('body').removeClass('no_scroll');
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
        for(var s in selected){
            SVG.get(selected[s].attr("selected")).fixed();
            selected[s].remove();
        }
    global_oro_variables.selected.clear();
    if(SVG.get("svgMenu") != undefined)
        SVG.get("svgMenu").remove();
    buildMenu(SVG.get("svgEditor"),"menu_group.unselected");
    if(global_oro_variables.gui != undefined)
        removeGui();
}

buildMinimap = function buildMinimap(x,y){
    var a = Math.min(x,y) * mini_scale;
    var minimap = SVG.get('minimap');
    var d = SVG.get('mini_display');
    d.size(x,y);
    var gbox = minimap.bbox();
    if( gbox.height > gbox.width){
        minimap.scale(a / gbox.height, a / gbox.height);
    }
    else
        minimap.scale(a / gbox.width, a / gbox.width);
    minimap.move(x-a-5,y-a-5);
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



Tracker.autorun(function(){
    var lock = Session.get('lockPanZoom');
    console.log(lock);
    if(lock)
        togglePanZoom();
});

Template.svgEditor.rendered = function(){  
    var cssfiles = this.data.cssfiles;
    this.data = this.data.file;
    for(var i in jsfiles){
        $("head").append('<script type="application/javascript" src="/file/' + jsfiles[i]._id + '">');
    }
    for(var i in cssfiles){
        $("head").append('<link rel="stylesheet" type="text/css" href="/file/' + cssfiles[i]._id + '">');
    }

    buildColorPicker();

    
     /*******
    **  variables:
    ********/

    var x = Session.get("window").w;
    var y = Session.get("window").h;
    var a = Math.min(x,y) * mini_scale;
    var fileId = this.data._id;
    Session.set("fileId", fileId);

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

    var background = viewport.rect(this.data.width, this.data.height).fill("#FFFFFF").move(0,0).attr("id", "background");

    background.on('click', function(event){
        if(!event.shiftKey)
            deselect();  
    });

    /*******
    **  database SVG file:
    ********/

    Blaze.renderWithData(Template.show_meteor_file_svg, {"_id":this.data._id}, document.getElementById("viewport"));
    var g0 = SVG(fileId);

    /*******
    **  minimap:
    ********/

    var minimap = editor.group().attr("id",'minimap');
    var doc = minimap.rect(this.data.width,this.data.height).fill({ color: '#4178D7'}).attr("id","mini_doc").opacity(0.4);
    var d = minimap.rect(x,y).fill({color: '#BB6F8D'}).attr("id","mini_display").opacity(0.4);
    buildMinimap(x,y);


    /*******
    **  layers menu:
    ********/

    var layersg = editor.group().attr("id","layersGroup");


    buildMenu(SVG.get("svgEditor"),"menu_group.unselected");

    /*******
    **  lock Pan and Zoom:
    ********/

    var lockbutton = SVG.get("svgEditor").group().attr("id", "lockButton").move(x-30,y-30).front();
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
        Session.set('lockPanZoom', 'true');
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
        Session.set('lockPanZoom', 'false');
        console.log(Session.get('lockPanZoom'))
    });
    Session.set('lockPanZoom', 'false');


    /*******
    **  resize minimap, grey background on window resize:
    ********/

    this.autorun(function(){
        var win = Session.get("window");
        buildMinimap(win.w,win.h);
        grey.size(win.w,win.h);
        SVG.get("lockButton").move(win.w-30, win.h-30);
    });
}
