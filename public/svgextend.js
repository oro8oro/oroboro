//SVG.get('nBeFvpGM6S4MoMvMR').array.morph(SVG.get('dHN8wfDKN56PSCBxg').array.value)

transformMat2d = function(a, m) {
    if(!(m instanceof Array))
        m = [m.a, m.b, m.c, m.d, m.e, m.f];
    if(!(a instanceof Array))
        a = [a.x, a.y];
    var x = a[0],
        y = a[1],
        out = [];
    out[0] = m[0] * x + m[2] * y + m[4];
    out[1] = m[1] * x + m[3] * y + m[5];
    return out;
};
getAngle = function(center, p1) {
    var p0 = {x: center.x, y: center.y - Math.sqrt(Math.abs(p1.x - center.x) * Math.abs(p1.x - center.x) + Math.abs(p1.y - center.y) * Math.abs(p1.y - center.y))};
    return (2 * Math.atan2(p1.y - p0.y, p1.x - p0.x));// * 180 / Math.PI;
};
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
};
//http://stackoverflow.com/questions/13652518/efficiently-find-points-inside-a-circle-sector
function isInsideSector(point, center, sectorStart, sectorEnd, radiusSquared) {
    var relPoint = {
      x: point.x - center.x,
      y: point.y - center.y
    };

    return !areClockwise(sectorStart, relPoint) &&
           areClockwise(sectorEnd, relPoint); 
    //&& isWithinRadius(relPoint, radiusSquared);
}
function areClockwise(v1, v2) {
return -v1.x*v2.y + v1.y*v2.x > 0;
}
function isWithinRadius(v, radiusSquared) {
return v.x*v.x + v.y*v.y <= radiusSquared;
}


function arrayToString(a) {
  for (var i = 0, il = a.length, s = ''; i < il; i++) {
    s += a[i][0]

    if (a[i][1] != null) {
      s += a[i][1]

      if (a[i][2] != null) {
        s += ' '
        s += a[i][2]

        if (a[i][3] != null) {
          s += ' '
          s += a[i][3]
          s += ' '
          s += a[i][4]

          if (a[i][5] != null) {
            s += ' '
            s += a[i][5]
            s += ' '
            s += a[i][6]

            if (a[i][7] != null) {
              s += ' '
              s += a[i][7]
            }
          }
        }
      }
    }
  }
  
  return s + ' '
}


SVG.extend(SVG.PathArray, {
    typeOf: function(){
        var chars = ["c", "s", "q", "t", "a"];
        var points = this.value.toString().toLowerCase();
        for(var c in chars){
            if(points.indexOf(chars[c]) != -1)
                return "complex";
        }
        return "simple";
    },
    rotatePathArray: function(cx, cy, angle){
        var points = this.value;
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
        this.value = points;
        return this;
    },
    reversePathArray: function(){
        var arr = this.value;
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
        this.value = newarr;
        return this;
    },
    obox: function(arr){
        if(!arr)
            arr = this.value;
        SVG.parser.path.setAttribute('d', arrayToString(arr))
        var newbox =  SVG.parser.path.getBBox()
        newbox.cx = newbox.x + newbox.width/2;
        newbox.cy = newbox.y + newbox.height/2;
        return newbox;
    },
    createPoints: function(){
        //TODO
    },
    //get array of subpaths
    subpaths: function(arr){
        if(typeof arr === 'undefined')
            var arr = this.value;
        var newarr = [];
        for(i in arr){
            if(arr[i][0] == 'M')
                newarr.push([ arr[i] ]);
            else
                newarr[newarr.length-1].push( arr[i] );
        }
        return newarr;
    },
    // Make array morphable
    morph: function(array, callback) {
        this.destination = this.parse(array)
        var sourceSubpaths = this.subpaths()
            , destSubpaths = this.subpaths(this.destination);
        var lenS = sourceSubpaths.length
            , lenD = destSubpaths.length;

        // normalize number of subpaths
        if (lenS != lenD) {
            if(lenS > lenD){
                var lenMin = lenD,
                    lenMax = lenS,
                    pathMin = destSubpaths,
                    pathMax = sourceSubpaths;
            }
            else{
                var lenMin = lenS,
                    lenMax = lenD,
                    pathMin = sourceSubpaths,
                    pathMax = destSubpaths;
            }
            //missing subpaths are populates with the last viable point from the last subpath
            for(var i = lenMin; i < lenMax; i++){
                //var point = { x: pathMin[0][0][1] + (pathMax[0][0][1] - pathMax[i][0][1]), y:  pathMin[0][0][2] + (pathMax[0][0][2] - pathMax[i][0][2])} // relative subpath origin to first subpath origin
                if(pathMin[lenMin-1][pathMin[lenMin-1].length-1][0] == 'Z')
                    var point = this.pointxy(pathMin[lenMin-1].length-2, pathMin[lenMin-1])
                else
                    var point = this.pointxy(pathMin[lenMin-1].length-1, pathMin[lenMin-1])
                for(var j = 1, subp = [ ['M', point.x, point.y ] ]; j < pathMax[i].length-1; j++)
                    subp.push([ 'L', point.x, point.y ]);
                if(pathMax[i][pathMax[i].length-1][0] == 'Z')
                    subp.push([ 'Z' ]);
                else
                    subp.push([ 'L', point.x, point.y ]);
                pathMin.push(subp);
            }
        }
        //rebuild paths from subpaths
        for(var i = 0, newsrc = [], newdest = []; i < sourceSubpaths.length; i++){
            newsrc = newsrc.concat(sourceSubpaths[i])
            newdest = newdest.concat(destSubpaths[i])
        }

        this.value = newsrc
        this.destination = newdest

        if(callback)
            this[callback]();
        else
            this.simplemorph();

        return this
    },
    //Callback for morph - normalizes path lengths
    simplemorph: function(){

        //get subpaths
        var sourceSubpaths = this.subpaths();
        var destSubpaths = this.subpaths(this.destination);

        //normalize length of subpaths
        for(var i in sourceSubpaths){
            //normalize 'Z' 's
            if(sourceSubpaths[i][sourceSubpaths[i].length-1][0] == 'Z' && destSubpaths[i][destSubpaths[i].length-1][0] != 'Z')
                destSubpaths[i].push(['Z']);
            if(destSubpaths[i][destSubpaths[i].length-1][0] == 'Z' && sourceSubpaths[i][sourceSubpaths[i].length-1][0] != 'Z')
                sourceSubpaths[i].push(['Z']);

            if(sourceSubpaths[i].length != destSubpaths[i].length){

                //choose last valid point to be repeated
                var lastS = sourceSubpaths[i].length - 1, lastD = destSubpaths[i].length - 1;
                if(sourceSubpaths[i][sourceSubpaths[i].length - 1][0] == 'Z')
                    lastS = sourceSubpaths[i].length - 2
                if(destSubpaths[i][destSubpaths[i].length - 1][0] == 'Z')
                    lastD = destSubpaths[i].length - 2
                var xyS = this.pointxy(lastS, sourceSubpaths[i])
                var xyD = this.pointxy(lastD, destSubpaths[i])
                var lastSourcePoint = [ 'L', xyS.x, xyS.y ]
                , lastDestinationPoint = [ 'L', xyD.x, xyD.y ]

                //repeat last valid point until length becomes equal
                while(sourceSubpaths[i].length > destSubpaths[i].length)
                    destSubpaths[i].splice(lastD+1, 0, lastDestinationPoint)
                while(sourceSubpaths[i].length < destSubpaths[i].length)
                    sourceSubpaths[i].splice(lastS+1, 0, lastSourcePoint)
            }

            // normalize curves on both source and destination (only C's are tackled)
            for(var j in sourceSubpaths[i]){
                if(sourceSubpaths[i][j][0] == 'C' && destSubpaths[i][j][0] != 'C'){
                    var xy = this.pointxy(j-1, destSubpaths[i])
                    destSubpaths[i][j] = [ 'C', xy.x, xy.y, destSubpaths[i][j][1], destSubpaths[i][j][2], destSubpaths[i][j][1], destSubpaths[i][j][2] ]
                }
                if(destSubpaths[i][j][0] == 'C' && sourceSubpaths[i][j][0] != 'C'){
                    var xy = this.pointxy(j-1, sourceSubpaths[i])
                    sourceSubpaths[i][j] = [ 'C', xy.x, xy.y, sourceSubpaths[i][j][1], sourceSubpaths[i][j][2], sourceSubpaths[i][j][1], sourceSubpaths[i][j][2] ]
                }
            }
        }

        //rebuild paths
        for(var i = 0, newsrc = [], newdest = []; i < sourceSubpaths.length; i++){
            newsrc = newsrc.concat(sourceSubpaths[i])
            newdest = newdest.concat(destSubpaths[i])
        }
        this.value = newsrc
        this.destination = newdest

        return this;
    },
    //Callback for morph - simple morph after positioning the origin (first 'M') of the source path in the same direction as the origin of the destination path 
    alignedmorph: function(c1, c2){
        //TODO:
        //apply simplemorph() for normalizing path and subpath lengths
        this.simplemorph();

        var source = this.value;
        var dest = this.destination;

        var box1 = this.obox();
        var box2 = this.obox(dest);
        var angle1 = getAngle({x: box1.cx, y: box1.cy }, {x: source[0][1], y: source[0][2] });
        var angle2 = getAngle({x: box2.cx, y: box2.cy }, {x: dest[0][1], y: dest[0][2] });
        if(angle1 != angle2)
            this.rotatePathArray(box1.cx, box1.cy, angle2-angle1)

        source = this.value;
        var box1 = this.obox();
        var box2 = this.obox(dest);
        var angle1 = getAngle({x: box1.cx, y: box1.cy}, {x: source[0][1], y: source[0][2]});
        var angle2 = getAngle({x: box2.cx, y: box2.cy}, {x: dest[0][1], y: dest[0][2]});
        var angle1s = getAngle({x: box1.cx, y: box1.cy}, {x: source[1][source[1].length-2], y: source[1][source[1].length-1]});
        var angle2s = getAngle({x: box2.cx, y: box2.cy}, {x: dest[1][dest[1].length-2], y: dest[1][dest[1].length-1]}); 

        if((angle1s-angle1) * (angle2s-angle2) < 0){
            this.reversePathArray();
            var box1 = this.obox();
            var box2 = this.obox(dest);
            var angle1 = getAngle({x: box1.cx, y: box1.cy}, {x: source[0][1], y: source[0][2]});
            var angle2 = getAngle({x: box2.cx, y: box2.cy}, {x: dest[0][1], y: dest[0][2]});
            if(angle1 != angle2)
                this.rotatePathArray(box1.cx, box1.cy, angle2-angle1)
        }
        return this;
    },
    //Callback for morph - morphs by minimum distance
    orderedmorph: function(){

        //get subpaths
        var sourceSubpaths = this.subpaths();
        var destSubpaths = this.subpaths(this.destination);

        //choose source points closer to the destination points
        for(var i = 0, newsource = [], rest = []; i < destSubpaths.length; i++){
            newsource[i] = [];
            rest[i] = {points:[], inds:[]};
            //clones origin
            newsource[i][0] = sourceSubpaths[i][0];
            //remove origin from choosable points array
            var temp = sourceSubpaths[i].slice(1,sourceSubpaths[i].length);
            //index array for mapping the choosable points onto the source array
            var inds = Object.keys(new Int8Array(sourceSubpaths[i].length)).map(Number).slice(1)
            //index of last viable point to repeat
            if(sourceSubpaths[i][sourceSubpaths[i].length-1] == 'Z')
                var index = sourceSubpaths[i].length-2;
            else
                var index = sourceSubpaths[i].length-1;
            //each subpath is analysed
            for(var j = 1; j < destSubpaths[i].length; j++){
                //initialize point with last viable point to repeat in case of not finding a proper one
                var point = sourceSubpaths[i][index], ind = index;
                if(destSubpaths[i][j][0] != 'Z'){
                    //x,y coord of the point
                    var xy2 = this.pointxy(j, destSubpaths[i]);
                    var min = Number.MAX_SAFE_INTEGER;
                    //choose source point with minimum distance from destination point; check if we still have choosable points
                    if(temp.length > 0){
                        var pp;
                        for(var p in temp){
                            if(temp[p][0] != 'Z'){
                                var xy = this.pointxy(p, temp);
                                if(min > (Math.pow(xy2.x-xy.x, 2) + Math.pow(xy2.y-xy.y,2))){
                                    min = Math.pow(xy2.x-xy.x, 2) + Math.pow(xy2.y-xy.y,2);
                                    point = temp[p];
                                    ind = inds[p];
                                    pp = p;
                                }
                            }
                        }
                        //remove point from choosable points, remove its index
                        temp.splice(pp, 1);
                        inds.splice(pp,1);
                    }
                    //if curve, add attractor for previously added point with the previous points' coordinates
                    if(point[0] == 'C'){
                        var xy = this.pointxy(newsource[i].length-1, newsource[i])
                        point[1] = xy.x;
                        point[2] = xy.y;
                    }
                    //normalize curves between destination and source
                    if(destSubpaths[i][j][0] == 'C' && point[0] != 'C'){
                        //xy coord for previously added point
                        var xy = this.pointxy(newsource[i].length-1, newsource[i])
                        point = ['C', xy.x, xy.y, point[1], point[2], point[1], point[2]];
                    }
                    if(point[0] == 'C' && destSubpaths[i][j][0] != 'C'){
                        var xy = this.pointxy(j-1, destSubpaths[i])
                        destSubpaths[i][j] = [ 'C', xy.x, xy.y, destSubpaths[i][j][1], destSubpaths[i][j][2], destSubpaths[i][j][1], destSubpaths[i][j][2] ];
                    }
                    newsource[i].push(point);
                }
                else
                    newsource[i].push(destSubpaths[i][j]);
                rest[i].points = temp;
                rest[i].inds = inds;
            }
        }
        //add the rest of the source points (not chosen) to newsource & destination
        for(var i in rest)
            for(var p in rest[i].points){
                if(rest[i].points[p][0] != 'Z'){
                    //point index from source array
                    var j = rest[i].inds[p];
                    newsource[i].splice(j,0,rest[i].points[p])
                    destSubpaths[i].splice(j,0,destSubpaths[i][j-1])
                    //add previous point attractors if curve
                    if(newsource[i][j][0] == 'C'){
                        var xy = this.pointxy(j-1, newsource[i])
                        newsource[i][j][1] = xy.x;
                        newsource[i][j][2] = xy.y;
                    }
                    if(destSubpaths[i][j][0] == 'C'){
                        var xy = this.pointxy(j-1, destSubpaths[i])
                        destSubpaths[i][j][1] = xy.x;
                        destSubpaths[i][j][2] = xy.y;
                    }
                    //normalize curves between destination and source point
                    if(newsource[i][j][0] == 'C' && destSubpaths[i][j][0] != 'C')
                        destSubpaths[i][j] = [ 'C', destSubpaths[i][j][1], destSubpaths[i][j][2], destSubpaths[i][j][1], destSubpaths[i][j][2], destSubpaths[i][j][1], destSubpaths[i][j][2] ];
                    if(destSubpaths[i][j][0] == 'C' && newsource[i][j][0] != 'C'){
                        var xy = this.pointxy(j-1, newsource[i])
                        newsource[i][j] = [ 'C', xy.x, xy.y, newsource[i][j][1], newsource[i][j][2], newsource[i][j][1], newsource[i][j][2] ];
                    }
                    //check for point attractors in next point
                    if(newsource[i][j+1])
                        if(newsource[i][j+1][0] == 'C'){
                            var xy = this.pointxy(j, newsource[i])
                            newsource[i][j+1][1] = xy.x;
                            newsource[i][j+1][2] = xy.y;
                        }
                    if(destSubpaths[i][j+1])
                        if(destSubpaths[i][j+1][0] == 'C'){
                            var xy = this.pointxy(j, destSubpaths[i])
                            destSubpaths[i][j+1][1] = xy.x;
                            destSubpaths[i][j+1][2] = xy.y;
                        }

                }
                else{
                    //normalize 'Z' 's
                    if(JSON.stringify(newsource[i]).indexOf('Z') == -1)
                        newsource[i].push(['Z']);
                    if(JSON.stringify(destSubpaths[i]).indexOf('Z') == -1)
                        destSubpaths[i].push(['Z']);
                }
            }

        //rebuild paths
        for(var i = 0, newsrc = [], newdest = []; i < newsource.length; i++){
            newsrc = newsrc.concat(newsource[i])
            newdest = newdest.concat(destSubpaths[i])
        }
        this.value = newsrc
        this.destination = newdest
        return this;
    },
    complexmorph: function(){
        //get subpaths
        var src = this.subpaths();
        var dest = this.subpaths(this.destination);
        var center = this.obox();
        center = {x: center.cx, y: center.cy}

        for(var i = 0, newsource = [], newdest = []; i < src.length; i++){
            newsource[i] = [];
            newdest[i] = [];
            for(var j = 0, memo, type = [], min; j < src[i].length; j++){
                memo = [];
                console.log(memo);
                min = {dist: Number.MAX_SAFE_INTEGER};
                if(src[i][j][0] != 'Z' && src[i][j] != 'end' && src[i][j+1] && src[i][j+1] != 'end'){
                    //if next point is 'Z', add M's coordinates
                    if(src[i][j+1][0] == 'Z'){
                        src[i][j+1] = [ 'L', src[i][0][1], src[i][0][2] ]
                        src[i][j+2] = 'end';
                    }
                    console.log(src[i][j]);
                    //choose destination points located inside circle sector made by the current source point and the next one
                    for(var k = 0; k < dest[i].length; k++){
                        if(dest[i][k][0] != 'Z'){
                            if(isInsideSector(
                                {x: dest[i][k][dest[i][k].length-2], y: dest[i][k][dest[i][k].length-1]}
                                , center
                                , {x: src[i][j][src[i][j].length-2], y: src[i][j][src[i][j].length-1]}
                                , {x: src[i][j+1][src[i][j+1].length-2], y: src[i][j+1][src[i][j+1].length-1]}
                                )){
                                //add destination point index
                                memo.push(k);
                                //add destination point head (M,L,C)
                                type.push(dest[i][k][0]);
                                console.log(memo);
                                console.log(type);
                            }
                            else{
                                var dist = Math.pow(dest[i][k][dest[i][k].length-2]-src[i][j][src[i][j].length-2], 2) + Math.pow(dest[i][k][dest[i][k].length-1]-src[i][j][src[i][j].length-1], 2)
                                if(min.dist > dist){
                                    min.index = k
                                    min.dist = dist;
                                }
                            }
                        }   
                    }
                }
                console.log(min);
                if(src[i][j+1] && src[i][j+1] == 'end'){
                    src[i].pop();
                    src[i][j] = [ 'Z' ];
                }
                //add current source point
                newsource[i].push(src[i][j]);
                //if destination points exist inside the circle sector, we add them by dividing the path length between current source point and next
                if(memo.length > 0){
                    console.log(memo);
                    //if(memo[memo.length-1] - memo[memo.length-2] > 1) //TODO: cluster at origin on first sector
                    var temp = new SVG.Path();
                    var temppath = [ ['M', src[i][j][src[i][j].length-2], src[i][j][src[i][j].length-1] ], src[i][j+1]]
                    console.log(temppath);
                    temp.plot(temppath);
                    console.log(temp.length());
                    var step = temp.length() / (memo.length+1)
                    console.log(step);
                    //add point at step
                    for(var s = 0; s < memo.length; s++){
                        var point = [ type[s] ];
                        var p = temp.pointAt(step * (s+1));
                        console.log(p);
                        if(type[s] == 'C')
                            point = point.concat([ 
                                src[i][j][src[i][j].length-2],  src[i][j][src[i][j].length-1],
                                p.x, p.y
                            ]);
                        point = point.concat([ p.x, p.y ]);
                        console.log(point);
                        newsource[i].push(point);
                    }
                }
                //console.log(JSON.stringify(newsource[i]));
                //add first source point in destination
                var point2 = [ src[i][j][0] ];
                if(memo.length > 0)
                    var pp = memo[0];
                else
                    var pp = min.index;
                if(pp){
                    if(src[i][j] == 'C'){
                        //check if previous point exists and add its attractor; otherwise add attractor for origin (M)
                        if(dest[i][pp-1])
                            point2 = point2.concat([
                                dest[i][pp-1][dest[i][pp-1].length-2],
                                dest[i][pp-1][dest[i][pp-1].length-1]
                            ]);
                        else
                            point2 = point2.concat([
                                dest[i][0][1],
                                dest[i][0][2]
                            ]);
                        //add second attractor for the current point
                        point2 = point2.concat([
                            dest[i][pp][dest[i][pp].length-2],
                            dest[i][pp][dest[i][pp].length-1]
                        ]);
                    }
                    //add x,y coord
                    point2 = point2.concat([ dest[i][pp][dest[i][pp].length-2], dest[i][pp][dest[i][pp].length-1] ]);
                    console.log(point2);
                    newdest[i].push(point2);
                    for(var s = 0; s < memo.length; s++){
                        newdest[i].push(dest[i][memo[s]]);
                    }
                }
            }
            //normalize 'Z' 's
            if(JSON.stringify(newsource[i]).indexOf('Z') == -1)
                newsource[i].push(['Z']);
            if(JSON.stringify(newdest[i]).indexOf('Z') == -1)
                newdest[i].push(['Z']);

            console.log(JSON.stringify(newsource[i]));
             console.log(JSON.stringify(newdest[i]));
        }


        //rebuild paths
        for(var i = 0, newsrc = [], newd = []; i < newsource.length; i++){
            newsrc = newsrc.concat(newsource[i])
            newd = newd.concat(newdest[i])
        }
        this.value = newsrc
        this.destination = newd
        return this;
    }
    , at: function(pos) {
        // make sure a destination is defined 
        if (!this.destination) return this

        // generate morphed path array
        for (var i = 0, il = this.value.length, array = []; i < il; i++)
            if(this.value[i][0] != 'Z'){
                if(this.value[i][0] == 'C')
                    array.push([
                        this.value[i][0]
                        , this.value[i][1] + (this.destination[i][1] - this.value[i][1]) * pos
                        , this.value[i][2] + (this.destination[i][2] - this.value[i][2]) * pos
                        , this.value[i][3] + (this.destination[i][3] - this.value[i][3]) * pos
                        , this.value[i][4] + (this.destination[i][4] - this.value[i][4]) * pos
                        , this.value[i][5] + (this.destination[i][5] - this.value[i][5]) * pos
                        , this.value[i][6] + (this.destination[i][6] - this.value[i][6]) * pos
                    ])
                else
                    array.push([
                        this.value[i][0]
                        , this.value[i][1] + (this.destination[i][1] - this.value[i][1]) * pos
                        , this.value[i][2] + (this.destination[i][2] - this.value[i][2]) * pos
                    ]);
            }
            else
                array.push( this.value[i] );
        return new SVG.PathArray(array)
    }
    //remove duplicate points (same x,y coord) and single point subpaths
    , settle: function() {
        //console.log(JSON.stringify(this.value));
        // error
        var epsilon = 0.07;
        var subpaths = this.subpaths();
        for (var i = 0, il = subpaths.length; i < il; i++){
            for(var j = 0, jl = subpaths[i].length; j < jl; j++){
                if(subpaths[i][j+1]){
                    while(subpaths[i][j+1]
                            && subpaths[i][j+1][0] != 'Z'
                            && subpaths[i][j+1][subpaths[i][j+1].length-2] <= subpaths[i][j][subpaths[i][j].length-2] + epsilon
                            && subpaths[i][j+1][subpaths[i][j+1].length-2] >= subpaths[i][j][subpaths[i][j].length-2] - epsilon
                            && subpaths[i][j+1][subpaths[i][j+1].length-1] <= subpaths[i][j][subpaths[i][j].length-1] + epsilon
                            && subpaths[i][j+1][subpaths[i][j+1].length-1] >= subpaths[i][j][subpaths[i][j].length-1] - epsilon
                            ){
                        subpaths[i].splice(j+1, 1);
                        jl--;
                    }
                //TODO: what if curves?
                }
                //TODO: same line, C with null attractors to L
            }
            if(subpaths[i].length == 1)
                subpaths.splice(i,1);
        }
        //rebuild paths from subpaths
        for(var i = 0, newsrc = []; i < subpaths.length; i++)
            newsrc = newsrc.concat(subpaths[i])
      // set new value 
      this.value = newsrc;
      //console.log(JSON.stringify(this.value));
      return this.value;
    }
    , pointxy: function(index, pathArr){
        if(typeof pathArr === 'undefined')
            pathArr = this.value;
        if(pathArr[index][0] == 'Z')
            return null;
        if(pathArr[index][0] == 'C')
            return {x: pathArr[index][5], y: pathArr[index][6], ix: 5, iy: 6}
        else
            return {x: pathArr[index][1], y: pathArr[index][2], ix: 1, iy: 2}
    }
})

//point object: {head,x,y,ax,ay,bx,by}
SVG.Point = SVG.invent({
    create: function(object){
        //initialize
        this.head = 'L';
        this.x = 0;
        this.y = 0;
        this.ownA = null;
        this.referencedA = null;
        this.parent = null;
        this.referenced = null;
        if(object){
            //if object is of type ['L', 100, 100]
            if(object instanceof Array){
                var newobj = {h: object[0]}
                if(object[0] != 'Z'){
                    newobj.x = object[object.length-2];
                    newobj.y = object[object.length-1];
                    if(object[0] == 'C'){
                        newobj.ax = object[1];
                        newobj.ay = object[2];
                        newobj.bx = object[3];
                        newobj.by = object[4];
                    }
                }
                object = newobj;
            }
            if(object.x)
                this.x = object.x;
            if(object.y)
                this.y = object.y;
            // create own attractor
            if(object.bx && object.by)
                this.ownA = new SVG.Attractor({x:bx, y:by}, this, this);
            // create referenced attractor
            if(object.ax && object.ay)
                this.referencedA = new SVG.Attractor({x:ax, y:ay}, this);
        }
    }
    , extend: {
        addParent: function(parent){
            if(parent)
                if(parent instanceof SVG.PathArray)
                    this.parent = parent;
        }
        , addReferenced: function(point){
            if(point)
                if(point instanceof SVG.Point){
                    this.referenced = point;
                    this.referencedA.addReference(this.referenced);
                }
        }
        , transformPoint: function(matrices){
            var point = [this.x, this.y];
            for(m in matrices){
                point = transformMat2d(point, matrices[m]);
            }
            this.x = point[0];
            this.y = point[1];
            return this;
        }
    }
})

//point attractor;
SVG.Attractor = SVG.invent({
    create: function(object, parentPoint, referencePoint){
        //{x:x,y:y} - x,y coordinates
        if(object){
            this.x = object.x;
            this.y = object.y;
            //this.shape = TODO (from AttractorArray?)
        }
        //point which structurally contains the attractor: ['C', thisAttractorX, thisAttractorY, otherAttractorWithSameParentPointButDifferentReferencePointX, otherAttractorWithSameParentPointButDifferentReferencePointY, x, y]
        if(parentPoint)
            if(parentPoint instanceof SVG.Point)
                this.parent = parentPoint;
        //point linked to attractor (may be same as parentPoint or may be previous point)
        this.addReference(referencePoint);
    }
    , extend: {
        remove: function(){
            //TODO:
            //this.parent.
        }
        , addReference: function(referencePoint){
            if(referencePoint)
                if(referencePoint instanceof SVG.Point)
                    this.reference = referencePoint;
        }
    }
})

SVG.extend(SVG.Path, {
    morphArray:  SVG.PathArray
    , animatepath: function(destinations, d, ease, delay, repeat){
        //todo: see if destinations has pointArrays or something else
        if(repeat)
            repeat = Number(repeat);
        else
            repeat = 1;

        var source = this;
        for(var r = 0; r < repeat; r++){
            for(var i in destinations){
                source.array.morph(destinations[i].array.value)
                source.animate(d, ease, delay).plot(source.array.destination).settle();
            }
        }
    }
    , animatepathOro: function(destinations, d, ease, delay, repeat){
        if(repeat)
            repeat = Number(repeat);
        else
            repeat = 1;

        var originals = [];
        var originalsource = this.array.value;

        for(var i in destinations)
            originals.push(destinations[i].array.value)
        console.log(originals);
        var src = this;
        for(var r = 0; r < repeat; r++){
            for(var i = 0; i < destinations.length; i++){
                console.log(destinations[i]);
                console.log(destinations[i].array);
                src.array.morph(destinations[i].array.value)
                src.animate(d, ease, delay).plot(src.array.destination);
                src.plot(originals[i])
            }
            if(r == 0){
                this.value = originalsource;
                destinations.splice(0, 0, this);
                originals.splice(0, 0, originalsource);
            }
        }
/*
        fx.render = function() {
            
            if (fx.situation.play === true) {
              // calculate pos
              var time = new Date().getTime()
                , pos = time > fx.situation.finish ? 1 : (time - fx.situation.start) / d

              // reverse pos if animation is reversed
              if (fx.situation.reversing)
                pos = -pos + 1
              
              // process values
              fx.at(pos)
              
              // finish off animation
              if (time > fx.situation.finish) {
                if (fx.destination.plot)
                  element.plot(new SVG.PointArray(fx.destination.plot.destination).settle())

                if (fx.situation.loop === true || (typeof fx.situation.loop == 'number' && fx.situation.loop > 0)) {
                  // register reverse
                  if (fx.situation.reverse)
                    fx.situation.reversing = !fx.situation.reversing

                  if (typeof fx.situation.loop == 'number') {
                    // reduce loop count
                    if (!fx.situation.reverse || fx.situation.reversing)
                      --fx.situation.loop

                    // remove last loop if reverse is disabled
                    if (!fx.situation.reverse && fx.situation.loop == 1)
                      --fx.situation.loop                      
                  }
                  
                  fx.animate(d, ease, delay)
                } else {
                  fx.situation.after ? fx.situation.after.apply(element, [fx]) : fx.stop()
                }

              } else {
                requestAnimFrame(fx.render)
              }
            } else {
              requestAnimFrame(fx.render)
            }
            
          }
        fx.render()
        */
    }
})

//.animate({ duration: 3000, ease: SVG.easing.elastic }).plot(points).after(morph)
/*
SVG.extend(SVG.FX, {
    // Add animation parameters and start animation
    animate: function(d, ease, delay) {
      var akeys, tkeys, skeys, key
        , element = this.target
        , fx = this
      
      // dissect object if one is passed 
      if (typeof d == 'object') {
        delay = d.delay
        ease = d.ease
        d = d.duration
      }

      // ensure default duration and easing //
      d = d == '=' ? d : d == null ? 1000 : new SVG.Number(d).valueOf()
      ease = ease || '<>'

      // process values //
      fx.to = function(pos) {
        var i

        // normalise pos //
        pos = pos < 0 ? 0 : pos > 1 ? 1 : pos

        // collect attribute keys //
        if (akeys == null) {
          akeys = []
          for (key in fx.attrs)
            akeys.push(key)

          // make sure morphable elements are scaled, translated and morphed all together //
          if (element.morphArray && (fx._plot || akeys.indexOf('points') > -1)) {
            // get destination //
            var box
              , p = new element.morphArray(fx._plot || fx.attrs.points || element.array)

            // add size //
            if (fx._size) p.size(fx._size.width.to, fx._size.height.to)

            // add movement //
            box = p.bbox()
            if (fx._x) p.move(fx._x.to, box.y)
            else if (fx._cx) p.move(fx._cx.to - box.width / 2, box.y)

            box = p.bbox()
            if (fx._y) p.move(box.x, fx._y.to)
            else if (fx._cy) p.move(box.x, fx._cy.to - box.height / 2)

            // delete element oriented changes //
            delete fx._x
            delete fx._y
            delete fx._cx
            delete fx._cy
            delete fx._size

            fx._plot = element.array.morph(p)
          }
        }

        // collect transformation keys //
        if (tkeys == null) {
          tkeys = []
          for (key in fx.trans)
            tkeys.push(key)
        }

        //// collect style keys //
        if (skeys == null) {
          skeys = []
          for (key in fx.styles)
            skeys.push(key)
        }

        // apply easing //
        pos = ease == '<>' ?
          (-Math.cos(pos * Math.PI) / 2) + 0.5 :
        ease == '>' ?
          Math.sin(pos * Math.PI / 2) :
        ease == '<' ?
          -Math.cos(pos * Math.PI / 2) + 1 :
        ease == '-' ?
          pos :
        typeof ease == 'function' ?
          ease(pos) :
          pos
        
        // run plot function //
        if (fx._plot) {
          element.plot(fx._plot.at(pos))

        } else {
          // run all x-position properties //
          if (fx._x)
            element.x(fx._x.at(pos))
          else if (fx._cx)
            element.cx(fx._cx.at(pos))

          // run all y-position properties ////
          if (fx._y)
            element.y(fx._y.at(pos))
          else if (fx._cy)
            element.cy(fx._cy.at(pos))

          // run all size properties //
          if (fx._size)
            element.size(fx._size.width.at(pos), fx._size.height.at(pos))
        }

        // run all viewbox properties //
        if (fx._viewbox)
          element.viewbox(
            fx._viewbox.x.at(pos)
          , fx._viewbox.y.at(pos)
          , fx._viewbox.width.at(pos)
          , fx._viewbox.height.at(pos)
          )

        // run leading property //
        if (fx._leading)
          element.leading(fx._leading.at(pos))

        // animate attributes //
        for (i = akeys.length - 1; i >= 0; i--)
          element.attr(akeys[i], at(fx.attrs[akeys[i]], pos))

        // animate transformations //
        for (i = tkeys.length - 1; i >= 0; i--)
          element.transform(tkeys[i], at(fx.trans[tkeys[i]], pos))

        // animate styles //
        for (i = skeys.length - 1; i >= 0; i--)
          element.style(skeys[i], at(fx.styles[skeys[i]], pos))

        // callback for each keyframe //
        if (fx._during)
          fx._during.call(element, pos, function(from, to) {
            return at({ from: from, to: to }, pos)
          })
      }
      
      if (typeof d === 'number') {
        // delay animation //
        this.timeout = setTimeout(function() {
          var start = new Date().getTime()

          // initialize situation object //
          fx.situation = {
            interval: 1000 / 60
          , start:    start
          , play:     true
          , finish:   start + d
          , duration: d
          }

          // render function //
          fx.render = function() {
            
            if (fx.situation.play === true) {
              // This code was borrowed from the emile.js micro framework by Thomas Fuchs, aka MadRobby.
              var time = new Date().getTime()
                , pos = time > fx.situation.finish ? 1 : (time - fx.situation.start) / d
              
              // process values //
              fx.to(pos)
              
              // finish off animation //
              if (time > fx.situation.finish) {
                if (fx._plot) ///loredanacirstea modified: 
                    if(element.array instanceof SVG.PathArray)
                        element.plot(new SVG.PathArray(fx._plot.destination).settle())
                    else
                        element.plot(new SVG.PointArray(fx._plot.destination).settle())
                        // end of modified
                if (fx._loop === true || (typeof fx._loop == 'number' && fx._loop > 1)) {
                  if (typeof fx._loop == 'number')
                    --fx._loop
                  fx.animate(d, ease, delay)
                } else {
                  fx._after ? fx._after.apply(element, [fx]) : fx.stop()
                }

              } else {
                requestAnimFrame(fx.render)
              }
            } else {
              requestAnimFrame(fx.render)
            }
            
          }

          // start animation //
          fx.render()
          
        }, new SVG.Number(delay).valueOf())
      }
      
      return this
    }
})
*/
SVG.extend(SVG.FX, {
  // Initialize FX object
  create: function(element) {
    // store target element
    this.target = element
  }

  // Add class methods
, extend: {
    // Add animation parameters and start animation
    animate: function(d, ease, delay) {
      var akeys, skeys, key
        , element = this.target
        , fx = this
      
      // dissect object if one is passed
      if (typeof d == 'object') {
        delay = d.delay
        ease = d.ease
        d = d.duration
      }

      // ensure default duration and easing
      d = d == '=' ? d : d == null ? 1000 : new SVG.Number(d).valueOf()
      ease = ease || '<>'

      // process values
      fx.at = function(pos) {
        var i

        // normalise pos
        pos = pos < 0 ? 0 : pos > 1 ? 1 : pos

        // collect attribute keys
        if (akeys == null) {
          akeys = []
          for (key in fx.attrs)
            akeys.push(key)

          // make sure morphable elements are scaled, translated and morphed all together
          if (element.morphArray && (fx.destination.plot || akeys.indexOf('points') > -1)) {
            // get destination
            var box
              , p = new element.morphArray(fx.destination.plot || fx.attrs.points || element.array)
            // add size
            if (fx.destination.size)
              p.size(fx.destination.size.width.to, fx.destination.size.height.to)

            // add movement
            box = p.bbox()
            if (fx.destination.x)
              p.move(fx.destination.x.to, box.y)
            else if (fx.destination.cx)
              p.move(fx.destination.cx.to - box.width / 2, box.y)

            box = p.bbox()
            if (fx.destination.y)
              p.move(box.x, fx.destination.y.to)
            else if (fx.destination.cy)
              p.move(box.x, fx.destination.cy.to - box.height / 2)

            // reset destination values
            fx.destination = {
              plot: element.array.morph(p)
            }
          }
        }

        // collect style keys
        if (skeys == null) {
          skeys = []
          for (key in fx.styles)
            skeys.push(key)
        }

        // apply easing
        pos = ease == '<>' ?
          (-Math.cos(pos * Math.PI) / 2) + 0.5 :
        ease == '>' ?
          Math.sin(pos * Math.PI / 2) :
        ease == '<' ?
          -Math.cos(pos * Math.PI / 2) + 1 :
        ease == '-' ?
          pos :
        typeof ease == 'function' ?
          ease(pos) :
          pos
        
        // run plot function
        if (fx.destination.plot) {
          element.plot(fx.destination.plot.at(pos))

        } else {
          // run all x-position properties
          if (fx.destination.x)
            element.x(fx.destination.x.at(pos))
          else if (fx.destination.cx)
            element.cx(fx.destination.cx.at(pos))

          // run all y-position properties
          if (fx.destination.y)
            element.y(fx.destination.y.at(pos))
          else if (fx.destination.cy)
            element.cy(fx.destination.cy.at(pos))

          // run all size properties
          if (fx.destination.size)
            element.size(fx.destination.size.width.at(pos), fx.destination.size.height.at(pos))
        }

        // run all viewbox properties
        if (fx.destination.viewbox)
          element.viewbox(
            fx.destination.viewbox.x.at(pos)
          , fx.destination.viewbox.y.at(pos)
          , fx.destination.viewbox.width.at(pos)
          , fx.destination.viewbox.height.at(pos)
          )

        // run leading property
        if (fx.destination.leading)
          element.leading(fx.destination.leading.at(pos))

        // animate attributes
        for (i = akeys.length - 1; i >= 0; i--)
          element.attr(akeys[i], at(fx.attrs[akeys[i]], pos))

        // animate styles
        for (i = skeys.length - 1; i >= 0; i--)
          element.style(skeys[i], at(fx.styles[skeys[i]], pos))

        // callback for each keyframe
        if (fx.situation.during)
          fx.situation.during.call(element, pos, function(from, to) {
            return at({ from: from, to: to }, pos)
          })
      }
      
      if (typeof d === 'number') {
        // delay animation
        this.timeout = setTimeout(function() {
          var start = new Date().getTime()

          // initialize situation object
          fx.situation.start    = start
          fx.situation.play     = true
          fx.situation.finish   = start + d
          fx.situation.duration = d
          fx.situation.ease     = ease

          // render function
          fx.render = function() {
            
            if (fx.situation.play === true) {
              // calculate pos
              var time = new Date().getTime()
                , pos = time > fx.situation.finish ? 1 : (time - fx.situation.start) / d

              // reverse pos if animation is reversed
              if (fx.situation.reversing)
                pos = -pos + 1
              
              // process values
              fx.at(pos)
              
              // finish off animation
              if (time > fx.situation.finish) {
                if (fx.destination.plot)///loredanacirstea modified: 
                    if(element.array instanceof SVG.PathArray)
                        element.plot(new SVG.PathArray(fx.destination.plot.destination).settle())
                    else
                        element.plot(new SVG.PointArray(fx.destination.plot.destination).settle())
                //element.plot(new SVG.PointArray(fx.destination.plot.destination).settle())
                // end of modified

                if (fx.situation.loop === true || (typeof fx.situation.loop == 'number' && fx.situation.loop > 0)) {
                  // register reverse
                  if (fx.situation.reverse)
                    fx.situation.reversing = !fx.situation.reversing

                  if (typeof fx.situation.loop == 'number') {
                    // reduce loop count
                    if (!fx.situation.reverse || fx.situation.reversing)
                      --fx.situation.loop

                    // remove last loop if reverse is disabled
                    if (!fx.situation.reverse && fx.situation.loop == 1)
                      --fx.situation.loop                      
                  }
                  
                  fx.animate(d, ease, delay)
                } else {
                  fx.situation.after ? fx.situation.after.apply(element, [fx]) : fx.stop()
                }

              } else {
                requestAnimFrame(fx.render)
              }
            } else {
              requestAnimFrame(fx.render)
            }
            
          }

          // start animation
          fx.render()
          
        }, new SVG.Number(delay).valueOf())
      }
      
      return this
    }
    // Get bounding box of target element
  , bbox: function() {
      return this.target.bbox()
    }
    // Add animatable attributes
  , attr: function(a, v) {
      // apply attributes individually
      if (typeof a == 'object') {
        for (var key in a)
          this.attr(key, a[key])
      
      } else {
        // get the current state
        var from = this.target.attr(a)

        // detect format
        if (a == 'transform') {
          // merge given transformation with an existing one
          if (this.attrs[a])
            v = this.attrs[a].destination.multiply(v)

          // prepare matrix for morphing
          this.attrs[a] = this.target.ctm().morph(v)

          // add parametric rotation values
          if (this.param) {
            // get initial rotation
            v = this.target.transform('rotation')

            // add param
            this.attrs[a].param = {
              from: this.target.param || { rotation: v, cx: this.param.cx, cy: this.param.cy }
            , to:   this.param
            }
          }

        } else {
          this.attrs[a] = SVG.Color.isColor(v) ?
            // prepare color for morphing
            new SVG.Color(from).morph(v) :
          SVG.regex.unit.test(v) ?
            // prepare number for morphing
            new SVG.Number(from).morph(v) :
            // prepare for plain morphing
            { from: from, to: v }
        }
      }
      
      return this
    }
    // Add animatable styles
  , style: function(s, v) {
      if (typeof s == 'object')
        for (var key in s)
          this.style(key, s[key])
      
      else
        this.styles[s] = { from: this.target.style(s), to: v }
      
      return this
    }
    // Animatable x-axis
  , x: function(x) {
      this.destination.x = new SVG.Number(this.target.x()).morph(x)
      
      return this
    }
    // Animatable y-axis
  , y: function(y) {
      this.destination.y = new SVG.Number(this.target.y()).morph(y)
      
      return this
    }
    // Animatable center x-axis
  , cx: function(x) {
      this.destination.cx = new SVG.Number(this.target.cx()).morph(x)
      
      return this
    }
    // Animatable center y-axis
  , cy: function(y) {
      this.destination.cy = new SVG.Number(this.target.cy()).morph(y)
      
      return this
    }
    // Add animatable move
  , move: function(x, y) {
      return this.x(x).y(y)
    }
    // Add animatable center
  , center: function(x, y) {
      return this.cx(x).cy(y)
    }
    // Add animatable size
  , size: function(width, height) {
      if (this.target instanceof SVG.Text) {
        // animate font size for Text elements
        this.attr('font-size', width)
        
      } else {
        // animate bbox based size for all other elements
        var box = this.target.bbox()

        this.destination.size = {
          width:  new SVG.Number(box.width).morph(width)
        , height: new SVG.Number(box.height).morph(height)
        }
      }
      
      return this
    }
    // Add animatable plot
  , plot: function(p) {
      this.destination.plot = p

      return this
    }
    //loredanacirstea:
  , journey: function(destinations){
        this.journeyNo = 0;
        this.destination.plot = destinations[0];
    }
    // Add leading method
  , leading: function(value) {
      if (this.target.destination.leading)
        this.destination.leading = new SVG.Number(this.target.destination.leading).morph(value)

      return this
    }
    // Add animatable viewbox
  , viewbox: function(x, y, width, height) {
      if (this.target instanceof SVG.Container) {
        var box = this.target.viewbox()
        
        this.destination.viewbox = {
          x:      new SVG.Number(box.x).morph(x)
        , y:      new SVG.Number(box.y).morph(y)
        , width:  new SVG.Number(box.width).morph(width)
        , height: new SVG.Number(box.height).morph(height)
        }
      }
      
      return this
    }
    // Add animateable gradient update
  , update: function(o) {
      if (this.target instanceof SVG.Stop) {
        if (o.opacity != null) this.attr('stop-opacity', o.opacity)
        if (o.color   != null) this.attr('stop-color', o.color)
        if (o.offset  != null) this.attr('offset', new SVG.Number(o.offset))
      }

      return this
    }
    // Add callback for each keyframe
  , during: function(during) {
      this.situation.during = during
      
      return this
    }
    // Callback after animation
  , after: function(after) {
      this.situation.after = after
      
      return this
    }
    // Make loopable
  , loop: function(times, reverse) {
      // store current loop and total loops
      this.situation.loop = this.situation.loops = times || true

      // make reversable
      this.situation.reverse = !!reverse

      return this
    }
    // Stop running animation
  , stop: function(fulfill) {
      // fulfill animation
      if (fulfill === true) {

        this.animate(0)

        if (this.situation.after)
          this.situation.after.apply(this.target, [this])

      } else {
        // stop current animation
        clearTimeout(this.timeout)

        // reset storage for properties
        this.attrs       = {}
        this.styles      = {}
        this.situation   = {}
        this.destination = {}
      }
      
      return this
    }
    // Pause running animation
  , pause: function() {
      if (this.situation.play === true) {
        this.situation.play  = false
        this.situation.pause = new Date().getTime()
      }

      return this
    }
    // Play running animation
  , play: function() {
      if (this.situation.play === false) {
        var pause = new Date().getTime() - this.situation.pause
        
        this.situation.finish += pause
        this.situation.start  += pause
        this.situation.play    = true
      }

      return this
    }
    
  }

  // Define parent class
, parent: SVG.Element

  // Add method to parent elements
, construct: {
    // Get fx module or create a new one, then animate with given duration and ease
    animate: function(d, ease, delay) {
      return (this.fx || (this.fx = new SVG.FX(this))).stop().animate(d, ease, delay)
    }
    // Stop current animation; this is an alias to the fx instance
  , stop: function(fulfill) {
      if (this.fx)
        this.fx.stop(fulfill)
      
      return this
    }
    // Pause current animation
  , pause: function() {
      if (this.fx)
        this.fx.pause()

      return this
    }
    // Play paused current animation
  , play: function() {
      if (this.fx)
        this.fx.play()

      return this
    }
    
  }
})