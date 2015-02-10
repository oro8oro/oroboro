
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

datGuiParam = function(item){
    if(['rasterImage', 'text'].indexOf(item.attr('type')) == -1){
        this.fillColor = '#000000';
        this.fillOpacity = 1;
        this.strokeColor = '#000000';
        this.strokeOpacity = 1;
        this.strokeWidth = 1;
        this.strokeDasharray = '';
        this.strokeLinejoin = '';
        this.strokeLinecap = '';
        this.opacity = 1;
    }
    if(item.attr('type') == 'text'){
        this.fontStyle = 'normal';
        this.fontWeight = 'normal';
        this.fontFamily = 'Sans serif';
        this.fontSize = 15;
    }
    if(item.attr('href'))
        this.href = item.attr('href')
    if(item.attr('type') == 'text')
        this.text = item.text();
    if(item.attr('font-style'))
        this.fontStyle = item.attr('font-style');
    if(item.attr('font-weight'))
        this.fontWeight = item.attr('font-weight');
    if(item.attr('font-family'))
        this.fontFamily = item.attr('font-family');
    if(item.attr('font-size'))
        this.fontSize = item.attr('font-size');
    if(item.attr('fill')){
        if(item.attr('fill') == 'none'){
            this.fillColor = '#FFFFFF';
            this.fillOpacity = 0;
        }
        else{
            this.fillColor = item.attr('fill');
            if(item.attr('fill-opacity'))
                this.fillOpacity = Number(item.attr('fill-opacity'));
        }
    }
    if(item.attr('stroke')){
        if(item.attr('stroke') == 'none'){
            this.strokeColor = '#FFFFFF';
            this.strokeOpacity = 0;
        }
        else{
            this.strokeColor = item.attr('stroke');
            if(item.attr('stroke-opacity'))
                this.strokeOpacity = Number(item.attr('stroke-opacity'));
        }
    }
    if(item.attr('stroke-width'))
        if(item.attr('stroke-width') == 'null')
            this.strokeWidth = 0;
        else
            this.strokeWidth = Number(item.attr('stroke-width'));
    if(item.attr('stroke-dasharray'))
        if(item.attr('stroke-dasharray') != 'null')
            this.strokeDasharray = item.attr('stroke-dasharray');
    if(item.attr('stroke-linejoin'))
        if(item.attr('stroke-linejoin') != 'null')
            this.strokeLinejoin = item.attr('stroke-linejoin');
    if(item.attr('stroke-linecap'))
        if(item.attr('stroke-linecap') != 'null')
            this.strokeLinecap = item.attr('stroke-linecap');
    if(item.attr('opacity'))
        if(item.attr('opacity') != 'null')
            this.opacity = item.attr('opacity');
    var box = item.bbox();
    this.width = box.width;
    this.height = box.height;
    this.maintainRatio = true;
    this.x = box.x;
    this.y = box.y;
    this.cx = box.cx;
    this.cy = box.cy;
    this.angle = 0;
}

buildDatGui = function(gui, item){
    var param = new datGuiParam(item);
    var f1 = gui.addFolder('Appearance');
    var f2 = gui.addFolder('Geometry');
    var f3 = gui.addFolder('Actions');

    if(item.attr('type') == 'text'){
        var txt = f1.add(param, 'text');
        var st = Schemas.Item.schema()['font.style'].autoform.options();
        var we = Schemas.Item.schema()['font.weight'].autoform.options();
        var fa = Schemas.Item.schema()['font.family'].autoform.options();
        var sty = [], wei = [], fam = [];
        for(i in st)
            sty.push(st[i].value);
        for(i in we)
            wei.push(we[i].value);
        for(i in fa)
            fam.push(fa[i].value);
        var style = f1.add(param, 'fontStyle', sty);
        var weight = f1.add(param, 'fontWeight', wei);
        var fam = f1.add(param, 'fontFamily', fam);
        var size = f1.add(param, 'fontSize');
        txt.onChange(function(value){
            item.text(value);
        });
        txt.onFinishChange(function(value){
            setItemsValue('text',value);
        });
        style.onChange(function(value){
            item.attr('font-style', value);
        });
        style.onFinishChange(function(value){
            setItemsValue('font.style',value);
        });
        weight.onChange(function(value){
            item.attr('font-weight', value);
            setItemsValue('font.weight',value);
        });
        weight.onFinishChange(function(value){
            setItemsValue('font.weight',value);
        });
        fam.onChange(function(value){
            item.attr('font-family', value);
        });
        fam.onFinishChange(function(value){
            setItemsValue('font.family',value);
        });
        size.onChange(function(value){
            item.attr('font-size', value);
            positionSelector(item.attr("id"));
        });
        size.onFinishChange(function(value){
            setItemsValue('font.size',value);
            saveItemLocalisation(item.attr("id"));
        });
    }
    if(item.attr('type') == 'rasterImage'){
        var src = f1.add(param, 'href');
        src.onChange(function(value){
            item.attr('href', value);
        });
        src.onFinishChange(function(value){
            setItemsValue('text',value);
        });
    }
    if(['rasterImage', 'text'].indexOf(item.attr('type')) == -1){
        var fill = f1.addColor(param, 'fillColor')
        var fillo = f1.add(param, 'fillOpacity', 0,1)
        var stroke = f1.addColor(param, 'strokeColor')
        var strokeo = f1.add(param, 'strokeOpacity', 0,1)
        var strokew = f1.add(param, 'strokeWidth').min(0).step(1)
        var stroked = f1.add(param, 'strokeDasharray')
        var lj = Schemas.Item.schema()['palette.strokeLinejoin'].autoform.options();
        var lc = Schemas.Item.schema()['palette.strokeLinecap'].autoform.options();
        var slj = [], slc = [];
        for(i in lj)
            slj.push(lj[i].value);
        for(i in lc)
            slc.push(lc[i].value);
        var strokelj = f1.add(param, 'strokeLinejoin', slj)
        var strokelc = f1.add(param, 'strokeLinecap', slc)
        var angle = f2.add(param, 'angle', -180, 180).step(10)
    }
    var opac = f1.add(param, 'opacity', 0,1)

    var w = f2.add(param, 'width')
    var h = f2.add(param, 'height')
    var ratio = f2.add(param, 'maintainRatio')
    var x = f2.add(param, 'x')
    var y = f2.add(param, 'y')
    var cx = f2.add(param, 'cx')
    var cy = f2.add(param, 'cy')

    //f3.add(param, 'simplifyCPath');
    f1.open();

    if(['rasterImage', 'text'].indexOf(item.attr('type')) == -1){
        fill.onChange(function(value){
            item.attr('fill', value);
            setFill(value);
        });
        fill.onFinishChange(function(value){
            console.log(value);
            setFill(value);
        });
        fillo.onChange(function(value){
            item.attr('fill-opacity', value);
        });
        fillo.onFinishChange(function(value){
            console.log(value);
            setFillOpacity(value);
        });
        stroke.onChange(function(value){
            item.attr('stroke', value);
            setStroke(value);
        });
        stroke.onFinishChange(function(value){
            console.log(value);
            setStroke(value);
        });
        strokeo.onChange(function(value){
            item.attr('stroke-opacity', value);
        });
        strokeo.onFinishChange(function(value){
            console.log(value);
            setStrokeOpacity(value);
        });
        strokew.onChange(function(value){
            item.attr('stroke-width', value);
        });
        strokew.onFinishChange(function(value){
            console.log(value);
            setStrokeWidth(value);
        });
        stroked.onChange(function(value){
            item.attr('stroke-dasharray', value);
        });
        stroked.onFinishChange(function(value){
            console.log(value);
            setStrokeDasharray(value);
        });
        strokelj.onChange(function(value){
            item.attr('stroke-linejoin', value);
        });
        strokelj.onFinishChange(function(value){
            console.log(value);
            setStrokeLinejoin(value);
        });
        strokelc.onChange(function(value){
            item.attr('stroke-linecap', value);
        });
        strokelc.onFinishChange(function(value){
            console.log(value);
            setStrokeLinecap(value);
        });
        var degrees = 0, temp;
        angle.onChange(function(value){
            temp = value;
            value = value - degrees;
            degrees = temp;
            if(item.attr("type") == 'simple_path')
                rotateSPath(item, item.cx(), item.cy(), value/180*Math.PI)
            if(item.attr("type") == 'complex_path')
                rotateCPath(item, item.cx(), item.cy(), value/180*Math.PI)
            rotate_selector(item.attr("id"), item.cx(), item.cy(), value/180*Math.PI)
        });
        angle.onFinishChange(function(value){
            console.log(value);
            degrees = 0;
            saveItemLocalisation(item.attr("id"));
            //update(param, 'angle', 0);
            param.angle = 0;
        });
    }
    opac.onChange(function(value){
        item.opacity(value);
    });
    opac.onFinishChange(function(value){
        console.log(value);
        setOpacity(value);
    });
    w.onChange(function(value){
        var wg = item.width();
        item.width(value);
        if(param.maintainRatio)
            item.height(item.height()*value/wg);
        positionSelector(item.attr("id"));
    });
    w.onFinishChange(function(value){
        console.log(value);
        saveItemLocalisation(item.attr("id"));
    });
    h.onChange(function(value){
        var hg = item.height();
        item.height(value);
        if(param.maintainRatio)
            item.width(item.width()*value/hg);
        positionSelector(item.attr("id"));
    });
    h.onFinishChange(function(value){
        console.log(value);
        saveItemLocalisation(item.attr("id"));
    });
    x.onChange(function(value){
        item.x(value);
        positionSelector(item.attr("id"));
    });
    x.onFinishChange(function(value){
        console.log(value);
        saveItemLocalisation(item.attr("id"));
    });
    y.onChange(function(value){
        item.y(value);
        positionSelector(item.attr("id"));
    });
    y.onFinishChange(function(value){
        console.log(value);
        saveItemLocalisation(item.attr("id"));
    });
    cx.onChange(function(value){
        item.cx(value);
        positionSelector(item.attr("id"));
    });
    cx.onFinishChange(function(value){
        console.log(value);
        saveItemLocalisation(item.attr("id"));
    });
    cy.onChange(function(value){
        item.cy(value);
        positionSelector(item.attr("id"));
    });
    cy.onFinishChange(function(value){
        console.log(value);
        saveItemLocalisation(item.attr("id"));
    });
}

menuItemBox = function menuItemBox(){
    if(global_oro_variables.selected.members.length > 0 ){
        var result = global_oro_variables.selected.members[0];
        var id = result.attr("selected");
        var selected = SVG.get(id);
        //console.log("Type: ", selected.attr("type"));
        if(selected.attr("type") != 'layer'){
            var parent = result.parent;
            var box = parent.bbox();
            //console.log(parent.attr("id"));
            //console.log(box);
            result.size(box.width, box.height).move(box.x, box.y).attr("selected",parent.attr("id"));
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

    $('#CodeEditorModalBody').html('<code>' + htmlEntities(script) + '</code>');
    $('#CodeEditorModal').modal({backdrop: false, show: true});
    global_oro_variables.svgPan.removeHandlers();
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
    id = updateDoc('File', id, [Session.get("fileId")], upd, {_id: id, creatorId: Meteor.userId()});
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
    enablePan();
}
/*
menuItemPalette = function menuItemPalette(){
    $('#Palette').modal({backdrop: false, show: true});
}
*/
createLayerMenu = function createLayerMenu(x,y){
    var layersg = SVG.get("layersGroup");
    //var layerH = y - SVG.get('minimap').bbox().height - 50;
    var a = Math.min(x,y) * mini_scale;
    var layerH = y - a - 50;
    var layerW = 20;
    var filelayers = SVG.get(Session.get("fileId")).children();
    var layers = [];
    var rects = [];
    //console.log(filelayers);
    for(k in filelayers){
        if(filelayers[k].attr("type") == 'layer' || filelayers[k].attr("type") == 'menu_item')
            layers.push(filelayers[k]);
    }
    var h = layerH / (layers.length + 1);
    var lx  = x - layerW;
    var ly = 5;
    if(layers.length > 0){
        var alllayers = layersg.rect(layerW,h).move(lx, ly).fill('#FFFFFF').attr("id","alllayers").opacity(0.6);
        ly = ly + h;
        /*
        alllayers.on('dblclick', function(event){
            var hidden = Session.get("hiddenLayers");
            for(var h in hidden)
                SVG.get(hidden[h]).show();
            Session.set("hiddenLayers", []);
        });*/
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
            var hidden = Session.get("hiddenLayers");
            var layerId = this.attr("id").substring(1);
            if(hidden.indexOf(layerId) == -1){
                SVG.get(layerId).hide();
                hidden.push(layerId);
                Session.set("hiddenLayers", hidden);
            }
            else{
                SVG.get(layerId).show();
                hidden.splice(hidden.indexOf(layerId),1);
                Session.set("hiddenLayers", hidden);
            }
        });
        rects[l].on('click', function(event){
            if(global_oro_variables.selected.members.length > 0){
                var selections = global_oro_variables.selected.members;
                var layerId = this.attr("id").substring(1);
                for(var s in selections)
                    SVG.get(layerId).add(SVG.get(selections[s].attr("selected")));
            }
            else{
                if(Session.get("selectedLayer") != this.attr("id").substring(1))   
                    Session.set("selectedLayer", this.attr("id").substring(1));
                else
                    Session.set("selectedLayer", '');
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
}

menuItemReflecthSS = function menuItemReflecthSS(){
    var item = SVG.get(global_oro_variables.selected.members[0].attr("selected"));
    var points = pathArraySvgOro(item.array.value);
    points = reflectSPath(points, true, false);
    item.plot(split_oro_path_points(JSON.stringify(points)));
}

menuItemReflectvSC = function menuItemReflectvSC(){
    var item = SVG.get(global_oro_variables.selected.members[0].attr("selected"));
    var points = item.array.value;
    points = reflectCPath(points, false, true);
    item.plot(points);
}

menuItemReflecthSC = function menuItemReflecthSC(){
    var item = SVG.get(global_oro_variables.selected.members[0].attr("selected"));
    var points = item.array.value;
    points = reflectCPath(points, true, false);
    item.plot(points);
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
    for(s in selected)
        Meteor.call('remove_document', 'Item', selected[s].attr("selected"));
}

menuItemClone = function menuItemClone(){
    var selected = global_oro_variables.selected.members;
    for(s in selected){
        var item = Item.findOne({_id: selected[s].attr("selected")});
        delete item._id;
        Meteor.call("insert_document", "Item", item);
    }
}

menuItemBrowse = function menuItemBrowse(){
    var id = Session.get('fileId');
    var par = Dependency.findOne({fileId1: id});
    window.open('/browse/file/'+ par.fileId2 + "/"+1+"/2", '_blank');
}

menuItemToBack = function menuItemToBack(){
    SVG.get(global_oro_variables.selected.members[0].attr("selected")).back();
}

menuItemToFront = function menuItemToFront(){
    SVG.get(global_oro_variables.selected.members[0].attr("selected")).front();
}

curveToSimplePath = function(points, bigDiag, noPoints, decim){
    var ct = 3;
    var tempath = SVG.get("svgEditor").path(points);
    var len = tempath.length();
    var box = tempath.bbox();
    var dg = Math.sqrt(Math.pow(box.width,2)+Math.pow(box.height,2));
    var noPo = noPoints * dg / bigDiag * ct;
    var step = len/noPo;
    var newpoints = [];
    console.log(len);console.log(noPo); console.log(step);
    console.log(dg); console.log(bigDiag);
    for(var i = 0 ; i < len ; i = i + step){
        var point = tempath.pointAt(i);
        newpoints.push( [ Number(point.x.toFixed(decim)), Number(point.y.toFixed(decim)) ] );
    }
    newpoints.push( [ points[points.length-1][5], points[points.length-1][6] ] );
    tempath.remove();
    return newpoints;
}

complexToSimplePath = function(points, diag, noPoints, decim){
    var newpoints = [], temp = [], f;
    for(p in points){
        if(points[p][0] != 'C'){
            if(temp.length > 0){
                var first = clone(newpoints[newpoints.length-1]);
                first.splice(0, 0, 'M');
                temp.splice(0, 0, first);
                var newtemp = curveToSimplePath(temp, diag, noPoints, decim).slice(1);
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

menuItemSimplifySC = function menuItemSimplifySC(){
    var path = SVG.get(global_oro_variables.selected.members[0].attr("selected"));
    var box = path.bbox();
    var diag = Math.sqrt(Math.pow(box.width,2)+Math.pow(box.height,2));
    var decim = getDecimalNo(path);
    var subpaths = getSubPaths(path);
    var newpoints = [];
    for(p in subpaths)
        newpoints.push(complexToSimplePath(subpaths[p].subpath, diag, subpaths[0].path.length, decim));    
    //var newp = split_oro_path_points(JSON.stringify(newpoints));
    //SVG.get("viewport").path(split_oro_path_points(JSON.stringify(newpoints))).stroke({color: '#993300', width: 2}).fill('none');
    //Meteor.call('update_collection', "Item", [path.attr("id")], {"pointList": newpoints, "type": "simple_path"});

    path.plot(split_oro_path_points(JSON.stringify(newpoints)));
    saveItemLocalisation(path.attr("id"));
    //setItemsValue('type', 'simple_path');
}