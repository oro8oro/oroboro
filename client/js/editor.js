buildMenu = function buildMenu(editor,subject){   
    console.log(subject); 
    var group = Group.findOne({uuid: subject});
    console.log(group);
    var menu = editor.group().attr("id", "svgMenu").attr("uuid", subject);
    recursive_group_client(menu, group);
    var kids = menu.children();
    for(var k in kids)
        kids[k].scale(global_oro_variables.menu_scale ,global_oro_variables.menu_scale);
}

menuItemBox = function menuItemBox(){
    if(global_oro_variables.selected.members.length > 0 ){
        var elem = global_oro_variables.selected.members[0];
        var selected = SVG.get(elem.attr("selected"));
        console.log("Type: ", selected.attr("type"));
        if(selected.parent.attr("type") != 'layer'){
            var selectedgroup = Group.findOne({_id: selected.parent.attr("id")}).selected;
            console.log(selectedgroup)
            var id;
            if(selectedgroup != 'null' && selected.parent.parent && selected.parent.parent.attr("type") != 'layer'){
                id = selected.parent.parent.attr("id")
                console.log(id)
                deselect();
                var selector = buildSelector(id, selected.parent.parent.attr("type"));
            }
            if(selectedgroup == 'null'){
                id = selected.parent.attr("id")
                deselect();
                var selector = buildSelector(id, selected.parent.attr("type"));
            }
            if(selector){
                global_oro_variables.selected.add(selector);
                console.log(id);
                Meteor.call('update_document', 'Group', id, {selected: Meteor.userId()});
                showDatGui();
                Session.set("selected", "true");
            }
        }
    }
}
menuItemGroup = function menuItemGroup(){
    if(global_oro_variables.selected.members && global_oro_variables.selected.members.length > 0){
        var selected = global_oro_variables.selected.members;
        var first = SVG.get(selected[0].attr("selected"));
        var doc = {groupId: first.parent.attr('id'), type: 'simpleGroup', ordering: first.parent.index(first)};
        var ids = [];
        for(s in selected)
            ids.push(selected[s].attr("selected"));
        doc.locked = ids.join(',');
        insertGroup(doc, function(id){
            for(i in ids)
                Item.update({_id: ids[i]}, {$set: {groupId: id, locked: id}});
            //todo reset ordering (-index);
        })
        /*
        Meteor.call('insert_document', 'Group', doc, function(error, id){
            if(error)
                console.log(error);
            if(id)
                for(i in ids)
                    Item.update({_id: ids[i]}, {$set: {groupId: id}});   
        });*/
    }
}

menuItemUnGroup = function menuItemUnGroup(){
    if(global_oro_variables.selected.members && global_oro_variables.selected.members.length > 0){
        var group = SVG.get(global_oro_variables.selected.members[0].attr("selected"));
        if(group.type == 'g'){
            if(group.attr('locked') && group.attr('locked') != 'null')
                menuItemLockGroup()
            var grids = [], itids = [], newid = group.parent.attr("id"), type = group.attr('type');
            group.each(function(i,children){
                if(this.type == 'g')
                    grids.push(this.attr("id"))
                else
                    itids.push(this.attr("id"))
            });
            console.log(itids)
            console.log(grids)

            var upd = {groupId: newid}

            for(var i in grids)
                Meteor.call('update_document', 'Group', grids[i], upd);
            
            if(type != 'parametrizedGroup')
                for(var i in itids)
                    Meteor.call('update_document', 'Item', itids[i], upd);
            else{
                var elements = Group.findOne({_id: group.attr('id')}).parameters.params.elements;
                for(var i in elements){
                    var elem = Item.findOne({_id: elements[i]})
                    var collection = 'Item'
                    if(!elem){
                        elem = Group.findOne({_id: elements[i]})
                        collection = 'Group'
                    }
                    if(elem){
                        var parameters = elem.parameters
                        if(parameters && parameters.parametrizedGroup){
                            upd.parameters = parameters
                            delete upd.parameters.parametrizedGroup;
                        }
                        Meteor.call('update_document', collection, elements[i], upd);
                    }
                }/*
                for(var i in itids){
                    
                    var parameters = Item.findOne({_id: itids[i]}).parameters
                    if(parameters && parameters.parametrizedGroup){
                        upd.parameters = parameters
                        delete upd.parameters.parametrizedGroup;
                    }
                    Meteor.call('update_document', 'Item', itids[i], upd);
                }*/
            }

            removeGroup(group.attr("id"));
            /*
            Meteor.call('remove_document', 'Group', group.attr("id"));
            var gids = File.findOne({_id: Session.get('fileId')}).groupids;
            gids.splice(gids.indexOf(group.attr("id")),1);
            Meteor.call('update_document', 'File', Session.get('fileId'), {groupids: gids})*/
        }
    }
}

menuItemLockGroup = function menuItemLockGroup(){
    if(global_oro_variables.selected.members){
        var id = global_oro_variables.selected.members[0].attr('selected');
        if(!SVG.get(id).attr('locked') || SVG.get(id).attr('locked') == 'null'){
            var ids = recursive_group_ids(id);
            Meteor.call('update_document', 'Group', id, {locked: ids.items.join(',')});
            Meteor.call('update_collection', 'Item', ids.items, {locked: id});
        }
        else{
            var ids = SVG.get(id).attr('locked').split(',');
            Meteor.call('update_document', 'Group', id, {locked: 'null'});
            Meteor.call('update_collection', 'Item', ids, {locked: 'null'});
        }
    }
}

menuItemCode = function menuItemCode(){
    var fileId = Session.get("fileId");
    var script = '';
    if(global_oro_variables.selected.members.length > 0 ){
        var selected = global_oro_variables.selected.members;
        for(var s in selected){
            var id = selected[s].attr("selected");
            script = script + SVG.get(id).node.outerHTML;
        }
    }
    else
        script = '<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" id="' + fileId + '" width="' + SVG.get(fileId).width() + '" height="' + SVG.get(fileId).height() + '">' + $('#' + fileId).html() + '</svg>';

    //$('#CodeEditorModalTextarea').html(htmlEntities(script));
    //$('#CodeEditorModal').modal({backdrop: true, show: true});

    //$('#svgCodeEditorContent').html(htmlEntities(script));
    //$('#svgCodeEditor').modal('show')
    Modal.open({
        content: htmlEntities(script),
        //draggable: true,
        width: '80%',
        height: '80%',
        closeCallback: togglePanZoom
      });
    if(!$('#modalsave')[0])
        $('#modal-container').append('<button id="modalsave" onclick="menuItemCodeSave();">save</button>')

    disablePan();
}
 //no6SyimLtb6yac9cw
updateItemDB = function updateItemDB(item, groupId, locked){
    //todo: see other attributes;
    var palette = {}, upd = {};
    palette = {fillColor:  item.attr("fill"), strokeColor: item.attr("stroke"), strokeWidth: String(item.attr("stroke-width"))}
    if(item.attr("fill-opacity") && item.attr("fill-opacity") != 'null')
        palette.fillOpacity = String(item.attr("fill-opacity"))
    if(item.attr("stroke-opacity") && item.attr("stroke-opacity") != 'null')
        palette.strokeOpacity = String(item.attr("stroke-opacity"))
    if(item.attr("stroke-dasharray") && item.attr("stroke-dasharray") != 'null')
        palette.strokeDasharray = item.attr("stroke-dasharray")
    if(item.attr("stroke-linejoin") && item.attr("stroke-linejoin") != 'null')
        palette.strokeLinejoin = item.attr("stroke-linejoin")
    if(item.attr("stroke-linecap") && item.attr("stroke-linecap") != 'null')
        palette.strokeLinecap = item.attr("stroke-linecap")
    if(item.attr("opacity") && item.attr("opacity") != 'null')
        palette.opacity = String(item.attr("opacity"));
    upd.palette = palette;
    if(item.type == "path"){
        if(checkPathType(item) == "simple"){
            upd.type = "simple_path"
            upd.pointList = JSON.stringify(pathArraySvgOro(item.array.value))
        }
        else{
            upd.type = "complex_path";
            item = simplifyCPath(item);
            upd.pointList = item.attr("d");
        }
    }
    else
        if(item.type == "text"){
            upd.type = "text"
            upd.pointList = item.x() + ',' + item.y();
            upd.text = item.text();
        }
        else
            if(item.type == "image" || item.type == "img"){
                upd.type = "rasterImage"
                upd.pointList = item.x() + ',' + item.y() + ',' + item.attr("width") + ',' + item.attr("height");
                if(item.attr("href"))
                    upd.text = item.attr("href")
            }
            else
                if(["ellipse", "circle", "rect"].indexOf(item.type) != -1){
                    if(item.type == "ellipse")
                        var param = ellipseToCPath(item);
                    if(item.type == 'circle')
                        var param = circleToCPath(item);
                    if(item.type == 'rect')
                        var param = rectToPath(item);
                    upd.pointList = param.pointList;
                    upd.type = param.type;
                    upd.parameters = param.parameters;
                    upd.closed = "true";
                }
                else 
                    if(['line', 'polyline', 'polygon'].indexOf(item.type) != -1){
                        upd.type = "simple_path";
                        if(item.type == 'line'){
                            upd.pointList = lineToPath(item);
                            upd.closed = "false";
                        }
                        if(item.type == 'polyline'){
                            upd.pointList = polylineToPath(item);
                            upd.closed = "false";
                        }
                        if(item.type == 'polygon'){
                            upd.pointList = polylineToPath(item);
                            upd.closed = "true";
                        }
                    }

    upd.groupId = groupId;
    if(locked)
        upd.locked = groupId;
    //todo: parameters
    console.log(upd);
    var id = item.attr("id");
    console.log(id);
    if(Item.findOne({_id: id})){
        console.log('update');
        Meteor.call('update_document', 'Item', id, upd);
    }
    else{
        console.log('insert');
        insertItem(upd);
    }
}

updateGroupDB = function updateGroupDB(group, parentId, layer, locked){
    var upd = {};
    var id = group.attr("id");
    console.log(id);
    if(group.attr("opacity"))
        upd.transparency = group.attr("opacity");
    if(layer){
        upd.type = "layer";
        upd.fileId = parentId;
        var query = {_id: id, fileId: parentId};
    }
    else{
        upd.type = "simpleGroup";
        upd.groupId = parentId;
        var query = {_id: id, groupId: parentId};
    }
    var m = group.transform();
    if(m.a != 1 || m.b != 0 || m.c != 0 || m.d != 1 || m.e != 0 || m.f != 0)
        upd.transform = [m.a, m.b, m.c, m.d, m.e, m.f].join(',');
    console.log(upd);
    if(Group.findOne({_id: id})){
        console.log('update');
        Meteor.call('unset_document', 'Group', id, ['groupId', 'fileId']);
        Meteor.call('update_document', 'Group', id, upd);
        group.each(function(i, children) {
            if(this.type == 'g')
                updateGroupDB(this, id, false);
            else
                if(this.type != 'defs')
                    updateItemDB(this, id);
        });
    }
    else{
        //don't know if updateGroupDB & ItemDB can be called from a callback to insertGroup(upd,callb);
        insertGroup (upd, function(id){
            console.log(id);
                group.each(function(i, children) {
                    if(this.type == 'g')
                        updateGroupDB(this, id, false);
                    else
                        if(this.type != 'defs')
                            updateItemDB(this, id);
                });
        })
    }
}

updateFileDB = function updateFileDB(root){
    var id = Session.get('fileId')
    var dbids = file_components_ids(id)
    , newids = [];
    console.log('dbids: ' + JSON.stringify(dbids));
    if(dbids.items.length > 0 || dbids.groups.length > 0)
        root.each(function(i, children) {
            if(this.type != 'defs' && this.attr('id') != 'connectors_use')
                newids.push(this.attr("id"));
        },true);

    console.log('newids: ' + JSON.stringify(newids))
    var kids = clone(root.children())

    var newlayers = [], index = 0;
    for(var i = 0; i < kids.length; i++){
        if(kids[i].type == 'g'){     
            if(newlayers[index]){
                index ++;
            }
        }
        else if(kids[i].type != 'defs' && kids[i].attr('id') != 'connectors_use'){
            if(!newlayers[index])
                newlayers[index] = root.group().attr("type", "layer");
            newlayers[index].add(SVG.get(kids[i].attr('id')));
        }
    }
    console.log('no of kids: ' + root.children().length)
    console.log(root.children())
    root.each(function(i, children) {
        console.log(this);
        updateGroupDB(this, id, true); 
    }); 
    if(dbids.items.length > 0 || dbids.groups.length > 0)
        for(var i = 0; i < dbids.items.length; i++)
            if(newids.indexOf(dbids.items[i]) == -1){
                var f = File.findOne({_id: Session.get('fileId')});
                if(Group.findOne({_id: dbids.items[i]}))
                    removeGroup(dbids.groups[i]);
                else
                    removeItem(dbids.items[i]);
            }
}

absorbSVG = function absorbSVG(code, its, groupparentId, locked){
    var orig = SVG.get(Session.get("fileId"));
    if(orig){
        //delete layer titles
        while(code.indexOf('<title>') != -1){
            var start = code.indexOf('<title>');
            var end = code.indexOf('</title>') + 7;
            code = code.substring(0,start-1) + code.substring(end+1);
        }
        if(typeof its === 'undefined'){
            //type == 'g' in viewer, type undefined in editor
            if(orig.parent.type)
                orig.remove()
            else
                orig.parent.remove(orig)
            console.log(code)
            var newsvg = SVG.get('viewport').svg(code);
            console.log(newsvg)
            var root = newsvg.roots()[0];
            $(root.node).attr('id', Session.get("fileId"));
            updateFileDB(root);
        }
        else{
            console.log(its);
            itids = Object.keys(its);
            for(i in itids){
                SVG.get(itids[i]).remove();
            }
            console.log(code);
            var newit = SVG.get(Session.get("fileId")).svg(code);
            console.log(newit);
            var newids = [];
            newit.roots(function(){
                console.log(this);
                var itemid = this.attr("id");
                newids.push(itemid);
                if(groupparentId)
                    var parentId = groupparentId;
                else if(Object.keys(its).length > 0)
                        if(its[this.attr("id")])
                            var parentId = its[this.attr("id")];
                        else
                            var parentId = its[Object.keys(its)[0]];
                    else
                        var parentId = SVG.get(Session.get("fileId")).first();
                console.log(parentId);
                if(this.type == 'g')
                    updateGroupDB(this, parentId, locked);
                else{
                    updateItemDB(this, parentId, locked);
                }
            });
            var elemids = Object.keys(its)
            for(var i = 0; i < elemids.length; i++)
                if(newids.indexOf(elemids[i]) == -1){
                    if(Item.findOne({_id: elemids[i]}))
                        removeItem(elemids[i])
                    else
                        removeGroup(elemids[i]);
                }
        }
    }
}

menuItemCodeSave = function menuItemCodeSave(){
    //var code = $('#CodeEditorModalTextarea').val()
    var code = $('#modal-content')[0].textContent,
        ids;
    code = htmlToSvg(htmlEntitiesDecode(code));
    if(global_oro_variables.selected.members && global_oro_variables.selected.members.length > 0){
        var selected = global_oro_variables.selected.members;
        ids = {};
        for(s in selected){
            var id = selected[s].attr("selected");
            ids[id] = SVG.get(id).parent.attr("id");
        }
        deselect();
    }
    absorbSVG(code, ids);
    //$('#CodeEditorModal').modal('hide');
    enablePan();
}

menuItemCsvModal = function menuItemCsvModal(){
    console.log('csvmodal');
    //$('#csvModal').modal({backdrop: true, show: true});
    disablePan();
}

menuItemParseCsv = function menuItemParseCsv(){
    //var csv = $('#csvModalTextarea').val();
    var csv = $('#modal-content')[0].textContent
    var controllers = global_oro_variables.gui.__folders.Upload.__controllers;
    var opt = {};
    for(var i = 3 ; i < controllers.length-1; i++)
        opt[controllers[i].property] = controllers[i].getValue()
    if(opt.uploadType == 'url')
        csv = Papa.parse(csv, {
            download: true,
            header: true,
            skipEmptyLines: true
        })
    else
        csv = Papa.parse(csv, {
            header: true,
            skipEmptyLines: true
        });
    var data = csv.data;
    var keys = csv.meta.fields;
    var optk = Object.keys(opt);
    var defaultv = {};
    console.log(keys);
    var optktemp = []
    for(var i = 0; i < optk.length; i++){
        var ind = keys.indexOf(opt[optk[i]]);
        if( ind == -1 && opt[optk[i]] != '')
            defaultv[optk[i]] = opt[optk[i]];
        if(ind != -1 || opt[optk[i]] != '')
            optktemp.push(optk[i]);
    }
    optk = optktemp;
    console.log(defaultv);
    console.log(optk)
    var parsed = [];
    for(var i = 0; i < data.length; i++){
        var ins = {};
        for(var j = 0; j < optk.length; j++){
            if(defaultv[optk[j]])
                var value = defaultv[optk[j]];
            else
                var value = data[i][opt[optk[j]]];
            if(optk[j] == 'path'){
                var tempItem = SVG.get(Session.get('fileId')).path(value);
                var points = tempItem.array.value;
                if(points[points.length-1][0] == "Z")
                    ins.closed = 'true';
                else
                    ins.closed = 'false';
                if(checkPathType(tempItem) == 'simple'){
                    value = JSON.stringify(pathArraySvgOro(reflectSPath(tempItem.array.value, false, true)));
                    if(optk.indexOf('parameters') != -1)
                        ins.type = 'para_simple_path';
                    else
                        ins.type = 'simple_path';
                }
                else{
                    tempItem = simplifyCPath(tempItem);
                    tempItem.plot(reflectCPath(tempItem.array.value, false, true));
                    value = tempItem.attr("d");
                    if(optk.indexOf('parameters') != -1)
                        ins.type = 'para_complex_path';
                    else
                        ins.type = 'complex_path';
                }
                ins.pointList = value;
                tempItem.remove();
            }
            if(optk[j] == 'parameters'){
                var param = JSON.parse(opt[optk[j]]);
                var paramk = Object.keys(param);
                ins[optk[j]] = {};
                ins[optk[j]].params = {};
                for(var k in paramk){
                    if(data[i][param[paramk[k]]])
                        ins[optk[j]].params[paramk[k]] = data[i][param[paramk[k]]];
                    else
                        ins[optk[j]].params[paramk[k]] = param[paramk[k]];
                    if(Number(ins[optk[j]].params[paramk[k]]))
                        ins[optk[j]].params[paramk[k]] = Number(ins[optk[j]].params[paramk[k]])
                }
            }
            if(optk[j] == 'callback'){
                if(!ins.parameters)
                    ins.parameters = {};
                var t = (data[i][opt[optk[j]]]) ? data[i][opt[optk[j]]] : defaultv[optk[j]];
                ins.parameters.callback = value;
            }
            if(['fillColor', 'fillOpacity', 'strokeColor', 'strokeOpacity', 'strokeWidth', 'strokeLinecap', 'strokeLinejoin', 'strokeDasharray', 'opacity'].indexOf(optk[j]) != -1){
                if(!ins['palette'])
                    ins['palette'] = {};
                ins['palette'][optk[j]] = value;
            }
            if([ 'fontStyle', 'fontWeight', 'fontFamily', 'fontSize', 'anchor' ].indexOf(optk[j]) != -1){
                if(!ins['font'])
                    ins['font'] = {};
                ins['font'][optk[j]] = value;
            }
        }
        parsed.push(ins);
    }
    console.log(parsed);
    if(controllers[0].getValue() == 'separate files'){
        var f = File.findOne({_id: Session.get('fileId')});
        var no = File.find({uuid: f.uuid}).count();
        no++;
        //var deps = Dependency.find({fileId1: id}).fetch(); TODO: non-struct dependencies are cloned? 
        delete f._id;
        if(f.creatorId != Meteor.userId())
            f.permissions.edit = [Meteor.userId()];
        f.creatorId = Meteor.userId();
        f.dateModified = new Date();
        f.permissions.view = [];    
        f.uuid = f.uuid+no;
        f.selected = [];
        console.log(f);
        var parentId = Session.get('fileId'); ////make dependecypath,structuralpath,groupids,itemids
        for(var i = 0 ; i < parsed.length; i++){
            Meteor.call('insert_document', 'Item', parsed[i], function(err, id3){
                if(err) console.log(err);
                if(id3){
                    var para = Item.findOne({_id: id3}).parameters.params;
                    var l = Math.abs(Number(para.left))
                        , r = Math.abs(Number(para.right))
                        , u = Math.abs(Number(para.up))
                        , d = Math.abs(Number(para.down));
                    if(Number(para.left) < 0 && Number(para.right) < 0)
                        f.width = Math.max(l,r) - Math.min(l,r);
                    else
                        f.width = l + r;
                    if(Number(para.up) < 0 && Number(para.down) < 0)
                        f.height = Math.max(u,d) - Math.min(u,d);
                    else
                        f.height = u + d;
                    Meteor.call('insert_document', 'File', f, function(err, id){
                        if(err) console.log(err);
                        if(id){
                            console.log(id);
                            Meteor.call('insert_document', 'Dependency', { fileId1: id, fileId2: parentId, type: 1 });
                            Meteor.call('insert_document', 'Group', {fileId: id, type: "layer"}, function(err, id2){
                                if(err) console.log(err);
                                if(id2){
                                    console.log(id2);
                                    console.log(id3);
                                    Meteor.call('update_document', 'Item', id3, { groupId: id2 }, function(err, res){
                                        if(err) console.log(err);
                                        if(res) console.log(res);
                                    });
                                }
                            })
                        }
                    });
                }
            });
        }
    }
    //itemType - > process.
    //todo: check keys to match db; revalidate keys on insert/update
}

/*
menuItemPalette = function menuItemPalette(){
    $('#Palette').modal({backdrop: false, show: true});
}
*/

removeLayerMenu = function(){
    if(SVG.get("layersGroup"))
        SVG.get("layersGroup").clear();
}

createLayerMenu = function createLayerMenu(x,y){
    var layersg = SVG.get("layersGroup");
    //var layerH = y - SVG.get('minimap').bbox().height - 50;
    var a = Math.min(x,y) * mini_scale;
    var layerH = y - a - 50;
    var layerW = 20;
    //var filelayers = SVG.get(Session.get("fileId")).children();
    var layers = [];
    var rects = [];
    var hidden = [];
    var filelayers = Group.find({fileId: Session.get("fileId")}).fetch();
    for(k in filelayers){
        //if(filelayers[k].attr("type") == 'layer' || filelayers[k].attr("type") == 'menu_item'){
        if(SVG.get(filelayers[k]._id)){
            layers.push(SVG.get(filelayers[k]._id));
            var g = Group.findOne({_id: filelayers[k]._id});
            //layers.push(filelayers[k]);
            //var g = Group.findOne({_id: filelayers[k].attr("id")});
            if(g.parameters)
                if(g.parameters.hide == "true"){
                    hidden.push(filelayers[k]._id);
                    SVG.get(filelayers[k]._id).hide();
                    //hidden.push(filelayers[k].attr("id"));
                    //filelayers[k].hide();
                }
        }
    }
    Session.set("hiddenLayers", hidden);
    var lh = layerH / (layers.length + 1);
    var lx  = x - layerW;
    var ly = 30;
    if(layers.length > 0){
        var alllayers = layersg.rect(layerW,lh).move(lx, ly).fill('#FFFFFF').attr("id","alllayers").opacity(0.6);
        ly = ly + lh;

        alllayers.on('dblclick', function(event){
            if(Session.get("enableEdit") == 'true'){
                insertGroup({fileId: Session.get("fileId"), type: "layer", uuid: "layer_"+(layers.length+1), ordering: layersg.children().length});
                //Meteor.call('insert_document', 'Group', {fileId: Session.get("fileId"), type: "layer", uuid: "layer_"+(layers.length+1), ordering: layersg.children().length});
            }
        });
        alllayers.on('mouseover', function(event){
            SVG.get('background').fill('#FFFFFF');
            this.opacity(1);
            for(k in filelayers){
                SVG.get(filelayers[k]._id).show();
                //filelayers[k].show();
            }
        });
        alllayers.on('mouseout', function(event){
            this.opacity(0.6);
            var hidden = Session.get("hiddenLayers");
            for(h in hidden)
                SVG.get(hidden[h]).hide();
        });
        alllayers.on('click', function(event){
            Session.set("selectedLayer", '');
            Session.set("hiddenLayers", []);
        });
    }
    for(l = layers.length-1; l >=0 ; l--){
        rects[l] = layersg.rect(layerW,lh).move(lx,ly).fill(random_pastels()).attr("id","layerRect_"+l).attr("layer", layers[l].attr("id")).attr("no",l).opacity(0.6);
        ly = ly + lh;

        rects[l].on('mouseover', function(event){
            this.opacity(1);
            SVG.get('background').fill(this.attr("fill"));
            var layerId = this.attr("layer");
            SVG.get(layerId).show();
            for(k in filelayers){
                if(filelayers[k]._id != layerId)
                    SVG.get(filelayers[k]._id).hide();
                //if(filelayers[k].attr("id") != layerId)
                //    filelayers[k].hide();
            }
        });
        rects[l].on('mouseout', function(event){
            this.opacity(0.6);
            var hidden = Session.get("hiddenLayers");
            if(hidden.indexOf(this.attr("layer")) != -1)
                SVG.get(this.attr("layer")).hide();
        });
        rects[l].on('dblclick', function(event){
            if(Session.get("enableEdit") == 'true'){
                var hidden = Session.get("hiddenLayers");
                var layerId = this.attr("layer");
                if(hidden.indexOf(layerId) == -1){
                    SVG.get(layerId).hide();
                    Meteor.call('update_collection', "Group", [layerId], {'parameters.hide': "true"});
                    hidden.push(layerId);
                    Session.set("hiddenLayers", hidden);
                }
                else{
                    SVG.get(layerId).show();
                    Meteor.call('update_collection', "Group", [layerId], {'parameters.hide': "false"});
                    hidden.splice(hidden.indexOf(layerId),1);
                    Session.set("hiddenLayers", hidden);
                }
            }
        });
        rects[l].on('click', function(event){
            if(event.shiftKey){
                removeGroup(this.attr("layer"), true);
            }
            else{
                if(global_oro_variables.selected.members.length > 0){
                    var selections = global_oro_variables.selected.members;
                    var layerId = this.attr("layer");
                    var ids = [];
                    for(var s in selections)
                        ids.push(selections[s].attr("selected"));
                    Meteor.call('update_collection', 'Item', ids, {groupId: layerId});
                    //SVG.get(layerId).add(SVG.get(selections[s].attr("selected")));
                }
                else{
                    if(Session.get("selectedLayer") != this.attr("layer"))   
                        Session.set("selectedLayer", this.attr("layer"));
                    else
                        Session.set("selectedLayer", '');
                }
            }
        });
        rects[l].draggable();
        var iniy, inicy, inix;
        rects[l].on('beforedrag', function(event){
            disablePan();
            event.stopPropagation();
            event.preventDefault();
        });
        rects[l].on('dragstart', function(event){
            iniy = this.attr("y");
            inix = this.attr("x");
            inicy = this.cy();
            disablePan();
            event.stopPropagation();
            event.preventDefault();
        });
        rects[l].on('dragmove', function(event){
            if(this.cy() > inicy)
                var r = this.attr("no") - Math.ceil(Math.floor((this.cy() - inicy) / lh * 2) / 2);
            else
                var r = this.attr("no") + Math.ceil(Math.floor((inicy - this.cy()) / lh * 2) / 2);
            console.log(Math.ceil(Math.floor((inicy - this.cy()) / lh * 2) / 2));
            console.log(Math.floor((inicy - this.cy()) / lh * 2));
            console.log(inicy - this.cy());
            console.log(r);
            if(SVG.get("layerRect_"+r) && this.cy() > SVG.get("layerRect_"+r).y() && this.cy() < (SVG.get("layerRect_"+r).y() + lh)){
                if(r > this.attr("no"))
                    SVG.get("layerRect_"+r).dy(lh);
                else
                    SVG.get("layerRect_"+r).dy(-lh);
            }
        });
        rects[l].on('dragend', function(event){
            if(this.cy() > inicy){
                var r = this.attr("no") - Math.ceil(Math.floor((this.cy() - inicy) / lh * 2) / 2);
                if(SVG.get("layerRect_"+r))
                    var newy = SVG.get('layerRect_'+r).attr("y") + lh;
                else
                    var newy = iniy
            }
            else{
                var r = this.attr("no") + Math.ceil(Math.floor((inicy - this.cy()) / lh * 2) / 2);
                if(SVG.get("layerRect_"+r))
                    var newy = SVG.get('layerRect_'+r).attr("y") - lh;
                else
                    var newy = iniy
            }
            if(r != this.attr("no"))
                this.move(inix, newy);
            else
                this.move(inix, iniy);

            Meteor.call('update_document', "Group", this.attr("layer"), {ordering: r})
            if(r > this.attr("no"))
                for(var i = this.attr("no")+1; i <= r; i++){
                    console.log(i);
                    console.log(SVG.get('layerRect_'+i).attr("layer"));
                    Meteor.call('update_document', "Group", SVG.get('layerRect_'+i).attr("layer"), {ordering: i-1})
                }
            else
                for(var i = this.attr("no")-1; i >= r; i--){
                    console.log(i);
                    console.log(SVG.get('layerRect_'+i).attr("layer"));
                    Meteor.call('update_document', "Group", SVG.get('layerRect_'+i).attr("layer"), {ordering: i+1})
                }
            togglePanZoom();
            event.stopPropagation();
            event.preventDefault();
        });
    }
    layersg.on('mouseout', function(){
        if(Session.get("selectedLayer") == ''){
            var hidden = Session.get("hiddenLayers");
            for(k in filelayers){
                if(hidden.indexOf(filelayers[k]._id) == -1)
                    SVG.get(filelayers[k]._id).show();
                //if(hidden.indexOf(filelayers[k].attr("id")) == -1)
                //    filelayers[k].show();
            }
            SVG.get('background').fill('#FFFFFF');
        }
        else{
            var layerId = Session.get("selectedLayer");
            var button;
            this.each(function(i,children){
                if(this.attr("layer") == layerId)
                    button = this;
            })
            button.opacity(1);
            SVG.get('background').fill(button.attr("fill"));
            SVG.get(layerId).show();
            for(k in filelayers){
                if(filelayers[k]._id != layerId)
                    SVG.get(filelayers[k]._id).hide();
                //if(filelayers[k].attr("id") != layerId)
                //    filelayers[k].hide();
            }
        }
    });
    SVG.get("layersGroup").show();
}

createStaticLayerMenu = function createStaticLayerMenu(x,y){
    var layersg = SVG.get("layersGroup");
    var a = Math.min(x,y) * mini_scale;
    var layerH = y - a - 50;
    var layerW = 20;
    var layers = SVG.get(Session.get("fileId")).children();
    var rects = [];
    var lh = layerH / (layers.length);
    var lx  = x - layerW;
    var ly = 30;
    for(l = layers.length-1; l >=0 ; l--){
        rects[l] = layersg.rect(layerW,lh).move(lx,ly).fill(random_pastels()).attr("id","layerRect_"+l).attr("layer", layers[l].attr("id")).attr("no",l).opacity(0.6);
        ly = ly + lh;

        rects[l].on('mouseover', function(event){
            this.opacity(1);
            SVG.get('background').fill(this.attr("fill"));
            var layerId = this.attr("layer");
            SVG.get(layerId).show();
            for(k in layers){
                if(layers[k].attr('id') != layerId)
                    layers[k].hide();
            }
        });
        rects[l].on('mouseout', function(event){
            this.opacity(0.6);
            SVG.get('background').fill('#FFFFFF');
            for(k in layers)
                layers[k].show();
        });
    }
}


menuItemLayer = function menuItemLayer(){
    if(SVG.get("layersGroup").visible())
            SVG.get("layersGroup").hide();
    else
        SVG.get("layersGroup").show();         
}

menuItemClose = function menuItemClose(){}
menuItemMenu = function menuItemMenu(){}

menuItemReflectvSS = function menuItemReflectvSS(){
    var item = SVG.get(global_oro_variables.selected.members[0].attr("selected"));
    var points = pathArraySvgOro(item.array.value);
    points = reflectSPath(points, false, true);
    if(item.array.value[item.array.value.length-1][0] == 'Z')
        var open = false
    else
        var open = true
    item.plot(split_oro_path_points(JSON.stringify(points), open));
    saveItemLocalisation(item.attr("id"));
}

menuItemReflecthSS = function menuItemReflecthSS(){
    var item = SVG.get(global_oro_variables.selected.members[0].attr("selected"));
    var points = pathArraySvgOro(item.array.value);
    points = reflectSPath(points, true, false);
    if(item.array.value[item.array.value.length-1][0] == 'Z')
        var open = false
    else
        var open = true
    item.plot(split_oro_path_points(JSON.stringify(points), open));
    saveItemLocalisation(item.attr("id"));
}

menuItemReflectvSC = function menuItemReflectvSC(){
    var item = SVG.get(global_oro_variables.selected.members[0].attr("selected"));
    var points = item.array.value;
    points = reflectCPath(points, false, true);
    item.plot(points);
    saveItemLocalisation(item.attr("id"));
}

menuItemReflecthSC = function menuItemReflecthSC(){
    var item = SVG.get(global_oro_variables.selected.members[0].attr("selected"));
    var points = item.array.value;
    points = reflectCPath(points, true, false);
    item.plot(points);
    saveItemLocalisation(item.attr("id"));
}

univClipper = function(cliptype){
    var elems = global_oro_variables.selected.members;
    var result = pathArraySvgXY(SVG.get(elems[0].attr("selected")).array.value);
    for(i = 1; i < elems.length; i++){
        var points2 = pathArraySvgXY(SVG.get(elems[i].attr("selected")).array.value);
        var c = new ClipperLib.Clipper();
        c.AddPaths(result, ClipperLib.PolyType.ptSubject, true);
        c.AddPaths(points2, ClipperLib.PolyType.ptClip, true);
        var solution = new ClipperLib.Paths();
        c.Execute(cliptype, solution);
        result = solution;
    }
    solution = JSON.stringify(pathArrayXYOro(result));
    var palette = Item.findOne({_id: SVG.get(elems[0].attr("selected")).attr("id")},{fields: {palette:1}}).pallette;
    var doc = {groupId: SVG.get(elems[0].attr("selected")).parent.attr("id"), type: "simple_path", pointList: solution, palette: palette};
    insertItem(doc);
    //Meteor.call("insert_document", "Item", doc);
}

menuItemUnionSS = function menuItemUnionSS(){
    univClipper(ClipperLib.ClipType.ctUnion);
}

menuItemDiffSS = function menuItemDiffSS(){
    univClipper(ClipperLib.ClipType.ctDifference);
}

menuItemXorSS = function menuItemXorSS(){
    univClipper(ClipperLib.ClipType.ctXor);
}

menuItemIntersectSS = function menuItemIntersectSS(){
    univClipper(ClipperLib.ClipType.ctIntersection);
}

menuItemDelete = function menuItemDelete(){
    var selected = global_oro_variables.selected.members;
    console.log(selected);
    var its = [], grs = [], conns = [];
    for(s in selected)
        if(SVG.get(selected[s].attr("selected")).type == 'g')
            grs.push(selected[s].attr("selected"));
        else
            if(SVG.get(selected[s].attr("selected")).attr('role') && SVG.get(selected[s].attr("selected")).attr('role') == 'connector')
                conns.push(selected[s].attr("selected"));
            else
                its.push(selected[s].attr("selected"));
    deselect();
    for(i in its)
        removeItem(its[i]);
    for(i in grs)
        removeGroup(grs[i], true);
    for(i in conns)
        Meteor.call('remove_document', 'Connector', SVG.get(conns[i]).attr('connection'));
}

menuItemClone = function menuItemClone(selected){
    if(typeof selected === 'undefined')
        var selected = global_oro_variables.selected.members;
    for(s in selected){
        var it = SVG.get(selected[s].attr("selected"));
        if(it.parent.attr('type') == 'parametrizedGroup'){
            var svgparent = it.parent.parent
            var locked = "false"
        }
        else{
            var svgparent = it.parent
            //var locked = true
        }
        if(it.type != 'g')
            cloneItem(it.attr("id"), svgparent.attr("id"), locked)/*, function(id){
                var iids = File.findOne({_id: Session.get('fileId')}).itemids;
                iids.push(id);
                console.log(iids);
                Meteor.call('update_document', 'File', Session.get('fileId'), {itemids: iids});
            });*/
        else{
            if(svgparent.type == 'g')
                var parent = 'groupId';
            else
                var parent = 'fileId'
            cloneGroup(it.attr("id"), svgparent.attr("id"), parent)/*, function(id){
                var gids = File.findOne({_id: Session.get('fileId')}).groupids;
                gids.push(id);
                console.log(gids);
                Meteor.call('update_document', 'File', Session.get('fileId'), {groupids: gids});
            });*/
        }
        //var item = Item.findOne({_id: selected[s].attr("selected")});
        //delete item._id;
        //item.selected = 'null';
        //Meteor.call("insert_document", "Item", item);
    }
}

menuItemBrowse = function menuItemBrowse(){
    var par = File.findOne({_id: Session.get('fileId')}).structuralpath[1];
    window.open('/browse/file/'+ par + "/"+1+"/3", '_blank');
}

menuItemToBack = function menuItemToBack(){
    var id = global_oro_variables.selected.members[0].attr("selected");
    SVG.get(id).back();
    SVG.get(id).parent.each(function(i,children){
        if(this.type == 'g')
            Meteor.call('update_document', 'Group', this.attr('id'), {ordering: SVG.get(id).parent.index(this)});
        else
            Meteor.call('update_document', 'Item', this.attr('id'), {ordering: SVG.get(id).parent.index(this)});
    });
}

menuItemToFront = function menuItemToFront(){
    var id = global_oro_variables.selected.members[0].attr("selected");
    SVG.get(id).front();
    SVG.get(id).parent.each(function(i,children){
        if(this.type == 'g')
            Meteor.call('update_document', 'Group', this.attr('id'), {ordering: SVG.get(id).parent.index(this)});
        else
            Meteor.call('update_document', 'Item', this.attr('id'), {ordering: SVG.get(id).parent.index(this)});
    });
}

curveToSimplePath = function(points, bigDiag, noPoints, decim, val){
    var ct = val;
    var tempath = SVG.get("svgEditor").path(points);
    var len = tempath.length();
    var box = tempath.bbox();
    var dg = Math.sqrt(Math.pow(box.width,2)+Math.pow(box.height,2));
    var noPo = (noPoints * dg / bigDiag) * ct;
    var step = len/noPo;
    var newpoints = [];
    //console.log(len);console.log(noPo); console.log(step);
    //console.log(dg); console.log(bigDiag);
    for(var i = 0 ; i < len ; i = i + step){
        var point = tempath.pointAt(i);
        newpoints.push( [ Number(point.x.toFixed(decim)), Number(point.y.toFixed(decim)) ] );
    }
    newpoints.push( [ points[points.length-1][5], points[points.length-1][6] ] );
    tempath.remove();
    return newpoints;
}

complexToSimplePath = function(points, diag, noPoints, decim, val){
    var newpoints = [], temp = [], f;
    for(p in points){
        if(points[p][0] != 'C'){
            if(temp.length > 0){
                var first = clone(newpoints[newpoints.length-1]);
                first.splice(0, 0, 'M');
                temp.splice(0, 0, first);
                var newtemp = curveToSimplePath(temp, diag, noPoints, decim, val).slice(1);
                newpoints = newpoints.concat(newtemp);
                temp = [];
            }
            if(points[p][0] != 'Z')
                newpoints.push([ points[p][1], points[p][2] ]);
            temp = [];
        }
        else
            temp.push(points[p]);
    }
    return newpoints;
}

menuItemSimplifySC = function menuItemSimplifySC(val){
    var path = SVG.get(global_oro_variables.selected.members[0].attr("selected")),
        clone;
    var box = path.bbox();
    var diag = Math.sqrt(Math.pow(box.width,2)+Math.pow(box.height,2));
    var decim = getDecimalNo(path);
    var subpaths = getSubPaths(path);
    var newpoints = [], clone;
    for(p in subpaths)
        newpoints.push(complexToSimplePath(subpaths[p].subpath, diag, subpaths[0].path.length, decim, val));
    if(SVG.get("clone_"+ path.attr("id")))
        clone = SVG.get("clone_"+ path.attr("id"));
    else{
        clone = path.clone();
        clone.opacity(1);
    }
    clone.plot(split_oro_path_points(JSON.stringify(newpoints))).attr("id", "clone_"+ path.attr("id"));
}

menuItemLighten = function menuItemLighten(val){
    var path = SVG.get(global_oro_variables.selected.members[0].attr("selected")),
        clone;
    var p = ClipperLib.JS.Lighten(pathArraySvgXY(path.array.valueOf()), val)
    var p = split_oro_path_points(JSON.stringify(pathArrayXYOro(p)))

    if(SVG.get("clone_"+ path.attr("id")))
        clone = SVG.get("clone_"+ path.attr("id"));
    else{
        clone = path.clone();
        clone.opacity(1).attr("id", "clone_"+ path.attr("id"));
    }
    clone.plot(p)
}

menuItemOffset = function menuItemOffset(clone, option, value){
    var path = SVG.get(global_oro_variables.selected.members[0].attr("selected"));
    var patharr = pathArraySvgXY(path.array.valueOf())[0]

    //get options from the gui controllers
    var controllers = global_oro_variables.gui.__folders.Offset.__controllers;
    var opt = {};
    for(var i = 0 ; i < controllers.length-1; i++)
        opt[controllers[i].property] = controllers[i].getValue()
    if(option && value)
        opt[option] = value

    // bug workaround: join types are swapped in ClipperLib 6.1.3.2
    if(opt.joinType == 'square')
        opt.joinType = 'miter'
    else if(opt.joinType == 'miter')
        opt.joinType = 'square'

    //clipper
    var scale = 100;
    var joinType = 'jt'+opt.joinType.charAt(0).toUpperCase()+opt.joinType.slice(1)
    var endType = 'et'+opt.endType.charAt(0).toUpperCase()+opt.endType.slice(1)

    ClipperLib.JS.ScaleUpPath(patharr, scale);
    var co = new ClipperLib.ClipperOffset(opt.miterLimit, opt.arcTolerance * scale);
    var solution = new ClipperLib.Paths();
    console.log(patharr)
    co.AddPaths([patharr], ClipperLib.JoinType[joinType], ClipperLib.EndType[endType]);
    co.Execute(solution, opt.delta * scale)
    ClipperLib.JS.ScaleDownPaths(solution, scale);
    console.log(solution)
    solution = JSON.stringify(pathArrayXYOro(solution))
console.log(solution)
    if(clone){
        solution = split_oro_path_points(solution)
        if(!SVG.get('offsetclone_'+path.attr('id'))){
            path.clone().attr('id', 'offsetclone_'+path.attr('id')).opacity(0.5).fill('#FFFFFF').stroke({color: '#000000', width: 2 / SVG.get('viewport').node.getCTM().a})
            path.opacity(0.2)
        }
        SVG.get('offsetclone_'+path.attr('id')).plot(solution)
    }
    else{
        var it = Item.findOne({_id: path.attr('id')})
        SVG.get(it._id).opacity(it.palette.opacity)
        SVG.get('offsetclone_'+path.attr('id')).remove()
        //create clone
        it.pointList = solution
        it.original = it._id;
        delete it._id;
        if(path.parent.attr('type') == 'parametrizedGroup'){
            it.groupId = path.parent.parent.attr('id')
            it.locked = 'null'
        }
        it.selected = 'null';
        if(it.parameters)
            delete it.parameters
        insertItem(it);
    }
}

menuItemJoin = function menuItemJoin(){
    var selected = global_oro_variables.selected.members;
    var arr = [];
    for(s in selected)
        arr.push(SVG.get(selected[s].attr("selected")));
    var newpath = joinPaths(arr);
    console.log(newpath);
    SVG.get(selected[0].attr("selected")).plot(newpath);
    saveItemLocalisation(selected[0].attr("selected"));
    for(s = 1; s < selected.length; s++)
        removeItem(selected[s].attr("selected"));
}
menuItemReverse = function menuItemReverse(){
    var selected = global_oro_variables.selected.members[0];
    SVG.get(selected.attr("selected")).plot(reversePath(SVG.get(selected.attr("selected"))));
    saveItemLocalisation(selected.attr("selected"));
}
menuItemSplit = function menuItemSplit(){
    var selected = global_oro_variables.selected.members[0];
    var arr = getSubPaths(SVG.get(selected.attr("selected")));
    var subpaths = [];
    for(i in arr)
        subpaths.push(arr[i].subpath);
    SVG.get(selected.attr("selected")).plot(subpaths[0]);
    saveItemLocalisation(selected.attr("selected"));
    var item = Item.findOne({_id: selected.attr("selected")});
    delete item._id;
    item.selected = 'null';
    for(i = 1; i < subpaths.length; i++){
        if(item.type == 'simple_path')
            item.pointList = JSON.stringify(pathArraySvgOro(subpaths[i]));
        else{
            var temp = SVG.get('svgEditor').path(subpaths[i]);
            item.pointList = temp.attr("d");
            temp.remove();
        }
        insertItem(item);
        //Meteor.call('insert_document', 'Item', item);
    }
}

menuItemReload = function menuItemReload(){

    $(SVG.get(Session.get('fileId')).node).remove();
    SVG.get('gradientRects').clear()
    SVG.get('connectors_links').clear()
    SVG.get('connectors_markers').clear()
    SVG.get('labels').clear()
    Blaze.remove(renderedTemplates["show_meteor_file_svg"]);
    Blaze.renderWithData(Template.show_meteor_file_svg, {"_id": Session.get('fileId')}, document.getElementById("viewport"));
}


menuItemSaveNew = function menuItemSaveNew(){
    Blaze.remove(renderedTemplates['show_meteor_file_svg']);
    cloneFile(Session.get("fileId"), function(res){
        Blaze.renderWithData(Template.show_meteor_file_svg, {"_id": res}, document.getElementById("viewport"));
    });

}

callFilebrowserModal = function(noshow, callback){
    /*
    if($('#filebrowserModalBody').html() == ''){
        var win = Session.get("window");
        Session.set("filebrowserInHouse", "true");
        var data = {start: 1, dim: 5, id: "vyRjpfv2kki5sPE9G", col: "file", buttons: 'nobuttons', callback: callback};
        Blaze.renderWithData(Template.filebrowse, data, document.getElementById('filebrowserModalBody'));
    }
    else{
        Session.set("fileBCallback", callback);
    }
    if(!noshow)
        $('#filebrowserModal').modal({backdrop: true, show: true});
    */
    if(!SVG.get('fileBrowse')){
        $('#modal-content').html('');
        var win = Session.get("window");
        Session.set("filebrowserInHouse", "true");
        var data = {start: 1, dim: 5, id: "vyRjpfv2kki5sPE9G", col: "file", buttons: 'nobuttons', callback: callback, login: false};
        Blaze.renderWithData(Template.filebrowse, data, document.getElementById('modal-content'));
    }
    Session.set("fileBCallback", callback);
/*
    var box1 = $('#browserContent')[0].getBoundingClientRect()
    console.log(box1)
    var box2 = $('#Bcrumbs')[0].getBoundingClientRect()
    console.log(box2)
            var width = box1.width + box2.width
            console.log(width)
            
            //$('#modal-container').css({'margin': '0px auto;', 'width': width})
            //$('#modal-content').css({'margin-left': - box2.left});
*/
    Modal.open({
        width: '80%',
        height: '80%'
      });
/*
    var margl = '-'+box2.left+'px'
    console.log(margl)
    $('#modal-container').css('margin', '0px auto;')
    $('#modal-content').css({'margin-left': margl});

    Tracker.autorun(function(){
        var win = Session.get('window')
        if($('#browserContent' && $('#modal-container').css('visibility') == 'visible')){
            var box1 = $('#browserContent')[0].getBoundingClientRect()
            var box2 = $('#Bcrumbs')[0].getBoundingClientRect()
            var width = box1.width + box2.width
            $('#modal-container').css({'margin': '0px auto;', 'width': width})
            $('#modal-content').css({'margin-left': - box2.left});
        }
    })*/
}

menuItemAddTemplate = function menuItemAddTemplate(noshow){
    callFilebrowserModal(noshow, 'menuAddTemplateCallb');
}

menuItemAddElement = function menuItemAddElement(noshow){
    callFilebrowserModal(noshow, 'menuAddElemCallb');
}

menuItemAddConnector = function menuItemAddConnector(noshow){
    callFilebrowserModal(noshow, 'menuAddConnectorCallb');
}

menuAddElemCallb = function menuAddElemCallb(id){
    console.log('menuAddElemCallb');
    //$('#filebrowserModal').modal('hide');
    var currentLayer;
    SVG.get(Session.get('fileId')).each(function(i,children){
        if(this.visible())
            currentLayer = this;
    });
    if(!currentLayer)
        currentLayer =  SVG.get(Session.get('fileId')).first();

    if(File.findOne({_id: id})){
        var g = Group.findOne({fileId: id, type: 'layer'},{sort: {ordering: 1}});
        var elem = Group.findOne({groupId: g._id},{sort: {ordering: 1}});
        if(elem)
            cloneGroup(elem, currentLayer.attr("id"), 'groupId');
        else{
            var elem = Item.findOne({groupId: g._id},{sort: {ordering: 1}});
            cloneItem(elem, currentLayer.attr("id"));
        }
        /*
        Meteor.call('getFirstElement', id, function(err, res){
            if(err)
                console.log(err)
            if(res){
                console.log(res)

                if(res.type == 'item')
                    cloneItem(res.elem, currentLayer.attr("id"));
                else if(res.type == 'group')
                    cloneGroup(res.elem, currentLayer.attr("id"), 'groupId');
            }
        })*/
    }
    else{
        var elem = Group.findOne({_id: id})
        if(elem){
            if(elem.type == 'layer')
                cloneGroup(Group.findOne({_id: id}), Session.get('fileId'), 'fileId');
            else
                cloneGroup(Group.findOne({_id: id}), currentLayer.attr("id"), 'groupId');
        }
        else
            cloneItem(Item.findOne({_id: id}), currentLayer.attr("id"));
    }
}

menuAddTemplateCallb = function menuAddTemplateCallb(id){
    console.log('menuAddTemplateCallb');
    //$('#filebrowserModal').modal('hide');

    var file = File.findOne({_id: Session.get('fileId')});
    console.log(file);
    var group = {fileId: Session.get('fileId'), type: "layer", uuid: "layer_"+(SVG.get(Session.get('fileId')).children().length+1), ordering: 0}
    console.log(group);
    Meteor.call('insert_document', 'Group', group, function(err,id2){
        if(err) console.log(err);
        else if(id2){
            console.log('insertedGroup: '+id2)
            var pointList = "0,0,"+file.width+","+file.height
            var item = {groupId: id2, pointList: pointList, text: "/file/"+id, locked: id2, type: 'rasterImage'}
            console.log('insertItem: ' + JSON.stringify(item))
            Meteor.call('insert_document', 'Item', item);
        }
    })
}

menuAddConnectorCallb = function menuAddConnectorCallb(id){
    console.log('menuAddConnectorCallb');
    //$('#filebrowserModal').modal('hide');

    if(File.findOne({_id: id}))
        var g = Group.findOne({fileId: id, type: 'layer'},{sort: {ordering: 1}});
    else
        var g = Group.findOne({_id: id})

    var elem = Item.findOne({groupId: g._id},{sort: {ordering: 1}});
    elem.parameters = { type: 'connector'}
    if(elem.type == 'simple_path'){
        var path = JSON.parse(elem.pointList);
        if(path.length < 3 || path[0][0][0] != 'M' || path[1][0][0] != 'M' || path[2][0][0] != 'M'){
            var temp = SVG.get('svgEditor').path(split_oro_path_points(elem.pointList))
            var box = temp.bbox();
            path.splice(0,0,[['M', box.x+box.width/2, box.y-2]], [['M', box.x+box.width/2, box.y2+2]])
            elem.pointList = JSON.stringify(path);
        }
    }
    cloneItem(elem, Session.get('fileId'));
}

menuItemResetMatrix = function menuItemResetMatrix(){
    var selected = global_oro_variables.selected.members[0];
    Meteor.call('update_document', 'Group', selected.attr("selected"), {transform: '1,0,0,1,0,0'});
}

menuItemSelect = function menuItemSelect(id){
    console.log(id);
    var results = buildSelector(id);
    global_oro_variables.selected.add(results);
    SVG.get(id).draggable();
    Session.set("selected", "true");
    showDatGui();
}

menuItemDeparametrize = function menuItemDeparametrize(){
    var selected = global_oro_variables.selected.members;
    for(s in selected){
        var it = Item.findOne({_id: selected[s].attr("selected")});
        if(['pathEquation'].indexOf(it.type) == -1 && window[it.parameters.callback])
            it.pointList = window[it.parameters.callback](it.parameters.params);
        if(it.pointList){
            var type = checkPathType(SVG.get(it._id));
            if(type == "simple")
                it.type = "simple_path"
            else
                it.type = "complex_path";
            it.parameters = null;
            it.original = it._id;
            delete it._id;
            it.selected = 'null';
            insertItem(it);
        }
        else
            console.log('no callback function and no pointList')
    }
}

menuGroupDeparametrize = function menuGroupDeparametrize(){
    var paragr = SVG.get(global_oro_variables.selected.members[0].attr('selected'));
    var patharray = joinPaths(paragr.children());
    var temp = SVG.get('svgEditor').path(patharray)
    var type = checkPathType(temp);
    if(type == 'simple'){
        type = 'simple_path'
        patharray = JSON.stringify(pathArraySvgOro(patharray))
    }
    else{
        type = 'complex_path'
        patharray = temp.attr('d')
    }
    temp.remove();
    var it = Item.findOne({_id: paragr.attr('locked').split(',')[0] })
    delete it._id;
    it.type = type
    it.pointList = patharray
    it.parameters = null
    it.groupId = paragr.parent.attr('id')
    it.original = it._id
    it.locked = 'null'
    it.selected = 'null'
    insertItem(it)
}

menuItemClosePath = function menuItemClosePath(){
    var m = global_oro_variables.selected.members;
    var upd;
    for(i in m){
        var path = Item.findOne({_id: m[i].attr('selected')});
        if(path.closed == 'false') {
            if(path.type == 'simple_path')
                upd = {closed: "true"};
            else{
                var p = SVG.get(m[i].attr('selected')).array.value;
                if(p[p.length-1][0] != 'Z')
                    p.push(['Z']);
                SVG.get(m[i].attr('selected')).plot(p);
                upd = {closed: "true", pointList: SVG.get(m[i].attr('selected')).attr("d")};
            }
        }
        else{
            if(path.type == 'simple_path')
                upd = {closed: "false"};
            else{
                var p = SVG.get(m[i].attr('selected')).array.value;
                if(p[p.length-1][0] == 'Z')
                    p.pop();
                SVG.get(m[i].attr('selected')).plot(p);
                upd = {closed: "false", pointList: SVG.get(m[i].attr('selected')).attr("d")};
            }
        }
        Meteor.call('update_document', 'Item', m[i].attr('selected'), upd);
    }
}

menuItemTextPath = function menuItemTextPath(){
    if(global_oro_variables.selected.members){
        var selected = global_oro_variables.selected.members;
        if(SVG.get(selected[0].attr('selected')).type == 'text'){
            var text = SVG.get(selected[0].attr('selected'));
            var path = SVG.get(selected[1].attr('selected'));
        }
        else{
            var text = SVG.get(selected[1].attr('selected'));
            var path = SVG.get(selected[0].attr('selected'));
        }
        var doc = {
            groupId: text.parent.attr('id'),
            type: 'parametrizedGroup',
            ordering: text.parent.index(text.parent.last())+1,
            locked: text.attr('id') + ',' + path.attr('id'),
            parameters: { 
                callback: 'paraTextPath',
                params: {
                    elements: {
                        text: text.attr('id'),
                        path: path.attr('id')
                    },
                    visiblepath: true
                }
            }
        };
        var ids = [text.attr('id'), path.attr('id')];
        insertGroup(doc, function(id){
            for(var i = 0; i < ids.length; i++)
                Item.update({_id: ids[i]}, {$set: {groupId: id, locked: id}});
            //todo reset ordering (-index);
        })

        var parameters1 = Item.findOne({_id: path.attr('id')}).parameters;
        if(!parameters1)
            parameters1 = {};
        parameters1.parametrizedGroup = 'conductor';
        Meteor.call('update_document', 'Item', path.attr('id'), {parameters: parameters1})

        var parameters2 = Item.findOne({_id: text.attr('id')}).parameters;
        if(!parameters2)
            parameters2 = {};
        parameters2.parametrizedGroup = 'conductor';
        Meteor.call('update_document', 'Item', text.attr('id'), {parameters: parameters2})
    }
}

menuItemTextPathSplit = function menuItemTextPathSplit(){
    menuItemLockGroup();
    menuItemUnGroup();
}

menuItemPathOnPath = function menuItemPathOnPath(){
    if(global_oro_variables.selected.members){
        var selected = global_oro_variables.selected.members;
        var path1 = SVG.get(selected[0].attr('selected')); // base
        var path2 = SVG.get(selected[1].attr('selected')); // pattern
        var doc = {
            groupId: path1.parent.attr('id'),
            type: 'parametrizedGroup',
            ordering: path1.parent.index(path1.parent.last())+1,
            locked: path1.attr('id') + ',' + path2.attr('id'),
            parameters: { 
                callback: 'paraPathOnPath',
                params: {
                    elements: {
                        conductor: path1.attr('id'),
                        content: path2.attr('id')
                    },
                    visibleconductor: true,
                    visiblecontent: false,
                    repetitions: 3
                }
            }
        };
        var ids = [path1.attr('id'), path2.attr('id')];
        insertGroup(doc, function(id){
            for(var i = 0; i < ids.length; i++)
                Item.update({_id: ids[i]}, {$set: {groupId: id, locked: id}});
            //todo reset ordering (-index);
        })

        var parameters1 = Item.findOne({_id: path1.attr('id')}).parameters;
        if(!parameters1)
            parameters1 = {};
        parameters1.parametrizedGroup = 'conductor';
        Meteor.call('update_document', 'Item', path1.attr('id'), {parameters: parameters1})

        var parameters2 = Item.findOne({_id: path2.attr('id')}).parameters;
        if(!parameters2)
            parameters2 = {};
        parameters2.parametrizedGroup = 'conductor';
        Meteor.call('update_document', 'Item', path2.attr('id'), {parameters: parameters2})
    }
}

menuItemPointSymmetry = function menuItemPointSymmetry(){
    var path = SVG.get(global_oro_variables.selected.members[0].attr('selected'));
    var id = path.attr('id');
    var box = path.bbox();
    if(path.type == 'path'){
        var doc = {
            groupId: path.parent.attr('id'),
            type: 'parametrizedGroup',
            ordering: path.parent.index(path.parent.last())+1,
            locked: id,
            parameters: { 
                callback: 'pointSymmetry',
                params: {
                    elements: {
                        path: id
                    },
                    pointX: box.width+20,
                    pointY: box.height/2,
                    repetitions: 2,
                    rotations: 1,
                    dscale: 1
                }
            }
        };
        insertGroup(doc, function(id2){
            Item.update({_id: id}, {$set: {groupId: id2, locked: id2}});
            //todo reset ordering (-index);
        })
        var parameters = Item.findOne({_id: id}).parameters;
        if(!parameters)
            parameters = {};
        parameters.parametrizedGroup = 'path';
        Meteor.call('update_document', 'Item', id, {parameters: parameters})
    }
}

menuItemLineSymmetry = function menuItemLineSymmetry(){
    var path = SVG.get(global_oro_variables.selected.members[0].attr('selected'));
    var id = path.attr('id');
    var box = path.bbox();
    if(path.type == 'path'){
        var doc = {
            groupId: path.parent.attr('id'),
            type: 'parametrizedGroup',
            ordering: path.parent.index(path.parent.last())+1,
            locked: id,
            parameters: { 
                callback: 'lineSymmetry',
                params: {
                    elements: {
                        path: id
                    },
                    pointX1: box.width+20,
                    pointY1: 0,
                    pointX2: box.width+20,
                    pointY2: box.height,
                    repetitions: 2,
                    rotations: 1,
                    dscale: 1
                }
            }
        };
        insertGroup(doc, function(id2){
            Item.update({_id: id}, {$set: {groupId: id2, locked: id2}});
            //todo reset ordering (-index);
        })

        var parameters = Item.findOne({_id: id}).parameters;
        if(!parameters)
            parameters = {};
        parameters.parametrizedGroup = 'path';
        Meteor.call('update_document', 'Item', id, {parameters: parameters})
    }
}

menuItemItemArray = function menuItemItemArray(){
    var path = SVG.get(global_oro_variables.selected.members[0].attr('selected'));
    var id = path.attr('id');
    if(path.type == 'path'){
        var doc = {
            groupId: path.parent.attr('id'),
            type: 'parametrizedGroup',
            ordering: path.parent.index(path.parent.last())+1,
            locked: id,
            parameters: { 
                callback: 'itemArray',
                params: {
                    elements: {
                        path: id
                    },
                    repetitionsX: 3,
                    repetitionsY: 2,
                    dx: path.width(),
                    dy: path.height(),
                    deltax: 0,
                    deltay: 0
                }
            }
        };
        insertGroup(doc, function(id2){
            Item.update({_id: id}, {$set: {groupId: id2, locked: id2}});
            //todo reset ordering (-index);
        })

        var parameters = Item.findOne({_id: id}).parameters;
        if(!parameters)
            parameters = {};
        parameters.parametrizedGroup = 'path';
        Meteor.call('update_document', 'Item', id, {parameters: parameters})
    }
}

menuItemImportSelector = function menuItemImportSelector(){
    var selector = global_oro_variables.selected.first();
    if(selector){
        var item = SVG.get(selector.attr('selected'));

        var matrix = SVG.get('viewport').node.getCTM();
        SVG.get('viewport').transform("matrix", "1,0,0,1,0,0");
        panCallback({a:1, b:0, c:0, d:1, e:0, f:0});

        var code = '', elements = [];
        if(selector.attr('type') == 'draggable'){
            elements = elements.concat(SVG.get('container_'+selector.attr('selected')).children());
            elements.push(SVG.get('rotate_'+selector.attr('selected')))
        }
        else if(selector.attr('type') == 'pathPoints'){
            elements = elements.concat(SVG.get('middPoints').children()).concat(SVG.get('hingePoints').children()).concat(SVG.get('attrPoints').children())//.concat(SVG.get('startLines').children());
        }
        else if(selector.attr('type') == 'simple')
            elements = elements.concat(selector.children());
        else if(selector.attr('type') == '3D')
            elements = SVG.get('container_'+selector.attr('selected')).children();

        for(var e = 0; e < elements.length; e++){
            elements[e].size(elements[e].width()/matrix.a, elements[e].height()/matrix.d)
            if(elements[e].attr('stroke-width'))
                elements[e].attr('stroke-width', elements[e].attr('stroke-width')/matrix.a);
            if(elements[e].type == 'line' && elements[e].attr('attractor')){
                elements[e].attr({x1: SVG.get(elements[e].attr('attractor')).cx(), y1: SVG.get(elements[e].attr('attractor')).cy(), x2: SVG.get(elements[e].attr('hingePoint')).cx(), y2: SVG.get(elements[e].attr('hingePoint')).cy()});
            }/*
            if(elements[e].type == 'path'){
                //var hingeM = SVG.get(elements[e].attr('hingeM'))

            }*/
            code = code + elements[e].node.outerHTML;
        }

        SVG.get('viewport').transform("matrix", [matrix.a, matrix.b, matrix.c, matrix.d, matrix.e, matrix.f].join(','));
        panCallback(matrix);

        console.log(code);
        console.log(elements);

        //global_oro_variables.subscriptionhandles.file.stop();

        insertGroup({groupId: item.parent.attr('id'), type: "simpleGroup"}, function(res){
            cloneItem(item.attr('id'), res, true);
            absorbSVG(code, {}, res, true);
        });
    }
}

menuItemConnect = function menuItemConnect(){
    var path1 = SVG.get(global_oro_variables.selected.members[0].attr('selected')),
        path2 = SVG.get(global_oro_variables.selected.members[1].attr('selected')),
        id1 = path1.attr('id'),
        id2 = path2.attr('id');

    var doc = {source: id1, target: id2, connector: 'default'}
    Meteor.call('insert_document', 'Connector', doc);
}

menuItemQrCode = function(){
    var path = SVG.get(global_oro_variables.selected.members[0].attr('selected'));
    var id = path.attr('id');
    var box = path.bbox();
    if(path.type == 'path'){
        var doc = {
            groupId: path.parent.attr('id'),
            type: 'parametrizedGroup',
            ordering: path.parent.index(path.parent.last())+1,
            locked: id,
            parameters: { 
                callback: 'paraQrCode',
                params: {
                    elements: {
                        group: path.parent.attr('id'),
                        path: id
                    },
                    text: 'new qr code',
                    dimension: 400
                },
                parametrizedGroup: 'group'
            }
        };
        insertGroup(doc, function(id2){
            Item.update({_id: id}, {$set: {groupId: id2, locked: id2}});
            //todo reset ordering (-index);
        })
        var parameters = Item.findOne({_id: id}).parameters;
        if(!parameters)
            parameters = {};
        parameters.parametrizedGroup = 'path';
        Meteor.call('update_document', 'Item', id, {parameters: parameters})
    }
}


/*
menuItemMorphFrame = function menuItemMorphFrame(pos){
    if(global_oro_variables.selected.members && global_oro_variables.selected.members.length > 1){
        var origsource = SVG.get(global_oro_variables.selected.members[0].attr("selected"));
        var source = origsource.clone();
        var dest = SVG.get(global_oro_variables.selected.members[1].attr("selected")).clone();
        source.array.morph(dest.array.value);
        source.hide();
        dest.hide();
        cloneItem(origsource.attr("id"), origsource.parent.attr("id"), function(id){
            SVG.get(id).plot(source.array.at(pos));
        })
    }
}*/