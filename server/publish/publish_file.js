Meteor.publish('files', function(){
    //if (Roles.userIsInRole(this.userId, 'admin')) {
        return File.find();
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

/*
Meteor.publish('file', function(id){
    check(id, String);

    Publish.relations(this, File.find({_id: id}), function (id, doc) {  this.cursor(Dependency.find({fileId1: id})).publish();
        this.cursor(Group.find({fileId: id})).publish(function (id, doc) {
            this.cursor(Group.find({groupId: id})).publish(function (id, doc) {
                this.cursor(Item.find({groupId: id})).publish();
            });
            this.cursor(Dependency.find({fileId1: id})).publish(function(id, doc){
                this.cursor(Group.find({_id: doc.fileId2}))
            });
        });
          
      });
    return this.ready();
});
*/
