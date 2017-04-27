
Meteor.publish('itempublish', function(id){
    check(id, String);
    return Item.find({_id: id});
})

Meteor.publish('itemspublish', function(ids){
    check(ids, [String])
    //console.orolog('itemspublish: '+JSON.stringify(ids));
    return Item.find({_id: {$in: ids}})
})

Meteor.publish('items', function(){
    //if (Roles.userIsInRole(this.userId, 'admin')) {
        return Item.find();
    //}
});
