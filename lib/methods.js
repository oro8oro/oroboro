Meteor.methods({
    update_collection: function(collection, ids, upd){
        check(collection, String);
        check(ids, [String]);
        check(upd, Object);
        console.log(upd);
        console.log('server: ' + Meteor.isServer);
        return Collections[collection].update({_id: {$in: ids}}, {$set: upd}, {multi: true});
//{filter: false, validate: false}
    },
    insert_document: function(collection, upd){
        check(collection, String);
        check(upd, Object);
        console.log(upd);
        console.log('server: ' + Meteor.isServer);
        return Collections[collection].insert(upd);
    },
    update_document: function(collection, id, upd){
        check(collection, String);
        check(id, String);
        check(upd, Object);
        console.log(upd);
        console.log('server: ' + Meteor.isServer);
        console.log(Date.now())
        return Collections[collection].update({_id: id}, {$set: upd});
    },
    unset_document: function(collection, id, properties){
        check(collection, String);
        check(id, String);
        check(properties, Array);
        console.log(properties);
        console.log('server: ' + Meteor.isServer);
        var upd = {};
        for(var i in properties)
            upd[properties[i]] = "";
        return Collections[collection].update({_id: id}, {$unset: upd});
    },
    remove_document: function(collection, id){
        check(collection, String);
        check(id, String);
        console.log('server: ' + Meteor.isServer);
        console.log(id);
        return Collections[collection].remove({_id: id});
    },
    count_docs: function(collection, query){
        check(collection, String);
        if(query)
            check(query, Object)
        else
            query = {};

        return Collections[collection].find(query).count();
    }
});