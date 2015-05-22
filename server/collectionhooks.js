//after item insert, if it has a locked attribute, it will update the parent group's locked attribute
Item.after.insert(function(userId, doc){
    console.log('after.insert');
    console.log('server: ' + Meteor.isServer)
    console.log(doc);
    console.log(this._id);

    var fileId = getElementPath(this._id);
    fileId = fileId[fileId.length-1];
    var iids = File.findOne({_id: fileId}).itemids;
    if(!iids)
        iids = [];
    iids.push(this._id);
    File.update({_id: fileId}, {$set: {itemids: iids}});
    if(doc.locked && doc.locked != 'null'){
        var gr = Group.findOne({_id: doc.locked});
        console.log(gr);
        if(gr){
            if(gr.locked && gr.locked != 'null')
                var locked = gr.locked.split(',');
            else
                var locked = [];
            locked.push(this._id);
            locked = locked.join(',');
            var upd = {locked: locked};
            if(gr.type == 'parametrizedGroup' && doc.parameters && doc.parameters.parametrizedGroup){
                upd.parameters = gr.parameters
                upd.parameters.params.elements[doc.parameters.parametrizedGroup] = doc._id;
            }
            console.log(upd);
            Group.update({_id: gr._id}, {$set: upd});
        }
    }
    console.log('/after.insert');
});
//gfkHDYEEX8ih7tnBJ
Item.before.remove(function(userId, doc){
    console.log('before remove');
    console.log('server: ' + Meteor.isServer)
    console.log(doc._id);
    var fileId = getElementPath(doc.groupId);
    fileId = fileId[fileId.length-1];
    var iids = File.findOne({_id: fileId}).itemids;
    iids.splice(iids.indexOf(doc._id),1);
    File.update({_id: fileId}, {$set: {itemids: iids}});
    console.log('/before remove');
});
Item.after.update(function(userId, doc, fieldNames, modifier, options){
    if(fieldNames.length > 1 || fieldNames.indexOf('selected') == -1){
        var fileId = getElementPath(doc._id);
        fileId = fileId[fileId.length-1];
        File.update({_id: fileId}, {$set: {dateModified: new Date()}});
    }
})

Group.after.insert(function(userId, doc){
    console.log('group after.insert');
    console.log('server: ' + Meteor.isServer)
    console.log(this._id);

    if(doc.type == 'parametrizedGroup' && doc.parameters && doc.parameters.parametrizedGroup){
            console.log('here')
            var upd = doc.parameters
            upd.params.elements[doc.parameters.parametrizedGroup] = doc._id;
            console.log(upd);
            Meteor.call('update_document', 'Group', doc._id, upd);
    }

    var fileId = getElementPath(this._id);
    fileId = fileId[fileId.length-1];
    console.log(fileId);
    var iids = File.findOne({_id: fileId}).groupids;
    console.log(iids);
    if(!iids)
        iids = [];
    iids.push(this._id);
    console.log(iids);
    File.update({_id: fileId}, {$set: {groupids: iids}});
    console.log('/group after.insert');
});

Group.before.remove(function(userId, doc){
    console.log('group before remove');
    console.log('server: ' + Meteor.isServer)
    console.log(doc._id);
    if(doc.groupId)
        var fileId = getElementPath(doc.groupId);
    else
        var fileId = getElementPath(doc.fileId);
    console.log(fileId);
    fileId = fileId[fileId.length-1];
    console.log(fileId);
    var iids = File.findOne({_id: fileId}).groupids;
    iids.splice(iids.indexOf(doc._id),1);
    File.update({_id: fileId}, {$set: {groupids: iids}});
    console.log('/group before remove');
});
Dependency.after.insert(function(userId, doc){
    console.log('dependency after insert');
    if(doc.type == 1){
        console.log('structural dep');
        var parentFile = File.findOne({_id: doc.fileId2});
        var noofchildren = parentFile.noofchildren +1;
        File.update({_id: doc.fileId2}, {$set: {noofchildren: noofchildren}});
        var spath = getFilePath(doc.fileId1, 1);
        File.update({_id: doc.fileId1}, {$set: {structuralpath: spath}});
        if(parentFile.fileType == 'image/svg+xml' && parentFile.parameters && parentFile.parameters.type == 'template'){
            console.log('its a template');
            //add parentFile id to child's templatepath parameter
            var parameters = File.findOne({_id: doc.fileId1}).parameters;
            if(!parameters)
                parameters = {}
            if(parentFile.parameters && parentFile.parameters.templatepath)
                parameters.templatepath = parentFile.parameters.templatepath.concat([doc.fileId2]);
            else
                parameters.templatepath = [doc.fileId2]
            console.log("parameters: "+JSON.stringify(parameters.templatepath))
            Meteor.call('update_document', 'File', doc.fileId1, {parameters: parameters})
        }
    }
    else if(doc.type == 3){
        var dpath = getDependencies(doc.fileId1, 3);
        File.update({_id: doc.fileId1}, {$set: {dependencypath: dpath}});
    }
});

Dependency.before.update(function(userId, doc, fieldNames, modifier, options){
    console.log(fieldNames);
    console.log(modifier);
    console.log(options);

    var old = Dependency.findOne({_id: doc._id})
    if(doc.type == 1 || old.type == 1){

        if(old.fileId1 != doc.fileId1 && old.type == 1){
            var oldkid = File.findOne({_id: old.fileId1});
            if(oldkid.parameters && oldkid.parameters.templatepath){
                delete oldkid.parameters.templatepath
                Meteor.call('update_document', 'File', old.fileId1, {parameters: oldkid.parameters});
            }
        }
        if((old.fileId1 != doc.fileId1 || old.fileId2 != doc.fileId2) && doc.type == 1){
            var newparent = File.findOne({_id: doc.fileId2});
            if(newparent.parameters && ((newparent.parameters.type && newparent.parameters.type == 'template') || (newparent.parameters.templatepath))){
                var newkid = File.findOne({_id: doc.fileId1});
                if(!newkid.parameters)
                    newkid.parameters = {}
                if(newparent.parameters.templatepath)
                    newkid.parameters.templatepath = newparent.parameters.templatepath.concat([doc.fileId2])
                else
                    newkid.parameters.templatepath = [doc.fileId2]
            }
        }
    }
})

Dependency.before.remove(function(userId, old){
    if(old.type == 1){
        var spath = getFilePath(old.fileId1, 1);
        var upd1 = {structuralpath: spath}

        var kidfile = File.findOne({_id: old.fileId1})
        if(kidfile.parameters && kidfile.parameters.templatepath){
            delete kidfile.parameters.templatepath
            upd1.parameters = kidfile.parameters
        }
        Meteor.call('update_document', 'File', old.fileId1, upd1);
        var kids = File.findOne({_id: old.fileId2}).noofchildren - 1;
        Meteor.call('update_document', 'File', old.fileId2, {noofchildren: kids});
    }
    else if(old.type == 3){
        var dpath = getDependencies(old.fileId1, 3);
        Meteor.call('update_document', 'File', old.fileId1, {dependencypath: dpath});
    }
});

File.before.update(function(userId, doc, fieldNames, modifier, options){
    modifier.$set.dateModified = Date.now();
})