Meteor.publishComposite('fileParents', function(fileId, options) {
  check(fileId, String);
  check(options, Match.Optional(Object));

  options = options || {};

  return {
    find: function() {
      return File.find({_id: fileId});
    },
    children: [
      {
        find: function(file) {
          return File.find({_id: {$in: file.structuralpath}});
        }
      }
    ]
  }
});

Meteor.publishComposite('fileKids', function(fileId, options) {
  console.orolog('publish fileKids', fileId, options);
  check(fileId, String);
  check(options, Match.Optional(Object));

  options = options || {};
  options.sort = {dateModified: -1};

  return {
    find: function() {
      return Dependency.find({fileId2: fileId, type: 1}, options);
    },
    children: [
      {
        find: function(dep) {
          return File.find({_id: dep.fileId1});
        }
      }
    ]
  }
});

Meteor.publishComposite('fileRelated', function(fileId, options) {
  check(fileId, String);
  check(options, Match.Optional(Object));

  options = options || {};

  return {
    find: function() {
      return Dependency.find({fileId2: fileId, type: {$ne: 1} }, options);
    },
    children: [
      {
        find: function(dep) {
          return File.find({_id: dep.fileId1});
        }
      }
    ]
  }
});

Meteor.publish('filepublish', function(id){
    check(id, String);
    return File.find({_id: id});
})

Meteor.publish('filespublish', function(ids){
    check(ids, [String])
    //console.orolog('filespublish: '+JSON.stringify(ids));
    return File.find({_id: {$in: ids}})
})

Meteor.publish('relatedfiles', function(id){
    check(id, String);
    return File.find({_id: id});
})

Meteor.publish('files', function(){
    //if (Roles.userIsInRole(this.userId, 'admin')) {
        return File.find();
    //}
});

Meteor.publish('file', function(fileId){
    check(fileId, String);
    var f = File.findOne({_id: fileId});
    var userIds = [f.creatorId].concat(f.permissions.view).concat(f.permissions.edit).concat(f.selected);
    var fileIds = [fileId].concat(f.structuralpath).concat(f.dependencypath)
    //if(f.parameters && f.parameters.templatepath)
    //    fileIds = fileIds.concat(f.parameters.templatepath)
    var self = this;
    //console.orolog(self);

    var handle2 = File.find({_id: fileId}, {fields: {groupids: 1} }).observe({
        changed: function(newdoc, olddoc){
            console.orolog('publishhandle2groupids')
            var insert = diff(newdoc.groupids, olddoc.groupids);
            //console.orolog('insert:' + JSON.stringify(insert));
            if(insert != []){
                if(!self._documents.groupp)
                    self._documents.groupp = []
                for(var i = 0; i < insert.length; i++)
                    if(!self._documents.groupp[insert[i]] || self._documents.groupp[insert[i]] != true ){
                        var newgr = Group.findOne({_id: insert[i]});
                        if(newgr){
                            self.added('groupp', insert[i], newgr)
                            Group.find({_id: insert[i]}).observeChanges({
                                changed: function(id, fields){
                                    self.changed('groupp', id, fields);
                                }
                            })
                        }
                    }
            }
            var remove = diff(olddoc.groupids, newdoc.groupids)
            //console.orolog('remove:' + JSON.stringify(remove));
            if( remove != [])
                for(var i = 0; i < remove.length; i++)
                    if(self._documents.groupp[remove[i]])
                        self.removed('groupp', remove[i]);
        }
    });
    var handle3 = File.find({_id: fileId}, {fields: {itemids: 1} }).observe({
        changed: function(newdoc, olddoc){
            console.orolog('publishhandle3itemids')
            var insert = diff(newdoc.itemids, olddoc.itemids);
            console.orolog('insert:' + JSON.stringify(insert));
            console.orolog('sfsdsdsdfds: '+JSON.stringify(self._documents));
            console.orolog('sfsdsdsdfds: '+JSON.stringify(self._documents.item));
            if(insert != []){
                if(!self._documents.item)
                    self._documents.item = []
                for(var i = 0; i < insert.length; i++)
                    if(!self._documents.item[insert[i]] || self._documents.item[insert[i]] != true ){
                        var newit = Item.findOne({_id: insert[i]});
                        if(newit){
                            self.added('item', insert[i], newit)
                            Item.find({_id: insert[i]}).observeChanges({
                                changed: function(id, fields){
                                    self.changed('item', id, fields);
                                }
                            })
                        }
                    }
            }
            var remove = diff(olddoc.itemids, newdoc.itemids)
            //console.orolog('remove:' + JSON.stringify(remove));
            if( remove != [])
                for(var i = 0; i < remove.length; i++)
                    if(self._documents.item[remove[i]])
                        self.removed('item', remove[i]);
            self.ready();
        }
    });

    var handle3 = File.find({_id: fileId}, {fields: {selected: 1} }).observe({
        changed: function(newdoc, olddoc){
            console.orolog('publishhandleusers')
            console.orolog(newdoc)
            console.orolog(olddoc)
            var insert = diff(newdoc.selected, olddoc.selected);
            console.orolog('insert:' + JSON.stringify(insert));
            if(insert != []){
                if(!self._documents.users)
                    self._documents.users = []
                for(var i = 0; i < insert.length; i++)
                    if(!self._documents.users[insert[i]] || self._documents.users[insert[i]] != true ){
                        var newuser = Meteor.users.findOne({_id: insert[i]});
                        if(newuser){
                            self.added('users', insert[i], newuser)
                            Meteor.users.find({_id: insert[i]}).observeChanges({
                                changed: function(id, fields){
                                    self.changed('users', id, fields);
                                }
                            })
                        }
                    }
            }
            var remove = diff(olddoc.selected, newdoc.selected)
            //console.orolog('remove:' + JSON.stringify(remove));
            if( remove != [])
                for(var i = 0; i < remove.length; i++)
                    if(self._documents.users[remove[i]])
                        self.removed('users', remove[i]);
            self.ready();
        }
    })

    return [
        Group.find({_id: { $in: f.groupids } }),
        Item.find({$or: [
            {_id: { $in: f.itemids } },
            {groupId: fileId}
        ]}),
        Meteor.users.find({_id: { $in: userIds }}),
        File.find({_id: {$in: fileIds}}),
        Connector.find({$or: [
            {source: { $in: f.itemids}},
            {target: { $in: f.itemids}},
            ]})
    ]
});

Meteor.publish('userWork', function(type, skip, limit){
    check(skip, Number)
    check(limit, Number)

    return File.find({creatorId: this.userId, fileType: type}, {sort: {dateModified: -1}, skip: skip, limit: limit});
})

Meteor.publish('filebrowse', function(id, col){
    check(id, String);
    check(col, String);

    var self = this;
    //get group and items ids
    if(col == 'file'){

            var doc = File.findOne({_id: id});
            //users which have access
            var userIds = [doc.creatorId].concat(doc.permissions.view).concat(doc.permissions.edit).concat(doc.selected);
            //kids = children files that appear in browser content
            var kids = Dependency.find({fileId2: id}).map(function(doc){return doc.fileId1});
            //ids for all the first items and groups for each kid file
            var kidsIds = {items: [], groups: []}
            var deps = [];
            for(var i = 0; i < kids.length; i++){

                var d = Dependency.find({fileId2: kids[i], type: 1}).map(function(doc){
                    return doc._id;
                })
                if(d && d.length > 0)
                    deps = deps.concat(d);
                //first group, first item, for adding with addElement:
                /*
                var g = Group.findOne({fileId: kids[i], type: 'layer'},{sort: {ordering: 1}});
                if(g){
                    kidsIds.groups.push(g._id);
                    var elem = Group.findOne({groupId: g._id},{sort: {ordering: 1}});
                    if(elem)
                        kidsIds.groups.push(elem._id);
                    else{
                        var it = Item.findOne({groupId: g._id},{sort: {ordering: 1}});
                        if(it)
                            kidsIds.items.push(it._id);
                    }
                }*/
                //now, all groups, all items:
                var ids = file_components_ids(kids[i])
                kidsIds.groups = kidsIds.groups.concat(ids.groups)
                kidsIds.items = kidsIds.items.concat(ids.items)
            }
            var fileIds = [id].concat(doc.structuralpath).concat(doc.dependencypath).concat(kids)
    }
    else if(col == 'group')
        var kidsIds = recursive_group_elements(id);

    var handle1 = Dependency.find({fileId2: id}).observe({
        added: function(doc){
            self.added('file', doc._id, doc)
            File.find({_id: doc._id}).observeChanges({
                changed: function(id, fields){
                    self.changed('file', id, fields);
                },
                removed: function(id){
                    self.removed('file', id)
                }
            })
        }
    });

    return [
        Group.find({_id: {$in: kidsIds.groups}}),
        Item.find({_id: {$in: kidsIds.items}}),
        Meteor.users.find({_id: {$in: userIds}}),
        File.find({_id: {$in: fileIds}}),
        Dependency.find({$or: [{fileId2: id}, {_id: {$in: deps}}]})
        ];
});

Meteor.publish('filebrowsePage', function(id, col, start, dim){
    check(id, String);
    check(col, String);
    check(start, Number);
    check(dim, Number);

    var self = this;
    //get group and items ids
    if(col == 'file'){

            var doc = File.findOne({_id: id});
            //users which have access
            var userIds = [doc.creatorId].concat(doc.permissions.view).concat(doc.permissions.edit).concat(doc.selected);
            //kids = children files that appear in browser content
            var kids = Dependency.find({fileId2: id}, {skip: start-1, limit: dim}).map(function(doc){return doc.fileId1});
            //ids for all the first items and groups for each kid file
            var kidsIds = {items: [], groups: []}
            var deps = [];
            for(var i = 0; i < kids.length; i++){
                var d = Dependency.find({fileId2: kids[i], type: 1}).map(function(doc){
                    return doc._id;
                })
                if(d && d.length > 0)
                    deps = deps.concat(d);
                //now, all groups, all items:
                var ids = file_components_ids(kids[i])
                kidsIds.groups = kidsIds.groups.concat(ids.groups)
                kidsIds.items = kidsIds.items.concat(ids.items)
            }
            var fileIds = [id].concat(doc.structuralpath).concat(doc.dependencypath).concat(kids)
    }
    else if(col == 'group')
        var kidsIds = recursive_group_elements(id);

    var handle1 = Dependency.find({fileId2: id}).observe({
        added: function(doc){
            self.added('file', doc._id, doc)
            File.find({_id: doc._id}).observeChanges({
                changed: function(id, fields){
                    self.changed('file', id, fields);
                },
                removed: function(id){
                    self.removed('file', id)
                }
            })
        }
    });

    return [
        Group.find({_id: {$in: kidsIds.groups}}),
        Item.find({_id: {$in: kidsIds.items}}),
        Meteor.users.find({_id: {$in: userIds}}),
        File.find({_id: {$in: fileIds}}),
        Dependency.find({$or: [{fileId2: id}, {_id: {$in: deps}}]})
        ];
});

//[ 'MvzohMngm2xEJrXHC','G5KffWcT3XX2rjwxK','uf4CGrS8YCa9Kzkvu','oZnd7AiQbJyTbz4RK','8nmfkYxEkHPj96jJ7', 'MxkDTRj2vmosLp87D','tw2RpiiegLc3oTfMa', 'TA7ZkH5kcJphFgava', '8Xae36ehBgHN76QQv', '7ziKkSHtugsvvr26r', 'wW7Zg2TRHESnT3vCn', '3D5vD2tdydkcwbF2u','XnLgvN66uX2jGv5pi','EWmmmDfyu9tMXzcFN', 'WRMEbRSYytCMETMwq','2BcyTg7zuYbHwEu5G','iCWosqjNQ4tCpWvMK','HyaPgfJaRPyKcLGSL','rqfth2JWdFSs5JjcY','XDyiYBQbTHhMbMmnp','4CsLzXWkPzvkC6N8K','q4K34aEywfzr4c3YC','zK8sDBZk3SvTzzpgq', 'NXMA9ydpuoozkF82K', 'AP78x7bvsAPXStA76', 'miL5yhYd7AYsHgMiR', 'ujcY27RtKzcR4n95o', 'JuEEvYk7kobLtx7C4', 'GmHqYn7AmEgur5nXA' ]
Meteor.publish('svgEditorScripts', function(){
  var f = File.findOne({_id: "Yq9iqYhEma9z9mYrp"});
  var ids = ["Yq9iqYhEma9z9mYrp"].concat(f.dependencypath);
    return File.find({_id: {$in: ids}});
})

Meteor.publish('filemd', function(q){
    return File.find({$or: [
                {_id: q},
                {title: q},
                {uuid: q}
                ]});
})
