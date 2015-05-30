Meteor.publish('userpublish', function(id){
    check(id, String);
    return Meteor.users.find({_id: id});
})

Meteor.publish('userspublish', function(ids){
    //console.log(ids)
    check(ids, [String])
    //console.log('userspublish: '+JSON.stringify(ids));
    return Meteor.users.find({_id: {$in: ids}});
})

Meteor.publish('users', function(){
    //if (Roles.userIsInRole(this.userId, 'admin')) {
        return Meteor.users.find();
   // }
});