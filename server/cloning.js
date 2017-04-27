Meteor.methods({
  cloneFile: function(id) {
    return cloneFile(id);
  },
  cloneGroup: function(id, fileId, parent) {
    return cloneGroup(id, fileId, parent)
  },
  cloneGroupFile: function(id, fileId) {

  },
  cloneItem: function(id, groupId) {
    return cloneItem(id, groupId);
  }
})
cloneFile = function cloneFile(id){
    console.log('cloneFilestart');
    var f = File.findOne({_id: id});
    var no = File.find({uuid: f.uuid}).count();
    var deps = Dependency.find({fileId1: id}).fetch();
    var groups = Group.find({fileId: id}).fetch();
    f.original = f._id;
    delete f._id;
    f.creatorId = this.userId || Meteor.userId();
    f.dateModified = new Date();
    f.permissions.view = [];
    f.permissions.edit = [this.userId || Meteor.userId()];
    f.uuid = f.uuid+(no+1);
    f.groupids = [];
    f.itemids = [];
    f.selected = [];
    f.noofchildren = 0;

    var fileId = File.insert(f);
    console.log('cloneFile', fileId);
    if(!fileId) {
      throw new Meteor.Error('File not cloned', id);
    }

    for(d in deps){
      deps[d].fileId1 = fileId;
      delete deps[d]._id
      Dependency.insert(deps[d]);
    }
    for(g in groups) {
      Meteor.call('cloneGroup', groups[g], fileId, 'fileId');
    }
    return fileId;
}

cloneItem = function cloneItem(it, groupId){
    console.log('cloneItem');
    if(typeof it === 'string')
        it = Item.findOne({_id: it});
    it.original = it._id;
    delete it._id;
    it.groupId = groupId;
    if(it.locked && it.locked != 'null') {
      it.locked = groupId;
    }
    it.selected = 'null';
    if(!it.locked && it.parameters && it.parameters.parametrizedGroup)
        delete it.parameters.parametrizedGroup
    console.log('/cloneItem');
    return Item.insert(it);
}

cloneGroup = function cloneGroup(gr, parentId, parent){
    console.log('cloneGroup');
    if(typeof gr === 'string')
        gr = Group.findOne({_id: gr});
    var no = Group.find({uuid: gr.uuid}).count();
    no++;
    var deps = Dependency.find({fileId1: gr._id, type: {$in:[2,3,5]} }).fetch();
    var groups = Group.find({groupId: gr._id}).fetch();
    var items = Item.find({groupId: gr._id}).fetch();
    var groupId = gr._id;
    gr.original = gr._id;
    delete gr._id;
    gr[parent] = parentId;
    gr.uuid = gr.uuid+String(no);
    gr.locked = 'null'
    gr.selected = 'null'

    var newid = Group.insert(gr);
    if(!newid)
      throw new Meteor.Error('Group not cloned', gr._id);

    for(d in deps){
        deps[d].fileId1 = newid;
        delete deps[d]._id;
        Dependency.insert(deps[d]);
    }

    //console.log(JSON.stringify(items));
    for(g in groups)
        cloneGroup(groups[g], newid, 'groupId');
    for(i in items) {
        cloneItem(items[i], newid);
    }
    console.log('/cloneGroup');

    return newid;

}
