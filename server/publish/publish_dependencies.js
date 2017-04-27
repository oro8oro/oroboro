Meteor.publish('dependencypublish', function(id){
    check(id, String);
    return Dependency.find({_id: id});
})

Meteor.publish('dependenciespublish', function(ids){
    //console.orolog(ids)
    check(ids, [String])
    //console.orolog('dependenciespublish: '+JSON.stringify(ids));
    return Dependency.find({_id: {$in: ids}});
})

Meteor.publish('filedependency', function(fileid){
    check(id, String);
    return Dependency.find({_id: id});
})

Meteor.publish('dependencies', function(){
    //if (Roles.userIsInRole(this.userId, 'admin')) {
        return Dependency.find();
    //}
});
