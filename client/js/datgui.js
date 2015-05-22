
datGuiParam = function(item){
    this.cloneFile = menuItemSaveNew;
    this.browse = menuItemBrowse;
    //this['unlock items'] = unlockItems;
    this.reload = menuItemReload;
    this.addElement = menuItemAddElement;
    this.addTemplate = menuItemAddTemplate;
    this.addConnector = menuItemAddConnector;
    this.source = menuItemCode;
    //this.uploadCsv = menuItemCsvModal;
    this.parameters = '';
    this.callback = '';
    this.behaviour = 'separate files';
    this.uploadType = '';
    this.itemType = '';
    this.ok = menuItemParseCsv;
    this.showMice = false
    this.qrcode = function(){
        $('#qrcodeModal').modal({backdrop: true, show: true});
        disablePan();
    }
    this.clearValues = function(){
        var c = global_oro_variables.gui.__folders.Upload.__controllers;
        for(var i = 3; i < c.length-1; i++){
            c[i].setValue('');
            c[i].updateDisplay();
        }
    }
    this.textPath = menuItemTextPath;
    this.pathOnPath = menuItemPathOnPath;
    this.pointSymmetry = menuItemPointSymmetry
    this.lineSymmetry = menuItemLineSymmetry
    this.itemArray = menuItemItemArray
    this.connect = menuItemConnect
    this.importSelector = menuItemImportSelector;
    this.togglePath = function(){
        var k = SVG.get(global_oro_variables.selected.members[0].attr('selected')).children();
        if(k.first().type == 'path')
            var path = k.first();
        else
            var path = k.last();
        if(path.visible())
            path.hide();
        else
            path.show();
    }
    this.split = menuItemTextPathSplit;
    this.startOffset = 0;
    this.joinPaths = menuItemJoin;
    this.reverse = menuItemReverse;
    this.splitPaths = menuItemSplit;
    this.union = menuItemUnionSS;
    this.difference = menuItemDiffSS;
    this.xor = menuItemXorSS;
    this.intersect = menuItemIntersectSS;
    this.group = menuItemGroup;
    this.ungroup = menuItemUnGroup;
    this.toggLock = menuItemLockGroup;
    this.title = '';
    this.permissions = '';
    this.closeOpen = menuItemClosePath;
    this.resetView = function(){SVG.get('viewport').transform("matrix", "1,0,0,1,0,0"); scaleMinimap("1,0,0,1,0,0");}
    this.morphpos = 0;
    this.morphopt = 'simple';
    this.toGroup = menuItemBox;
    this.delete = menuItemDelete;
    this.clone = menuItemClone;
    this["toFront"] = menuItemToFront;
    this["toBack"] = menuItemToBack;
    this.noPoints = '';
    this.path = '';
    this.elemid = '';
    this.step = '';
    this.pointType = '';
    this.pX = ''; this.pY = ''; this.ax = ''; this.ay = ''; this.bx = ''; this.by = '';
    this.rx = 0; this.ry = 0; this.r = 0;
    this.angle = 0;
    this.reset = menuItemResetMatrix;
    this.matrix = '1,0,0,1,0,0';
    this.translateX = 0;
    this.translatey = 0;
    this.scaleX = 1;
    this.scaleY = 1;
    this.rotate = 0;
    this.skewX = 0;
    this.skewY = 0;
    this.skewX = 0;
    this.skewY = 0;
    this.width = 0;
    this.height = 0;
    this.x = 0;
    this.y = 0;
    this.cx = 0;
    this.cy = 0; 
    this.fillColor = '#000000';
    this.fillOpacity = 1;
    this.strokeColor = '#000000';
    this.strokeOpacity = 1;
    this.strokeWidth = 1;
    this.strokeDasharray = '';
    this.strokeLinejoin = '';
    this.strokeLinecap = '';
    this.opacity = 1; 
    this.fontStyle = 'normal';
    this.fontWeight = 'normal';
    this.fontFamily = 'Sans serif';
    this.fontSize = 15;
    this.anchor = 'start';
    this.href = '';
    this.text = '';
    this.qrw = 400;
    this.qrtxt = '';
    if(item){
        var it = Item.findOne({_id: item.attr('id')});
        if(!it)
            it = Group.findOne({_id: item.attr('id')})
        if(item.attr('type') == 'parametrizedGroup')
            this.genPath = menuGroupDeparametrize
        else
            this.genPath = menuItemDeparametrize;
        var box = item.bbox();
        this.width = box.width;
        this.height = box.height;
        this.maintainRatio = true;
        this.x = box.x;
        this.y = box.y;
        this.cx = box.cx;
        this.cy = box.cy;
        if(item.attr('type') == 'parametrizedGroup'){
            var k = Object.keys(it.parameters.params)
            for(var i = 0; i < k.length; i++)
                if(k[i] != 'elements'){
                    this[k[i]] = it.parameters.params[k[i]];
                    console.log(k[i] + ': ' + it.parameters.params[k[i]]);
                }
            var elem = Object.keys(it.parameters.params.elements);
            for(var i = 0; i < elem.length; i++){
                this[elem[i]] = it.parameters.params.elements[elem[i]];
                this['select_' + elem[i]] = false;
            }
        }  
        if(item.attr('type') == 'pathEquation'){
            var k = Object.keys(it.parameters.params)
            for(var i = 0; i < k.length; i++)
                    this[k[i]] = it.parameters.params[k[i]]
        }
        if(item.attr('role') && item.attr('role') == 'connector'){
            console.log(item);
            var connector = Connector.findOne({_id: item.attr('connection')}); //add attributes for target and source
            console.log(connector)
            this.connector = connector.connector;
            this.marker = connector.marker;
            this.sourceAttach = connector.sourceAttach;
            this.targetAttach = connector.targetAttach;
            this.type = connector.type;
            if(connector.label && connector.label == 'true')
                this.label = 'true'
            else
                this.label = 'false'
            this.swap = function(){
                Meteor.call('update_document', 'Connector', item.attr('connection'), {source: connector.target, target: connector.source});
            }
        } 
        if(item.attr('type') == 'gradient'){
            var k = Object.keys(it.parameters.params);
            var keys;
            k.splice(k.indexOf('elements'),1);
            console.log(k);
            for(var i in k)
                this[k[i]] = it.parameters.params[k[i]];
            console.log(it);
            for(var e = 0; e < it.parameters.params.elements.length; e++){
                keys = Object.keys(it.parameters.params.elements[e]);
                console.log(keys);
                for(i = 0; i < keys.length; i++)
                    this[e + '_' + keys[i]] = it.parameters.params.elements[e][keys[i]];
            }
        } 
        if(item.attr("type") == 'embeddediFrame' || item.attr("type") == 'embeddedHtml' || item.attr("type") == 'markdown'){
            this.content = it.text;
            this.x = item.attr("x");
            this.y = item.attr("y");
            this.width = item.attr("width");
            this.height = item.attr("height");
        }
        if(item.attr("type") == 'simple_path'){
            this["mirrorH"] = menuItemReflecthSS;
            this["mirrorV"] = menuItemReflectvSS;
            this.simplify = 0;
            this.joinType = 'round'
            this.miterLimit = 2.0
            this.arcTolerance = 0.25
            this.endType = 'closedLine'
            this.delta = 0
            this.execute = menuItemOffset;
            this.clear = function(){
                if(SVG.get('offsetclone_'+item.attr('id')))
                    SVG.get('offsetclone_'+item.attr('id')).remove()
                item.opacity(Item.findOne({_id: item.attr('id')}).palette.opacity)
            }
        }
        if(item.attr("type") == 'complex_path'){
            this["mirrorH"] = menuItemReflecthSC;
            this["mirrorV"] = menuItemReflectvSC;
            this.simplify = 0;
        }
        if(item.attr('href')){
            if(item.attr("type") == 'formulae')
                this.latex = item.attr('href').substring(item.attr('href').lastIndexOf("?")+1);
            else
                this.href = item.attr('href')
        }
        if(item.attr('type') == 'qrcode'){
            var href = item.attr('href');
            this.qrw = Number(href.slice(href.indexOf('chs=')+4, href.indexOf('x')));
            this.qrtxt = decodeURI(href.slice(href.indexOf('chl=')+4, href.indexOf('&choe')));
        }
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
        if(item.attr('text-anchor'))
            this.anchor = item.attr('text-anchor');
        if(item.attr('fill')){
            if(item.attr('fill') == 'none'){
                this.fillColor = '#FFFFFF';
                this.fillOpacity = 0;
            }
            else{
                this.fillColor = item.attr('fill');
                if(item.attr('fill-opacity') || item.attr('fill-opacity') == 0){
                    this.fillOpacity = Number(item.attr('fill-opacity'));
                }
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
        if(item.attr("type") == 'simpleGroup' || item.attr("type") == 'parametrizedGroup'){
            var m = item.transform();
            this.matrix = [m.a, m.b, m.c, m.d, m.e, m.f].join(',');
            this.translateX = m.e;
            this.translateY = m.f;
            this.scaleX = m.a;
            this.scaleY = m.d;
            this.rotate = m.rotation;
            this.skewX = m.b;
            this.skewY = m.c;
        }
        if(['para_simple_path', 'para_complex_path'].indexOf(item.attr("type")) != -1){
            var keys = Object.keys(it.parameters.params);
            for(k in keys){
                if(keys[k] != "maintainRatio")
                    this[keys[k]] = Number(it.parameters.params[keys[k]]);
                else
                    this[keys[k]] = Boolean(it.parameters.params[keys[k]]);
            }
        }
    }
    else{
        this['creator'] = '';
        this['resolution'] = '';
        this.path = '';
        if(Session.get("enableEdit") == "true"){
            var f = File.findOne({_id: Session.get('fileId')});
            if(f.title)
                this.title = f.title;
            var perm = f.permissions.edit;
            if(perm.length > 0){
                for(p in perm)
                    perm[p] = Meteor.users.findOne({_id: perm[p]}).emails[0].address;
                if(perm && perm.length > 0)
                    this.permissions = perm.join(',');
            }
        }
        this.rx = '0'; this.ry = '0'; this.r = '0';
        this.width = '0';
        this.height = '0';
        this.x = '0';
        this.y = '0';
        this.cx = '0';
        this.cy = '0'; 
        this.fillColor = '#000000';
        this.fillOpacity = '1';
        this.strokeColor = '#000000';
        this.strokeOpacity = '1';
        this.strokeWidth = '1';
        this.strokeDasharray = '';
        this.strokeLinejoin = '';
        this.strokeLinecap = '';
        this.opacity = '1'; 
        this.fontStyle = 'normal';
        this.fontWeight = 'normal';
        this.fontFamily = 'Sans serif';
        this.fontSize = '15';
        this.anchor = 'start';
        this.href = '';
        this.text = '';
    }
}

buildDatGui = function(gui, item, type, no){
    var param = new datGuiParam(item);
    var f5 = gui.addFolder('Info');
    if(item){
        var it = Item.findOne({_id: item.attr('id')});
        if(!it)
            it = Group.findOne({_id: item.attr('id')});
        var elemid = f5.add(param, 'elemid', [shortType(item.attr("type"))+'_'+item.attr("id")]);
        console.log(item.type);
        if(item.type == 'path')
            var noOfPo = f5.add(param, "noPoints", [item.array.value.length]);
        var path = getElementPath(item.attr("id"),[]);
        for(p in path)
            path[p] = shortType(SVG.get(path[p]).attr("type"))+'_'+path[p];
        var elempath = f5.add(param, 'path', path.slice(0,path.length-1)).onChange(function(value){
            deselectItem(item.attr('id'));
            menuItemSelect(value.substring(value.indexOf('_')+1));
        })
        if(item.attr("type") != 'simpleGroup' && item.attr('type') != 'gradient')
            var f1 = gui.addFolder('Appearance');
        if(['simpleGroup', 'parametrizedGroup', 'gradient', 'pathEquation'].indexOf(item.attr("type")) == -1 && (!item.attr('role') || item.attr('role') != 'connector'))
            var f2 = gui.addFolder('Geometry');
        if(item.attr("type") == "simple_path")
            var f10 = gui.addFolder('Offset')
    }

    var f3 = gui.addFolder('Actions');

    if(item && (item.attr("type") == 'simpleGroup' || item.attr("type") == 'parametrizedGroup')){
        var f4 = gui.addFolder('Transform');
        var reset = f4.add(param, 'reset');
        var matrix = f4.add(param, 'matrix');
        var translateX = f4.add(param, 'translateX').step(1);
        var translateY = f4.add(param, 'translateY').step(1);
        var scaleX = f4.add(param, 'scaleX').step(0.1);
        var scaleY = f4.add(param, 'scaleY').step(0.1);
        var ratio = f4.add(param, 'maintainRatio');
        var rotate = f4.add(param, 'rotate', -180, 180).step(10);
        var skewX = f4.add(param, 'skewX').step(0.1);
        var skewY = f4.add(param, 'skewY').step(0.1);
        matrix.onChange(function(value){
            item.transform("matrix", value);
            positionSelector(item.attr("id"));
        }).onFinishChange(function(value){
            Meteor.call('update_document', 'Group', item.attr("id"), {transform: value});
        });
        translateX.onChange(function(value){
            var m = item.transform();
            console.log(value);
            var matrix = [m.a,m.b,m.c,m.d,value,m.f].join(',');
            item.transform("matrix", matrix);
            //item.attr("transform", "matrix(" + matrix + ")");
            console.log(item.transform().matrix);
            console.log(item.node.getCTM());
            positionSelector(item.attr("id"));
        });
        translateX.onFinishChange(function(value){
            var m = item.transform();
            console.log(value);
            Meteor.call('update_document', 'Group', item.attr("id"), {transform: [m.a,m.b,m.c,m.d,value,m.f].join(',')});
        });
        translateY.onChange(function(value){
            var m = item.transform();
            console.log(value);
            var matrix = [m.a,m.b,m.c,m.d,m.e,value].join(',');
            item.transform("matrix", matrix);
            //item.attr("transform", "matrix(" + matrix + ")");
            console.log(item.transform().matrix);
            console.log(item.node.getCTM());
            positionSelector(item.attr("id"));
        });
        translateY.onFinishChange(function(value){
            var m = item.transform();
            console.log(value);
            Meteor.call('update_document', 'Group', item.attr("id"), {transform: [m.a,m.b,m.c,m.d,m.e,value].join(',')});
        });
        scaleX.onChange(function(value){
            var m = item.transform();
            if(param.maintainRatio){
                item.transform("matrix", [value,m.b,m.c,value,m.e,m.f].join(','));
            }
            else
                item.transform("matrix", [value,m.b,m.c,m.d,m.e,m.f].join(','));
            positionSelector(item.attr("id"));
        });
        scaleX.onFinishChange(function(value){
            var m = item.transform();
            if(param.maintainRatio){
                Meteor.call('update_document', 'Group', item.attr("id"), {transform: [value,m.b,m.c,value,m.e,m.f].join(',')});
            }
            else
                Meteor.call('update_document', 'Group', item.attr("id"), {transform: [value,m.b,m.c,m.d,m.e,m.f].join(',')});
        });
        scaleY.onChange(function(value){
            var m = item.transform();
            if(param.maintainRatio){
                item.transform("matrix", [value,m.b,m.c,value,m.e,m.f].join(','));
            }
            else
                item.transform("matrix", [m.a,m.b,m.c,value,m.e,m.f].join(','));
            positionSelector(item.attr("id"));
        });
        scaleY.onFinishChange(function(value){
            var m = item.transform();
            if(param.maintainRatio){
                Meteor.call('update_document', 'Group', item.attr("id"), {transform: [value,m.b,m.c,value,m.e,m.f].join(',')});
            }
            else
                Meteor.call('update_document', 'Group', item.attr("id"), {transform: [m.a,m.b,m.c,value,m.e,m.f].join(',')});
        });
        skewX.onChange(function(value){
            var m = item.transform();
            item.transform("matrix", [m.a,value,m.c,m.d,m.e,m.f].join(','));
            positionSelector(item.attr("id"));
        });
        skewX.onFinishChange(function(value){
            var m = item.transform();
            Meteor.call('update_document', 'Group', item.attr("id"), {transform: [m.a,value,m.c,m.d,m.e,m.f].join(',')});
        });
        skewY.onChange(function(value){
            var m = item.transform();
            item.transform("matrix", [m.a,m.b,value,m.d,m.e,m.f].join(','));
            positionSelector(item.attr("id"));
        });
        skewY.onFinishChange(function(value){
            var m = item.transform();
            Meteor.call('update_document', 'Group', item.attr("id"), {transform: [m.a,m.b,value,m.d,m.e,m.f].join(',')});
        });
        var degrees = 0, temp, center;
        rotate.onChange(function(value){
            var m = item.transform();
            temp = value;
            value = value - degrees;
            degrees = temp;
            var rad = value/180*Math.PI;

            var mr = rotateMatrix([1,0,0,1,0,0], rad, {x: item.cx(), y: item.cy()});
            m = multiplyMatrix(mr, [m.a, m.b, m.c, m.d, m.e, m.f])

            item.transform("matrix", m.join(','));
        });
        rotate.onFinishChange(function(value){
            degrees = 0;
            var m = item.transform();
            Meteor.call('update_document', 'Group', item.attr('id'), {transform: [m.a, m.b, m.c, m.d, m.e, m.f].join(',')});
            param.rotate = 0;
        });
        if(item.attr('type') == 'simpleGroup')
            f4.open();
    }

    if(item){
        var code = f3.add(param, 'source');
        var del = f3.add(param, 'delete');
        var clone = f3.add(param, 'clone');
        var front = f3.add(param, 'toFront');
        var back = f3.add(param, 'toBack');
        var importSelector = f3.add(param, 'importSelector');
        if(!no)
            var box = f3.add(param, 'toGroup');
        var group = f3.add(param, 'group');
        if(item.attr('type') == 'simpleGroup' || item.attr("type") == 'parametrizedGroup'){
            var ungroup = f3.add(param, 'ungroup');
            var toggLock = f3.add(param, 'toggLock');
        }
        if(item.attr('type') == 'pathEquation'){
            var genPath = f3.add(param, 'genPath');
            var f7 = gui.addFolder('Parameters');
            f7.open();
            var k = Object.keys(it.parameters.params)
            var pps = [], selects = [];
            for(var i = 0; i < k.length; i++){
                if(k[i] == 'coordinates')
                    pps[i] = f7.add(param, k[i], ["polar", "cartesian"]);
                else
                    pps[i] = f7.add(param, k[i]);
                if(typeof k[i] == 'number')
                    if(Math.ceil(k[i]) == k[i])
                        pps[i].step(1);
                    else
                        pps[i].step(0.1);
                pps[i].onChange(function(value){
                    console.log(value);
                    var controllers = f7.__controllers;
                    var parameters = {};
                    for(var c = 0 ; c < controllers.length; c++)
                        for(var key in k)
                            if(controllers[c].property == k[key])
                                parameters[k[key]] = controllers[c].getValue();

                    console.log(parameters);
                    it.parameters.params = parameters
                    window[it.parameters.callback](it);
                }).onFinishChange(function(value){
                    console.log(value);
                    var controllers = f7.__controllers;
                    var parameters = {};
                    for(var c = 0 ; c < controllers.length; c++)
                        for(var key in k)
                            if(controllers[c].property == k[key])
                                parameters[k[key]] = controllers[c].getValue();
                    var changedelem = false, elems = [];
                    it.parameters.params = parameters;
                    var pointList = JSON.stringify(pathArraySvgOro(SVG.get(item.attr('id')).array.valueOf()))
                    var set = {parameters: it.parameters, pointList: pointList}
                    console.log(set);
                    Meteor.call('update_document', 'Item', item.attr('id'), set);
                });
            }
        }
        if(item.attr('type') == "parametrizedGroup"){
            var genPath = f3.add(param, 'genPath');
            var f7 = gui.addFolder('Parameters');
            f7.open();
            var k = Object.keys(it.parameters.params)
            var elem = Object.keys(it.parameters.params.elements)
            var all = elem.concat(k);
            all.splice(all.indexOf('elements'),1);
            var pps = [], selects = [];
            for(var i = 0; i < all.length; i++){
                pps[i] = f7.add(param, all[i]);
                if(typeof all[i] == 'number')
                    if(Math.ceil(all[i]) == all[i])
                        pps[i].step(1);
                    else
                        pps[i].step(0.1);
                pps[i].onChange(function(value){
                    console.log(value);
                    var controllers = f7.__controllers;
                    var parameters = {};
                    parameters.elements = {};
                    for(var c = 0 ; c < controllers.length; c++){
                        for(var key in k)
                            if(controllers[c].property == k[key])
                                parameters[k[key]] = controllers[c].getValue();
                        for(var e in elem)
                            if(controllers[c].property == elem[e])
                                parameters.elements[elem[e]] = controllers[c].getValue();
                    }
                    console.log(parameters);
                    it.parameters.params = parameters
                    window[it.parameters.callback](it.parameters);
                }).onFinishChange(function(value){
                    console.log(value);
                    var controllers = f7.__controllers;
                    var parameters = {};
                    parameters.elements = {};
                    for(var c = 0 ; c < controllers.length; c++){
                        for(var key in k)
                            if(controllers[c].property == k[key])
                                parameters[k[key]] = controllers[c].getValue();
                        for(var e in elem)
                            if(controllers[c].property == elem[e])
                                parameters.elements[elem[e]] = controllers[c].getValue();
                    }
                    var changedelem = false, elems = [];
                    for(var e in elem){
                        if(it.parameters.params.elements[elem[e]] != parameters.elements[elem[e]]){
                            Meteor.call('update_document', 'Item', parameters.elements[elem[e]], {groupId: item.attr('id'), locked: item.attr('id')});
                            Meteor.call('update_document', 'Item', it.parameters.params.elements[elem[e]], {groupId: item.parent.attr('id'), locked: 'null'});
                            changedelem = true;
                        }
                        elems.push(parameters.elements[elem[e]]);
                    }
                    it.parameters.params = parameters;
                    it.parameters.output = SVG.get(item.attr('id')).node.outerHTML;
                    var set = {parameters: it.parameters}
                    if(changedelem){
                        set.locked = elems.join(',');
                    }
                    console.log(set);
                    Meteor.call('update_document', 'Group', item.attr('id'), set);
                });
                if(elem.indexOf(all[i]) != -1){
                    selects[i] = f7.add(param, 'select_'+all[i]).onChange(function(value){
                        var controllers = global_oro_variables.gui.__folders.Parameters.__controllers
                        var index = controllers.indexOf(this);
                        if(value){
                            console.log(controllers[index-1].getValue());
                            deselectItem(item.attr('id'));
                            if(!SVG.get(controllers[index-1].getValue()).visible())
                                SVG.get(controllers[index-1].getValue()).show();
                            select_item(controllers[index-1].getValue());
                            showDatGui();
                        }
                    });
                }
            } 
        }
        if(type == 'multiple_subjects'){
            var elems = global_oro_variables.selected.members;
            if((SVG.get(elems[0].attr('selected')).type == 'path' && SVG.get(elems[1].attr('selected')).type == 'text') || ( SVG.get(elems[0].attr('selected')).type == 'text' && SVG.get(elems[1].attr('selected')).type == 'path'))
                f3.add(param, 'textPath');
        }
        if(item.attr('role') && item.attr('role') == 'connector'){
            var f9 = gui.addFolder('Connector');

            var connector = Connector.findOne({_id: item.attr('connection')})
            var connectors = ['default'];
            SVG.get('connectordefs').each(function(i){
                connectors.push(this.attr('id'));
            })
            var connectorid = f9.add(param, 'connector', connectors).onFinishChange(function(value){
                Meteor.call('update_document', 'Connector', item.attr('connection'), {connector: value});
            })

            var markers = ['null', 'default']
            SVG.get('connectors_markers').each(function(i){
                markers.push(this.attr('id'));
            })
            var marker = f9.add(param, 'marker', markers).onFinishChange(function(value){
                Meteor.call('update_document', 'Connector', item.attr('connection'), {marker: value});
                /*
                if(value && value != 'default')
                    value = SVG.get('connectors_markers').use(SVG.get(value));
                global_oro_variables.connections[item.attr('connection')].setMarker(value, SVG.get('connectors_markers'))*/
            })
            var sourceAttach = f9.add(param, 'sourceAttach', ['center', 'perifery']).onFinishChange(function(value){
                Meteor.call('update_document', 'Connector', item.attr('connection'), {sourceAttach: value});
                //global_oro_variables.connections[item.attr('connection')].setConnectorAttachment('source', value);
            })
            var targetAttach = f9.add(param, 'targetAttach', ['center', 'perifery']).onFinishChange(function(value){
                Meteor.call('update_document', 'Connector', item.attr('connection'), {targetAttach: value});
                //global_oro_variables.connections[item.attr('connection')].setConnectorAttachment('source', value);
            })
            var type = f9.add(param, 'type', ['straight', 'curved']).onFinishChange(function(value){
                Meteor.call('update_document', 'Connector', item.attr('connection'), {type: value});
            })
            var label = f9.add(param, 'label', [true, false]).onFinishChange(function(value){
                Meteor.call('update_document', 'Connector', item.attr('connection'), {label: value});
            })
            var swap = f9.add(param, 'swap');
        } 
        if(item.type == 'path'){
            var close = f3.add(param, 'closeOpen');
            var points = gui.addFolder('Points');
            var step = points.add(param, 'step', item.array.value).onChange(function(value){
                var point = value.split(',');
                var data = {}
                if(point[0] == 'C')
                    data.pointType = 'curve';
                update(param, data);
            });
            var pointType = points.add(param, 'pointType', ['move to', 'line to', 'curve to', 'close']).listen();
            var px = points.add(param, 'pX').listen();
            var px = points.add(param, 'pY').listen();
            var ax = points.add(param, 'ax').listen();
            var ay = points.add(param, 'ay').listen();
            var bx = points.add(param, 'bx').listen();
            var by = points.add(param, 'by').listen();
        }
        if(item.attr("type") != 'simpleGroup'){
            if(item.attr('type') == 'text'){
                var txt = f1.add(param, 'text');
                var st = Schemas.Item.schema()['font.style'].allowedValues
                var we = Schemas.Item.schema()['font.weight'].allowedValues
                var fa = Schemas.Item.schema()['font.family'].allowedValues
                var anch = Schemas.Item.schema()['font.textAnchor'].allowedValues

                var style = f1.add(param, 'fontStyle', st);
                var weight = f1.add(param, 'fontWeight', we);
                var fam = f1.add(param, 'fontFamily', fa);
                var size = f1.add(param, 'fontSize');
                var anchor = f1.add(param, 'anchor', anch);
                txt.onChange(function(value){
                    item.text(value);
                    positionSelector(item.attr("id"));
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
                anchor.onChange(function(value){
                    setItemsValue('font.textAnchor',value);
                    positionSelector(item.attr("id"));
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
            if(item.attr('type') == 'formulae'){
                var src = f1.add(param, 'latex');
                src.onChange(function(value){
                    //var it = Item.findOne({_id: item.attr("id")});
                    item.attr('href', window[it.parameters.callback](value));
                });
                src.onFinishChange(function(value){
                    //var it = Item.findOne({_id: item.attr("id")});
                    var text = window[it.parameters.callback](value);
                    $.ajax({
                        url: text,
                        success: function(data){
                            console.log(data);
                        }
                    });
                    it.parameters.latex = value;
                    Meteor.call('update_document', 'Item', item.attr("id"), {text: text, parameters: it.parameters});
                });
            }
            if(['simple_path', 'complex_path', 'para_simple_path', 'para_complex_path', 'text', 'pathEquation'].indexOf(item.attr('type')) != -1){
                var fill = f1.addColor(param, 'fillColor')
                var fillo = f1.add(param, 'fillOpacity', 0,1)
                var stroke = f1.addColor(param, 'strokeColor')
                var strokeo = f1.add(param, 'strokeOpacity', 0,1)
                var strokew = f1.add(param, 'strokeWidth').min(0).step(1)
                var stroked = f1.add(param, 'strokeDasharray')
                var lj = Schemas.Item.schema()['palette.strokeLinejoin'].allowedValues
                var lc = Schemas.Item.schema()['palette.strokeLinecap'].allowedValues
    
                var strokelj = f1.add(param, 'strokeLinejoin', lj)
                var strokelc = f1.add(param, 'strokeLinecap', lc)
                if(['para_simple_path', 'para_complex_path', 'pathEquation'].indexOf(item.attr("type")) == -1 && (!item.attr('role') || item.attr('role') != 'connector'))
                    var angle = f2.add(param, 'angle', -180, 180).step(1)
            }
            if(item.attr('type') != 'gradient')
                var opac = f1.add(param, 'opacity', 0,1)
            if(['text', 'para_simple_path', 'para_complex_path', 'gradient', 'parametrizedGroup', 'simpleGroup', 'pathEquation'].indexOf(item.attr('type')) == -1 && (!item.attr('role') || item.attr('role') != 'connector')){
                var w = f2.add(param, 'width').step(1)
                var h = f2.add(param, 'height').step(1)
                var ratio = f2.add(param, 'maintainRatio')
            }
            if(['para_simple_path', 'para_complex_path', 'gradient', 'parametrizedGroup', 'simpleGroup', 'pathEquation'].indexOf(item.attr('type')) == -1 && (!item.attr('role') || item.attr('role') != 'connector')){
                var x = f2.add(param, 'x').step(1)
                var y = f2.add(param, 'y').step(1)
                if(['embeddediFrame', 'embeddedCanvas', 'embeddedHtml', 'markdown', 'qrcode', 'rasterImage'].indexOf(item.attr('type')) == -1){
                var cx = f2.add(param, 'cx').step(1)
                var cy = f2.add(param, 'cy').step(1)
                }
            }
            var range = 50;
            if(item.attr("type") == 'simple_path'){
                if(item.attr("opacity"))
                    var opaque = item.attr("opacity");
                else
                    var opaque = 1;
                var box = item.bbox();
                var dg = Math.sqrt(Math.pow(box.width,2)+Math.pow(box.height,2)) / 10;

                var reflecth = f3.add(param, "mirrorH");
                var reflectv = f3.add(param, "mirrorV");
                var reverse = f3.add(param, 'reverse');
                var lighten = f3.add(param, 'simplify', 0, range).step(0.1).onChange(function(value){
                    if(value > 0){
                        item.opacity(0);
                        console.log(value)
                        value = value * dg / range
                        console.log(value)
                        menuItemLighten(value);
                        var elem = SVG.get(global_oro_variables.selected.members[0].attr("selected"));
                        if(!SVG.get('simplify_noPoints'))   
                            var noPoints = SVG.get('svgEditor').text(String(SVG.get('clone_'+elem.attr("id")).array.value.length)).move(0,0).attr("id", 'simplify_noPoints');
                        else
                            SVG.get('simplify_noPoints').text(String(SVG.get('clone_'+elem.attr("id")).array.value.length));
                    }
                }).onFinishChange(function(value){
                    var id = item.attr("id");
                    SVG.get(id).opacity(opaque);
                    if(value > 0){
                        console.log(value)
                        value = value * dg / range
                        console.log(value)
                        menuItemLighten(value);
                        SVG.get(id).plot(SVG.get("clone_"+id).attr("d"));
                        SVG.get("clone_"+id).remove();
                        saveItemLocalisation(id);
                    }
                    else
                        SVG.get('clone_'+id).remove();
                    SVG.get('simplify_noPoints').remove();
                });
                var subpath = f3.add(param, 'splitPaths');
                var pointSymmetry = f3.add(param, 'pointSymmetry');
                var lineSymmetry = f3.add(param, 'lineSymmetry');
                var itemArray = f3.add(param, 'itemArray');

                var jointype = f10.add(param, 'joinType', ['square', 'round', 'miter']).onChange(function(value){
                    menuItemOffset(true, 'joinType', value)
                })
                var miterLimit = f10.add(param, 'miterLimit').step(0.1).onChange(function(value){
                    menuItemOffset(true, 'miterLimit', value)
                }).onFinishChange(function(value){

                })
                var arcTolerance = f10.add(param, 'arcTolerance').step(0.1).onChange(function(value){
                    menuItemOffset(true, 'arcTolerance', value)
                }).onFinishChange(function(value){

                })
                var endtype = f10.add(param, 'endType', ['openSquare', 'openRound', 'openButt', 'closedLine', 'closedPolygon']).onChange(function(value){
                    menuItemOffset(true, 'endType', value)
                }).onFinishChange(function(value){
                    
                })
                var delta = f10.add(param, 'delta').step(0.5).onChange(function(value){
                    menuItemOffset(true, 'delta', value)
                }).onFinishChange(function(value){
                    
                })
                //var repetitions = f10.add(param, 'repetitions').step(1);
                var clear = f10.add(param, 'clear')
                var execute = f10.add(param, 'execute');
            }
            else if(item.attr("type") == 'complex_path'){
                var reflecth = f3.add(param, "mirrorH");
                var reflectv = f3.add(param, "mirrorV");
                var simple = f3.add(param, 'simplify', 0, range).step(0.1);
                var reverse = f3.add(param, 'reverse');
                var subpath = f3.add(param, 'splitPaths');
                var pointSymmetry = f3.add(param, 'pointSymmetry');
                var lineSymmetry = f3.add(param, 'lineSymmetry');
                var itemArray = f3.add(param, 'itemArray');
            }
            if(item.attr("type") == 'embeddediFrame'){
                var content = f1.add(param, 'content').onChange(function(value){
                    item.attr("src", value);
                    item.node.childNodes[0].setAttribute("src", value);
                }).onFinishChange(function(value){
                    Meteor.call('update_document', 'Item', item.attr("id"), {text: value});
                });
                w.onChange(function(value){
                    if(param.maintainRatio){
                        var diff = value / item.attr("width");
                        item.attr("height", item.attr("height") * diff);
                        item.node.childNodes[0].setAttribute("width", item.attr("height") * diff);
                    }
                    item.attr("width", value);
                    item.node.childNodes[0].setAttribute("width",value);
                })
                w.onFinishChange(function(value){
                    var points = [item.attr("x"), item.attr("y"), value, item.attr("height")].join(',');
                    Meteor.call('update_document', 'Item', item.attr("id"), {pointList: points});
                })
                h.onChange(function(value){
                    if(param.maintainRatio){
                        var diff = value / item.attr("height");
                        item.attr("width", item.attr("width") * diff);
                        item.node.childNodes[0].setAttribute("width", item.attr("width") * diff);
                    }
                    item.attr("height", value);
                    item.node.childNodes[0].setAttribute("height",value);
                })
                h.onFinishChange(function(value){
                    var points = [item.attr("x"), item.attr("y"), item.attr("width"), value].join(',');
                    Meteor.call('update_document', 'Item', item.attr("id"), {pointList: points});
                })
            }
            if(item.attr("type") == 'embeddedHtml' || item.attr("type") == 'markdown'){
                x.onChange(function(value){
                        item.attr("x", value)
                        positionSelector(item.attr("id"));
                    }).onFinishChange(function(value){
                        var points = [value, item.attr("y"), item.attr("width"), item.attr("height")].join(',');
                        console.log(points);
                        Meteor.call('update_document', 'Item', item.attr("id"), {pointList: points});
                    });
                y.onChange(function(value){
                        item.attr("y", value)
                        positionSelector(item.attr("id"));
                    }).onFinishChange(function(value){
                        var points = [item.attr("x"), value, item.attr("width"), item.attr("height")].join(',');
                        console.log(points);
                        Meteor.call('update_document', 'Item', item.attr("id"), {pointList: points});
                    });
                w.onChange(function(value){
                        item.attr("width", value)
                        positionSelector(item.attr("id"));
                    }).onFinishChange(function(value){
                        var points = [item.attr("x"), item.attr("y"), value, item.attr("height")].join(',');
                        console.log(points);
                        Meteor.call('update_document', 'Item', item.attr("id"), {pointList: points});
                    });
                h.onChange(function(value){
                        item.attr("height", value)
                        positionSelector(item.attr("id"));
                    }).onFinishChange(function(value){
                        var points = [item.attr("x"), item.attr("y"), item.attr("width"), value].join(',');
                        console.log(points);
                        Meteor.call('update_document', 'Item', item.attr("id"), {pointList: points});
                    });
                if(item.attr("type") == 'embeddedHtml'){
                    var content = f1.add(param, 'content').onChange(function(value){
                        $(item.node).html('');
                        item.appendChild("div", {innerHTML: value});
                    }).onFinishChange(function(value){
                        Meteor.call('update_document', 'Item', item.attr("id"), {text: value});
                    });
                }
                else{
                    var content = f1.add(param, 'content').onFinishChange(function(value){
                        Meteor.call('update_document', 'Item', item.attr("id"), {text: value});
                    });
                }
            }
            if(['simple_path', 'complex_path', 'para_simple_path', 'para_complex_path', 'text', 'pathEquation'].indexOf(item.attr('type')) != -1){
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
                if(['para_simple_path', 'para_complex_path', 'pathEquation'].indexOf(item.attr("type")) == -1){
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
                if(['simple_path', 'complex_path'].indexOf(item.attr('type')) != -1){
                    var xdegrees = 0, ydegrees = 0, temp;
                    var skewx = f2.add(param, 'skewX', -180, 180).step(1).onChange(function(value){
                        console.log(value);
                        temp = value;
                        value = value - xdegrees;
                        xdegrees = temp;
                        console.log(value);
                        skewPath(item, value/180*Math.PI, 0);
                    }).onFinishChange(function(value){
                        xdegrees = 0;
                        param.skewX = 0;
                        saveItemLocalisation(item.attr("id"));
                    });
                    var skewy = f2.add(param, 'skewY', -180, 180).step(1).onChange(function(value){
                        console.log(value);
                        temp = value;
                        value = value - ydegrees;
                        ydegrees = temp;
                        console.log(value);
                        skewPath(item, 0, value/180*Math.PI);
                    }).onFinishChange(function(value){
                        ydegrees = 0;
                        param.skewY = 0;
                        saveItemLocalisation(item.attr("id"));
                    })
                }
            }
            if(item.attr('type') != 'gradient')
                opac.onChange(function(value){
                    item.opacity(value);
                }).onFinishChange(function(value){
                    console.log(value);
                    setOpacity(value);
                });
            if(['text', 'embeddediFrame', 'embeddedCanvas', 'embeddedHtml', 'markdown', 'para_simple_path', 'para_complex_path', 'gradient', 'parametrizedGroup', 'simpleGroup', 'pathEquation'].indexOf(item.attr('type')) == -1 && (!item.attr('role') || item.attr('role') != 'connector')){
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
            }
            if(['para_simple_path', 'para_complex_path', 'embeddedHtml', 'gradient', 'parametrizedGroup', 'simpleGroup', 'pathEquation'].indexOf(item.attr("type")) == -1 && (!item.attr('role') || item.attr('role') != 'connector')){
                x.onChange(function(value){
                    console.log(value);
                        item.x(value);
                    positionSelector(item.attr("id"));
                });
                x.onFinishChange(function(value){
                    item.x(value);
                    saveItemLocalisation(item.attr("id"));
                });
                y.onChange(function(value){
                        item.y(value);
                    positionSelector(item.attr("id"));
                });
                y.onFinishChange(function(value){
                        item.y(value);
                    console.log(value);
                    saveItemLocalisation(item.attr("id"));
                });
                if(['embeddediFrame','embeddedCanvas', 'embeddedHtml', 'markdown', 'qrcode', 'rasterImage'].indexOf(item.attr("type")) == -1){
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
            }
            if(item.attr("type") == 'complex_path'){
                if(item.attr("opacity"))
                    var opaque = item.attr("opacity");
                else
                    var opaque = 1;
                simple.onChange(function(value){
                    if(value > 0){
                        item.opacity(0);
                        menuItemSimplifySC(range-value);
                        var elem = SVG.get(global_oro_variables.selected.members[0].attr("selected"));
                        if(!SVG.get('simplify_noPoints'))   
                            var noPoints = SVG.get('svgEditor').text(String(SVG.get('clone_'+elem.attr("id")).array.value.length)).move(0,0).attr("id", 'simplify_noPoints');
                        else
                            SVG.get('simplify_noPoints').text(String(SVG.get('clone_'+elem.attr("id")).array.value.length));
                    }
                });
                simple.onFinishChange(function(value){
                    var id = item.attr("id");
                    SVG.get(id).opacity(opaque);
                    if(value > 0){
                        menuItemSimplifySC(range-value);
                        SVG.get(id).plot(SVG.get("clone_"+id).attr("d"));
                        SVG.get("clone_"+id).remove();
                        saveItemLocalisation(id);
                    }
                    else
                        SVG.get('clone_'+id).remove();
                    SVG.get('simplify_noPoints').remove();
                });
            }
            if(['para_simple_path', 'para_complex_path'].indexOf(item.attr("type")) != -1){
                //var it = Item.findOne({_id: item.attr("id")});
                var keys = Object.keys(it.parameters.params);
                var genPath = f3.add(param, 'genPath');
                var pp = [], rxi,ryi;
                for(k in keys){
                    pp[k] = f2.add(param, keys[k]).onChange(function(value){
                        var vals = {}, rx,ry;
                        for(k in keys){
                            vals[keys[k]] = param[keys[k]];
                            if(param.maintainRatio){
                                if(value == param[keys[k]])
                                    if(keys[k] == 'rx'){
                                        rx = param[keys[k]];
                                        ry = ryi * rx / rxi
                                        rxi = rx;
                                        ryi = ry;
                                    }
                                    else
                                        if(keys[k] == 'ry'){
                                            ry = param[keys[k]];
                                            rx = rxi + param.rx * ry / ryi;
                                            rxi = rx;
                                            ryi = ry;
                                        }
                            }
                        }
                        if(rx)
                            vals.rx = rx;
                        if(ry)
                            vals.ry = ry;
                        console.log(vals);
                        var points = window[it.parameters.callback](vals, value);
                        if(item.attr("type") == 'para_simple_path')
                            item.plot(split_oro_path_points(points));
                        else
                            item.plot(points);
                        positionSelector(item.attr("id"));
                    }).onFinishChange(function(value){
                        var vals = {}, par = it.parameters;
                        for(k in keys){
                            vals[keys[k]] = param[keys[k]];
                            par.params[keys[k]] = param[keys[k]];
                        }
                        rxi = param.rx;
                        ryi = param.ry;
                        var points = window[it.parameters.callback](vals, value);
                        Meteor.call('update_document', 'Item', item.attr("id"), {pointList: points, parameters: par});
                    });
                }
            }
            if(item.attr('type') == 'gradient'){
                var f8 = gui.addFolder('Gradient');
                var k = Object.keys(it.parameters.params);
                k.splice(k.indexOf('elements'),1);
                console.log(k);
                console.log(it);
                var elems = [];
                for(var e = 0; e < it.parameters.params.elements.length; e++){
                    keys = Object.keys(it.parameters.params.elements[e]);
                    for(i = 0; i < keys.length; i++)
                        keys[i] = e + '_' + keys[i];
                    elems = elems.concat(keys);
                }
                console.log(elems);
                var all = elems.concat(k);
                console.log(all);
                var controls = [];
                for(var i = 0; i < all.length; i++){
                    if(all[i].indexOf('color') != -1)
                        controls[i] = f8.addColor(param, all[i]);
                    else
                        controls[i] = f8.add(param, all[i]);
                    controls[i].onChange(function(value){
                        var controllers = f8.__controllers;
                        var parameters = {};
                        parameters.elements = [];
                        for(var c = 0 ; c < controllers.length; c++){
                            for(var key in k)
                                if(controllers[c].property == k[key])
                                    parameters[k[key]] = controllers[c].getValue();
                            for(var e in elems)
                                if(controllers[c].property == elems[e]){
                                    var number = elems[e].slice(0,elems[e].indexOf('_'))
                                    var ekey = elems[e].slice(elems[e].indexOf('_')+1);
                                    if(!parameters.elements[number])
                                        parameters.elements[number] = {}
                                    parameters.elements[number][ekey] = controllers[c].getValue();
                                }
                        }
                        it.parameters.params = parameters;
                        console.log(it.parameters)
                        window[it.parameters.callback](it);
                    }).onFinishChange(function(value){
                        var controllers = f8.__controllers;
                        var parameters = {};
                        parameters.elements = [];
                        for(var c = 0 ; c < controllers.length; c++){
                            for(var key in k)
                                if(controllers[c].property == k[key])
                                    parameters[k[key]] = controllers[c].getValue();
                            for(var e in elems)
                                if(controllers[c].property == elems[e]){
                                    var number = elems[e].slice(0,elems[e].indexOf('_'))
                                    var ekey = elems[e].slice(elems[e].indexOf('_')+1);
                                    if(!parameters.elements[number])
                                        parameters.elements[number] = {}
                                    parameters.elements[number][ekey] = controllers[c].getValue();
                                }
                        }
                        it.parameters.params = parameters;
                        console.log(it.parameters)
                        Meteor.call('update_document', 'Item', item.attr('id'), {parameters: it.parameters});
                        })
                }
            }
        }
    }
    else{
        var f = File.findOne({_id: Session.get('fileId')});
        var cr = Meteor.users.findOne({_id: f.creatorId});
        var cr = f5.add(param, 'creator', [cr.emails[0].address.substring(0,cr.emails[0].address.indexOf('@'))]);
        var res = f5.add(param, 'resolution',[f.width+'x'+f.height]);
        var path = getFilePath(Session.get('fileId'));
        var filepath = f5.add(param, 'path', path).onChange(function(value){
            window.open('/filem/'+value, '_blank');
        });
        var showMice = f3.add(param, 'showMice', [true, false]).onChange(function(value){
            if(value == 'true')
                value = true
            else
                value = false
            if(Session.get('miceEnabled') && !value)
                SVG.get('mousegroup').clear();
            Session.set('miceEnabled', value);
        })
        if(Session.get("enableEdit") == 'true'){
            //var unlock = f3.add(param, 'unlock items');
            var code = f3.add(param, 'source');
            var cloneFile = f3.add(param, 'cloneFile');
            var addElem = f3.add(param, 'addElement');
            var addTemplate = f3.add(param, 'addTemplate');
            var addConnector = f3.add(param, 'addConnector');
            var title = f5.add(param, 'title').onFinishChange(function(value){
                Meteor.call('update_document', 'File', Session.get('fileId'), {title: value});
            });
            var qrcode = f5.add(param, 'qrcode');
            if(f.permissions.edit.length > 0 || f.creatorId == Meteor.userId()){
                var permissions = f5.add(param, 'permissions').onFinishChange(function(value){
                    value = value.split(',');
                    var perms = [];
                    for(v in value)
                        perms[v] = Meteor.users.findOne({'emails.address': value[v]})._id;
                    f.permissions.edit = perms;
                    Meteor.call('update_document', 'File', f._id, {permissions: f.permissions});
                });
            }
            var f6 = gui.addFolder('Upload');
            var behaviour = f6.add(param, 'behaviour', [ 'separate files', 'this file/separate layers', 'this file/this layer' ]);
            var uploadType = f6.add(param, 'uploadType', [ 'select type', 'url', 'text' ]).onChange(function(value){
                menuItemCsvModal();
            });
            var clear = f6.add(param, 'clearValues');
            var itemType = f6.add(param, 'itemType');
            var path = f6.add(param, 'path');
            var width = f6.add(param, 'width');
            var height = f6.add(param, 'height');
            var x = f6.add(param, 'x');
            var y = f6.add(param, 'y');
            var cx = f6.add(param, 'cx');
            var cy = f6.add(param, 'cy');
            var rx = f6.add(param, 'rx');
            var ry = f6.add(param, 'ry');
            var r = f6.add(param, 'r');
            var fillColor = f6.add(param, 'fillColor');
            var fillOpacity = f6.add(param, 'fillOpacity');
            var strokeColor = f6.add(param, 'strokeColor');
            var strokeOpacity = f6.add(param, 'strokeOpacity');
            var strokeWidth = f6.add(param, 'strokeWidth');
            var strokeDasharray = f6.add(param, 'strokeDasharray');
            var strokeLinejoin = f6.add(param, 'strokeLinejoin');
            var strokeLinecap = f6.add(param, 'strokeLinecap');
            var opacity = f6.add(param, 'opacity'); 
            var text = f6.add(param, 'text');
            var fontStyle = f6.add(param, 'fontStyle');
            var fontWeight = f6.add(param, 'fontWeight');
            var fontFamily = f6.add(param, 'fontFamily');
            var fontSize = f6.add(param, 'fontSize');
            var anchor = f6.add(param, 'anchor');
            var parameters = f6.add(param, 'parameters');
            var callback = f6.add(param, 'callback');
            var ok = f6.add(param, 'ok');
        }
        else
            if(f.title)
                var title = f5.add(param, 'title', [f.title]);
            else
                var title = f5.add(param, 'title', ['']);
        var browse = f5.add(param, 'browse');
        var reload = f5.add(param, 'reload');
        var resetView = f5.add(param, 'resetView');
    }
    console.log(type);
    if(type == 'simple_path'){
        var union = f3.add(param, 'union');
        var diff = f3.add(param, 'difference');
        var xor = f3.add(param, 'xor');
        var inters = f3.add(param, 'intersect');
    }
    if(type == 'simple_path' || type == 'complex_path' || type == 'multiple_paths'){
        var join = f3.add(param, 'joinPaths');
        var connect = f3.add(param, 'connect');
        var pathOnPath = f3.add(param, 'pathOnPath');
        var morphopt = f3.add(param, 'morphopt',['simple', 'align', 'ordered'])
        var fillcolor, strokecolor;
        var morphpos = f3.add(param, 'morphpos', 0, 1).onChange(function(pos){
            if(!SVG.get('clonesource')){
                var origsource = SVG.get(global_oro_variables.selected.members[0].attr("selected"));
                var origdest = SVG.get(global_oro_variables.selected.members[1].attr("selected"));
                var source = origsource.clone().attr("id", "clonesource").attr("clone", origsource.attr("id"));
                var dest = origdest.clone().attr("id","clonedest").attr("clone", global_oro_variables.selected.members[1].attr("selected"));
                if(param.morphopt == 'align'){
                    var angle1 = getAngle({x:source.cx(), y: source.cy()}, {x: source.array.value[0][1], y: source.array.value[0][2]});
                    var angle2 = getAngle({x:dest.cx(), y: dest.cy()}, {x: dest.array.value[0][1], y: dest.array.value[0][2]});
                    //var secPoint1 = source.array.pointxy(1);
                    //var secPoint2 = dest.array.pointxy(1);
                    //var angle1s = getAngle({x:source.cx(), y: source.cy()}, {x: secPoint1.x, y: secPoint1.y});
                    //var angle2s = getAngle({x:source.cx(), y: source.cy()}, {x: secPoint2.x, y: secPoint2.y}); 
                    /*
                    if(0 <= angle1s-angle1 <= 180 && (angle2s-angle2 > 180 || angle2s-angle2 < 0))
                        source.plot(reversePath(source));
                    else if(-180 <= angle1s-angle1 <= 0 && (angle1s-angle1 > 0 || angle1s-angle1 < -180))
                        source.plot(reversePath(source));*/
                    if(angle1 != angle2)
                        if(checkPathType(source) == 'simple')
                            rotateSPath(source, source.cx(), source.cy(), angle2-angle1)
                        else
                            rotateCPath(source, source.cx(), source.cy(), angle2-angle1)

                    var angle1 = getAngle({x:source.cx(), y: source.cy()}, {x: source.array.value[0][1], y: source.array.value[0][2]});
                    var angle2 = getAngle({x:dest.cx(), y: dest.cy()}, {x: dest.array.value[0][1], y: dest.array.value[0][2]});
                    var secPoint1 = source.array.pointxy(1);
                    var secPoint2 = dest.array.pointxy(1);
                    var angle1s = getAngle({x:source.cx(), y: source.cy()}, {x: secPoint1.x, y: secPoint1.y});
                    var angle2s = getAngle({x:dest.cx(), y: dest.cy()}, {x: secPoint2.x, y: secPoint2.y}); 

                    if((angle1s-angle1) * (angle2s-angle2) < 0){
                        source.plot(reversePath(source));
                        var angle1 = getAngle({x:source.cx(), y: source.cy()}, {x: source.array.value[0][1], y: source.array.value[0][2]});
                        var angle2 = getAngle({x:dest.cx(), y: dest.cy()}, {x: dest.array.value[0][1], y: dest.array.value[0][2]});
                        if(angle1 != angle2)
                            if(checkPathType(source) == 'simple')
                                rotateSPath(source, source.cx(), source.cy(), angle2-angle1)
                            else
                                rotateCPath(source, source.cx(), source.cy(), angle2-angle1)
                    }
                }
                if(param.morphopt == 'simple' || param.morphopt == 'align')
                    source.array.morph(dest.array.value, 'simplemorph');
                if(param.morphopt == 'ordered')
                    source.array.morph(dest.array.value, 'orderedmorph');
                fillcolor = new SVG.Color(source.attr('fill')).morph(dest.attr("fill"));
                strokecolor = new SVG.Color(source.attr('stroke')).morph(dest.attr("stroke"));
                source.hide();
                dest.hide();
                var frame = origsource.clone().attr("id", "frame");
            }
            SVG.get('frame').plot(SVG.get('clonesource').array.at(pos)).fill(fillcolor.at(pos)).stroke({color: strokecolor.at(pos)});
            //source.animate(2000, '>', 1000).plot(source.array.destination).loop();
        }).onFinishChange(function(pos){
            SVG.get('frame').plot(SVG.get('clonesource').array.at(pos));
            var it = Item.findOne({_id: SVG.get('clonesource').attr("clone")});
            delete it._id;
            it.groupId = SVG.get(SVG.get('clonesource').attr("clone")).parent.attr("id");
            it.selected = 'null';
            if(checkPathType(SVG.get('frame')) == 'simple'){
                it.pointList = JSON.stringify(pathArraySvgOro(SVG.get('frame').array.value));
                it.type = 'simple_path';
            }
            else{
                it.pointList = SVG.get('frame').attr("d");
                it.type = 'complex_path';
            }
            it.palette.fillColor = SVG.get('frame').attr("fill");
            it.palette.strokeColor = SVG.get('frame').attr("stroke");
            SVG.get('clonesource').remove();
            SVG.get('clonedest').remove();
            SVG.get('frame').remove();
            insertItem(it);
            /*
            cloneItem(SVG.get('clonesource').attr("clone"), SVG.get('clonesource').parent.attr("id"), function(id){
                SVG.get(id).plot(SVG.get('frame').array.value);
                saveItemLocalisation(id);
                SVG.get('clonesource').remove();
                SVG.get('clonedest').remove();
                SVG.get('frame').remove();
            });*/
        })
    }
    if(item && item.attr('type') == 'qrcode'){
        var src = f1.add(param, 'href').onChange(function(value){
                item.attr('href', value);
            }).onFinishChange(function(value){
                setItemsValue('text',value);
            });
        var qrw = f1.add(param, 'qrw').max(547).min(30).step(1).onChange(function(value){
                var href = item.attr('href');
                href = href.slice(0,href.indexOf('chs=')) + 'chs=' + value + 'x' + value + href.slice(href.indexOf('&cht='));
                item.attr('href', href);
            }).onFinishChange(function(value){
                var href = item.attr('href');
                href = href.slice(0,href.indexOf('chs=')) + 'chs=' + value + 'x' + value + href.slice(href.indexOf('&cht='));
                setItemsValue('text',href);
            });
        var qrtxt = f1.add(param, 'qrtxt').onChange(function(value){
                var encoded = encodeURI(value);
                console.log(encoded);
                var href = item.attr('href');
                href = href.slice(0,href.indexOf('chl=')) + 'chl=' + encoded + href.slice(href.indexOf('&choe'));
                item.attr('href', href);

            }).onFinishChange(function(value){
                var encoded = encodeURI(value);
                var href = item.attr('href');
                href = href.slice(0,href.indexOf('chl=')) + 'chl=' + encoded + href.slice(href.indexOf('&choe'));
                setItemsValue('text',href);
            });
    }
    if(!item || ['text', 'rasterImage', 'simple_path', 'complex_path', 'para_simple_path', 'para_complex_path', 'formulae'].indexOf(item.attr('type')) != -1)
        f3.open();
/*
    $('div.dg.main.a').on('mouseenter',function(){
        disablePan();
    })
    $('div.dg.main.a').on('mouseleave',function(){
        enablePan();
    })*/
}

shortType = function(type){
    switch(type){
        case 'simpleGroup':
            return 'g';
            break;
        case 'parametrizedGroup':
            return 'pg';
            break;
        case 'layer':
            return 'l';
            break;
        case 'simple_path':
            return 'sp';
            break;
        case 'complex_path':
            return 'cp';
            break;
        case 'text':
            return 't';
            break;
        case 'rasterImage':
            return 'i';
            break;
        case 'formulae':
            return 'f';
            break;
        case 'embeddediFrame':
            return 'iF';
            break;
        case 'embeddedCanvas':
            return 'c';
            break;
        case 'embeddedHtml':
            return 'h';
            break
        case 'nestedSvg':
            return 'svg';
            break
        default:
            return type;
    }
}

update = function(obj, data) {
    return;
  requestAnimationFrame(update);
  var keys = Object.keys(data);
  for(k in keys)
    obj[keys[k]] = data[keys[k]];
  //fizzyText.noiseStrength = Math.random();
};