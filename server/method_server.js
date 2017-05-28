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
    if(palette.strokeOpacity)
        str = str + ' stroke-opacity="' + palette.strokeOpacity + '"';
    if(palette.fillColor == 'none')
        str = str + ' fill="none"';
    else
         if(palette.fillColor.substring(0,1) == "#" || palette.fillColor.indexOf('url') != -1)
            str = str + ' fill="' + palette.fillColor + '"';
        else
            str = str + ' fill="' + '#' + palette.fillColor.substring(0,6) + '"';
    if(palette.fillOpacity)
        str = str + ' fill-opacity="' + palette.fillOpacity + '"';
    if(palette.strokeDasharray)
        str = str + ' stroke-dasharray="' + palette.strokeDasharray + '"';
    if(palette.strokeLinejoin)
        str = str + ' stroke-linejoin="' + palette.strokeLinejoin + '"';
    if(palette.strokeLinecap)
        str = str + ' stroke-linecap="' + palette.strokeLinecap + '"';
    if(palette.opacity)
        str = str + ' opacity="' + palette.opacity + '"';
    return str;
};

build_item = function build_item(item){
  //console.orolog('build_item', item._id)
    if(item.type == 'rasterImage' || item.type == 'formulae' || item.type == 'qrcode'){
            var points = split_oro_points(item.pointList);
            var itemscript = '<image xlink:href="' + htmlEntities(item.text) + '" id="' + item._id + '" height="' + points[3] + '" width="' + points[2] + '" x="' + points[0] + '" y="' + points[1] + '"/>';
    }
    else if(item.type == 'text'){
            var points = item.pointList.split(",");
            var itemscript = '<text xml:space="preserve"' + ' id="' + item._id + '" x="' + points[0] + '" y="' + points[1] + '"' + addAtributes(item.palette);
            if(item.font){
                if(item.font.size)
                    itemscript = itemscript + ' font-size="' + item.font.size + '"';
                if(item.font.family)
                    itemscript = itemscript + ' font-family="' + item.font.family + '"';
                if(item.font.style)
                    itemscript = itemscript + ' font-style="' + item.font.style + '"';
                if(item.font.weight)
                    itemscript = itemscript + ' font-weight="' + item.font.weight + '"';
                if(item.font.textAnchor)
                    itemscript = itemscript + ' text-anchor="' + item.font.textAnchor + '"';
            }
            itemscript = itemscript + '>' + '<tspan dy="' + (Number(item.font ? item.font.size : 10)*1.27) + '" x="' + points[0] + '">' + item.text + '</tspan>' + '</text>';
    }
    else if(item.type == 'polyline'){
            if(item.closed == false)
                var itemscript = '<polyline points="' + item.pointList + '"' + addAtributes(item.palette) + '/>';
            else
                var itemscript = '<polygon points="' + item.pointList + '"' + addAtributes(item.palette) + '/>';
    }
    else if(item.type == 'simple_path' || item.type == 'para_simple_path' || item.type == 'pathEquation' || item.type == 'pathEquationPolar'){
            if(!item.closed || item.closed == "false")
                    var points = split_oro_path_points(item.pointList, true);
            else
                var points = split_oro_path_points(item.pointList);
            var itemscript = '<path d="' + points + '" id="' + item._id + '" type="' + item.type + '" name="' + item.text + '"' + addAtributes(item.palette) + '/>';
    }
    else if(item.type == 'complex_path' || item.type == 'para_complex_path'){
            var points = item.pointList;
            var itemscript = '<path d="' + points + '" name="' + item.text + '" id="' + item._id + '" type="' + item.type + '"' + addAtributes(item.palette) + '/>';
    }
    else if(item.type == 'embeddediFrame'){
            var points = split_oro_points(item.pointList);
            var itemscript = '<foreignObject x="' + points[0] + '" y="' + points[1] + '" height="' + points[3] + '" width="' + points[2] + '" id="' + item._id + '" type="' + item.type + '"><div xmlns="http://www.w3.org/1999/xhtml"><iframe xmlns="http://www.w3.org/1999/xhtml" id="embeddediFrame_' + item._id + '" width="' + points[2] + '" height="' + points[3] + '" src="' + item.text + '" frameborder="0" ></iframe></div></foreignObject>';
    }
    else if(item.type == 'embeddedCanvas'){
            var points = split_oro_points(item.pointList);
            var itemscript = '<foreignObject x="' + points[0] + '" y="' + points[1] + '" width="' + points[2] + '" height="' + points[3] + '" id="' + item._id + '" type="' + item.type + '"><div xmlns="http://www.w3.org/1999/xhtml"><canvas xmlns="http://www.w3.org/1999/xhtml" id="embeddedCanvas_' + item._id + '" width="' + points[2] + '" height="' + points[3] + '" ></canvas></div></foreignObject>';
    }
    else if(item.type == 'embeddedHtml'){
            var points = split_oro_points(item.pointList);
            var itemscript = '<foreignObject x="' + points[0] + '" y="' + points[1] + '" height="' + points[3] + '" width="' + points[2] + '" id="' + item._id + '" type="' + item.type + '"><div xmlns="http://www.w3.org/1999/xhtml" id="embeddedHtml_' + item._id + '">' + item.text + '</div></foreignObject>';
    }
    else if(item.type == 'nestedSvg'){
            var points = split_oro_points(item.pointList);
            var itemscript = '<svg width="' + points[2] + '" height="' + points[3] + '" x="' + points[0] + '" y="' + points[1] + '" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" id="' + item._id + '"></svg>';
    }

    return itemscript;
}

addLink = function(script, link) {
  if(!link)
    return script;
  return '<a xlink:href="' + link + '">' + script + '</a>';
}

build_group = function build_group(group){
    var items = Item.find({groupId: group._id}, {sort: {ordering:1}}).fetch();
    var result = items.reduce(function(script, it) {
      return script + (
        it.link ?
          addLink(build_item(it), it.link) :
          build_item(it)
        );
    }, '');
    return result;
}

recursive_group = function recursive_group(group){
  //console.orolog('recursive_group', group._id);
    var subgroups = Group.find({ groupId: group._id }, { sort: { ordering:1 }}).fetch();
    if(group.type == 'parametrizedGroup' && group.parameters)
        script = group.parameters.output;
    else{
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
    }
    if(group.link)
      script = addLink(script, group.link);
    return script;
}
/*
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
*/
//<script xlink:href="file_name" />
Meteor.methods({
  setSvg: function(fileId) {
    var script = Meteor.call('getFileScript', fileId);
    File.update({_id: fileId}, {$set: {svg: script}});
  },
    getFileScript: function (fileId, scale, notemplate){
      //console.orolog('getFileScript fileId', fileId)
        var file = File.findOne({_id: fileId});
        if(scale){
            file.width = file.width * scale
            file.height = file.height * scale
        }
        if(file.fileType == "image/svg+xml"){
            var result = '<svg width="' + file.width + '" height="' + file.height + '" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" onload="init()" id="' + fileId + '">';
            var end = '</svg>';
        }
        scripts = '';
        //scripts = '<script type="application/ecmascript" xlink:href="/file/require.js" /> ';
        if(file.script)
            scripts = scripts + '<script type="application/javascript"> <![CDATA[ \n' + file.script + '\n ]]> </script>'
        else
            scripts = scripts + '<script type="application/javascript"> <![CDATA[ \nfunction init(){}\n ]]> </script>'
        //recursive_depends(fileId, 3);
        var js_dep = getDependencies(fileId, 3);
        for(var s in js_dep){
            scripts = scripts + '<script type="application/ecmascript" xlink:href="' + '/file/' + js_dep[s] + '" />';
        }
        js_dep = [];
        result = result + scripts;
        //result = result + '<script type="application/javascript">' + file.script + '</script>';
        if(scale){
            result = result + '<g id="viewport" transform="matrix(' + scale + ' 0 0 ' + scale + ' 0 0)">';
            end = '</g>' + end;
            var templateheight = file.height / scale
            var templatewidth = file.width / scale
        }
        else{
            var templateheight = file.height
            var templatewidth = file.width
        }
        var groups = Group.find({fileId: fileId}, {sort: {ordering:1}}).fetch();
        if(file.parameters && file.parameters.templatepath && !notemplate){
            var templates = file.parameters.templatepath;
            for(var i = 0; i < templates.length; i++){
                result = result + '<g id="templategroup_'+templates[i]+'" type="layer"><image xlink:href="/file/' + templates[i] + '" id="templategroup_'+templates[i]+'" height="' + templateheight + '" width="' + templatewidth + '" x="' + 0 + '" y="' + 0 + '"/></g>';
            }
        }
        for(var g in groups){
            if(!groups[g].parameters || !groups[g].parameters.hide || groups[g].parameters.hide == 'false')
                result = result + recursive_group(groups[g]);
        }
        result = result + end;
        return result;
    },
    getGroupScript: function(groupId){
        var group = Group.findOne({_id: groupId});
        var result = recursive_group(group);
        return result;
    },
    getItemScript: function(itemId){
        var item = Item.findOne({_id: itemId});
        var result = build_item(item);
        return result;
    },
    getDependencies: function(fileId){
      //console.orolog('getDependencies', fileId)
        scripts = [];
        recursive_depends(fileId, 3);
        for(var s in js_dep){
            scripts.push('/file/' + js_dep[s]);
        }
        js_dep = [];
        return scripts;
    },
    buildFileNoOfChildren: function(filesIds){
        if(filesIds)
            var query = {_id: {$in: filesIds}};
        else
            var query = {};
        File.find(query).forEach(function(file){
            var count = Dependency.find({fileId2: file._id}).count();
            File.update({_id: file._id}, {$set: {noofchildren: count} });
        });
    },
    searchCollection: function(col, fields, string, options, otherquery){
        check(col, String);
        check(fields, [String]);
        check(string, String);
        check(options, String);

        var regex = {};
        regex['$regex'] = string;
        regex['$options'] = options;
        var query = [];
        for(var i = 0 ; i < fields.length; i++){
            query[i] = {};
            query[i][fields[i]] = regex;
        }
        query = { $or: query};
        if(otherquery)
            query = {$and: [ otherquery, query ]};
        var res = Collections[col].find(query).fetch();
        return res;
    },
    getFirstElement: function(fileId){
        check(fileId, String)

        var res = {}
        var g = Group.findOne({fileId: fileId, type: 'layer'},{sort: {ordering: 1}});
        var elem = Group.findOne({groupId: g._id},{sort: {ordering: 1}});
        if(elem)
            res.type = 'group'
        else{
            var elem = Item.findOne({groupId: g._id},{sort: {ordering: 1}});
            res.type = 'item'
        }
        res.elem = elem

        return res
    },
    getDepsIds: function(id, label, type, skip, limit){
        check(id, String);
        check(label, String);

        var q = {}
        var opt = {sort: {dateModified: -1}}
        q[label] = id

        if(label == 'fileId2')
            var depFile = 'fileId1'
        else
            var depFile = 'fileId2'

        if(type)
            q.type = type
        if(skip){
            check(skip, Number)
            opt.skip = skip
        }
        if(limit){
            check(limit, Number)
            opt.limit = limit
        }
        var ids = Dependency.find(q).map(function(doc){
            return doc[depFile]
        })
        var fileids = File.find({_id: {$in: ids}}, opt).map(function(doc){
            return doc._id
        })
        var result = []
        for(var i = 0 ; i < ids.length ; i++)
            if(fileids.indexOf(ids[i]) != -1)
                result.push(ids[i])
        q[depFile] = {$in: result}
        ids = Dependency.find(q).map(function(doc){
            return doc._id
        })
        return ids
    },
    getDependantFileIds: function(id, label, type, skip, limit){
        check(id, String);
        check(label, String);
        check(type, Number);
        check(skip, Number)
        check(limit, Number)
        //console.orolog('getDependantFileIds', id)

        var q = {type: type}
        q[label] = id
        if(label == 'fileId2')
            var depFile = 'fileId1'
        else
            var depFile = 'fileId2'
        var ids = Dependency.find(q).map(function(doc){
            return doc[depFile]
        })
        var ids = File.find({_id: {$in: ids}}, {sort: {dateModified: -1}, skip: skip, limit: limit}).map(function(doc){
            return doc._id
        })
        return ids
    },
    getComponentsIds: function(fileId){
        check(fileId, String)
        console.orolog('getComponentsIds fileId', fileId)
        var ids = file_components_ids(fileId)
        return ids
    },
    getRelatedFiles: function(fileId){
        check(fileId, String)
        var doc = File.findOne({_id: fileId});
        var fileIds = [fileId].concat(doc.structuralpath).concat(doc.dependencypath)
        console.orolog('getRelatedFiles fileId', fileId, fileIds)
        return fileIds
    },
    getUsers: function(fileId){
        check(fileId, String)
        var doc = File.findOne({_id: fileId});
        var userIds = [doc.creatorId].concat(doc.permissions.view).concat(doc.permissions.edit)
        //remnant...selected shouldn't be null
        //console.orolog('getUsers fileId', fileId, doc.selected)
        if(doc.selected)
            userIds = userIds.concat(doc.selected);
        return userIds
    },
    count: function(collection, query){
        check(collection, String);
        if(query)
            check(query, Object)
        else
            query = {};

        return Collections[collection].find(query).count();
    }
});
