
datGuiParam = function(item){
    this.saveNew = menuItemSaveNew;
    this.browse = menuItemBrowse;
    //this['unlock items'] = unlockItems;
    this.reload = menuItemReload;
    this.addElement = menuItemAddElement;
    this.source = menuItemCode;
    //this.uploadCsv = menuItemCsvModal;
    this.parameters = '';
    this.callback = '';
    this.behaviour = 'separate files';
    this.uploadType = '';
    this.itemType = '';
    this.ok = menuItemParseCsv;
    this.clearValues = function(){
        var c = global_oro_variables.gui.__folders.Upload.__controllers;
        for(var i = 3; i < c.length-1; i++){
            c[i].setValue('');
            c[i].updateDisplay();
        }
    }
    this.joinPaths = menuItemJoin;
    this.reverse = menuItemReverse;
    this.splitPaths = menuItemSplit;
    this.union = menuItemUnionSS;
    this.difference = menuItemDiffSS;
    this.xor = menuItemXorSS;
    this.intersect = menuItemIntersectSS;
    this.group = menuItemGroup;
    this.ungroup = menuItemUnGroup;
    this.title = '';
    this.toPath = menuItemDeparametrize;
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
    if(item){
        var box = item.bbox();
        this.width = box.width;
        this.height = box.height;
        this.maintainRatio = true;
        this.x = box.x;
        this.y = box.y;
        this.cx = box.cx;
        this.cy = box.cy;      
        if(item.attr("type") == 'embedediFrame' || item.attr("type") == 'embededHtml'){
            this.content = Item.findOne({_id: item.attr("id")}).text;
            this.x = item.attr("x");
            this.y = item.attr("y");
            this.width = item.attr("width");
            this.height = item.attr("height");
        }
        if(item.attr("type") == 'simple_path'){
            this["mirrorH"] = menuItemReflecthSS;
            this["mirrorV"] = menuItemReflectvSS;
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
        if(item.attr("type") == 'simpleGroup'){
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
        if(item.attr("type").indexOf('para') != -1){
            var it = Item.findOne({_id: item.attr("id")});
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

    }
    if(item && item.attr("type") != 'simpleGroup'){
        var f1 = gui.addFolder('Appearance');
        var f2 = gui.addFolder('Geometry');
    }

    var f3 = gui.addFolder('Actions');

    if(item && item.attr("type") == 'simpleGroup'){
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
        var degrees = 0, temp;
        rotate.onChange(function(value){
            console.log(value)
            var m = item.transform();
            temp = value;
            value = value - degrees;
            degrees = temp;
            console.log(value)
            var rad = value/180*Math.PI;
            var cx = item.cx();
            var cy = item.cy();
            m.e = m.e - cx;
            m.f = m.f - cy;
            item.transform("matrix", [m.a,m.b,m.c,m.d,m.e,m.f].join(','));
            m = item.transform();
            m = rotateMatrix([m.a, m.b, m.c, m.d, m.e, m.f], rad);
            //m[4] = m[4] - item.cx();
            //m[5] = m[5] - item.cy();
            //item.transform("matrix", [m.a*Math.cos(rad),m.d*Math.sin(rad),-m.a*Math.sin(rad),m.d*Math.cos(rad),m.e,m.f].join(','));
            item.transform("matrix", m.join(','));
            m = item.transform();
            m.e = m.e + cx;
            m.f = m.f + cy;
            item.transform("matrix", [m.a,m.b,m.c,m.d,m.e,m.f].join(','));
        });
        rotate.onFinishChange(function(value){
            degrees = 0;
            //saveItemLocalisation(item.attr("id"));
            //item.rotate(value/180*Math.PI);
            param.rotate = 0;
        });
        f4.open();
    }

    if(item){
        var code = f3.add(param, 'source');
        var del = f3.add(param, 'delete');
        var clone = f3.add(param, 'clone');
        var front = f3.add(param, 'toFront');
        var back = f3.add(param, 'toBack');
        if(!no)
            var box = f3.add(param, 'toGroup');
        var group = f3.add(param, 'group');
        if(item.type == 'g')
            var ungroup = f3.add(param, 'ungroup');
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
                var st = Schemas.Item.schema()['font.style'].autoform.options();
                var we = Schemas.Item.schema()['font.weight'].autoform.options();
                var fa = Schemas.Item.schema()['font.family'].autoform.options();
                var anch = Schemas.Item.schema()['font.textAnchor'].autoform.options();
                var sty = [], wei = [], fam = [], ancho = [];
                for(i in st)
                    sty.push(st[i].value);
                for(i in we)
                    wei.push(we[i].value);
                for(i in fa)
                    fam.push(fa[i].value);
                for(i in anch)
                    ancho.push(anch[i].value);
                var style = f1.add(param, 'fontStyle', sty);
                var weight = f1.add(param, 'fontWeight', wei);
                var fam = f1.add(param, 'fontFamily', fam);
                var size = f1.add(param, 'fontSize');
                var anchor = f1.add(param, 'anchor', ancho);
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
                    var it = Item.findOne({_id: item.attr("id")});
                    item.attr('href', window[it.parameters.callback](value));
                });
                src.onFinishChange(function(value){
                    var it = Item.findOne({_id: item.attr("id")});
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
            if(['rasterImage', 'formulae', 'text', 'embedediFrame', 'embededCanvas', 'embededHtml'].indexOf(item.attr('type')) == -1){
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
                if(item.attr("type").indexOf('para') == -1)
                    var angle = f2.add(param, 'angle', -180, 180).step(10)
            }
            var opac = f1.add(param, 'opacity', 0,1)
            if(['embededHtml', 'text', 'para_simple_path', 'para_complex_path'].indexOf(item.attr('type')) == -1){
                var w = f2.add(param, 'width').step(1)
                var h = f2.add(param, 'height').step(1)
                var ratio = f2.add(param, 'maintainRatio')
            }
            if(['para_simple_path', 'para_complex_path'].indexOf(item.attr('type')) == -1){
                var x = f2.add(param, 'x').step(1)
                var y = f2.add(param, 'y').step(1)
                if(['embedediFrame', 'embededCanvas', 'embededHtml'].indexOf(item.attr('type')) == -1){
                var cx = f2.add(param, 'cx').step(1)
                var cy = f2.add(param, 'cy').step(1)
                }
            }

            if(item.attr("type") == 'simple_path'){
                var reflecth = f3.add(param, "mirrorH");
                var reflectv = f3.add(param, "mirrorV");
                var reverse = f3.add(param, 'reverse');
                var subpath = f3.add(param, 'splitPaths');
            }
            if(item.attr("type") == 'complex_path'){
                var reflecth = f3.add(param, "mirrorH");
                var reflectv = f3.add(param, "mirrorV");
                var simple = f3.add(param, 'simplify', 0, 20).step(0.5);
                var reverse = f3.add(param, 'reverse');
                var subpath = f3.add(param, 'splitPaths');
            }
            if(item.attr("type") == 'embedediFrame'){
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
            if(item.attr("type") == 'embededHtml'){
                var content = f1.add(param, 'content').onChange(function(value){
                    $(item.node).html('');
                    item.appendChild("div", {innerHTML: value});
                }).onFinishChange(function(value){
                    Meteor.call('update_document', 'Item', item.attr("id"), {text: value});
                });
                x.onChange(function(value){
                        item.attr("x", value)
                        positionSelector(item.attr("id"));}).onFinishChange(function(value){
                        var points = [value, item.attr("y"), item.attr("width"), item.attr("height")].join(',');
                        console.log(points);
                        Meteor.call('update_document', 'Item', item.attr("id"), {pointList: points});
                });
                y.onChange(function(value){
                        item.attr("y", value)
                        positionSelector(item.attr("id"));}).onFinishChange(function(value){
                        item.attr("y", value)
                        var points = [item.attr("x"), value, item.attr("width"), item.attr("height")].join(',');
                        console.log(points);
                        Meteor.call('update_document', 'Item', item.attr("id"), {pointList: points});
                });
            }
            if(['rasterImage', 'formulae', 'text', 'embedediFrame', 'embededCanvas', 'embededHtml'].indexOf(item.attr('type')) == -1){
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
                if(item.attr("type").indexOf('para') == -1){
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
            }
            opac.onChange(function(value){
                item.opacity(value);
            });
            opac.onFinishChange(function(value){
                console.log(value);
                setOpacity(value);
            });
            if(['text', 'embedediFrame', 'embededCanvas', 'embededHtml', 'para_simple_path', 'para_complex_path'].indexOf(item.attr('type')) == -1){
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
            if(item.attr("type").indexOf('para') == -1 && item.attr("type") != 'embededHtml'){
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
                if(['embedediFrame','embededCanvas', 'embededHtml'].indexOf(item.attr("type")) == -1){
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
                        menuItemSimplifySC(value);
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
                        menuItemSimplifySC(value);
                        SVG.get(id).plot(SVG.get("clone_"+id).attr("d"));
                        SVG.get("clone_"+id).remove();
                        saveItemLocalisation(id);
                    }
                    else
                        SVG.get('clone_'+id).remove();
                    SVG.get('simplify_noPoints').remove();
                });
            }
            if(item.attr("type").indexOf('para') != -1){
                var it = Item.findOne({_id: item.attr("id")});
                var keys = Object.keys(it.parameters.params);
                var topath = f3.add(param, 'toPath');
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
        if(Session.get("enableEdit") == 'true'){
            //var unlock = f3.add(param, 'unlock items');
            var code = f3.add(param, 'source');
            var savenew = f3.add(param, 'saveNew');
            var addElem = f3.add(param, 'addElement');
            var title = f5.add(param, 'title').onFinishChange(function(value){
                Meteor.call('update_document', 'Item', Session.get('fileId'), {title: value});
            });
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
            //source.animate(2000, '>', 1000).plot(source.array.destination)
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
            Meteor.call('insert_document', 'Item', it)

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
    if(f3)
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
        case 'embedediFrame':
            return 'iF';
            break;
        case 'embededCanvas':
            return 'c';
            break;
        case 'embededHtml':
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