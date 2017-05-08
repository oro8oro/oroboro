global_oro_variables = {};
global_oro_variables.menu_scale = 0.05;
global_oro_variables.minimap_scale = 0.2;
global_oro_variables.menu_item_size = 1024;
global_oro_variables.item_group_size = 700;
global_oro_variables.svgPan;
global_oro_variables.selected;
global_oro_variables.gui;
global_oro_variables.connections = {};
global_oro_variables.subscriptionhandles = {};
global_oro_variables.templates = {}
global_oro_variables.vips = {
  oroboro: "JZXXMo5N38iwgfNAG",
  myWork: "PRRyiPWSw8xj82T8F",
  gallery: "npjQetAK5bfSp5v8K",
  tutorial: "w7kkK7GvdDWz29Bdz",
  development: "AXPzGY3BcQdNCXMyC",
  about: "37u7npbMF6NvccC6u",
  playground: "mmZmkPGbRDEhuBg5p",
  button_ratings: "NSYBMJY4ydxHttuyj"
}

console.orolog = function() {
  console.log.apply(null, arguments);
}

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

//difference between arrays
diff = function(foo, bar){
    var baz = [];

    foo.forEach(function(key) {
        if (-1 === bar.indexOf(key)) {
            baz.push(key);
        }
    }, this);

    return baz;
}

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


//ORO (String) points -> Array (for text, image - width/height/x/y)
split_oro_points = function (pointList){
    var points = '[' + pointList + ']';
    points = JSON.parse(points);
    return points;
}

//ORO (String) path coordinates for paths -> SVGjs (String) path coordinates
split_oro_path_points = function (pointList, open){
    var points = JSON.parse(pointList);
    var path = "";
    for(var l in points){
        if(open)
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
  console.log('getElementPath', id);
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

recursive_depends = function recursive_depends(fileId, rel, level_dep, level){
  console.log('recursive_depends')
    var deps = Dependency.find({fileId1: fileId, type: rel}).fetch();
    if(!level_dep[level])
        level_dep[level] = [];
    for(var d in deps){
        level_dep[level].push(deps[d].fileId2);
        recursive_depends(deps[d].fileId2, rel, level_dep, level + 1);
    }
    return level_dep;
}

getDependencies = function(fileId, rel){
    var level_dep = [];
    var js_dep = [];
    level_dep = recursive_depends(fileId, rel, level_dep, 0);
    if(level_dep)
        for(var i = level_dep.length-1; i >= 0; i--){
            js_dep = js_dep.concat(level_dep[i]);
        }
    js_dep = js_dep.filter(onlyUnique);
    return js_dep;
}

separate_deps = function separate_deps(js_dep,type){
    if(js_dep.length > 0){
        var result = [];
        for(j in js_dep){
            var f = File.findOne({_id: js_dep[j], fileType: type});
            if(f)
                result.push(f);
        }
        return result;
    }
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

getFilePath = function(id, type, path){
    if(typeof path === 'undefined')
        path = [id];
    if(typeof type === 'undefined')
        type = 1;
    var d = Dependency.findOne({fileId1: id, type: type});
    if(d){
        path.push(d.fileId2);
        path = getFilePath(d.fileId2, type, path);
    }
    return path;
}
/*
getFilePath = function getFilePath(id){
    var deps = getDependencyPath(id);
    var ids = [id];
    for(d in deps){
        ids.push(deps[d].fileId2);
    }
    return ids;
}
*/


recursive_group_ids = function (groupId, ids){
  console.log('recursive_group_ids groupId', groupId);
    if(!ids)
        ids = {items: [], groups: []};
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
//no linked groups
recursive_group_elements = function (groupId, ids){
  console.log('recursive_group_elements groupId', groupId)
    if(!ids)
        ids = {items: [], groups: []};
    var items = Item.find({groupId: groupId}).fetch();
    if(items && items.length > 0)
        ids.items = ids.items.concat(items);
    var subgroups = Group.find({ groupId: groupId }).fetch();
/*
    var linked = Dependency.find({fileId1: groupId, type: {$in: [2, 5]}}).fetch();
    for(i in linked)
      subgroups.push(Group.find({_id: linked[i]._id}));
*/
    if(subgroups && subgroups.length > 0){
        ids.groups = ids.groups.concat(subgroups);
        for(var i = 0; i < subgroups.length; i++)
            ids = recursive_group_elements(subgroups[i]._id, ids);
    }

    return ids;
}

file_components_elements = function(id){
    var groups = Group.find({ fileId: id }).fetch();
    var ids = {};
    ids.groups = [];
    ids.items = [];
    ids.groups = ids.groups.concat(groups);
    for(i in groups)
      ids = recursive_group_elements( groups[i]._id, ids);
    return ids;
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
