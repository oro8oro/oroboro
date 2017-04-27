Meteor.publish('userpublish', function(id){
    check(id, String);
    return Meteor.users.find({_id: id});
})

Meteor.publish('userspublish', function(ids){
    //console.orolog(ids)
    check(ids, [String])
    //console.orolog('userspublish: '+JSON.stringify(ids));
    return Meteor.users.find({_id: {$in: ids}});
})

Meteor.publish('users', function(){
    //if (Roles.userIsInRole(this.userId, 'admin')) {
        return Meteor.users.find();
   // }
});
