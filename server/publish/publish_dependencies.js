
Meteor.publish('dependencies', function(){
    //if (Roles.userIsInRole(this.userId, 'admin')) {
        return Dependency.find();
    //}
});


Meteor.publish('tabular_dependencies', function (tableName, ids, fields) {
    check(tableName, String);
    check(ids, [String]);
    check(fields, Match.Optional(Object));
    Publish.relations(this, Dependency.find({_id: {$in: ids}}, {fields: fields}), function (id, doc) {
        doc.subject1 = this.changeParentDoc(File.find({_id: doc.fileId1}), function (id, doc){
                if(doc.uuid)
                  return doc.uuid;
                else
                  return doc._id
            }, 'subject1');
        if(doc.subject1 == undefined || !doc.subject1.length)
            doc.subject1 = this.changeParentDoc(Group.find({_id: doc.fileId1}), function (id, doc){
                  if(doc.uuid)
                    return doc.uuid;
                  else
                    return doc._id
              }, 'subject1');
        doc.subject2 = this.changeParentDoc(File.find({_id: doc.fileId2}), function (id, doc){
                if(doc.uuid)
                  return doc.uuid;
                else
                  return doc._id
            }, 'subject2');
        if(doc.subject2 == undefined || !doc.subject2.length)
            doc.subject2 = this.changeParentDoc(Group.find({_id: doc.fileId2}), function (id, doc){
                  if(doc.uuid)
                    return doc.uuid;
                  else
                    return doc._id
              }, 'subject2');
      });
      return this.ready();
});
/*
Meteor.publish('dependencies', function(id, start, dim){
    check(id, String);
    check(start, Number);
    check(dim, Number);

    return Dependency.find({fileId2: id}).skip(start-1).limit(dim).fetch();
});*/