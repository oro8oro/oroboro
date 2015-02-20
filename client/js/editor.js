
getRandomInt = function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min)) + min;
}

random_pastels = function random_pastels(){
    var red = getRandomInt(200, 255);
    var green = getRandomInt(200, 255);
    var blue = getRandomInt(200, 255);
    return {r: red, g: green, b: blue};
}

htmlEntities = function htmlEntities(str) {
    return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}
htmlEntitiesDecode = function htmlEntitiesDecode(str) {
    return String(str).replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"');
}

htmlToSvg = function htmlToSvg(str){
    return String(str).replace(/<code>/g, '').replace(/<\/code>/g, '').replace(/<div>/g, '').replace(/<\/div>/g, '').replace(/<p>/g, '').replace(/<\/p>/g, '');
}

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
        var selector = global_oro_variables.selected.members[0];
        var selected = SVG.get(selector.attr("selected"));
        console.log("Type: ", selected.attr("type"));
        if(selected.parent.attr("type") != 'layer'){
            deselect();
            var selector = buildSelector(SVG.get('svgEditor'), selected.parent.attr("id"));
            global_oro_variables.selected.add(selector);
            showDatGui();
            Session.set("selected", "true");
            //selected.parent.draggable();
        }
    }
}
menuItemGroup = function menuItemGroup(){
    var selected = global_oro_variables.selected.members;
    var first = SVG.get(selected[0].attr("selected"));
    var doc = {groupId: first.parent.attr('id'), type: 'simpleGroup', ordering: first.parent.index(first)};
    var ids = [];
    for(s in selected)
        ids.push(selected[s].attr("selected"));
    Meteor.call('insert_document', 'Group', doc, function(error, id){
        if(error)
            console.log(error);
        console.log(id);
        console.log(ids);
        //SVG.get(first.parent.attr('id')).group().attr("id", id);
        for(i in ids)
            Item.update({_id: ids[i]}, {$set: {groupId: id}});
        //todo reset ordering (-index);
    });
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

    $('#CodeEditorModalBody').html('<code>' + htmlEntities(script) + '</code>');
    //$('#CodeEditorModal').attr('aria-hidden','false').attr("style", 'visibility: visible;'); // ?don't think so
    $('#CodeEditorModal').modal({backdrop: false, show: true});
    disablePan();
}

updateDoc = function updateDoc(collection, id, ids, upd, query, callb){
    console.log("Coll: " +collection+"; id: "+id+"; ids:")
    console.log(id)
    console.log(id.toLowerCase().indexOf('svg'))
    console.log(ids)
    console.log(upd)
    console.log(query)
    if(id.toLowerCase().indexOf('svg') == -1){
        if(ids.indexOf(id) != -1)
            Meteor.call('update_document', collection, id, upd, function(error, result){
                        console.log(collection); console.log(id); console.log(upd);
                        console.log(error)
                        console.log(result);
                        //callb;
                        return id;
            });
        else{
            var f = Collections[collection].findOne(query);
            if(!f){
                upd._id = id;
                Meteor.call('insert_document', collection, upd, function(error, result){
                    console.log(collection); console.log(upd);
                    console.log(error)
                    console.log(result);
                    if(result){
                        id = result;
                        //callb;
                        return id;
                    }
                });  
            }
        }
    }
    else
        Meteor.call('insert_document',collection, upd, function(error, result){
            console.log(collection); console.log(upd);
            console.log(error)
            console.log(result);
            if(result){
                id = result;
                //callb;
                return id;
            }
        }); 
}

updateItemDB = function updateItemDB(item, groupId, ids){
    console.log(item);
    //see other attributes; see if proper id
    var upd = {'palette.fillColor':  item.attr("fill"), 'palette.strokeColor': item.attr("stroke"), 'palette.strokeWidth': String(item.attr("stroke-width"))}
    if(item.attr("fill-opacity") && item.attr("fill-opacity") != 'null')
        upd['palette.fillOpacity'] = String(item.attr("fill-opacity"))
    if(item.attr("stroke-opacity") && item.attr("stroke-opacity") != 'null')
        upd['palette.strokeOpacity'] = String(item.attr("stroke-opacity"))
    if(item.attr("stroke-dasharray") && item.attr("stroke-dasharray") != 'null')
        upd['palette.strokeDasharray'] = item.attr("stroke-dasharray")
    if(item.attr("stroke-linejoin") && item.attr("stroke-linejoin") != 'null')
        upd['palette.strokeLinejoin'] = item.attr("stroke-linejoin")
    if(item.attr("stroke-linecap") && item.attr("stroke-linecap") != 'null')
        upd['palette.strokeLinecap'] = item.attr("stroke-linecap")
    if(item.attr("opacity") && item.attr("opacity") != 'null')
        upd['palette.opacity'] = String(item.attr("opacity"));
    if(item.type == "path"){
        if(checkPathType(item) == "simple"){
            upd.type = "simple_path"
            upd['pointList'] = JSON.stringify(pathArraySvgOro(item.array.value))
        }
        else{
            upd.type = "complex_path";
            item = simplifyCPath(item);
            upd['pointList'] = item.attr("d");
        }
    }
    else
        if(item.type == "text"){
            upd.type = "text"
            upd.pointList = item.x() + ',' + item.y();
            upd['text'] = item.text();
        }
        else
            if(item.type == "image" || item.type == "img"){
                upd.type = "rasterImage"
                upd.pointList = item.x() + ',' + item.y() + ',' + item.attr("width") + ',' + item.attr("height");
                if(item.attr("href"))
                    upd['text'] = item.attr("href")
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
    var id = item.attr("id");
    updateDoc('Item', id, ids.items, upd, {_id: id, groupId: groupId});
}

updateGroupDB = function updateGroupDB(group, parentId, ids, layer){
    console.log(group);
    var upd = {};
    var id = group.attr("id");
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
    //if(group.matrix()) upd.transform = group.matrix()
    id = updateDoc('Group', id, ids.groups, upd, query);
    console.log(id);
    if(typeof id != 'undefined'){
        console.log(id);

        group.each(function(i, children) {
            if(this.type == 'g')
                updateGroupDB(this, id, ids, false);
            else
                if(this.type != 'defs')
                    updateItemDB(this, id, ids);
        });
    }
}

updateFileDB = function updateFileDB(root, ids){
    var upd = {width: root.attr("width"), height: root.attr("height"), fileType: "image/svg+xml"}
    var id = root.attr("id");
    id = updateDoc('File', id, [Session.get("fileId")], upd, {_id: id});
    console.log("FileId: ", id);
    if(typeof id != 'undefined'){
        console.log("FileId: ", id);
        var orphan = 0, newlayer = null;
        root.each(function(i, children) {
            console.log(this);
            if(this.type == 'g'){
                updateGroupDB(this, id, ids, true);
                orphan = 0;
                temp = null;
            }
            else{
                if(orphan == 0)
                    newlayer = root.group().attr("type", "layer");
                else
                    orphan ++;
                newlayer.add(this);
                updateGroupDB(newlayer, id, ids, true);
            }
        });
    }   
}

absorbSVG = function absorbSVG(code, its){ //todo: for file 
    var ids = {};
    ids.items = [];
    ids.groups = [];
    var orig = SVG.get(Session.get("fileId"));
    orig.each(function(i, children) {
        if(this.type == 'g')
            ids.groups.push(this.attr("id"));
        else
            ids.items.push(this.attr("id"));
    }, true);
    console.log(ids);
    console.log(its);
    if(typeof its === 'undefined'){
        console.log(orig);
        orig.clear();
        orig.parent.remove(orig);
        console.log(code);
        var newsvg = SVG.get('viewport').svg(code);
        var root = newsvg.roots()[0];
        console.log(root);
        updateFileDB(root, ids);
    }
    else{
        itids = Object.keys(its);
        for(i in itids){
            SVG.get(itids[i]).remove();
        }
        console.log(code);
        var newit = SVG.get(Session.get("fileId")).svg(code);
        console.log(newit);
        newit.roots(function(){
            console.log(this);
            var itemid = this.attr("id");
            if(itemid == Session.get('fileId')){
                var gr = SVG.get(Session.get('fileId')).group();
                gr.add(this);
                updateGroupDB(gr, Session.get('fileId'), ids, true);
            }
            else{
                updateItemDB(this, its[this.attr("id")], ids);
                this.remove();
                build_item(SVG.get(its[this.attr("id")]), Item.findOne({_id:itemid}));
            }
        });
    }
}

menuItemCodeSave = function menuItemCodeSave(){
    var code = $('#CodeEditorModalBody').html();
    code = htmlToSvg(htmlEntitiesDecode(code));
    if(global_oro_variables.selected.members){
        if(global_oro_variables.selected.members.length > 0){
            var selected = global_oro_variables.selected.members;
            var ids = {};
            for(s in selected){
                var id = selected[s].attr("selected");
                ids[id] = SVG.get(id).parent.attr("id");
                deselectItem(id);
            }
            absorbSVG(code, ids);
        }
        else
            absorbSVG(code);
    }
    else
        absorbSVG(code);
    $('#CodeEditorModal').modal('hide');
    //$('#CodeEditorModal').attr('aria-hidden','true').attr("style", 'visibility: hidden;');
    enablePan();
}
/*
menuItemPalette = function menuItemPalette(){
    $('#Palette').modal({backdrop: false, show: true});
}
*/

removeLayerMenu = function(){
    SVG.get("layersGroup").clear();
}

createLayerMenu = function createLayerMenu(x,y){
    var layersg = SVG.get("layersGroup");
    //var layerH = y - SVG.get('minimap').bbox().height - 50;
    var a = Math.min(x,y) * mini_scale;
    var layerH = y - a - 50;
    var layerW = 20;
    var filelayers = SVG.get(Session.get("fileId")).children();
    var layers = [];
    var rects = [];
    var hidden = [];
    for(k in filelayers){
        if(filelayers[k].attr("type") == 'layer' || filelayers[k].attr("type") == 'menu_item'){
            layers.push(filelayers[k]);
            var g = Group.findOne({_id: filelayers[k].attr("id")});
            if(g.parameters)
                if(g.parameters.hide == "true"){
                    hidden.push(filelayers[k].attr("id"));
                    filelayers[k].hide();
                }
        }
    }
    Session.set("hiddenLayers", hidden);
    var h = layerH / (layers.length + 1);
    var lx  = x - layerW;
    var ly = 30;
    if(layers.length > 0){
        var alllayers = layersg.rect(layerW,h).move(lx, ly).fill('#FFFFFF').attr("id","alllayers").opacity(0.6);
        ly = ly + h;

        alllayers.on('dblclick', function(event){
            if(Session.get("enableEdit") == 'true')
                Meteor.call('insert_document', 'Group', {fileId: Session.get("fileId"), type: "layer", uuid: "layer_"+(layers.length+1)});
        });
        alllayers.on('mouseover', function(event){
            SVG.get('background').fill('#FFFFFF');
            this.opacity(1);
            for(k in filelayers){
                filelayers[k].show();
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
    for(l in layers){
        rects[l] = layersg.rect(layerW,h).move(lx,ly).fill(random_pastels()).attr("id","l"+layers[l].attr("id")).opacity(0.6);
        ly = ly + h;

        rects[l].on('mouseover', function(event){
            this.opacity(1);
            SVG.get('background').fill(this.attr("fill"));
            var layerId = this.attr("id").substring(1);
            SVG.get(layerId).show();
            for(k in filelayers){
                if(filelayers[k].attr("id") != layerId)
                    filelayers[k].hide();
            }
        });
        rects[l].on('mouseout', function(event){
            this.opacity(0.6);
            var hidden = Session.get("hiddenLayers");
            if(hidden.indexOf(this.attr("id").substring(1)) != -1)
                SVG.get(this.attr("id").substring(1)).hide();
        });
        rects[l].on('dblclick', function(event){
            if(Session.get("enableEdit") == 'true'){
                var hidden = Session.get("hiddenLayers");
                var layerId = this.attr("id").substring(1);
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
                removeGroup(this.attr("id").substring(1));
            }
            else{
                if(global_oro_variables.selected.members.length > 0){
                    var selections = global_oro_variables.selected.members;
                    var layerId = this.attr("id").substring(1);
                    var ids = [];
                    for(var s in selections)
                        ids.push(selections[s].attr("selected"));
                    Meteor.call('update_collection', 'Item', ids, {groupId: layerId});
                    //SVG.get(layerId).add(SVG.get(selections[s].attr("selected")));
                }
                else{
                    if(Session.get("selectedLayer") != this.attr("id").substring(1))   
                        Session.set("selectedLayer", this.attr("id").substring(1));
                    else
                        Session.set("selectedLayer", '');
                }
            }
        });
    }
    layersg.on('mouseout', function(){
        if(Session.get("selectedLayer") == ''){
            var hidden = Session.get("hiddenLayers");
            for(k in filelayers){
                if(hidden.indexOf(filelayers[k].attr("id")) == -1)
                    filelayers[k].show();
            }
            SVG.get('background').fill('#FFFFFF');
        }
        else{
            var layerId = Session.get("selectedLayer");
            var button = SVG.get("l"+layerId);
            button.opacity(1);
            SVG.get('background').fill(button.attr("fill"));
            SVG.get(layerId).show();
            for(k in filelayers){
                if(filelayers[k].attr("id") != layerId)
                    filelayers[k].hide();
            }
        }
    });
    SVG.get("layersGroup").show();
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
    item.plot(split_oro_path_points(JSON.stringify(points)));
    saveItemLocalisation(item.attr("id"));
}

menuItemReflecthSS = function menuItemReflecthSS(){
    var item = SVG.get(global_oro_variables.selected.members[0].attr("selected"));
    var points = pathArraySvgOro(item.array.value);
    points = reflectSPath(points, true, false);
    item.plot(split_oro_path_points(JSON.stringify(points)));
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
    var item1 = SVG.get(global_oro_variables.selected.members[0].attr("selected"));
    var item2 = SVG.get(global_oro_variables.selected.members[1].attr("selected"));
    var points1 = pathArraySvgXY(item1.array.value);
    var points2 = pathArraySvgXY(item2.array.value);

    var solution = new ClipperLib.Paths();
    var c = new ClipperLib.Clipper();
    c.AddPaths(points1, ClipperLib.PolyType.ptSubject, true);
    c.AddPaths(points2, ClipperLib.PolyType.ptClip, true);
    c.Execute(cliptype, solution);
    solution = JSON.stringify(pathArrayXYOro(solution));

    var palette = Item.findOne({_id: item1.attr("id")},{fields: {palette:1}}).pallette;
    var doc = {groupId: item1.parent.attr("id"), type: "simple_path", pointList: solution, palette: palette};
    Meteor.call("insert_document", "Item", doc);
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
    for(s in selected){
        if(SVG.get(selected[s].attr("selected")).type != 'g')
            Meteor.call('remove_document', 'Item', selected[s].attr("selected"));
        else
            removeGroup(selected[s].attr("selected"));
    }
}

menuItemClone = function menuItemClone(){
    var selected = global_oro_variables.selected.members;
    for(s in selected){
        var it = SVG.get(selected[s].attr("selected"));
        if(it.type != 'g')
            cloneItem(it.attr("id"), it.parent.attr("id"));
        else{
            if(it.parent.type == 'g')
                var parent = 'groupId';
            else
                var parent = 'fileId'
            cloneGroup(it.attr("id"), it.parent.attr("id"), parent);
        }
        //var item = Item.findOne({_id: selected[s].attr("selected")});
        //delete item._id;
        //item.selected = 'null';
        //Meteor.call("insert_document", "Item", item);
    }
}

menuItemBrowse = function menuItemBrowse(){
    var id = Session.get('fileId');
    var par = Dependency.findOne({fileId1: id});
    window.open('/browse/file/'+ par.fileId2 + "/"+1+"/2", '_blank');
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
    var path = SVG.get(global_oro_variables.selected.members[0].attr("selected"));
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
        Meteor.call('remove_document', 'Item', selected[s].attr("selected"));
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
        Meteor.call('insert_document', 'Item', item);
    }
}

menuItemReload = function menuItemReload(){
    SVG.get(Session.get('fileId')).clear();
    Blaze.remove(renderedTemplates["show_meteor_file_svg"]);
    Blaze.renderWithData(Template.show_meteor_file_svg, {"_id": Session.get('fileId')}, document.getElementById("viewport"));
}

menuItemPermissions = function menuItemPermissions(){

}

menuItemSaveNew = function menuItemSaveNew(){
    Blaze.remove(renderedTemplates['show_meteor_file_svg']);
    cloneFile(Session.get("fileId"), function(res){
        Blaze.renderWithData(Template.show_meteor_file_svg, {"_id": res}, document.getElementById("viewport"));
    });

}

menuItemAddElement = function menuItemAddElement(){
    if($('#filebrowserModalBody').html() == ''){
        var win = Session.get("window");
        Session.set("filebrowserInHouse", "true");
        var files = Dependency.find({fileId2: "vyRjpfv2kki5sPE9G"}, {skip: Number(1)-1, limit: 9}).fetch();
        var data = {files: files, start: 1, dim: 5, id: "vyRjpfv2kki5sPE9G", col: "file"};
        $('#filebrowserModalBody').html('<button type="button" class="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">&times;</span></button><iframe width="' + 700 + '" height="' + 500 + '" src="/browse/file/vyRjpfv2kki5sPE9G/1/5/nobuttons" frameborder="0" ></iframe>')
    }
    $('#filebrowserModal').modal({backdrop: false, show: true});
    //$('#filebrowserModal').attr('aria-hidden','false').attr("style", 'visibility: visible;');
}

menuAddElemCallb = function menuAddElemCallb(id){
    $('#filebrowserModal').modal('hide');
    //$('#filebrowserModal').attr('aria-hidden','true').attr("style", 'visibility: hidden;');
    var currentLayer;
    SVG.get(Session.get('fileId')).each(function(i,children){
        if(this.visible())
            currentLayer = this;
    });
    if(!currentLayer)
        currentLayer =  SVG.get(Session.get('fileId')).first();
    if(File.findOne({_id: id})){
        var g = Group.findOne({fileId: id, type: 'layer'});
        var elem = Group.findOne({groupId: g._id},{sort: {ordering: 1}});
        if(elem)
            cloneGroup(elem, currentLayer.attr("id"), 'groupId');
        else{
            var elem = Item.findOne({groupId: g._id},{sort: {ordering: 1}});
            cloneItem(elem, currentLayer.attr("id"));
        }
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

menuItemResetMatrix = function menuItemResetMatrix(){
    var selected = global_oro_variables.selected.members[0];
    SVG.get(selected.attr("selected")).transform("matrix", '1,0,0,1,0,0');

}

menuItemSelect = function menuItemSelect(id){
    console.log(id);
    var results = buildSelector(SVG.get("svgEditor"), id);
    global_oro_variables.selected.add(results);
    SVG.get(id).draggable();
    Session.set("selected", "true");
    showDatGui();
}