global_oro_variables = {};
global_oro_variables.menu_scale = 0.05;
global_oro_variables.minimap_scale = 0.2;
global_oro_variables.menu_item_size = 1024;
global_oro_variables.item_group_size = 700;
global_oro_variables.svgPan;
global_oro_variables.selected;
global_oro_variables.gui;

getDecimalNo = function(path){
    var box = path.bbox();
    var diag = Math.sqrt(Math.pow(box.width,2)+Math.pow(box.height,2));
    var decim = 6 - diag.toFixed(0).toString().length ;
    if(decim < 0) decim = 0;
}

clone = function(obj) {
    if (null == obj || "object" != typeof obj) return obj;
    var copy = obj.constructor();
    for (var attr in obj) {
        if (obj.hasOwnProperty(attr)) copy[attr] = obj[attr];
    }
    return copy;
}

onlyUnique = function onlyUnique(value, index, self) { 
    return self.indexOf(value) === index;
}

//ORO (String) points -> Array (for text, image - width/height/x/y)
split_oro_points = function (pointList){
    var points = '[' + pointList + ']';
    points = JSON.parse(points);
    return points;
}

//ORO (String) path coordinates for paths -> SVGjs (String) path coordinates
split_oro_path_points = function (pointList, notclosed){
    var points = JSON.parse(pointList);
    var path = "";
    for(var l in points){
        if(notclosed)
            path = path + "M" + points[l].join(" ");
        else
            path = path + "M" + points[l].join(" ") + "Z";
    }
    return path;
}


//ex coords_array
//SVGjs coord (Array) -> ORO coord (Array)
pathArraySvgOro = function (svgArr) {
    var result = [];
    for(var a in svgArr){
        if(svgArr[a][0] == "M"){
            result.push( [ [ svgArr[a][1], svgArr[a][2] ] ] );
        }
        else
            if(svgArr[a][0] == "L"){
                result[result.length-1].push( [ svgArr[a][1], svgArr[a][2] ] );
            }
    }
    return result;
}

//ex XYcoords_array
//SVGjs coord (Array) -> {X:,Y:} coord (Array) ; (clipper)
pathArraySvgXY = function (svgArr) {
    var result = [];
    for(var a in svgArr){
        if(svgArr[a][0] == "M"){
            result.push( [ { X: svgArr[a][1], Y: svgArr[a][2] } ] );
        }
        else
            if(svgArr[a][0] == "L"){
                result[result.length-1].push( { X: svgArr[a][1], Y: svgArr[a][2] } );
            }
    }
    return result;
}

//ex XYcoords_arrayDB
//{X:,Y:} coord (Array) -> ORO coord (Array)
pathArrayXYOro = function (svgArr) {
    for(var l in svgArr){
        for(var p in svgArr[l]){
            svgArr[l][p] = [ svgArr[l][p].X, svgArr[l][p].Y ];
        }
    }
    return svgArr;
}

//ORO (Array) coord -> {X:,Y:} coord (Array)
pathArrayOroXY = function (oroArr) {
    for(var l in oroArr){
        for(var p in oroArr[l]){
            oroArr[l][p] = { "X": oroArr[l][p][0], "Y": oroArr[l][p][1] };
        }
    }
    return oroArr;
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
/*
//{X:,Y:} coord (Array) -> SVGjs coord (Array)
pathArrayXYOro = function (svgArr) {
    for(var l in svgArr){
        for(var p in svgArr[l]){
            svgArr[l][p] = [ svgArr[l][p].X, svgArr[l][p] ];
        }
    }
    return svgArr;
}
*/
