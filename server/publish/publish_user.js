Meteor.publish('userpublish', function(id){
    check(id, String);
    return Meteor.users.find({_id: id});
})

Meteor.publish('users', function(){
    //if (Roles.userIsInRole(this.userId, 'admin')) {
        return Meteor.users.find();
   // }
});