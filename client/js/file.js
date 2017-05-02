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

count = {g: 0, i:0};
Template.show_meteor_file_svg.rendered = function(){
    console.orolog('render svg file');
    count = {g: 0, i:0};
    $('body').addClass('no_scroll');
    var file = File.findOne({_id: this.data._id});
    var fileId = this.data._id;
    Session.set("fileId", this.data._id);
    var groups = Group.find({fileId: this.data._id}, { sort: { ordering:1 }}).fetch();
    console.orolog(groups)
    var draw = SVG(this.data._id);//.size(file.width, file.height);
    draw.width(file.width);
    draw.height(file.height);
    draw.attr("style", "overflow: visible;");

    var connectorsuse = draw.group().attr('id', 'connectors_use');
    var defs = draw.defs().attr('id', 'filedefs');
    var connectordefs = defs.group().attr('id', 'connectordefs');

    if(file.parameters && file.parameters.templatepath){
        console.orolog('template');
        var templates = file.parameters.templatepath;
        var layertemps = [], images = [];
        for(var i = 0; i < templates.length; i++){
            layertemps[i] = draw.group().attr('id', 'template_'+templates[i]).attr('type','layer');
            layertemps[i].image('/file/'+templates[i]).move(0,0).size(file.width, file.height);
        }
    }

    var dGroups=[];
    for(var g in groups){
        dGroups[g] = recursive_group_client(draw, groups[g]);
    }

    //build connectors
    var connectoritems = Item.find({ $and: [{groupId: fileId}, {'parameters.type': 'connector'}]}).fetch()
    for(var i = 0; i < connectoritems.length; i++){
        var c = build_item(connectordefs, connectoritems[i]);
        c.attr('role', 'connector');
    }
/*
    //show connectors
    var conns = Connector.find().fetch();
    if(conns.length > 0)
        build_connectors(conns)
*/
/*
    var kids = draw.children();
    for(var k in kids){
        if(kids[k].type)
            if(kids[k].type == "menu" || kids[k].type == "menu_item")
                kids[k].scale(global_oro_variables.menu_scale ,global_oro_variables.menu_scale);
    }
    */

    console.orolog('/render svg file');
    console.orolog(Meteor.userId())
    console.orolog(file.selected)
    if(!file.selected)
        file.selected = []
    if(Meteor.userId() && file.selected.indexOf(Meteor.userId()) == -1){
        file.selected.push(Meteor.userId())
        console.orolog(file.selected)
        Meteor.call('update_document', 'File', fileId, {selected: file.selected})
    }

    if(!this.data.dinamic){
        this.autorun(function(){
            var win = Session.get("window");
            removeLayerMenu();
            createLayerMenu(win.w,win.h);
        });
    }

    this.autorun(function(){
        Group.find().observe({
            added: function(doc){
                if(!SVG.get(doc._id) && count.g != 0){
                    console.orolog('group not in Editor');
                    if(doc.groupId)
                        var parentId = doc.groupId;
                    else
                        var parentId = doc.fileId;
                    if(parentId == undefined)
                        console.orolog("Group: " + JSON.stringify(doc) + " does not have a parent id")
                    else if(SVG.get(parentId)){
                    //else{
                        var idds = recursive_group_ids(doc._id, {items:[],groups:[]});
                        for(var i in idds.items)
                            if(SVG.get(idds.items[i]))
                                SVG.get(idds.items[i]).remove();
                        for(var i in idds.groups)
                            if(SVG.get(idds.groups[i]))
                                SVG.get(idds.groups[i]).remove();
                        console.orolog(parentId);
                        console.orolog(SVG.get(parentId));
                        recursive_group_client(SVG.get(parentId), doc);
                        if(doc.type == 'layer'){
                            var win = Session.get("window");
                            removeLayerMenu();
                            var win = Session.get("window");
                            createLayerMenu(win.w,win.h);
                        }
                        if(doc.type == 'simpleGroup' || doc.type == 'parametrizedGroup'){
                            //console.orolog(SVG.get(doc._id).children());
                            deselect();
                            var selector = buildSelector(SVG.get('svgEditor'), doc._id);
                            global_oro_variables.selected.add(selector);
                            showDatGui();
                        }
                    }
                }
            },
            removed: function(doc){
                var id = doc._id;
                console.orolog('removed: ' + id);
                if(SVG.get(id)){
                    deselectItem(id);
                    var type = SVG.get(id).attr("type");
                    SVG.get(id).remove();
                    if(type == "layer"){
                        var win = Session.get("window");
                        removeLayerMenu();
                        createLayerMenu(win.w,win.h);
                    }
                }
            }
        });
        count.g++;
    });
    this.autorun(function(){
        Group.find().observeChanges({
            changed: function(id,doc){
                var group = SVG.get(id);
                //console.orolog(id);
                console.orolog(doc);
                var locked = Session.get("lockedItems");
                //console.orolog(locked);
                if(doc.selected){
                    if(doc.selected != 'null'){
                        if(doc.selected != Meteor.userId()){
                            console.orolog(locked.indexOf(id));
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

                if(doc.groupId || doc.fileId){
                    if(doc.groupId)
                        var parentId = doc.groupId;
                    else
                        var parentId = doc.fileId;
                    if(parentId == undefined)
                        console.orolog("Group: " + doc._id + " does not have a parent id")
                    else{
                        group.remove();
                        recursive_group_client(SVG.get(parentId), doc);
                        if(doc.type == 'layer'){
                            var win = Session.get("window");
                            removeLayerMenu();
                            var win = Session.get("window");
                            createLayerMenu(win.w,win.h);
                        }
                    }
                }
                if(doc.ordering){
                    //console.orolog(doc.ordering)
                    //console.orolog(SVG.get(id).parent.get(doc.ordering))
                    //var pos = SVG.get(id).position()
                    SVG.get(id).before(SVG.get(id).parent.get(doc.ordering));
                }
                if(doc.transform){
                    console.orolog(doc.transform);
                    SVG.get(id).transform("matrix", doc.transform);
                    positionSelector(id);
                }
                if(doc.locked){
                    SVG.get(id).attr('locked', doc.locked);
                    var ids = doc.locked.split(',');
                    for(var i = 0; i < ids.length; i++)
                        if(SVG.get(ids[i]))
                            SVG.get(ids[i]).draggable();
                }
                if(doc.parameters && doc.parameters.callback && doc.parameters.params){
                    window[doc.parameters.callback](doc.parameters);
                }
            }
        });
    });
    this.autorun(function(){
        Item.find().observe({
            added: function(doc){
                //console.orolog('added item: '+JSON.stringify(doc));
                //console.orolog(count);
                if(!SVG.get(doc._id) && count.i != 0)
                    if(doc.groupId != Session.get('fileId') && SVG.get(doc.groupId))
                        build_item(SVG.get(doc.groupId), doc);
                    else
                        build_item(SVG.get('connectordefs'), doc);
            },
            removed: function(doc){
                //console.orolog('removed item: ' + JSON.stringify(doc));
                deleteItem(doc._id);
            }
        });
        count.i++;
    });
    this.autorun(function(){
        Item.find().observeChanges({
            changed: function(id, fields){
                console.orolog(Date.now())
                console.orolog('changed item: ' +id)
                console.orolog(fields);
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
                                    console.orolog('select item');
                                    select_item(id);
                                    locked.push(id);
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
                if(fields.locked)
                    SVG.get(id).attr('locked', fields.locked);
                updateItem(id, fields);
            }
        });
    });
    this.autorun(function(){
        Connector.find().observeChanges({
            changed: function(id, fields){
                console.orolog(id);
                console.orolog(fields);
                if(fields.sourceAttach)
                    global_oro_variables.connections[id].setConnectorAttachment('source', fields.sourceAttach)
                if(fields.targetAttach)
                    global_oro_variables.connections[id].setConnectorAttachment('target', fields.targetAttach)
                if(fields.marker){
                    if(SVG.get(fields.marker))
                        fields.marker = SVG.get('connectors_markers').use(SVG.get(fields.marker));
                    global_oro_variables.connections[id].setMarker(fields.marker, SVG.get('connectors_markers'))
                }
                if(fields.connector){
                    if(SVG.get(fields.connector))
                        fields.connector = SVG.get('connectordefs').use(SVG.get(fields.connector));
                    global_oro_variables.connections[id].setConnector(fields.connector)
                }
                if(fields.label){
                    if(fields.label == 'true'){
                        global_oro_variables.connections[id].setLabel(true, SVG.get('labels'));
                        global_oro_variables.connections[id].label.attr('role', 'label');
                    }
                    else
                        global_oro_variables.connections[id].setLabel(false);
                }
                if(fields.type){
                    global_oro_variables.connections[id].setType(fields.type);
                }
                if(fields.source || fields.target){
                    console.orolog(id);
                    remove_connectors(id)
                    build_connectors(id)
                }
            }
        })
    });
    this.autorun(function(){
        Connector.find().observe({
            added: function(doc){
                build_connectors([doc]);
            },
            removed: function(doc){
                remove_connectors([doc]);
            }
        })
    });
}

Template.show_meteor_file_svg.onDestroyed(function(){
    $('body').removeClass('no_scroll');
    var users = File.findOne({_id: Session.get('fileId')}).selected;
    users.splice(users.indexOf(Meteor.userId()), 1);
    Meteor.call('update_document', 'File', this.data._id, {selected: users});
    deselect();
});

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
    //console.orolog(val);
    var kids = global_oro_variables.selected.members;
    for(var k in kids){
        var itemid = kids[k].attr("selected");
        itemids.push(itemid);
    }
    var upd = {};
    upd = {"palette.fillColor": val};
    console.orolog(upd);
    //Meteor.call('update_collection', "Item", itemids, upd);
    global_oro_variables.wraps.update_collection('Item', itemids, upd);
}

setFillOpacity = function setFillOpacity(val){
    var itemids = [];
    //var val = String($.jPicker.List[0].color.active.val('ahex'));
    //console.orolog(val);
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
    var ids = {items:[], groups:[]}
        for(var s in selected){
            var sel = SVG.get(selected[s].attr("selected"))
            if(sel.type == 'g'){
                ids.groups.push(selected[s].attr("selected"));
                if(sel.attr('locked') && sel.attr('locked') != 'null')
                    ids.items = ids.items.concat(sel.attr('locked').split(','));
                for(var i = 0; i < ids.items.length; i++){
                    if(SVG.get(ids.items[i])){
                        SVG.get(ids.items[i]).draggable();
                        SVG.get(ids.items[i]).fixed();
                    }
                }
            }
            else{
                ids.items.push(selected[s].attr("selected"));
                sel.draggable();
                sel.fixed();
            }
            selected[s].remove();
        }
    global_oro_variables.selected.clear();
    Meteor.call('update_collection', 'Item', ids.items, {selected: 'null'});
    Meteor.call('update_collection', 'Group', ids.groups, {selected: 'null'});
    //if(SVG.get("svgMenu") != undefined)
    //    SVG.get("svgMenu").remove();
    //buildMenu(SVG.get("svgEditor"),"menu_group.unselected");
    if(global_oro_variables.gui != undefined && Session.get('selected') != 'false'){
        removeGui();
        showDatGui();
    }
    Session.set('selected', 'false');
    if(selection.members && selection.members.length > 0)
        selection.clear();
    selectionno = [];
}

unselectFile = function(){
    var selected = File.findOne(Session.get('fileId')).selected
    selected = selected.splice(selected.indexOf(Meteor.userId(),1));
    Meteor.call('update_document', 'File', Session.get('fileId'), {selected: selected});
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

buildWBackground = function(){
    var background = SVG.get('viewport').rect(Session.get('fileWidth'), Session.get('fileHeight')).fill("#FFFFFF").move(0,0).attr("id", "background");

    background.on('click', function(event){
        if(!event.shiftKey)
            deselect();
    });
}

renderedTemplates = [];
g0 = undefined;

Template.svgEditor.rendered = function(){
    console.orolog('render svgEditor')
    window.windowType = 'svgEditor'
    console.orolog('get script dependencies')
    var js_dep = File.findOne({_id: "Yq9iqYhEma9z9mYrp"}).dependencypath;
    var cssfiles = separate_deps(js_dep,"text/css");
    var jsfiles = separate_deps(js_dep,"application/javascript");
    console.orolog('/get script dependencies')
    var f = this.data.file

    if(!f)
        f = File.findOne({_id: this.data.id})

    if(!f)
        f = File.findOne({title: this.data.id})

    if(!f)
        f = File.findOne({uuid: this.data.id})

    if(!f)
        f = File.findOne({$or: [{title: {$regex: this.data.id, $options: 'i'}}, {uuid: {$regex: this.data.id, $options: 'i'}}]})

    console.orolog(f)
    this.data = f


    console.orolog('load scripts')
    $("head").append('<script type="application/javascript" src="/SVGPathSeg-polyfill.js">')
    for(var i in jsfiles){
        $("head").append('<script type="application/javascript" src="/file/' + jsfiles[i]._id + '">');
    }
    $("head").append('<script type="application/javascript" src="/svgextend.js">');
    $("head").append('<script type="application/javascript" src="/connectableextend.js">');
    $("head").append('<script type="application/javascript" src="/qrcodesvg.js">');
    for(var i in cssfiles){
        $("head").append('<link rel="stylesheet" type="text/css" href="/file/' + cssfiles[i]._id + '">');
    }
    console.orolog('/load scripts');

    window.onbeforeunload = function(e) {
        unlockItems();
        unselectFile();
    }
    window.onunload = function(e) {
        unlockItems();
        unselectFile()
    }

    var shiftselection = {}, finish = false, elements = [];
    document.addEventListener("mousedown", function( e ) {
        if(e.shiftKey && (e.target == document.getElementById('background') || e.target == document.getElementById('grey_background'))){
            console.orolog('mousedown');
            finish = false
            disablePan();
            shiftselection.x = e.clientX;
            shiftselection.y = e.clientY;
            SVG.get('svgEditor').rect(1,1).x(shiftselection.x).y(shiftselection.y).stroke({color: '#000000', width: 2, dasharray: "1,0,1"}).fill('#FFFFFF').attr('id', 'selectionRect').opacity(0.2);
            if(global_oro_variables.selected.members.length > 0  && global_oro_variables.selected.members[0].attr('type') != 'pathPoints')
                deselect();
            if(!global_oro_variables.selected.members || global_oro_variables.selected.members.length == 0){
                var groupids = File.findOne({_id: Session.get('fileId')}).groupids;
                var itemids = File.findOne({_id: Session.get('fileId')}).itemids;
                var hiddenit = [], hiddengr = [];
                SVG.get(Session.get('fileId')).each(function(i, children){
                    if(!this.visible()){
                        var hiddenkids = recursive_group_ids(this.attr('id'))
                        hiddenkids.groups.push(this.attr('id'));
                        hiddenit = hiddenit.concat(hiddenkids.items);
                        hiddengr = hiddengr.concat(hiddenkids.groups);
                    }
                })
                itemids = diff(itemids, hiddenit);
                groupids = diff(groupids, hiddengr);
                elements = Item.find({ $and: [
                    {_id: {$in: itemids}},
                    {locked: "null"},
                    {selected: {$in: ['null', Meteor.userId()]}}
                    ]}).map(function(doc){
                        return doc._id;
                    });
                var groups = Group.find({ $and: [
                    {_id: {$in: groupids}},
                    {locked: {$nin: ["null", null]}},
                    {selected: {$in: ['null', Meteor.userId()]}}
                    ]}).map(function(doc){
                        return doc._id;
                    });
                var connectors = []
                SVG.get('connectors_links').each(function(i){
                    connectors.push(this.attr('id'))
                })
                console.orolog(connectors);
                SVG.get('connectors_use').each(function(i){
                    connectors.push(this.attr('id'))
                })
                console.orolog(connectors);
                elements = elements.concat(groups).concat(connectors);
            }
        }
  }, false);
    document.addEventListener("mousemove", function( e ) {
        if(e.shiftKey && shiftselection.x && !finish){
            shiftselection.x2 = e.clientX;
            shiftselection.y2 = e.clientY;
            SVG.get('selectionRect').width(Math.abs(shiftselection.x2 - shiftselection.x)).height(Math.abs(shiftselection.y2 - shiftselection.y));
            if(shiftselection.x > shiftselection.x2)
                SVG.get('selectionRect').x(shiftselection.x2);
            if(shiftselection.y > shiftselection.y2)
                SVG.get('selectionRect').y(shiftselection.y2);
            //opacity change on elem

            if(elements.length > 0){
                var obox = SVG.get('selectionRect').bbox();
                var invview = SVG.get('viewport').node.getCTM().inverse();
                var pp = transformPoint(obox.x, obox.y, [invview]);
                var pp2 = transformPoint(obox.x2, obox.y2, [invview]);
                var tbox = {};
                tbox.x = pp[0];
                tbox.y = pp[1];
                tbox.x2 = pp2[0];
                tbox.y2 = pp2[1];
                for(var i = 0; i < elements.length; i++){
                    if(SVG.get(elements[i]) && !SVG.get(elements[i]).doc(SVG.Defs)){
                        var box = SVG.get(elements[i]).bbox();
                        var inside = false, rbox;
                        if(SVG.get(elements[i]).attr('role') && SVG.get(elements[i]).attr('role') == 'connector' && SVG.get(elements[i]).type != 'use')
                            rbox = obox;
                        else
                            rbox = tbox;
                        if((rbox.x < box.x && box.x < rbox.x2) || (rbox.x < box.x2 && box.x2 < rbox.x2))
                            inside = true;
                        if(inside && ((rbox.y < box.y && box.y < rbox.y2) || (rbox.y < box.y2 && box.y2 < rbox.y2)))
                            inside = true
                        else
                            inside = false
                        if(!inside)
                            if( box.x < rbox.x && rbox.x < box.x2
                                && box.x < rbox.x2 && rbox.x2 < box.x2
                                && ((box.y < rbox.y && rbox.y < box.y2) || (box.y < rbox.y2 && rbox.y2 < box.y2) || (rbox.y < box.y && rbox.y2 > box.y2))
                            )
                                inside = true;
                            else if( box.y < rbox.y && rbox.y < box.y2
                                && box.y < rbox.y2 && rbox.y2 < box.y2
                                &&  ((box.x < rbox.x && rbox.x < box.x2) || (box.x < rbox.x2 && rbox.x2 < box.x2) || (rbox.x < box.x && rbox.x2 > box.x2) )
                            )
                                inside = true;
                        if(inside){
                            if(selectionno.indexOf(elements[i]) == -1){
                                selectionno.push(elements[i]);
                                if(global_oro_variables.selected.members.length == 0)
                                    select_item(elements[i])
                                else if(global_oro_variables.selected.members.length == 1){
                                    //deselectItem(selectionno[0]);
                                    global_oro_variables.selected.remove(SVG.get('box_'+selectionno[0]));
                                    SVG.get('box_'+selectionno[0]).remove();
                                    global_oro_variables.selected.add(buildSelectorSimple(selectionno[0]));
                                    //select_item(selectionno[0],true);
                                    select_item(elements[i],true);
                                }
                                else
                                    select_item(elements[i],true);
                            }
                        }
                        else if(selectionno.indexOf(elements[i]) != -1){
                            selectionno.splice(selectionno.indexOf(elements[i]),1);
                            deselectItem(elements[i]);
                            if(global_oro_variables.selected.members.length == 1){
                                //deselectItem(selectionno[0]);
                                //select_item(selectionno[0]);
                                global_oro_variables.selected.remove(SVG.get('box_'+selectionno[0]));
                                SVG.get('box_'+selectionno[0]).remove();
                                global_oro_variables.selected.add(buildSelector(selectionno[0]));
                            }
                        }
                    }
                }
            }
        }
  }, false);
    document.addEventListener("mouseup", function( e ) {
        if(shiftselection.x){
            console.orolog('mouseup int')
            if(global_oro_variables.selected.members && global_oro_variables.selected.members.length > 0 && global_oro_variables.selected.members[0].attr('type') == 'pathPoints'){
                var points = SVG.get('hingePoints').children();
                for(var i = 0; i < points.length; i++){
                    if(SVG.get('selectionRect').inside(points[i].cx(), points[i].cy())){
                        points[i].fill('#3a64a0')
                        selection.add(points[i]);
                        selectionno.push(SVG.get('hingePoints').index(points[i]))
                    }
                }
            }
            SVG.get('selectionRect').remove();
            finish = true;
            shiftselection = {};
            elements = [];
            enablePan();
            if(global_oro_variables.selected.members.length > 0){
                showDatGui();
                console.orolog('markSelected');
                markSelected();
            }
        }
  }, false);

    var keyControlls = {
      "∂": menuItemDelete, //D
      "ç": menuItemClone, //C
      "©": menuItemGroup, //G
      "√": menuItemUnGroup, //V
      "å": menuItemAddElement, //A
      "ƒ": menuItemToFront, //F
      "∫": menuItemToBack, //B
      "¬": menuItemLockGroup, //L
      "ArrowUp": menuItemBox, //UpArrow
      "π": function() { //P
          if(global_oro_variables.selected.members && global_oro_variables.selected.members.length){
              var id = global_oro_variables.selected.members[0].attr('selected');
              var index = global_oro_variables.selected.members.indexOf(SVG.get('box_'+id));
              global_oro_variables.selected.members.splice(index,1);
              SVG.get('box_'+id).remove();
              var sel = buildSelectorPoints(id);
              global_oro_variables.selected.add(sel);
              SVG.get(sel.attr('selected')).fixed();
          }
      },
      "£": function() { //3
          if(global_oro_variables.selected.members && global_oro_variables.selected.members.length){
              var id = global_oro_variables.selected.members[0].attr('selected');
              var index = global_oro_variables.selected.members.indexOf(SVG.get('box_'+id));
              global_oro_variables.selected.members.splice(index,1);
              SVG.get('box_'+id).remove();
              var sel = buildSelector3D(id);
              global_oro_variables.selected.add(sel);
              SVG.get(sel.attr('selected')).fixed();
          }
      },
      "µ": menuItemImportSelector //M
    };

    document.addEventListener('keydown', function(e){
      //console.orolog('keydown', e, e.key, e.altKey, global_oro_variables.selected.members, keyControlls[e.key])

      if(e.altKey && keyControlls[e.key]){
            e.preventDefault();
            e.stopPropagation();
            keyControlls[e.key]();
        }
    })

    //buildColorPicker();


     /*******
    **  variables:
    ********/
    console.orolog('this data')
    console.orolog(this.data)
    var x = Session.get("window").w;
    var y = Session.get("window").h;
    var a = Math.min(x,y) * mini_scale;
    var fileId = this.data._id;
    var file = this.data;
    Session.set("fileId", fileId);
    Session.set('fileWidth', this.data.width);
    Session.set('fileHeight', this.data.height);
    console.orolog('file.permissions', file.permissions);
    console.orolog('isAdmin?', Meteor.userId(), Roles.userIsInRole(Meteor.userId(), 'admin'));
    if(file.permissions.edit.indexOf(Meteor.userId()) != -1 || file.permissions.edit.length == 0 || Roles.userIsInRole(Meteor.userId(), 'admin'))
        var enableEdit = "true";
    else
        var enableEdit = "false";
    Session.set("enableEdit", enableEdit);
    //console.orolog(Session.get("enableEdit"));

    var editor = SVG("svgEditor").size(10000,10000);
    var defs = editor.defs().attr('id', 'editorDefs');

    /*******
    **  grey background for screen:
    ********/

    var grey = editor.rect(x,y).attr("id","grey_background").fill("#A9A9A9");
    grey.on('click', function(event){
        if(!event.shiftKey)
            deselect();
    });

    var viewport = editor.group().attr("id", "viewport");
    if(window.innerHeight / file.height < window.innerWidth / file.width){
        var scale = window.innerHeight / file.height
        var startmatrix = scale + ',0,0,' + scale + ',' + ((window.innerWidth - file.width*scale) / 2) + ',0'
    }
    else{
        var scale = window.innerWidth / file.width
        var startmatrix = scale + ',0,0,' + scale + ',0,' + ((window.innerHeight - file.height*scale) / 2)
    }

    SVG.get('viewport').transform('matrix', startmatrix);

    global_oro_variables.selected = viewport.set();

    selection = editor.set();

    var gradientRects = editor.group().attr('id', 'gradientRects');

    var connectors = editor.group().attr('id', 'connectors');
    var links = connectors.group().attr('id', 'connectors_links'),
        markers = connectors.group().attr('id', 'connectors_markers')

    var labels = editor.group().attr('id', 'labels');


   /*******
    **  white background for file:
    ********/

    buildWBackground();

    /*******
    **  database SVG file:
    ********/

    console.orolog('load file template')

    renderedTemplates["show_meteor_file_svg"] = Blaze.renderWithData(Template.show_meteor_file_svg, {"_id":this.data._id}, document.getElementById("viewport"));
    //var g0 = SVG(fileId);
    g0 = SVG(fileId);

    console.orolog('/load file template')

    /*******
    **  minimap:
    ********/

    var minimap = editor.group().attr("id",'minimap');
    var minimapgr = minimap.group().attr("id","minimapgr");
    var doc = minimapgr.rect(this.data.width,this.data.height).fill({ color: '#4178D7'}).attr("id","mini_doc").opacity(0.4);
    var d = minimapgr.rect(x,y).fill({color: '#BB6F8D'}).attr("id","mini_display").opacity(0.4);
    buildMinimap(x,y);
    scaleMinimap(startmatrix)

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
        console.orolog('locked');
        Session.set('lockPanZoom', 'false');
        console.orolog(Session.get('lockPanZoom'))
    });
    unlocked.on('mouseover',function(e){
        this.opacity(1);
    });
    unlocked.on('mouseout',function(e){
        this.opacity(0.6);
    });
    unlocked.on('click',function(e){
        console.orolog('unlocked');
        Session.set('lockPanZoom', 'true');
        console.orolog(Session.get('lockPanZoom'))
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

    // mousetext coordinate

    var text = editor.text('').attr('id', 'coordText').move(0,0).font({size:13})
    var mouse = defs.image('/file/7sFZ5vdswa6eoQsx3/0.02').attr('id','coordMouse')
    var mousegroup = editor.group().attr('id', 'mousegroup');
    Session.set('miceEnabled', false);
/*
    this.autorun(function(){
        var f = File.findOne({_id: Session.get('fileId')});
        if(f.selected){
            //console.orolog(f.selected);
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
*/

    /*******
    **  resize minimap, grey background on window resize:
    ********/

    this.autorun(function(){
        var win = Session.get("window");
        buildMinimap(win.w,win.h);
        grey.size(win.w,win.h);
        SVG.get("lockButton").move(win.w-30, win.h-30);
        SVG.get("chatButton").move(win.w-30,0);
        SVG.get("chatRect").move(win.w-iconsize-2, 30)
        //$('#filebrowserModalModal').css('width', String(win.w*9/10)+'px').css('height', String(win.h*9/10)+'px');
        if(SVG.get('gradientRects').first())
            var h = SVG.get('gradientRects').first().height();
        else
            var h = 40;
        var l = SVG.get('gradientRects').children().length;
        SVG.get('gradientRects').move(1, win.h-h*l-1);
    });

    this.autorun(function(){
        var lock = Session.get('lockPanZoom');
        if(lock)
            togglePanZoom();
    });

    this.autorun(function(){
        var ff = File.findOne({_id: Session.get('fileId')})
        if(ff) {
            var users = ff.selected;
            if(!users)
                users = []
            if(users.length > 1 && Session.get('miceEnabled') ){
                Session.set('userIds', users)
                users.splice(users.indexOf(Meteor.userId()),1);
                console.orolog(users)
                var us = Meteor.users.find({_id: {$in: users}}, {fields: {parameters: 1}}).fetch();
                console.orolog(us);
                for(u in us){
                    if(us[u].parameters && us[u].parameters.mousecoord){
                        var p = us[u].parameters.mousecoord
                        console.orolog(p);
                        if(!SVG.get('coordMouse_'+us[u]._id))
                            mousegroup.use(SVG.get('coordMouse')).attr('id', 'coordMouse_'+us[u]._id).attr('mousex', p.x).attr('mousey', p.y);
                        var view = SVG.get('viewport').node.getCTM();
                        var pp = transformPoint(p.x, p.y, [view])
                        console.orolog(pp)
                        SVG.get('coordMouse_'+us[u]._id).move(pp[0],pp[1]);
                    }
                }
            }
            else
                Session.set('userIds', [])
        }
    })

    this.autorun(function(){
        var us = Meteor.users.find({_id: {$in: Session.get('userIds')}}, {fields: {parameters: 1}}).fetch();
        if(Session.get('miceEnabled')){
            for(u in us){
                if(us[u].parameters && us[u].parameters.mousecoord){
                    var p = us[u].parameters.mousecoord
                    if(!SVG.get('coordMouse_'+us[u]._id))
                        mousegroup.use(SVG.get('coordMouse')).attr('id', 'coordMouse_'+us[u]._id);
                    var view = SVG.get('viewport').node.getCTM()
                    var pp = transformPoint(p.x, p.y, [view])
                    console.orolog(p)
                    console.orolog(pp)
                    SVG.get('coordMouse_'+us[u]._id).move(pp[0],pp[1]).attr('id', 'coordMouse_'+us[u]._id).attr('mousex', p.x).attr('mousey', p.y);
                }
            }
        }
    })

    console.orolog('/render svgEditor')
}

Template.svgEditor.events({
    'mousemove #svgEditor': function(event){
        var invview = SVG.get('viewport').node.getCTM().inverse()
        var p = transformPoint(event.clientX, event.clientY, [invview])
        var box = SVG.get('coordText').bbox()
        //if(box.width < 10)
        //    box.width = 100;
        if(event.clientX + box.width < window.innerWidth)
            var deltax = 10
        else
            var deltax = -10 - box.width - 10;
        if(event.clientY + box.height < window.innerHeight)
            var deltay = 0
        else
            var deltay = - 10 - box.height
        SVG.get('coordText').text(function(add){
            add.tspan(p[0].toFixed(1));
            add.tspan(p[1].toFixed(1)).newLine();
        }).move(event.clientX + deltax, event.clientY + deltay)
        if(Session.get('userIds').length > 0 && Session.get('miceEnabled')){
            var parameters = Meteor.user().parameters;
            if(!parameters)
                parameters = {}
            parameters.mousecoord = {x:p[0], y: p[1]};
            Meteor.users.update({_id:Meteor.userId()}, {$set: {parameters: parameters}})
        }
    }
})

/*
Template.svgCodeEditor.helpers({
    codeeditorheight: function(){
        return Session.get('window').h - 150;
    }
});
*/
/*
Template.csvModal.helpers({
    csvmodalheight: function(){
        return Session.get('window').h - 150;
    }
});

Template.qrcodeModal.helpers({
    qrcodehref: function(){
        return 'https://chart.googleapis.com/chart?chs=400x400&cht=qr&chl=' + encodeURI(document.URL) + '&choe=UTF-8';
    },
    height: function(){ return '400px'; },
    width: function(){ return '400px' }
})
*/

//markdown goodies courtesy of https://github.com/SubjectRaw/SubjectRaw/blob/gh-pages/md.html
function goto(anchor){
  element_to_scroll_to = $('a[name='+anchor+']')
  element_to_scroll_to[0].scrollIntoView();
}


function getLineNo(text,level){
    var t = text.replace(/\[/,"\\[").replace(/\(/,"\\(").replace(/\)/,"\\)");
    var re = new RegExp(t);
    for (var i = loc;i<val_arr.length;i++){
        if (val_arr[i].search(re)>-1){
          loc = i+1;
          return i+1;
        }
    }
}
var levels = [], uniq = [], temp_head="", levPoint = [null], loc=0, val_arr=[], val="";

function addHeading(text, level, ln){
    if (uniq[text] == undefined) {
        uniq[text] =1;
    } else {
        uniq[text] =1+uniq[text];
        text = text+" "+uniq[text];
    }
    temp_head = text;
    if (levels.length == 0) {
    levels.push({parent: null, node: text, icon: "", ln: ln})
    levPoint[level-1] = levels[level-1]
  } else {
    levels.push({parent: levPoint[level-2], node: text, icon: "", ln: ln})
    levPoint[level-1] = levels[levels.length-1]
  }
  return text;
}

var codes=[], images=[],last_code="";

function addCode(code){
    last_code = code;
    console.orolog(codes)
    console.orolog(codes[code])
    console.orolog(temp_head)
    if (codes[code] == undefined) {
        codes[code]= {
            data: code.toLowerCase().replace(/[^\w]+/g, '-'),
            icon: "",
            text: code,
            children: [{data: temp_head.toLowerCase().replace(/[^\w]+/g, '-'), text: temp_head}]
        }
    } else {
        codes[code].children.push({data: temp_head.toLowerCase().replace(/[^\w]+/g, '-'), text: temp_head})
    }
}

function addImage(href, title, text){
    console.info(title,text);

    if (images[title] == undefined) {
        images[title]= {
        data: title.toLowerCase().replace(/[^\w]+/g, '-'),
        icon: "",
        text: title,
        children: [{data: temp_head.toLowerCase().replace(/[^\w]+/g, '-'), text: temp_head}]
    }
    } else {
        images[title].children.push({data: temp_head.toLowerCase().replace(/[^\w]+/g, '-'), text: temp_head})
    }
}


String.repeat = function(string, num){ return new Array(parseInt(num) + 1).join(string); };

//multimarked
function validateURL(textval) {
      var urlregex = new RegExp(
            "^(http|https|ftp)\://([a-zA-Z0-9\.\-]+(\:[a-zA-Z0-9\.&amp;%\$\-]+)*@)*((25[0-5]|2[0-4][0-9]|[0-1]{1}[0-9]{2}|[1-9]{1}[0-9]{1}|[1-9])\.(25[0-5]|2[0-4][0-9]|[0-1]{1}[0-9]{2}|[1-9]{1}[0-9]{1}|[1-9]|0)\.(25[0-5]|2[0-4][0-9]|[0-1]{1}[0-9]{2}|[1-9]{1}[0-9]{1}|[1-9]|0)\.(25[0-5]|2[0-4][0-9]|[0-1]{1}[0-9]{2}|[1-9]{1}[0-9]{1}|[0-9])|([a-zA-Z0-9\-]+\.)*[a-zA-Z0-9\-]+\.(com|edu|gov|int|mil|net|org|biz|arpa|info|name|pro|aero|coop|museum|[a-zA-Z]{2}))(\:[0-9]+)*(/($|[a-zA-Z0-9\.\,\?\'\\\+&amp;%\$#\=~_\-]+))*$");
      return urlregex.test(textval);
    }

var umls =[];
var toc = [];

//$('#cont1').width("100%").height("100%").split({orientation:'vertical', limit:2, position: 4});
  //$('#centerRight').width("100%").height("100%").split({orientation:'vertical', limit:2, position: 8});
/*
    var editor = ace.edit("editor");
    //editor.setTheme("ace/theme/monokai");
    editor.getSession().setMode("ace/mode/markdown");
    editor.on("change", function(e){

        uml =editor.getSession().getValue();
        umls =[];
        toc = [];
        markit();
        MathJax.Hub.Queue(["Reprocess", MathJax.Hub, "md"])
    })
*/
function renderAll() {
        for (var ii = 0 ; ii < umls.length; ii++) {
            console.orolog('uml_'+ii)
            var canvas = document.getElementById('uml_'+ii);

            nomnoml.draw(canvas, umls[ii]);

        };
        //$("canvas").attr({width:"1100"})
    }

/*Template.markdownFileMd.onRendered(function(){

    //$("head").append('<script src="/jquery.splitter-0.15.0.js"></script>')
    $("head").append('<link href="/jquery.splitter.css" rel="stylesheet"/>')
    $("body").append('<script> var hash = window.location.hash; console.orolog(hash); if(document.getElementById(hash.substring(1))){ document.getElementById(hash.substring(1)).scrollIntoView(true);} </script>');

    var renderer = new marked.Renderer();
    var content =""

    renderer.heading = function (text, level) {
    var escapedText = text.toLowerCase().replace(/[^\w]+/g, '-');

      return '<h' + level + '><a name="' +
                    escapedText +
                     '" class="anchor" href="#' +
                     escapedText +
                     '"><span class="header-link"></span></a>' +
                      text + '</h' + level + '>';
    }

    renderer.code = function(code, lang, escaped) {
      if (this.options.highlight) {
        var out = this.options.highlight(code, lang);
        if (out != null && out !== code) {
          escaped = true;
          code = out;
        }
      }

      if (!lang) {
        return '<pre><code>'
          + (escaped ? code : escape(code, true))
          + '\n</code></pre>';
      }

      if (lang == "uml") {
        //console.orolog(validateURL("http://localhost/nomnoml-librarify/uml.txt"));
        if (validateURL(code)){
            //console.orolog(code);
            var location  = umls.length;
            umls.push("code");
            $.get(
               code,
               function(data, textStatus, jqXHR) {
                  //load the iframe here...
                  //console.orolog(data);
                  umls[location]=data;
                  //return '<canvas id="uml_'+(umls.length-1)+'"></canvas>';
                  renderAll();
               }
            );
            //return "";
        } else {
            umls.push(code);
        }

        return '<div class="fit"><canvas id="uml_'+(umls.length-1)+'"></canvas><div>';

      }

      return '<pre><code class="'
        + this.options.langPrefix
        + escape(lang, true)
        + '">'
        + (escaped ? code : escape(code, true))
        + '\n</code></pre>\n';
    };

    val = File.find().fetch()[0].script;
    val_arr = val.split("\n");
    var out = marked(val , {
        xhtml: true,
        renderer: renderer,
        gfm: true,
        tables: true,
        breaks: false,
        pedantic: false,
        sanitize: true,
        smartLists: true,
        smartypants: false
    });


    Blaze.renderWithData(Template.markdownTemplate, {markdowndata: out}, document.getElementById('markdownTemplate'))

})*/

Template.markdownFileMd.helpers({
    markdowndata: function(){
        return File.find().fetch()[0].script;
    }
})

Template.svgDinamic.onRendered(function(){

    console.orolog('get script dependencies')
    var js_dep = File.findOne({_id: "Yq9iqYhEma9z9mYrp"}).dependencypath;
    var cssfiles = separate_deps(js_dep,"text/css");
    var jsfiles = separate_deps(js_dep,"application/javascript");
    console.orolog('/get script dependencies')

    this.data = this.data.file;

    console.orolog('load scripts')
    for(var i in jsfiles){
        $("head").append('<script type="application/javascript" src="/file/' + jsfiles[i]._id + '">');
    }
    $("head").append('<script type="application/javascript" src="/svgextend.js">');
    $("head").append('<script type="application/javascript" src="/connectableextend.js">');
    for(var i in cssfiles){
        $("head").append('<link rel="stylesheet" type="text/css" href="/file/' + cssfiles[i]._id + '">');
    }
    console.orolog('/load scripts');

     /*******
    **  variables:
    ********/

    var fileId = this.data._id;
    var file = this.data;
    Session.set("fileId", fileId);
    Session.set('fileWidth', this.data.width);
    Session.set('fileHeight', this.data.height);
    Session.set("enableEdit", 'false');

    var editor = SVG("svgEditor").size(file.width,file.height);
    var viewport = editor.group().attr("id", "viewport");
    var gradientRects = editor.group().attr('id', 'gradientRects');
    var connectors = editor.group().attr('id', 'connectors');
    var links = connectors.group().attr('id', 'connectors_links'),
        markers = connectors.group().attr('id', 'connectors_markers')
    var labels = editor.group().attr('id', 'labels');

    buildWBackground();

    console.orolog('load file template')
    renderedTemplates["show_meteor_file_svg"] = Blaze.renderWithData(Template.show_meteor_file_svg, {"_id":this.data._id, dinamic: true}, document.getElementById("viewport"));
    //var g0 = SVG(fileId);
    g0 = SVG(fileId);
    console.orolog('/load file template')

    this.autorun(function(){
        var win = Session.get("window");
        var a = Math.min(win.w,win.h)

        if(file.height > file.width)
            var scale = a / file.height
        else
            var scale = a / file.width

        SVG.get('viewport').transform('matrix', scale + ',0,0,' + scale + ',0,0');

        if(SVG.get('gradientRects').first())
            var h = SVG.get('gradientRects').first().height();
        else
            var h = 40;
        var l = SVG.get('gradientRects').children().length;
        SVG.get('gradientRects').move(1, win.h-h*l-1);
    });

});

Template.gcodeSimulation.onRendered(function(){

    //Polymer Polyfill Libraries
    //$("head").append('<script type="application/javascript" src="http://api.jscut.org/bower_components/platform/platform.js">');
    //Polymer Components
    $("head").append('<link rel="import" href="http://api.jscut.org/bower_components/core-localstorage/core-localstorage.html">');
    $("head").append('<link rel="import" href="http://api.jscut.org/bower_components/paper-slider/paper-slider.html">');
    //jscut Components
    $("head").append('<link rel="import" href="http://api.jscut.org/api/jscut-simulate-gcode.html">');
/*
    document.addEventListener('polymer-ready', function () {
        var top = document.querySelector('#top');
        top.cutterDiameter = 0.125;
        top.cutterHeight = 1;
            top.gcode =
                'G1 Z0.1 F100\n'+
                'G1 X0 Y0 F100\n'+
                'G1 Z0.0000\n'+
                'G1 Z-0.1250 F20\n'+
                'G1 X1 Y1 F40\n';
    });
*/
})

Template.gcodeSimulation.helpers({
    cutterDiameter: 0.125,
    cutterHeight: 1,
    gcode : function(){
        return File.findOne().script;
    }
})

Template.gcode.onRendered(function(){/*
    var mainSvg = Snap("#MainSvg");
    var materialSvg = Snap("#MaterialSvg");
    var contentGroup = mainSvg.group();
    contentGroup.attr("filter", mainSvg.filter(Snap.filter.contrast(.5)).attr("filterUnits", "objectBoundingBox"));
    var combinedGeometryGroup = mainSvg.g();
    var tabsGroup = mainSvg.g();
    var toolPathsGroup = mainSvg.g();
    var selectionGroup = mainSvg.g();
    var renderPath;

    var svgViewModel;
    var materialViewModel;
    var selectionViewModel;
    var toolModel;
    var operationsViewModel;
    var tabsViewModel;
    var gcodeConversionViewModel;
    var miscViewModel = {};

    svgViewModel = new SvgViewModel();
    materialViewModel = new MaterialViewModel();
    selectionViewModel = new SelectionViewModel(svgViewModel, materialViewModel, selectionGroup);
    toolModel = new ToolModel();
    operationsViewModel = new OperationsViewModel(
        miscViewModel, options, svgViewModel, materialViewModel, selectionViewModel, toolModel, combinedGeometryGroup, toolPathsGroup,
        function () { gcodeConversionViewModel.generateGcode(); });
    tabsViewModel = new TabsViewModel(
        miscViewModel, options, svgViewModel, materialViewModel, selectionViewModel, tabsGroup,
        function () { gcodeConversionViewModel.generateGcode(); });
    gcodeConversionViewModel = new GcodeConversionViewModel(options, miscViewModel, materialViewModel, toolModel, operationsViewModel, tabsViewModel);


    var gcode = gcodeConversionViewModel.gcode();
    console.orolog(gcode)*/
})
/*
Template.gcode.events({
    '#MainSvg click': function (e) {
        var element = Snap.getElementByPoint(e.pageX, e.pageY);
        if (element != null) {
            operationsViewModel.clickOnSvg(element) || tabsViewModel.clickOnSvg(element) || selectionViewModel.clickOnSvg(element);
            if (selectionViewModel.selNumSelected() > 0) {
                tutorial(3, 'Click "Create Operation" after you have finished selecting objects.');
            }
        }
    });
})
  */
Template.svgViewer.onRendered(function(){
    //$("head").append('<script type="application/javascript" src="/sanitizesvg.js">')
    var self = this;
    $('body').addClass('no_scroll');
    $.ajax({
        url: this.data.url,
        success: function(data){
            var data = new XMLSerializer().serializeToString(data)
            var viewer = SVG('svgViewer').size(10000,10000)
            var defs = viewer.defs().attr('id', 'viewerDefs');
            var grey = viewer.rect(10,10).attr("id","grey_background").fill("#A9A9A9");
            var viewport = viewer.group().attr("id", "viewport");
            var background = SVG.get('viewport').rect(10,10).fill("#FFFFFF").move(0,0).attr("id", "background");
            var box = {}
            var imported = viewport.svg(data);
            var svg = imported.roots()[0]
            var kids = clone(svg.children())

            var newlayers = [], index = 0;
            for(var i = 0; i < kids.length; i++){
                if(kids[i].type == 'g'){
                    if(newlayers[index]){
                        index ++;
                    }
                }
                else if(kids[i].type != 'defs'){
                    if(!newlayers[index])
                        newlayers[index] = svg.group().attr("type", "layer");
                    newlayers[index].add(SVG.get(kids[i].attr('id')));
                }
            }
            console.orolog('no of kids: ' + svg.children().length)
            console.orolog(svg.children())


            Session.set("fileId", svg.attr('id'))

            if(svg.attr('height') && svg.attr('width')){
                box.height = svg.attr('height')
                box.width = svg.attr('width')
                //if points, ~convert to px
                if(typeof box.height == 'string' && box.height.indexOf('pt') != -1)
                    box.height = parseFloat(box.height) * 1.333
                else
                    box.height = parseFloat(box.height)
                if(typeof box.width == 'string' && box.width.indexOf('pt') != -1)
                    box.width = parseFloat(box.width) * 1.333
                else
                    box.width = parseFloat(box.width)
            }
            else
                var box = svg.bbox();
            Session.set('fileWidth', box.width)
            Session.set('fileHeight', box.height)
            grey.size(box.width,box.height)
            background.size(box.width,box.height)

            if(window.innerHeight / box.height < window.innerWidth / box.width){
                var scale = window.innerHeight / box.height
                var startmatrix = scale + ',0,0,' + scale + ',' + ((window.innerWidth - box.width*scale) / 2) + ',0'
            }
            else{
                var scale = window.innerWidth / box.width
                var startmatrix = scale + ',0,0,' + scale + ',0,' + ((window.innerHeight - box.height*scale) / 2)
            }
            SVG.get('viewport').transform('matrix', startmatrix);

            var minimap = viewer.group().attr("id",'minimap');
            var minimapgr = minimap.group().attr("id","minimapgr");
            var doc = minimapgr.rect(box.width, box.height).fill({ color: '#4178D7'}).attr("id","mini_doc").opacity(0.4);
            var d = minimapgr.rect(window.innerWidth, window.innerHeight).fill({color: '#BB6F8D'}).attr("id","mini_display").opacity(0.4);
            buildMinimap(box.width,box.height);
            scaleMinimap(startmatrix)

            var layersg = viewer.group().attr("id","layersGroup");
            var text = viewer.text('').attr('id', 'coordText').move(0,0).font({size:13})

            global_oro_variables.svgPan = SVGPan(document.getElementById('svgViewer'), {
                enablePan: true,
                enableZoom: true,
                enableDrag: false,
                zoomScale: 0.2,
                callback: function(a){
                    a = a || SVG.get("viewport").node.getCTM();
                    var matrix = a.a + ","+a.b + ","+a.c + ","+a.d + ","+a.e + ","+a.f;
                    scaleMinimap(matrix);
                    SVG.get("viewport").transform("matrix", matrix);
                }
            });

            var addtext = viewer.text('Clone to Oroboro').attr('id', 'addtext').opacity(0.5).hide();
            var add = viewer.image('/file/JZXXMo5N38iwgfNAG/0.02').opacity(0.5).loaded(function(loader) {
                //this.size(loader.width, loader.height)
                this.move(window.innerWidth-loader.width+3, 4)
            }).on('mouseover', function(e){
                this.opacity(0.2)
                SVG.get('addtext').show();
                SVG.get('addtext').move(window.innerWidth-addtext.bbox().width, 0)
            }).on('mouseout', function(e){
                this.opacity(0.5)
                SVG.get('addtext').hide();
            }).on('click', function(e){
                if(Meteor.userId())
                    Meteor.call('insert_document', 'File', {fileType: "image/svg+xml", original: self.data.url, width: 1448, height: 1024, permissions: {view: [], edit: [Meteor.userId()]}, creatorId: Meteor.userId(), noofchildren: 0}, function(err, id){
                        console.orolog(err)
                        console.orolog(id)
                        SVG.get(Session.get('fileId')).attr('id', id)
                        Session.set('fileId', id);
                        Meteor.call('insert_document', 'Dependency', {fileId1: id, fileId2: '4wtih642DRCZ5eFxq', type: 1})
                        absorbSVG(SVG.get(id).node.outerHTML);
                        window.open('/filem/'+id, '_blank')
                    })
                else
                    window.open('/browse/file/JZXXMo5N38iwgfNAG/1/3', '_blank')
            })

            self.autorun(function(){
                var win = Session.get("window");
                buildMinimap(win.w,win.h);
                grey.size(win.w,win.h);
                if(SVG.get("layersGroup"))
                    SVG.get("layersGroup").clear();
                createStaticLayerMenu(win.w,win.h);
                add.move(win.w-add.attr('width')+3, 4)
            });
        }
    });
});

Template.svgViewer.events({
    'mousemove #svgViewer': function(event){
        var invview = SVG.get('viewport').node.getCTM().inverse()
        var p = transformPoint(event.clientX, event.clientY, [invview])
        var box = SVG.get('coordText').bbox()
        if(event.clientX + box.width < window.innerWidth)
            var deltax = 10
        else
            var deltax = -10 - box.width - 10;
        if(event.clientY + box.height < window.innerHeight)
            var deltay = 0
        else
            var deltay = - 10 - box.height
        SVG.get('coordText').text(function(add){
            add.tspan(p[0].toFixed(1));
            add.tspan(p[1].toFixed(1)).newLine();
        }).move(event.clientX + deltax, event.clientY + deltay)
    }
})


/*
Template.chatterModal.rendered = function(){
    $('#chatterModal').modal();

    this.autorun(function(){
        var f = File.findOne({_id: Session.get('fileId')});
        if(f.selected){
            console.orolog(f.selected);
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
