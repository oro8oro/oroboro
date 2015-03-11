Meteor.methods({
    update_collection: function(collection, ids, upd){
        check(collection, String);
        check(ids, [String]);
        check(upd, Object);
        console.log(upd);
        return Collections[collection].update({_id: {$in: ids}}, {$set: upd}, {multi: true}, {filter: false, validate: false}, function(error, result){
        });

    },
    insert_document: function(collection, upd){
        check(collection, String);
        check(upd, Object);
        console.log(upd);
        return Collections[collection].insert(upd, {filter: false, validate: false}, function(error, result){
            if(error) console.log(error);
            if(result) console.log(result);
        });
    },
    update_document: function(collection, id, upd){
        check(collection, String);
        check(id, String);
        check(upd, Object);
        console.log(upd);
        return Collections[collection].update({_id: id}, {$set: upd}, {filter: false, validate: false}, function(error, result){
        });
    },
    unset_document: function(collection, id, properties){
        check(collection, String);
        check(id, String);
        check(properties, Array);
        console.log(properties);
        var upd = {};
        for(var i in properties)
            upd[properties[i]] = "";
        return Collections[collection].update({_id: id}, {$unset: upd}, {filter: false, validate: false}, function(error, result){
        });
    },
    remove_document: function(collection, id, callb){
        check(collection, String);
        check(id, String);
        return Collections[collection].remove({_id: id});
    }
});