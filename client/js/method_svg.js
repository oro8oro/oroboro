panCallback = function(a){
        var matrix = a.a + ","+a.b + ","+a.c + ","+a.d + ","+a.e + ","+a.f;
        scaleMinimap(matrix);
        //SVG.get("mini_doc").transform('matrix',matrix);
        var truematrix = SVG.get("viewport").node.getAttribute("transform");
        truematrix = truematrix.substring(7,truematrix.length-1);
        SVG.get("viewport").transform("matrix",truematrix);
        var selected = global_oro_variables.selected.members;
        for(s in selected)
            positionSelector(selected[s].attr("selected"));
        var locked = Session.get("lockedItems")
        for(l in locked)
            positionSelectorL(locked[l]);
}

enablePan = function(){
    var elem = document.getElementById('svgEditor');
    global_oro_variables.svgPan = SVGPan(elem, {
        enablePan: true,
        enableZoom: true,
        enableDrag: false,
        zoomScale: 0.2,
        callback: panCallback
    });
}

disablePan = function(){
    global_oro_variables.svgPan.removeHandlers();
}


removeGui = function() {
  global_oro_variables.gui.domElement.parentElement.removeChild(global_oro_variables.gui.domElement);
  global_oro_variables.gui = undefined;
}

addGui = function(gui, parent) {
  if(!parent) {
    parent = document.getElementsByClassName('dg ac');
  }
  parent.appendChild(gui);
}

findCoordCPath = function(points){
    var x1 = points[0][1];
    var x2 = points[0][1];
    var y1,y2;
    var y3 = points[0][2];
    var y4 = points[0][2];
    var x3,x4, tempx, tempy;
    for(var p in points){
        if(['M','L'].indexOf(points[p][0]) != -1){
            tempx = points[p][1];
            tempy = points[p][2];
        }
        else
            if(points[p][0] == 'C'){
                tempx = points[p][5];
                tempy = points[p][6];
            }
        if(tempx < x1){
            x1 = tempx;
            y1 = tempy;
        }
        if(tempx > x2){
            x2 = tempx;
            y2 = tempy;
        }
        if(tempy < y3){
            x3 = tempx;
            y3 = tempy;
        }
        if(tempy > y4){
            x4 = tempx;
            y4 = tempy;
        }
    }
    return {xmin: {x: x1, y: y1}, xmax:{x: x2, y: y2}, ymin: {x: x3, y: y3}, ymax: {x: x4, y: y4}};       
}

movePoint = function(point, dx, dy, coord, sidex, sidey){
    var x = point[0], y = point[1];
    if(sidex == "r")
        point[0] = x + (x - coord.xmin.x) / (coord.xmax.x - coord.xmin.x) * dx;
    else
        point[0] = x + (coord.xmax.x - x) / (coord.xmax.x - coord.xmin.x) * dx;
    
    if(sidey == "b")
        point[1] = y + (y - coord.ymin.y) / (coord.ymax.y - coord.ymin.y) * dy;
    else
        point[1] = y + (coord.ymax.y - y) / (coord.ymax.y - coord.ymin.y) * dy;
    return point;
}

resizeCPathp = function(points, dx, dy, coord, sidex, sidey){
    if(['Z','z'].indexOf(points[0]) == -1){
        var p = movePoint([points[1],points[2]], dx, dy, coord, sidex, sidey);
        points[1] = p[0];
        points[2] = p[1];
        if(points[0] == 'C'){
            p = movePoint([points[3],points[4]], dx, dy, coord, sidex, sidey);
            points[3] = p[0];
            points[4] = p[1];
            p = movePoint([points[5],points[6]], dx, dy, coord, sidex, sidey);
            points[5] = p[0];
            points[6] = p[1];
        }
    }
    
    return points;
}

resizeCPath = function(points, dx, dy, sidex, sidey){
    var coord = findCoordCPath(points);
    var newpoints = [];
    for(var p in points){
        newpoints.push(resizeCPathp(points[p], dx, dy, coord, sidex, sidey));
    }
    return newpoints;
}

findCoord = function(points){
    var x1 = points[0][0][0];
    var x2 = points[0][0][0];
    var y1,y2;
    var y3 = points[0][0][1];
    var y4 = points[0][0][1];
    var x3,x4
    for(var l in points)
        for(var p in points[l]){
            if(points[l][p][0] < x1){
                x1 = points[l][p][0];
                y1 = points[l][p][1];
            }
            if(points[l][p][0] > x2){
                x2 = points[l][p][0];
                y2 = points[l][p][1];
            }
            if(points[l][p][1] < y3){
                x3 = points[l][p][0];
                y3 = points[l][p][1];
            }
            if(points[l][p][1] > y4){
                x4 = points[l][p][0];
                y4 = points[l][p][1];
            }
        }
    return {xmin: {x: x1, y: y1}, xmax:{x: x2, y: y2}, ymin: {x: x3, y: y3}, ymax: {x: x4, y: y4}};       
}

resizeSPathp = function(points, dx, dy, coord, sidex, sidey){
    for(var p in points){
        var x = points[p][0];
        if(sidex == "r")
            points[p][0] = x + (x - coord.xmin.x) / (coord.xmax.x - coord.xmin.x) * dx;
        else
            points[p][0] = x + (coord.xmax.x - x) / (coord.xmax.x - coord.xmin.x) * dx;
        //points[p][0] = x + (x - coord.x1) * (coord.x2 + dx - coord.x1) / Math.pow((coord.x2 - coord.x1),2);
        var y = points[p][1];
        if(sidey == "b")
            points[p][1] = y + (y - coord.ymin.y) / (coord.ymax.y - coord.ymin.y) * dy;
        else
            points[p][1] = y + (coord.ymax.y - y) / (coord.ymax.y - coord.ymin.y) * dy;
        //points[p][1] = y + (y - coord.y1) * (coord.y2 + dy - coord.y1) / Math.pow((coord.y2 - coord.y1),2);
    }
    return points;
}

resizeSPath = function(points, dx, dy, sidex, sidey){
    var coord = findCoord(points);
    var newpoints = [];
    for(var l in points){
        newpoints.push(resizeSPathp(points[l], dx, dy, coord, sidex, sidey));
    }

    return newpoints;
}

resizeImage = function(img, dx, dy, sidex, sidey){
    if(sidex == 'r')
        img.width(img.width() + dx);
    else{
        img.width(img.width() - dx);
        img.dx(dx);
    }
    if(sidey == 'b')
        img.height(img.height() + dy);
    else{
        img.height(img.height() - dy);
        img.dy(dy);
    }
}

reflectSPathp = function(points, x, y, coord){
    for(var p in points){
        if(x)
            points[p][0] = coord.xmax.x - (points[p][0] - coord.xmin.x);
        if(y)
            points[p][1] = coord.ymax.y - (points[p][1] - coord.ymin.y);
    }
    return points;
}

reflectSPath = function(points, x, y){
    var coord = findCoord(points);
    var newpoints = [];
    for(var l in points){
        newpoints.push(reflectSPathp(points[l], x, y, coord));
    }
    return newpoints;
}

reflectPoint = function(p, x, y, coord){
    if(x)
        p[0] = coord.xmax.x - (p[0] - coord.xmin.x);
    if(y)
        p[1] = coord.ymax.y - (p[1] - coord.ymin.y);
    return p;
}

reflectCPath = function(points, x, y){
    var coord = findCoordCPath(points);
    var po;
    for(var p in points){
        if(['Z','z'].indexOf(points[p][0]) == -1){
            po = reflectPoint([points[p][1],points[p][2]], x, y, coord)
            points[p][1] = po[0];
            points[p][2] = po[1];
            if(points[p][0] == 'C'){
                po = reflectPoint([points[p][3],points[p][4]], x, y, coord)
                points[p][3] = po[0];
                points[p][4] = po[1];
                po = reflectPoint([points[p][5],points[p][6]], x, y, coord)
                points[p][5] = po[0];
                points[p][6] = po[1];
            }
        }
    }
    return points;
}

//if replace = true, it replaces the current path; if false, returns the inverse path string
inverseSPath = function(path, replace){
    var points = pathArraySvgOro(path.array.value);
    var newpoints = [];
    for(l = points.length-1 ; l >= 0 ; l--){
        newpoints.push([]);
        for(p = points[l].length-1; p >= 0; p--)
            newpoints[newpoints.length-1].push(points[l][p]);
    }
    if(replace){
        path.plot(split_oro_path_points(JSON.stringify(points)));
        return path;
    }
    else
        return split_oro_path_points(JSON.stringify(points));
}

splitSPath = function(path){

}

buildCircle = function(parent,attr,r,i){
    var circle = parent.circle(2*r).stroke({color: "#FFFFFF", width: 3}).attr("pointer-events","all").attr("id",attr).fill('#000000');
    return circle;
}

positionCircles = function(x,y,w,h,id,rotate){
    var s = "circle_", e = "_"+id;
    if(SVG.get(s+7+e))
    SVG.get(s+0+e).cx(x + w/2).cy(y);
    SVG.get(s+1+e).cx(x + w).cy(y);
    SVG.get(s+2+e).cx(x + w).cy(y + h/2);
    SVG.get(s+3+e).cx(x + w).cy(y + h);
    SVG.get(s+4+e).cx(x + w/2).cy(y + h);
    SVG.get(s+5+e).cx(x).cy(y + h);
    SVG.get(s+6+e).cx(x).cy(y + h/2);
    SVG.get(s+7+e).cx(x).cy(y);
    if(rotate)
        SVG.get("rotate_"+id).cx(x + w/2).cy(y - 30);
}

rotate_point = function(cx, cy, angle, p){
  var s = Math.sin(angle);
  var c = Math.cos(angle);
  // translate point back to origin:
  p[0] -= cx;
  p[1] -= cy;
  // rotate point
  var xnew = p[0] * c - p[1] * s;
  var ynew = p[0] * s + p[1] * c;
  // translate point back:
  p[0] = xnew + cx;
  p[1] = ynew + cy;
  return p;
}

rotateSPath = function(item, cx, cy, angle){
    var points = pathArraySvgOro(item.array.value);
    for(l in points){
        for(p in points[l]){
            points[l][p] = rotate_point(cx, cy, angle, points[l][p]);
        }
    }
    points = split_oro_path_points(JSON.stringify(points));
    item.plot(points);
    return item;
}

rotateCPath = function(item, cx, cy, angle){
    var points = item.array.value;
    var po;
    for(p in points){
        if(['Z','z'].indexOf(points[p][0]) == -1){
            po = rotate_point(cx, cy, angle, [points[p][1],points[p][2]]);
            points[p][1] = po[0];
            points[p][2] = po[1];
        }
        if(points[p][0] == 'C'){
            po = rotate_point(cx, cy, angle, [points[p][3],points[p][4]]);
            points[p][3] = po[0];
            points[p][4] = po[1];
            po = rotate_point(cx, cy, angle, [points[p][5],points[p][6]]);
            points[p][5] = po[0];
            points[p][6] = po[1];
        }
    }
    item.plot(points);
    return item;
}

rotate_selector = function(id, cx, cy, angle){
    rotateSPath(SVG.get("container_path_"+id), cx, cy, angle);
    for(var i=0; i < 8; i++){
        var center = [SVG.get("circle_"+i+"_"+id).cx(), SVG.get("circle_"+i+"_"+id).cy()];
        var newcenter = rotate_point(cx, cy, angle, center);
        SVG.get("circle_"+i+"_"+id).cx(newcenter[0]).cy(newcenter[1]);
    }
}

getAngle = function(center, p1) {
    var p0 = {x: center.x, y: center.y - Math.sqrt(Math.abs(p1.x - center.x) * Math.abs(p1.x - center.x) + Math.abs(p1.y - center.y) * Math.abs(p1.y - center.y))};
    return (2 * Math.atan2(p1.y - p0.y, p1.x - p0.x));// * 180 / Math.PI;
}

positionPoint = function(x,y){
    var truematrix = SVG.get("viewport").node.getAttribute("transform");
    if(truematrix){
        truematrix = truematrix.substring(7,truematrix.length-1);
        var matrix = truematrix.split(" ");
        return {x: x*Number(matrix[0]) + Number(matrix[4]), y: y* Number(matrix[3]) + Number(matrix[5])};
    }
    else return {x:x,y:y};
}

positionPointIni = function(x,y){
    var truematrix = SVG.get("viewport").node.getAttribute("transform");
    if(truematrix){
        truematrix = truematrix.substring(7,truematrix.length-1);
        var matrix = truematrix.split(" ");
        return { x: (x - Number(matrix[4])) / Number(matrix[0]), y: (y - Number(matrix[5])) / Number(matrix[3]) };
    }
    else return {x:x,y:y};
}

getScale = function(){
    var truematrix = SVG.get("viewport").node.getAttribute("transform");
    if(truematrix){
        truematrix = truematrix.substring(7,truematrix.length-1);
        var matrix = truematrix.split(" ");
        return Number(matrix[0]);
    }
    else return 1; 
}


transformBox = function(box){
    var truematrix = SVG.get("viewport").node.getAttribute("transform");
    if(truematrix){
        truematrix = truematrix.substring(7,truematrix.length-1);
        if(truematrix.indexOf(',') != -1)
            var matrix = truematrix.split(",");
        else
            var matrix = truematrix.split(" ");
        box.x = box.x*Number(matrix[0]) + Number(matrix[4])
        box.y = box.y* Number(matrix[3]) + Number(matrix[5]) 
        box.width = box.width * Number(matrix[0]);
        box.height = box.height * Number(matrix[3]);
    }
    return box;
}
positionSelectorL = function(id){
    var box = transformBox(SVG.get(id).bbox());   
    var path = 'M'+box.x+','+box.y+'L'+(box.x+box.width)+','+box.y+'L'+(box.x+box.width)+','+(box.y+box.height)+'L'+box.x+','+(box.y+box.height)+'z';
    SVG.get("container_path_"+id).plot(path);
}

positionSelector = function(id){
    if(['3D','pathPoints'].indexOf(SVG.get("box_"+id).attr("type")) == -1){
        var box = transformBox(SVG.get(id).bbox());   
        var path = 'M'+box.x+','+box.y+'L'+(box.x+box.width)+','+box.y+'L'+(box.x+box.width)+','+(box.y+box.height)+'L'+box.x+','+(box.y+box.height)+'z';
        if(SVG.get("container_path_"+id)){
            SVG.get("container_path_"+id).plot(path);
            var newbox = SVG.get("container_path_"+id).bbox();
        }
        if(SVG.get("box_"+id).attr("type") == 'draggable')
            positionCircles(newbox.x,newbox.y,newbox.width,newbox.height, id, true);
        if(SVG.get("editPoints")) 
            positionButtons(newbox);
    }
    //if(SVG.get("box_"+id).attr("type") == '3D'){
    //    positionSelector3D(id);
    //}
}

positionButtons = function(box){
    var but = 35;
    var sp = but/4;
    SVG.get("editPoints").size(but,but).move(box.x+box.width/2-but-sp, box.y+box.height+sp)
    SVG.get("3DPoints").size(but,but).move(box.x+box.width/2+sp, box.y+box.height+sp)
}

setButtons = function(id){
    var box = SVG.get(id).bbox();
    var buttons = []
    buttons[0] = SVG.get("container_"+id).image('/file/MeSC479WX69b9GATS').attr("id", "editPoints").opacity(0.6);
    buttons[1] = SVG.get("container_"+id).image('/file/isqRsRCPhGeSPNhoh').attr("id", "3DPoints").opacity(0.6);
    positionButtons(box);
    for(i in buttons){
        buttons[i].on('mouseover', function(){
            this.opacity(1);
        });
        buttons[i].on('mouseout', function(){
                this.opacity(0.6);
            });
    }
    buttons[0].on('click', function(){
        SVG.get('box_'+id).remove();
        var sel = buildSelectorPoints(SVG.get("svgEditor"), id);
        global_oro_variables.selected.add(sel);
    });
    buttons[1].on('click', function(){
        SVG.get('box_'+id).remove();
        var sel = buildSelector3D(SVG.get("svgEditor"), id);
        global_oro_variables.selected.add(sel);
        SVG.get(id).draggable();
    });
}

buildSelector = function(parent,id, dragg){
    var r = 10;
    var box = SVG.get(id).bbox();
    var selector = parent.group().attr("id","box_"+id).attr("selected",id).attr("type","draggable");
    var container = selector.group().attr("id","container_"+id);
    var path = 'M'+box.x+','+box.y+'L'+(box.x+box.width)+','+box.y+'L'+(box.x+box.width)+','+(box.y+box.height)+'L'+box.x+','+(box.y+box.height)+'z';
    var rect = container.path(path).stroke({color: "#000000", width: 2, dasharray: "2,2", opacity: "0.8"}).fill("none").attr("id","container_path_"+id);
    var circles = [];
    for(i = 0 ; i < 8 ; i++)
        circles[i] = buildCircle(container,"circle_"+i+"_"+id,r,i);
    circles[8] = buildCircle(selector, "rotate_"+id,r);
    //positionCircles(box.x,box.y,box.width,box.height,id);
    circles[8].cx(box.x + box.width/2).cy(box.y - 30); 
    circles[8].attr("style","cursor:url(/icons/rotate.png) 12 12, auto;");
    //circles[8].attr("style","cursor:url(/file/W6fHbEQiGTQ83k5tp) 12 12, auto;");
    if(['simple_path', 'complex_path'].indexOf(dragg) != -1) 
        setButtons(id);

    positionSelector(id);

    circles[8].draggable();
    var shift = false;
    circles[8].on('mousedown', function(e){
        if(e.shiftKey)
            shift = true;
    });
    circles[8].on('beforedrag', function(event){
        disablePan();
        event.stopPropagation();
        event.preventDefault();
    });
    var startangle = 0;
    var cx = SVG.get(id).cx();
    var cy = SVG.get(id).cy();
    circles[8].on('dragstart', function(event){
        disablePan();
        event.stopPropagation();
        event.preventDefault();
    });
    circles[8].on('dragmove', function(event){
        if(shift)
            var angle = 45 * Math.PI / 180;
        else
            var angle = getAngle({x: cx, y: cy}, {x: this.cx(), y: this.cy()});
        var temp = startangle;
        startangle = angle;
        angle = angle - temp;
        if(dragg == 'simple_path')
            rotateSPath(SVG.get(id), cx, cy, angle);
        if(dragg == 'complex_path')
            rotateCPath(SVG.get(id), cx, cy, angle);
        rotate_selector(id, cx, cy, angle);
    });
    circles[8].on('dragend', function(event){
        if(shift)
            var angle = 45 * Math.PI / 180;
        else
            var angle = getAngle({x: cx, y: cy}, {x: this.cx(), y: this.cy()});
        angle = angle - startangle;
        if(dragg == 'simple_path')
            rotateSPath(SVG.get(id), cx, cy, angle);
        if(dragg == 'complex_path')
            rotateCPath(SVG.get(id), cx, cy, angle);
        rotate_selector(id, cx, cy, angle);
        //enablePan();
        togglePanZoom();
        event.stopPropagation();
        event.preventDefault();
        saveItemLocalisation(id);
        shift = false;
    });
    var x = box.x; var y = box.y;
    var w = box.width; var h = box.height;
    //if(dragg){
        for(i=0; i < 8 ; i++){
            if( i % 4 == 0){
                circles[i].draggable({
                    minX: x + w/2, maxX: x + w/2 
                });
            }
            else
                if( i % 2 == 0 && i % 4 != 0){
                    circles[i].draggable({
                        minY: y + h/2, maxY: y + h/2
                    });
                }
                else{
                    circles[i].draggable();
                }
            var startx, starty;
            var shift = false;
            circles[i].on('mousedown', function(e){
                if(e.shiftKey)
                    shift = true;
            });
            circles[i].on('beforedrag', function(event){
                disablePan();
                event.stopPropagation();
                event.preventDefault();
            });
            circles[i].on('dragstart', function(event){
                disablePan();
                event.stopPropagation();
                event.preventDefault();
                sx = startx = this.cx();
                sy = starty = this.cy();
            });
            circles[i].on('dragmove', function(event){
                var distx = this.cx() - startx;
                var disty = this.cy() - starty;
                startx = this.cx();
                starty = this.cy();
                i = Number(this.attr("id").substring(7,8));
                if(shift || dragg == 'rasterImage'){
                    if(i % 2 == 0)
                        this.fixed();
                    else
                        if([1,3].indexOf(i) != -1){
                            var w = rect.width(), h = rect.height();
                            rect.width(w + distx);
                            rect.height(h + distx*h/w);
                            sidex = "r";
                            if(i == 1){
                                sidey = "t";
                                rect.dy(-distx*h/w);
                                disty = -distx*h/w;
                            }
                            if(i == 3){
                                sidey = "b";
                                disty = distx*h/w;
                            }
                        }
                        else
                            if([5,7].indexOf(i) != -1){
                                var w = rect.width(), h = rect.height();
                                rect.width(w - distx);
                                rect.height(h - distx*h/w);
                                rect.dx(distx);
                                sidex = "l";
                                if(i == 5){
                                    sidey = "b";
                                    disty = -distx*h/w;
                                }
                                if(i == 7){
                                    sidey = "t";
                                    rect.dy(distx*h/w);
                                    disty = distx*h/w;
                                }
                            }
                }
                else{
                    if([0,1,7].indexOf(i) != -1){
                        rect.dy(disty);
                        sidey = "t";
                        rect.height(rect.height() - disty);
                        if(i == 1){
                            rect.width(rect.width() + distx);
                            sidex = "r";
                        }
                    }
                    if([5,6,7].indexOf(i) != -1){
                        rect.dx(distx);
                        sidex = "l";
                        rect.width(rect.width() - distx);
                        if(i == 5){
                            rect.height(rect.height() + disty);
                            sidey = "b";
                        }
                    }
                    if([2,3,4].indexOf(i) != -1){
                        rect.size(rect.width() + distx, rect.height() + disty);
                        sidex = "r";
                        sidey = "b";
                    }
                }
                
                positionCircles(rect.x(),rect.y(),rect.width(),rect.height(),id, true);
                var item = SVG.get(id);
                if(dragg == 'simple_path'){
                    var points = pathArraySvgOro(item.array.value);
                    points = resizeSPath(points, distx, disty, sidex, sidey);
                    item.plot(split_oro_path_points(JSON.stringify(points)));
                }
                if(dragg == 'complex_path')
                    item.plot(resizeCPath(item.array.value, distx, disty, sidex, sidey));
                if(dragg == 'rasterImage')
                    resizeImage(item, distx, disty, sidex, sidey);
            });
            circles[i].on('dragend', function(event){
                var distx = this.cx() - startx;
                var disty = this.cy() - starty;
                i = Number(this.attr("id").substring(7,8));
                if(shift || dragg == 'rasterImage'){
                    if(i % 2 == 0)
                        this.fixed();
                    else
                        if([1,3].indexOf(i) != -1){
                            var w = rect.width(), h = rect.height();
                            rect.width(w + distx);
                            rect.height(h + distx*h/w);
                            sidex = "r";
                            if(i == 1){
                                sidey = "t";
                                rect.dy(-distx*h/w);
                                disty = -distx*h/w;
                            }
                            if(i == 3){
                                sidey = "b";
                                disty = distx*h/w;
                            }
                        }
                        else
                            if([5,7].indexOf(i) != -1){
                                var w = rect.width(), h = rect.height();
                                rect.width(w - distx);
                                rect.height(h - distx*h/w);
                                rect.dx(distx);
                                sidex = "l";
                                if(i == 5){
                                    sidey = "b";
                                    disty = -distx*h/w;
                                }
                                if(i == 7){
                                    sidey = "t";
                                    rect.dy(distx*h/w);
                                    disty = distx*h/w;
                                }
                            }
                }
                else{
                    if([0,1,7].indexOf(i) != -1){
                        rect.dy(disty);
                        sidey = "t";
                        rect.height(rect.height() - disty);
                        if(i == 1){
                            rect.width(rect.width() + distx);
                            sidex = "r";
                        }
                    }
                    if([5,6,7].indexOf(i) != -1){
                        rect.dx(distx);
                        sidex = "l";
                        rect.width(rect.width() - distx);
                        if(i == 5){
                            rect.height(rect.height() + disty);
                            sidey = "b";
                        }
                    }
                    if([2,3,4].indexOf(i) != -1){
                        rect.size(rect.width() + distx, rect.height() + disty);
                        sidex = "r";
                        sidey = "b";
                    }
                }
                
                positionCircles(rect.x(),rect.y(),rect.width(),rect.height(),id, true);
                var item = SVG.get(id);
                if(dragg == 'simple_path'){
                    var points = pathArraySvgOro(item.array.value);
                    points = resizeSPath(points, distx, disty, sidex, sidey);
                    item.plot(split_oro_path_points(JSON.stringify(points)));
                }
                if(dragg == 'complex_path')
                    item.plot(resizeCPath(item.array.value, distx, disty, sidex, sidey));
                if(dragg == 'rasterImage')
                    resizeImage(item, distx, disty, sidex, sidey);
                //enablePan();
                togglePanZoom();
                event.stopPropagation();
                event.preventDefault();
                saveItemLocalisation(id);
                shift = false;
            });
        }

    //}

    return selector;
}

buildSelectorSimple = function(parent,id){
    var box = SVG.get(id).bbox();
    var selector = parent.group().attr("id","box_"+id).attr("selected",id).attr("type","simple");
    var path = 'M'+box.x+','+box.y+'L'+(box.x+box.width)+','+box.y+'L'+(box.x+box.width)+','+(box.y+box.height)+'L'+box.x+','+(box.y+box.height)+'z';
    var rect1 = selector.path(path).stroke({color: "#000000", width: 2, dasharray: "2,2", opacity: "0.8"}).fill("none").attr("id","container_path_"+id);
    positionSelector(id);
    return selector;
}

// Function splits path string to coordinates array
function path_string_to_array(path_str){
    var patt1=/[mzlhvcsqta]|-?[0-9.]+/gi;
    var path_arr=path_str.match(patt1);
    patt1=/[mzlhvcsqta]/i;
    for(var i=0;i<path_arr.length;i++)
    {
        if (!path_arr[i].match(patt1))
        {
            path_arr[i]=parseFloat(path_arr[i]);
        }
    }
    return path_arr;
}

// Function joins array coordinates back to string
function path_array_to_string(path_arr){
    var path_str=path_arr.toString();
    path_str=path_str.replace(/([0-9]),([-0-9])/g, "$1 $2");
    path_str=path_str.replace(/([0-9]),([-0-9])/g, "$1 $2"); // for some reason have to do twice
    path_str=path_str.replace(/,/g, "");
    return path_str;
}

function transferPoint (xI, yI, source, destination){
    var ADDING = 0.001; // to avoid dividing by zero

    var xA = source[0].x;
    var yA = source[0].y;

    var xC = source[2].x;
    var yC = source[2].y;
    
    var xAu = destination[0].x;
    var yAu = destination[0].y;

    var xBu = destination[1].x;
    var yBu = destination[1].y;

    var xCu = destination[2].x;
    var yCu = destination[2].y;

    var xDu = destination[3].x;
    var yDu = destination[3].y;

    // Calcultations
    // if points are the same, have to add a ADDING to avoid dividing by zero
    if (xBu==xCu) xCu+=ADDING;
    if (xAu==xDu) xDu+=ADDING;
    if (xAu==xBu) xBu+=ADDING;
    if (xDu==xCu) xCu+=ADDING;
    var kBC = (yBu-yCu)/(xBu-xCu);
    var kAD = (yAu-yDu)/(xAu-xDu);
    var kAB = (yAu-yBu)/(xAu-xBu);
    var kDC = (yDu-yCu)/(xDu-xCu);

    if (kBC==kAD) kAD+=ADDING;
    var xE = (kBC*xBu - kAD*xAu + yAu - yBu) / (kBC-kAD);
    var yE = kBC*(xE - xBu) + yBu;

    if (kAB==kDC) kDC+=ADDING;
    var xF = (kAB*xBu - kDC*xCu + yCu - yBu) / (kAB-kDC);
    var yF = kAB*(xF - xBu) + yBu;

    if (xE==xF) xF+=ADDING;
    var kEF = (yE-yF) / (xE-xF);

    if (kEF==kAB) kAB+=ADDING;
    var xG = (kEF*xDu - kAB*xAu + yAu - yDu) / (kEF-kAB);
    var yG = kEF*(xG - xDu) + yDu;

    if (kEF==kBC) kBC+=ADDING;
    var xH = (kEF*xDu - kBC*xBu + yBu - yDu) / (kEF-kBC);
    var yH = kEF*(xH - xDu) + yDu;

    var rG = (yC-yI)/(yC-yA);
    var rH = (xI-xA)/(xC-xA);

    var xJ = (xG-xDu)*rG + xDu;
    var yJ = (yG-yDu)*rG + yDu;

    var xK = (xH-xDu)*rH + xDu;
    var yK = (yH-yDu)*rH + yDu;

    if (xF==xJ) xJ+=ADDING;
    if (xE==xK) xK+=ADDING;
    var kJF = (yF-yJ) / (xF-xJ); //23
    var kKE = (yE-yK) / (xE-xK); //12

    var xKE;
    if (kJF==kKE) kKE+=ADDING;
    var xIu = (kJF*xF - kKE*xE + yE - yF) / (kJF-kKE);
    var yIu = kJF * (xIu - xJ) + yJ;

    var b={x:xIu,y:yIu}; 
    b.x=Math.round(b.x);
    b.y=Math.round(b.y);
    return b;
}

function distort_path(path_str,source,destination){
    var path_arr=path_string_to_array(path_str);

    var subpath_type="";
    var is_num;
    var xy_counter;
    var xy;
    var path_arr2=new Array();
    var subpath_type_upper;
    var point;
    for(var i=0;i<path_arr.length;i++)
    {
        patt1=/[mzlhvcsqta]/i;
        curr=path_arr[i];
        if (curr.toString().match(patt1))
        {
            xy_counter=-1;
            subpath_type=curr;
            subpath_type_upper=subpath_type.toUpperCase();
            is_num=false;
            path_arr2.push(curr);
        }
        else
        {
            is_num=true;
            curr=parseFloat(curr);
        }
        if (xy_counter%2 == 0) xy="x";
        else xy="y";

        if (is_num) // && subpath_type=="q")
        {            
            if(xy=="y")
            {
                point=transferPoint(parseFloat(path_arr[i-1]),curr,source,destination);
                path_arr2.push(point.x);
                path_arr2.push(point.y);
            }
        }
        xy_counter++;
    }
    path_str=path_array_to_string(path_arr2);
    return path_str;
}

positionSelector3D = function(id){
    var s = "circle_", e = "_"+id;
    var c0 = positionPoint(SVG.get(s+0+e).cx(), SVG.get(s+0+e).cy());
    var c1 = positionPoint(SVG.get(s+1+e).cx(), SVG.get(s+1+e).cy());
    var c2 = positionPoint(SVG.get(s+2+e).cx(), SVG.get(s+2+e).cy());
    var c3 = positionPoint(SVG.get(s+3+e).cx(), SVG.get(s+3+e).cy());
    var path = 'M'+c0.x+','+c0.y+'L'+c1.x+','+c1.y+'L'+c2.x+','+c2.y+'L'+c3.x+','+c3.y+'z';
    SVG.get("container_path_"+id).plot(path);
}

buildSelector3D = function(parent, id){
    var r = 10;
    var box = SVG.get(id).bbox();
    var selector = parent.group().attr("id","box_"+id).attr("selected",id).attr("type","3D");
    var container = selector.group().attr("id","container_"+id);
    //var point = positionPoint(box.x, box.y);
    //var x = point[0]; var y = point[1];
    //var w = box.width*getScale(); var h = box.height*getScale();
    //var path = 'M'+x+','+y+'L'+(x+w)+','+y+'L'+(x+w)+','+(y+h)+'L'+x+','+(y+h)+'z';
    box = transformBox(box);
    var path = 'M'+box.x+','+box.y+'L'+(box.x+box.width)+','+box.y+'L'+(box.x+box.width)+','+(box.y+box.height)+'L'+box.x+','+(box.y+box.height)+'z';
    var rect = container.path(path).stroke({color: "#000000", width: 2, dasharray: "2,2", opacity: "0.8"}).fill("none").attr("id","container_path_"+id);
    var circles = [];
    for(i = 0 ; i < 4 ; i++)
        circles[i] = buildCircle(container,"circle_"+i+"_"+id,r,i);
    var x = box.x; var y = box.y;
    var w = box.width; var h = box.height;
    var s = "circle_", e = "_"+id;
    SVG.get(s+0+e).cx(x).cy(y);
    SVG.get(s+1+e).cx(x + w).cy(y);
    SVG.get(s+2+e).cx(x + w).cy(y + h);
    SVG.get(s+3+e).cx(x).cy(y + h);

    var source = new Array({x: x, y: y}, {x: x+w, y: y}, {x: x+w, y: y+h}, {x: x, y: y+h});
    var destination = [];
    var path_source = SVG.get(id).attr("d");
    var arr;
    var shift = false, dx, dy, j;
    for(i=0; i < 4 ; i++){       
        circles[i].draggable();
        circles[i].on('mousedown', function(e){
            if(e.shiftKey)
                shift = true;
        });
        circles[i].on('beforedrag', function(event){
            disablePan();
            event.stopPropagation();
            event.preventDefault();
        });
        circles[i].on('dragstart', function(event){
            disablePan();
            event.stopPropagation();
            event.preventDefault();
        });
        circles[i].on('dragmove', function(event){
            arr = rect.array.value;
            i = Number(this.attr("id").substring(7,8));
            if(shift){
                dx = this.cx() - arr[i][1];
                dy = this.cy() - arr[i][2];
                if(i % 2 == 0)
                    j = i+1;
                else
                    j = i-1;
                arr[j][1] = arr[j][1] - dx;
                arr[j][2] = arr[j][2] + dy;
                SVG.get('circle_'+j+'_'+id).cx(arr[j][1]).cy(arr[j][2]);
            }
            arr[i][1] = this.cx();
            arr[i][2] = this.cy();
            rect.plot(arr);
            destination = [{x: arr[0][1], y: arr[0][2]}, {x: arr[1][1], y: arr[1][2]}, {x: arr[2][1], y: arr[2][2]}, {x: arr[3][1], y: arr[3][2]}];
            var path_destination = distort_path(path_source,source,destination);
            SVG.get(id).plot(path_destination);
        });
        circles[i].on('dragend', function(event){
                //enablePan();
                togglePanZoom();
                event.stopPropagation();
                event.preventDefault();
                saveItemLocalisation(id);
        });
    }

    return selector;
}

buildCirclePoint = function(parent,r, stroke, fill){
    var circle = parent.circle(2*r).stroke({color: stroke, width: 2}).attr("pointer-events","all").fill(fill).opacity(0.6);//attr("id",attr)
    return circle;
}

updatePathArray = function(points){
    var temp = points.subpath.slice(1,points.subpath.length-1);
    if(points.path[Number(points.end)][0] == 'Z')
        var e = 1;
    else
        var e = 0;
    points.path = points.path.slice(0, Number(points.start)).concat(temp).concat(points.path.slice(Number(points.end) + 1 - e));
    points.end = Number(points.start) + temp.length - 1 + e;
    return points;
}

buildAttractors = function(p, points, hinge, id, attrs, midds){
    var index = {};
    var attr1, attr2, line1, line2;
    if(points.subpath[p][0] == 'C'){
        attr1 = buildCirclePoint(hinge, 5, "#FFFFFF", '#993300');
        attr1.cx(points.subpath[p][3]).cy(points.subpath[p][4]).attr("no", "1");
        line1 = hinge.line(points.subpath[p][3], points.subpath[p][4], points.subpath[p][5], points.subpath[p][6]).stroke({color: '#000000', width: 1}).opacity(0.6);
        var x = 5, y = 6;
        index.attr1 = {p: p, x: 3, y:4 , attr: attr1, line: line1};
    }
    else { var x = 1, y = 2; }
    if(points.subpath[p + 1][0] == 'C'){
        attr2 = buildCirclePoint(hinge, 5, "#FFFFFF", '#993300');
        attr2.cx(points.subpath[p+1][1]).cy(points.subpath[p+1][2]).attr("no", "2");
        line2 = hinge.line(points.subpath[p+1][1], points.subpath[p+1][2], points.subpath[p][x], points.subpath[p][y]).stroke({color: '#000000', width: 1}).opacity(0.6);
        index.attr2 = {p: p+1, x: 1, y:2, attr: attr2, line: line2};
    }
    var k = Object.keys(index);
    for(i in k){
        index[k[i]].attr.draggable();
        var shift = false;
        index[k[i]].attr.on('mousedown', function(e){
            if(e.shiftKey)
                shift = true;
        });
        index[k[i]].attr.on('mouseover', function(e){
            this.opacity(1);
        });
        index[k[i]].attr.on('mouseout', function(e){
            this.opacity(0.6);
        });
        index[k[i]].attr.on('beforedrag', function(event){
            disablePan();
            event.stopPropagation();
            event.preventDefault();
        });
        index[k[i]].attr.on('dragstart', function(event){
            disablePan();
            event.stopPropagation();
            event.preventDefault();
        });
        index[k[i]].attr.on('dragmove', function(event){
            var n = attrs[p]["attr"+this.attr("no")];
            points.subpath[n.p][n.x] = this.cx();
            points.subpath[n.p][n.y] = this.cy();
            points = updatePathArray(points);
            SVG.get(id).plot(points.path);
            attrs[p]["attr"+this.attr("no")].line.attr("x1", this.cx()).attr("y1", this.cy()); 
            positionMidd(midds[p-2+Number(this.attr("no"))], p-2+Number(this.attr("no")), points);  
        });
        index[k[i]].attr.on('dragend', function(event){
            //enablePan();
            togglePanZoom();
            event.stopPropagation();
            event.preventDefault();
            saveItemLocalisation(id);
            shift = false;
        });
    }

    return index;
}

buildHinge = function(p, points, hinge, midd, id, hinges, midds, attr){
    if(points.subpath[p][0] == 'M'){
        var newhinge = buildCirclePoint(hinge, 5, "#FFFFFF", '#007fff');
        if(points.subpath[p+1][0] != 'C')
            var l = hinge.line(points.subpath[p][1],points.subpath[p][2],points.subpath[p+1][1],points.subpath[p+1][2]).stroke({color: '#007fff', width: 3}).opacity(0.6).attr("id", "hingeLine");
        else
            var l = hinge.line(points.subpath[p][1],points.subpath[p][2],points.subpath[p+1][5],points.subpath[p+1][6]).stroke({color: '#007fff', width: 3}).opacity(0.6).attr("id", "hingeLine");
    }
    else
        var newhinge = buildCirclePoint(hinge, 5, "#FFFFFF", "#000000");
    
    if(points.subpath[p][0] == 'C') { var x = 5, y = 6; }
    else{ var x = 1, y = 2; }

    if(points.subpath[p][0] == 'C' || points.subpath[p+1][0] == 'C')
        attr[p] = buildAttractors(p, points, hinge, id, attr, midds);

    newhinge.cx(points.subpath[p][x]).cy(points.subpath[p][y]);
    newhinge.draggable();
    var shift = false;
    newhinge.on('mousedown', function(e){
        if(e.shiftKey)
            shift = true;
    });
    newhinge.on('mouseover', function(e){
        this.opacity(1);
    });
    newhinge.on('mouseout', function(e){
        this.opacity(0.6);
    });
    newhinge.on('dblclick', function(e){
        points.subpath.splice(p,1);
        if(p == 1)
            points.subpath[1][0] = 'M';
        points = updatePathArray(points);
        SVG.get(id).plot(points.path);
        saveItemLocalisation(id);      
        SVG.get('box_'+id).remove();
        var sel = buildSelectorPoints(SVG.get("svgEditor"), id);
        global_oro_variables.selected.add(sel);
    });
    newhinge.on('beforedrag', function(event){
        disablePan();
        event.stopPropagation();
        event.preventDefault();
    });
    newhinge.on('dragstart', function(event){
        disablePan();
        event.stopPropagation();
        event.preventDefault();
    });
    newhinge.on('dragmove', function(event){
        if(points.subpath[p][0] == 'C'){ x = 5; y = 6; }
        else{ x = 1; y = 2; }
        
        if(attr[p]){
            var dx = this.cx() - points.subpath[p][x];
            var dy = this.cy() - points.subpath[p][y];
            if(attr[p].attr1){
                var n = attr[p].attr1;
                var newx = points.subpath[n.p][n.x] + dx;
                var newy = points.subpath[n.p][n.y] + dy;
                points.subpath[n.p][n.x] = newx;
                points.subpath[n.p][n.y] = newy;
                attr[p].attr1.attr.cx(newx).cy(newy);
                attr[p].attr1.line.attr("x1", newx).attr("y1", newy).attr("x2", this.cx()).attr("y2", this.cy());
            }
            if(attr[p].attr2){
                var n = attr[p].attr2;
                var newx = points.subpath[n.p][n.x] + dx;
                var newy = points.subpath[n.p][n.y] + dy;
                points.subpath[n.p][n.x] = newx;
                points.subpath[n.p][n.y] = newy;
                attr[p].attr2.attr.cx(newx).cy(newy);
                attr[p].attr2.line.attr("x1", newx).attr("y1", newy).attr("x2", this.cx()).attr("y2", this.cy());
            }
        }
        points.subpath[p][x] = this.cx();
        points.subpath[p][y] = this.cy();
        points = updatePathArray(points);
        SVG.get(id).plot(points.path);

        if(points.subpath[p-1] != 'null'){
            if(points.subpath[p-1][0] == 'M')
                 SVG.get('hingeLine').attr("x2", this.cx()).attr("y2", this.cy());
            if(midds[p-1])
                positionMidd(midds[p-1], p-1, points);
            else
                positionMidd(midds[points.subpath.length-2], (points.subpath.length-2), points);
        }
        if(points.subpath[p+1] != 'null')
            positionMidd(midds[p], p, points);
        if(points.subpath[p][0] == 'M')
            SVG.get('hingeLine').attr("x1", this.cx()).attr("y1", this.cy());
    });
    newhinge.on('dragend', function(event){
        //enablePan();
        togglePanZoom();
        event.stopPropagation();
        event.preventDefault();
        saveItemLocalisation(id);
        shift = false;
    });

    return newhinge;
}

positionMidd = function(newmidd, p, points){
    if(points.subpath[p][0] == 'C'){ var x = 5, y = 6; }
    else{ var x = 1, y = 2; }
    if(points.subpath[p+1][0] == 'C'){
        var x2 = 5, y2 = 6;
    }
    else{ var x2 = 1, y2 = 2; }
    newmidd.cx(points.subpath[p][x] + (points.subpath[p+1][x2] - points.subpath[p][x]) /2).cy(points.subpath[p][y] + (points.subpath[p+1][y2] - points.subpath[p][y]) / 2);
}

buildMidd = function(p, points, hinge, midd, id, hinges, midds){
    var newmidd = buildCirclePoint(midd, 5, '#000000', "#FFFFFF");
    positionMidd(newmidd, p, points);
    var shift = false;
    newmidd.on('mouseover', function(e){
        this.opacity(1);
    });
    newmidd.on('mouseout', function(e){
        this.opacity(0.6);
    });
    newmidd.on('mousedown', function(e){
        if(e.shiftKey)
            shift = true;
        points.subpath.splice(p+1, 0, ['L', this.cx(), this.cy()]);
        points = updatePathArray(points);
        SVG.get(id).plot(points.path);
        saveItemLocalisation(id);
        SVG.get('box_'+id).remove();
        var sel = buildSelectorPoints(SVG.get("svgEditor"), id);
        global_oro_variables.selected.add(sel);
    });
    return newmidd;
}

buildSubPathPoints = function(points, hinge, midd, id){
    var hinges = [], midds = [], attr = [];
    if(points.subpath[points.subpath.length-1][0] == 'Z'){
        points.subpath.splice(0,0,points.subpath[points.subpath.length-2])
        points.subpath.splice(points.subpath.length-1,1,points.subpath[1])
    }
    else{
        points.subpath.splice(0,0,'null')
        points.subpath.push('null')
    }
    //points.subpath = positionPath(points.subpath);
    for(p = 1; p < points.subpath.length-1; p++){
        hinges[p] = buildHinge(p, points, hinge, midd, id, hinges, midds, attr);
        midds[p] = buildMidd(p, points, hinge, midd, id, hinges, midds);
    }
}

positionPath = function(pathArray){
    for(p in pathArray){
        if(pathArray[p][0] != 'Z'){
            var point = positionPoint(pathArray[p][1], pathArray[p][2]);
            pathArray[p][1] = point.x;
            pathArray[p][2] = point.y;
        }
    }
    return pathArray;
}
 
buildSelectorPoints = function(parent, id){
    var subpaths = getSubPaths(SVG.get(id));
    console.log(subpaths);
    var selector = parent.group().attr("id", "box_"+id).attr("selected", id).attr("type", 'pathPoints');
    var midd = selector.group().attr("id", "middPoints");
    var hinge = selector.group().attr("id", "hingePoints");
    for(var p in subpaths){
        //subpaths[p].subpath = positionPath(subpaths[p].subpath);
        buildSubPathPoints(subpaths[p], hinge, midd, id);
    }
    return selector;
}

buildSelectorLocked = function(id){
    var parent = SVG.get('svgEditor');
    var box = SVG.get(id).bbox();
    var selector = parent.group().attr("id","locked_"+id).attr("selected",id).attr("type","locked").opacity(0.7);
    var path = 'M'+box.x+','+box.y+'L'+(box.x+box.width)+','+box.y+'L'+(box.x+box.width)+','+(box.y+box.height)+'L'+box.x+','+(box.y+box.height)+'z';
    var rect = selector.path(path).stroke({color: random_pastels(), width: 2, dasharray: "2,2"}).fill("none").attr("id","container_path_"+id);
    //var rect1 = selector.rect(box.width,box.height).stroke({color: random_pastels(), width: 2, dasharray: "2,2"}).move(box.x,box.y).fill("none");
    positionSelectorL(id);
    return selector;
}
/*
showMenu = function(){
    if(global_oro_variables.selected.members){
        console.log(global_oro_variables.selected.members.length);
        var members = global_oro_variables.selected.members;
        if(members.length == 0){
            if(SVG.get("svgMenu") != undefined)
                SVG.get("svgMenu").remove();
            buildMenu(SVG.get("svgEditor"),"menu_group.unselected");
        }
        else{
            var m = "menu_group.selected.";
            var type = SVG.get(members[0].attr("selected")).attr("type");
            if(['simple_path','complex_path'].indexOf(type) != -1){
                if(members.length == 1){
                    if(SVG.get("svgMenu") != undefined){
                        if(SVG.get("svgMenu").attr("uuid").indexOf(type) == -1){
                            SVG.get("svgMenu").remove();
                            buildMenu(SVG.get("svgEditor"),m+"single_" + type);
                        }
                    }
                    else
                        buildMenu(SVG.get("svgEditor"),m+"single_" + type);
                }
                else{
                    for(i in members){
                        if(SVG.get(members[i].attr("selected")).attr("type") == type){
                            if(SVG.get("svgMenu").attr("uuid") != m+"multiple_" + type){
                                console.log(m+"multiple_" + type);
                                SVG.get("svgMenu").remove();
                                buildMenu(SVG.get("svgEditor"),m+"multiple_" + type);
                            }
                        }
                        else{
                            if(SVG.get("svgMenu") != undefined)
                                SVG.get("svgMenu").remove();
                            buildMenu(SVG.get("svgEditor"),m+"multiple_subjects");
                        }
                    }
                }
            }
            else
                if(members.length == 1){
                    if(type == 'text' || type == 'rasterImage')
                        buildMenu(SVG.get("svgEditor"), m+'image');
                }
        }
    }
}
*/
showDatGui = function(){
    if(global_oro_variables.gui != undefined)
        removeGui();
    global_oro_variables.gui = new dat.GUI({width: 150});
    if(global_oro_variables.selected === undefined || global_oro_variables.selected.members.length == 0)
        buildDatGui(global_oro_variables.gui);
    else{
        var item = SVG.get(global_oro_variables.selected.members[0].attr("selected"));
        if(global_oro_variables.selected.members.length > 1){
            var mb = global_oro_variables.selected.members;
            var type = item.attr("type");
            var no = 0;
            for(i in mb){
                if(type != SVG.get(mb[i].attr("selected")).attr("type"))
                    type = "multiple_subjects";
                no ++;
            }
        }   
        else
            var type, no;
        buildDatGui(global_oro_variables.gui, item, type, no);
    }
}

saveItemLocalisation = function(id){
    var item = SVG.get(id);
    var upd = {}, val;
    //todo: checkPathType
    if(item.type == 'path'){
        if(checkPathType(item) == 'simple'){
            val = JSON.stringify(pathArraySvgOro(item.array.value));
            upd.type = 'simple_path';
        }
        else{
            val = item.attr("d");
            upd.type = 'complex_path';
        }
        upd.closed = 'true';
    }
    else
        if(item.attr("type") == "text")
            val = item.attr('x') + ',' + item.attr('y');
        else
            if(item.attr("type") == "rasterImage")
                val = item.x() + ',' + item.y() + ',' + item.width() + ',' + item.height();
    upd["pointList"] = val;
    Meteor.call('update_collection', "Item", [id], upd);
}

updatePalette = function(item, palette){
    if(palette.strokeWidth)
        item.stroke({width: palette.strokeWidth});
    if(palette.strokeColor)
        if(palette.strokeColor == 'none')
            item.stroke({color: 'none'});
        else
            if(palette.strokeColor.substring(0,1) == "#")
                item.stroke({color: palette.strokeColor});
            else{
                var opacity = parseInt(palette.strokeColor.substring(6),16)/255;
                item.stroke({color: '#'+palette.strokeColor.substring(0,6), opacity: opacity});
            }
    if(palette.fillColor) 
        if(palette.fillColor == 'none')
            item.fill('none');
        else
            if(palette.fillColor.substring(0,1) == "#")
                item.fill(palette.fillColor);
            else{
                var opacity = parseInt(palette.fillColor.substring(6),16)/255;
                item.fill({color: '#'+palette.fillColor.substring(0,6), opacity: opacity});
        }
    if(palette.strokeDasharray)
        item.stroke({dasharray: palette.strokeDasharray});
    if(palette.strokeLinejoin)
        item.stroke({linejoin: palette.strokeLinejoin});
    if(palette.strokeLinecap)
        item.stroke({linecap: palette.strokeLinecap});
    if(palette.fillOpacity)
        item.attr('fill-opacity', palette.fillOpacity);
    if(palette.strokeOpacity)
        item.attr('stroke-opacity', palette.strokeOpacity);
    if(palette.opacity)
        item.opacity(palette.opacity);
}

updatePointList = function(item, points){
    if(item.attr("type") == "text"){
        points = points.split(",");
        item.move(points[0],points[1]);
    }
    else
        if(item.attr("type") == "rasterImage"){
            points = points.split(",");
            item.move(points[0],points[1]).size(points[2],points[3]);
        }
        else{
            if(item.attr("type") == 'simple_path')
                if(item.attr("closed") == "true")
                    points = split_oro_path_points(points);
                else
                    points = split_oro_path_points(points, true);
            item.plot(points);

        }
    if(SVG.get("box_"+item.attr("id")))
        positionSelector(item.attr("id"));
}

updateFont = function(item, font){
    if(font.style)
        item.attr('font-style', font.style);
    if(font.weight)
        item.attr('font-weight', font.weight)
    if(font.family)
        item.attr('font-family', font.family)
    if(font.size)
        item.attr('font-size', font.size)
    if(font.textAnchor)
        item.attr('text-anchor', font.textAnchor)
}

updateItem = function(id, fields){
    var item = SVG.get(id);
    if(fields.type){
        if(fields.groupId)
            if(SVG.get(fields.groupId))
                var parent = SVG.get(fields.groupId);
            else
                console.log('parent group does not exist');
        else
            var parent = item.parent;
        item.remove();
        build_group_client(parent, Item.findOne({_id: id}));
    }
    else
        if(SVG.get(id).type == 'foreignObject'){
            SVG.get(id).remove();
            build_item(SVG.get(id).parent, Item.findOne({_id:id}));
        }
        else{
            if(fields.palette)
                updatePalette(item, fields.palette);
            if(fields.font)
                updateFont(item, fields.font);
            if(fields.text){
                if(item.attr("type") == 'text'){
                //if(item.type == "text"){
                    item.text(fields.text);
                }
                else{
                    //if(item.type == "image")
                    if(item.attr("type") == 'image')
                        item.attr("href", fields.text);
                }
            }
            if(fields.pointList)
                updatePointList(item, fields.pointList);
            if(fields.groupId){
                SVG.get(fields.groupId).add(SVG.get(id));
            }
    }
}

removeItem = function(id){
    if(SVG.get("box_"+id))
        deselectItem(id);
    SVG.get(id).remove();
    if(Session.get('lockedItems').indexOf(id) != -1){
        SVG.get("locked_"+id).remove();
        var locked = Session.get('lockedItems');
        locked.splice(Session.get('lockedItems').indexOf(id), 1);
        Session.set('lockedItems',locked);
    }
}

deselectItem = function(id, notremove){
    if(SVG.get("box_"+id)){
        var index = global_oro_variables.selected.members.indexOf(SVG.get("box_"+id));
        if( index != -1){
            SVG.get(id).fixed();
            global_oro_variables.selected.members.splice(index,1);  
            SVG.get("box_"+id).remove();
            Meteor.call('update_document', 'Item', id, {selected: 'null'});
        }
    }
    if(!notremove)
        showDatGui()
    //removeGui();
}

markSelected = function(){
    var selected = global_oro_variables.selected.members;
    var ids = [];
    for(s in selected)
        ids.push(selected[s].attr("selected"));
    Meteor.call('update_collection', 'Item', ids, {selected: Meteor.userId()});
}

unlockItems = function(){
    var items = Item.find({selected: { $ne: 'null' }}).fetch();
    var ids = [];
    for(i in items)
        ids.push(items[i]._id);
    if(ids.length > 0)
        Meteor.call('update_collection', 'Item', ids, {selected: 'null'});
}

build_item = function(g,it){
    var type = it.type;
    if(type == 'text'){
        var item = g[type](it.text).attr("id", it._id);
        var points = split_oro_points(it.pointList);
        item.move(points[0],points[1]);
        if(it.font)
            updateFont(item, it.font);
    }
    else
        if(type == 'rasterImage'){
            var points = split_oro_points(it.pointList);
            var item = g["image"](it.text).attr("id", it._id).move(points[0],points[1]).size(points[2],points[3]);
        }
        else
            if(type == 'simple_path'|| type == 'para_simple_path'){
                if(it.closed)
                    if(it.closed == "false"){
                        var points = split_oro_path_points(it.pointList, true);
                        var closed = "false";
                    }
                    else{
                        var points = split_oro_path_points(it.pointList);
                        var closed = "true";
                    }
                else{
                    var points = split_oro_path_points(it.pointList);
                    var closed = "false";
                    }
                var item = g.path(points).attr("id", it._id).attr("closed", closed);
            }
            else
                if(type == 'complex_path' || type == 'para_complex_path'){
                    var item = g.path(it.pointList).attr("id",it._id);
                }
                else
                    if(type == 'embedediFrame' || type == 'embededCanvas'){
                        var points = split_oro_points(it.pointList);
                        var item = g.foreignObject(points[2],points[3]).attr("id", it._id).move(points[0], points[1]);
                        if(type == 'embedediFrame')
                            item.appendChild('iframe', {id: 'embedediFrame_'+it._id, src: it.text, frameborder: "0", xmlns:"http://www.w3.org/1999/xhtml", width: points[2], height: points[3]});
                        if(type == 'embededCanvas')
                            item.appendChild('xhtml:canvas', {id: 'embededCanvas_'+it._id, width: points[2], height: points[3]});
                    }
        item.attr("type", it.type);    
        updatePalette(item, it.palette);
        item.on('click', function(event){
            var it = Item.findOne({_id: this.attr("id")});
            var locked = false;
            if(it.selected)
                if(it.selected != 'null')
                    var locked = true;
            if(this.parent.parent.attr("type") != "menu_button" && this.parent.attr("type") != "linkedGroup" && locked == false && Session.get("enableEdit") == 'true'){
                var box = this.bbox();
                var dragg = this.attr("type");
                if (event.shiftKey) {
                    var index = global_oro_variables.selected.members.indexOf(SVG.get("box_"+this.attr("id")));
                    if( index != -1){
                        this.fixed();
                        var id = global_oro_variables.selected.members[index].attr("id");
                        SVG.get(id).remove();
                        global_oro_variables.selected.members.splice(index,1);        
                    }
                    else{
                        if(global_oro_variables.selected.members.length == 1)
                            if(global_oro_variables.selected.members[0].attr("type") != "simple"){
                                var itemid = global_oro_variables.selected.members[0].attr("selected");
                                var box = SVG.get(itemid).bbox();
                                id = global_oro_variables.selected.members[0].attr("id");
                                SVG.get(id).remove();
                                global_oro_variables.selected.members[0] = buildSelectorSimple(SVG.get("svgEditor"), box.width, box.height, box.x, box.y, itemid);
                            }
                        var results = buildSelectorSimple(SVG.get("svgEditor"), this.attr("id"));
                        global_oro_variables.selected.add(results);
                        this.draggable();
                        Session.set("selected", "true");
                    }
                }
                else{
                        deselect();
                        if(this.attr("type").indexOf('para') == -1){
                            var results = buildSelector(SVG.get("svgEditor"), this.attr("id"), dragg);
                            this.draggable();
                        }
                        else
                            var results = buildSelectorSimple(SVG.get("svgEditor"), this.attr("id"));
                        global_oro_variables.selected.add(results);
                        Session.set("selected", "true");
                }
                //showMenu();
                showDatGui();
                markSelected();
            }
        });
        item.on('dragmove', function(event){
            positionSelector(this.attr("id"));
        });
        item.on('dragend', function(event){
            positionSelector(this.attr("id"));
            saveItemLocalisation(this.attr("id"));
            togglePanZoom();
            event.stopPropagation();
            event.preventDefault();
        });
        item.on('dragstart', function(event){
            disablePan();
            event.stopPropagation();
            event.preventDefault();
        });
        item.on('beforedrag', function(event){
            disablePan();
            event.stopPropagation();
            event.preventDefault();
        });
    item.doc();
}

removeGroup = function(id){
    var items = Item.find({groupId: id}).fetch();
    for(i in items)
        Meteor.call('remove_document', 'Item', items[i]._id);
    var subgroups = Group.find({groupId: id}).fetch();
    for(g in subgroups)
        removeGroup(subgroups[g]._id);
    var deps = Dependency.find({$or: [{fileId1: id}, {fileId2: id}] }).fetch();
    for(d in deps)
        Meteor.call('remove_document', 'Dependency', deps[d]._id);
    Meteor.call('remove_document', 'Group', id);
}

removeFile = function(id){
    var groups = Group.find({fileId: id}).fetch();
    for(g in groups)
        removeGroup(groups[g]._id);
    var deps = Dependency.find({$or: [{fileId1: id}, {fileId2: id}] }).fetch();
    for(d in deps)
        Meteor.call('remove_document', 'Dependency', deps[d]._id);
    Meteor.call('remove_document', 'File', id);
}

build_group_client = function (g, group){
    var items = Item.find({groupId: group._id}, {sort: {ordering:1}}).fetch();
    if(items.length > 0)
        for(var i in items)
            build_item(g, items[i]);
}

recursive = 0;
recursive_group_client = function (parent, group, linkedgs){
    //console.log("recursive: ", recursive);
    //if(recursive > 500) return;
    //recursive = recursive + 1;
    var subgroups = Group.find({ groupId: group._id }, { sort: { ordering:1 }}).fetch();
    var subparent = parent.group().attr("id", group._id).attr("type", group.type);
    if(group.uuid)
        subparent.attr("function", group.uuid);
    if(group.transparency)
        subparent.opacity(group.transparency);
    var linkedgroups = null;
    //see if it has links for its descendants:
    var linked = Dependency.find({fileId1: group._id, type:2}).fetch();
    //see if it has simple links for himself:
    var slinked = Dependency.find({fileId1: group._id, type:5}).fetch();

    if(linked.length > 0){
        var linkedgroups = [];
        for(var l in linked){
            var gr = Group.findOne({_id: linked[l].fileId2});
            if(gr)
                linkedgroups.push(gr);
        }
        if(linkedgroups.length < 1){
            linkedgroups = null;
        }
    }

    if(linkedgs != null && linkedgs != undefined){
        var links = subparent.group().attr("id","linked_groups_"+group._id);
        for(l in linkedgs){
            //if(recursive > 500) return;
            //recursive = recursive + 1;
            recursive_group_client(links, linkedgs[l]);
        }
    }

    //build the simple links:
    if(slinked.length > 0){
        var slinkedgroups = [];
        for(var l in slinked){
            var gr = Group.findOne({_id: slinked[l].fileId2});
            if(gr)
                slinkedgroups.push(gr);
        }
        for(l in slinkedgroups){
            //if(recursive > 500) return;
            //recursive = recursive + 1;
            recursive_group_client(subparent, slinkedgroups[l]);
        }
    }

    if(group.type == "menu_button"){
        var mitem_size = global_oro_variables.menu_item_size;
        var item_size = global_oro_variables.item_group_size;
        var adapter = subparent.group().attr("id","adapter_"+group._id);
        build_group_client(adapter, group);
        var w = adapter.bbox().width;
        var h = adapter.bbox().height;
        var a = global_oro_variables.item_group_size;
        var transyh = (mitem_size-item_size)/2;
        var transxh = (item_size - w*a/h)/2 + (mitem_size-item_size)/2;
        var transyw = (item_size - h*a/w)/2;
        var transxw = (mitem_size-item_size)/2;
        if(h > w){
            adapter.scale( a/h , a/h);
        }
        else{
            adapter.scale( a/w , a/w );
        }
    }
    else
        build_group_client(subparent, group);
    
    if(group.type == "menu"){
        //id for menu_group.common: Fzs7EZBDemi6kXphg
        // id for menu_group.groups.common: P7wBvphshf745AWEN
        //id for menu_group.multiple.common: pW4eF4gT67dYk2zDo
        //id for menu_group.multiple_subjects: BzPQYeEQ4TtufSEnF
        var common_group = Group.findOne({uuid: group.uuid.substring(0,group.uuid.lastIndexOf('.'))+".common"});
        //console.log(group.uuid.substring(0,group.uuid.lastIndexOf('.'))+".common");
        if(common_group){
            var common_group_items = Group.find({ groupId: common_group._id }, { sort: { ordering:1 }}).fetch();
            var menu_button = subparent.group().attr("id","menu_main_button");
            recursive_group_client(menu_button, common_group_items[0], linkedgroups);
            var menu_content = subparent.group().attr("id","menu_content");
            for(var i = 1 ; i < common_group_items.length ; i++){
                recursive_group_client(menu_content, common_group_items[i], linkedgroups);
            }
        }
        else
            var menu_content = subparent.group().attr("id","menu_content");
        if(group.uuid.indexOf("multiple") != -1){
            var multiple_common = Group.find({ groupId: "pW4eF4gT67dYk2zDo" }, { sort: { ordering:1 }}).fetch();
            if(multiple_common)
                for(var i = 0 ; i < multiple_common.length ; i++){
                    recursive_group_client(menu_content, multiple_common[i], linkedgroups);
                }
        }
        for(var i = 0 ; i < subgroups.length ; i++){
            recursive_group_client(menu_content, subgroups[i], linkedgroups);
        }
    }
    else{
        for(g in subgroups){
            //if(recursive > 500) return;
            //recursive = recursive + 1;
            recursive_group_client(subparent, subgroups[g], linkedgroups);
        }
    }

    if(group.type == "menu_item"){
        subparent.on('click', function(event){
            this.fill({ color: '#f06' });
            if(this.attr("function").lastIndexOf('.') != -1)
                var func = this.attr("function").substring(this.attr("function").lastIndexOf('.')+1);
            else
                var func = this.attr("function");
            console.log(func);
            window[func](this, event);
        });
    }

    if(group.transform)
        subparent.transform("matrix",group.transform);

    if(group.parameters){
        var item_size = global_oro_variables.menu_item_size;
        var col = group.parameters.col;
        var row = group.parameters.row;
        if(group.type == "menu")
            var bricks = menu_content.children();
        else
            var bricks = subparent.children();
        var r = Math.floor(bricks.length/col);
        var ind = 0;
        var st = 0;
        var hg = 0;
        for(var i = 0 ; i < r ; i++){
            for(var j = 0 ; j < col; j++){
                bricks[ind].transform({x:st,y:hg});
                ind = ind+1;
                st = st + item_size;
            }
            hg = hg + item_size;
            st = 0;
        }
        for(ind = r*col ; ind < bricks.length ; ind++){
            bricks[ind].transform({x:st,y:hg});
            st = st + item_size;
        }
    }

    if(group.type == "menu"){
        var space = menu_content.first().bbox().width / 2;
        if(menu_button)
            menu_button.move(space,space);
        menu_content.move(space,space);
        if(group.parameters.hide)
            if(group.parameters.hide == "false")
                if(menu_button)
                    menu_button.hide();
        if(group.parameters.hide == undefined || group.parameters.hide == "true"){
            menu_content.hide();
            menu_button.on('click', function(event){
                menu_content.show();
                menu_button.hide();
            });
            menu_content.on('click', function(event){
                menu_button.show();
                menu_content.hide();
            });
        }
    }
    
}

recursive_group_ids = function (groupId, ids){
    if(recursive > 2000) return;
    recursive = recursive + 1;

    var items = Item.find({groupId: groupId}, { fields: {_id:1}}).fetch();
    for(i in items)
      ids.items.push(items[i]._id);

    var tempids = [];
    var subgroups = Group.find({ groupId: groupId }, { fields: {_id:1}}).fetch();
    for(i in subgroups)
      tempids.push(subgroups[i]._id);

    var linked = Dependency.find({fileId1: groupId, type: {$in: [2, 5]}}, { fields: {_id:1}}).fetch();
    for(i in linked)
      tempids.push(linked[i]._id);

    if(tempids.length > 0){
      ids.groups = ids.groups.concat(tempids);

      for(i in tempids){
          if(recursive > 2000) return;
          recursive = recursive + 1;
          ids = recursive_group_ids(tempids[i], ids);
      }
    }
    return ids;
}

file_components_ids = function(id){
    var groups = Group.find({ fileId: id }, { fields: {_id:1}}).fetch();
    var ids = {};
    ids.groups = [];
    ids.items = [];
    for(i in groups){
      ids.groups.push(groups[i]._id);
      ids = recursive_group_ids( groups[i]._id, ids);
    }
    return ids;
}

//ex temp_complexity
//gives no of points for simplified path (in transforming from complex to simple) (SVGjs Path) -> (Number)
no_of_points = function (path) {
    var box = path.bbox();
    var diag = Math.sqrt(Math.pow(box.width,2) + Math.pow(box.height,2));
    var len = path.length();
    var ct1 = 4.5;
    var ct2 = 1;
    var no_of_points = Math.floor(len/diag * ct1 * path.array.value.length);
    //console.log(path.attr("name") + " should have no_of_points: ", no_of_points);
    return no_of_points;
}

//ex path_to_simple
//gives (SVGjs Path, Number) -> (ORO PathArray)
getSimplePathArray = function (path, no_of_points) {
    var len = path.length();
    var step = len/no_of_points;
    var box = path.bbox();
    var diag = Math.sqrt(Math.pow(box.width,2)+Math.pow(box.height,2));
    var decim = 5 - diag.toFixed(0).toString().length ;
    if(decim < 0) decim = 0;
    var points = [];
    for(var i = 0 ; i < len ; i = i + step){
        var point = path.pointAt(i);
        points.push( [ Number(point.x.toFixed(decim)), Number(point.y.toFixed(decim)) ] );
    }
    return [points];
}

//ex set_complexity
//returns the complexity no for a path (SVGjs Path) -> (Number - Float)
getComplexity = function (path) {
    var no_of_points = path.array.value.length;
    var complexity = Math.log2(no_of_points);
    //console.log("COMPLEXITY: "+path.attr("name") + ": " + complexity);
    return complexity;
}

//checks if path is complex or not (SVGjs Path) -> (String) - "complex" / "simple"
checkPathType = function(path) {
    var chars = ["c", "s", "q", "t", "a"];
    var points = path.attr("d");
    for(var c in chars){
        if(points.toLowerCase().indexOf(chars[c]) != -1)
            return "complex";
    }
    return "simple";
}

//simplify complex paths with H and V, S, Q, T
simplifyCPath = function(path) {
    var svgArr = path.array.value;
    for(var a in svgArr){
        if(svgArr[a][0] == "H"){
            svgArr[a][0] = "L";
            if(svgArr[a-1][0] == 'C')
                svgArr[a][2] = svgArr[a-1][6];
            else
                svgArr[a][2] = svgArr[a-1][2];
        }
        else
            if(svgArr[a][0] == "V"){
                svgArr[a][0] = "L";
                svgArr[a][2] = svgArr[a][1];
                if(svgArr[a-1][0] == 'C')
                    svgArr[a][1] = svgArr[a-1][5];
                else
                    svgArr[a][1] = svgArr[a-1][1];
            }
            else
                if(svgArr[a][0] == "S"){
                    svgArr[a][0] = 'C';
                    svgArr[a][5] = svgArr[a][3];
                    svgArr[a][6] = svgArr[a][4];
                    svgArr[a][3] = svgArr[a][1];
                    svgArr[a][4] = svgArr[a][2];
                    svgArr[a][1] = svgArr[a-1][5] + svgArr[a-1][5] - svgArr[a-1][3];
                    svgArr[a][2] = svgArr[a-1][6] + svgArr[a-1][6] - svgArr[a-1][4];
                }
                else
                    if(svgArr[a][0] == "Q"){
                        svgArr[a][0] = 'C';
                        svgArr[a][5] = svgArr[a][3];
                        svgArr[a][6] = svgArr[a][4];
                        svgArr[a][3] = svgArr[a][1];
                        svgArr[a][4] = svgArr[a][2];
                    }
                    else
                        if(svgArr[a][0] == "T"){
                            svgArr[a][0] = 'C';
                            svgArr[a][5] = svgArr[a][1];
                            svgArr[a][6] = svgArr[a][2];
                            svgArr[a][1] = svgArr[a-1][3] + svgArr[a-1][3] - svgArr[a-1][1];
                            svgArr[a][2] = svgArr[a-1][4] + svgArr[a-1][4] - svgArr[a-1][2];
                            svgArr[a][3] = svgArr[a][1];
                            svgArr[a][4] = svgArr[a][2];
                        }
    }
    path.plot(svgArr);
    return path;
}

//ex to_simple_path
//simplifies complex paths (SVGjs complex Path) -> ORO path coord (String); if simple Path -> it returns unchanged
simplifyPath = function (path) {
    path = simplifyCPath(path);
    if(checkPathType(path) == "simple"){
        return JSON.stringify(pathArraySvgOro(path.array.value));
    }
    else{
        var no_points = no_of_points(path);
        var points_array = getSimplePathArray(path, no_points);
        points_array = pathArrayOroXY(points_array);
        var new_path = ClipperLib.Clipper.SimplifyPolygon(points_array[0], ClipperLib.PolyFillType.pftNonZero);
        return JSON.stringify(pathArrayXYOro(new_path));
    }
}

isAbsolute = function(pathstring){
    if(pathstring == pathstring.toUpperCase())
        return true;
    else
        return false;
}

absolutizePath = function(path){
    if(isAbsolute(path.attr("d")))
        return path.attr("d");
    var points = path.array.value;
    points[0][0] = 'M';
    var tempx = points[0][1], tempy = points[0][2];
    for(p = 1; p < points.length; p++){
        points[p][0] = points[p][0].toUpperCase();
        if(['M','L'].indexOf(points[p][0]) != -1){
            points[p][1] = tempx + points[p][1];
            points[p][2] = tempy + points[p][2];
            tempx = points[p][1];
            tempy = points[p][2];
        }
        else
            if(points[p][0] == 'C'){
                points[p][1] = tempx + points[p][1];
                points[p][2] = tempy + points[p][2];
                points[p][3] = tempx + points[p][3];
                points[p][4] = tempy + points[p][4];
                points[p][5] = tempx + points[p][5];
                points[p][6] = tempy + points[p][6];
                tempx = points[p][5];
                tempy = points[p][6];
            }
    }
    console.log(points);
    //path.plot(points);
}

//returns array of objects: {path, subpath, start, end}
getSubPaths = function(path){
    var arr = path.array.value;
    var newarr = [];
    for(i in arr){
        if(arr[i][0] == 'M'){
            newarr.push({path: arr, start: i});
            newarr[newarr.length-1].subpath = [ arr[i] ];
        }
        else{
            var len = newarr[newarr.length-1].subpath.length;
            newarr[newarr.length-1].subpath.push(arr[i]);
            newarr[newarr.length-1].end = i;
        }
    }
    return newarr;
}

joinPaths = function(pathsArr){
    var newarr = [], simple = true;
    for(var p in pathsArr){
        if(checkPathType(pathsArr[p]) == 'complex')
            simple = false;
        newarr = newarr.concat(pathsArr[p].array.value);
    }
    //if(simple)
    //    return JSON.stringify(pathArraySvgOro(newarr))
    //else{
    //    var newpath = SVG.get('svgEditor').path(newarr);
    //    newarr = newpath.attr('d');
    //    newpath.remove();
    //    return newarr;
    //}
    return newarr;
}

reversePath = function(path){
    var arr = path.array.value;
    if(arr[arr.length-1][0] == 'Z')
        var e = 1;
    else
        var e = 0;
    var temp = [], newarr = [];
    var simple = true;
    for(i = arr.length-1-e ; i >= 0; i--){
        if(arr[i][0] == 'C')
            temp.push(arr[i]);
        else{
            if(temp.length > 0){
                simple = false;
                newarr.push([ 'L', temp[0][5], temp[0][6] ]);
                for(t=1; t < temp.length; t++){
                    newarr.push([ 'C', temp[t-1][3], temp[t-1][4], temp[t-1][1], temp[t-1][2], temp[t][5], temp[t][6] ]);
                }
                newarr.push([ 'C', arr[i+1][3], arr[i+1][4], arr[i+1][1], arr[i+1][2], arr[i][1], arr[i][2] ]);
                temp = [];
            }
            else
                newarr.push([ 'L', arr[i][1], arr[i][2] ]);
        }  
    }
    if(arr[arr.length-1][0] == 'Z')
        newarr.push(['Z']);
    newarr[0][0] = 'M';
    /*
    if(simple)
        newarr = JSON.stringify(pathArraySvgOro(newarr));
    else{
        var newpath = SVG.get('svgEditor').path(newarr);
        var newarr = newpath.attr("d");
        newpath.remove();
    }*/
    return newarr;
}

circleToCPath = function circleToCPath(circle){
    var ell = ellipseToCPath(circle);
    ell.parameters.callback = circleToCPath;
    return ell;
}

ellipseToCPath = function ellipseToCPath(ellipse){
    var x = ellipse.x(), y= ellipse.y();
    if(ellipse.attr("rx"))
        var rx = Number(ellipse.attr("rx")), ry = Number(ellipse.attr("ry"));
    else
        var rx = ellipse.attr("r"), ry = ellipse.attr("r");
    var w = rx*2, h = ry*2;
    var cx = ellipse.attr("cx"), cy = ellipse.attr("cy");
    var delta = Math.sqrt(Math.sqrt(Math.sqrt(2)));
    var points = 
        'M' + (x+w/2) + ' ' + y
            + 'C' + (x+w/2+rx/2*delta) + ' ' + y + ',' + (x+w) + ' ' + (y+h/2 -ry/2*delta) + ','
            + (x+w) + ' ' + (y+h/2)
            + 'C' + (x+w) + ' ' + (y+h/2+ry/2*delta) + ',' + (x+w/2+rx/2*delta) + ' ' + (y+h) + ','
            + (x+w/2) + ' ' + (y+h)
            + 'C' + (x+w/2-rx/2*delta) + ' ' + (y+h) + ',' + x + ' ' + (y+h/2+ry/2*delta) + ','
            + x + ' ' + (y+h/2)
            + 'C' + x + ' ' + (y+h/2-ry/2*delta) + ',' + (x+w/2-rx/2*delta) + ' ' + y + ','
            + (x+w/2) + ' ' + y + 'Z';
    
    return {pointList: points, type: "complex_path", parameters: {cx: cx, cy: cy, rx: rx, ry: ry, callback: ellipseToCPath}};
}

rectToPath = function rectToPath(rect){
    var x = rect.x(), y= rect.y(), w = rect.width(), h = rect.height();
    var params = {width: w, height: h, x: x, y: y, callback: rectToPath};
    if(rect.attr("rx")){
        var rx = Number(rect.attr("rx"));
        var ry = Number(rect.attr("ry"));
        var delta = Math.sqrt(Math.sqrt(Math.sqrt(2)));
        var points =
            'M'+ x + ' ' + (y+ry)
                + 'C' + x + ' ' + (y+ry-ry/2*delta) + ',' + (x+rx-rx/2*delta) + ' ' + y + ','
                + (x+rx) + ' ' + y + 'L'
                + (x+w-rx) + ' ' + y
                + 'C' + (x+w-rx+rx/2*delta) + ' ' + y + ',' + (x+w) + ' ' + (y+ry-ry/2*delta) + ','
                + (x+w) + ' ' + (y+ry) + 'L'
                + (x+w) + ' ' + (y+h-ry)
                + 'C' + (x+w) + ' ' + (y+h-ry+ry/2*delta) + ',' + (x+w-rx+rx/2*delta) + ' ' + (y+h) + ','
                + (x+w-rx) + ' ' + (y+h) + 'L'
                + (x+rx) + ' ' + (y+h)
                + 'C' + (x+rx-rx/2*delta) + ' ' + (y+h) + ',' + x + ' ' + (y+h-ry+ry/2*delta) + ','
                + x + ' ' + (y+h-ry) + 'Z';
        params.rx = rx;
        params.ry = ry;
        var type = "complex_path";
    }
    else{
        var points = [ [ [x,y], [x+w,y], [x+w,y+h], [x,y+h] ] ];
        points =  JSON.stringify(points);
        var type = "simple_path";
    }
    return {pointList: points, type: type, parameters: params};
}

lineToPath = function lineToPath(line){
    var points = [ [ [line.attr("x1"), line.attr("y1")], [line.attr("x2"), line.attr("y2")] ] ];
    return JSON.stringify(points);
}

polylineToPath = function polylineToPath(line){
    var points = JSON.stringify([line.array.value]);
    return points;
}

cloneItem = function cloneItem(it, groupId){
    if(typeof it === 'string')
        it = Item.findOne({_id: it});
    delete it._id;
    it.groupId = groupId;
    it.selected = 'null';
    console.log(it);
    Meteor.call('insert_document', 'Item', it, function(err, res){
        console.log(err); console.log('Item: '+res);
    });
}

cloneGroup = function cloneGroup(gr, parentId, parent){
    if(typeof gr === 'string')
        gr = Group.findOne({_id: gr});
    var deps = Dependency.find({fileId1: gr._id, type: {$in:[2,3,5]} }).fetch();
    var groups = Group.find({groupId: gr._id}).fetch();
    var items = Item.find({groupId: gr._id}).fetch();
    delete gr._id;
    gr[parent] = parentId;
    gr.uuid = gr.uuid+"_copy";
    Meteor.call('insert_document', 'Group', gr, function(err, res){
        if(err) console.log(err);
        if(res){
            for(d in deps){
                deps[d].fileId1 = res;
                delete deps[d]._id;
                Meteor.call('insert_document', 'Dependency', deps[d]);
            }
            for(g in groups)
                cloneGroup(groups[g], res, 'groupId');
            for(i in items)
                cloneItem(items[i], res);
        }
    });
}

cloneFile = function cloneFile(id, callb){
    var f = File.findOne({_id: id});
    var deps = Dependency.find({fileId1: id}).fetch();
    var groups = Group.find({fileId: id}).fetch();
    delete f._id;
    f.creatorId = Meteor.userId();
    f.dateModified = new Date();
    f.permissions.view = [];
    f.permissions.edit = [Meteor.userId()];
    f.uuid = f.uuid+"_copy";
    Meteor.call('insert_document', 'File', f, function(err, res){
        if(err) console.log(err);
        if(res){
            for(d in deps){
                deps[d].fileId1 = res;
                delete deps[d]._id
                Meteor.call('insert_document', 'Dependency', deps[d]);
            }
            for(g in groups)
                cloneGroup(groups[g], res, 'fileId');
            //return res;
            if(callb)
                callb(res);
            //window.open('/filem/'+res, '_blank');
        }
    });
}

getDependencyPath = function getDependencyPath(id, path){
    if(typeof path === 'undefined')
        path = [];
    //path.push(id);
    var d = Dependency.findOne({fileId1: id, type: 1});
    if(d){
        path.push(d);
        path = getDependencyPath(d.fileId2, path);
    }
    return path;
}

getFilePath = function getFilePath(id){
    var deps = getDependencyPath(id);
    var ids = [id];
    for(d in deps){
        ids.push(deps[d].fileId2);
    }
    return ids;
}

getElementPath = function getElementPath(id, path){
    if(typeof path === 'undefined')
        path = [];
    path.push(id)
    var elem = Item.findOne({_id: id});
    if(!elem)
        var elem = Group.findOne({_id: id});
    if(elem)
        if(elem.groupId)
            getElementPath(elem.groupId, path);
        else
            if(elem.fileId)
                getElementPath(elem.fileId, path);
    return path;
}

deepClone = function(orig,i,clone){
    if(typeof clone === 'undefined'){
        var clone = orig.clone();
        clone.attr("id", orig.attr("id").substring(0,orig.attr("id").lastIndexOf('_')+1)+i);
    }
    orig.each(function(j, children){
        var elem = this.clone();
        elem.attr("id", this.attr("id").substring(0,this.attr("id").lastIndexOf('_')+1)+i);
        var parentid = this.parent.attr('id').substring(0,this.parent.attr("id").lastIndexOf('_')+1)+i;
        SVG.get(parentid).add(elem);
    }, true);
    return clone;
}

groupBbox = function(group){
    var box = group.first().bbox();
    var x = box.x, y = box.y, x2 = box.x2, y2 = box.y2, cx = box.cx, cy = box.cy, width, height;
    var yy = box.y, xx = box.x1, yy2 = box.y2, xx2 = box.x2;
    group.each(function(i, kids){
        box = this.bbox();
        if(box.x < x){
            x = box.x;
            y = box.y;
        }
        if(box.x2 > x2){
            x2 = box.x2;
            y2 = box.y2;
        }
        if(box.y < yy){
            xx = box.x;
            yy = box.y;
        }
        if(box.y2 > yy2){
            xx2 = box.x2;
            yy2 = box.y2;
        }
    });

    var result = {x: x, y: yy, x2: x2, y2: yy2, cx: x+(x2-x)/2, cy: yy+(yy2-yy)/2, width: x2-x, height: yy2-yy}
    return result;
}

paraSquare = function(obj){
    var points = [[[obj.x,obj.y],[obj.x+obj.width,obj.y],[obj.x+obj.width,obj.y+obj.width],[obj.x,obj.y+obj.width]]];
    console.log(points);
    return JSON.stringify(points);
}

paraRect = function(obj){
    var delta = Math.sqrt(Math.sqrt(Math.sqrt(2)));
    var x = Number(obj.x), y = Number(obj.y), w = Number(obj.width), h = Number(obj.height), rx = Number(obj.rx), ry = Number(obj.ry);
    var points =
        'M'+ x + ' ' + (y+ry)
            + 'C' + x + ' ' + (y+ry-ry/2*delta) + ',' + (x+rx-rx/2*delta) + ' ' + y + ','
            + (x+rx) + ' ' + y + 'L'
            + (x+w-rx) + ' ' + y
            + 'C' + (x+w-rx+rx/2*delta) + ' ' + y + ',' + (x+w) + ' ' + (y+ry-ry/2*delta) + ','
            + (x+w) + ' ' + (y+ry) + 'L'
            + (x+w) + ' ' + (y+h-ry)
            + 'C' + (x+w) + ' ' + (y+h-ry+ry/2*delta) + ',' + (x+w-rx+rx/2*delta) + ' ' + (y+h) + ','
            + (x+w-rx) + ' ' + (y+h) + 'L'
            + (x+rx) + ' ' + (y+h)
            + 'C' + (x+rx-rx/2*delta) + ' ' + (y+h) + ',' + x + ' ' + (y+h-ry+ry/2*delta) + ','
            + x + ' ' + (y+h-ry) + 'Z';
    return points;
}

paraEllipse = function(obj, val){
    console.log(obj);
    var delta = Math.sqrt(Math.sqrt(Math.sqrt(2)));
    var x = Number(obj.x), y = Number(obj.y), rx,ry;
    rx = Number(obj.rx);
    ry = Number(obj.ry);
    if(typeof val != 'undefined' && obj.maintainRatio)
        if(Number(val))
            if(rx == val)
                ry = rx;
            else
                rx = ry;
        else
            if(val == "rx")
                ry = rx;
            else
                rx = ry;
    var w = rx*2, h = ry*2;
    var points = 
        'M' + (x+w/2) + ' ' + y
            + 'C' + (x+w/2+rx/2*delta) + ' ' + y + ',' + (x+w) + ' ' + (y+h/2 -ry/2*delta) + ','
            + (x+w) + ' ' + (y+h/2)
            + 'C' + (x+w) + ' ' + (y+h/2+ry/2*delta) + ',' + (x+w/2+rx/2*delta) + ' ' + (y+h) + ','
            + (x+w/2) + ' ' + (y+h)
            + 'C' + (x+w/2-rx/2*delta) + ' ' + (y+h) + ',' + x + ' ' + (y+h/2+ry/2*delta) + ','
            + x + ' ' + (y+h/2)
            + 'C' + x + ' ' + (y+h/2-ry/2*delta) + ',' + (x+w/2-rx/2*delta) + ' ' + y + ','
            + (x+w/2) + ' ' + y + 'Z';
    return points;
}

paraCircle = function(obj){
    return paraEllipse(obj);
}