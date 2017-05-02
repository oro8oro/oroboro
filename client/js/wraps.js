global_oro_variables.wraps = {
  update_collection: function(collection, ids, upd, callb) {
    var fileId = Session.get('fileId');
    Meteor.call('update_collection', collection, ids, upd, function(err, res) {
      if(callb) callb(err, res);
      Meteor.call('unset_document', 'File', fileId, ['svg']);
    });
  },
  update_document: function(collection, id, upd, callb) {
    var fileId = Session.get('fileId');
    Meteor.call('update_document', collection, id, upd, function(err, res) {
      if(callb) callb(err, res);
      Meteor.call('unset_document', 'File', fileId, ['svg']);
    });
  }
}
