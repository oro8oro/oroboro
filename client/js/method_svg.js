baselinePoints = [];
selection = [], selectionno = [];
var oro = global_oro_variables;
panCallback = function(a){
        a = a || SVG.get("viewport").node.getCTM();

        var matrix = a.a + ","+a.b + ","+a.c + ","+a.d + ","+a.e + ","+a.f;
        scaleMinimap(matrix);
        SVG.get("viewport").transform("matrix", matrix);

        var selected = global_oro_variables.selected.members;
        for(var s in selected)
            positionSelector(selected[s].attr("selected"));
        var locked = Session.get("lockedItems");
        for(var l in locked)
            positionSelectorL(locked[l]);
        var keys = Object.keys(global_oro_variables.connections)
        for(var k in keys)
            global_oro_variables.connections[keys[k]].update();
        SVG.get('mousegroup').each(function(i,children){
            var p = transformPoint(this.attr('mousex'), this.attr('mousey'), [a])
            this.move(p[0], p[1])
        })
};

enablePan = function(){
    var elem = document.getElementById('svgEditor');
    global_oro_variables.svgPan = SVGPan(elem, {
        enablePan: true,
        enableZoom: true,
        enableDrag: false,
        zoomScale: 0.2,
        callback: panCallback
    });
};

disablePan = function(){
    global_oro_variables.svgPan.removeHandlers();
};

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

removeGui = function() {
  global_oro_variables.gui.domElement.parentElement.removeChild(global_oro_variables.gui.domElement);
  global_oro_variables.gui = undefined;
};

addGui = function(gui, parent) {
  if(!parent) {
    parent = document.getElementsByClassName('dg ac');
  }
  parent.appendChild(gui);
};

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
};

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
};

buildNewCurve = function(p0, a1, a2, p2, ratio){

    var item = {
        x1: a1.x,
        x2: a2.x,
        y1: a1.y,
        y2: a2.y,
        x: p2.x,
        y: p2.y
    }

    var p0_x = (p0.x + item.x1) * ratio
    var p1_x = (item.x1 + item.x2) * ratio
    var p2_x = (item.x2 + item.x) * ratio
    var p01_x = (p0_x + p1_x) * ratio
    var p12_x = (p1_x + p2_x) * ratio
    new_x = (p01_x + p12_x) * ratio
    var p0_y = (p0.y + item.y1) * ratio
    var p1_y = (item.y1 + item.y2) * ratio
    var p2_y = (item.y2 + item.y) * ratio
    var p01_y = (p0_y + p1_y) * ratio
    var p12_y = (p1_y + p2_y) * ratio
    new_y = (p01_y + p12_y) * ratio

    return [['C', p0_x, p0_y, p01_x, p01_y, new_x, new_y],
        ['C', p12_x, p12_y, p2_x, p2_y, item.x, item.y]
    ]
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

resizeItem = function(item, dx, dy, sidex, sidey){
    if(sidex == 'r')
        item.attr('width', Number(item.attr('width')) + dx);
    else{
        item.attr('width', Number(item.attr('width')) - dx);
        //item.dx(dx);
        item.attr('x', item.attr('x') + dx);
    }
    if(sidey == 'b')
        item.attr('height', Number(item.attr('height')) + dy);
    else{
        item.attr('height', Number(item.attr('height')) - dy);
        //item.dy(dy);
        item.attr('y', item.attr('y') + dy);
    }
    if(item.attr('type') == 'embeddediFrame'){
        $('embeddediFrame_'+item.attr('id')).attr('width', item.attr('width'));
        $('embeddediFrame_'+item.attr('id')).attr('height', item.attr('height'));
    }
}

transformGroup = function(item, distx, disty, sidex, sidey){
    console.orolog(distx);console.orolog(disty);console.orolog(sidex);console.orolog(sidey);
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
    console.orolog(vals);
    return vals;
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

skewPath = function(item, anglex, angley){
    var points = item.array.value;
    var po,
        skewx = Math.tan(anglex),
        skewy = Math.tan(angley);
    for(p in points){
        if(points[p][0].match(/z/i)) {
          points[p][0] = 'Z';
        }
        else {
            po = transformPoint(points[p][1], points[p][2], [{a:1, b:skewx, c:skewy, d:1, e:0, f:0}])
            points[p][1] = po[0];
            points[p][2] = po[1];
            if(points[p][0] == 'C'){
                po = transformPoint(points[p][3], points[p][4], [{a:1, b:skewx, c:skewy, d:1, e:0, f:0}])
                points[p][3] = po[0];
                points[p][4] = po[1];
                po = transformPoint(points[p][5], points[p][6], [{a:1, b:skewx, c:skewy, d:1, e:0, f:0}])
                points[p][5] = po[0];
                points[p][6] = po[1];
            }
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
/*
rotateMatrix = function (a, rad, pivot) {
    if(a instanceof Array)
        var a0 = a[0], a1 = a[1], a2 = a[2], a3 = a[3], a4 = a[4], a5 = a[5];
    else
        var a0 = a.a, a1 = a.b, a2 = a.c, a3 = a.d, a4 = a.e, a5 = a.f;
    var s = Math.sin(rad),
        c = Math.cos(rad), out = [];

    if(pivot){
        a4 = - a0 * pivot.x - a2 * pivot.y + a4
        a5 = - a1 * pivot.x - a3 * pivot.y + a5
    }

    out[0] = a0 *  c + a2 * s;
    out[1] = a1 *  c + a3 * s;
    out[2] = a0 * -s + a2 * c;
    out[3] = a1 * -s + a3 * c;

    if(pivot){
        out[4] = a0 * pivot.x + a2 * pivot.y + a4
        out[5] = a1 * pivot.x + a3 * pivot.y + a5
    }
    else{
        out[4] = a4;
        out[5] = a5;
    }
    console.orolog(JSON.stringify(out));
    if(a instanceof Array)
        return out;
    else
        return {a: out[0], b: out[1], c: out[2], d: out[3], e: out[4], f: out[5]}
}
*/

translateMatrix = function(a, x, y){
    if(a instanceof Array){
        a[4] = a[0] * x + a[2] * y + a[4]
        a[5] = a[1] * x + a[3] * y + a[5]
    }
    else{
        a.e = a.a * x + a.c * y + a.e
        a.f = a.b * x + a.d * y + a.f
    }
    return a;
}

rotateMatrix = function (a, rad, pivot) {
    //a can either be an array or an object of the type {a:1, b:0, c:0, d:1, e:0, f:0}
    if(a instanceof Array){
        var aa = a[0],
            ab = a[1],
            ac = a[2],
            ad = a[3],
            atx = a[4],
            aty = a[5];
    }
    else{
        var aa = a.a,
            ab = a.b,
            ac = a.c,
            ad = a.d,
            atx = a.e,
            aty = a.f;
    }
    var st = Math.sin(rad),
        ct = Math.cos(rad),
        out = [];

    //if we have a pivot point for the rotation, such as the center of the item, we do a translation of (-pivot.x, -pivot.y)
    if(pivot){
        atx = - aa * pivot.x - ac * pivot.y + atx
        aty = - ab * pivot.x - ad * pivot.y + aty
    }

    //matrix rotation algorithm
    out[0] = aa*ct + ab*st;
    out[1] = -aa*st + ab*ct;
    out[2] = ac*ct + ad*st;
    out[3] = -ac*st + ct*ad;
    out[4] = ct*atx + st*aty;
    out[5] = ct*aty - st*atx;

    //translation to original location: (+pivot.x, +pivot.y)
    if(pivot){
        out[4] = aa * pivot.x + ac * pivot.y + out[4]
        out[5] = ab * pivot.x + ad * pivot.y + out[5]
    }

    //same type of output as input
    if(a instanceof Array)
        return out;
    else
        return {a: out[0], b: out[1], c: out[2], d: out[3], e: out[4], f: out[5]}
};

scaleMatrix = function(a, v, pivot) {
    if(a instanceof Array){
        var aa = a[0],
            ab = a[1],
            ac = a[2],
            ad = a[3],
            atx = a[4],
            aty = a[5];
    }
    else{
        var aa = a.a,
            ab = a.b,
            ac = a.c,
            ad = a.d,
            atx = a.e,
            aty = a.f;
    }
    var vx = v[0], vy = v[1], out = [];

    if(pivot){
        atx = - aa * pivot.x - ac * pivot.y + atx
        aty = - ab * pivot.x - ad * pivot.y + aty
    }

    out[0] = aa * vx;
    out[1] = ab * vy;
    out[2] = ac * vx;
    out[3] = ad * vy;
    out[4] = atx * vx;
    out[5] = aty * vy;

    if(pivot){
        out[4] = aa * pivot.x + ac * pivot.y + out[4]
        out[5] = ab * pivot.x + ad * pivot.y + out[5]
    }

    //same type of output as input
    if(a instanceof Array)
        return out;
    else
        return {a: out[0], b: out[1], c: out[2], d: out[3], e: out[4], f: out[5]}
};

/*
skewMatrix = function(a, rad, pivot){
    //a can either be an array or an object of the type {a:1, b:0, c:0, d:1, e:0, f:0}
    if(a instanceof Array){
        var aa = a[0],
            ab = a[1],
            ac = a[2],
            ad = a[3],
            atx = a[4],
            aty = a[5];
    }
    else{
        var aa = a.a,
            ab = a.b,
            ac = a.c,
            ad = a.d,
            atx = a.e,
            aty = a.f;
    }
    var tan = Math.tan(rad),
        out = [];

    //if we have a pivot point for the rotation, such as the center of the item, we do a translation of (-pivot.x, -pivot.y)
    if(pivot){
        atx = - aa * pivot.x - ac * pivot.y + atx
        aty = - ab * pivot.x - ad * pivot.y + aty
    }

    //matrix rotation algorithm
    out[0] = aa*ct + ab*st;
    out[1] = -aa*st + ab*ct;
    out[2] = ac*ct + ad*st;
    out[3] = -ac*st + ct*ad;
    out[4] = ct*atx + st*aty;
    out[5] = ct*aty - st*atx;

    //translation to original location: (+pivot.x, +pivot.y)
    if(pivot){
        out[4] = aa * pivot.x + ac * pivot.y + out[4]
        out[5] = ab * pivot.x + ad * pivot.y + out[5]
    }

    //same type of output as input
    if(a instanceof Array)
        return out;
    else
        return {a: out[0], b: out[1], c: out[2], d: out[3], e: out[4], f: out[5]}
}
*/

multiplyMatrix = function (a, b) {
    var aa = a[0], ab = a[1], ac = a[2], ad = a[3],
        atx = a[4], aty = a[5],
        ba = b[0], bb = b[1], bc = b[2], bd = b[3],
        btx = b[4], bty = b[5],
        out = [];

    out[0] = aa*ba + ab*bc;
    out[1] = aa*bb + ab*bd;
    out[2] = ac*ba + ad*bc;
    out[3] = ac*bb + ad*bd;
    out[4] = ba*atx + bc*aty + btx;
    out[5] = bb*atx + bd*aty + bty;
    return out;
}

transformPath = function(pathArray, id){
    var m = SVG.get(id).node.getCTM();
    for(p in pathArray){
        if(pathArray[p][0].match(/z/i)) {
          pathArray[p][0] = 'Z';
        }
        else {
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
            if(['simple_path', 'complex_path'].indexOf(SVG.get(id).attr('type')) != -1){
                var rotate = transformPoint(box.x+box.width/2, box.y - 4*(Number(SVG.get("rotate_"+id).attr('ry')) + Number(SVG.get("rotate_"+id).attr('stroke-width'))), [matrix,view]);
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
            }
            else
                var points = [
                    [ p[0][0] + (p[1][0] - p[0][0]) / 2, p[0][1] + (p[1][1] - p[0][1]) / 2 ],
                    [ p[1][0], p[1][1]],
                    [ p[1][0] + (p[2][0] - p[1][0]) / 2, p[1][1] + (p[2][1] - p[1][1]) / 2],
                    [ p[2][0], p[2][1] ],
                    [ p[3][0] + (p[2][0] - p[3][0]) / 2, p[3][1] + (p[2][1] - p[3][1]) / 2],
                    [ p[3][0], p[3][1] ],
                    [ p[0][0] + (p[3][0] - p[0][0]) / 2, p[0][1] + (p[3][1] - p[0][1]) / 2 ],
                    [ p[0][0], p[0][1] ]
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
    var box = SVG.get(id).bbox();
    var but = 35;
    var sp = but/4;
    var matrix = SVG.get(id).node.getCTM();
    var view  = getViewportMatrix();
    var pp = transformPoint(box.x+box.width/2, box.y+box.height, [matrix,view]);
    //var ep = transformPoint(box.x+box.width/2-but-sp, box.y+box.height+sp, [matrix,view]);
    //var dd = transformPoint(box.x+box.width/2+sp, box.y+box.height+sp, [matrix,view]);
    SVG.get("editPoints").size(but,but).move(pp[0]-but-sp, pp[1]+sp)
    SVG.get("3DPoints").size(but,but).move(pp[0]+sp, pp[1]+sp)
}

setButtons = function(id){
    if(!SVG.get('editPoints_defs')){
        var b1 = SVG.get('svgEditor').defs().image('/file/MeSC479WX69b9GATS').attr("id", "editPoints_defs").opacity(0.6).size(35,35);
        var b2 = SVG.get('svgEditor').defs().image('/file/isqRsRCPhGeSPNhoh').attr("id", "3DPoints_defs").opacity(0.6).size(35,35);
    }
    var buttons = []
    buttons[0] = SVG.get("container_"+id).use(SVG.get('editPoints_defs')).attr("id", "editPoints");
    buttons[1] = SVG.get("container_"+id).use(SVG.get('3DPoints_defs')).attr("id", "3DPoints");
    for(i in buttons){
        buttons[i].on('mouseover', function(){
            this.opacity(1);
        });
        buttons[i].on('mouseout', function(){
                this.opacity(0.6);
            });
    }
    buttons[0].on('click', function(){
        var index = global_oro_variables.selected.members.indexOf(SVG.get('box_'+id));
        global_oro_variables.selected.members.splice(index,1);
        SVG.get('box_'+id).remove();
        var sel = buildSelectorPoints(id);
        global_oro_variables.selected.add(sel);
        SVG.get(id).fixed();
    });
    buttons[1].on('click', function(){
        var index = global_oro_variables.selected.members.indexOf(SVG.get('box_'+id));
        global_oro_variables.selected.members.splice(index,1);
        SVG.get('box_'+id).remove();
        var sel = buildSelector3D(id);
        global_oro_variables.selected.add(sel);
        SVG.get(id).fixed();
    });

}
buildSelector = function(id, type){
    if(typeof type === 'undefined')
        type = SVG.get(id).attr('type');
    var r = 10;
    var parent = SVG.get("svgEditor");
    var box = SVG.get(id).bbox();
    var selector = parent.group().attr("id","box_"+id).attr("selected",id).attr("type","draggable").attr('selectedtype', 'type');
    var container = selector.group().attr("id","container_"+id);
    var path = 'M'+box.x+','+box.y+'L'+(box.x+box.width)+','+box.y+'L'+(box.x+box.width)+','+(box.y+box.height)+'L'+box.x+','+(box.y+box.height)+'Z';
    var rect = container.path(path).stroke({color: "#000000", width: 2, dasharray: "2,2", opacity: "0.8"}).fill("none").attr("id","container_path_"+id);
    var circles = [];
    for(i = 0 ; i < 8 ; i++)
        circles[i] = buildCircle(container,"circle_"+i+"_"+id,r,i);
    if(['simple_path', 'complex_path'].indexOf(type) != -1){
        circles[8] = buildCircle(selector, "rotate_"+id,r);
        circles[8].cx(box.x + box.width/2).cy(box.y - 4*(r + Number(circles[8].attr('stroke-width'))));
        circles[8].attr("style","cursor:url(/icons/rotate.png) 12 12, auto;");
        setButtons(id);
    }

    positionSelector(id);

    if(['simple_path', 'complex_path'].indexOf(type) != -1){
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
        var startangle = 0,
            cx = SVG.get(id).cx(),
            cy = SVG.get(id).cy();
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
            if(type == 'simple_path')
                rotateSPath(SVG.get(id), cx, cy, angle);
            if(type == 'complex_path')
                rotateCPath(SVG.get(id), cx, cy, angle);
            if(type == 'simpleGroup'){
                var m = SVG.get(id).transform();
                SVG.get(id).transform('matrix', rotateMatrix([m.a,m.b,m.c,m.d,m.e,m.f], angle, {x:cx, y:cy}).join(','));
            }
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
            if(type == 'simple_path')
                rotateSPath(SVG.get(id), cx, cy, angle);
            if(type == 'complex_path')
                rotateCPath(SVG.get(id), cx, cy, angle);
            if(type == 'simpleGroup'){
                var m = SVG.get(id).transform();
                Meteor.call('update_document', 'Group', id, {transform: rotateMatrix([m.a,m.b,m.c,m.d,m.e,m.f], angle, {x:cx, y:cy}).join(',')});
            }
            else
                saveItemLocalisation(id);
            pp = transformPoint(cx, cy, [SVG.get(id).node.getCTM(), SVG.get('viewport').node.getCTM()]);
            rotate_selector(id, pp[0], pp[1], angle);
            shift = false;
            startangle = 0;
            togglePanZoom();
            event.stopPropagation();
            event.preventDefault();
        });
    }
    var x = box.x; var y = box.y;
    var w = box.width; var h = box.height;

        for(i=0; i < 8 ; i++){
            if( i % 4 == 0){
                var minx = circles[i].x(), maxx = circles[i].x()+ circles[i].attr('rx')*2;
                circles[i].draggable({
                    minX: minx, maxX: maxx
                });
            }
            else
                if( i % 2 == 0 && i % 4 != 0){
                    var miny = circles[i].y(), maxy = circles[i].y() + circles[i].attr('ry')*2;
                    circles[i].draggable({
                        minY: miny, maxY: maxy
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
                if(shift || type == 'rasterImage'){
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
                if(type == 'simple_path'){
                    var points = pathArraySvgOro(item.array.value);
                    points = resizeSPath(points, distx, disty, sidex, sidey);
                    item.plot(split_oro_path_points(JSON.stringify(points)));
                }
                if(type == 'complex_path')
                    item.plot(resizeCPath(item.array.value, distx, disty, sidex, sidey));
                if(item.type == 'image' || item.type == 'foreignObject')
                    resizeItem(item, distx, disty, sidex, sidey);
                if(type == 'simpleGroup'){
                    var matrix = transformGroup(item, distx, disty, sidex, sidey).join(',');
                    item.transform("matrix", matrix);
                }
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
                if(shift || type == 'rasterImage'){
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
                if(type == 'simple_path'){
                    var points = pathArraySvgOro(item.array.value);
                    points = resizeSPath(points, distx, disty, sidex, sidey);
                    item.plot(split_oro_path_points(JSON.stringify(points)));
                }
                if(type == 'complex_path')
                    item.plot(resizeCPath(item.array.value, distx, disty, sidex, sidey));
                if(type == 'rasterImage')
                    resizeItem(item, distx, disty, sidex, sidey);
                if(type == 'simpleGroup'){
                    var matrix = transformGroup(item, distx, disty, sidex, sidey).join(',');
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

buildSelectorSimple = function(id){
    var parent = SVG.get("svgEditor");
    var box = SVG.get(id).bbox();
    var selector = parent.group().attr("id","box_"+id).attr("selected",id).attr("type","simple");
    var path = 'M'+box.x+','+box.y+'L'+(box.x+box.width)+','+box.y+'L'+(box.x+box.width)+','+(box.y+box.height)+'L'+box.x+','+(box.y+box.height)+'Z';
    var rect1 = selector.path(path).stroke({color: "#000000", width: 2, dasharray: "2,2", opacity: "0.8"}).fill("none").attr("id","container_path_"+id);
    positionSelector(id);
    return selector;
}

rebuildSelection = function(){
    if(global_oro_variables.selected.members && global_oro_variables.selected.members[0].attr('type') == 'pathPoints' && selectionno.length > 0){
        selection.clear();
        for(var i = 0; i < selectionno.length; i++){
            var hinge = SVG.get('hingePoints').get(selectionno[i]);
            selection.add(hinge);
            hinge.fill('#3a64a0');
        }
    }
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

buildSelector3D = function(id){
    var parent = SVG.get("svgEditor");
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

buildAttractors = function(p, points, hinge, attr, id, attrs, midds, newhinge){
    var index = {};
    var attr1, attr2, line1, line2;
    if(points.subpath[p][0] == 'C'){
        attr1 = buildCirclePoint(attr, 10, "#FFFFFF", '#993300');
        attr1.cx(points.subpath[p][3]).cy(points.subpath[p][4]).attr("no", "1");
        line1 = attr.line(points.subpath[p][3], points.subpath[p][4], points.subpath[p][5], points.subpath[p][6]).stroke({color: '#000000', width: 1}).opacity(0.6).attr('attractor', attr1.attr('id'));
        if(newhinge)
            line1.attr('hingePoint', newhinge.attr('id'));
        attr1.attr('attractorLine', line1.attr('id'));
        var x = 5, y = 6;
        index.attr1 = {p: p, x: 3, y:4 , attr: attr1, line: line1, o: 2, p2: p, x2: 5, y2: 6};
    }
    else { var x = 1, y = 2; }
    if(points.subpath[p + 1][0] == 'C'){
        attr2 = buildCirclePoint(attr, 10, "#FFFFFF", '#993300');
        attr2.cx(points.subpath[p+1][1]).cy(points.subpath[p+1][2]).attr("no", "2");
        line2 = attr.line(points.subpath[p+1][1], points.subpath[p+1][2], points.subpath[p][x], points.subpath[p][y]).stroke({color: '#000000', width: 1}).opacity(0.6).attr('attractor', attr2.attr('id'));
        if(newhinge)
            line2.attr('hingePoint', newhinge.attr('id'));
        attr2.attr('attractorLine', line2.attr('id'));
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
            console.orolog('dblclick')
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
        var paracallback = false, parameters;
        index[k[i]].attr.on('dragstart', function(event){
            disablePan();
            event.stopPropagation();
            event.preventDefault();
            if(SVG.get(global_oro_variables.selected.members[0].attr('selected')).parent.attr('type') == 'parametrizedGroup'){
                paracallback = true;
                parameters = Group.findOne({_id: SVG.get(global_oro_variables.selected.members[0].attr('selected')).parent.attr('id')}).parameters;
            }
        });
        index[k[i]].attr.on('dragmove', function(event){
            var n = attrs[p]["attr"+this.attr("no")];
            points.subpath[n.p][n.x] = this.cx();
            points.subpath[n.p][n.y] = this.cy();
            points = updatePoint(points, n.p,n.x,n.y,id);
            SVG.get(id).plot(points.path);
            attrs[p]["attr"+this.attr("no")].line.attr("x1", this.cx()).attr("y1", this.cy());
            positionMidd(midds[p-2+Number(this.attr("no"))], p-2+Number(this.attr("no")), points);
            if(paracallback)
                window[parameters.callback](parameters);
        });
        index[k[i]].attr.on('dragend', function(event){
            if(move != this.cx()){
                saveItemLocalisation(id);
                shift = false;
                rebuildSelectorPoints(id);
                if(paracallback)
                    window[parameters.callback](parameters, true);
            }
            togglePanZoom();
            event.stopPropagation();
            event.preventDefault();
        });
    }

    return index;
}

buildHinge = function(p, points, hinge, midd, attr, id, hinges, midds, attrs, no){
    if(points.subpath[p][0] == 'M'){
        var newhinge = buildCirclePoint(hinge, 10, "#FFFFFF", '#007fff').attr("hingeM", "hingeM");
    }
    else
        var newhinge = buildCirclePoint(hinge, 10, "#FFFFFF", "#000000");
    if(points.subpath[p][0] == 'C') { var x = 5, y = 6; }
    else{ var x = 1, y = 2; }
    if(points.subpath[p][0] == 'C' || points.subpath[p+1][0] == 'C')
        attrs[p] = buildAttractors(p, points, hinge, attr, id, attrs, midds, newhinge);
    newhinge.attr("type", "hinge").attr("p", p).attr("no", no).attr({"originalx": points.subpath[p][x], "originaly": points.subpath[p][y]}).attr('index', points.start+p-1);
    newhinge.cx(points.subpath[p][x]).cy(points.subpath[p][y]);
    newhinge.draggable();
    var move = 0;

    newhinge.on('mousedown', function(e){
        if(e.shiftKey)
            if(selection.members.indexOf(this) == -1){
                selection.add(this);
                selectionno.push(this.parent.index(this))
            }
            else{
                selection.remove(this);
                selectionno.splice(selectionno.indexOf(this.parent.index(this)), 1);
            }
        else{
            this.opacity(0.3);
            move = this.cx();
        }
    });
    newhinge.on('mouseover', function(e){
        this.opacity(0.8);
    });
    newhinge.on('mouseout', function(e){
        this.opacity(0.6);
    });
    newhinge.on('dblclick', function(e){
        //if there is no selection of points/hinges to do a group operation
        if(selectionno.length == 0){

            //if deleted point is between 2 curves, reposition attractors (first and last)
            if(points.path[points.start+p-1][0] == 'C' && points.path[points.start+p][0] == 'C'){
                //get the coords of the first attractor
                var a1x = points.path[points.start+p-1][1]
                var a1y = points.path[points.start+p-1][2]

                //get the coords of the last attractor
                var a2x = points.path[points.start+p][3]
                var a2y = points.path[points.start+p][4]
                var prevp = points.path[points.start+p-2]
                var prevplen = points.path[points.start+p-2].length

                //double the length of the first attractor
                a1x = prevp[prevplen-2] + (a1x - prevp[prevplen-2]) * 2
                a1y = prevp[prevplen-1] + (a1y - prevp[prevplen-1]) * 2

                //double the length of the last attractor
                a2x = points.path[points.start+p][5] + (a2x - points.path[points.start+p][5]) * 2
                a2y = points.path[points.start+p][6] + (a2y - points.path[points.start+p][6]) * 2

                //replace the attractors for the point after the deleted one
                points.path[points.start+p][1] = a1x
                points.path[points.start+p][2] = a1y
                points.path[points.start+p][3] = a2x
                points.path[points.start+p][4] = a2y
            }

            points.path.splice(points.start+p-1,1);
            if(points.path[points.start+p-1]) {
              // We are deleting the only point from a subpath
              if(points.path[points.start+p-1][0].match(/z/i)) {
                points.path.splice(points.start+p-1,1);
              }
              else if(p == 1 && points.path[points.start+p-1][0] != 'M') {
                  //if we have to delete the first point, make sure that the new first point does not have attractors and begins with an M
                  if(points.path[points.start][0] == 'C'){
                      points.path[points.start][1] = points.path[points.start][5]
                      points.path[points.start][2] = points.path[points.start][6]
                      points.path[points.start].splice(3,4);
                  }
                  points.path[points.start][0] = 'M';
              }
            }
        }
        else if(selection.has(this)){ //there is a selection of points/hinges - group operation
            for(var i = 0; i < selectionno.length; i++){
                if(points.path[selectionno[i]-i][0] == 'M'){
                    if(points.path[selectionno[i]-i+1][0] == 'C'){
                        points.path[selectionno[i]-i+1][1] = points.path[selectionno[i]+1][5]
                        points.path[selectionno[i]-i+1][2] = points.path[selectionno[i]+1][6]
                        points.path[selectionno[i]-i+1].splice(3,4);
                    }
                    points.path[selectionno[i]-i+1][0] = 'M';
                }
                points.path.splice(selectionno[i]-i,1);
            }
            selection.clear();
            selectionno = [];
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
    var ini = {}, paracallback = false, parameters;
    newhinge.on('dragstart', function(event){
        disablePan();
        event.stopPropagation();
        event.preventDefault();
        ini.x = this.cx();
        ini.y = this.cy();
        if(SVG.get(global_oro_variables.selected.members[0].attr('selected')).parent.attr('type') == 'parametrizedGroup'){
            paracallback = true;
            parameters = Group.findOne({_id: SVG.get(global_oro_variables.selected.members[0].attr('selected')).parent.attr('id')}).parameters;
        }
    });
    newhinge.on('dragmove', function(event){
        if(points.subpath[p][0] == 'C'){ x = 5; y = 6; }
        else{ x = 1; y = 2; }

        if(attrs[p]){
            var dx = this.cx() - points.subpath[p][x];
            var dy = this.cy() - points.subpath[p][y];
            if(attrs[p].attr1){
                var n = attrs[p].attr1;
                var newx = points.subpath[n.p][n.x] + dx;
                var newy = points.subpath[n.p][n.y] + dy;
                points.subpath[n.p][n.x] = newx;
                points.subpath[n.p][n.y] = newy;
                attrs[p].attr1.attr.cx(newx).cy(newy);
                attrs[p].attr1.line.attr("x1", newx).attr("y1", newy).attr("x2", this.cx()).attr("y2", this.cy());
                points = updatePoint(points, n.p,n.x,n.y,id);
            }
            if(attrs[p].attr2){
                var n = attrs[p].attr2;
                var newx = points.subpath[n.p][n.x] + dx;
                var newy = points.subpath[n.p][n.y] + dy;
                points.subpath[n.p][n.x] = newx;
                points.subpath[n.p][n.y] = newy;
                attrs[p].attr2.attr.cx(newx).cy(newy);
                attrs[p].attr2.line.attr("x1", newx).attr("y1", newy).attr("x2", this.cx()).attr("y2", this.cy());
                points = updatePoint(points, n.p,n.x,n.y,id);
            }
        }
        points.subpath[p][x] = this.cx();
        points.subpath[p][y] = this.cy();
        points = updatePoint(points, p,x,y,id);
        SVG.get(id).plot(points.path);
        if(points.subpath[p-1] != 'null'){
            if(midds[p-1])
                positionMidd(midds[p-1], p-1, points);
            else
                positionMidd(midds[points.subpath.length-2], (points.subpath.length-2), points);
        }
        if(points.subpath[p+1] != 'null')
            positionMidd(midds[p], p, points);

        //if it had a startdrag event = it is the first moved hinge
        if(selection.has(this) && ini.x){
            var self = this;
            var difx = this.cx() - ini.x;
            var dify = this.cy() - ini.y;
            selection.each(function(i){
                if(self != this){
                    this.dmove(difx, dify);
                    this.fire('dragmove');
                }
            })
            ini.x = this.cx();
            ini.y = this.cy();
        }
        if(paracallback)
            window[parameters.callback](parameters);
    });
    newhinge.on('dragend', function(event){
        if(move != this.cx()){
            saveItemLocalisation(id);
            shift = false;
            rebuildSelectorPoints(id);
            if(selection.members && selection.members.length > 0)
                rebuildSelection();
            if(paracallback)
                window[parameters.callback](parameters, true);
        }
        ini = {};
        togglePanZoom();
        event.stopPropagation();
        event.preventDefault();
    });
    return newhinge;
}

positionMidd = function(newmidd, p, points){
    if(points.subpath[p][0] == 'C'){ var x = 5, y = 6; }
    else{ var x = 1, y = 2; }
    var point2 = points.subpath[p+1];
    if(point2 && point2 != 'null'){
        if(point2[0] == 'C'){
            var newseg = buildNewCurve({x: points.subpath[p][x], y: points.subpath[p][y]}, {x: point2[1], y: point2[2]}, {x: point2[3], y: point2[4]}, {x: point2[5], y: point2[6]}, 0.5)
            newmidd.cx(newseg[0][5]).cy(newseg[0][6]);
        }
        else{
            newmidd.cx((points.subpath[p][x]+point2[1])/2).cy((points.subpath[p][y]+point2[2])/2);
        }
        /*
        if(point2[0] == 'M')
            point2[0] = 'L';
        var temppath = SVG.get(Session.get('fileId')).path([[ 'M', points.subpath[p][x], points.subpath[p][y] ], point2 ]);
        var p = temppath.pointAt(temppath.length() / 2);
        newmidd.cx(p.x).cy(p.y);
        temppath.remove();*/
    }
    else
        newmidd.remove()
}

buildMidd = function(p, points, hinge, midd, attr, id, hinges, midds, attrs, no){
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

            //before middpoint and after;
            var p0 = points.path[points.start+p-1]
            var p2 = points.path[points.start+p]

            var p00 = points.subpath[p]
            var p22 = points.subpath[p+1]

            //if it is already a curve use buildNewCurve algorithm else put it in the middle
            if(p2[0] == 'C'){

                var newseg = buildNewCurve({x: p0[p0.length-2], y: p0[p0.length-1]}, {x: p2[1], y: p2[2]}, {x: p2[3], y: p2[4]}, {x: p2[5], y: p2[6]}, 0.5)
                var newsegsubp = buildNewCurve({x: p00[p00.length-2], y: p00[p00.length-1]}, {x: p22[1], y: p22[2]}, {x: p22[3], y: p22[4]}, {x: p22[5], y: p22[6]}, 0.5)

                //add new point and replace point after midd with a new one with correct attractors
                points.subpath.splice(p+1, 1, newsegsubp[0], newsegsubp[1]);
                points.path.splice(points.start+p, 1, newseg[0], newseg[1]);
            }
            else{
                //add new point and replace point after midd with a new one with correct attractors
                points.subpath.splice(p+1, 1, ['C', p00[p00.length-2], p00[p00.length-1], this.cx(), this.cy(), this.cx(), this.cy()], ['C', this.cx(), this.cy(), p22[1], p22[2], p22[1], p22[2]]);
                points.path.splice(points.start+p, 1, ['C', p0[p0.length-2], p0[p0.length-1], pp[0], pp[1], pp[0], pp[1]], ['C', pp[0], pp[1], p2[1], p2[2], p2[1], p2[2]]);
            }

            //build new attractors
            attrs[p] = buildAttractors(p,points, hinge, attr, id, attrs, midds);
            attrs[p+1] = buildAttractors(p+1,points, hinge, attr, id, attrs, midds);
            attrs[p+2] = buildAttractors(p+2,points, hinge, attr, id, attrs, midds);
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

buildSubPathPoints = function(points, hinge, midd, attr, id, hinges, midds, attrs, no, startlines){
    if(points.subpath[points.subpath.length-1][0].match(/z/i)){
        points.subpath.splice(0,0,points.subpath[points.subpath.length-2])
        points.subpath.splice(points.subpath.length-1,1,points.subpath[1])
    }
    else{
        points.subpath.splice(0,0,'null')
        points.subpath.push('null')
    }

    for(p = 1; p < points.subpath.length-1; p++){
        hinges[p] = buildHinge(p, points, hinge, midd, attr, id, hinges, midds, attrs, no);
        midds[p] = buildMidd(p, points, hinge, midd, attr, id, hinges, midds, attrs, no);
    }
    if(points.subpath[points.subpath.length-1] == 'null')
        midds[points.subpath.length-2].remove();
    if(points.subpath[2] != 'null') {
      var startl = [['M', points.subpath[1][1], points.subpath[1][2]], points.subpath[2]]
      startlines[no] = SVG.get('startLines').path(startl).stroke({color: '#007fff', width: 3}).fill('none').opacity(0.6).attr("id", "startLine_"+no).attr('hingeM', hinges[1].attr('id')).attr('hinge2', hinges[2].attr('id'));
    }
}
allpoints = [];
subpaths = []
buildSelectorPoints = function(id){
    baselinePoints = [];
    var allhinges = [], allmidds = [], allattrs = [], startlines = [];
    subpaths = getSubPaths(SVG.get(id));

    var selector = SVG.get("svgEditor").group().attr("id", "box_"+id).attr("selected", id).attr("type", 'pathPoints');
    var midd = selector.group().attr("id", "middPoints");
    var hinge = selector.group().attr("id", "hingePoints");
    var attr = selector.group().attr("id", "attrPoints");
    var startline = selector.group().attr("id", "startLines");
    for(var p in subpaths){
        allhinges[p] = [];
        allmidds[p] = [];
        allattrs[p] = [];
        subpaths[p].subpath = transformPath(subpaths[p].subpath, id);
        buildSubPathPoints(subpaths[p], hinge, midd, attr, id, allhinges[p], allmidds[p], allattrs[p], p, startlines);
        allpoints[p] =  allhinges[p].concat(allmidds[p]).concat(allattrs[p]);
    }
    createbaselinePoints();
    positionSelectorPoints(subpaths);
    return selector;
}

rebuildSelectorPoints = function(id){
    global_oro_variables.selected.members.splice(global_oro_variables.selected.members.indexOf(SVG.get('box_'+id)),1);
    if(SVG.get('box_'+id))
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
    for(i in allpoints){
        var startl = [[],[]];
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
                    if(allpoints[i][p].attr1.p == 2)
                        startl[1].splice(3, 0, pp[0], pp[1])
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
                    if(allpoints[i][p].attr2.p == 2){
                        startl[1][0] = 'C'
                        startl[1].splice(1, 0, pp[0], pp[1])
                    }
                }
            }
            else{
                var pp = [clone(baselinePoints[i][p][0]), clone(baselinePoints[i][p][1])];
                pp = transformPoint(pp[0], pp[1], [view]);
                allpoints[i][p].cx(pp[0]).cy(pp[1]);

                if(allpoints[i][p-1] && allpoints[i][p-1].attr("hingeM")){
                    startl[0] = ['M', allpoints[i][p-1].cx(), allpoints[i][p-1].cy()];
                    startl[1] = ['L', pp[0], pp[1]];
                }

                if(subpaths && subpaths[i]){
                    if(allpoints[i][p].attr("type") == "hinge"){
                        if(subpaths[i].subpath[p][0] != 'C'){
                            subpaths[i].subpath[p][1] = pp[0];
                            subpaths[i].subpath[p][2] = pp[1];
                        }
                        else{
                            subpaths[i].subpath[p][5] = pp[0];
                            subpaths[i].subpath[p][6] = pp[1];
                        }
                    }
                }
            }
        }
        if(SVG.get('startLine_'+i))
          SVG.get('startLine_'+i).plot(startl);
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
        console.orolog(global_oro_variables.selected.members.length);
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
                                console.orolog(m+"multiple_" + type);
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
    global_oro_variables.gui = new dat.GUI({width: 175});
    if(global_oro_variables.selected === undefined || global_oro_variables.selected.members.length == 0)
        buildDatGui(global_oro_variables.gui);
    else{
        var item = SVG.get(global_oro_variables.selected.members[0].attr("selected"));
        if(item.attr('type') != 'layer'){
            if(global_oro_variables.selected.members.length > 1){
                var mb = global_oro_variables.selected.members;
                var type = item.attr("type");
                var no = 0;
                for(i in mb){
                    if(type != SVG.get(mb[i].attr("selected")).attr("type"))
                        if(SVG.get(mb[i].attr("selected")).type != 'path')
                            type = "multiple_subjects";
                        else
                            type = 'multiple_paths';
                    no ++;
                }
            }
            else
                var type, no;
            buildDatGui(global_oro_variables.gui, item, type, no);
        }
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
        if(p[p.length-1][0].match(/z/i))
            upd.closed = 'true';
        else
            upd.closed = 'false';
    }
    else if(item.attr("type") == "text")
            val = item.attr('x') + ',' + item.attr('y');
    else if(item.attr("type") == "rasterImage" || item.attr("type") == 'formulae' || item.attr('type') == 'qrcode')
            val = item.x() + ',' + item.y() + ',' + item.width() + ',' + item.height();
    else if(['embeddedHtml', 'markdown', 'embeddediFrame', 'embeddedCanvas'].indexOf(item.attr("type")) != -1)
        val = [item.attr("x"), item.attr("y"), item.attr("width"), item.attr("height")].join(',');

    upd["pointList"] = val;
    console.orolog('saveItemLocalisation: ' + JSON.stringify(upd))
    //Meteor.call('update_document', "Item", id, upd);
    oro.wraps.update_document("Item", id, upd);
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
            if(palette.fillColor.substring(0,1) == "#" || palette.fillColor.indexOf('url') != -1)
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
    else if(item.attr("type") == "rasterImage" || item.attr("type") == 'formulae' || item.attr("type") ==
            'qrcode'){
            points = points.split(",");
            item.move(points[0],points[1]).size(points[2],points[3]);
        }
    else if(item.attr("type") == "embeddediFrame"){
            points = points.split(",");
            item.attr("x", points[0]).attr("y", points[1]).attr("width", points[2]).attr("height", points[3]);
            item.node.childNodes[0].setAttribute("width",points[2]);
            item.node.childNodes[0].setAttribute("height",points[3]);
        }
    else if(item.attr("type") == "embeddedHtml" || item.attr("type") == 'markdown'){
            points = points.split(",");
            item.attr("x", points[0]).attr("y", points[1]).attr("width", points[2]).attr("height", points[3]);
        }
        else
            {
            if(item.attr("type") == 'simple_path' || item.attr("type") == 'pathEquation' || item.attr("type") == 'pathEquationPolar')
                if(item.attr("closed") == "true")
                    points = split_oro_path_points(points);
                else
                    points = split_oro_path_points(points, true);
            item.plot(points);

        }
    if(SVG.get("box_"+item.attr("id")))
        positionSelector(item.attr("id"));
    if(SVG.get("locked_"+item.attr("id")))
        positionSelectorL(item.attr("id"));
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
    console.orolog(fields);
    var item = SVG.get(id);
    if(fields.groupId){
        if(SVG.get(fields.groupId)){
            deleteItem(id);
            build_item(SVG.get(fields.groupId), Item.findOne({_id: id}));
        }
    }
    if(fields.type){
        if(fields.groupId)
            if(SVG.get(fields.groupId))
                var parent = SVG.get(fields.groupId);
            else
                console.orolog('parent group does not exist');
        else
            var parent = item.parent;
        if(SVG.get('box_'+id))
            var selectortype = SVG.get('box_'+id).attr('type');
        deleteItem(id);
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
                else if(item.attr("type") == 'image')
                    item.attr("href", fields.text);
                else if(item.attr("type") == 'embeddediFrame'){
                    item.attr("src", fields.text);
                    item.node.childNodes[0].setAttribute("src", fields.text);
                }
                else if(item.attr("type") == 'embeddedHtml'){
                    $(item.node).html('');
                    item.appendChild("div", {innerHTML: fields.text});
                }
                else if(item.attr('type') == 'markdown'){
                    Blaze.remove(global_oro_variables.templates['markdownTemplate']);
                    $.ajax({
                        url: fields.text,
                        success: function(data){
                            global_oro_variables.templates['markdownTemplate'] = Blaze.renderWithData(Template.markdownTemplate, {markdowndata: data}, document.getElementById("markdown_"+item.attr('id')));
                        }
                    });
                }
            }
            if(fields.pointList)
                updatePointList(item, fields.pointList);
            if(fields.groupId && SVG.get(fields.groupId))
                SVG.get(fields.groupId).add(SVG.get(id));
            if(fields.closed){
                var p = SVG.get(id).array.value;
                if(fields.closed == 'true' && !p[p.length-1][0].match(/z/i)){
                    p.push(['Z']);
                    SVG.get(id).plot(p).attr("closed", "true");
                }
                if(fields.closed == 'false' && p[p.length-1][0].match(/z/i)){
                    p.pop();
                    SVG.get(id).plot(p).attr("closed", "false");
                }
            }
    }
    if(SVG.get(id).parent.attr('type') == 'parametrizedGroup'){
        var parameters = Group.findOne({_id: SVG.get(id).parent.attr('id')}).parameters;
        window[parameters.callback](parameters);
    }
}

deleteItem = function(id){
    if(SVG.get("box_"+id)){
        var index = global_oro_variables.selected.members.indexOf(SVG.get("box_"+id));
        global_oro_variables.selected.members.splice(index,1);
        SVG.get("box_"+id).remove();
    }
    if(SVG.get(id))
        SVG.get(id).remove();
    if(Session.get('lockedItems').indexOf(id) != -1){
        if(SVG.get("locked_"+id))
            SVG.get("locked_"+id).remove();
        var locked = Session.get('lockedItems');
        locked.splice(Session.get('lockedItems').indexOf(id), 1);
        Session.set('lockedItems',locked);
    }
}//AvDz3vDKfHNrvQmv8
//7hEyLpyzi2nhouZDZ
//FdYetbAzv6t3JAXKr //gr

deselectItem = function(id, notremove){
    if(SVG.get("box_"+id)){
        var index = global_oro_variables.selected.members.indexOf(SVG.get("box_"+id));
        if( index != -1){
            SVG.get(id).draggable();
            SVG.get(id).fixed();
            global_oro_variables.selected.members.splice(index,1);
            SVG.get("box_"+id).remove();
            if(SVG.get(id).attr("type") != 'simpleGroup')
                Meteor.call('update_document', 'Item', id, {selected: 'null'});
            else{
                Meteor.call('update_document', 'Group', id, {selected: 'null'});
                if(SVG.get(id).attr('locked') && SVG.get(id).attr('locked') != 'null'){
                    var ids = SVG.get(id).attr('locked').split(',')
                    Meteor.call('update_collection', 'Item', ids, {selected: 'null'});
                    for(var i = 0; i < ids.length; i++){
                        SVG.get(ids[i]).draggable();
                        SVG.get(ids[i]).fixed();
                    }
                }
            }
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
    Meteor.call('update_collection', 'Item', ids, {selected: Meteor.userId() || 'unkown'});
    Meteor.call('update_collection', 'Group', ids, {selected: Meteor.userId() || 'unkown'});
}

unlockItems = function(){
    var items = Item.find({selected: { $ne: 'null' }}).fetch();
    var groups = Group.find({selected: { $ne: 'null' }}).fetch();
    var ids = [], idsg = [];
    for(i in items)
        ids.push(items[i]._id);
    if(ids.length > 0)
        Meteor.call('update_collection', 'Item', ids, {selected: 'null'});
    for(i in groups)
        idsg.push(groups[i]._id);
    if(idsg.length > 0)
        Meteor.call('update_collection', 'Group', idsg, {selected: 'null'});
}

select_item = function(id, multiple){
    console.orolog('start select item');
    var type = SVG.get(id).attr("type");
    if(['para_simple_path', 'para_complex_path', 'embeddedCanvas', 'pathEquation', 'pathEquationPolar'].indexOf(type) == -1 && !multiple && SVG.get(id).attr('role') != 'connector'){
        var results = buildSelector(id, type);
        SVG.get(id).draggable();
    }
    else
        var results = buildSelectorSimple(id);
    if(multiple)
        SVG.get(id).draggable();
    //add selector to global set and set Session to know that there are selected objects
    global_oro_variables.selected.add(results);
    Session.set("selected", "true");
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
    else if(type == 'rasterImage' || type == 'formulae' || type == 'qrcode'){
            var points = split_oro_points(it.pointList);
            var item = g["image"](it.text).attr("id", it._id).move(points[0],points[1]).size(points[2],points[3]);
            if(type == 'qrcode')
                item.attr('linkto', decodeURI(it.text.slice(it.text.indexOf('chl=')+4, it.text.indexOf('&choe'))))
    }
    else if(type == 'simple_path'|| type == 'para_simple_path'){
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
    else if(type == 'complex_path' || type == 'para_complex_path'){
            var item = g.path(it.pointList).attr("id",it._id);
    }
    else if(type == 'embeddediFrame' || type == 'embeddedCanvas'){
            var points = split_oro_points(it.pointList);
            var item = g.foreignObject(points[2],points[3]).attr("id", it._id).move(points[0], points[1]);
            if(type == 'embeddediFrame')
                item.appendChild('iframe', {id: 'embeddediFrame_'+it._id, src: it.text, frameborder: "0", xmlns:"http://www.w3.org/1999/xhtml", width: points[2], height: points[3]});
            if(type == 'embeddedCanvas')
                item.appendChild('canvas', {id: 'embeddedCanvas_'+it._id, width: points[2], height: points[3]});
    }
    else if(type == 'embeddedHtml'){
            var points = split_oro_points(it.pointList);
            var item = g.foreignObject(points[2],points[3]).attr("id", it._id).move(points[0], points[1]).appendChild("div", {id: "html_"+it._id, innerHTML: it.text});
    }
    else if(type == 'markdown'){
            var points = split_oro_points(it.pointList);
            var item = g.foreignObject(points[2],points[3]).attr("id", it._id).move(points[0], points[1]).appendChild("div", {id: "markdown_"+it._id});
            console.orolog(it.text);
            $.ajax({
                url: it.text,
                success: function(data){
                    console.orolog('success')
                    global_oro_variables.templates['markdownTemplate'] = Blaze.renderWithData(Template.markdownTemplate, {markdowndata: data}, document.getElementById("markdown_"+it._id));
                }
            });
    }
    else if(type == 'nestedSvg'){
            var points = split_oro_points(it.pointList);
            var item = g.nested().attr("id", it._id).attr("x", points[0]).attr("y", points[1]).attr("width", points[2]).attr("height", points[3]);
    }
    else if(type == 'pathEquation' || type == 'pathEquationPolar'){
        var item = window[it.parameters.callback](it);
        item.attr("id", it._id);
    }
    if(type == 'gradient'){
        var item = window[it.parameters.callback](it);
    }
    else{
        item.attr("type", it.type);
        if(it.locked)
            item.attr('locked', it.locked)
        else
            item.attr('locked', 'null');
        if(it.selected)
            item.attr('selected', it.selected)
        else
            item.attr('selected', 'null');
        if(type != 'textPath')
            updatePalette(item, it.palette);
        if(it.linkto)
            item.attr('linkto', it.linkto)
        item.on('click', function(event){
            var it = Item.findOne({_id: this.attr("id")});
            //see if the item is used by another user
            var locked = false;
            if(it.selected)
                if(it.selected != 'null' && it.selected != Meteor.userId())
                    var locked = true;
            //if the element is not locked inside a group (can move on its own)
            if(!it.locked || it.locked == 'null'){
                //if the item can be edited and is not locked
                if(this.parent.parent.attr("type") != "menu_button" && this.parent.attr("type") != "linkedGroup" && locked == false && Session.get("enableEdit") == 'true' && (!this.attr('role') || this.attr('role') != 'label')){
                    var box = this.bbox();
                    var dragg = this.attr("type");
                    //if multiple items are selected
                    if (event.shiftKey) {
                        var index = global_oro_variables.selected.members.indexOf(SVG.get("box_"+this.attr("id")));
                        //if the click event was ment for deselecting the item, deselect; otherwise, select
                        if( index != -1){
                            this.fixed();
                            var id = global_oro_variables.selected.members[index].attr("id");
                            SVG.get(id).remove();
                            global_oro_variables.selected.members.splice(index,1);
                            if(global_oro_variables.selected.members.length == 1){
                                var itemid = global_oro_variables.selected.members[0].attr('selected');
                                deselect();
                                select_item(itemid);
                            }
                        }
                        else{
                            if(global_oro_variables.selected.members.length == 1)
                                if(global_oro_variables.selected.members[0].attr("type") != "simple"){
                                    var itemid = global_oro_variables.selected.members[0].attr("selected");
                                    SVG.get('box_'+itemid).remove();
                                    global_oro_variables.selected.members[0] = buildSelectorSimple(itemid);
                                }
                            if(global_oro_variables.selected.members.length == 0)
                                select_item(this.attr("id"));
                            else{
                                var results = buildSelectorSimple(this.attr("id"));
                                global_oro_variables.selected.add(results);
                                this.draggable();
                                Session.set("selected", "true");
                            }
                        }
                    }
                    else{//only this item should be selected
                            deselect();
                            select_item(this.attr("id"));
                    }
                    //showMenu();
                    showDatGui();
                    markSelected();
                }
            }
            else if(this.parent.attr('type') != 'layer'){
                deselect();
                if(!SVG.get('box_'+item.attr('locked'))){
                    var results = buildSelector(item.attr('locked'), 'simpleGroup');
                    global_oro_variables.selected.add(results);
                    Session.set("selected", "true");
                }
                this.draggable();
                showDatGui();
                markSelected();
            }
        });
        var groupids, ini = {};
        item.on('mousedown', function(event){
            if(selectionno.length > 0){
                ini.x = this.x();
                ini.y = this.y();
            }
        });
        item.on('beforedrag', function(event){
            disablePan();
            event.stopPropagation();
            event.preventDefault();
        });
        var dif, paracallback = false, parameters;
        item.on('dragstart', function(event){
                disablePan();
                event.stopPropagation();
                event.preventDefault();
            if(!this.attr('role') || this.attr('role') != 'label'){
                //groupids are actually groups/items in the locked group
                if(this.attr('locked') != 'null')
                    groupids = SVG.get(this.attr('locked')).attr('locked').split(',');
                var invview = SVG.get('viewport').node.getCTM().inverse();
                var invmatrix = SVG.get(this.attr('id')).node.getCTM().inverse();
                var p = transformPoint(event.detail.event.clientX, event.detail.event.clientY, [invview, invmatrix]);
                if(!groupids)
                    dif = {x: p[0]-this.x(), y: p[1] - this.y()}
                else{
                    dif = [];
                    for(var i = 0; i < groupids.length; i++)
                        dif[i] = {x: p[0] - SVG.get(groupids[i]).x(), y: p[1] - SVG.get(groupids[i]).y()}
                }
                if(ini.x){
                    console.orolog('bubble');
                    var self = this;
                    //selection.each(function(i){
                    global_oro_variables.selected.each(function(i){
                        var elem = SVG.get(this.attr('selected'));
                        if(self != elem){
                            //this.fire('dragstart', {event: {clientX: event.detail.event.clientX, clientY: event.detail.event.clientY}});
                            elem.fire('dragstart', {event: {clientX: event.detail.event.clientX, clientY: event.detail.event.clientY}});
                        }
                    })
                }
                if(this.parent.attr('type') == 'parametrizedGroup'){
                    paracallback = true;
                    parameters = Group.findOne({_id: SVG.get(global_oro_variables.selected.members[0].attr('selected')).parent.attr('id')}).parameters;
                }
            }
        });
        item.on('dragmove', function(event){
            if(!this.attr('role') || this.attr('role') != 'label'){
                var invview = SVG.get('viewport').node.getCTM().inverse();
                var invmatrix = SVG.get(this.attr('id')).node.getCTM().inverse();
                var p = transformPoint(event.detail.event.clientX, event.detail.event.clientY, [invview, invmatrix]);
                if(!groupids || !SVG.get('box_'+this.attr('locked'))){
                    this.move(p[0]-dif.x, p[1]-dif.y);
                    positionSelector(this.attr("id"));
                }
                else{
                    for(var i = 0; i < groupids.length; i++)
                        SVG.get(groupids[i]).move(p[0] - dif[i].x, p[1] - dif[i].y);
                    positionSelector(this.attr('locked'));
                }
                if(ini.x){
                    console.orolog('bubble');
                    var self = this;
                    var difx = self.x() - ini.x;
                    var dify = self.y() - ini.y;
                    //selection.each(function(i){
                    global_oro_variables.selected.each(function(i){
                        var elem = SVG.get(this.attr('selected'));
                        if(self != elem){
                            //this.dmove(difx, dify);
                            //this.fire('dragmove', {event: {clientX: event.detail.event.clientX, clientY: event.detail.event.clientY}});
                            elem.dmove(difx, dify);
                            elem.fire('dragmove', {event: {clientX: event.detail.event.clientX, clientY: event.detail.event.clientY}});
                        }
                    })
                    ini.x = self.x();
                    ini.y = self.y();
                }
                if(paracallback)
                    window[parameters.callback](parameters);
            }
        });
        item.on('dragend', function(event){
            if(!this.attr('role') || this.attr('role') != 'label'){
                if(!groupids || !SVG.get('box_'+this.attr('locked'))){
                    positionSelector(this.attr("id"));
                    saveItemLocalisation(this.attr("id"));
                }
                else{
                    positionSelector(this.attr('locked'));
                    for(var i = 0; i < groupids.length; i++)
                        saveItemLocalisation(groupids[i]);
                    groupids = null;
                }
                if(ini.x){
                    console.orolog('bubble');
                    var self = this;
                    //selection.each(function(i){
                    global_oro_variables.selected.each(function(i){
                        var elem = SVG.get(this.attr('selected'));
                        if(self != elem){
                            //this.fire('dragend');
                            elem.fire('dragend');
                        }
                    })

                    ini = {};
                }
                if(paracallback)
                    window[parameters.callback](parameters, true);
            }
            togglePanZoom();
            event.stopPropagation();
            event.preventDefault();
        });
    }

    return item;
}

removeItem = function(id){
    Meteor.call('remove_document', 'Item', id);
}

removeGroup = function(id, deep, callb){
    if(deep){
        var items = Item.find({groupId: id}).fetch();
        for(i in items)
            removeItem(items[i]._id);
        var subgroups = Group.find({groupId: id}).fetch();
        for(g in subgroups)
            removeGroup(subgroups[g]._id);
        var deps = Dependency.find({$or: [{fileId1: id}, {fileId2: id}] }).fetch();
        for(d in deps)
            Meteor.call('remove_document', 'Dependency', deps[d]._id);
    }
    Meteor.call('remove_document', 'Group', id, function(err, res){
        if(err)
            console.orolog(err)
        if(res)
            if(callb)
                callb(res)
    });
}

removeFile = function(id, callb){
    var groups = Group.find({fileId: id}).fetch();
    for(g in groups)
        removeGroup(groups[g]._id);
    var deps = Dependency.find({$or: [{fileId1: id}, {fileId2: id}] }).fetch();
    for(d in deps)
        Meteor.call('remove_document', 'Dependency', deps[d]._id);
    Meteor.call('remove_document', 'File', id, function(err, res){
        if(err)
            console.orolog(err)
        if(res)
            if(callb)
                callb(res)
    });
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
            console.orolog(JSON.stringify(all));
            for(i in all){
                if(all[i].pointList)
                    build_item(g, all[i]);
                else
                    recursive_group_client(g, all[i]);
            }
        }*/
    }
    return g;
}

recursive = 0;
recursive_group_client = function (parent, group, linkedgs){
    //console.orolog("recursive: ", recursive);
    //if(recursive > 500) return;
    //recursive = recursive + 1;
    var subgroups = Group.find({ groupId: group._id }, { sort: { ordering:1 }}).fetch();
    var subparent = parent.group().attr("id", group._id).attr("type", group.type);
    if(group.uuid)
        subparent.attr("function", group.uuid);
    if(group.transparency)
        subparent.opacity(group.transparency);
    if(group.locked)
        subparent.attr('locked', group.locked)
    else
        subparent.attr('locked', 'null');
    if(group.selected)
        subparent.attr('selected', group.selected)
    else
        subparent.attr('selected', 'null');
    // todo: if linked groups, ordering should include them
    //if(parent.get(group.ordering) && parent.get(group.ordering) != subparent){
        //subparent.before(parent.get(group.ordering));
    //    parent.each(function(i,children){
    //        if(parent.index(this) == group.ordering && this != subparent)
    //            this.front();
    //    });
    //}

    //not anymore ?
    /*
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
    }*/
/*
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
    else*/
        build_group_client(subparent, group); // ,subgroups
    /*
    if(group.type == "menu"){
        //id for menu_group.common: Fzs7EZBDemi6kXphg
        // id for menu_group.groups.common: P7wBvphshf745AWEN
        //id for menu_group.multiple.common: pW4eF4gT67dYk2zDo
        //id for menu_group.multiple_subjects: BzPQYeEQ4TtufSEnF
        var common_group = Group.findOne({uuid: group.uuid.substring(0,group.uuid.lastIndexOf('.'))+".common"});
        //console.orolog(group.uuid.substring(0,group.uuid.lastIndexOf('.'))+".common");
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
    else{*/
        for(g in subgroups){
            //if(recursive > 500) return;
            //recursive = recursive + 1;
            recursive_group_client(subparent, subgroups[g])//, linkedgroups); (!)if I use linkedgroups
        }
    //}
/*
    if(group.type == "menu_item"){
        subparent.on('click', function(event){
            this.fill({ color: '#f06' });
            if(this.attr("function").lastIndexOf('.') != -1)
                var func = this.attr("function").substring(this.attr("function").lastIndexOf('.')+1);
            else
                var func = this.attr("function");
            console.orolog(func);
            window[func](this, event);
        });
    }
*/
    if(group.transform)
        subparent.transform("matrix",group.transform);
/*
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
    }*/
    if(group.parameters && group.parameters.callback)
        window[group.parameters.callback](group.parameters);
    return subparent;

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
    //console.orolog(path.attr("name") + " should have no_of_points: ", no_of_points);
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
    //console.orolog("COMPLEXITY: "+path.attr("name") + ": " + complexity);
    return complexity;
}


function a2c(x1, y1, rx, ry, angle, large_arc_flag, sweep_flag, x2, y2, recursive) {
        // https://github.com/adobe-webplatform/Snap.svg/blob/master/src/path.js
        // for more information of where this math came from visit:
        // http://www.w3.org/TR/SVG11/implnote.html#ArcImplementationNotes
        var PI = Math.PI;
        var _120 = PI * 90 / 180, //120 initial
            rad = PI / 180 * (+angle || 0),
            res = [],
            xy,
            rotate = function (x, y, rad) {
                var X = x * Math.cos(rad) - y * Math.sin(rad),
                    Y = x * Math.sin(rad) + y * Math.cos(rad);
                return {x: X, y: Y};
            };
        if (!recursive) {
            xy = rotate(x1, y1, -rad);
            x1 = xy.x;
            y1 = xy.y;
            xy = rotate(x2, y2, -rad);
            x2 = xy.x;
            y2 = xy.y;
            var cos = Math.cos(PI / 180 * angle),
                sin = Math.sin(PI / 180 * angle),
                x = (x1 - x2) / 2,
                y = (y1 - y2) / 2;
            var h = (x * x) / (rx * rx) + (y * y) / (ry * ry);
            if (h > 1) {
                h = Math.sqrt(h);
                rx = h * rx;
                ry = h * ry;
            }
            var rx2 = rx * rx,
                ry2 = ry * ry,
                k = (large_arc_flag == sweep_flag ? -1 : 1) *
                    Math.sqrt(Math.abs((rx2 * ry2 - rx2 * y * y - ry2 * x * x) / (rx2 * y * y + ry2 * x * x))),
                cx = k * rx * y / ry + (x1 + x2) / 2,
                cy = k * -ry * x / rx + (y1 + y2) / 2,
                f1 = Math.asin(((y1 - cy) / ry).toFixed(9)),
                f2 = Math.asin(((y2 - cy) / ry).toFixed(9));

            f1 = x1 < cx ? PI - f1 : f1;
            f2 = x2 < cx ? PI - f2 : f2;
            f1 < 0 && (f1 = PI * 2 + f1);
            f2 < 0 && (f2 = PI * 2 + f2);
            if (sweep_flag && f1 > f2) {
                f1 = f1 - PI * 2;
            }
            if (!sweep_flag && f2 > f1) {
                f2 = f2 - PI * 2;
            }
        } else {
            f1 = recursive[0];
            f2 = recursive[1];
            cx = recursive[2];
            cy = recursive[3];
        }
        var df = f2 - f1;
        if (Math.abs(df) > _120) {
            var f2old = f2,
                x2old = x2,
                y2old = y2;
            f2 = f1 + _120 * (sweep_flag && f2 > f1 ? 1 : -1);
            x2 = cx + rx * Math.cos(f2);
            y2 = cy + ry * Math.sin(f2);
            res = a2c(x2, y2, rx, ry, angle, 0, sweep_flag, x2old, y2old, [f2, f2old, cx, cy]);
        }
        df = f2 - f1;
        var c1 = Math.cos(f1),
            s1 = Math.sin(f1),
            c2 = Math.cos(f2),
            s2 = Math.sin(f2),
            t = Math.tan(df / 4),
            hx = 4 / 3 * rx * t,
            hy = 4 / 3 * ry * t,
            m1 = [x1, y1],
            m2 = [x1 + hx * s1, y1 - hy * c1],
            m3 = [x2 + hx * s2, y2 - hy * c2],
            m4 = [x2, y2];
        m2[0] = 2 * m1[0] - m2[0];
        m2[1] = 2 * m1[1] - m2[1];
        if (recursive) {
            return [m2, m3, m4].concat(res);
        } else {
            res = [m2, m3, m4].concat(res).join().split(",");
            var newres = [];
            for (var i = 0, ii = res.length; i < ii; i++) {
                newres[i] = i % 2 ? rotate(res[i - 1], res[i], rad).y : rotate(res[i], res[i + 1], rad).x;
            }
            return newres;
        }
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

//returns array of objects: {path, subpath, start, end}
getSubPaths = function(path){
    var arr = path.array.value;
    var newarr = [];
    for(i in arr){
        // If the subpath only has 1 point, don't add the Z - it hinders the edit points mode
        if(arr[i][0].match(/z/i) && newarr[newarr.length-1].subpath.length == 1) {
          continue;
        }
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
        //if(checkPathType(pathsArr[p]) == 'complex')
        //    simple = false;
        newarr = newarr.concat(pathsArr[p].array.valueOf());
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
    if(arr[arr.length-1][0].match(/z/i))
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
    if(arr[arr.length-1][0].match(/z/i))
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
    var delta = 4 * (Math.sqrt(2) - 1) / 3;
    var points =
        'M' + (x+w/2) + ' ' + y
            + 'C' + (x+w/2+rx*delta) + ' ' + y + ',' + (x+w) + ' ' + (y+h/2 -ry*delta) + ','
            + (x+w) + ' ' + (y+h/2)
            + 'C' + (x+w) + ' ' + (y+h/2+ry*delta) + ',' + (x+w/2+rx*delta) + ' ' + (y+h) + ','
            + (x+w/2) + ' ' + (y+h)
            + 'C' + (x+w/2-rx*delta) + ' ' + (y+h) + ',' + x + ' ' + (y+h/2+ry*delta) + ','
            + x + ' ' + (y+h/2)
            + 'C' + x + ' ' + (y+h/2-ry*delta) + ',' + (x+w/2-rx*delta) + ' ' + y + ','
            + (x+w/2) + ' ' + y + 'Z';

    return {pointList: points, type: "complex_path", parameters: {cx: cx, cy: cy, rx: rx, ry: ry, callback: ellipseToCPath}};
}

rectToPath = function rectToPath(rect){
    var x = rect.x(), y= rect.y(), w = rect.width(), h = rect.height();
    var params = {width: w, height: h, x: x, y: y, callback: rectToPath};
    if(rect.attr("rx")){
        var rx = Number(rect.attr("rx"));
        var ry = Number(rect.attr("ry"));
        var delta = 4 * (Math.sqrt(2) - 1) / 3;
        var points =
            'M'+ x + ' ' + (y+ry)
                + 'C' + x + ' ' + (y+ry-ry*delta) + ',' + (x+rx-rx*delta) + ' ' + y + ','
                + (x+rx) + ' ' + y + 'L'
                + (x+w-rx) + ' ' + y
                + 'C' + (x+w-rx+rx*delta) + ' ' + y + ',' + (x+w) + ' ' + (y+ry-ry*delta) + ','
                + (x+w) + ' ' + (y+ry) + 'L'
                + (x+w) + ' ' + (y+h-ry)
                + 'C' + (x+w) + ' ' + (y+h-ry+ry*delta) + ',' + (x+w-rx+rx*delta) + ' ' + (y+h) + ','
                + (x+w-rx) + ' ' + (y+h) + 'L'
                + (x+rx) + ' ' + (y+h)
                + 'C' + (x+rx-rx*delta) + ' ' + (y+h) + ',' + x + ' ' + (y+h-ry+ry*delta) + ','
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

insertItem = function(object, callb){
    Meteor.call('insert_document', 'Item', object, function(err, res){
        if(err) console.orolog(err);
        if(res){
            console.orolog(res);
            if(callb)
                callb(res)
        }
    });
}
insertGroup = function(object, callb){
    Meteor.call('insert_document', 'Group', object, function(err, res){
        if(err) console.orolog(err);
        if(res){
            console.orolog(res);
            if(callb)
                callb(res);
        }
    });
}

cloneItem = function cloneItem(it, groupId, locked, callb){
    console.orolog('cloneItem');
    if(typeof it === 'string')
        it = Item.findOne({_id: it});
    it.original = it._id;
    delete it._id;
    it.groupId = groupId;
    if(!locked || locked != 'false')
        if(it.locked && it.locked != 'null')
            it.locked = groupId;
        else
            it.locked = 'null'
    else
        it.locked = 'null'
    it.selected = 'null';
    if(!it.locked && it.parameters && it.parameters.parametrizedGroup)
        delete it.parameters.parametrizedGroup
    insertItem(it, callb);
    console.orolog('/cloneItem');
}

cloneGroup = function cloneGroup(gr, parentId, parent){
    console.orolog('cloneGroup');
    if(typeof gr === 'string')
        gr = Group.findOne({_id: gr});
    var no = Group.find({uuid: gr.uuid}).count();
    no++;
    var deps = Dependency.find({fileId1: gr._id, type: {$in:[2,3,5]} }).fetch();
    var groups = Group.find({groupId: gr._id}).fetch();
    var items = Item.find({groupId: gr._id}).fetch();
    var groupId = gr._id;
    gr.original = gr._id;
    delete gr._id;
    gr[parent] = parentId;
    gr.uuid = gr.uuid+String(no);
    gr.locked = 'null'
    gr.selected = 'null'
    insertGroup(gr, function(res){
        for(d in deps){
            deps[d].fileId1 = res;
            delete deps[d]._id;
            Meteor.call('insert_document', 'Dependency', deps[d]);
        }
        //var groups = Group.find({groupId: groupId}).fetch();
        //var items = Item.find({groupId: groupId}).fetch();
        console.orolog(JSON.stringify(items));
        for(g in groups)
            cloneGroup(groups[g], res, 'groupId');
        for(i in items)
            cloneItem(items[i], res);
    });

    console.orolog('/cloneGroup');
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
    console.orolog(obj);
    var delta = Math.sqrt(Math.sqrt(Math.sqrt(2)));
    var x = Number(obj.x), y = Number(obj.y), w = Number(obj.width), h = Number(obj.height), rx = Number(obj.rx), ry = Number(obj.ry);
    //if(typeof val != 'undefined' && obj.maintainRatio)
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
    console.orolog(obj);
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
    //console.orolog(it.text);
    /*
    $.ajax({
        url: it.text,
        success: function(data) {
            console.orolog(data);
        }
    });*/
/*
    $.get(it.text, function(data){
        console.orolog(data);
    })*/
}

paraTextPath = function(parameters, update){
    var obj = parameters.params;
    //console.orolog(obj);
    var path = SVG.get(obj.elements.path);
    var text = SVG.get(obj.elements.text);
    path.show();
    if(!text.textPath)
        text.path(path.attr('d'));
    else
        text.plot(path.attr('d'));
    if(!obj.visiblepath)
        path.hide();
    if(update){
        var output = SVG.get(path.parent.attr('id')).node.outerHTML;
        parameters.output = output;
        //Meteor.call('update_document', 'Group', path.parent.attr('id'), {parameters: parameters});
        oro.wraps.update_document('Group', path.parent.attr('id'), {parameters: parameters});
    }
}

paraPathOnPath = function(parameters, update){
    var obj = parameters.params;
    var epsilon = 1/Math.pow(10, 2),
        dist = 5,
        path1 = SVG.get(obj.elements.conductor),
        path2 = SVG.get(obj.elements.content),
        step = path1.length() / obj.repetitions,
        clones = [], points = [],
        //defs = path1.doc().defs().attr('id','pathOnPathDefs'),
        kids = path1.parent.children(),
        box, tmp, angle, center;
    if(!path2.visible())
        path2.show();
    if(!path1.visible())
        path1.show();
    //defs.add(path2);
    if(kids.length > 2){
        var len = kids.length;
        for(var i = 0; i < len; i++)
            if(kids[i] != path1 && kids[i] != path2){
                kids[i].remove();
                i--;
                len--;
            }
    }
    if(checkPathType(path2) == 'simple')
        var func = rotateSPath;
    else
        var func = rotateCPath
    for(var i = 0; i < obj.repetitions; i++){
        clones[i] = path2.clone();
        //clones[i] = parent.use(defs.first());
        box = clones[i].bbox();
        points[i] = path1.pointAt(step * i);
        if(i != 0){
            tmp = path1.pointAt(step * i - epsilon);
            angle = getAngle(points[i], tmp);
        }
        else{
            tmp = path1.pointAt(step * i + epsilon);
            angle = getAngle(tmp, points[i]);
        }
        angle = 0.5*Math.PI - (2*Math.PI - angle);
        center = rotate_point(points[i].x, points[i].y, angle, [points[i].x, points[i].y-dist-box.height])
        clones[i].cx(center[0]).cy(center[1]);
        func(clones[i], center[0], center[1], angle);
    }
    if(!obj.visibleconductor)
        path1.hide();
    else
        path1.show();
    if(!obj.visiblecontent)
        path2.hide();
    else
        path2.show();

    if(update){
        var output = SVG.get(path1.parent.attr('id')).node.outerHTML;
        parameters.output = output;
        //Meteor.call('update_document', 'Group', path1.parent.attr('id'), {parameters: parameters});
        oro.wraps.update_document('Group', path1.parent.attr('id'), {parameters: parameters});
    }
}

//spreadMethod: ["pad", "reflect", or "repeat"]
paraGradient = function(item){
    var elements = item.parameters.params.elements;
    if(!SVG.get(item._id)){
        var file = SVG.get(Session.get('fileId'));
        var gradient = file.gradient(item.parameters.params.type, function(stop){
            for(var i = 0; i < elements.length; i++)
                stop.at({offset: elements[i].offset, color: elements[i].color, opacity: elements[i].opacity});
        })
        gradient.attr({'id': item._id, 'type': 'gradient'});

        var no = SVG.get('gradientRects').children().length;
        var s = 40;
        var rect = SVG.get('gradientRects').path([['M', 0,0], ['L', s, 0], ['L', s, s], ['L', 0,s]]).attr('id', 'gradient_'+item._id).stroke({color: '#000', width: 0}).opacity(0.5).attr('gradient', item._id);
        rect.on('click', function(){
            if(global_oro_variables.selected.members && global_oro_variables.selected.members.length > 0){
                var item = SVG.get(global_oro_variables.selected.first().attr('selected'))
                if(item.type != 'g'){
                    var palette = Item.findOne({_id: item.attr('id')}).palette;
                    palette.fillColor = gradient.fill();
                    //Meteor.call('update_document', 'Item', item.attr('id'), {palette: palette});
                    oro.wraps.update_document('Item', item.attr('id'), {palette: palette});
                //item.fill(SVG.get(this.attr('gradient')));
                }
            }
            else{
                if(global_oro_variables.gui != undefined)
                    removeGui();
                global_oro_variables.gui = new dat.GUI({width: 175});
                buildDatGui(global_oro_variables.gui, gradient, 'gradient');
                //this.stroke({color: '#000000', width: 2});
            }
        }).on('mouseover', function(){
            this.opacity(1);
        }).on('mouseout', function(){
            this.opacity(0.5);
        })
        SVG.get('gradientRects').dy(1, SVG.get('gradientRects').y() - s);
    }
    else{
        var gradient = SVG.get(item._id);
        var rect = SVG.get('gradient_'+item._id);
        gradient.update(function(stop){
            for(var i = 0; i < elements.length; i++)
                stop.at({offset: elements[i].offset, color: elements[i].color, opacity: elements[i].opacity});
        })
    }
    gradient.from(item.parameters.params.x1, item.parameters.params.y1).to(item.parameters.params.x2, item.parameters.params.y2);
    if(item.parameters.params.radius)
        gradient.radius(item.parameters.params.radius)

    rect.fill(gradient);
    rect.dy(-s*no);

    return gradient;
}

pathEquation = function(item){
    var params = item.parameters.params
    var path = [], x, r;
    if(params.coordinates == 'polar')
        for(var i = params.minX; i < params.maxX; i = i + params.step){
            x = i;
            r = eval(params.fx);
            path.push(['L', params.oX + r * Math.cos(x) * params.scale, params.oY + r * Math.sin(x) * params.scale])
        }
    else
        for(var i = params.minX; i < params.maxX; i = i + params.step){
            x = i;
            path.push(['L', params.oX + i*params.scale, params.oY + eval(params.fx) * params.scale])
        }
    path[0][0] = 'M';

    if(SVG.get(item._id))
        var it = SVG.get(item._id).plot(path)
    else
        var it = SVG.get(item.groupId).path(path);

    return it
}
/*
pathEquationPolar = function(item){
    var params = item.parameters.params
    var path = [], θ, r;
    for(var i = params.minθ; i < params.maxθ; i = i + params.step){
        θ = i;
        r = eval(params.fx);
        path.push(['L', params.oX + r * Math.cos(θ) * params.scale, params.oY + r * Math.sin(θ) * params.scale])
    }
    path[0][0] = 'M';

    if(SVG.get(item._id))
        var it = SVG.get(item._id).plot(path)
    else
        var it = SVG.get(item.groupId).path(path);

    return it
}*/

/*
{
    callback: paraGradient,
    params: {
        type: "radial",
        cx: 0.5,
        cy: 0.5,
        r: 0.5,
        fx: 0.5,
        fy: 0.5,
        elements: [
            {
                offset: 0,
                color: '#000',
                opacity: 0.7
            },
            {
                offset: 1,
                color: '#FFF',
                opacity: 0.7
            }
        ]
    }
}
*/

pointSymmetry = function(parameters, update){
    var obj = JSON.parse(JSON.stringify(parameters.params));
    var path = SVG.get(obj.elements.path);

    var repsonturn = Math.ceil(obj.repetitions / obj.rotations);
    var box = path.bbox();
    var angle = 2*Math.PI / repsonturn,
        arrs = [], a, closed = false, paths = [],
        kids = path.parent.children(),
        dx = 0, dy = 0,
        dscale = 0.99 + obj.dscale*0.01,
        tempscale = 1,
        stringPathArray = JSON.stringify(path.array.valueOf());

    //obj.pointX = path.array.valueOf()[0][1] + obj.pointX
    //obj.pointY = path.array.valueOf()[0][2] + obj.pointY
    obj.pointX = box.x + obj.pointX
    obj.pointY = box.y + obj.pointY
/*
    if(SVG.get('pointSymmetry_'+obj.elements.path))
        SVG.get('pointSymmetry_'+obj.elements.path).remove()
    console.orolog(path)
    console.orolog(path.parent)
    var point = path.parent.circle(5).fill('#ce2525').stroke({color: '#ffffff', width: 1}).opacity(0.6);
    point.center(obj.pointX, obj.pointY).attr('id', 'pointSymmetry_'+obj.elements.path);
    console.orolog(point);
    */
    /*
    point.draggable();
    point.on('dragstart', function(){

    });
    point.on('dragend', function(){

    })
*/
    //remove symmetric elements when recalling the function
    if(kids.length > 1){
        var len = kids.length;
        for(var i = 0; i < len; i++)
            if(kids[i] != path){
                kids[i].remove();
                i--;
                len--;
            }
    }

    for(var r = 0 ; r < obj.repetitions-1; r++){
        closed = false;
        arrs[r] = JSON.parse(stringPathArray);
        a = angle * (r+1);
        tempscale = tempscale * dscale;
        for(var i = 0 ; i < arrs[r].length; i++){
            if(!arrs[r][i][0].match(/z/i)) {
                var len = arrs[r][i].length;
                if(tempscale > 0){
                    dx = obj.pointX - (obj.pointX - arrs[r][i][len-2]) * tempscale
                    dy = obj.pointY - (obj.pointY - arrs[r][i][len-1]) * tempscale
                }
                else{
                    dx = arrs[r][i][len-2]
                    dy = arrs[r][i][len-1]
                }
                var p = rotate_point(obj.pointX, obj.pointY, a, [dx, dy ])
                arrs[r][i][len-2] = p[0];
                arrs[r][i][len-1] = p[1];

                if(arrs[r][i][0] == 'C'){
                    if(tempscale > 0){
                        dx1 = obj.pointX - (obj.pointX - arrs[r][i][1]) * tempscale
                        dy1 = obj.pointY - (obj.pointY - arrs[r][i][2]) * tempscale
                        dx2 = obj.pointX - (obj.pointX - arrs[r][i][3]) * tempscale
                        dy2 = obj.pointY - (obj.pointY - arrs[r][i][4]) * tempscale
                    }
                    else{
                        dx1 = arrs[r][i][1]
                        dy1 = arrs[r][i][2]
                        dx2 = arrs[r][i][3]
                        dy2 = arrs[r][i][4]
                    }

                    var a1 = rotate_point(obj.pointX, obj.pointY, a, [dx1, dy1])
                    arrs[r][i][1] = a1[0];
                    arrs[r][i][2] = a1[1];

                    var a2 = rotate_point(obj.pointX, obj.pointY, a, [dx2, dy2])
                    arrs[r][i][3] = a2[0];
                    arrs[r][i][4] = a2[1];
                }
            }
            else {
              arrs[r][i][0] = 'Z';
            }
        }
        paths[r] = path.clone()
        //console.orolog('-----pointSymmetry result', r, JSON.stringify(arrs[r]))
        paths[r].plot(arrs[r]).attr('id', 'pointSymmetry_' + r);
    }

    if(update){
        var output = SVG.get(path.parent.attr('id')).node.outerHTML;
        parameters.output = output;
        //Meteor.call('update_document', 'Group', path.parent.attr('id'), {parameters: parameters});
        oro.wraps.update_document('Group', path.parent.attr('id'), {parameters: parameters});
    }
    return path.parent;
}

//old line symmetry
/*
lineSymmetry = function(parameters, update){
    var obj = JSON.parse(JSON.stringify(parameters.params));
    var path = SVG.get(obj.elements.path);
    var box = path.bbox();
    //relative points to path origin
    obj.pointX1 = box.x + obj.pointX1
    obj.pointY1 = box.y + obj.pointY1
    obj.pointX2 = box.x + obj.pointX2
    obj.pointY2 = box.y + obj.pointY2

    var repsonturn = Math.ceil(obj.repetitions / obj.rotations);
    var angle = 2*Math.PI / repsonturn,
        arrs = [], a, closed = false, paths = [],
        kids = path.parent.children(),
        dx = 0, dy = 0, bigx, bigy, x, y,
        dscale = 0.99 + obj.dscale*0.01,
        m1 = (obj.pointY2 - obj.pointY1) / (obj.pointX2 - obj.pointX1);
    if(m1){
        var b1 = obj.pointY1 - m1 * obj.pointX1,
            m2 = -1/m1, b2;
    }
    var dscale = 0;

    if(kids.length > 1){
        var len = kids.length;
        for(var i = 0; i < len; i++)
            if(kids[i] != path){
                kids[i].remove();
                i--;
                len--;
            }
    }

    for(var r = 0 ; r < obj.repetitions-1; r++){
        //closed = false;
        arrs[r] = JSON.parse(JSON.stringify(path.array.valueOf()));

        a = angle * (r+1);
        //dscale = dscale * dscale;
        for(var i = 0 ; i < arrs[r].length; i++){
            if(arrs[r][i][0] != 'Z'){
                var len = arrs[r][i].length;
                if(dscale > 0){
                    //console.orolog('dscale '+ dscale);
                    bigx = obj.pointX - arrs[r][i][len-2]
                    bigy = obj.pointY - arrs[r][i][len-1]
                    //dx = dx + bigx*(1-dscale)
                    //dy = dy + bigy*(1-dscale)
                    dx = dx + (bigx-dx)*(1-dscale)
                    dy = dy + (bigy-dy)*(1-dscale)
                }
                //console.orolog(dx);
                //console.orolog(dy);
                if(m1 != Infinity){
                    b2 = arrs[r][i][len-1] - m2 * arrs[r][i][len-2];
                    //console.orolog(b2);
                    x = (b2-b1) / (m1-m2);
                    y = m1 * x + b1;
                }
                else if(obj.pointX1 == obj.pointX2){
                    x = obj.pointX1;
                    y = arrs[r][i][len-1];
                }
                else if(obj.pointY1 == obj.pointY2){
                    x = arrs[r][i][len-2];
                    y = obj.pointY1;
                }
                //console.orolog(x);
                //console.orolog(y);
                var p = rotate_point(x, y, a, [arrs[r][i][len-2]+dx, arrs[r][i][len-1]+dy ])
                arrs[r][i][len-2] = p[0];
                arrs[r][i][len-1] = p[1];
                if(arrs[r][i][0] == 'C'){
                    if(m1 != Infinity){
                        b2 = arrs[r][i][2] - m2 * arrs[r][i][1];
                        x = (b2-b1) / (m1-m2);
                        y = m1 * x + b1;
                    }
                    else if(obj.pointX1 == obj.pointX2){
                        x = obj.pointX1;
                        y = arrs[r][i][2];
                    }
                    else if(obj.pointY1 == obj.pointY2){
                        x = arrs[r][i][1];
                        y = obj.pointY1;
                    }
                    var a1 = rotate_point(x, y, a, [arrs[r][i][1]+dx, arrs[r][i][2]+dy ])
                    arrs[r][i][1] = a1[0];
                    arrs[r][i][2] = a1[1];
                    if(m1 != Infinity){
                        b2 = arrs[r][i][4] - m2 * arrs[r][i][3];
                        x = (b2-b1) / (m1-m2);
                        y = m1 * x + b1;
                    }
                    else if(obj.pointX1 == obj.pointX2){
                        x = obj.pointX1;
                        y = arrs[r][i][4];
                    }
                    else if(obj.pointY1 == obj.pointY2){
                        x = arrs[r][i][3];
                        y = obj.pointY1;
                    }
                    var a2 = rotate_point(x, y, a, [arrs[r][i][3]+dx, arrs[r][i][4]+dy ])
                    arrs[r][i][3] = a2[0];
                    arrs[r][i][4] = a2[1];
                }
            }
        }
        paths[r] = path.clone()
        paths[r].plot(arrs[r]).attr('id', 'lineSymmetry_' + r);
    }

    if(update){
        var output = SVG.get(path.parent.attr('id')).node.outerHTML;
        parameters.output = output;
        Meteor.call('update_document', 'Group', path.parent.attr('id'), {parameters: parameters});
    }
    return path.parent;
}
*/

lineSymmetry = function(parameters, update){
    var obj = JSON.parse(JSON.stringify(parameters.params));
    var path = SVG.get(obj.elements.path);
    var box = path.bbox();
    //relative points to path origin
    obj.pointX1 = box.x + obj.pointX1
    obj.pointY1 = box.y + obj.pointY1
    obj.pointX2 = box.x + obj.pointX2
    obj.pointY2 = box.y + obj.pointY2

    var repsonturn = Math.ceil(obj.repetitions / obj.rotations);
    var angle = 2*Math.PI / repsonturn,
        paths = [path],
        kids = path.parent.children(),
        p

    obj.dscale = 0.99 + obj.dscale*0.01

    if(kids.length > 1){
        var len = kids.length;
        for(var i = 0; i < len; i++)
            if(kids[i] != path){
                kids[i].remove();
                i--;
                len--;
            }
    }

    for(var r = 0 ; r < obj.repetitions-1; r++){
        paths = simpleLineSymmetry(obj, paths)
        p = rotate_point(obj.pointX1, obj.pointY1, -angle, [ obj.pointX2, obj.pointY2 ])
        obj.pointX2 = p[0]
        obj.pointY2 = p[1]
    }

    if(update){
        var output = SVG.get(path.parent.attr('id')).node.outerHTML;
        parameters.output = output;
        //Meteor.call('update_document', 'Group', path.parent.attr('id'), {parameters: parameters});
        oro.wraps.update_document('Group', path.parent.attr('id'), {parameters: parameters});
    }
    return path.parent;
}

simpleLineSymmetry = function(obj, paths){
    var repetitions = 2
    var a = Math.PI,
        arrs = [], dx = 0, dy = 0, bigx, bigy, x, y,
        m1 = (obj.pointY2 - obj.pointY1) / (obj.pointX2 - obj.pointX1),
        tempscale = obj.dscale,
        cx, cy, b1, b2, m2,
        blindSpot = !m1 || m1 == Infinity || m1 == -Infinity

    if(!blindSpot){
        b1 = obj.pointY1 - m1 * obj.pointX1,
            m2 = -1/m1, b2;
    }

    for(var r = 0 ; r < repetitions-1; r++){
        arrs[r] = JSON.parse(JSON.stringify(paths[paths.length-1].array.valueOf()));
        //find perpendicular from path center to line for dscale
        if(tempscale > 1){
            var box = paths[paths.length-1].bbox()
            if(!blindSpot){
                b2 = box.cy - m2 * box.cx;
                cx = (b2-b1) / (m1-m2);
                cy = m1 * cx + b1;
            }
            else if(obj.pointX1 == obj.pointX2){
                cx = obj.pointX1;
                cy = box.cy
            }
            else if(obj.pointY1 == obj.pointY2){
                cx = box.cx
                cy = obj.pointY1;
            }
        }

        for(var i = 0 ; i < arrs[r].length; i++){
            if(arrs[r][i][0].match(/z/i)){
              arrs[r][i][0] = 'Z';
            }
            else {
                var len = arrs[r][i].length;

                if(!blindSpot){
                    b2 = arrs[r][i][len-1] - m2 * arrs[r][i][len-2];
                    x = (b2-b1) / (m1-m2);
                    y = m1 * x + b1;
                }
                else if(obj.pointX1 == obj.pointX2){
                    x = obj.pointX1;
                    y = arrs[r][i][len-1];
                }
                else if(obj.pointY1 == obj.pointY2){
                    x = arrs[r][i][len-2];
                    y = obj.pointY1;
                }

                if(tempscale > 1){
                    x = cx - (cx - x) * tempscale
                    y = cy - (cy - y) * tempscale
                    dx = x - (x - arrs[r][i][len-2]) * tempscale
                    dy = y - (y - arrs[r][i][len-1]) * tempscale
                }
                else{
                    dx = arrs[r][i][len-2]
                    dy = arrs[r][i][len-1]
                }
                var p = rotate_point(x, y, a, [dx, dy ])
                arrs[r][i][len-2] = p[0];
                arrs[r][i][len-1] = p[1];

                if(arrs[r][i][0] == 'C'){
                    if(!blindSpot){
                        b2 = arrs[r][i][2] - m2 * arrs[r][i][1];
                        x = (b2-b1) / (m1-m2);
                        y = m1 * x + b1;
                    }
                    else if(obj.pointX1 == obj.pointX2){
                        x = obj.pointX1;
                        y = arrs[r][i][2];
                    }
                    else if(obj.pointY1 == obj.pointY2){
                        x = arrs[r][i][1];
                        y = obj.pointY1;
                    }

                    if(tempscale > 1){
                        x = cx - (cx - x) * tempscale
                        y = cy - (cy - y) * tempscale
                        dx1 = x - (x - arrs[r][i][1]) * tempscale
                        dy1 = y - (y - arrs[r][i][2]) * tempscale
                    }
                    else{
                        dx1 = arrs[r][i][1]
                        dy1 = arrs[r][i][2]
                    }

                    var a1 = rotate_point(x, y, a, [dx1, dy1 ])
                    arrs[r][i][1] = a1[0];
                    arrs[r][i][2] = a1[1];

                    if(!blindSpot){
                        b2 = arrs[r][i][4] - m2 * arrs[r][i][3];
                        x = (b2-b1) / (m1-m2);
                        y = m1 * x + b1;
                    }
                    else if(obj.pointX1 == obj.pointX2){
                        x = obj.pointX1;
                        y = arrs[r][i][4];
                    }
                    else if(obj.pointY1 == obj.pointY2){
                        x = arrs[r][i][3];
                        y = obj.pointY1;
                    }

                    if(tempscale > 1){
                        x = cx - (cx - x) * tempscale
                        y = cy - (cy - y) * tempscale
                        dx2 = x - (x - arrs[r][i][3]) * tempscale
                        dy2 = y - (y - arrs[r][i][4]) * tempscale
                    }
                    else{
                        dx2 = arrs[r][i][3]
                        dy2 = arrs[r][i][4]
                    }

                    var a2 = rotate_point(x, y, a, [dx2, dy2 ])
                    arrs[r][i][3] = a2[0];
                    arrs[r][i][4] = a2[1];
                }
            }
        }
        paths[paths.length+r] = paths[paths.length-1].clone()
        paths[paths.length+r-1].plot(arrs[r]).attr('id', 'lineSymmetry_' + r);
    }

    return paths

}

itemArray = function(parameters, update){
    var obj = parameters.params;
    var path = SVG.get(obj.elements.path),
        clones = [],
        dx, dy, deltax, deltay,
        kids = path.parent.children();

    if(kids.length > 1){
        var len = kids.length;
        for(var i = 0; i < len; i++)
            if(kids[i] != path){
                kids[i].remove();
                i--;
                len--;
            }
    }

    for(var i = 0; i < obj.repetitionsY; i++){
        dy = obj.dy * i;
        deltax = obj.deltax * i
        if(i != 0)
            var start = 0;
        else
            var start = 1;
        for(var j = start; j < obj.repetitionsX; j++){
            clones[i*j+j] = path.clone();
            dx = obj.dx * j;
            deltay = obj.deltay * j
            clones[i*j+j].dmove(dx+deltax, dy+deltay);
        }
    }
    if(update){
        var output = SVG.get(path.parent.attr('id')).node.outerHTML;
        parameters.output = output;
        //Meteor.call('update_document', 'Group', path.parent.attr('id'), {parameters: parameters});
        oro.wraps.update_document('Group', path.parent.attr('id'), {parameters: parameters});
    }
    return path.parent;
}

sliceSPath = function(path, line){

    var cliptype = ClipperLib.ClipType.ctIntersection
    var result = pathArraySvgXY(path.array.valueOf());
    var box = path.bbox()
    var rect = path.parent.rect(box.width+100, box.height+100).move()

    var c = new ClipperLib.Clipper();
    c.AddPaths(result, ClipperLib.PolyType.ptSubject, true);
    c.AddPaths(points2, ClipperLib.PolyType.ptClip, true);
    var solution = new ClipperLib.Paths();
    c.Execute(cliptype, solution);
    result = solution;

    solution = JSON.stringify(pathArrayXYOro(result));
    var palette = Item.findOne({_id: SVG.get(elems[0].attr("selected")).attr("id")},{fields: {palette:1}}).pallette;
    var doc = {groupId: SVG.get(elems[0].attr("selected")).parent.attr("id"), type: "simple_path", pointList: solution, palette: palette};
    insertItem(doc);
}
/*
parameters: {
                callback: 'paraLabel',
                params: {
                    elements: {
                        label: id,
                        path: id,
                        text: id,
                        target: id
                    }
                }
            }
            x,y
*/
paraLabel = function(parameters, update){
    var label = SVG.get(parameters.params.label);
    SVG.get('labels').add(label);
    if(!parameters.params.x){

    }
}

paraQrCode = function(parameters, update){
    var obj = parameters.params
    //var path = SVG.get(obj.elements.path)
    if(SVG.get(obj.elements.group))
        SVG.get(obj.elements.group).clear();
    var qrcodesvg = new Qrcodesvg( obj.text, obj.elements.group, obj.dimension);
    qrcodesvg.draw();

    SVG.get(obj.elements.group).on('click', function(e){
        deselect();
        var results = buildSelector(this.attr('id'), 'simpleGroup');
        global_oro_variables.selected.add(results);
        Session.set("selected", "true");
        this.draggable();
        showDatGui();
        markSelected();
    })
    if(update){
        var output = SVG.get(obj.elements.group).node.outerHTML;
        parameters.output = output;
        //Meteor.call('update_document', 'Group', obj.elements.group, {parameters: parameters});
        oro.wraps.update_document('Group', obj.elements.group, {parameters: parameters});
    }

    return qrcodesvg;
}


// in connectableextend.js
build_connectors = function(connectors){
    //console.orolog(connectors);

    if(!(connectors instanceof Array))
        connectors = [connectors];

    //console.orolog(connectors);

    var links = SVG.get('connectors_links'),
        markers = SVG.get('connectors_markers'),
        use = SVG.get('connectors_use'),
        labels = SVG.get('labels'),
        conns = [], options = {};

    for(var i = 0; i < connectors.length; i++){
        if(!connectors[i].connector)
            connectors[i] = Connector.findOne({_id: connectors[i]});

        //console.orolog(connectors[i])

        options = {};
        if(connectors[i].connector && SVG.get(connectors[i].connector)){
            options.container = use;
            options.connector = use.use(SVG.get(connectors[i].connector));
        }
        else{
            options.container = links;
        }
        if(connectors[i].marker && SVG.get(connectors[i].marker))
            options.marker = SVG.get(connectors[i].marker);
        else
            options.marker = connectors[i].marker
        options.markers = markers;
        options.sourceAttach = connectors[i].sourceAttach
        options.targetAttach = connectors[i].targetAttach
        options.type = connectors[i].type
        if(connectors[i].label &&  connectors[i].label == 'true'){
            options.label = true;
            options.labels = labels;
        }
        else
            options.label = false
        options.dragstartcallback = disablePan;
        options.dragendcallback = togglePanZoom;
        if(SVG.get(connectors[i].source).attr('linkto'))
            options.labellink = SVG.get(connectors[i].source).attr('linkto')

        conns[connectors[i]._id] = SVG.get(connectors[i].source).connectable(options, SVG.get(connectors[i].target))

        if(connectors[i].color)
            conns[connectors[i]._id].setConnectorColor(connectors[i].color);

        global_oro_variables.connections[connectors[i]._id] = conns[connectors[i]._id];

        conns[connectors[i]._id].connector.attr('role', 'connector').attr('connection', connectors[i]._id).on('click', function(e){
            if(this.target)
                if(SVG.get('box_'+this.target.attr('id')))
                    deselectItem(this.target.attr('id'))
            select_item(this.attr('id'));
            showDatGui();
        })

        if(connectors[i].label == 'true')
            conns[connectors[i]._id].label.attr('role', 'label');

    }
}

remove_connectors = function(connectors){
    console.orolog(connectors);

    if(!(connectors instanceof Array))
        connectors = [connectors];

    console.orolog(connectors);

    var index;
    for(var i = 0 ; i < connectors.length; i++){
        if(connectors[i]._id)
            index = connectors[i]._id
        else
            index = connectors[i]

        console.orolog(index);
        if(global_oro_variables.connections[index]){
            global_oro_variables.connections[index].connector.remove();
            delete global_oro_variables.connections[index]
        }
    }
}

/*
SVG.extend(SVG.Set,{
    drag: function(){
        this.each(function(i, children){
            if(this.attr("type") == "hinge")
                dragHinge(this);
        });
    }
})
*/
