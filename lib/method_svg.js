getDecimalNo = function(path){
    var box = path.bbox();
    var diag = Math.sqrt(Math.pow(box.width,2)+Math.pow(box.height,2));
    var decim = 5 - diag.toFixed(0).toString().length ;
    if(decim < 0) decim = 0;
}

//ORO (String) points -> Array (for text, image - width/height/x/y)
split_oro_points = function (pointList){
    var points = pointList.match(/[0-9]*/g);
    points.splice(points.lastIndexOf(""),1);
    points = points.join();
    points = points.split(",,");
    return points;
}

//ORO (String) path coordinates for paths -> SVGjs (String) path coordinates
split_oro_path_points = function (pointList){
    var points = JSON.parse(pointList);
    console.log(points);
    var path = "";
    for(var l in points){
        path = path + "M" + points[l].join(" ") + "z";
    }
    return path;
}


build_group_client = function (g, group){
    var items = Item.find({groupId: group._id}, {sort: {ordering:1}}).fetch();
    console.log(items);
    if(items.length > 0){
        for(var i in items){
            console.log(items[i]);
            var type = items[i].type;
            if(type == 'text'){
                var item = g[type](items[i].text).attr("id", items[i]._id);
                var points = split_oro_points(items[i].pointList);
                item.fill(items[i].fillColor).stroke({color: items[i].strokeColor, width: items[i].strokeWidth}).move(points[0],points[1]);
            }
            else
                if(type == 'rasterImage'){
                    var points = split_oro_points(items[i].pointList);
                    var item = g["image"](items[i].text).attr("id", items[i]._id).move(points[0],points[1]).size(points[2],points[3]);
                }
                else
                    if(type == 'simple_path'){
                        var points = split_oro_path_points(items[i].pointList);
                        var item = g.path(points).attr("id", items[i]._id);
                        item.fill(items[i].fillColor).stroke({color: items[i].strokeColor, width: items[i].strokeWidth});
                    }
                    else 
                        if(type == 'polyline'){
                            if(items[i].closed == true){
                                var points = split_oro_points(items[i].pointList);
                                var item = g["polygon"](points).attr("id", items[i]._id);
                                item.fill(items[i].fillColor).stroke({color: items[i].strokeColor, width: items[i].strokeWidth});
                            }
                            else{
                                var points = split_oro_points(items[i].pointList);
                                var item = g[type](points).attr("id", items[i]._id);
                                item.fill(items[i].fillColor).stroke({color: items[i].strokeColor, width: items[i].strokeWidth});
                            }
                        }
                        else
                            if(type == 'complex_path'){
                                var item = g.path(items[i].pointList).attr("id",items[i]._id).attr("type", items[i].type);
                                item.fill(items[i].fillColor).stroke({color: items[i].strokeColor, width: items[i].strokeWidth});
                            }        
            if(group.type == "menu_item"){
                item.size(700);
                item.cx(512);
                item.cy(512);
            }
            item.doc();
        }
    }
}

recursive = 0;
recursive_group_client = function (parent, group){
    if(recursive > 100) return;
    recursive = recursive + 1;
    var subgroups = Group.find({ groupId: group._id }, { sort: { ordering:1 }}).fetch();
    var subparent = parent.group().attr("id", group._id).attr("type", group.type).attr("name", group.uuid);
    console.log(group);
    if(group.transparency)
        subparent.opacity(group.transparency);
    var linkedgroups = null;
    var linked = Dependency.find({fileId1: group._id, type:2}).fetch();
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
    var adapter = [];
    build_group_client(subparent, group);
    if(subgroups.length > 0){
        for(g in subgroups){
            adapter[g] = subparent.group().attr("name","adapter_"+g);
            if(linkedgroups != null){
                for(var l in linkedgroups){
                    if(recursive > 150) return;
                    recursive = recursive + 1;
                    var linkgroup = adapter[g].group().attr("name","link_group_"+l);
                    console.log(linkgroup);
                    console.log(linkedgroups[l]);
                    if(linkedgroups[l].transparency)
                        linkgroup.opacity(linkedgroups[l].transparency);
                    build_group_client(linkgroup, linkedgroups[l]);
                }
            }
            recursive_group_client(adapter[g], subgroups[g]);//*
        }
    }
    if(group.type == "menu"){
        var ini = 1;
        var menu_button = subparent.group().attr("id","menu_button");
        menu_button.add(adapter[0]);
        var menu_content = subparent.group().attr("id","menu_content");
        for(var i = 1 ; i < adapter.length ; i++)
            menu_content.add(adapter[i]);
        //adapter[0].on('click', function(event){});
    }
    else
        var ini = 0;
    if(group.parameters){
        var col = group.parameters.col;
        var row = group.parameters.row;
        console.log(adapter);
        console.log(adapter.length);
        var r = Math.floor((adapter.length-ini)/col)+1;
        console.log(r);
        var c = [];
        if(r>1){
            for(var i = 0 ; i < r-1 ; i++)
                c[i] = { "ini" : 0 , "end" : col };
            c[r-1] = { "ini" : 0 , "end" : adapter.length - (r-1)*col};
        }
        else
            c[r-1] = { "ini" : 0 , "end" : adapter.length};
        c[0].ini = ini;
        c[0].end = col + ini;
        console.log(c);
        var st = 0;
        var hg = 0;
        but = [];
        for(var i = 0 ; i < r ; i++){
            but[i] = [];
            for(var j = c[i].ini ; j < c[i].end ; j++){
                console.log("i: "+i);
                console.log("j: "+j);
                console.log("x "+st);
                console.log("y "+hg);
                but[i][j] = adapter[ i*col + j].transform({x:st,y:hg});
                console.log(i*col + j);
                st = st + 1024;
                
                but[i][j].on('click', function(event){
                    var k = this.children();
                    for(var t in k){
                        if(k[t].node.getAttribute("type") == "menu_item")
                            console.log(k[t].node.getAttribute("id"));
                    }
                    this.fill({ color: '#f06' });
                });
                but[i][j].on('mouseout', function(event){
                    this.fill({ color: '#000' });
                });
                but[i][j].on('mouseover', function(event){
                    this.scale();
                });
            }
            hg = hg + 1024;
            st = 0;
        }
    }
    if(group.type == "menu"){
        var kids = menu_button.first().children();
        //var inner, outer;
        for(k in kids){
            if(kids[k].node.getAttribute("type") != "menu_item")
                space = kids[k].first().width() / 2;
            //else outer = kids[k].first().width();
        }
        //var space = (outer - inner) / 4;
        menu_button.move(space,space);
        menu_content.move(space,space);
        menu_content.hide();
        menu_button.on('click', function(event){
            menu_content.show();
            menu_button.hide();
        });
        menu_content.on('click', function(event){
            menu_button.show();
            menu_content.hide();
        })
    }

    
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

//ex temp_complexity
//gives no of points for simplified path (in transforming from complex to simple) (SVGjs Path) -> (Number)
no_of_points = function (path) {
    var box = path.bbox();
    var diag = Math.sqrt(Math.pow(box.width,2) + Math.pow(box.height,2));
    var len = path.length();
    var ct1 = 4.5;
    var ct2 = 1;
    var no_of_points = Math.floor(len/diag * ct1 * path.array.value.length);
    console.log(path.attr("name") + " should have no_of_points: ", no_of_points);
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
    console.log("COMPLEXITY: "+path.attr("name") + ": " + complexity);
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

//simplify complex paths with H and V
simplifyPathHV = function(path) {
    var svgArr = path.array.value;
    for(var a in svgArr){
        if(svgArr[a][0] == "H"){
            svgArr[a][0] = "L";
            svgArr[a][2] = 0;
        }
        else
            if(svgArr[a][0] == "h"){
                svgArr[a][0] = "l";
                svgArr[a][2] = 0;
            }
            else
                if(svgArr[a][0] == "V"){
                    svgArr[a][0] = "L";
                    svgArr[a][2] = svgArr[a][1];
                    svgArr[a][1] = 0;
                }
                else
                    if(svgArr[a][0] == "v"){
                        svgArr[a][0] = "l";
                        svgArr[a][2] = svgArr[a][1];
                        svgArr[a][1] = 0;
                    }
    }
    console.log(svgArr);

    path.array.value = svgArr;
    console.log(path.attr("d"));
    //path.plot()
    console.log(path);
    console.log(path.array.value);
    return path;
}

//ex to_simple_path
//simplifies complex paths (SVGjs complex Path) -> ORO path coord (String); if simple Path -> it returns unchanged
simplifyPath = function (path) {
    path = simplifyPathHV(path);
    if(checkPathType(path) == "simple"){
        console.log("it's simple");
        return JSON.stringify(pathArraySvgOro(path.array.value));
    }
    else{
        console.log("it's complex");
        var no_points = no_of_points(path);
        var points_array = getSimplePathArray(path, no_points);
        console.log(points_array);
        points_array = pathArrayOroXY(points_array);
        console.log(points_array);
        var new_path = ClipperLib.Clipper.SimplifyPolygon(points_array[0], ClipperLib.PolyFillType.pftNonZero);
        return JSON.stringify(pathArrayXYOro(new_path));
    }
}

