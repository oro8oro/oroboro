Meteor.publish('grouppublish', function(id){
    check(id, String);
    return Group.find({_id: id});
})

Meteor.publish('groupspublish', function(ids){
    check(ids, [String])
    //console.log('groupspublish: '+JSON.stringify(ids));
    return Group.find({_id: {$in: ids}})
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
