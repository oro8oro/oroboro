maxOptions = 50;

getDoc = function(){
    var upd = null;
    if($('#selectfile1').val() && $('#selectfile2').val() && $('#selecttype').val()){
        var upd = { fileId1: $('#selectfile1').val(), fileId2: $('#selectfile2').val(), type: Number($('#selecttype').val())}
        if($('#selectcol1').val())
            upd.collection1 = $('#selectcol1').val();
        if($('#selectcol2').val())
            upd.collection2 = $('#selectcol2').val();
        console.log(upd);
    }
    return upd;
}

emptyFields = function(){
    $('#selectfile2').val('');
    $('#file2').val('');
    $('#selecttype').val('');
    noD = 0;
    Session.set('selectfile1', '');
    Session.set('selectfile2', '');
    //$('#viewFile1').attr('disabled', "true");
    //$('#viewFile2').attr('disabled', "true");
}


insertDep = function(){
    var upd = getDoc();
    if(upd){
        Meteor.call('insert_document', 'Dependency', upd, function(err, res){
            if(err) console.log(err); 
            if(res) console.log(res);
        });
        /*
        if(upd.type == 1){
            var spath = getFilePath(upd.fileId1, 1);
            Meteor.call('update_document', 'File', upd.fileId1, {structuralpath: spath})
            var noofchildren = File.findOne({_id: upd.fileId2}).noofchildren + 1;
            Meteor.call('update_document', 'File', upd.fileId2, {noofchildren: noofchildren})
        }
        else if(upd.type == 3){
            var dpath = getDependencies(upd.fileId1, 3);
            Meteor.call('update_document', 'File', upd.fileId1, {dependencypath: dpath});
        }*/
        //$('#changeddeplabel').css('display', 'none')
        emptyFields()
    }
}

updateDep = function(){
    var upd = getDoc();
    if(upd){
        var old = Dependency.findOne({_id: Session.get('currentDependency')});
        Meteor.call('update_document', 'Dependency', Session.get('currentDependency'), upd, function(err, res){
            if(err) console.log(err); 
            if(res) console.log(res);
        });
        if(upd.type == 1 || upd.type == 3){
            var spath = getFilePath(upd.fileId1, 1);
            var dpath = getDependencies(upd.fileId1, 3);
            Meteor.call('update_document', 'File', upd.fileId1, {structuralpath: spath, dependencypath: dpath})
        }
        if(old.fileId1 != upd.fileId1){
            var spath = getFilePath(old.fileId1, 1);
            var dpath = getDependencies(old.fileId1, 3);
            Meteor.call('update_document', 'File', old.fileId1, {dependencypath: dpath, structuralpath: spath});
        }
        if(old.fileId2 != upd.fileId2){
            var kidsnew = File.findOne({_id: upd.fileId2}).noofchildren + 1;
            var kidsold = File.findOne({_id: old.fileId2}).noofchildren - 1;
            Meteor.call('update_document', 'File', upd.fileId2, {noofchildren: kidsnew});
            Meteor.call('update_document', 'File', old.fileId2, {noofchildren: kidsold});
        }

        //$('#changeddeplabel').css('display', 'none')
        emptyFields()
    }
}

deleteDep = function(){
    var d = Session.get('currentDependency')
    console.log(d);
    //var old = Dependency.findOne({_id: d})
    Meteor.call('remove_document', 'Dependency', d);
    /*
    if(old.type == 1){
        var spath = getFilePath(old.fileId1, 1);
        Meteor.call('update_document', 'File', old.fileId1, {structuralpath: spath});
        var kids = File.findOne({_id: old.fileId2}).noofchildren - 1;
        Meteor.call('update_document', 'File', old.fileId2, {noofchildren: kids});
    }
    else if(upd.type == 3){
        var dpath = getDependencies(old.fileId1, 3);
        Meteor.call('update_document', 'File', old.fileId1, {dependencypath: dpath});
    }*/
}

getSearch = function(val, id, type){
    if(typeof type === 'undefined')
        type = {};
    var f = Meteor.call('searchCollection', 'File', ['title', 'uuid', '_id'], val, 'i', type, function(err, res){
        if(err)
            console.log(err);
        if(res){
            Session.set('searchResultNo_'+id, res.length);
            var last = false;
            if(res.length > maxOptions){
                res = res.slice(0, maxOptions);
                last = true;
            }
            var f = res.map(function(doc){
                var name = ((doc.title) ? doc.title: '') + ' / ' + ((doc.uuid) ? doc.uuid: '') + ' / ' + ((doc._id) ? doc._id: '');
                return {id: doc._id, title: name};
            });
            if(last)
                f.push({title: '...'});
            if(f)
                Session.set('searchResult_'+id, f);
        }
    });
}
noD = 0;
setDep = function(no){
    console.log(no);
    Session.set('selectfile'+no, $('#selectfile'+no).val());
    if(noD == 0 || noD == no){
        console.log('set currentDependency');
        noD = no;
        console.log(no);
        console.log($('#selectfile'+no).val());
        var q = {};
        q['fileId'+no] = $('#selectfile'+no).val();
        if(Number(no) == 1)
            var no2 = 2
        else
            no2 = 1;
        console.log(q);
        var f = Dependency.find(q).map(function(res){
            var doc = File.findOne({_id: res['fileId'+no2]});
            var name = ((doc.title) ? doc.title: '') + ' / ' + ((doc.uuid) ? doc.uuid: '') + ' / ' + ((doc._id) ? doc._id: '');
            return {id: doc._id, title: name};
        });
        if(f){
            Session.set('searchResult_'+'file'+no2, f);
            Session.set('searchResultNo_'+'file'+no2, f.length);
            var dep = {};
            dep['fileId'+no] = $('#selectfile'+no).val();
            console.log(dep);
            var d = Dependency.findOne(dep);
            console.log(d);
            if(d){
                Session.set('currentDependency', d._id);
                //$('#currentdep').val(JSON.stringify(d));
                $('#selecttype').val(d.type);
            }
            else
                Session.set('currentDependency', '');       
            $('#file'+no2).val('');
        }
    }
    else{
        //Session.set('currentDependency', '');
        //$('#changeddeplabel').css('display', '').val(getDoc());
    }
}

setType = function(){
    Session.set('filetype1', $('#selectfiletype1').val());
    Session.set('filetype2', $('#selectfiletype2').val());
    if($('#selectfiletype1').val() == "image/svg+xml")
        $('#editSVG1').css('display','');
    else
        $('#editSVG1').css('display','none');
    if($('#selectfiletype2').val() == "image/svg+xml")
        $('#editSVG2').css('display','');
    else
        $('#editSVG2').css('display','none');
}

saveScript = function(){
    var upd = {script: ace.edit("aceEditor").getSession().getValue()}
    console.log(upd);
    var extant = Session.get('selectfile1')
    console.log(extant)
    if(extant != '')
        Meteor.call('update_document', 'File', extant, upd);
    else{
        upd.fileType = $('#selectfiletype1').val();
        upd.title = $('#file1').val();
        upd.uuid = upd.title;
        upd.permissions = {view: [], edit: [Meteor.userId()]}
        upd.creatorId = Meteor.userId();
        console.log(upd);
        Meteor.call('insert_document', 'File', upd, function(err,res){
            if(err) console.log(err);
            if(res) console.log(res);
        });
    }
}

deleteScript = function(){
    var extant = Session.get('selectfile1')
    console.log(extant)
    if(extant && extant != ''){
        var deps = Dependency.find({$or: [{fileId1: extant}, {fileId2: extant}]}).fetch();
        for(var i = 0; i < deps.length; i++)
            Meteor.call('remove_document', "Dependency", deps[i]._id)
        Meteor.call('remove_document', 'File', extant);
    }
}

Template.addDeps.rendered = function(){
    Session.set('filetype1', $('#selectfiletype1').val());
    Session.set('filetype2', $('#selectfiletype2').val());

    this.autorun(function(){
        var val = Session.get('file1');
        if(!val)
            val = '';
        //if(val && val.length > 2){
            getSearch(val,'file1', {fileType: Session.get('filetype1')});
        //}
    });
    this.autorun(function(){
        var val = Session.get('file2');
        if(!val)
            val = '';
        //if(val && val.length > 2){
            getSearch(val,'file2', {fileType: Session.get('filetype2')});
        //}
    });

    this.autorun(function(){
        var val = Session.get('selectfile1');
        console.log('autorun script ' + val);
        if(val && val != ''){
            console.log(val);
            console.log(File.findOne({_id: val}));
            ace.edit("aceEditor").getSession().setValue(File.findOne({_id: val}).script)
        }
    });
}

Template.addDeps.events({
    'keydown, keyup, keypress #file1': function(e){
        Session.set('file1', $('#file1').val());
        if(e.keyCode == 13){
            setDep(1);
        }
    },
    'keydown, keyup, keypress #file2': function(e){
        console.log('2!!!!!');
        Session.set('file2', $('#file2').val());
        if(e.keyCode == 13){
            console.log('--------2')
            setDep(2);
        }
    }
});

Template.addDeps.helpers({
    options1: function(){
        var res1 = Session.get('searchResult_'+'file1');
        if(res1 && res1.length > 0)
            Session.set('selectfile1', res1[0].id);
        else
            Session.set('selectfile1', '');
        return res1;
    },
    options2: function(){
        var res2 = Session.get('searchResult_'+'file2');
        if(res2 && res2.length > 0)
            Session.set('selectfile2', res2[0].id);
        else
            Session.set('selectfile2', '');
        return res2;
    },
    options11: function(){
        return Object.keys(Collections);
    },
    options22: function(){
        return Object.keys(Collections);
    },
    optionst: function(){
        return Schemas.Dependency._schema.type.allowedValues
    },
    optionstype1: function(){
        return Schemas.File._schema.fileType.allowedValues
    },
    optionstype2: function(){
        return Schemas.File._schema.fileType.allowedValues
    },
    selectedfiles1: function(){
        return Session.get('searchResultNo_'+'file1');
    },
    selectedfiles2: function(){
        return Session.get('searchResultNo_'+'file2');
    },
    totalfiles: function(){
        return File.find().count();
    },
    fileId1: function(){
        return Session.get('selectfile1');
    },
    fileId2: function(){
        return Session.get('selectfile2');
    }
})
