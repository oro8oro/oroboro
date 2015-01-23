
//split_points = function split_points(pointList){
    //var points = pointList.match(/[0-9]*/g);
    /*points.splice(points.lastIndexOf(""),1);
    points = points.join();
    points = points.split(",,");
    return points;
}

path_points = function path_points(pointList){
    var points = JSON.parse(pointList);
    var path = "";
    for(var l in points){
        path = path + "M" + points[l].join(" ") + "z";
    }
    return path;
}
*/
build_group = function build_group(group){
    var result = '';
    var items = Item.find({groupId: group._id}, {sort: {ordering:1}}).fetch();
    for(var i in items){
        if(items[i].type == 'rasterImage'){
            var points = split_oro_points(items[i].pointList);
            var itemscript = '<image xlink:href="' + items[i].text + '" id="' + items[i]._id + '" height="' + points[1] + '" width="' + points[0] + '" x="' + points[2] + '" y="' + points[3] + '"/>';
        }
        else 
            if(items[i].type == 'text'){
                var points = items[i].pointList.split(",");
                var itemscript = '<text xml:space="preserve" text-anchor="middle" font-family="Sans-serif" font-size="14" id="' + items[i]._id + '" x="' + points[0] + '" y="' + points[1] + '" stroke-linecap="null" stroke-linejoin="null" stroke-dasharray="null" stroke-width="' + items[i].strokeColor + '" stroke="' + items[i].strokeColor + '" fill="' + items[i].fillColor + '">' + items[i].text + '</text>';
            }
            else
                if(items[i].type == 'polyline'){
                    if(items[i].closed == false)
                        var itemscript = '<polyline fill="' + items[i].fillColor + '" stroke-width="' + items[i].strokeColor + '" stroke="' + items[i].strokeColor + '" points="' + items[i].pointList + '"/>';
                    else
                        var itemscript = '<polygon points="' + items[i].pointList + '"/>';
                }
                else
                    if(items[i].type == 'simple_path'){
                        var points = split_oro_path_points(items[i].pointList);
                        var itemscript = '<path d="' + points + '" fill="' + items[i].fillColor + '" stroke-width="' + items[i].strokeColor + '" stroke="' + items[i].strokeColor + '" name="' + items[i].text + '"/>';
                    }
        result = result + itemscript;
    }
    return result;
}

recursive_group = function recursive_group(group){
    var subgroups = Group.find({ groupId: group._id }, { sort: { ordering:1 }}).fetch();
    var script = '<g><title>' + group._id + '</title>';
    script = script + build_group(group);
    if(subgroups.length > 0){
        for(g in subgroups)
            script = script + recursive_group(subgroups[g]);
    }
    script = script + '</g>';
    return script;
}

js_dep = [];

recursive_depends = function recursive_depends(fileId, rel){
    var deps = Dependency.find({fileId1: fileId, type: rel}).fetch();
    if(deps.length > 0)
        for(var d in deps){
            if(js_dep.indexOf(deps[d].fileId2) == -1){
                js_dep.push(deps[d].fileId2);
                recursive_depends(deps[d].fileId2, rel);
            }
        }
}

//<script xlink:href="file_name" />
Meteor.methods({
    getFileScript: function (fileId){
        var file = File.findOne({_id: fileId});
        if(file.fileType == "image/svg+xml"){
            var result = '<svg width="' + file.width + '" height="' + file.height + '" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" onload="init()">';
            var end = '</svg>';
        }
        scripts = '';
        recursive_depends(fileId, 3);
        for(var s in js_dep){
            scripts = scripts + '<script xlink:href="' + '/file/' + js_dep[s] + '" />';
        }
        js_dep = [];
        scripts = scripts + '<script type="application/javascript">function init(){' + file.script + '}</script>'
        result = result + scripts;
        //result = result + '<script type="application/javascript">' + file.script + '</script>';
        var groups = Group.find({fileId: fileId}, {sort: {ordering:1}}).fetch();
        for(var g in groups){
            result = result + recursive_group(groups[g]);
        }
        result = result + end;
        //console.log(result);
        return result;
    },
    getGroupScript: function(groupId){
        var group = Group.findOne({_id: groupId});
        var result = '<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">' + recursive_group(group) + '</svg>';
        return result;
    },
    getDependencies: function(fileId){
        scripts = [];
        recursive_depends(fileId, 3);
        for(var s in js_dep){
            scripts.push('/file/' + js_dep[s]);
        }
        js_dep = [];
        return scripts;
    }
    /*
    getGroup: function(groupId){
        var group = Group.findOne({_id: groupId});
        return recursive_group(group);
    }*/
});
