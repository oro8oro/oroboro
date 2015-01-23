
Meteor.publish('groups', function(){
    //if (Roles.userIsInRole(this.userId, 'admin')) {
        return Group.find();
    //}
});


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