baselinePoints = [];
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

transformGroup = function(item, distx, disty, sidex, sidey){
    console.log(distx);console.log(disty);console.log(sidex);console.log(sidey);
    var pp = item.transform();
    var box = item.bbox();
    var vals = [];
    if(sidex == 'l'){
        vals[4] = pp.e + distx;
        vals[0] = pp.a - distx / box.width;
    }
    else{
        vals[4] = pp.e;
        vals[0] = pp.a + distx / box.width;
    }
    if(sidey == 't'){
        vals[5] = pp.f + disty;
        vals[3] = pp.d - disty / box.height;
    }
    else{
        vals[5] = pp.f;
        vals[3] = pp.d + disty / box.height;
    }
    vals[1] = pp.b; vals[2] = pp.c;
    console.log(vals);
    return vals.join(',');
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
    var circle = parent.circle(2*r).stroke({color: "#FFFFFF", width: 3}).attr("pointer-events","all").attr("id",attr).fill('#000000').opacity(0.4);
    return circle;
}

positionCircles = function(x,y,w,h,id,rotate){
    var s = "circle_", e = "_"+id;
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

positionCirclesP = function(points, id){
    var s = "circle_", e = "_"+id;
    SVG.get(s+0+e).cx(points[0][0]).cy(points[0][1]);
    SVG.get(s+1+e).cx(points[1][0]).cy(points[1][1]);
    SVG.get(s+2+e).cx(points[2][0]).cy(points[2][1]);
    SVG.get(s+3+e).cx(points[3][0]).cy(points[3][1]);
    SVG.get(s+4+e).cx(points[4][0]).cy(points[4][1]);
    SVG.get(s+5+e).cx(points[5][0]).cy(points[5][1]);
    SVG.get(s+6+e).cx(points[6][0]).cy(points[6][1]);
    SVG.get(s+7+e).cx(points[7][0]).cy(points[7][1]);
    if(points[8])
        SVG.get("rotate_"+id).cx(points[8][0]).cy(points[8][1]);
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

rotateMatrix = function (a, rad) {
    if(a instanceof Array)
        var a0 = a[0], a1 = a[1], a2 = a[2], a3 = a[3], a4 = a[4], a5 = a[5];
    else
        var a0 = a.a, a1 = a.b, a2 = a.c, a3 = a.d, a4 = a.e, a5 = a.f;
    var s = Math.sin(rad),
        c = Math.cos(rad), out = [];
    out[0] = a0 *  c + a2 * s;
    out[1] = a1 *  c + a3 * s;
    out[2] = a0 * -s + a2 * c;
    out[3] = a1 * -s + a3 * c;
    out[4] = a4;
    out[5] = a5;
    return out;
}
/*
positionPoint = function(x,y){
    var truematrix = SVG.get("viewport").node.getAttribute("transform");
    if(truematrix){
        truematrix = truematrix.substring(7,truematrix.length-1);
        var matrix = truematrix.split(" ");
        return {x: x*Number(matrix[0]) + Number(matrix[4]), y: y* Number(matrix[3]) + Number(matrix[5])};
    }
    else return {x:x,y:y};
}
*/
/*
positionPointInverse = function(x,y){
    var m = SVG.get("viewport").node.getCTM().inverse();
    if(m)
        return {x: x*Number(m.a) + Number(m.e), y: y* Number(m.d) + Number(m.f)};
    else return {x:x,y:y};
}
*/
transformPath = function(pathArray, id){
    var m = SVG.get(id).node.getCTM();
    for(p in pathArray){
        if(pathArray[p][0] != 'Z'){
            var point = transformPoint(pathArray[p][1], pathArray[p][2], [m]);
            pathArray[p][1] = point[0];
            pathArray[p][2] = point[1];
            if(pathArray[p][0] == 'C'){
                var point2 = transformPoint(pathArray[p][3], pathArray[p][4], [m]);
                pathArray[p][3] = point2[0];
                pathArray[p][4] = point2[1];
                var point3 = transformPoint(pathArray[p][5], pathArray[p][6], [m]);
                pathArray[p][5] = point3[0];
                pathArray[p][6] = point3[1];
            }
        }
    }
    return pathArray;
}
/*

positionPath = function(pathArray){
    for(p in pathArray){
        if(pathArray[p][0] != 'Z'){
            var point = positionPoint(pathArray[p][1], pathArray[p][2]);
            pathArray[p][1] = point.x;
            pathArray[p][2] = point.y;
            if(pathArray[p][0] == 'C'){
                var point2 = positionPoint(pathArray[p][3], pathArray[p][4]);
                pathArray[p][3] = point2.x;
                pathArray[p][4] = point2.y;
                var point3 = positionPoint(pathArray[p][5], pathArray[p][6]);
                pathArray[p][5] = point3.x;
                pathArray[p][6] = point3.y;
            }
        }
    }
    return pathArray;
}*/
/*
positionPathInverse = function(pathArray){
    for(p in pathArray){
        if(pathArray[p][0] != 'Z'){
            var point = positionPointInverse(pathArray[p][1], pathArray[p][2]);
            pathArray[p][1] = point.x;
            pathArray[p][2] = point.y;
            if(pathArray[p][0] == 'C'){
                var point2 = positionPointInverse(pathArray[p][3], pathArray[p][4]);
                pathArray[p][3] = point2.x;
                pathArray[p][4] = point2.y;
                var point3 = positionPointInverse(pathArray[p][5], pathArray[p][6]);
                pathArray[p][5] = point3.x;
                pathArray[p][6] = point3.y;
            }
        }
    }
    return pathArray;
}
 
*/
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

transformMat2d = function(a, m) {
    if(!(m instanceof Array))
        m = [m.a, m.b, m.c, m.d, m.e, m.f];
    var x = a[0],
        y = a[1],
        out = [];
    out[0] = m[0] * x + m[2] * y + m[4];
    out[1] = m[1] * x + m[3] * y + m[5];
    return out;
};

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

getViewportMatrix = function(){
    var truematrix = SVG.get("viewport").node.getAttribute("transform");
    if(truematrix){
        truematrix = truematrix.substring(7,truematrix.length-1);
        if(truematrix.indexOf(',') != -1)
            var matrix = truematrix.split(",");
        else
            var matrix = truematrix.split(" ");
        matrix = [Number(matrix[0]), Number(matrix[1]), Number(matrix[2]), Number(matrix[3]), Number(matrix[4]), Number(matrix[5])];
    }
    else
        var matrix = [1,0,0,1,0,0];
    return matrix;
}

transformPoint = function(x,y, matrices){
    var point = [x,y];
    for(m in matrices)
        point = transformMat2d(point, matrices[m]);
    return point;
}

createSelectorPath = function(id, type){
    var box = SVG.get(id).bbox();
    var p = [];
    var matrix = SVG.get(id).node.getCTM();
    var view  = getViewportMatrix();
    p[0] = transformPoint(box.x, box.y, [matrix,view]);
    p[1] = transformPoint(box.x+box.width, box.y, [matrix,view]);
    p[2] = transformPoint(box.x+box.width, box.y+box.height, [matrix,view]);
    p[3] = transformPoint(box.x, box.y+box.height, [matrix,view]);
    if(type == "string")
        return 'M'+p[0][0]+','+p[0][1]+'L'+p[1][0]+','+p[1][1]+'L'+p[2][0]+','+p[2][1]+'L'+p[3][0]+','+p[3][1]+'Z';
    else
        return p;
}

positionSelectorL = function(id){
    var path = createSelectorPath(id, "string");
    SVG.get("container_path_"+id).plot(path);
}

positionSelector = function(id){
    if(['3D','pathPoints'].indexOf(SVG.get("box_"+id).attr("type")) == -1){
        var p = createSelectorPath(id, "points");
        if(SVG.get("container_path_"+id)){
            SVG.get("container_path_"+id).plot('M'+p[0][0]+','+p[0][1]+'L'+p[1][0]+','+p[1][1]+'L'+p[2][0]+','+p[2][1]+'L'+p[3][0]+','+p[3][1]+'Z');
            var newbox = SVG.get("container_path_"+id).bbox();
        }
        if(SVG.get("box_"+id).attr("type") == 'draggable'){
            var box = SVG.get(id).bbox();
            var matrix = SVG.get(id).node.getCTM();
            var view  = getViewportMatrix();
            var rotate = transformPoint(box.x+box.width/2, box.y-30, [matrix,view]);
            var points = [
                [ p[0][0] + (p[1][0] - p[0][0]) / 2, p[0][1] + (p[1][1] - p[0][1]) / 2 ],
                [ p[1][0], p[1][1]],
                [ p[1][0] + (p[2][0] - p[1][0]) / 2, p[1][1] + (p[2][1] - p[1][1]) / 2],
                [ p[2][0], p[2][1] ],
                [ p[3][0] + (p[2][0] - p[3][0]) / 2, p[3][1] + (p[2][1] - p[3][1]) / 2],
                [ p[3][0], p[3][1] ],
                [ p[0][0] + (p[3][0] - p[0][0]) / 2, p[0][1] + (p[3][1] - p[0][1]) / 2 ],
                [ p[0][0], p[0][1] ],
                [ rotate[0], rotate[1] ]
                ]
            positionCirclesP(points, id)
        }
        if(SVG.get("editPoints")) 
            positionButtons(newbox, id);

    }
    if(SVG.get("box_"+id).attr("type") == 'pathPoints')
        positionSelectorPoints();
    if(SVG.get("box_"+id).attr("type") == '3D')
        positionSelector3D(id);
}

positionButtons = function(box, id){
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
        var sel = buildSelectorPoints(id);
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
    var path = 'M'+box.x+','+box.y+'L'+(box.x+box.width)+','+box.y+'L'+(box.x+box.width)+','+(box.y+box.height)+'L'+box.x+','+(box.y+box.height)+'Z';
    var rect = container.path(path).stroke({color: "#000000", width: 2, dasharray: "2,2", opacity: "0.8"}).fill("none").attr("id","container_path_"+id);
    var circles = [];
    for(i = 0 ; i < 8 ; i++)
        circles[i] = buildCircle(container,"circle_"+i+"_"+id,r,i);
    circles[8] = buildCircle(selector, "rotate_"+id,r);
    circles[8].cx(box.x + box.width/2).cy(box.y - 30); 
    circles[8].attr("style","cursor:url(/icons/rotate.png) 12 12, auto;");
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
        else{
            var invmatrix = SVG.get(id).node.getCTM().inverse();
            var invview = SVG.get('viewport').node.getCTM().inverse();
            var pp = transformPoint(this.cx(), this.cy(), [invview, invmatrix]);
            var angle = getAngle({x: cx, y: cy}, {x: pp[0], y: pp[1]});
        }
        var temp = startangle;
        startangle = angle;
        angle = angle - temp;
        if(dragg == 'simple_path')
            rotateSPath(SVG.get(id), cx, cy, angle);
        if(dragg == 'complex_path')
            rotateCPath(SVG.get(id), cx, cy, angle);
        pp = transformPoint(cx, cy, [SVG.get(id).node.getCTM(), SVG.get('viewport').node.getCTM()]);
        rotate_selector(id, pp[0], pp[1], angle);
    });
    circles[8].on('dragend', function(event){
        if(shift)
            var angle = 45 * Math.PI / 180;
        else{
            var invmatrix = SVG.get(id).node.getCTM().inverse();
            var invview = SVG.get('viewport').node.getCTM().inverse();
            var pp = transformPoint(this.cx(), this.cy(), [invview, invmatrix]);
            var angle = getAngle({x: cx, y: cy}, {x: pp[0], y: pp[1]});
        }
        angle = angle - startangle;
        if(dragg == 'simple_path')
            rotateSPath(SVG.get(id), cx, cy, angle);
        if(dragg == 'complex_path')
            rotateCPath(SVG.get(id), cx, cy, angle);
        pp = transformPoint(cx, cy, [SVG.get(id).node.getCTM(), SVG.get('viewport').node.getCTM()]);
        rotate_selector(id, pp[0], pp[1], angle);
        saveItemLocalisation(id);
        shift = false;
        startangle = 0;
        togglePanZoom();
        event.stopPropagation();
        event.preventDefault();
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
                var invmatrix = SVG.get(id).node.getCTM().inverse();
                var invview = SVG.get('viewport').node.getCTM().inverse();
                var pp = transformPoint(this.cx(), this.cy(), [invview, invmatrix])
                startx = pp[0];
                starty = pp[1];
            });
            circles[i].on('dragmove', function(event){
                var invmatrix = SVG.get(id).node.getCTM().inverse();
                var invview = SVG.get('viewport').node.getCTM().inverse();
                var pp = transformPoint(this.cx(), this.cy(), [invview, invmatrix])
                var distx = pp[0] - startx;
                var disty = pp[1] - starty;
                startx = pp[0];
                starty = pp[1];
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
                
                positionSelector(id);
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
                if(dragg == 'simpleGroup')
                    item.transform("matrix", transformGroup(item, distx, disty, sidex, sidey));
            });
            circles[i].on('dragend', function(event){
                var invmatrix = SVG.get(id).node.getCTM().inverse();
                var invview = SVG.get('viewport').node.getCTM().inverse();
                var pp = transformPoint(this.cx(), this.cy(), [invview, invmatrix])
                var distx = pp[0] - startx;
                var disty = pp[1] - starty;
                startx = 0;
                starty = 0;
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
                //positionSelector(id);
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
                if(dragg == 'simpleGroup'){
                    var matrix = transformGroup(item, distx, disty, sidex, sidey);
                    Meteor.call("update_document", "Group", item.attr("id"), {transform: matrix});
                }
                saveItemLocalisation(id);
                shift = false;
                togglePanZoom();
                event.stopPropagation();
                event.preventDefault();
            });
        }

    //}

    return selector;
}

buildSelectorSimple = function(parent,id){
    var box = SVG.get(id).bbox();
    var selector = parent.group().attr("id","box_"+id).attr("selected",id).attr("type","simple");
    var path = 'M'+box.x+','+box.y+'L'+(box.x+box.width)+','+box.y+'L'+(box.x+box.width)+','+(box.y+box.height)+'L'+box.x+','+(box.y+box.height)+'Z';
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
    var view  = getViewportMatrix();
    var s = "circle_", e = "_"+id;
    var p = baselinePoints;
    var pp = [
        transformPoint(baselinePoints[0][0], baselinePoints[0][1], [view]),
        transformPoint(baselinePoints[1][0], baselinePoints[1][1], [view]),
        transformPoint(baselinePoints[2][0], baselinePoints[2][1], [view]),
        transformPoint(baselinePoints[3][0], baselinePoints[3][1], [view])
        ]
    SVG.get(s+0+e).cx(pp[0][0]).cy(pp[0][1]);
    SVG.get(s+1+e).cx(pp[1][0]).cy(pp[1][1]);
    SVG.get(s+2+e).cx(pp[2][0]).cy(pp[2][1]);
    SVG.get(s+3+e).cx(pp[3][0]).cy(pp[3][1]);

    var path = 'M'+pp[0][0]+','+pp[0][1]+'L'+pp[1][0]+','+pp[1][1]+'L'+pp[2][0]+','+pp[2][1]+'L'+pp[3][0]+','+pp[3][1]+'Z';

    SVG.get("container_path_"+id).plot(path);
}

buildSelector3D = function(parent, id){
    var r = 10;
    var box = SVG.get(id).bbox();
    var selector = parent.group().attr("id","box_"+id).attr("selected",id).attr("type","3D");
    var container = selector.group().attr("id","container_"+id);
    var path = createSelectorPath(id, "string");
    var rect = container.path(path).stroke({color: "#000000", width: 2, dasharray: "2,2", opacity: "0.8"}).fill("none").attr("id","container_path_"+id);
    var circles = [];
    for(i = 0 ; i < 4 ; i++)
        circles[i] = buildCircle(container,"circle_"+i+"_"+id,r,i);
    var matrix = SVG.get(id).node.getCTM();
    var view  = getViewportMatrix();
    baselinePoints = [
        transformPoint(box.x, box.y, [matrix]),
        transformPoint(box.x + box.width, box.y, [matrix]),
        transformPoint(box.x + box.width, box.y + box.height, [matrix]),
        transformPoint(box.x, box.y + box.height, [matrix])
        ];
    var pp = [
        transformPoint(box.x, box.y, [matrix, view]),
        transformPoint(box.x + box.width, box.y, [matrix, view]),
        transformPoint(box.x + box.width, box.y + box.height, [matrix, view]),
        transformPoint(box.x, box.y + box.height, [matrix, view])
        ];
    var x = box.x; var y = box.y;
    var w = box.width; var h = box.height;
    var s = "circle_", e = "_"+id;

    SVG.get(s+0+e).cx(pp[0][0]).cy(pp[0][1]);
    SVG.get(s+1+e).cx(pp[1][0]).cy(pp[1][1]);
    SVG.get(s+2+e).cx(pp[2][0]).cy(pp[2][1]);
    SVG.get(s+3+e).cx(pp[3][0]).cy(pp[3][1]);
    var path = 'M'+pp[0][0]+','+pp[0][1]+'L'+pp[1][0]+','+pp[1][1]+'L'+pp[2][0]+','+pp[2][1]+'L'+pp[3][0]+','+pp[3][1]+'Z';

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
            var invmatrix = SVG.get(id).node.getCTM().inverse();
            var invview = SVG.get('viewport').node.getCTM().inverse();
            var pp = [
                transformPoint(arr[0][1], arr[0][2], [invview, invmatrix]),
                transformPoint(arr[1][1], arr[1][2], [invview, invmatrix]),
                transformPoint(arr[2][1], arr[2][2], [invview, invmatrix]),
                transformPoint(arr[3][1], arr[3][2], [invview, invmatrix])
                ];
            baselinePoints = [
                transformPoint(pp[0][0], pp[0][1], [SVG.get(id).node.getCTM()]),
                transformPoint(pp[1][0], pp[1][1], [SVG.get(id).node.getCTM()]),
                transformPoint(pp[2][0], pp[2][1], [SVG.get(id).node.getCTM()]),
                transformPoint(pp[3][0], pp[3][1], [SVG.get(id).node.getCTM()])
                ];

            destination = [{x: pp[0][0], y: pp[0][1]}, {x: pp[1][0], y: pp[1][1]}, {x: pp[2][0], y: pp[2][1]}, {x: pp[3][0], y: pp[3][1]}];
            var path_destination = distort_path(path_source,source,destination);
            SVG.get(id).plot(path_destination);
        });
        circles[i].on('dragend', function(event){
                shift = false;
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

updatePoint = function(points,p,x,y,id){
    var invview = SVG.get('viewport').node.getCTM().inverse();
    var invmatrix = SVG.get(id).node.getCTM().inverse();
    var draggedHinge = transformPoint(clone(points.subpath[p][x]), clone(points.subpath[p][y]), [invview, invmatrix]);
    points.path[points.start+p-1][x] = clone(draggedHinge[0]);
    points.path[points.start+p-1][y] = clone(draggedHinge[1]);
    return points;
}

buildAttractors = function(p, points, hinge, id, attrs, midds){
    var index = {};
    var attr1, attr2, line1, line2;
    if(points.subpath[p][0] == 'C'){
        attr1 = buildCirclePoint(hinge, 10, "#FFFFFF", '#993300');
        attr1.cx(points.subpath[p][3]).cy(points.subpath[p][4]).attr("no", "1");
        line1 = hinge.line(points.subpath[p][3], points.subpath[p][4], points.subpath[p][5], points.subpath[p][6]).stroke({color: '#000000', width: 1}).opacity(0.6);
        var x = 5, y = 6;
        index.attr1 = {p: p, x: 3, y:4 , attr: attr1, line: line1, o: 2, p2: p, x2: 5, y2: 6};
    }
    else { var x = 1, y = 2; }
    if(points.subpath[p + 1][0] == 'C'){
        attr2 = buildCirclePoint(hinge, 10, "#FFFFFF", '#993300');
        attr2.cx(points.subpath[p+1][1]).cy(points.subpath[p+1][2]).attr("no", "2");
        line2 = hinge.line(points.subpath[p+1][1], points.subpath[p+1][2], points.subpath[p][x], points.subpath[p][y]).stroke({color: '#000000', width: 1}).opacity(0.6);
        index.attr2 = {p: p+1, x: 1, y:2, attr: attr2, line: line2, o: 1, p2: p, x2: x, y2: y};
    }
    var k = Object.keys(index);
    for(i in k){
        index[k[i]].attr.draggable();
        var shift = false;
        var move = 0;
        index[k[i]].attr.on('mousedown', function(e){
            if(e.shiftKey)
                shift = true;
            this.opacity(0.3);
            move = this.cx();
        });
        index[k[i]].attr.on('mouseover', function(e){
            this.opacity(1);
        });
        index[k[i]].attr.on('mouseout', function(e){
            this.opacity(0.6);
        });
        index[k[i]].attr.on('dblclick', function(e){
            console.log('dblclick')
            var n = attrs[p]["attr"+this.attr("no")];
            if(n.p == 1){
                points.subpath[n.p][0] = 'M'
                points.path[points.start+n.p-1][0] = 'M'
            }
            else{
                points.subpath[n.p][0] = 'L'
                points.path[points.start+n.p-1][0] = 'L'
            }
            points.subpath[n.p][1] = points.subpath[n.p][5]
            points.subpath[n.p][2] = points.subpath[n.p][6]
            points.subpath[n.p].splice(3,4);
            points.path[points.start+n.p-1][1] = points.path[points.start+n.p-1][5]
            points.path[points.start+n.p-1][2] = points.path[points.start+n.p-1][6]
            points.path[points.start+n.p-1].splice(3,4);
            if(n.x == 3){
                attrs[p-1].attr2.attr.remove();
                attrs[p-1].attr2.line.remove();
            }
            else{
                attrs[p+1].attr1.attr.remove();
                attrs[p+1].attr1.line.remove();
            }
            this.remove();
            n.line.remove();
            SVG.get(id).plot(points.path);
            saveItemLocalisation(id);
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
            points = updatePoint(points, n.p,n.x,n.y,id);
            SVG.get(id).plot(points.path);
            attrs[p]["attr"+this.attr("no")].line.attr("x1", this.cx()).attr("y1", this.cy()); 
            positionMidd(midds[p-2+Number(this.attr("no"))], p-2+Number(this.attr("no")), points);  
        });
        index[k[i]].attr.on('dragend', function(event){
            if(move != this.cx()){
                saveItemLocalisation(id);
                shift = false;
                rebuildSelectorPoints(id);
            }
            togglePanZoom();
            event.stopPropagation();
            event.preventDefault();
        });
    }

    return index;
}

buildHinge = function(p, points, hinge, midd, id, hinges, midds, attr, no){
    if(points.subpath[p][0] == 'M'){
        var newhinge = buildCirclePoint(hinge, 10, "#FFFFFF", '#007fff').attr("type", "hinge").attr("hingeM", "hingeM");
        if(points.subpath[p+1][0] != 'C')
            var l = hinge.line(points.subpath[p][1],points.subpath[p][2],points.subpath[p+1][1],points.subpath[p+1][2]).stroke({color: '#007fff', width: 3}).opacity(0.6).attr("id", "hingeLine");
        else
            var l = hinge.line(points.subpath[p][1],points.subpath[p][2],points.subpath[p+1][5],points.subpath[p+1][6]).stroke({color: '#007fff', width: 3}).opacity(0.6).attr("id", "hingeLine");
    }
    else
        var newhinge = buildCirclePoint(hinge, 10, "#FFFFFF", "#000000").attr("type", "hinge");
    
    if(points.subpath[p][0] == 'C') { var x = 5, y = 6; }
    else{ var x = 1, y = 2; }
    if(points.subpath[p][0] == 'C' || points.subpath[p+1][0] == 'C')
        attr[p] = buildAttractors(p, points, hinge, id, attr, midds);
    newhinge.cx(points.subpath[p][x]).cy(points.subpath[p][y]);
    newhinge.draggable();
    var shift = false;
    var move = 0;
    newhinge.on('mousedown', function(e){
        if(e.shiftKey)
            shift = true;
        this.opacity(0.3);
        move = this.cx();
    });
    newhinge.on('mouseover', function(e){
        this.opacity(0.8);
    });
    newhinge.on('mouseout', function(e){
        this.opacity(0.6);
    });
    newhinge.on('dblclick', function(e){
        //points.subpath.splice(p,1);
        points.path.splice(points.start+p-1,1);
        if(p == 1){
            if(points.path[points.start][0] == 'C'){
                points.path[points.start][1] = points.path[points.start][5]
                points.path[points.start][2] = points.path[points.start][6]
                points.path[points.start].splice(3,4);
            }
            //points.subpath[1][0] = 'M';
            points.path[points.start][0] = 'M';
        }
        SVG.get(id).plot(points.path);
        saveItemLocalisation(id);      
        rebuildSelectorPoints(id);
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
                points = updatePoint(points, n.p,n.x,n.y,id);
            }
            if(attr[p].attr2){
                var n = attr[p].attr2;
                var newx = points.subpath[n.p][n.x] + dx;
                var newy = points.subpath[n.p][n.y] + dy;
                points.subpath[n.p][n.x] = newx;
                points.subpath[n.p][n.y] = newy;
                attr[p].attr2.attr.cx(newx).cy(newy);
                attr[p].attr2.line.attr("x1", newx).attr("y1", newy).attr("x2", this.cx()).attr("y2", this.cy());
                points = updatePoint(points, n.p,n.x,n.y,id);
            }
        }
        points.subpath[p][x] = this.cx();
        points.subpath[p][y] = this.cy();
        points = updatePoint(points, p,x,y,id);
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
        if(move != this.cx()){
            saveItemLocalisation(id);
            shift = false;
            rebuildSelectorPoints(id);
        }
        togglePanZoom();
        event.stopPropagation();
        event.preventDefault();
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

buildMidd = function(p, points, hinge, midd, id, hinges, midds, attrs, no){
    var newmidd = buildCirclePoint(midd, 7, '#000000', "#FFFFFF");
    positionMidd(newmidd, p, points);
    newmidd.on('mouseover', function(e){
        this.opacity(0.8);
    });
    newmidd.on('mouseout', function(e){
        this.opacity(0.6);
    });
    newmidd.on('mousedown', function(e){
        var invview = SVG.get('viewport').node.getCTM().inverse();
        var invmatrix = SVG.get(id).node.getCTM().inverse();
        var pp = transformPoint(this.cx(), this.cy(), [invview, invmatrix]);
        if(e.shiftKey){
            var d = 10;
            if(points.path[points.start+p-1][0] == 'C'){
                var at1 = points.path[points.start+p][1];
                var at2 = points.path[points.start+p][2];
                var at11 = points.subpath[p-1][1];
                var at22 = points.subpath[p-1][2];
            }
            else{
                var at1 = points.path[points.start+p-1][1] + d;
                var at2 = points.path[points.start+p-1][2] - d;
                var at11 = points.subpath[p][1] + d;
                var at22 = points.subpath[p][2] - d;
            }
            if(points.path[points.start+p][0] == 'C'){
                points.path[points.start+p][1] = pp[0] + d;
                points.path[points.start+p][2] = pp[1] - d;
            }
            else{
                if(points.path[points.start+p][0] != 'Z'){
                    points.path[points.start+p][0] = 'C';
                    points.path[points.start+p][5] = points.path[points.start+p][1];
                    points.path[points.start+p][6] = points.path[points.start+p][2];
                    points.path[points.start+p][1] = pp[0] + d;
                    points.path[points.start+p][2] = pp[1] - d;
                    points.path[points.start+p][3] = points.path[points.start+p][5] - d;
                    points.path[points.start+p][4] = points.path[points.start+p][6] - d;
                }
                else{
                    points.subpath.splice(p+1,0, ['C', this.cx() + d, this.cy() - d, points.subpath[p+1][5] - d, points.subpath[p+1][6] - d, points.subpath[p+1][1], points.subpath[p+1][2]]);
                    points.path.splice(points.start+p, 0, ['C', pp[0] + d, pp[1] - d, points.path[points.start][1] - d, points.path[points.start][2] - d, points.path[points.start][1], points.path[points.start][2]]);
                }
            }
            points.subpath.splice(p+1,0, ['C', at11, at22, this.cx() - d, this.cy() - d, this.cx(), this.cy()]);
            points.path.splice(points.start+p, 0, ['C', at1, at2, pp[0] - d, pp[1] - d, pp[0], pp[1]]);
            attrs[p] = buildAttractors(p,points, hinge, id, attrs, midds);
            attrs[p+1] = buildAttractors(p+1,points, hinge, id, attrs, midds);
            attrs[p+2] = buildAttractors(p+2,points, hinge, id, attrs, midds);
        }
        else{
            points.subpath.splice(p+1, 0, ['L', this.cx(), this.cy()]);
            points.path.splice(points.start+p, 0, ['L', pp[0], pp[1]]);
        }
        SVG.get(id).plot(points.path);
        saveItemLocalisation(id);
        rebuildSelectorPoints(id);
    });
    return newmidd;
}

buildSubPathPoints = function(points, hinge, midd, id, hinges, midds, attr, no){
    //var hinges = [], midds = [], attr = [];
    if(points.subpath[points.subpath.length-1][0] == 'Z'){
        points.subpath.splice(0,0,points.subpath[points.subpath.length-2])
        points.subpath.splice(points.subpath.length-1,1,points.subpath[1])
    }
    else{
        points.subpath.splice(0,0,'null')
        points.subpath.push('null')
    }
    for(p = 1; p < points.subpath.length-1; p++){
        hinges[p] = buildHinge(p, points, hinge, midd, id, hinges, midds, attr, no);
        midds[p] = buildMidd(p, points, hinge, midd, id, hinges, midds, attr, no);
    }
}
allpoints = [];
subpaths = []
buildSelectorPoints = function(id){
    baselinePoints = [];
    var allhinges = [], allmidds = [], allattrs = [];
    subpaths = getSubPaths(SVG.get(id));
    var selector = SVG.get("svgEditor").group().attr("id", "box_"+id).attr("selected", id).attr("type", 'pathPoints');
    var midd = selector.group().attr("id", "middPoints");
    var hinge = selector.group().attr("id", "hingePoints");
    for(var p in subpaths){
        allhinges[p] = [];
        allmidds[p] = [];
        allattrs[p] = [];
        subpaths[p].subpath = transformPath(subpaths[p].subpath, id);
        buildSubPathPoints(subpaths[p], hinge, midd, id, allhinges[p], allmidds[p], allattrs[p], p);
        allpoints[p] =  allhinges[p].concat(allmidds[p]).concat(allattrs[p]);
    }
    createbaselinePoints();
    positionSelectorPoints(subpaths);
    return selector;
}

rebuildSelectorPoints = function(id){
    global_oro_variables.selected.members.splice(global_oro_variables.selected.members.indexOf(SVG.get('box_'+id)),1);
    SVG.get('box_'+id).remove();
    buildSelectorPoints(id);
    global_oro_variables.selected.add(SVG.get('box_'+id));
}

createbaselinePoints = function(){
    for(i in allpoints){
        baselinePoints[i] = [];
        for(p in allpoints[i]){
            if(allpoints[i][p].attr1 || allpoints[i][p].attr2){
                baselinePoints[i][p] = {}
                if(allpoints[i][p].attr1)
                    baselinePoints[i][p].attr1 = [allpoints[i][p].attr1.attr.cx(), allpoints[i][p].attr1.attr.cy()];
                if(allpoints[i][p].attr2)
                    baselinePoints[i][p].attr2 = [allpoints[i][p].attr2.attr.cx(), allpoints[i][p].attr2.attr.cy()];
            }
            else
                baselinePoints[i][p] = [allpoints[i][p].cx(), allpoints[i][p].cy()];
        }
    }
}

positionSelectorPoints = function(subpaths){
    var view = SVG.get('viewport').node.getCTM();
    for(i in allpoints)
        for(p in allpoints[i]){
            if(allpoints[i][p].attr1 || allpoints[i][p].attr2){
                if(allpoints[i][p].attr1){
                    var pp = [clone(baselinePoints[i][p].attr1[0]), clone(baselinePoints[i][p].attr1[1])];
                    pp = transformPoint(pp[0], pp[1], [view]);
                    allpoints[i][p].attr1.attr.cx(pp[0]).cy(pp[1]);
                    allpoints[i][p].attr1.line.attr("x1",pp[0]).attr("y1",pp[1]);
                    allpoints[i][p].attr1.line.attr("x2", allpoints[i][allpoints[i][p].attr1.p2].cx()).attr("y2", allpoints[i][allpoints[i][p].attr1.p2].cy());
                    if(subpaths){
                        subpaths[i].subpath[allpoints[i][p].attr1.p][allpoints[i][p].attr1.x] = pp[0];
                        subpaths[i].subpath[allpoints[i][p].attr1.p][allpoints[i][p].attr1.y] = pp[1];
                    }
                }
                if(allpoints[i][p].attr2){
                    var pp = [clone(baselinePoints[i][p].attr2[0]), clone(baselinePoints[i][p].attr2[1])];
                    pp = transformPoint(pp[0], pp[1], [view]);
                    allpoints[i][p].attr2.attr.cx(pp[0]).cy(pp[1]);
                    allpoints[i][p].attr2.line.attr("x1",pp[0]).attr("y1",pp[1]);
                    allpoints[i][p].attr2.line.attr("x2", allpoints[i][allpoints[i][p].attr2.p2].cx()).attr("y2", allpoints[i][allpoints[i][p].attr2.p2].cy());
                    if(subpaths){
                        subpaths[i].subpath[allpoints[i][p].attr2.p][allpoints[i][p].attr2.x] = pp[0];
                        subpaths[i].subpath[allpoints[i][p].attr2.p][allpoints[i][p].attr2.y] = pp[1];
                    }
                }
            }
            else{
                var pp = [clone(baselinePoints[i][p][0]), clone(baselinePoints[i][p][1])];
                pp = transformPoint(pp[0], pp[1], [view]);
                allpoints[i][p].cx(pp[0]).cy(pp[1]);
                if(allpoints[i][p-1] && allpoints[i][p-1].attr("hingeM"))
                    SVG.get('hingeLine').attr("x1", allpoints[i][p-1].cx()).attr("y1", allpoints[i][p-1].cy()).attr("x2", pp[0]).attr("y2", pp[1])
                if(subpaths){
                    if(allpoints[i][p].attr("type") == "hinge"){
                        if(subpaths[i].subpath[p][0] != 'C'){
                            subpaths[i].subpath[p][1] = pp[0];
                            subpaths[i].subpath[p][2] = pp[1];
                        }
                        else{
                            subpaths[i].subpath[p][5] = pp[0];
                            subpaths[i].subpath[p][6] = pp[1];
                        }/*
                        if(subpaths[i].subpath[p-1][0] == 'M'){
                            SVG.get('hingeLine').attr("x1", subpaths[i].subpath[p-1][1]).attr("y1", subpaths[i].subpath[p-1][2]).attr("x2", pp[0]).attr("y2", pp[1])
                        }*/
                    }
                }
            }
        }
}

buildSelectorLocked = function(id){
    var parent = SVG.get('svgEditor');
    var box = SVG.get(id).bbox();
    var selector = parent.group().attr("id","locked_"+id).attr("selected",id).attr("type","locked").opacity(0.7);
    var path = 'M'+box.x+','+box.y+'L'+(box.x+box.width)+','+box.y+'L'+(box.x+box.width)+','+(box.y+box.height)+'L'+box.x+','+(box.y+box.height)+'Z';
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
    if(item.type == 'path'){
        if(checkPathType(item) == 'simple'){
            val = JSON.stringify(pathArraySvgOro(item.array.value));
            upd.type = 'simple_path';
        }
        else{
            val = item.attr("d");
            upd.type = 'complex_path';
        }
        var p = item.array.value
        if(p[p.length-1][0] == "Z")
            upd.closed = 'true';
        else
            upd.closed = 'false';
    }
    else
        if(item.attr("type") == "text")
            val = item.attr('x') + ',' + item.attr('y');
        else
            if(item.attr("type") == "rasterImage" || item.attr("type") == 'formulae')
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
        if(item.attr("type") == "rasterImage" || item.attr("type") == 'formulae'){
            points = points.split(",");
            item.move(points[0],points[1]).size(points[2],points[3]);
        }
        else
            if(item.attr("type") == "embedediFrame"){
                points = points.split(",");
                item.attr("x", points[0]).attr("y", points[1]).attr("width", points[2]).attr("height", points[3]);
                item.node.childNodes[0].setAttribute("width",points[2]);
                item.node.childNodes[0].setAttribute("height",points[3]);
            }
            else
                if(item.attr("type") == "embededHtml"){
                    points = points.split(",");
                    item.attr("x", points[0]).attr("y", points[1]).attr("width", points[2]).attr("height", points[3]);
                }
                else
                    {
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
        removeItem(id);
        build_item(parent, Item.findOne({_id: id}));
    }
    else
        {
            if(fields.palette)
                updatePalette(item, fields.palette);
            if(fields.font)
                updateFont(item, fields.font);
            if(fields.text){
                if(item.attr("type") == 'text'){
                //if(item.type == "text"){
                    item.text(fields.text);
                }
                else
                    if(item.attr("type") == 'image')
                        item.attr("href", fields.text);
                    else
                        if(item.attr("type") == 'embedediFrame'){
                            item.attr("src", fields.text);
                            item.node.childNodes[0].setAttribute("src", fields.text);
                        }
                        else
                            if(item.attr("type") == 'embededHtml'){
                                $(item.node).html('');
                                item.appendChild("div", {innerHTML: fields.text});
                            }
            }
            if(fields.pointList)
                updatePointList(item, fields.pointList);
            if(fields.groupId){
                SVG.get(fields.groupId).add(SVG.get(id));
            }
            if(fields.closed){
                var p = SVG.get(id).array.value;
                if(fields.closed == 'true' && p[p.length-1][0] != 'Z'){
                    p.push(['Z']);
                    SVG.get(id).plot(p).attr("closed", "true");
                }
                if(fields.closed == 'false' && p[p.length-1][0] == 'Z'){
                    p.pop();
                    SVG.get(id).plot(p).attr("closed", "false");
                }
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
            SVG.get(id).draggable();
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
        if(type == 'rasterImage' || type == 'formulae'){
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
                            item.appendChild('canvas', {id: 'embededCanvas_'+it._id, width: points[2], height: points[3]});
                    }
                    else
                        if(type == 'embededHtml'){
                            var points = split_oro_points(it.pointList);
                            var item = g.foreignObject(points[2],points[3]).attr("id", it._id).move(points[0], points[1]).appendChild("div", {id: "html_"+it._id, innerHTML: it.text});
                        }
                        else
                            if(type == 'nestedSvg'){
                                var points = split_oro_points(it.pointList);
                                var item = g.nested().attr("id", it._id).attr("x", points[0]).attr("y", points[1]).attr("width", points[2]).attr("height", points[3]);
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
                                SVG.get('box_'+itemid).remove();
                                global_oro_variables.selected.members[0] = buildSelectorSimple(SVG.get("svgEditor"), itemid);
                            }
                        var results = buildSelectorSimple(SVG.get("svgEditor"), this.attr("id"));
                        global_oro_variables.selected.add(results);
                        this.draggable();
                        Session.set("selected", "true");
                    }
                }
                else{
                        deselect();
                        if(['embedediFrame', 'para_simple_path', 'para_complex_path', 'embededCanvas', 'embededHtml'].indexOf(this.attr("type")) == -1){
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

build_group_client = function (g, group, subgroups){
    var items = Item.find({groupId: group._id}, {sort: {ordering:1}}).fetch();
    if(items.length > 0){
        //if(typeof subgroups === 'undefined' || subgroups.length > 0) //add subgroups when calling
            for(var i in items)
                build_item(g, items[i]);
        /*
        else{
            var all = items.concat(subgroups);
            all.sort(function(a, b){
                return a.ordering - b.ordering
            })
            console.log(JSON.stringify(all));
            for(i in all){
                if(all[i].pointList)
                    build_item(g, all[i]);
                else
                    recursive_group_client(g, all[i]);
            }
        }*/
    }
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

    // todo: if linked groups, ordering should include them
    //if(parent.get(group.ordering) && parent.get(group.ordering) != subparent){
        //subparent.before(parent.get(group.ordering));
    //    parent.each(function(i,children){
    //        if(parent.index(this) == group.ordering && this != subparent)
    //            this.front();
    //    });
    //}

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
        build_group_client(subparent, group); // ,subgroups
    
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
            newarr.push({path: arr, start: Number(i)});
            newarr[newarr.length-1].subpath = [ clone(arr[i]) ];
        }
        else{
            var len = newarr[newarr.length-1].subpath.length;
            newarr[newarr.length-1].subpath.push(clone(arr[i]));
            newarr[newarr.length-1].end = Number(i);
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
    return JSON.stringify(points);
}

paraRect = function(obj, val){
    var delta = Math.sqrt(Math.sqrt(Math.sqrt(2)));
    var x = Number(obj.x), y = Number(obj.y), w = Number(obj.width), h = Number(obj.height), rx = Number(obj.rx), ry = Number(obj.ry);
    if(typeof val != 'undefined' && obj.maintainRatio)
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

paraFormulae = function(latex){
    return 'http://latex.codecogs.com/svg.latex?'+latex;
}