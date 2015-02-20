Schemas.Dependency = new SimpleSchema({
    fileId1: {
        type: String,
        label: "File Id 1",
        max: 200,
        autoform: {
          type: "select",
          options: function () {
            var list = File.find({}).fetch();
            var groups = Group.find().fetch();
            var option = [];
            for(u = 0; u < list.length ; u++){
                option.push({label: list[u].uuid, value: list[u]._id});
            }
            for(u = 0; u < groups.length ; u++){
                option.push({label: groups[u].uuid, value: groups[u]._id});
            }
            return option;
          }
        }
    },
    collection1:{
        type: String,
        label: "Collection1",
        optional: true,
        autoform: {
            type: "select",
            options: function(){
                return Object.keys(Collections);
            }
        }
    },
    fileId2: {
        type: String,
        label: "Parent File",
        max: 200,
        autoform: {
          type: "select",
          options: function () {
            var list = File.find({}).fetch();
            var groups = Group.find().fetch();
            var option = [];
            for(u = 0; u < list.length ; u++){
                option.push({label: list[u].uuid, value: list[u]._id});
            }
            for(u = 0; u < groups.length ; u++){
                option.push({label: groups[u].uuid, value: groups[u]._id});
            }
            return option;
          }
        }
    },
    collection2:{
        type: String,
        label: "Collection2",
        optional: true,
        autoform: {
            type: "select",
            options: function(){
                return Object.keys(Collections);
            }
        }
    },
    type: {
        type: Number,
        label: "Type",
        max: 200,
        autoform: {
            type: "select",
            options: function () {
                return [
                    {label:"structural", value: 1},
                    {label:"link to descendants", value: 2},
                    {label:"dependency", value: 3},
                    {label:"needed by", value: 4},
                    {label:"simple link", value: 5},
                    {label:"fork", value: 6},
                ];
            }
        }
    }
});

Dependency.attachSchema(Schemas.Dependency);