
datGuiParam = function(item){
    if(item){
        this.box = menuItemBox;
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
        if(item.attr("type") == 'embedediFrame'){
            this.content = Item.findOne({_id: item.attr("id")}).text;
        }
        if(item.attr("type") == 'simple_path'){
            this["mirrorH"] = menuItemReflecthSS;
            this["mirrorV"] = menuItemReflectvSS;
        }
        if(item.attr("type") == 'complex_path'){
            this["mirrorH"] = menuItemReflecthSC;
            this["mirrorV"] = menuItemReflectvSC;
            //this.simplify = menuItemSimplifySC;
            this.simplify = 0;
        }
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
            this.anchor = 'start';
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
        var box = item.bbox();
        this.width = box.width;
        this.height = box.height;
        this.maintainRatio = true;
        this.x = box.x;
        this.y = box.y;
        this.cx = box.cx;
        this.cy = box.cy;
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
    }
    this.permissions = menuItemPermissions;
    this.saveNew = menuItemSaveNew;
    this.browse = menuItemBrowse;
    this['unlock items'] = unlockItems;
    this.reload = menuItemReload;
    this.addElement = menuItemAddElement;
    this.source = menuItemCode;
    this.joinPaths = menuItemJoin;
    this.reverse = menuItemReverse;
    this.splitPaths = menuItemSplit;
    this.union = menuItemUnionSS;
    this.difference = menuItemDiffSS;
    this.xor = menuItemXorSS;
    this.intersect = menuItemIntersectSS;
    this.group = menuItemGroup;
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
            console.log(value);
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
        var ratio = f4.add(param, 'maintainRatio');
        var scaleX = f4.add(param, 'scaleX').step(0.1);
        var scaleY = f4.add(param, 'scaleY').step(0.1);
        var rotate = f4.add(param, 'rotate', -180, 180).step(10);
        var skewX = f4.add(param, 'skewX').step(0.1);
        var skewY = f4.add(param, 'skewY').step(0.1);
        matrix.onChange(function(value){
            //item.transform("matrix", value);
            Meteor.call('update_document', 'Group', item.attr("id"), {transform: value});
        });
        translateX.onChange(function(value){
            var m = item.transform();
            item.transform("matrix", [m.a,m.b,m.c,m.d,value,m.f].join(','));
            positionSelector(item.attr("id"));
        });
        translateX.onFinishChange(function(value){
            var m = item.transform();
            Meteor.call('update_document', 'Group', item.attr("id"), {transform: [m.a,m.b,m.c,m.d,value,m.f].join(',')});
        });
        translateY.onChange(function(value){
            var m = item.transform();
            item.transform("matrix", [m.a,m.b,m.c,m.d,m.e,value].join(','));
            positionSelector(item.attr("id"));
        });
        translateY.onFinishChange(function(value){
            var m = item.transform();
            Meteor.call('update_document', 'Group', item.attr("id"), {transform: [m.a,m.b,m.c,m.d,m.e,value].join(',')});
        });
        scaleX.onChange(function(value){
            var m = item.transform();
            if(param.maintainRatio){
                item.transform("matrix", [value,m.b,m.c,value,m.e,m.f].join(','));
            }
            else
                item.transform("matrix", [value,m.b,m.c,m.d,m.e,m.f].join(','));
            //positionSelector(item.attr("id"));
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
            //positionSelector(item.attr("id"));
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
        skewX.onFinishChange(function(value){
            var m = item.transform();
            Meteor.call('update_document', 'Group', item.attr("id"), {transform: [m.a,m.b,value,m.d,m.e,m.f].join(',')});
        });
        var degrees = 0, temp;
        rotate.onChange(function(value){
            var m = item.transform();
            temp = value;
            value = value - degrees;
            degrees = temp;
            var rad = value/180*Math.PI;
            item.transform("matrix", [m.a*Math.cos(rad),m.d*Math.sin(rad),-m.a*Math.sin(rad),m.d*Math.cos(rad),m.e,m.f].join(','));
        });
        rotate.onFinishChange(function(value){
            console.log(value);
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
            var box = f3.add(param, 'box');
        if(no)
            var group = f3.add(param, 'group');
        if(item.type == 'path'){
            var points = gui.addFolder('Points');
            var step = points.add(param, 'step', item.array.value).onChange(function(value){
                console.log(value);
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
            if(['rasterImage', 'text', 'embedediFrame', 'embededCanvas'].indexOf(item.attr('type')) == -1){
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
            if(item.attr('type') != 'text' && item.attr("type").indexOf('para') == -1){
                var w = f2.add(param, 'width').step(1)
                var h = f2.add(param, 'height').step(1)
                var ratio = f2.add(param, 'maintainRatio')
            }
            if(item.attr("type").indexOf('para') == -1){
                var x = f2.add(param, 'x').step(1)
                var y = f2.add(param, 'y').step(1)
                var cx = f2.add(param, 'cx').step(1)
                var cy = f2.add(param, 'cy').step(1)
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
                var simple = f3.add(param, 'simplify', 0, 10);
                var reverse = f3.add(param, 'reverse');
                var subpath = f3.add(param, 'splitPaths');
            }
            if(item.attr("type") == 'embedediFrame'){
                var content = f1.add(param, 'content').onFinishChange(function(value){
                    Meteor.call('update_document', 'Item', item.attr("id"), {text: value});
                });
                w.onFinishChange(function(value){
                    var points = [param["x"], param["y"], value, param["height"]].join(',');
                    Meteor.call('update_document', 'Item', item.attr("id"), {pointList: points});
                })
                h.onFinishChange(function(value){
                    var points = [param["x"], param["y"], param["width"], value].join(',');
                    Meteor.call('update_document', 'Item', item.attr("id"), {pointList: points});
                })
            }
            if(['rasterImage', 'text', 'embedediFrame', 'embededCanvas'].indexOf(item.attr('type')) == -1){
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
            if(item.attr('type') != 'text' && item.attr("type").indexOf('para') == -1 && item.attr("type") != 'embedediFrame'){
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
            if(item.attr("type").indexOf('para') == -1){
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
            if(item.attr("type") == 'complex_path'){
                if(item.attr("opacity"))
                    var opaque = item.attr("opacity");
                else
                    var opaque = 1;
                simple.onChange(function(value){
                    if(value > 0){
                        item.opacity(0);
                        menuItemSimplifySC(value);
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
                });
            }
            if(item.attr("type").indexOf('para') != -1){
                var it = Item.findOne({_id: item.attr("id")});
                var keys = Object.keys(it.parameters.params);
                var pp = [];
                for(k in keys){
                    pp[k] = f2.add(param, keys[k]).onChange(function(value){
                        var vals = {}
                        for(k in keys)
                            vals[keys[k]] = param[keys[k]];
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
                        var points = window[it.parameters.callback](vals, value);
                        Meteor.call('update_document', 'Item', item.attr("id"), {pointList: points, parameters: par});
                    });
                }
            }
        }
    }
    else{
        var browse = f3.add(param, 'browse');
        var reload = f3.add(param, 'reload');
        var f = File.findOne({_id: Session.get('fileId')});
        var cr = Meteor.users.findOne({_id: f.creatorId});
        var cr = f5.add(param, 'creator', [cr.profile.name]);
        var res = f5.add(param, 'resolution',[f.width+'x'+f.height]);
        var path = getFilePath(Session.get('fileId'));
        var filepath = f5.add(param, 'path', path).onChange(function(value){
            window.open('/filem/'+value, '_blank');
        });
        if(Session.get("enableEdit") == 'true'){
            var unlock = f3.add(param, 'unlock items');
            var code = f3.add(param, 'source');
            var permis = f3.add(param, 'permissions');
            var savenew = f3.add(param, 'saveNew');
            var addElem = f3.add(param, 'addElement');
        }
    }
    console.log(type);
    if(type == 'simple_path'){
        var join = f3.add(param, 'joinPaths');
        var union = f3.add(param, 'union');
        var diff = f3.add(param, 'difference');
        var xor = f3.add(param, 'xor');
        var inters = f3.add(param, 'intersect');
    }
    if(type == 'complex_path'){
        var join = f3.add(param, 'joinPaths');
    }
    if(f3)
        f3.open();

    $('div.dg.main.a').on('mouseenter',function(){
        disablePan();
    })
    $('div.dg.main.a').on('mouseleave',function(){
        enablePan();
    })
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
        case 'embedediFrame':
            return 'iF';
            break;
        case 'embededCanvas':
            return 'cv';
            break;
        default:
            return type;
    }
}

update = function(obj, data) {
    console.log(obj)
    console.log(data);
    return;
  requestAnimationFrame(update);
  var keys = Object.keys(data);
  for(k in keys)
    obj[keys[k]] = data[keys[k]];
  //fizzyText.noiseStrength = Math.random();
};