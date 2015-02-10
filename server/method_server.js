addAtributes = function addAtributes(palette){
    var str = '';
    if(palette.strokeColor == 'none')
        str = str + ' stroke="none"';
    else
        if(palette.strokeColor.substring(0,1) == "#")
            str = str + ' stroke="' + palette.strokeColor + '"';
        else
            str = str + ' stroke="' + '#' + palette.strokeColor.substring(0,6) + '"';
    if(palette.strokeWidth)
        str = str + ' stroke-width="' + palette.strokeWidth + '"';
    if(palette.fillColor == 'none')
        str = str + ' fill="none"';
    else
        if(palette.fillColor.substring(0,1) == "#")
            str = str + ' fill="' + palette.fillColor + '"';
        else
            str = str + ' fill="' + '#' + palette.fillColor.substring(0,6) + '"';
    if(palette.strokeDasharray)
        str = str + ' stroke-dasharray="' + palette.strokeDasharray + '"';
    if(palette.strokeLinejoin)
        str = str + ' stroke-linejoin="' + palette.strokeLinejoin + '"';
    if(palette.strokeLinecap)
        str = str + ' stroke-linecap="' + palette.strokeLinecap + '"';
    return str;
}


build_group = function build_group(group){
    var result = '';
    var items = Item.find({groupId: group._id}, {sort: {ordering:1}}).fetch();
    for(var i in items){
        if(items[i].type == 'rasterImage'){
            var points = split_oro_points(items[i].pointList);
            var itemscript = '<image xlink:href="' + items[i].text + '" id="' + items[i]._id + '" height="' + points[3] + '" width="' + points[2] + '" x="' + points[0] + '" y="' + points[1] + '"/>';
        }
        else 
            if(items[i].type == 'text'){
                var points = items[i].pointList.split(",");
                var itemscript = '<text xml:space="preserve" text-anchor="middle" font-family="' + items[i].font.family + '" font-size="' + items[i].font.size + '" id="' + items[i]._id + '" x="' + points[0] + '" y="' + points[1] + '"' + addAtributes(items[i].palette);
                if(items[i].font.style)
                    itemscript = itemscript + ' font-style="' + items[i].font.style + '" ';
                if(items[i].font.weight)
                    itemscript = itemscript + 'font-weight="' + items[i].font.weight + '" ';
                itemscript = itemscript + '>' + items[i].text + '</text>';
            }
            else
                if(items[i].type == 'polyline'){
                    if(items[i].closed == false)
                        var itemscript = '<polyline points="' + items[i].pointList + '"' + addAtributes(items[i].palette) + '/>';
                    else
                        var itemscript = '<polygon points="' + items[i].pointList + '"' + addAtributes(items[i].palette) + '/>';
                }
                else
                    if(items[i].type == 'simple_path'){
                        var points = split_oro_path_points(items[i].pointList);
                        var itemscript = '<path d="' + points + '" name="' + items[i].text + '"' + addAtributes(items[i].palette) + '/>';
                    }
                    else
                        if(items[i].type == 'complex_path'){
                            var points = items[i].pointList;
                            var itemscript = '<path d="' + points + '" name="' + items[i].text + '" id="' + items[i]._id + '" type="' + items[i].type + '"' + addAtributes(items[i].palette) + '/>';
                        }
                        else
                            if(items[i].type == 'embedediFrame'){
                                var points = split_oro_points(items[i].pointList);
                                var itemscript = '<foreignObject x="' + points[0] + '" y="' + points[1] + '" height="' + points[3] + '" width="' + points[2] + '" id="' + items[i]._id + '" type="' + items[i].type + '"><div xmlns="http://www.w3.org/1999/xhtml"><iframe xmlns="http://www.w3.org/1999/xhtml" width="' + points[2] + '" height="' + points[3] + '" src="' + items[i].text + '" frameborder="0" ></iframe></div></foreignObject>';
                            }
                            else
                                if(items[i].type == 'embededCanvas'){
                                    //var points = split_oro_points(items[i].pointList);
                                    //var itemscript = '<foreignObject x="' + points[0] + '" y="' + points[1] + '" width="' + points[2] + '" height="' + points[3] + '" id="' + items[i]._id + '" type="' + items[i].type + '"><div xmlns="http://www.w3.org/1999/xhtml"><xhtml:canvas width="' + points[2] + '" height="' + points[3] + '" ></xhtml:canvas></div></foreignObject>';
                                    var itemscript = '';
                                }    
        result = result + itemscript;
    }
    return result;
}

recursive_group = function recursive_group(group){
    var subgroups = Group.find({ groupId: group._id }, { sort: { ordering:1 }}).fetch();
    var script = '<g id="' + group._id + '" type="' + group.type + '"';
    if(group.transform)
        script = script + ' transform="matrix(' + group.transform + ')"';
    script = script + '>';
    if(group.type == "layer")
        script = script + '<title>' + group._id + '</title>';
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
            var result = '<svg width="' + file.width + '" height="' + file.height + '" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" onload="init()" id="' + fileId + '">';
            var end = '</svg>';
        }
        scripts = '';
        recursive_depends(fileId, 3);
        for(var s in js_dep){
            scripts = scripts + '<script xlink:href="' + '/file/' + js_dep[s] + '" />';
        }
        js_dep = [];
        if(file.script)
            scripts = scripts + '<script type="application/javascript">function init(){' + file.script + '}</script>'
        else
            scripts = scripts + '<script type="application/javascript">function init(){}</script>'
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
    },
    /*
    getGroup: function(groupId){
        var group = Group.findOne({_id: groupId});
        return recursive_group(group);
    }*/
    getFileItems: function(fileId){
        return;
    },
    getGroupItems: function(groupId){
        return;
    }
});
