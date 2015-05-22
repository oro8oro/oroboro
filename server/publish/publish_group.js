Meteor.publish('grouppublish', function(id){
    check(id, String);
    return Group.find({_id: id});
})

Meteor.publish('groups', function(){
    //if (Roles.userIsInRole(this.userId, 'admin')) {
        return Group.find();
    //}
});

Meteor.publish('group', function(groupId){
    check(groupId, String);
    //get group and items ids
    var kidsIds = recursive_group_ids(groupId);
    var path = getElementPath(groupId);
    var doc = File.findOne({_id: path[path.length-1]});
    var userIds = [doc.creatorId].concat(doc.permissions.view).concat(doc.permissions.edit).concat(doc.selected);
    var groupIds = kidsIds.groups.concat(groupId).concat(path.slice(0,path.length-1));

    return [ 
        Group.find({_id: {$in: groupIds}}),
        Item.find({_id: {$in: kidsIds.items}}),
        Meteor.users.find({_id: {$in: userIds}}),
        File.find({_id: doc._id})
        ];
});

/*
Meteor.publish('tabular_groups', function (tableName, ids, fields) {
    check(tableName, String);
    check(ids, [String]);
    check(fields, Match.Optional(Object));
    Publish.relations(this, Group.find({_id: {$in: ids}}, {fields: fields}), function (id, doc) {
        doc.file = this.changeParentDoc(File.find({_id: doc.fileId}), function (id, doc){
                if(doc.uuid)
                  return doc.uuid;
                else
                  return doc._id
            }, 'file');
        doc.group2 = this.changeParentDoc(Group.find({_id: doc.groupId}), function (id, doc){
                if(doc.uuid)
                  return doc.uuid;
                else
                  return doc._id;
            }, 'group2');
      });
      return this.ready();
});
*/