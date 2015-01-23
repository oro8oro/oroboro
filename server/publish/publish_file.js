Meteor.publish('files', function(){
    //if (Roles.userIsInRole(this.userId, 'admin')) {
        return File.find();
    //}
});

Meteor.publish('files_by_id', function(id){
    //if (Roles.userIsInRole(this.userId, 'admin')) {
        return File.find({_id:id});
    //}
});

Meteor.publish('tabular_files', function (tableName, ids, fields) {
    check(tableName, String);
    check(ids, [String]);
    check(fields, Match.Optional(Object));
    Publish.relations(this, File.find({_id: {$in: ids}}, {fields: fields}), function (id, doc) {  
          doc.fileId2 = this.changeParentDoc(Dependency.find({fileId1: doc._id},{fileId2:1, _id: 0}), function (id, doc){   
                return doc.fileId2;
            }, 'fileId2');
          doc.imagePath = this.changeParentDoc(Images.find({_id: doc.image}), function (id, doc){
                var key = doc.copies.images.key.replace(/-/g,"/");
                return {name: doc.original.name, src: "cfs/files/"+key};
        }, 'imagePath');
          doc.creator = this.changeParentDoc(Meteor.users.find({_id: doc.creatorId}), function (id, doc){
                return doc.profile.name;
            }, 'creator');
      });
      return this.ready();
});