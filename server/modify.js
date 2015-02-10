Meteor.methods({
    update_collection: function(collection, ids, upd){
        check(collection, String);
        check(ids, [String]);
        check(upd, Object);
        console.log(upd);
        Collections[collection].update({_id: {$in: ids}}, {$set: upd}, {multi: true}, function(error, result){
        });

    },
    insert_document: function(collection, upd){
        check(collection, String);
        check(upd, Object);
        console.log(upd);
        return Collections[collection].insert(upd);
    },
    update_document: function(collection, id, upd){
        check(collection, String);
        check(id, String);
        check(upd, Object);
        console.log(JSON.stringify([{_id: id}, {$set: upd}]));
        return Collections[collection].update({_id: id}, {$set: upd});
    },
    remove_document: function(collection, id){
        check(collection, String);
        check(id, String);
        Collections[collection].remove({_id: id});
    }
});